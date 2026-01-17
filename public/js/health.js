// public/js/health.js - Health Module JavaScript

let healthChart;
let hospitalChart;
let healthData = [];

// Initialize health module
async function initHealth() {
    await updateHealthData();
    setupCharts();
    startDataUpdates(updateHealthData, 5000);
}

// Update health data
async function updateHealthData() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();

        // Update header KPIs
        document.getElementById('health-index').textContent = data.publicHealthIndex.toFixed(2);
        document.getElementById('respiratory-cases').textContent = data.respiratoryCases.toFixed(2);
        document.getElementById('hospital-load').textContent = data.hospitalLoad.toFixed(2) + '%';
        document.getElementById('vaccination-rate').textContent = data.vaccinationRate.toFixed(2) + '%';

        // Update KPI cards
        updateKPIs(data);

        // Store data for charts
        healthData.push(data);
        if (healthData.length > 12) healthData.shift();

        // Update charts
        updateCharts(data);

        // Update data table
        updateDataTable(data);

        // Update health risks
        updateHealthRisks(data);

        // Update hospital capacity
        updateHospitalCapacity(data);

        // Update alerts
        updateAlerts(data);

    } catch (error) {
        console.error('Failed to update health data:', error);
    }
}

// Update KPI cards
function updateKPIs(data) {
    // Pollution Risk
    document.getElementById('pollution-risk').textContent = data.pollutionRiskLevel.toFixed(2) + '%';
    const riskStatus = getRiskStatus(data.pollutionRiskLevel);
    document.getElementById('risk-status').innerHTML = `
        <span class="risk-indicator ${riskStatus.class}"></span>
        <span>${riskStatus.text}</span>
    `;

    // Hospital Load
    document.getElementById('hospital-occupancy').textContent = data.hospitalLoad.toFixed(2) + '%';
    document.getElementById('hospital-status').textContent = getHospitalStatus(data.hospitalLoad);

    // Public Health Index
    document.getElementById('public-health-index').textContent = data.publicHealthIndex.toFixed(2);
    document.getElementById('health-index-status').textContent = getHealthIndexStatus(data.publicHealthIndex);

    // Life Expectancy
    document.getElementById('life-expectancy').textContent = data.averageLifeExpectancy.toFixed(2) + ' yrs';
    document.getElementById('life-status').textContent = getLifeExpectancyStatus(data.averageLifeExpectancy);
}

// Get risk status
function getRiskStatus(risk) {
    if (risk < 25) return { class: 'risk-low', text: 'Low Risk' };
    if (risk < 50) return { class: 'risk-medium', text: 'Medium Risk' };
    return { class: 'risk-high', text: 'High Risk' };
}

// Get hospital status
function getHospitalStatus(load) {
    if (load < 60) return 'Normal';
    if (load < 80) return 'Moderate';
    if (load < 90) return 'High';
    return 'Critical';
}

// Get health index status
function getHealthIndexStatus(index) {
    if (index >= 80) return 'Excellent';
    if (index >= 70) return 'Good';
    if (index >= 60) return 'Fair';
    return 'Needs Improvement';
}

// Get life expectancy status
function getLifeExpectancyStatus(age) {
    if (age >= 78) return 'Above Average';
    if (age >= 75) return 'Average';
    return 'Below Average';
}

// Setup charts
function setupCharts() {
    // Health Trend Chart
    const healthCtx = document.getElementById('healthChart').getContext('2d');
    healthChart = new Chart(healthCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Pollution Risk Level',
                    data: [],
                    borderColor: '#f87171', // Red
                    backgroundColor: 'rgba(248, 113, 113, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Public Health Index',
                    data: [],
                    borderColor: '#4ade80', // Green
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: 'Respiratory Cases',
                    data: [],
                    borderColor: '#38bdf8', // Blue
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
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
                    text: 'Public Health Metrics Over Time'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Risk Level / Cases'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Health Index'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });

    // Hospital Capacity Chart
    const hospitalCtx = document.getElementById('hospitalChart').getContext('2d');
    hospitalChart = new Chart(hospitalCtx, {
        type: 'doughnut',
        data: {
            labels: ['Occupied', 'Available', 'Reserved'],
            datasets: [{
                data: [65, 30, 5],
                backgroundColor: [
                    '#f87171', // Red
                    '#4ade80', // Green
                    '#fbbf24'  // Amber
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
                    text: 'Hospital Bed Occupancy'
                }
            }
        }
    });
}

