"""
Service responsible for Machine Learning Model operations and predictions.
"""
import joblib
from constants import DEMAND_THRESHOLDS, DEMAND_RECOMMENDATIONS
from utils.features import prepare_input_features


class ModelService:
    """Handles ML model lifecycle, inference, and domain classifications."""

    def __init__(self, model_path: str = None):
        self.model = None
        self.model_path = model_path
        if model_path:
            self.load_model(model_path)

    def load_model(self, model_path: str):
        """Loads model weights from the specified path."""
        self.model_path = model_path
        try:
            self.model = joblib.load(model_path)
            print(f" Successfully loaded model from: {model_path}")
        except Exception as e:
            self.model = None
            print(f" Failed to load model from {model_path}: {e}")

    @property
    def is_loaded(self) -> bool:
        """Returns True if the ML model is successfully loaded."""
        return self.model is not None

    @staticmethod
    def classify_demand(passengers: float) -> str:
        """Classify passenger count into demand levels matching training data."""
        if passengers <= DEMAND_THRESHOLDS["LOW_MAX"]:
            return "Low"
        elif passengers <= DEMAND_THRESHOLDS["MEDIUM_MAX"]:
            return "Medium"
        else:
            return "High"

    @staticmethod
    def get_recommendation(demand_level: str) -> str:
        """Get operational recommendation based on predicted demand level."""
        return DEMAND_RECOMMENDATIONS.get(
            demand_level,
            "Standard demand. Maintain regular timetable and standard bus capacity."
        )

    def predict_single(self, data: dict) -> dict:
        """
        Runs prediction for a single data payload.
        Returns dictionary containing predicted passenger count, demand level, and recommendation.
        """
        if not self.is_loaded:
            raise RuntimeError("Model is not loaded. Check server logs or model path.")

        features_df = prepare_input_features(data)
        raw_prediction = float(self.model.predict(features_df)[0])
        predicted_passengers = max(0.0, raw_prediction)
        rounded_passengers = int(round(predicted_passengers))
        demand_level = self.classify_demand(rounded_passengers)
        recommendation = self.get_recommendation(demand_level)

        return {
            "prediction": {
                "predicted_passengers": rounded_passengers,
                "exact_passengers": round(predicted_passengers, 2),
                "demand_level": demand_level,
                "recommendation": recommendation
            },
            "input_features": features_df.to_dict(orient="records")[0]
        }

    def predict_batch(self, items: list) -> list:
        """
        Runs batch predictions for a list of items.
        """
        if not self.is_loaded:
            raise RuntimeError("Model is not loaded. Check server logs or model path.")

        results = []
        for item in items:
            features_df = prepare_input_features(item)
            raw_pred = max(0.0, float(self.model.predict(features_df)[0]))
            rounded_pred = int(round(raw_pred))
            demand_level = self.classify_demand(rounded_pred)
            results.append({
                "route_number": features_df["route_number"].iloc[0],
                "hour": features_df["hour"].iloc[0],
                "predicted_passengers": rounded_pred,
                "demand_level": demand_level
            })
        return results


# Global singleton instance
model_service = ModelService()
