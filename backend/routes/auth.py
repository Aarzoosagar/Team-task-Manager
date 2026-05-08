from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from marshmallow import Schema, fields, validate, ValidationError
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

from extensions import mongo
from middleware.auth import auth_required, get_current_user
from utils.helpers import serialize

auth_bp = Blueprint("auth", __name__)
# mongo.db.users


# ------------------ Schemas ------------------
class SignupSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    role = fields.Str(load_default="member", validate=validate.OneOf(["admin", "member"]))


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


# ------------------ Routes ------------------

# ✅ SIGNUP
@auth_bp.route("/signup", methods=["POST"])
def signup():
    schema = SignupSchema()

    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    # check existing user
    if mongo.db.users.find_one({"email": data["email"]}):
        return jsonify({"error": "Email already registered"}), 409

    user = {
        "name": data["name"],
        "email": data["email"],
        "password": generate_password_hash(data["password"]),
        "role": data["role"]
    }

    result = mongo.db.users.insert_one(user)

    token = create_access_token(identity=str(result.inserted_id))

    return jsonify({
        "token": token,
        "user": {
            "id": str(result.inserted_id),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 201


# ✅ LOGIN
@auth_bp.route("/login", methods=["POST"])
def login():
    schema = LoginSchema()

    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({"error": "Validation failed", "details": err.messages}), 422

    user = mongo.db.users.find_one({"email": data["email"]})

    if not user or not check_password_hash(user["password"], data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user["_id"]))

    return jsonify({
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200


# ✅ CURRENT USER
@auth_bp.route("/me", methods=["GET"])
@auth_required
def me():
    user = get_current_user()

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "user": serialize(user)
    }), 200