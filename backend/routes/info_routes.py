"""
Routes for metadata, options, health checks, metrics, and web dashboard.
"""
import os
from flask import Blueprint, jsonify, current_app, request, send_from_directory
from constants import AVAILABLE_ROUTES, AVAILABLE_WEATHER, AVAILABLE_BUS_TYPES, PEAK_HOURS, HOURS_RANGE
from services.model_service import model_service
from services.metrics_service import metrics_service

info_bp = Blueprint("info", __name__)


@info_bp.route("/", methods=["GET"])
def home():
    """Root endpoint providing web dashboard or API overview based on Accept header."""
    # If accessed directly via browser requesting HTML, serve frontend dashboard
    accept_header = request.headers.get("Accept", "")
    frontend_dir = os.path.join(current_app.config.get("BASE_DIR"), "frontend")
    
    if "text/html" in accept_header and os.path.exists(os.path.join(frontend_dir, "index.html")):
        return send_from_directory(frontend_dir, "index.html")

    return jsonify({
        "project": "Bus Passenger Demand Prediction API",
        "status": "online",
        "model_loaded": model_service.is_loaded,
        "endpoints": {
            "GET /app": "Interactive Web Dashboard",
            "GET /api/health": "Check API and model status",
            "GET /api/options": "Get available dropdown values for UI/Frontend",
            "GET /api/model-info": "Get model metrics and benchmark comparison",
            "POST /api/predict": "Predict passenger demand for a single trip/slot",
            "POST /api/predict-batch": "Predict passenger demand for multiple slots/trips"
        }
    }), 200


@info_bp.route("/app", methods=["GET"])
@info_bp.route("/dashboard", methods=["GET"])
def dashboard():
    """Serves the frontend single-page web application."""
    frontend_dir = os.path.join(current_app.config.get("BASE_DIR"), "frontend")
    return send_from_directory(frontend_dir, "index.html")


@info_bp.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "model_ready": model_service.is_loaded
    }), 200


@info_bp.route("/api/options", methods=["GET"])
def options():
    """Returns valid options for routes, weather, and bus types."""
    return jsonify({
        "routes": AVAILABLE_ROUTES,
        "weather": AVAILABLE_WEATHER,
        "bus_types": AVAILABLE_BUS_TYPES,
        "peak_hours": sorted(list(PEAK_HOURS)),
        "hours_range": HOURS_RANGE
    }), 200


@info_bp.route("/api/model-info", methods=["GET"])
def model_info():
    """Returns comparison metrics of trained models."""
    metrics_path = current_app.config.get("METRICS_PATH")
    try:
        data = metrics_service.get_comparison_metrics(metrics_path)
        if data is None:
            return jsonify({"message": "Metrics file not found"}), 404
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@info_bp.route("/api/analytics", methods=["GET"])
def analytics():
    """Returns aggregated dataset distributions and demand insights for dashboard charts."""
    cleaned_csv_path = os.path.join(current_app.config.get("BASE_DIR"), "datasets", "bus_passenger_demand_cleaned.csv")
    if os.path.exists(cleaned_csv_path):
        try:
            import pandas as pd
            df = pd.read_csv(cleaned_csv_path)
            return jsonify({
                "weather": df["weather"].value_counts().to_dict(),
                "bus_type": df["bus_type"].value_counts().to_dict(),
                "demand_level": df["demand_level"].value_counts().to_dict(),
                "avg_by_route": df.groupby("route_number")["passengers"].mean().round(1).to_dict(),
                "avg_by_hour": {str(int(float(k))): v for k, v in df.groupby("hour")["passengers"].mean().round(1).to_dict().items()},
                "weekday_vs_weekend": {"Weekday": float(df[df["weekend"] == 0]["passengers"].mean().round(1)), "Weekend": float(df[df["weekend"] == 1]["passengers"].mean().round(1))},
                "avg_by_bus_type": df.groupby("bus_type")["passengers"].mean().round(1).to_dict(),
                "holiday_vs_non_holiday": {"Regular Day": float(df[df["holiday"] == 0]["passengers"].mean().round(1)), "Holiday": float(df[df["holiday"] == 1]["passengers"].mean().round(1))}
            }), 200
        except Exception as e:
            pass

    # Static precalculated fallback
    return jsonify({
        "weather": {"Clear": 359, "Cloudy": 144, "Rain": 90},
        "bus_type": {"Ordinary": 378, "Express": 155, "Deluxe": 60},
        "demand_level": {"Low": 138, "Medium": 323, "High": 132},
        "avg_by_route": {"101": 55.5, "18D": 58.3, "21G": 74.4, "23C": 48.4, "27B": 66.0, "570": 91.6, "5E": 51.6, "70": 47.3, "M1": 44.2, "P21": 68.0},
        "avg_by_hour": {"5": 41.7, "6": 42.7, "7": 79.8, "8": 79.8, "9": 84.0, "10": 51.3, "11": 56.3, "12": 51.0, "13": 52.4, "14": 59.0, "15": 51.2, "16": 50.3, "17": 82.3, "18": 77.3, "19": 84.2, "20": 38.1, "21": 41.8, "22": 39.3},
        "weekday_vs_weekend": {"Weekday": 62.8, "Weekend": 53.6},
        "avg_by_bus_type": {"Ordinary": 62.7, "Express": 57.2, "Deluxe": 49.4},
        "holiday_vs_non_holiday": {"Regular Day": 60.8, "Holiday": 48.2}
    }), 200
