// public/js/environment.js - Environment Module JavaScript

let environmentChart;
let energyChart;
let pollutionChart;
let environmentData = [];

// Initialize environment module
async function initEnvironment() {
    await updateEnvironmentData();
    setupCharts();
    startDataUpdates(updateEnvironmentData, 5000);
}

// Update environment data
async function updateEnvironmentData() {
    try {
        const response = await fetch('/api/environment');
        const data = await response.json();

        // Update header KPIs
        document.getElementById('current-aqi').textContent = data.airQualityIndex.toFixed(2);
        document.getElementById('energy-usage').textContent = formatNumber(data.energyConsumption) + ' kWh';
        document.getElementById('renewable-percent').textContent = data.renewableEnergyPercentage.toFixed(2) + '%';

        // Update KPI cards
        updateKPIs(data);

        // Store data for charts
        environmentData.push(data);
        if (environmentData.length > 12) environmentData.shift();

        // Update charts
        updateCharts();

        // Update data table
        updateDataTable(data);

        // Update pollution analysis
        updatePollutionAnalysis(data);

        // Update alerts
        updateAlerts(data);

    } catch (error) {
        console.error('Failed to update environment data:', error);
    }
}

// Update KPI cards
function updateKPIs(data) {
    // AQI
    document.getElementById('aqi-value').textContent = data.airQualityIndex.toFixed(2);
    const aqiStatus = getAQIStatus(data.airQualityIndex);
    document.getElementById('aqi-status').innerHTML = `
        <span class="aqi-indicator ${aqiStatus.class}"></span>
        <span>${aqiStatus.text}</span>
    `;

    // Temperature
    document.getElementById('temperature-value').textContent = data.temperature.toFixed(2) + '°C';
    document.getElementById('temp-status').textContent = getTemperatureStatus(data.temperature);

    // CO2 Levels
    document.getElementById('co2-value').textContent = data.co2Levels + ' ppm';
    document.getElementById('co2-status').textContent = getCO2Status(data.co2Levels);

    // Rainfall
    document.getElementById('rainfall-value').textContent = data.rainfall + ' mm';
    document.getElementById('rain-status').textContent = getRainfallStatus(data.rainfall);
}

// Get AQI status
function getAQIStatus(aqi) {
    if (aqi <= 50) return { class: 'aqi-good', text: 'Good' };
    if (aqi <= 100) return { class: 'aqi-moderate', text: 'Moderate' };
    if (aqi <= 150) return { class: 'aqi-unhealthy', text: 'Unhealthy' };
    return { class: 'aqi-hazardous', text: 'Hazardous' };
}

// Get temperature status
function getTemperatureStatus(temp) {
    if (temp >= 18 && temp <= 25) return 'Comfortable';
    if (temp > 25) return 'Warm';
    return 'Cool';
}

// Get CO2 status
function getCO2Status(co2) {
    if (co2 < 400) return 'Excellent';
    if (co2 < 600) return 'Good';
    if (co2 < 1000) return 'Moderate';
    return 'High';
}

// Get rainfall status
function getRainfallStatus(rainfall) {
    if (rainfall < 5) return 'Light';
    if (rainfall < 20) return 'Moderate';
    if (rainfall < 50) return 'Heavy';
    return 'Extreme';
}

