from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from extensions import mongo, jwt

load_dotenv()


def create_app():
    app = Flask(__name__)

    mongo_uri = os.getenv("MONGO_URI")

    if not mongo_uri:
        raise ValueError("❌ MONGO_URI is missing")

    app.config["MONGO_URI"] = mongo_uri
    app.config["JWT_SECRET_KEY"] = os.getenv(
        "JWT_SECRET_KEY",
        "super-secret"
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400

    mongo.init_app(app)
    jwt.init_app(app)

    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True
    )

    from routes.auth import auth_bp
    from routes.users import users_bp
    from routes.projects import projects_bp
    from routes.tasks import tasks_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(users_bp, url_prefix="/users")
    app.register_blueprint(projects_bp, url_prefix="/projects")
    app.register_blueprint(tasks_bp, url_prefix="/tasks")

    # ✅ Home route
    @app.route("/")
    def home():
        return {
            "message": "Team Task Manager API Running"
        }

    return app


# ✅ Run locally
if __name__ == "__main__":
    app = create_app()

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port
    )