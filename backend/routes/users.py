from flask import Blueprint, jsonify
from bson import ObjectId

from extensions import mongo
from middleware.auth import auth_required
from utils.helpers import serialize

users_bp = Blueprint("users", __name__)


# ✅ LIST USERS
@users_bp.route("/", methods=["GET"])
@auth_required
def list_users():
    users = mongo.db.users.find().sort("name", 1)

    return jsonify({
        "users": [serialize(u) for u in users]
    })


# ✅ GET SINGLE USER
@users_bp.route("/<user_id>", methods=["GET"])
@auth_required
def get_user(user_id):
    if not ObjectId.is_valid(user_id):
        return jsonify({"error": "Invalid user ID"}), 400

    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "user": serialize(user)
    })