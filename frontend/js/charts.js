/**
 * Chart management module using Chart.js
 * Strictly NO gradients - solid enterprise light colors and clean crisp line/bar styling.
 * All charts include explicit X and Y axis labels.
 */

class ChartManager {
  constructor() {
    this.simulationChart = null;
    this.comparisonChart = null;
    this.analyticsCharts = {};

    if (typeof Chart !== "undefined") {
      Chart.defaults.font.family = "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
  }

  // -------------------------------------------------------------
  // 1. Simulation Chart (24h Hourly Demand)
  // -------------------------------------------------------------
  renderHourlySimulation(canvasId, predictions) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.simulationChart) {
      this.simulationChart.destroy();
    }

    const labels = predictions.map(p => {
      const h = p.hour;
      const period = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      return `${displayHour}:00 ${period}`;
    });

    const values = predictions.map(p => p.predicted_passengers);

    const backgroundColors = predictions.map(p => {
      if (p.demand_level === "High") return "#dc2626";    // Solid Crimson
      if (p.demand_level === "Medium") return "#d97706";  // Solid Amber
      return "#059669";                                   // Solid Emerald
    });

    const gridColor = "#e2e8f0";
    const textColor = "#475569";

    this.simulationChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Predicted Passenger Demand",
            data: values,
            backgroundColor: backgroundColors,
            borderColor: "transparent",
            borderRadius: 4,
            barPercentage: 0.65,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#ffffff",
            titleColor: "#0f172a",
            bodyColor: "#334155",
            borderColor: "#cbd5e1",
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const item = predictions[context.dataIndex];
                return [
                  `Passengers: ${context.raw}`,
                  `Demand Tier: ${item.demand_level}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor, drawBorder: false },
            ticks: { color: textColor, font: { family: "Poppins", size: 11 } },
            title: {
              display: true,
              text: "Time of Day",
              color: "#0f172a",
              font: { family: "Poppins", size: 12, weight: 700 }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor, drawBorder: false },
            ticks: { color: textColor, font: { family: "Poppins", size: 11 } },
            title: {
              display: true,
              text: "Predicted Passengers",
              color: "#0f172a",
              font: { family: "Poppins", size: 12, weight: 700 }
            }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 2. Multi-Route Corridor Comparison Chart
  // -------------------------------------------------------------
  renderRouteComparison(canvasId, routeLabels, routePredictions) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.comparisonChart) {
      this.comparisonChart.destroy();
    }

    const gridColor = "#e2e8f0";
    const textColor = "#475569";
    const solidPalette = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0284c7", "#db2777", "#4b5563"];

    const datasets = routePredictions.map((rp, idx) => ({
      label: `Route ${rp.route}`,
      data: rp.hourlyCounts,
      borderColor: solidPalette[idx % solidPalette.length],
      backgroundColor: solidPalette[idx % solidPalette.length],
      borderWidth: 2.5,
      pointRadius: 3,
      pointHoverRadius: 6,
      tension: 0.2
    }));

    this.comparisonChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: routeLabels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: textColor,
              font: { family: "Poppins", size: 12, weight: 600 },
              usePointStyle: true,
              boxWidth: 8
            }
          },
          tooltip: {
            backgroundColor: "#ffffff",
            titleColor: "#0f172a",
            bodyColor: "#334155",
            borderColor: "#cbd5e1",
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor },
            title: {
              display: true,
              text: "Time of Day",
              color: "#0f172a",
              font: { family: "Poppins", size: 12, weight: 700 }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: textColor },
            title: {
              display: true,
              text: "Predicted Passengers",
              color: "#0f172a",
              font: { family: "Poppins", size: 12, weight: 700 }
            }
          }
        }
      }
    });
  }

 
  destroyAnalyticsChart(key) {
    if (this.analyticsCharts[key]) {
      this.analyticsCharts[key].destroy();
      delete this.analyticsCharts[key];
    }
  }

  renderAnalyticsDashboard(data) {
    const gridColor = "#f1f5f9";
    const textColor = "#475569";
    const axisTitleColor = "#0f172a";
    const tickFont = { family: "Poppins", size: 9 };
    const axisTitleFont = { family: "Poppins", size: 10, weight: 700 };

    const tooltipConfig = {
      backgroundColor: "#ffffff",
      titleColor: "#0f172a",
      bodyColor: "#334155",
      borderColor: "#cbd5e1",
      borderWidth: 1,
      padding: 8
    };

    // Helper for common bar chart scale options with X and Y titles
    const makeScales = (xLabel, yLabel) => ({
      x: {
        grid: { display: false },
        ticks: { font: tickFont, color: textColor },
        title: {
          display: true,
          text: xLabel,
          color: axisTitleColor,
          font: axisTitleFont,
          padding: { top: 4, bottom: 0 }
        }
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { font: tickFont, color: textColor },
        title: {
          display: true,
          text: yLabel,
          color: axisTitleColor,
          font: axisTitleFont,
          padding: { bottom: 4 }
        }
      }
    });

    // 1. Weather Distribution (Bar Chart with clean axis labels)
    const ctxWeather = document.getElementById("chartWeather");
    if (ctxWeather && data.weather) {
      this.destroyAnalyticsChart("weather");
      const labels = Object.keys(data.weather);
      const vals = Object.values(data.weather);
      this.analyticsCharts["weather"] = new Chart(ctxWeather, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Trip Count",
            data: vals,
            backgroundColor: ["#0284c7", "#64748b", "#2563eb"],
            borderRadius: 4,
            barPercentage: 0.55
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tooltipConfig },
          scales: makeScales("Weather Condition", "Trip Count")
        }
      });
    }

    // 2. Bus Type Distribution (Bar Chart with clean axis labels)
    const ctxBusType = document.getElementById("chartBusType");
    if (ctxBusType && data.bus_type) {
      this.destroyAnalyticsChart("busType");
      const labels = Object.keys(data.bus_type);
      const vals = Object.values(data.bus_type);
      this.analyticsCharts["busType"] = new Chart(ctxBusType, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Trip Count",
            data: vals,
            backgroundColor: ["#059669", "#2563eb", "#7c3aed"],
            borderRadius: 4,
            barPercentage: 0.55
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tooltipConfig },
          scales: makeScales("Bus Type", "Trip Count")
        }
      });
    }

    // 3. Distribution of Passenger Demand (Bar Chart with clean axis labels)
    const ctxDemandLevel = document.getElementById("chartDemandLevel");
    if (ctxDemandLevel && data.demand_level) {
      this.destroyAnalyticsChart("demandLevel");
      const labels = ["Low (<=40)", "Medium (41-80)", "High (>80)"];
      const vals = [
        data.demand_level["Low"] || 0,
        data.demand_level["Medium"] || 0,
        data.demand_level["High"] || 0
      ];
      this.analyticsCharts["demandLevel"] = new Chart(ctxDemandLevel, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Trip Count",
            data: vals,
            backgroundColor: ["#059669", "#d97706", "#dc2626"],
            borderRadius: 4,
            barPercentage: 0.55
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tooltipConfig },
          scales: makeScales("Demand Level", "Trip Count")
        }
      });
    }

    // 4. Average Passenger Demand by Route (Bar Chart with clean axis labels)
    const ctxAvgRoute = document.getElementById("chartAvgRoute");
    if (ctxAvgRoute && data.avg_by_route) {
      this.destroyAnalyticsChart("avgRoute");
      const labels = Object.keys(data.avg_by_route);
      const vals = Object.values(data.avg_by_route);
      const bgColors = labels.map(r => r === "570" ? "#dc2626" : "#2563eb");
      this.analyticsCharts["avgRoute"] = new Chart(ctxAvgRoute, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Avg Passengers",
            data: vals,
            backgroundColor: bgColors,
            borderRadius: 4,
            barPercentage: 0.65
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tooltipConfig },
          scales: makeScales("Bus Route", "Avg Passengers")
        }
      });
    }

    // 5. Average Passenger Demand by Hour (Bar Chart with clean axis labels)
    const ctxAvgHour = document.getElementById("chartAvgHour");
    if (ctxAvgHour && data.avg_by_hour) {
      this.destroyAnalyticsChart("avgHour");
      const hourKeys = Object.keys(data.avg_by_hour).sort((a, b) => parseInt(a) - parseInt(b));
      const labels = hourKeys.map(h => {
        const num = parseInt(h);
        return num >= 12 ? `${num === 12 ? 12 : num - 12}P` : `${num}A`;
      });
      const vals = hourKeys.map(h => data.avg_by_hour[h]);
      const peakHours = [7, 8, 9, 17, 18, 19];
      const bgColors = hourKeys.map(h => peakHours.includes(parseInt(h)) ? "#dc2626" : "#2563eb");

      this.analyticsCharts["avgHour"] = new Chart(ctxAvgHour, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Avg Passengers",
            data: vals,
            backgroundColor: bgColors,
            borderRadius: 3,
            barPercentage: 0.7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tooltipConfig },
          scales: makeScales("Operating Hour", "Avg Passengers")
        }
      });
    }

    // 6. Weekday vs Weekend Passenger Demand (Bar Chart with clean axis labels)
    const ctxWeekdayWeekend = document.getElementById("chartWeekdayWeekend");
    if (ctxWeekdayWeekend && data.weekday_vs_weekend) {
      this.destroyAnalyticsChart("weekdayWeekend");
      const labels = Object.keys(data.weekday_vs_weekend);
      const vals = Object.values(data.weekday_vs_weekend);
      this.analyticsCharts["weekdayWeekend"] = new Chart(ctxWeekdayWeekend, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Avg Passengers",
            data: vals,
            backgroundColor: ["#2563eb", "#059669"],
            borderRadius: 4,
            barPercentage: 0.45
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tooltipConfig },
          scales: makeScales("Day Category", "Avg Passengers")
        }
      });
    }

    // 7. Passenger Demand by Bus Type (Bar Chart with clean axis labels)
    const ctxDemandBusType = document.getElementById("chartDemandBusType");
    if (ctxDemandBusType && data.avg_by_bus_type) {
      this.destroyAnalyticsChart("demandBusType");
      const labels = Object.keys(data.avg_by_bus_type);
      const vals = Object.values(data.avg_by_bus_type);
      this.analyticsCharts["demandBusType"] = new Chart(ctxDemandBusType, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Avg Passengers",
            data: vals,
            backgroundColor: ["#7c3aed", "#2563eb", "#059669"],
            borderRadius: 4,
            barPercentage: 0.45
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tooltipConfig },
          scales: makeScales("Bus Type", "Avg Passengers")
        }
      });
    }

    // 8. Holiday vs Non-Holiday Demand (Bar Chart with clean axis labels)
    const ctxHoliday = document.getElementById("chartHoliday");
    if (ctxHoliday && data.holiday_vs_non_holiday) {
      this.destroyAnalyticsChart("holiday");
      const labels = Object.keys(data.holiday_vs_non_holiday);
      const vals = Object.values(data.holiday_vs_non_holiday);
      this.analyticsCharts["holiday"] = new Chart(ctxHoliday, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Avg Passengers",
            data: vals,
            backgroundColor: ["#2563eb", "#d97706"],
            borderRadius: 4,
            barPercentage: 0.45
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: tooltipConfig },
          scales: makeScales("Calendar Type", "Avg Passengers")
        }
      });
    }
  }
}

window.chartManager = new ChartManager();
