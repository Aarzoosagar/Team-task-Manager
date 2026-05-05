from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from bson import ObjectId

from extensions import mongo


# ✅ Get current user
def get_current_user():
    user_id = get_jwt_identity()

    if not user_id or not ObjectId.is_valid(user_id):
        return None

    return mongo.db.users.find_one({"_id": ObjectId(user_id)})


# ✅ Auth required
def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            return jsonify({"error": "Authentication required"}), 401

        return f(*args, **kwargs)

    return decorated


# ✅ Admin required
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            return jsonify({"error": "Authentication required"}), 401

        user = get_current_user()

        if not user or user.get("role") != "admin":
            return jsonify({"error": "Admin privileges required"}), 403

        return f(*args, **kwargs)

    return decorated