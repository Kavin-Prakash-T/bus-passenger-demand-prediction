"""
Routes package initialization and registration.
"""
from flask import Flask
from .info_routes import info_bp
from .predict_routes import predict_bp


def register_routes(app: Flask):
    """Registers all blueprints to the Flask application."""
    app.register_blueprint(info_bp)
    app.register_blueprint(predict_bp)


__all__ = ["info_bp", "predict_bp", "register_routes"]
