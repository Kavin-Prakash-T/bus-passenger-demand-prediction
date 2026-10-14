# 🚌 BusCast - Bus Passenger Demand Prediction & Fleet Optimization

An intelligent transit demand forecasting and schedule optimization system powered by Machine Learning. This project predicts passenger volumes across major urban bus routes and assists transit authorities in dynamic dispatching, headway management, and fleet allocation.

---

## 📊 Dataset Benchmarks & Empirical Profile (For Project Report)

The following tables and metrics summarize the training dataset, temporal range, route coverage, and machine learning model evaluation:

### 1. Dataset Dimensions & Volume
| Metric | Value | Technical Description |
| :--- | :--- | :--- |
| **Total Cleaned Observations** | **593 trips** | Granular trip/slot operational passenger load observations |
| **Time Horizon** | **6 Months** | Spanning **Q1 & Q2 2025** (January 1, 2025 – June 30, 2025) |
| **Unique Bus Corridors** | **10 Routes** | High-density arterial and feeder routes |
| **Operating Hours Covered** | **18 Hours / Day** | From **05:00 AM (05:00)** to **10:00 PM (22:00)** |
| **Target Variable** | `passengers` | Passenger headcount observed per vehicle trip/slot |
| **Passenger Count Range** | **5 to 138 passengers** | Min: 5, Max: 138, **Mean: 59.9 passengers/trip** |

---

### 2. Implemented Routes & Corridors (10 Routes)
| Route ID | Route Profile | Average Passenger Demand | Demand Class |
| :--- | :--- | :--- | :--- |
| **570** | Central Arterial Corridor | **91.6 passengers** | High |
| **21G** | IT Expressway / Commercial Link | **74.4 passengers** | Medium-High |
| **P21** | Suburban Commuter Line | **68.0 passengers** | Medium |
| **27B** | Metro Feeder & University Ring | **66.0 passengers** | Medium |
| **18D** | Residential-Industrial Corridor | **58.3 passengers** | Medium |
| **101** | North-South Trunk Route | **55.5 passengers** | Medium |
| **5E**  | Cross-City Connector | **51.6 passengers** | Medium |
| **23C** | East City Express Corridor | **48.4 passengers** | Medium |
| **70**  | West Gateway Arterial | **47.3 passengers** | Medium |
| **M1**  | Inner Ring Feeder Route | **44.2 passengers** | Medium-Low |

---

### 3. Feature Engineering & Variables (11 Dimensions)
| Feature Name | Type | Description / Domain Range |
| :--- | :--- | :--- |
| `route_number` | Categorical | 10 corridors (`101`, `18D`, `21G`, `23C`, `27B`, `570`, `5E`, `70`, `M1`, `P21`) |
| `weather` | Categorical | `Clear` (359 trips), `Cloudy` (144 trips), `Rain` (90 trips) |
| `bus_type` | Categorical | `Ordinary` (378 trips), `Express` (155 trips), `Deluxe` (60 trips) |
| `hour` | Numerical | Operating hour of day (5.0 to 22.0) |
| `day_of_week` | Numerical | Monday (0) through Sunday (6) |
| `holiday` | Binary (0 / 1) | Public / regional holiday indicator (Regular: 60.8 avg, Holiday: 48.2 avg) |
| `peak_hour` | Binary (0 / 1) | Designated peak transit windows (07:00–09:00 & 17:00–19:00) |
| `weekend` | Binary (0 / 1) | Weekday (62.8 avg pax) vs Weekend (53.6 avg pax) |
| `month` | Numerical | 1 through 6 (Jan – Jun 2025) |
| `day` | Numerical | Day of the month (1 – 31) |
| `week_of_year`| Numerical | ISO Calendar week (Weeks 1 to 27) |

---

### 4. Passenger Demand Tier Distribution
| Demand Classification | Definition | Sample Count | Share (%) | Dispatch Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Low Demand** | $\le 40$ passengers | 138 trips | 23.3% | Standard or compact buses; standard 15–20 min intervals |
| **Medium Demand** | $41 - 80$ passengers | 323 trips | 54.5% | Regular fleet schedule; 8–12 min headway |
| **High Demand** | $> 80$ passengers | 132 trips | 22.3% | Articulated/double-decker buses; 5–8 min express headway |

---

### 5. Machine Learning Model Evaluation Benchmarks

All candidate algorithms were evaluated on held-out validation datasets using standard regression evaluation metrics:

$$\text{MAE} = \frac{1}{n} \sum |y_i - \hat{y}_i| \qquad \text{RMSE} = \sqrt{\frac{1}{n} \sum (y_i - \hat{y}_i)^2} \qquad R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$

| Algorithm | $R^2$ Score (Accuracy) | MAE (Passengers) | RMSE (Passengers) | Latency & Suitability | Status |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **Linear Regression Pipeline** | **0.8663** | **7.42** | **9.26** | **< 2 ms** (Zero-drift, instant deterministic inference) | **Selected Production Model** |
| **Gradient Boosting Regressor** | 0.8640 | 7.22 | 9.34 | ~ 15 ms (Iterative decision tree ensembles) | Benchmark Baseline |
| **Random Forest Regressor** | 0.8384 | 8.02 | 10.18 | ~ 28 ms (Bagged forest ensemble) | Benchmark Baseline |

> **Key Finding for Project Report**: The **Linear Regression Pipeline** achieved the highest overall $R^2$ score (**0.8663**) with balanced error margins (MAE **7.42 passengers**, RMSE **9.26 passengers**) while offering the lowest computational overhead, making it optimal for high-throughput real-time dispatch systems.

---

## 🏛️ System Architecture

```
bus-passenger-demand-prediction/
├── backend/
│   ├── config.py              # Environment configuration & dynamic paths
│   ├── factory.py             # Flask Application Factory with CORS & error handlers
│   ├── app.py                 # Main entrypoint
│   ├── routes/                # Blueprint routing (predict_routes, info_routes)
│   ├── services/              # ModelService & MetricsService business logic
│   ├── utils/                 # Feature extraction & calendar transformations
│   ├── requirements.txt       # Python dependencies
│   └── test_api.py            # Automated test suite
│
├── frontend/
│   ├── index.html             # Enterprise Operations Console (Light Mode)
│   ├── css/style.css          # Pure solid-color design system (strictly zero gradients)
│   └── js/
│       ├── api.js             # Resilient backend API integration
│       ├── charts.js          # Chart.js small-size multi-chart controller
│       └── app.js             # UI state orchestration & operational profiles
│
├── datasets/
│   ├── bus_passenger_demand_cleaned.csv  # 593 cleaned observation rows (Jan-Jun 2025)
│   └── model_comparison_results.csv     # Model evaluation benchmark results
│
└── model/
    └── bus_passenger_demand_model.pkl    # Serialized Scikit-Learn Pipeline (R² 0.866)
```

---

## 🚀 Running the Project

### 1. Launch the Backend Server
```bash
# On Windows PowerShell
backend\.venv\Scripts\python backend/app.py
```
The server will bind to **`http://127.0.0.1:5000`**.

### 2. Access the Operations Console
Open **`http://127.0.0.1:5000/`** (or open [`frontend/index.html`](file:///c:/Users/Kavin%20Prakash/Desktop/bus-passenger-demand-prediction/frontend/index.html) directly).