// Setup charts
function setupCharts() {
    // Environment Trend Chart
    const envCtx = document.getElementById('environmentChart').getContext('2d');
    environmentChart = new Chart(envCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Air Quality Index',
                    data: [],
                    borderColor: '#4ade80', // Green
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: '#f87171', // Red
                    backgroundColor: 'rgba(248, 113, 113, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: 'CO₂ Levels (ppm)',
                    data: [],
                    borderColor: '#c084fc', // Purple
                    backgroundColor: 'rgba(192, 132, 252, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Environmental Metrics Over Time'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'AQI / CO₂'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });

    // Energy Distribution Chart
    const energyCtx = document.getElementById('energyChart').getContext('2d');
    energyChart = new Chart(energyCtx, {
        type: 'doughnut',
        data: {
            labels: ['Renewable', 'Coal', 'Natural Gas', 'Nuclear', 'Hydro'],
            datasets: [{
                data: [38, 25, 20, 12, 5],
                backgroundColor: [
                    '#4ade80', // Green
                    '#94a3b8', // Slate
                    '#fbbf24', // Amber
                    '#38bdf8', // Blue
                    '#818cf8'  // Indigo
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Energy Source Distribution'
                }
            }
        }
    });

    // Pollution Source Chart
    const pollCtx = document.getElementById('pollutionChart').getContext('2d');
    pollutionChart = new Chart(pollCtx, {
        type: 'bar',
        data: {
            labels: ['Transport', 'Industry', 'Energy', 'Agriculture', 'Residential'],
            datasets: [{
                label: 'Pollution Contribution (%)',
                data: [35, 28, 22, 10, 5],
                backgroundColor: [
                    '#f87171', // Red
                    '#fbbf24', // Amber
                    '#c084fc', // Purple
                    '#4ade80', // Green
                    '#38bdf8'  // Blue
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Pollution Source Analysis'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 40,
                    title: {
                        display: true,
                        text: 'Contribution (%)'
                    }
                }
            }
        }
    });
}

// Update charts
function updateCharts() {
    if (!environmentChart || !energyChart || !pollutionChart) return;

    const now = new Date();
    const timeLabels = environmentData.map((_, i) => `${i * 5}s ago`);

    // Update environment chart
    environmentChart.data.labels = timeLabels;
    environmentChart.data.datasets[0].data = environmentData.map(d => d.airQualityIndex);
    environmentChart.data.datasets[1].data = environmentData.map(d => d.temperature);
    environmentChart.data.datasets[2].data = environmentData.map(d => d.co2Levels);
    environmentChart.update('none');

    // Update energy chart with latest data
    const current = environmentData[environmentData.length - 1];
    energyChart.data.datasets[0].data = [
        current.renewableEnergyPercentage,
        25 - (current.renewableEnergyPercentage - 38),
        20,
        12,
        5
    ];
    energyChart.update('none');

    // Update pollution chart based on AQI
    const aqiImpact = current.airQualityIndex / 100;
    pollutionChart.data.datasets[0].data = [
        35 * aqiImpact,
        28 * aqiImpact,
        22 * aqiImpact,
        10 * aqiImpact,
        5 * aqiImpact
    ];
    pollutionChart.update('none');
}

// Update data table
function updateDataTable(data) {
    const tableBody = document.getElementById('environmentDataTable');

    const rows = [
        {
            parameter: 'Air Quality Index',
            value: data.airQualityIndex.toFixed(2),
            change: getRandomChange(-5, 5),
            status: getAQIStatus(data.airQualityIndex).text,
            health: getHealthImpact(data.airQualityIndex),
            recommendation: getAQIRecommendation(data.airQualityIndex)
        },
        {
            parameter: 'Temperature',
            value: data.temperature.toFixed(2) + '°C',
            change: getRandomChange(-2, 2) + '°C',
            status: getTemperatureStatus(data.temperature),
            health: 'Comfortable range',
            recommendation: 'Normal'
        },
        {
            parameter: 'CO₂ Levels',
            value: data.co2Levels + ' ppm',
            change: getRandomChange(-10, 10) + ' ppm',
            status: getCO2Status(data.co2Levels),
            health: getCO2HealthImpact(data.co2Levels),
            recommendation: getCO2Recommendation(data.co2Levels)
        },
        {
            parameter: 'Humidity',
            value: data.humidity + '%',
            change: getRandomChange(-3, 3) + '%',
            status: data.humidity >= 40 && data.humidity <= 60 ? 'Ideal' : 'Check',
            health: 'Comfortable',
            recommendation: data.humidity < 40 ? 'Consider humidifier' : 'Normal'
        },
        {
            parameter: 'Rainfall (24h)',
            value: data.rainfall + ' mm',
            change: getRandomChange(-5, 5) + ' mm',
            status: getRainfallStatus(data.rainfall),
            health: 'Positive for air quality',
            recommendation: data.rainfall > 50 ? 'Flood watch' : 'Normal'
        },
        {
            parameter: 'Energy Consumption',
            value: formatNumber(data.energyConsumption) + ' kWh',
            change: getRandomChange(-100, 100) + ' kWh',
            status: data.energyConsumption > 9000 ? 'High' : 'Normal',
            health: 'Indirect impact',
            recommendation: data.energyConsumption > 9000 ? 'Consider conservation' : 'Efficient'
        }
    ];

    let html = '';
    rows.forEach(row => {
        const statusClass = row.status === 'Good' || row.status === 'Ideal' ? 'text-success' :
            row.status === 'Moderate' || row.status === 'Normal' ? 'text-warning' : 'text-danger';

        html += `
            <tr class="fade-in">
                <td><strong>${row.parameter}</strong></td>
                <td>${row.value}</td>
                <td>${row.change}</td>
                <td class="${statusClass}">${row.status}</td>
                <td><small>${row.health}</small></td>
                <td><small class="text-info">${row.recommendation}</small></td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

// Update pollution analysis
function updatePollutionAnalysis(data) {
    const sourcesContainer = document.getElementById('pollutionSources');
    const impactContainer = document.getElementById('environment-impact');

    // Calculate pollution sources based on current data
    const trafficImpact = Math.min(40, data.airQualityIndex / 3);
    const industryImpact = Math.min(30, data.energyConsumption / 400);
    const energyImpact = Math.min(25, (100 - data.renewableEnergyPercentage) / 4);

    sourcesContainer.innerHTML = `
        <div class="mb-2">
            <div class="d-flex justify-content-between">
                <span>🚗 Transportation</span>
                <span class="badge bg-danger">${trafficImpact.toFixed(1)}%</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-danger" style="width: ${trafficImpact}%"></div>
            </div>
        </div>
        <div class="mb-2">
            <div class="d-flex justify-content-between">
                <span>🏭 Industry</span>
                <span class="badge bg-warning">${industryImpact.toFixed(1)}%</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-warning" style="width: ${industryImpact}%"></div>
            </div>
        </div>
        <div class="mb-2">
            <div class="d-flex justify-content-between">
                <span>⚡ Energy Production</span>
                <span class="badge bg-info">${energyImpact.toFixed(1)}%</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-info" style="width: ${energyImpact}%"></div>
            </div>
        </div>
        <div class="mb-2">
            <div class="d-flex justify-content-between">
                <span>🌾 Agriculture</span>
                <span class="badge bg-success">${(100 - data.humidity) / 10}%</span>
            </div>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-success" style="width: ${(100 - data.humidity) / 10}%"></div>
            </div>
        </div>
    `;

    // Rule-Based Predictive Analytics
    let impactMessage = '';
    if (data.airQualityIndex < 50) {
        impactMessage = 'Air quality is excellent. Current trends suggest maintaining current emission controls.';
    } else if (data.airQualityIndex < 100) {
        impactMessage = 'Air quality is moderate. If traffic increases by 20%, AQI could deteriorate by 15-20 points.';
    } else {
        impactMessage = 'Air quality needs attention. Consider implementing emergency pollution control measures.';
    }

    impactContainer.innerHTML = `
        <div class="alert alert-info">
            <strong>Predictive Analysis:</strong> ${impactMessage}
            <div class="mt-2">
                <small>
                    <strong>Rule-Based Logic:</strong> If traffic increases → pollution increases (0.3x multiplier). 
                    If renewable energy increases → pollution decreases (0.2x multiplier).
                </small>
            </div>
        </div>
    `;
}

// Update alerts
function updateAlerts(data) {
    const alertsContainer = document.getElementById('environmentAlerts');
    const alerts = [];

    if (data.airQualityIndex > 100) {
        alerts.push({
            type: 'danger',
            title: 'Poor Air Quality Alert',
            message: `AQI is ${data.airQualityIndex}. Consider limiting outdoor activities.`
        });
    }

    if (data.co2Levels > 800) {
        alerts.push({
            type: 'warning',
            title: 'Elevated CO₂ Levels',
            message: `CO₂ levels at ${data.co2Levels} ppm. Consider improving ventilation.`
        });
    }

    if (data.energyConsumption > 9000) {
        alerts.push({
            type: 'warning',
            title: 'High Energy Consumption',
            message: `Energy usage at ${formatNumber(data.energyConsumption)} kWh. Consider conservation measures.`
        });
    }

    if (data.renewableEnergyPercentage < 30) {
        alerts.push({
            type: 'info',
            title: 'Low Renewable Energy',
            message: `Only ${data.renewableEnergyPercentage}% from renewable sources.`
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            type: 'success',
            title: 'All Systems Normal',
            message: 'Environmental parameters within acceptable ranges.'
        });
    }

    let html = '';
    alerts.forEach(alert => {
        const alertClass = alert.type === 'danger' ? 'alert-danger' :
            alert.type === 'warning' ? 'alert-warning' :
                alert.type === 'info' ? 'alert-info' : 'alert-success';

        html += `
            <div class="alert ${alertClass} alert-card fade-in">
                <h6>${alert.title}</h6>
                <p class="mb-0">${alert.message}</p>
            </div>
        `;
    });

    alertsContainer.innerHTML = html;
}

// Helper functions
function getRandomChange(min, max) {
    const change = Math.floor(Math.random() * (max - min + 1)) + min;
    return change > 0 ? `+${change}` : change;
}

function getHealthImpact(aqi) {
    if (aqi <= 50) return 'Minimal impact';
    if (aqi <= 100) return 'Moderate - sensitive groups affected';
    if (aqi <= 150) return 'Unhealthy for sensitive groups';
    return 'Health alert - everyone affected';
}

function getAQIRecommendation(aqi) {
    if (aqi <= 50) return 'Continue normal activities';
    if (aqi <= 100) return 'Sensitive groups reduce outdoor exertion';
    if (aqi <= 150) return 'Everyone reduce prolonged outdoor exertion';
    return 'Avoid outdoor activities';
}

function getCO2HealthImpact(co2) {
    if (co2 < 400) return 'No health effects';
    if (co2 < 1000) return 'Possible drowsiness';
    return 'Headaches, poor concentration';
}

function getCO2Recommendation(co2) {
    if (co2 < 400) return 'Excellent ventilation';
    if (co2 < 1000) return 'Consider opening windows';
    return 'Improve ventilation immediately';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initEnvironment);