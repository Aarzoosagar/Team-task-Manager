from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from datetime import datetime

from extensions import mongo
from middleware.auth import auth_required, admin_required, get_current_user
from utils.helpers import serialize

projects_bp = Blueprint("projects", __name__)


# ------------------ Schema ------------------
class ProjectSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str(load_default="")


# ------------------ Helpers ------------------
def get_project_or_404(project_id):
    if not ObjectId.is_valid(project_id):
        return None
    return mongo.db.projects.find_one({"_id": ObjectId(project_id)})


# ------------------ Routes ------------------

# ✅ LIST PROJECTS
@projects_bp.route("/", methods=["GET"])
@auth_required
def list_projects():
    user = get_current_user()
    search = request.args.get("search", "")

    if user["role"] == "admin":
        query = {}
    else:
        memberships = mongo.db.project_members.find({"user_id": str(user["_id"])})
        project_ids = [ObjectId(m["project_id"]) for m in memberships]
        query = {"_id": {"$in": project_ids}}

    if search:
        query["title"] = {"$regex": search, "$options": "i"}

    projects = mongo.db.projects.find(query).sort("created_at", -1)

    return jsonify({
        "projects": [serialize(p) for p in projects]
    })


# ✅ GET SINGLE PROJECT
@projects_bp.route("/<project_id>", methods=["GET"])
@auth_required
def get_project(project_id):
    project = get_project_or_404(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    return jsonify({"project": serialize(project)})


# ✅ CREATE PROJECT
@projects_bp.route("/", methods=["POST"])
@admin_required
def create_project():
    schema = ProjectSchema()

    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    user = get_current_user()

    project = {
        "title": data["title"],
        "description": data["description"],
        "created_by": str(user["_id"]),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = mongo.db.projects.insert_one(project)

    # auto add creator as member
    mongo.db.project_members.insert_one({
        "project_id": str(result.inserted_id),
        "user_id": str(user["_id"])
    })

    project["_id"] = result.inserted_id

    return jsonify({"project": serialize(project)}), 201


# ✅ UPDATE PROJECT
@projects_bp.route("/<project_id>", methods=["PUT"])
@admin_required
def update_project(project_id):
    project = get_project_or_404(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    schema = ProjectSchema()

    try:
        data = schema.load(request.get_json(), partial=True)
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    update_data = {
        **data,
        "updated_at": datetime.utcnow()
    }

    mongo.db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": update_data}
    )

    updated = mongo.db.projects.find_one({"_id": ObjectId(project_id)})

    return jsonify({"project": serialize(updated)})


# ✅ DELETE PROJECT
@projects_bp.route("/<project_id>", methods=["DELETE"])
@admin_required
def delete_project(project_id):
    project = get_project_or_404(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    mongo.db.projects.delete_one({"_id": ObjectId(project_id)})

    # also delete related data
    mongo.db.project_members.delete_many({"project_id": project_id})
    mongo.db.tasks.delete_many({"project_id": project_id})

    return jsonify({"message": "Project deleted"}), 200


# ✅ ADD MEMBER
@projects_bp.route("/<project_id>/members", methods=["POST"])
@admin_required
def add_member(project_id):
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id required"}), 422

    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    existing = mongo.db.project_members.find_one({
        "project_id": project_id,
        "user_id": user_id
    })

    if existing:
        return jsonify({"error": "User already a member"}), 409

    mongo.db.project_members.insert_one({
        "project_id": project_id,
        "user_id": user_id
    })

    return jsonify({"message": "Member added"}), 201


# ✅ REMOVE MEMBER
@projects_bp.route("/<project_id>/members/<user_id>", methods=["DELETE"])
@admin_required
def remove_member(project_id, user_id):
    result = mongo.db.project_members.delete_one({
        "project_id": project_id,
        "user_id": user_id
    })

    if result.deleted_count == 0:
        return jsonify({"error": "Membership not found"}), 404

    return jsonify({"message": "Member removed"})