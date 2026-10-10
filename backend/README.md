# Bus Passenger Demand Prediction - Backend API

A modular, production-ready Flask backend designed for serving predictions and analytics from the trained Bus Passenger Demand machine learning model.

---

## 🏗️ Modular Architecture

The backend has been refactored into a clean, modular structure following standard industry best practices (Application Factory, Blueprints, Domain Services, Config Management):

```
backend/
├── __init__.py                # Package root exposing create_app
├── app.py                     # Main server entrypoint (creates & runs the app)
├── config.py                  # Environment & app configuration classes
├── constants.py               # Routes, weather types, peak hours, and demand thresholds
├── factory.py                 # Flask Application Factory (CORS, blueprints, error handling)
├── requirements.txt           # Python dependencies
├── test_api.py                # Automated API & service test suite
├── README.md                  # Documentation
│
├── routes/                    # API Blueprint handlers
│   ├── __init__.py            # Blueprint registration helper
│   ├── info_routes.py         # Metadata, health, options, and model benchmark endpoints
│   └── predict_routes.py      # Single & batch prediction endpoints
│
├── services/                  # Business & ML service layer
│   ├── __init__.py
│   ├── model_service.py       # Model inference, demand classification, operational recommendations
│   └── metrics_service.py     # Comparison metrics and benchmark data loader
│
└── utils/                     # Utility functions
    ├── __init__.py
    └── features.py            # Feature engineering, calendar transformations, and date parsing
```

---

## 🚀 How to Run the Server

### 1. Using Virtual Environment

From the project root directory:

```bash
# On Windows PowerShell
backend\.venv\Scripts\python backend/app.py
```

Or from within the `backend` directory:

```bash
cd backend
.venv\Scripts\activate
python app.py
```

The server will start at: **`http://127.0.0.1:5000`**

---

## ⚙️ Configuration & Environment

Configuration can be customized via environment variables:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `FLASK_ENV` | `development` | Config mode (`development`, `production`, `testing`) |
| `HOST` | `127.0.0.1` | Host interface to bind |
| `PORT` | `5000` | Port to run the server on |
| `MODEL_PATH` | `../model/bus_passenger_demand_model.pkl` | Path to trained `.pkl` model |
| `METRICS_PATH` | `../datasets/model_comparison_results.csv` | Path to model comparison CSV |

---

## 📡 API Endpoints

### 1. Root & Health Check
- **`GET /`** - API status and endpoint directory
- **`GET /api/health`** - Model health and readiness status

### 2. Available Options
- **`GET /api/options`** - Lists valid routes, weather types, bus types, and operational hours for frontend dropdowns

### 3. Model Benchmark & Metrics
- **`GET /api/model-info`** - Comparison metrics for all evaluated models (Linear Regression, Random Forest, Gradient Boosting)

### 4. Single Trip Prediction
- **`POST /api/predict`**
- **Request Body:**
```json
{
  "date": "2025-06-21",
  "route_number": "70",
  "hour": 7,
  "weather": "Cloudy",
  "bus_type": "Express",
  "holiday": 0
}
```
- **Response:**
```json
{
  "status": "success",
  "prediction": {
    "predicted_passengers": 60,
    "exact_passengers": 59.68,
    "demand_level": "Medium",
    "recommendation": "Standard demand. Maintain regular timetable and standard bus capacity."
  },
  "input_features": {
    "route_number": "70",
    "weather": "Cloudy",
    "bus_type": "Express",
    "hour": 7.0,
    "day_of_week": 5,
    "holiday": 0.0,
    "peak_hour": 1,
    "weekend": 1,
    "month": 6,
    "day": 21,
    "week_of_year": 25
  }
}
```

### 5. Batch Predictions
- **`POST /api/predict-batch`**
- **Request Body:**
```json
{
  "items": [
    {"date": "2025-06-21", "route_number": "70", "hour": 7, "weather": "Cloudy", "bus_type": "Express"},
    {"date": "2025-06-21", "route_number": "M1", "hour": 15, "weather": "Clear", "bus_type": "Express"},
    {"date": "2025-06-30", "route_number": "570", "hour": 18, "weather": "Clear", "bus_type": "Express"}
  ]
}
```

---

## 🧪 Running Tests

To verify all modular components, services, and endpoints:

```bash
backend\.venv\Scripts\python backend/test_api.py
```

---

## 📊 Dataset Benchmarks & Metrics Summary (For Project Report)

- **Total Dataset Volume**: 593 cleaned observation rows
- **Temporal Horizon**: **6 Months** (January 1, 2025 to June 30, 2025)
- **Routes Implemented (10 Corridors)**:
  `101`, `18D`, `21G`, `23C`, `27B`, `570`, `5E`, `70`, `M1`, `P21`
- **Hours Window**: 5:00 AM to 10:00 PM (18 operating hours/day)
- **Target Variable Range**: Min 5 passengers, Max 138 passengers, Mean 59.9 passengers
- **Candidate Model Benchmarks**:
  - **Linear Regression Pipeline**: $R^2 = \mathbf{0.8663}$, $\text{MAE} = \mathbf{7.42}$, $\text{RMSE} = \mathbf{9.26}$ (Active Production Model)
  - **Gradient Boosting**: $R^2 = 0.8640$, $\text{MAE} = 7.22$, $\text{RMSE} = 9.34$
  - **Random Forest**: $R^2 = 0.8384$, $\text{MAE} = 8.02$, $\text{RMSE} = 10.18$
