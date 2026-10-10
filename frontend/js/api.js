/**
 * API Service for Bus Passenger Demand Prediction
 * Communicates with Flask backend endpoints with graceful fallback.
 */

const API_BASE_URL = window.location.port === "5000" ? "" : "http://127.0.0.1:5000";

class ApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.isAvailable = false;
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        this.isAvailable = data.model_ready === true;
        return { online: true, modelReady: data.model_ready };
      }
      return { online: false, modelReady: false };
    } catch (err) {
      this.isAvailable = false;
      return { online: false, error: err.message };
    }
  }

  async getOptions() {
    try {
      const response = await fetch(`${this.baseUrl}/api/options`, { method: "GET" });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn("Could not reach backend /api/options, using local defaults.");
    }
    // Fallback options matching dataset
    return {
      routes: ["101", "18D", "21G", "23C", "27B", "570", "5E", "70", "M1", "P21"],
      weather: ["Clear", "Cloudy", "Rain"],
      bus_types: ["Ordinary", "Express", "Deluxe"],
      peak_hours: [7, 8, 9, 17, 18, 19],
      hours_range: { min: 5, max: 22 }
    };
  }

  async getModelInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/api/model-info`, { method: "GET" });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn("Could not reach /api/model-info, using cached comparison.");
    }
    return {
      selected_model: "Linear Regression Pipeline (Best R2: 0.866)",
      comparison: [
        { "Model": "Linear Regression", "MAE": 7.42, "RMSE": 9.26, "R2 Score": 0.8663 },
        { "Model": "Gradient Boosting", "MAE": 7.22, "RMSE": 9.34, "R2 Score": 0.8640 },
        { "Model": "Random Forest", "MAE": 8.02, "RMSE": 10.18, "R2 Score": 0.8384 }
      ]
    };
  }

  async getAnalytics() {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics`, { method: "GET" });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn("Could not reach /api/analytics, using cached fallback data.");
    }
    return {
      weather: { "Clear": 359, "Cloudy": 144, "Rain": 90 },
      bus_type: { "Ordinary": 378, "Express": 155, "Deluxe": 60 },
      demand_level: { "Low": 138, "Medium": 323, "High": 132 },
      avg_by_route: { "101": 55.5, "18D": 58.3, "21G": 74.4, "23C": 48.4, "27B": 66.0, "570": 91.6, "5E": 51.6, "70": 47.3, "M1": 44.2, "P21": 68.0 },
      avg_by_hour: { "5": 41.7, "6": 42.7, "7": 79.8, "8": 79.8, "9": 84.0, "10": 51.3, "11": 56.3, "12": 51.0, "13": 52.4, "14": 59.0, "15": 51.2, "16": 50.3, "17": 82.3, "18": 77.3, "19": 84.2, "20": 38.1, "21": 41.8, "22": 39.3 },
      weekday_vs_weekend: { "Weekday": 62.8, "Weekend": 53.6 },
      avg_by_bus_type: { "Ordinary": 62.7, "Express": 57.2, "Deluxe": 49.4 },
      holiday_vs_non_holiday: { "Regular Day": 60.8, "Holiday": 48.2 }
    };
  }

  async predictSingle(payload) {
    const response = await fetch(`${this.baseUrl}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server returned error ${response.status}`);
    }

    return await response.json();
  }

  async predictBatch(items) {
    const response = await fetch(`${this.baseUrl}/api/predict-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server returned error ${response.status}`);
    }

    return await response.json();
  }
}

// Export singleton instance
window.apiService = new ApiService();
