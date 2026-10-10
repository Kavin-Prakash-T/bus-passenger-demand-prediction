"""
Constants and configurations for Bus Passenger Demand Prediction.
"""

AVAILABLE_ROUTES = ["101", "18D", "21G", "23C", "27B", "570", "5E", "70", "M1", "P21"]
AVAILABLE_WEATHER = ["Clear", "Cloudy", "Rain"]
AVAILABLE_BUS_TYPES = ["Ordinary", "Express", "Deluxe"]
PEAK_HOURS = {7, 8, 9, 17, 18, 19}
HOURS_RANGE = {"min": 5, "max": 22}

DEMAND_THRESHOLDS = {
    "LOW_MAX": 40,
    "MEDIUM_MAX": 80
}

DEMAND_RECOMMENDATIONS = {
    "High": "High demand expected. Consider increasing bus frequency or deploying higher-capacity buses.",
    "Medium": "Standard demand. Maintain regular timetable and standard bus capacity.",
    "Low": "Low demand expected. Standard or compact bus is sufficient."
}
