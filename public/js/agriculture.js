// public/js/agriculture.js - Agriculture Module JavaScript

let agricultureChart;
let waterChart;
let agricultureData = [];

// Initialize agriculture module
async function initAgriculture() {
    await updateAgricultureData();
    setupCharts();
    startDataUpdates(updateAgricultureData, 5000);
}

// Update agriculture data
async function updateAgricultureData() {
    try {
        const response = await fetch('/api/agriculture');
        const data = await response.json();

        // Update header KPIs
        document.getElementById('crop-yield-index').textContent = data.cropYieldIndex.toFixed(2);
        document.getElementById('food-stability').textContent = data.foodSupplyStability.toFixed(2) + '%';
        document.getElementById('water-efficiency').textContent = data.waterUsageEfficiency.toFixed(2) + '%';
        document.getElementById('local-production').textContent = data.localFoodProduction.toFixed(2) + '%';

        // Update KPI cards
        updateKPIs(data);

        // Store data for charts
        agricultureData.push(data);
        if (agricultureData.length > 12) agricultureData.shift();

        // Update charts
        updateCharts(data);

        // Update data table
        updateDataTable(data);

        // Update crop performance
        updateCropPerformance(data);

        // Update food supply chain
        updateFoodSupplyChain(data);

        // Update alerts
        updateAlerts(data);

    } catch (error) {
        console.error('Failed to update agriculture data:', error);
    }
}

// Update KPI cards
function updateKPIs(data) {
    // Crop Yield
    document.getElementById('crop-yield').textContent = data.cropYieldIndex.toFixed(2);
    document.getElementById('yield-status').textContent = getYieldStatus(data.cropYieldIndex);

    // Food Supply
    document.getElementById('food-supply').textContent = data.foodSupplyStability.toFixed(2) + '%';
    document.getElementById('supply-status').textContent = getSupplyStatus(data.foodSupplyStability);

    // Water Efficiency
    document.getElementById('water-usage').textContent = data.waterUsageEfficiency.toFixed(2) + '%';
    document.getElementById('water-status').textContent = getWaterStatus(data.waterUsageEfficiency);

    // Local Food
    document.getElementById('local-food').textContent = data.localFoodProduction.toFixed(2) + '%';
    document.getElementById('local-status').textContent = getLocalStatus(data.localFoodProduction);
}

// Get yield status
function getYieldStatus(yieldIndex) {
    if (yieldIndex >= 80) return 'Excellent';
    if (yieldIndex >= 70) return 'Good';
    if (yieldIndex >= 60) return 'Moderate';
    return 'Low';
}

// Get supply status
function getSupplyStatus(stability) {
    if (stability >= 85) return 'Very Stable';
    if (stability >= 75) return 'Stable';
    if (stability >= 65) return 'Moderate';
    return 'Unstable';
}

// Get water status
function getWaterStatus(efficiency) {
    if (efficiency >= 75) return 'Highly Efficient';
    if (efficiency >= 65) return 'Efficient';
    if (efficiency >= 55) return 'Moderate';
    return 'Inefficient';
}

// Get local status
function getLocalStatus(localProduction) {
    if (localProduction >= 70) return 'High';
    if (localProduction >= 60) return 'Moderate';
    if (localProduction >= 50) return 'Low';
    return 'Very Low';
}

// Setup charts
function setupCharts() {
    // Agriculture Trend Chart
    const agriCtx = document.getElementById('agricultureChart').getContext('2d');
    agricultureChart = new Chart(agriCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Crop Yield Index',
                    data: [],
                    borderColor: '#fbbf24', // Amber
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Food Supply Stability',
                    data: [],
                    borderColor: '#4ade80', // Green
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Water Efficiency',
                    data: [],
                    borderColor: '#38bdf8', // Blue
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
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
                    text: 'Agricultural Performance Over Time'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Yield & Stability Index'
                    },
                    min: 0,
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Water Efficiency %'
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });

    // Water Distribution Chart
    const waterCtx = document.getElementById('waterChart').getContext('2d');
    waterChart = new Chart(waterCtx, {
        type: 'pie',
        data: {
            labels: ['Smart Irrigation', 'Drip Irrigation', 'Traditional', 'Rain-fed'],
            datasets: [{
                data: [45, 25, 20, 10],
                backgroundColor: [
                    '#4ade80', // Green
                    '#38bdf8', // Blue
                    '#fbbf24', // Amber
                    '#c084fc'  // Purple
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
                    text: 'Agricultural Water Usage Distribution'
                }
            }
        }
    });
}

