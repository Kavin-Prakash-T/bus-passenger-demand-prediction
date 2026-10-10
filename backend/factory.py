"""
Flask Application Factory module.
"""
import os
import sys
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

# Ensure backend directory is in sys.path
BASE_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_BACKEND_DIR not in sys.path:
    sys.path.insert(0, BASE_BACKEND_DIR)

from config import config_by_name, Config
from routes import register_routes
from services.model_service import model_service
from services.metrics_service import metrics_service


def create_app(config_setting=None) -> Flask:
    """
    Constructs and configures the Flask application.
    
    Args:
        config_setting: Config name ('development', 'production', 'testing') or Config class.
    """
    frontend_dir = os.path.join(os.path.dirname(BASE_BACKEND_DIR), "frontend")
    
    app = Flask(
        __name__,
        static_folder=frontend_dir,
        static_url_path=""
    )

    # Load configuration
    if isinstance(config_setting, type) and issubclass(config_setting, Config):
        app.config.from_object(config_setting)
    elif isinstance(config_setting, str) and config_setting in config_by_name:
        app.config.from_object(config_by_name[config_setting])
    else:
        env_mode = os.getenv("FLASK_ENV", "development").lower()
        app.config.from_object(config_by_name.get(env_mode, config_by_name["default"]))

    # Enable CORS
    CORS(app)

    # Initialize model service
    model_path = app.config.get("MODEL_PATH")
    if model_path:
        model_service.load_model(model_path)

    # Initialize metrics service
    metrics_path = app.config.get("METRICS_PATH")
    if metrics_path:
        metrics_service.metrics_path = metrics_path

    # Register blueprints / routes
    register_routes(app)

    # Generic Error Handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Not Found",
            "message": "The requested endpoint does not exist. Check GET / for available routes or GET /app for the Web UI."
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Internal Server Error",
            "message": "An unexpected error occurred on the server."
        }), 500

    return app
