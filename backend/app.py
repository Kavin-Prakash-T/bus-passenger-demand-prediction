"""
Main server entrypoint for Bus Passenger Demand Prediction API.
"""
import os
import sys

# Ensure backend directory is in python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from factory import create_app

# Instantiate Flask application
app = create_app()

if __name__ == "__main__":
    host = app.config.get("HOST", "127.0.0.1")
    port = app.config.get("PORT", 5000)
    debug = app.config.get("DEBUG", True)

    print(f" Starting Bus Passenger Demand Prediction Server on http://{host}:{port}")
    app.run(host=host, port=port, debug=debug)
