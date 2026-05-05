from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from flask_jwt_extended import get_jwt_identity
from datetime import datetime
from bson import ObjectId

from extensions import mongo
from middleware.auth import auth_required, admin_required, get_current_user
from utils.helpers import serialize

tasks_bp = Blueprint("tasks", __name__)

STATUSES = ["todo", "in_progress", "done"]


# ------------------ Schema ------------------
class TaskSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str(load_default="")
    assigned_to = fields.Str(allow_none=True, load_default=None)
    status = fields.Str(load_default="todo", validate=validate.OneOf(STATUSES))
    due_date = fields.Str(allow_none=True, load_default=None)
    project_id = fields.Str(required=True)


# ------------------ Helpers ------------------
def get_task_or_404(task_id):
    if not ObjectId.is_valid(task_id):
        return None
    return mongo.db.tasks.find_one({"_id": ObjectId(task_id)})


# ------------------ Routes ------------------

# ✅ LIST TASKS
@tasks_bp.route("/", methods=["GET"])
@auth_required
def list_tasks():
    user = get_current_user()

    status = request.args.get("status")
    project_id = request.args.get("project_id")
    search = request.args.get("search", "")
    overdue_only = request.args.get("overdue", "false").lower() == "true"

    query = {}

    if user["role"] != "admin":
        query["assigned_to"] = str(user["_id"])

    if status:
        query["status"] = status

    if project_id:
        query["project_id"] = project_id

    if search:
        query["title"] = {"$regex": search, "$options": "i"}

    tasks = list(mongo.db.tasks.find(query).sort("created_at", -1))

    # overdue filter (manual because Mongo query is messy here)
    if overdue_only:
        now = datetime.utcnow()
        tasks = [
            t for t in tasks
            if t.get("due_date") and t["due_date"] < now and t["status"] != "done"
        ]

    return jsonify({
        "tasks": [serialize(t) for t in tasks]
    })


# ✅ TASK STATS
@tasks_bp.route("/stats", methods=["GET"])
@auth_required
def task_stats():
    user = get_current_user()

    if user["role"] == "admin":
        tasks = list(mongo.db.tasks.find())
    else:
        tasks = list(mongo.db.tasks.find({"assigned_to": str(user["_id"])}))

    now = datetime.utcnow()

    total = len(tasks)
    done = sum(1 for t in tasks if t["status"] == "done")
    in_progress = sum(1 for t in tasks if t["status"] == "in_progress")
    todo = sum(1 for t in tasks if t["status"] == "todo")
    overdue = sum(
        1 for t in tasks
        if t.get("due_date") and t["due_date"] < now and t["status"] != "done"
    )

    return jsonify({
        "total": total,
        "done": done,
        "in_progress": in_progress,
        "todo": todo,
        "overdue": overdue,
    })


# ✅ GET SINGLE TASK
@tasks_bp.route("/<task_id>", methods=["GET"])
@auth_required
def get_task(task_id):
    task = get_task_or_404(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"task": serialize(task)})


# ✅ CREATE TASK
@tasks_bp.route("/", methods=["POST"])
@admin_required
def create_task():
    schema = TaskSchema()

    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    due_date = None
    if data.get("due_date"):
        try:
            due_date = datetime.fromisoformat(data["due_date"])
        except ValueError:
            return jsonify({"error": "Invalid due_date format"}), 422

    user = get_current_user()

    task = {
        "title": data["title"],
        "description": data["description"],
        "status": data["status"],
        "due_date": due_date,
        "project_id": data["project_id"],
        "assigned_to": data.get("assigned_to"),
        "created_by": str(user["_id"]),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = mongo.db.tasks.insert_one(task)
    task["_id"] = result.inserted_id

    return jsonify({"task": serialize(task)}), 201


# ✅ UPDATE TASK
@tasks_bp.route("/<task_id>", methods=["PUT"])
@auth_required
def update_task(task_id):
    task = get_task_or_404(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    user = get_current_user()

    # member restriction
    if user["role"] != "admin" and task.get("assigned_to") != str(user["_id"]):
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json()
    update_data = {}

    if user["role"] == "admin":
        if "title" in data:
            update_data["title"] = data["title"]
        if "description" in data:
            update_data["description"] = data["description"]
        if "assigned_to" in data:
            update_data["assigned_to"] = data["assigned_to"]
        if "due_date" in data:
            update_data["due_date"] = datetime.fromisoformat(data["due_date"])

    if "status" in data and data["status"] in STATUSES:
        update_data["status"] = data["status"]

    update_data["updated_at"] = datetime.utcnow()

    mongo.db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update_data}
    )

    updated = mongo.db.tasks.find_one({"_id": ObjectId(task_id)})

    return jsonify({"task": serialize(updated)})


# ✅ DELETE TASK
@tasks_bp.route("/<task_id>", methods=["DELETE"])
@admin_required
def delete_task(task_id):
    result = mongo.db.tasks.delete_one({"_id": ObjectId(task_id)})

    if result.deleted_count == 0:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({"message": "Task deleted"})