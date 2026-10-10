"""
Feature engineering and input transformation helpers.
"""
from datetime import datetime
import pandas as pd
from constants import PEAK_HOURS


def prepare_input_features(data: dict) -> pd.DataFrame:
    """
    Extracts and auto-derives required features from user input.
    Accepts direct date strings (e.g. '2025-06-21') or individual numerical fields.
    """
    route_number = str(data.get("route_number", "101"))
    weather = str(data.get("weather", "Clear"))
    bus_type = str(data.get("bus_type", "Ordinary"))
    hour = float(data.get("hour", 8))
    holiday = float(data.get("holiday", 0))

    # Auto-derive calendar features if a date is provided
    date_str = data.get("date")
    if date_str:
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            month = dt.month
            day = dt.day
            day_of_week = dt.weekday()  # Monday=0, Sunday=6
            week_of_year = dt.isocalendar()[1]
        except ValueError:
            dt = datetime.now()
            month = int(data.get("month", dt.month))
            day = int(data.get("day", dt.day))
            day_of_week = int(data.get("day_of_week", dt.weekday()))
            week_of_year = int(data.get("week_of_year", dt.isocalendar()[1]))
    else:
        dt = datetime.now()
        month = int(data.get("month", dt.month))
        day = int(data.get("day", dt.day))
        day_of_week = int(data.get("day_of_week", dt.weekday()))
        week_of_year = int(data.get("week_of_year", dt.isocalendar()[1]))

    # Derive weekend and peak_hour if not explicitly given
    weekend = int(data.get("weekend", 1 if day_of_week >= 5 else 0))
    peak_hour = int(data.get("peak_hour", 1 if int(hour) in PEAK_HOURS else 0))

    # Create DataFrame in exact order expected by the pipeline
    features_df = pd.DataFrame([{
        "route_number": route_number,
        "weather": weather,
        "bus_type": bus_type,
        "hour": hour,
        "day_of_week": day_of_week,
        "holiday": holiday,
        "peak_hour": peak_hour,
        "weekend": weekend,
        "month": month,
        "day": day,
        "week_of_year": week_of_year
    }])

    return features_df
