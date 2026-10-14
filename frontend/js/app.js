/**
 * BusCast UI Application Logic
 * Orchestrates views, presets, single prediction, simulation, comparison, and benchmarks.
 */

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initial State
  const state = {
    selectedRoute: "70",
    selectedWeather: "Clear",
    selectedBusType: "Express",
    selectedHour: 8,
    isHoliday: 0,
    selectedDate: new Date().toISOString().split("T")[0],
    peakHours: [7, 8, 9, 17, 18, 19],
    options: null
  };

  // 2. DOM Elements
  const statusPill = document.getElementById("statusPill");
  const themeToggle = document.getElementById("themeToggle");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const viewSections = document.querySelectorAll(".view-section");

  // Single Predict Controls
  const routeSelect = document.getElementById("routeSelect");
  const dateInput = document.getElementById("dateInput");
  const hourSlider = document.getElementById("hourSlider");
  const hourDisplay = document.getElementById("hourDisplay");
  const weatherSegments = document.querySelectorAll("#weatherSegments .segmented-option");
  const busTypeSegments = document.querySelectorAll("#busTypeSegments .segmented-option");
  const holidayToggle = document.getElementById("holidayToggle");
  const predictForm = document.getElementById("predictForm");
  const btnPredict = document.getElementById("btnPredict");

  // Derived Indicators
  const derivedDay = document.getElementById("derivedDay");
  const derivedWeekend = document.getElementById("derivedWeekend");
  const derivedPeak = document.getElementById("derivedPeak");
  const derivedWeek = document.getElementById("derivedWeek");

  // Output Elements
  const emptyState = document.getElementById("predictionEmptyState");
  const resultCard = document.getElementById("predictionResults");
  const outPassengerCount = document.getElementById("outPassengerCount");
  const outDemandBadge = document.getElementById("outDemandBadge");
  const outRecText = document.getElementById("outRecText");
  const outCapFill = document.getElementById("outCapFill");
  const outCapLabel = document.getElementById("outCapLabel");
  const outFeatureRoute = document.getElementById("outFeatureRoute");
  const outFeatureTime = document.getElementById("outFeatureTime");
  const outFeatureWeather = document.getElementById("outFeatureWeather");

  // Simulation Controls
  const simRoute = document.getElementById("simRoute");
  const simDate = document.getElementById("simDate");
  const simWeather = document.getElementById("simWeather");
  const simBusType = document.getElementById("simBusType");
  const btnRunSimulation = document.getElementById("btnRunSimulation");
  const simPeakHourVal = document.getElementById("simPeakHourVal");
  const simDailyTotalVal = document.getElementById("simDailyTotalVal");
  const simHighDemandCount = document.getElementById("simHighDemandCount");
  const simFleetRecommendation = document.getElementById("simFleetRecommendation");

  // Route Comparison Controls
  const compDate = document.getElementById("compDate");
  const btnRunComparison = document.getElementById("btnRunComparison");

  // Benchmark Container
  const benchmarkTableBody = document.getElementById("benchmarkTableBody");
  const selectedModelTitle = document.getElementById("selectedModelTitle");

  // Presets
  const presetChips = document.querySelectorAll(".preset-chip");

  // -------------------------------------------------------------
  // 3. Health Check & Options Initialization
  // -------------------------------------------------------------
  async function initBackendConnection() {
    await window.apiService.checkHealth();
    const options = await window.apiService.getOptions();
    state.options = options;
    if (options.peak_hours) {
      state.peakHours = options.peak_hours;
    }

    // Populate route selectors
    populateRoutes(routeSelect, options.routes, "70");
    populateRoutes(simRoute, options.routes, "70");

    // Populate simulation dropdowns
    populateSelect(simWeather, options.weather, "Clear");
    populateSelect(simBusType, options.bus_types, "Express");

    // Set initial dates
    dateInput.value = state.selectedDate;
    simDate.value = state.selectedDate;
    compDate.value = state.selectedDate;

    updateDerivedIndicators();
    loadBenchmarks();
    runAnalyticsDashboard();
  }

  function populateRoutes(selectElem, routes, defaultVal) {
    if (!selectElem) return;
    selectElem.innerHTML = "";
    routes.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r;
      opt.textContent = `Route ${r}`;
      if (r === defaultVal) opt.selected = true;
      selectElem.appendChild(opt);
    });
  }

  function populateSelect(selectElem, items, defaultVal) {
    if (!selectElem) return;
    selectElem.innerHTML = "";
    items.forEach(i => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      if (i === defaultVal) opt.selected = true;
      selectElem.appendChild(opt);
    });
  }

  // -------------------------------------------------------------
  // 4. UI Events & Tab Switching
  // -------------------------------------------------------------
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetView = btn.getAttribute("data-tab");
      tabButtons.forEach(b => b.classList.remove("active"));
      viewSections.forEach(v => v.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(targetView).classList.add("active");

      if (targetView === "viewSimulation") {
        runHourlySimulation();
      } else if (targetView === "viewComparison") {
        runRouteComparison();
      } else if (targetView === "viewAnalytics") {
        runAnalyticsDashboard();
      }
    });
  });

  if (themeToggle) {
    themeToggle.style.display = "none";
  }

  // Time Slider Change
  hourSlider.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    state.selectedHour = val;
    const period = val >= 12 ? "PM" : "AM";
    const displayH = val % 12 === 0 ? 12 : val % 12;
    hourDisplay.textContent = `${displayH}:00 ${period}`;
    updateDerivedIndicators();
  });

  // Date Change
  dateInput.addEventListener("change", (e) => {
    state.selectedDate = e.target.value;
    updateDerivedIndicators();
  });

  // Route Change
  routeSelect.addEventListener("change", (e) => {
    state.selectedRoute = e.target.value;
  });

  // Weather Segment Click
  weatherSegments.forEach(seg => {
    seg.addEventListener("click", () => {
      weatherSegments.forEach(s => s.classList.remove("active"));
      seg.classList.add("active");
      state.selectedWeather = seg.getAttribute("data-val");
    });
  });

  // Bus Type Segment Click
  busTypeSegments.forEach(seg => {
    seg.addEventListener("click", () => {
      busTypeSegments.forEach(s => s.classList.remove("active"));
      seg.classList.add("active");
      state.selectedBusType = seg.getAttribute("data-val");
    });
  });

  // Holiday Toggle
  holidayToggle.addEventListener("change", (e) => {
    state.isHoliday = e.target.checked ? 1 : 0;
  });

  // Presets Bar Handling
  presetChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const pRoute = chip.getAttribute("data-route");
      const pHour = parseInt(chip.getAttribute("data-hour"), 10);
      const pWeather = chip.getAttribute("data-weather");
      const pBus = chip.getAttribute("data-bus");

      routeSelect.value = pRoute;
      state.selectedRoute = pRoute;

      hourSlider.value = pHour;
      state.selectedHour = pHour;
      const period = pHour >= 12 ? "PM" : "AM";
      const displayH = pHour % 12 === 0 ? 12 : pHour % 12;
      hourDisplay.textContent = `${displayH}:00 ${period}`;

      weatherSegments.forEach(s => {
        s.classList.toggle("active", s.getAttribute("data-val") === pWeather);
      });
      state.selectedWeather = pWeather;

      busTypeSegments.forEach(s => {
        s.classList.toggle("active", s.getAttribute("data-val") === pBus);
      });
      state.selectedBusType = pBus;

      updateDerivedIndicators();
      triggerSinglePrediction();
    });
  });

  // -------------------------------------------------------------
  // 5. Derived Feature Calculation & Realtime Badges
  // -------------------------------------------------------------
  function updateDerivedIndicators() {
    const d = new Date(state.selectedDate + "T00:00:00");
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[d.getDay()];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const isPeak = state.peakHours.includes(state.selectedHour);

    derivedDay.innerHTML = `<strong>Day:</strong> ${dayName}`;
    derivedWeekend.innerHTML = `<strong>Weekend:</strong> ${isWeekend ? "Yes" : "No"}`;
    derivedPeak.innerHTML = `<strong>Status:</strong> <span class="badge-tag ${isPeak ? 'peak' : 'offpeak'}">${isPeak ? 'Peak Hour' : 'Off-Peak'}</span>`;
    
    // ISO Week Calculation
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
    derivedWeek.innerHTML = `<strong>Week:</strong> #${weekNumber}`;
  }

  // -------------------------------------------------------------
  // 6. Single Prediction Execution
  // -------------------------------------------------------------
  predictForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await triggerSinglePrediction();
  });

  async function triggerSinglePrediction() {
    btnPredict.disabled = true;
    btnPredict.innerHTML = `<span class="spinner"></span> Computing Inference...`;

    const payload = {
      date: state.selectedDate,
      route_number: state.selectedRoute,
      hour: state.selectedHour,
      weather: state.selectedWeather,
      bus_type: state.selectedBusType,
      holiday: state.isHoliday
    };

    try {
      const res = await window.apiService.predictSingle(payload);
      displaySingleResult(res);
    } catch (err) {
      alert(`Prediction request failed: ${err.message}`);
    } finally {
      btnPredict.disabled = false;
      btnPredict.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m5 12 7-7 7 7"></path>
          <path d="M12 19V5"></path>
        </svg>
        Generate Passenger Demand Prediction
      `;
    }
  }

  function displaySingleResult(response) {
    const { prediction, input_features } = response;

    emptyState.style.display = "none";
    resultCard.classList.add("visible");

    outPassengerCount.textContent = prediction.predicted_passengers;
    
    // Set Demand Badge
    outDemandBadge.className = `demand-badge ${prediction.demand_level.toLowerCase()}`;
    outDemandBadge.textContent = `${prediction.demand_level} Demand`;

    // Operational Recommendation
    outRecText.textContent = prediction.recommendation;

    // Bus Capacity estimation (based on standard 60-seat bus or bus type)
    const nominalCapacity = state.selectedBusType === "Deluxe" ? 50 : 60;
    const capacityPct = Math.min(100, Math.round((prediction.predicted_passengers / nominalCapacity) * 100));
    outCapLabel.textContent = `${capacityPct}% (${prediction.predicted_passengers} / ${nominalCapacity} Seats)`;
    outCapFill.style.width = `${capacityPct}%`;

    if (prediction.demand_level === "High") {
      outCapFill.className = "progress-fill fill-high";
    } else if (prediction.demand_level === "Medium") {
      outCapFill.className = "progress-fill fill-medium";
    } else {
      outCapFill.className = "progress-fill fill-low";
    }

    // Key Features Tag
    const h = input_features.hour;
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;

    outFeatureRoute.textContent = `Route ${input_features.route_number}`;
    outFeatureTime.textContent = `${displayH}:00 ${period}`;
    outFeatureWeather.textContent = `${input_features.weather} • ${input_features.bus_type}`;
  }

  // -------------------------------------------------------------
  // 7. 24-Hour Schedule Simulation
  // -------------------------------------------------------------
  btnRunSimulation.addEventListener("click", () => {
    runHourlySimulation();
  });

  async function runHourlySimulation() {
    btnRunSimulation.disabled = true;
    btnRunSimulation.innerHTML = `<span class="spinner"></span> Simulating...`;

    const route = simRoute.value;
    const date = simDate.value;
    const weather = simWeather.value;
    const busType = simBusType.value;

    const operatingHours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    const items = operatingHours.map(hour => ({
      date: date,
      route_number: route,
      hour: hour,
      weather: weather,
      bus_type: busType,
      holiday: 0
    }));

    try {
      const res = await window.apiService.predictBatch(items);
      const predictions = res.predictions;

      // Render Simulation Chart
      window.chartManager.renderHourlySimulation("simulationChartCanvas", predictions);

      // Compute KPIs
      let maxPassengers = 0;
      let peakHour = 8;
      let totalDaily = 0;
      let highCount = 0;

      predictions.forEach(p => {
        totalDaily += p.predicted_passengers;
        if (p.predicted_passengers > maxPassengers) {
          maxPassengers = p.predicted_passengers;
          peakHour = p.hour;
        }
        if (p.demand_level === "High") {
          highCount += 1;
        }
      });

      const pDisplay = peakHour >= 12 ? `${peakHour % 12 === 0 ? 12 : peakHour % 12} PM` : `${peakHour} AM`;
      simPeakHourVal.textContent = `${pDisplay} (${maxPassengers} pax)`;
      simDailyTotalVal.textContent = `${totalDaily.toLocaleString()} Pax`;
      simHighDemandCount.textContent = `${highCount} Hours`;

      // Fleet sizing recommendation
      const requiredBuses = Math.ceil(maxPassengers / 50);
      simFleetRecommendation.textContent = `${requiredBuses} Buses Active`;

    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      btnRunSimulation.disabled = false;
      btnRunSimulation.innerHTML = `Simulate Full Day`;
    }
  }

  // -------------------------------------------------------------
  // 8. Multi-Route Matrix Comparison
  // -------------------------------------------------------------
  btnRunComparison.addEventListener("click", () => {
    runRouteComparison();
  });

  async function runRouteComparison() {
    btnRunComparison.disabled = true;
    btnRunComparison.innerHTML = `<span class="spinner"></span> Comparing...`;

    const date = compDate.value;
    const hours = [7, 8, 9, 12, 15, 17, 18, 19, 21];
    const labels = hours.map(h => `${h >= 12 ? (h % 12 === 0 ? 12 : h % 12) + " PM" : h + " AM"}`);

    const compareRoutes = ["70", "570", "M1", "101", "27B"];
    const allItems = [];

    compareRoutes.forEach(r => {
      hours.forEach(h => {
        allItems.push({
          date: date,
          route_number: r,
          hour: h,
          weather: "Clear",
          bus_type: "Express",
          holiday: 0
        });
      });
    });

    try {
      const res = await window.apiService.predictBatch(allItems);
      const preds = res.predictions;

      const routeDatasets = compareRoutes.map(r => {
        const routeData = preds.filter(p => p.route_number === r);
        return {
          route: r,
          hourlyCounts: routeData.map(d => d.predicted_passengers)
        };
      });

      window.chartManager.renderRouteComparison("comparisonChartCanvas", labels, routeDatasets);

    } catch (err) {
      console.error("Comparison error:", err);
    } finally {
      btnRunComparison.disabled = false;
      btnRunComparison.innerHTML = `Compare Routes`;
    }
  }

  // -------------------------------------------------------------
  // 9. Model Benchmarks Loader
  // -------------------------------------------------------------
  async function loadBenchmarks() {
    const data = await window.apiService.getModelInfo();
    if (data.selected_model && selectedModelTitle) {
      selectedModelTitle.textContent = data.selected_model;
    }

    if (data.comparison && benchmarkTableBody) {
      benchmarkTableBody.innerHTML = "";
      data.comparison.forEach(m => {
        const isSelected = m.Model.includes("Linear Regression");
        const tr = document.createElement("tr");
        if (isSelected) tr.className = "highlighted";

        tr.innerHTML = `
          <td>
            <strong>${m.Model}</strong>
            ${isSelected ? '<span class="badge-winner">Active Production Model</span>' : ''}
          </td>
          <td><strong>${m["R2 Score"]}</strong></td>
          <td>${m.MAE}</td>
          <td>${m.RMSE}</td>
          <td>${isSelected ? 'Optimal for Real-Time Low Latency (<2ms)' : 'Evaluated'}</td>
        `;
        benchmarkTableBody.appendChild(tr);
      });
    }
  }

  // -------------------------------------------------------------
  // 10. Analytics Dashboard (8 Small Charts)
  // -------------------------------------------------------------
  async function runAnalyticsDashboard() {
    try {
      const data = await window.apiService.getAnalytics();
      window.chartManager.renderAnalyticsDashboard(data);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    }
  }

  // Initialize
  initBackendConnection();
});
