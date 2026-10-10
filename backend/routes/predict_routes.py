"""
Routes for single and batch passenger demand predictions.
"""
from flask import Blueprint, request, jsonify
from services.model_service import model_service

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/api/predict", methods=["POST"])
def predict():
    """
    Predict passenger demand for a given bus route and schedule.
    Sample JSON Body:
    {
        "date": "2025-06-21",
        "route_number": "70",
        "hour": 7,
        "weather": "Cloudy",
        "bus_type": "Express",
        "holiday": 0
    }
    """
    if not model_service.is_loaded:
        return jsonify({"error": "Model is not loaded. Check server logs."}), 500

    data = request.get_json(force=True, silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request. Please provide a valid JSON object."}), 400

    try:
        result = model_service.predict_single(data)
        return jsonify({
            "status": "success",
            **result
        }), 200
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 400


@predict_bp.route("/api/predict-batch", methods=["POST"])
def predict_batch():
    """
    Predict passenger demand for multiple items/hours.
    Sample JSON Body:
    {
        "items": [
            {"date": "2025-06-21", "route_number": "70", "hour": 7, "weather": "Cloudy", "bus_type": "Express"},
            {"date": "2025-06-21", "route_number": "70", "hour": 8, "weather": "Cloudy", "bus_type": "Express"}
        ]
    }
    """
    if not model_service.is_loaded:
        return jsonify({"error": "Model is not loaded."}), 500

    payload = request.get_json(force=True, silent=True)
    if not payload or not isinstance(payload, dict) or "items" not in payload or not isinstance(payload["items"], list):
        return jsonify({"error": "Please provide a JSON body with an 'items' array."}), 400

    try:
        results = model_service.predict_batch(payload["items"])
        return jsonify({
            "status": "success",
            "count": len(results),
            "predictions": results
        }), 200
    except Exception as e:
        return jsonify({"error": f"Batch prediction failed: {str(e)}"}), 400
