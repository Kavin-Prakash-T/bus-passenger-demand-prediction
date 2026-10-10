"""
Application Configuration settings.
"""
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Config:
    """Base Configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "bus-demand-secret-key")
    DEBUG = False
    TESTING = False
    
    # Paths
    BASE_DIR = BASE_DIR
    MODEL_PATH = os.getenv(
        "MODEL_PATH",
        os.path.join(BASE_DIR, "model", "bus_passenger_demand_model.pkl")
    )
    METRICS_PATH = os.getenv(
        "METRICS_PATH",
        os.path.join(BASE_DIR, "datasets", "model_comparison_results.csv")
    )

    # Server settings
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", "5000"))


class DevelopmentConfig(Config):
    """Development Configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production Configuration."""
    DEBUG = False


class TestingConfig(Config):
    """Testing Configuration."""
    TESTING = True
    DEBUG = True


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig
}