// Update charts
function updateCharts(currentData) {
    if (!agricultureChart || !waterChart) return;

    const timeLabels = agricultureData.map((_, i) => `${i * 5}s ago`);

    // Update agriculture chart
    agricultureChart.data.labels = timeLabels;
    agricultureChart.data.datasets[0].data = agricultureData.map(d => d.cropYieldIndex);
    agricultureChart.data.datasets[1].data = agricultureData.map(d => d.foodSupplyStability);
    agricultureChart.data.datasets[2].data = agricultureData.map(d => d.waterUsageEfficiency);
    agricultureChart.update('none');

    // Update water chart
    waterChart.data.datasets[0].data = [
        currentData.smartIrrigationCoverage,
        25,
        20,
        10
    ];
    waterChart.update('none');
}

// Update data table
function updateDataTable(data) {
    const tableBody = document.getElementById('agricultureDataTable');

    const rows = [
        {
            metric: 'Crop Yield Index',
            value: data.cropYieldIndex.toFixed(2),
            trend: getYieldTrend(data.cropYieldIndex),
            rainfallImpact: getRainfallImpact(data.cropYieldIndex),
            waterDep: 'High',
            recommendation: getYieldRecommendation(data.cropYieldIndex)
        },
        {
            metric: 'Food Supply Stability',
            value: data.foodSupplyStability.toFixed(2) + '%',
            trend: getStabilityTrend(data.foodSupplyStability),
            rainfallImpact: 'Medium',
            waterDep: 'Medium',
            recommendation: getStabilityRecommendation(data.foodSupplyStability)
        },
        {
            metric: 'Water Usage Efficiency',
            value: data.waterUsageEfficiency.toFixed(2) + '%',
            trend: getEfficiencyTrend(data.waterUsageEfficiency),
            rainfallImpact: 'Direct',
            waterDep: 'Direct',
            recommendation: getEfficiencyRecommendation(data.waterUsageEfficiency)
        },
        {
            metric: 'Smart Irrigation Coverage',
            value: data.smartIrrigationCoverage.toFixed(2) + '%',
            trend: 'Increasing',
            rainfallImpact: 'Reduces dependency',
            waterDep: 'Reduces consumption',
            recommendation: data.smartIrrigationCoverage < 50 ? 'Expand smart irrigation' : 'Maintain'
        },
        {
            metric: 'Local Food Production',
            value: data.localFoodProduction.toFixed(2) + '%',
            trend: getLocalTrend(data.localFoodProduction),
            rainfallImpact: 'Indirect',
            waterDep: 'Medium',
            recommendation: data.localFoodProduction < 60 ? 'Support local farmers' : 'Adequate'
        },
        {
            metric: 'Food Waste Percentage',
            value: data.foodWastePercentage.toFixed(2) + '%',
            trend: 'Decreasing',
            rainfallImpact: 'Low',
            waterDep: 'Indirect',
            recommendation: data.foodWastePercentage > 20 ? 'Improve supply chain' : 'Efficient'
        }
    ];

    let html = '';
    rows.forEach(row => {
        const impactClass = row.rainfallImpact === 'High' || row.rainfallImpact === 'Direct' ? 'text-danger' :
            row.rainfallImpact === 'Medium' ? 'text-warning' : 'text-success';

        html += `
            <tr class="fade-in">
                <td><strong>${row.metric}</strong></td>
                <td>${row.value}</td>
                <td>${row.trend}</td>
                <td class="${impactClass}">${row.rainfallImpact}</td>
                <td>${row.waterDep}</td>
                <td><small class="text-info">${row.recommendation}</small></td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

// Update crop performance
function updateCropPerformance(data) {
    const performanceContainer = document.getElementById('cropPerformance');
    const featuresContainer = document.getElementById('smartFeatures');

    // Rule-Based Predictive Analytics
    const yieldIndex = data.cropYieldIndex;
    let performanceLevel = '';
    let cropMetrics = [];

    if (yieldIndex >= 80) {
        performanceLevel = 'Excellent';
        cropMetrics = [
            { crop: 'Wheat', yield: '95%', status: 'Excellent' },
            { crop: 'Rice', yield: '92%', status: 'Excellent' },
            { crop: 'Corn', yield: '88%', status: 'Good' },
            { crop: 'Vegetables', yield: '85%', status: 'Good' }
        ];
    } else if (yieldIndex >= 70) {
        performanceLevel = 'Good';
        cropMetrics = [
            { crop: 'Wheat', yield: '85%', status: 'Good' },
            { crop: 'Rice', yield: '82%', status: 'Good' },
            { crop: 'Corn', yield: '78%', status: 'Moderate' },
            { crop: 'Vegetables', yield: '75%', status: 'Moderate' }
        ];
    } else {
        performanceLevel = 'Needs Improvement';
        cropMetrics = [
            { crop: 'Wheat', yield: '70%', status: 'Moderate' },
            { crop: 'Rice', yield: '65%', status: 'Low' },
            { crop: 'Corn', yield: '62%', status: 'Low' },
            { crop: 'Vegetables', yield: '68%', status: 'Moderate' }
        ];
    }

    // Update performance display
    let performanceHtml = `
        <div class="alert ${yieldIndex >= 80 ? 'alert-success' : yieldIndex >= 70 ? 'alert-warning' : 'alert-danger'}">
            <strong>${performanceLevel}</strong> - Overall crop yield index: ${yieldIndex.toFixed(2)}
            <div class="mt-2">
                <small>
                    <strong>Rule-Based Analytics:</strong> If rainfall decreases by 20%, crop yield could decrease by ${((100 - yieldIndex) * 0.3).toFixed(2)}%
                </small>
            </div>
        </div>
    `;

    cropMetrics.forEach(crop => {
        const statusClass = crop.status === 'Excellent' ? 'badge bg-success' :
            crop.status === 'Good' ? 'badge bg-info' :
                crop.status === 'Moderate' ? 'badge bg-warning' : 'badge bg-danger';

        performanceHtml += `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${crop.crop}</span>
                <div>
                    <span class="me-2">${crop.yield}</span>
                    <span class="${statusClass}">${crop.status}</span>
                </div>
            </div>
        `;
    });

    performanceContainer.innerHTML = performanceHtml;

    // Update smart features
    const smartFeatures = [
        'IoT Soil Moisture Sensors',
        'Automated Irrigation Systems',
        'Drone-based Crop Monitoring',
        'Predictive Yield Analytics',
        'Climate-Adaptive Crops'
    ];

    let featuresHtml = '';
    smartFeatures.forEach((feature, index) => {
        const enabled = data.smartIrrigationCoverage > (index * 15);

        featuresHtml += `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${feature}</span>
                <span class="badge ${enabled ? 'bg-success' : 'bg-secondary'}">
                    ${enabled ? 'Active' : 'Planned'}
                </span>
            </div>
        `;
    });

    featuresContainer.innerHTML = featuresHtml;
}

// Update food supply chain
function updateFoodSupplyChain(data) {
    const stability = data.foodSupplyStability;

    // Calculate supply days based on stability
    const grainsSupply = Math.min(30, Math.floor(stability / 3));
    const vegetablesSupply = Math.min(14, Math.floor(stability / 7));
    const fruitsSupply = Math.min(10, Math.floor(stability / 10));
    const dairySupply = Math.min(7, Math.floor(stability / 12));

    // Update grains
    document.getElementById('grains-supply').textContent = grainsSupply.toFixed(2) + ' days';
    document.getElementById('grains-bar').style.width = (grainsSupply / 30 * 100) + '%';

    // Update vegetables
    document.getElementById('vegetables-supply').textContent = vegetablesSupply.toFixed(2) + ' days';
    document.getElementById('vegetables-bar').style.width = (vegetablesSupply / 14 * 100) + '%';

    // Update fruits
    document.getElementById('fruits-supply').textContent = fruitsSupply.toFixed(2) + ' days';
    document.getElementById('fruits-bar').style.width = (fruitsSupply / 10 * 100) + '%';

    // Update dairy
    document.getElementById('dairy-supply').textContent = dairySupply.toFixed(2) + ' days';
    document.getElementById('dairy-bar').style.width = (dairySupply / 7 * 100) + '%';
}

// Update alerts
function updateAlerts(data) {
    const alertsContainer = document.getElementById('agricultureAlerts');
    const alerts = [];

    if (data.cropYieldIndex < 65) {
        alerts.push({
            type: 'danger',
            title: 'Low Crop Yield Alert',
            message: `Crop yield index at ${data.cropYieldIndex.toFixed(2)}. Consider agricultural interventions.`
        });
    }

    if (data.foodSupplyStability < 70) {
        alerts.push({
            type: 'warning',
            title: 'Food Supply Stability Concern',
            message: `Food supply stability at ${data.foodSupplyStability.toFixed(2)}%. Monitor supply chain.`
        });
    }

    if (data.waterUsageEfficiency < 60) {
        alerts.push({
            type: 'warning',
            title: 'Water Efficiency Low',
            message: `Water usage efficiency at ${data.waterUsageEfficiency.toFixed(2)}%. Consider irrigation improvements.`
        });
    }

    if (data.localFoodProduction < 55) {
        alerts.push({
            type: 'info',
            title: 'Low Local Food Production',
            message: `Only ${data.localFoodProduction.toFixed(2)}% food produced locally. Support local agriculture.`
        });
    }

    if (data.foodWastePercentage > 20) {
        alerts.push({
            type: 'danger',
            title: 'High Food Waste',
            message: `Food waste at ${data.foodWastePercentage.toFixed(2)}%. Improve supply chain efficiency.`
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            type: 'success',
            title: 'Agricultural Systems Normal',
            message: 'All agricultural parameters within acceptable ranges. Food security maintained.'
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
function getYieldTrend(yieldIndex) {
    if (yieldIndex >= 75) return '↗ Improving';
    if (yieldIndex >= 65) return '→ Stable';
    return '↘ Declining';
}

function getStabilityTrend(stability) {
    if (stability >= 80) return '↗ Improving';
    if (stability >= 70) return '→ Stable';
    return '↘ Declining';
}

function getEfficiencyTrend(efficiency) {
    if (efficiency >= 70) return '↗ Improving';
    if (efficiency >= 60) return '→ Stable';
    return '↘ Declining';
}

function getLocalTrend(localProduction) {
    if (localProduction >= 65) return '↗ Increasing';
    if (localProduction >= 55) return '→ Stable';
    return '↘ Decreasing';
}

function getRainfallImpact(yieldIndex) {
    const impact = 100 - yieldIndex;
    if (impact > 40) return 'High';
    if (impact > 25) return 'Medium';
    return 'Low';
}

function getYieldRecommendation(yieldIndex) {
    if (yieldIndex >= 80) return 'Continue current practices';
    if (yieldIndex >= 70) return 'Consider fertilization improvements';
    return 'Urgent agricultural intervention needed';
}

function getStabilityRecommendation(stability) {
    if (stability >= 80) return 'Maintain supply chain';
    if (stability >= 70) return 'Monitor supply chain closely';
    return 'Develop contingency plans';
}

function getEfficiencyRecommendation(efficiency) {
    if (efficiency >= 70) return 'Efficient water usage';
    if (efficiency >= 60) return 'Consider irrigation upgrades';
    return 'Urgent water efficiency improvements needed';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAgriculture);