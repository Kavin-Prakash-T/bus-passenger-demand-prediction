"""
Service responsible for fetching benchmark metrics and model comparison data.
"""
import os
import pandas as pd


class MetricsService:
    """Handles loading and presenting model metrics."""

    def __init__(self, metrics_path: str = None):
        self.metrics_path = metrics_path

    def get_comparison_metrics(self, metrics_path: str = None) -> dict:
        """
        Retrieves model evaluation comparison metrics from CSV.
        """
        path = metrics_path or self.metrics_path
        if not path or not os.path.exists(path):
            return None

        try:
            df = pd.read_csv(path)
            metrics = df.to_dict(orient="records")
            return {
                "selected_model": "Linear Regression Pipeline (Best R2: 0.866)",
                "comparison": metrics
            }
        except Exception as e:
            raise RuntimeError(f"Failed to read metrics: {str(e)}")


# Global singleton instance
metrics_service = MetricsService()