// Update charts
function updateCharts(currentData) {
    if (!healthChart || !hospitalChart) return;

    const timeLabels = healthData.map((_, i) => `${i * 5}s ago`);

    // Update health chart
    healthChart.data.labels = timeLabels;
    healthChart.data.datasets[0].data = healthData.map(d => d.pollutionRiskLevel);
    healthChart.data.datasets[1].data = healthData.map(d => d.publicHealthIndex);
    healthChart.data.datasets[2].data = healthData.map(d => d.respiratoryCases);
    healthChart.update('none');

    // Update hospital chart
    hospitalChart.data.datasets[0].data = [
        currentData.hospitalLoad,
        100 - currentData.hospitalLoad,
        5
    ];
    hospitalChart.update('none');
}

// Update data table
function updateDataTable(data) {
    const tableBody = document.getElementById('healthDataTable');

    const rows = [
        {
            metric: 'Pollution Health Risk',
            value: data.pollutionRiskLevel.toFixed(2) + '%',
            trend: getTrend(data.pollutionRiskLevel, 30),
            risk: getRiskStatus(data.pollutionRiskLevel).text,
            correlation: 'Direct correlation with air quality',
            action: getRiskAction(data.pollutionRiskLevel)
        },
        {
            metric: 'Hospital Occupancy',
            value: data.hospitalLoad.toFixed(2) + '%',
            trend: getTrend(data.hospitalLoad, 65),
            risk: getHospitalStatus(data.hospitalLoad),
            correlation: 'Indirect correlation with pollution',
            action: getHospitalAction(data.hospitalLoad)
        },
        {
            metric: 'Respiratory Cases',
            value: data.respiratoryCases.toFixed(2),
            trend: getTrend(data.respiratoryCases, 100),
            risk: data.respiratoryCases > 150 ? 'High' : data.respiratoryCases > 100 ? 'Medium' : 'Low',
            correlation: 'Strong correlation with pollution levels',
            action: data.respiratoryCases > 120 ? 'Increase respiratory care capacity' : 'Monitor'
        },
        {
            metric: 'Public Health Index',
            value: data.publicHealthIndex.toFixed(2),
            trend: getTrend(data.publicHealthIndex, 75, true),
            risk: getHealthIndexStatus(data.publicHealthIndex),
            correlation: 'Composite metric including pollution impact',
            action: data.publicHealthIndex < 70 ? 'Improve public health initiatives' : 'Maintain current programs'
        },
        {
            metric: 'Vaccination Coverage',
            value: data.vaccinationRate.toFixed(2) + '%',
            trend: getTrend(data.vaccinationRate, 85, true),
            risk: data.vaccinationRate > 80 ? 'Low' : data.vaccinationRate > 70 ? 'Medium' : 'High',
            correlation: 'Indirect impact on public health',
            action: data.vaccinationRate < 75 ? 'Increase vaccination campaigns' : 'Adequate coverage'
        },
        {
            metric: 'Life Expectancy',
            value: data.averageLifeExpectancy.toFixed(2) + ' years',
            trend: 'Stable',
            risk: getLifeExpectancyStatus(data.averageLifeExpectancy),
            correlation: 'Long-term impact of environmental factors',
            action: 'Continue preventive healthcare programs'
        }
    ];

    let html = '';
    rows.forEach(row => {
        const riskClass = row.risk.includes('Low') || row.risk.includes('Excellent') ? 'text-success' :
            row.risk.includes('Medium') || row.risk.includes('Good') || row.risk.includes('Normal') ? 'text-warning' : 'text-danger';

        html += `
            <tr class="fade-in">
                <td><strong>${row.metric}</strong></td>
                <td>${row.value}</td>
                <td>${row.trend}</td>
                <td class="${riskClass}">${row.risk}</td>
                <td><small>${row.correlation}</small></td>
                <td><small class="text-info">${row.action}</small></td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

// Update health risks
function updateHealthRisks(data) {
    const risksContainer = document.getElementById('healthRisks');
    const measuresContainer = document.getElementById('preventiveMeasures');

    // Rule-Based Predictive Analytics
    const pollutionRisk = data.pollutionRiskLevel;
    let riskLevel = '';
    let healthRisks = [];
    let measures = [];

    if (pollutionRisk < 25) {
        riskLevel = 'Low Risk';
        healthRisks = [
            { name: 'Asthma exacerbation', probability: 'Low' },
            { name: 'Respiratory infections', probability: 'Low' },
            { name: 'Cardiovascular issues', probability: 'Very Low' }
        ];
        measures = [
            'Continue normal outdoor activities',
            'Maintain current lifestyle',
            'Regular health checkups'
        ];
    } else if (pollutionRisk < 50) {
        riskLevel = 'Moderate Risk';
        healthRisks = [
            { name: 'Asthma exacerbation', probability: 'Moderate' },
            { name: 'Respiratory infections', probability: 'Moderate' },
            { name: 'Eye irritation', probability: 'Low' },
            { name: 'Cardiovascular stress', probability: 'Low' }
        ];
        measures = [
            'Sensitive groups limit outdoor activities',
            'Use air purifiers if needed',
            'Stay hydrated',
            'Monitor air quality alerts'
        ];
    } else {
        riskLevel = 'High Risk';
        healthRisks = [
            { name: 'Asthma attacks', probability: 'High' },
            { name: 'Bronchitis risk', probability: 'High' },
            { name: 'Heart strain', probability: 'Moderate' },
            { name: 'Reduced lung function', probability: 'Moderate' },
            { name: 'Premature mortality', probability: 'Elevated' }
        ];
        measures = [
            'Limit outdoor activities',
            'Use N95 masks outdoors',
            'Keep windows closed',
            'Use air purifiers',
            'Seek medical attention if symptomatic'
        ];
    }

    // Update risks display
    let risksHtml = `
        <div class="alert ${pollutionRisk < 25 ? 'alert-success' : pollutionRisk < 50 ? 'alert-warning' : 'alert-danger'}">
            <strong>${riskLevel}</strong> - Pollution health impact probability: ${pollutionRisk.toFixed(2)}%
        </div>
    `;

    healthRisks.forEach(risk => {
        const probClass = risk.probability === 'High' ? 'badge bg-danger' :
            risk.probability === 'Moderate' ? 'badge bg-warning' : 'badge bg-success';

        risksHtml += `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${risk.name}</span>
                <span class="${probClass}">${risk.probability}</span>
            </div>
        `;
    });

    risksContainer.innerHTML = risksHtml;

    // Update preventive measures
    let measuresHtml = '';
    measures.forEach((measure, index) => {
        measuresHtml += `
            <li class="list-group-item">
                <span class="badge bg-primary me-2">${index + 1}</span>
                ${measure}
            </li>
        `;
    });

    measuresContainer.innerHTML = measuresHtml;
}

// Update hospital capacity
function updateHospitalCapacity(data) {
    const hospitalLoad = data.hospitalLoad;

    // Calculate department loads
    const emergencyLoad = Math.min(95, hospitalLoad + 10);
    const icuLoad = Math.min(90, hospitalLoad + 5);
    const wardLoad = Math.min(85, hospitalLoad - 5);

    // Update emergency department
    document.getElementById('emergency-load').textContent = emergencyLoad.toFixed(2) + '%';
    document.getElementById('emergency-bed').style.width = emergencyLoad + '%';

    // Update ICU
    document.getElementById('icu-load').textContent = icuLoad.toFixed(2) + '%';
    document.getElementById('icu-bed').style.width = icuLoad + '%';

    // Update general wards
    document.getElementById('ward-load').textContent = wardLoad.toFixed(2) + '%';
    document.getElementById('ward-bed').style.width = wardLoad + '%';
}

// Update alerts
function updateAlerts(data) {
    const alertsContainer = document.getElementById('healthAlerts');
    const alerts = [];

    if (data.pollutionRiskLevel > 50) {
        alerts.push({
            type: 'danger',
            title: 'High Pollution Health Risk',
            message: `Pollution health risk at ${data.pollutionRiskLevel.toFixed(2)}%. Sensitive groups should take precautions.`
        });
    }

    if (data.hospitalLoad > 80) {
        alerts.push({
            type: 'warning',
            title: 'High Hospital Occupancy',
            message: `Hospital load at ${data.hospitalLoad.toFixed(2)}%. Consider activating emergency protocols.`
        });
    }

    if (data.respiratoryCases > 150) {
        alerts.push({
            type: 'danger',
            title: 'Elevated Respiratory Cases',
            message: `${data.respiratoryCases.toFixed(2)} respiratory cases reported today. Increase respiratory care capacity.`
        });
    }

    if (data.publicHealthIndex < 70) {
        alerts.push({
            type: 'warning',
            title: 'Public Health Index Below Target',
            message: `Public Health Index at ${data.publicHealthIndex.toFixed(2)}. Review public health initiatives.`
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            type: 'success',
            title: 'Public Health Status Normal',
            message: 'All health parameters within acceptable ranges. No immediate action required.'
        });
    }

    let html = '';
    alerts.forEach(alert => {
        const alertClass = alert.type === 'danger' ? 'alert-danger' :
            alert.type === 'warning' ? 'alert-warning' : 'alert-success';

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
function getTrend(value, threshold, higherIsBetter = false) {
    const random = Math.random();
    if (random < 0.33) return '↗ Increasing';
    if (random < 0.66) return '↘ Decreasing';
    return '→ Stable';
}

function getRiskAction(risk) {
    if (risk < 25) return 'Continue monitoring';
    if (risk < 50) return 'Alert sensitive populations';
    return 'Issue public health advisory';
}

function getHospitalAction(load) {
    if (load < 70) return 'Normal operations';
    if (load < 85) return 'Prepare additional resources';
    return 'Activate emergency protocols';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initHealth);