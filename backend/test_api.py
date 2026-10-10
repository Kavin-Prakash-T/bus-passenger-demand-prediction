import json
from app import app
from services.model_service import ModelService
from utils.features import prepare_input_features


def test_endpoints():
    client = app.test_client()

    print("\n--- 1. Testing GET / ---")
    res = client.get("/")
    print("Status:", res.status_code)
    print("Response:", res.get_json())
    assert res.status_code == 200

    print("\n--- 2. Testing GET /api/health ---")
    res = client.get("/api/health")
    print("Status:", res.status_code)
    print("Response:", res.get_json())
    assert res.status_code == 200
    assert res.get_json().get("model_ready") is True

    print("\n--- 3. Testing GET /api/options ---")
    res = client.get("/api/options")
    print("Status:", res.status_code)
    print("Response:", res.get_json())
    assert res.status_code == 200
    assert "routes" in res.get_json()
    assert "weather" in res.get_json()

    print("\n--- 4. Testing GET /api/model-info ---")
    res = client.get("/api/model-info")
    print("Status:", res.status_code)
    print("Response:", res.get_json())
    assert res.status_code == 200
    assert "comparison" in res.get_json()

    print("\n--- 4b. Testing GET /api/analytics ---")
    res_analytics = client.get("/api/analytics")
    print("Status:", res_analytics.status_code)
    assert res_analytics.status_code == 200
    analytics_data = res_analytics.get_json()
    assert "weather" in analytics_data
    assert "bus_type" in analytics_data
    assert "demand_level" in analytics_data
    assert "avg_by_route" in analytics_data
    assert "avg_by_hour" in analytics_data
    assert "weekday_vs_weekend" in analytics_data
    assert "avg_by_bus_type" in analytics_data
    assert "holiday_vs_non_holiday" in analytics_data

    print("\n--- 5. Testing POST /api/predict (Single Prediction) ---")
    sample_payload = {
        "date": "2025-06-21",
        "route_number": "70",
        "hour": 7,
        "weather": "Cloudy",
        "bus_type": "Express",
        "holiday": 0
    }
    res = client.post("/api/predict", data=json.dumps(sample_payload), content_type="application/json")
    print("Status:", res.status_code)
    print("Response:", json.dumps(res.get_json(), indent=2))
    assert res.status_code == 200
    assert "prediction" in res.get_json()

    print("\n--- 6. Testing POST /api/predict-batch (Batch Prediction) ---")
    batch_payload = {
        "items": [
            {"date": "2025-06-21", "route_number": "70", "hour": 7, "weather": "Cloudy", "bus_type": "Express"},
            {"date": "2025-06-21", "route_number": "M1", "hour": 15, "weather": "Clear", "bus_type": "Express"},
            {"date": "2025-06-30", "route_number": "570", "hour": 18, "weather": "Clear", "bus_type": "Express"}
        ]
    }
    res = client.post("/api/predict-batch", data=json.dumps(batch_payload), content_type="application/json")
    print("Status:", res.status_code)
    print("Response:", json.dumps(res.get_json(), indent=2))
    assert res.status_code == 200
    assert res.get_json().get("count") == 3

    print("\n--- 7. Testing 400 Bad Request Edge Cases ---")
    bad_res1 = client.post("/api/predict", data="invalid json string", content_type="application/json")
    assert bad_res1.status_code == 400

    bad_res2 = client.post("/api/predict-batch", data=json.dumps({"invalid_key": []}), content_type="application/json")
    assert bad_res2.status_code == 400

    print("\n--- 8. Testing 404 Not Found Handler ---")
    not_found_res = client.get("/api/non-existent")
    assert not_found_res.status_code == 404

    print("\n--- 9. Testing ModelService and Feature Engineering directly ---")
    df = prepare_input_features({"date": "2025-06-21", "hour": 8})
    assert df["peak_hour"].iloc[0] == 1
    assert df["weekend"].iloc[0] == 1

    assert ModelService.classify_demand(30) == "Low"
    assert ModelService.classify_demand(60) == "Medium"
    assert ModelService.classify_demand(95) == "High"

    print("\n ALL BACKEND TESTS & MODULARITY VALIDATIONS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_endpoints()
