// public/js/mobility.js - Mobility Module JavaScript

let trafficChart;
let congestionChart;
let mobilityData = [];

// Initialize mobility module
async function initMobility() {
    await updateMobilityData();
    setupCharts();
    startDataUpdates(updateMobilityData, 5000);
}

// Update mobility data
async function updateMobilityData() {
    try {
        const response = await fetch('/api/traffic');
        const data = await response.json();

        // Update KPIs
        document.getElementById('vehicleDensity').textContent = data.vehicleDensity.toFixed(2) + '%';
        document.getElementById('congestionLevel').textContent = data.congestionLevel.toFixed(2) + '%';
        document.getElementById('trafficFlow').textContent = data.trafficFlow.toFixed(2) + '%';
        document.getElementById('publicTransport').textContent = data.publicTransportUsage.toFixed(2) + '%';

        // Store data
        mobilityData.push(data);
        if (mobilityData.length > 12) mobilityData.shift();

        // Update charts
        updateCharts();

        // Update table
        updateDataTable(data);

    } catch (error) {
        console.error('Failed to update mobility data:', error);
    }
}

// Setup charts
function setupCharts() {
    // Traffic Pattern Chart
    const trafficCtx = document.getElementById('trafficChart').getContext('2d');
    trafficChart = new Chart(trafficCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Vehicle Density',
                    data: [],
                    borderColor: '#38bdf8', // Blue
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Traffic Flow',
                    data: [],
                    borderColor: '#4ade80', // Green
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Real-time Traffic Patterns' }
            },
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });

    // Congestion Chart
    const congestionCtx = document.getElementById('congestionChart').getContext('2d');
    congestionChart = new Chart(congestionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Low', 'Moderate', 'High', 'Severe'],
            datasets: [{
                data: [40, 30, 20, 10],
                backgroundColor: [
                    '#4ade80', // Green
                    '#38bdf8', // Blue
                    '#fbbf24', // Amber
                    '#f87171'  // Red
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Congestion Severity' }
            }
        }
    });
}

// Update charts
function updateCharts() {
    if (!trafficChart || !congestionChart) return;

    const timeLabels = mobilityData.map((_, i) => `${i * 5}s ago`);

    trafficChart.data.labels = timeLabels;
    trafficChart.data.datasets[0].data = mobilityData.map(d => d.vehicleDensity);
    trafficChart.data.datasets[1].data = mobilityData.map(d => d.trafficFlow);
    trafficChart.update('none');

    // Randomize doughnut slightly
    congestionChart.data.datasets[0].data = [
        Math.random() * 40 + 20,
        Math.random() * 30 + 10,
        Math.random() * 20 + 5,
        Math.random() * 10
    ];
    congestionChart.update('none');
}

// Update Data Table
function updateDataTable(data) {
    const tableBody = document.getElementById('trafficDataTable');
    const rows = [
        { metric: 'Vehicle Density', value: data.vehicleDensity.toFixed(2) + '%', status: 'Moderate', trend: 'Stable' },
        { metric: 'Congestion Level', value: data.congestionLevel.toFixed(2) + '%', status: 'Low', trend: 'Decreasing' },
        { metric: 'Avg Speed', value: '45 km/h', status: 'Good', trend: 'Increasing' }
    ];

    let html = '';
    rows.forEach(row => {
        html += `
            <tr class="fade-in">
                <td>${row.metric}</td>
                <td>${row.value}</td>
                <td>${row.status}</td>
                <td>${row.trend}</td>
                <td><small class="text-info">Monitor</small></td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initMobility);
