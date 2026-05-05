from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from extensions import mongo, jwt   # ✅ use extensions

load_dotenv()


def create_app():
    app = Flask(__name__)

    # ✅ MongoDB config
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")

    # ✅ JWT config
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400

    # Init extensions
    mongo.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    # Register routes
    from routes.auth import auth_bp
    from routes.users import users_bp
    from routes.projects import projects_bp
    from routes.tasks import tasks_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(users_bp, url_prefix="/users")
    app.register_blueprint(projects_bp, url_prefix="/projects")
    app.register_blueprint(tasks_bp, url_prefix="/tasks")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)