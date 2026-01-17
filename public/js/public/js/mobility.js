// public/js/mobility.js - Mobility Module JavaScript

let trafficChart;
let congestionChart;
let trafficData = [];

async function initMobility() {
    await updateMobilityData();
    setupCharts();
    startDataUpdates(updateMobilityData, 5000);
}

async function updateMobilityData() {
    try {
        const response = await fetch('/api/traffic');
        const data = await response.json();
        
        // Update KPIs
        document.getElementById('vehicleDensity').textContent = data.vehicleDensity + '%';
        document.getElementById('congestionLevel').textContent = data.congestionLevel + '%';
        document.getElementById('trafficFlow').textContent = data.trafficFlow + '%';
        document.getElementById('publicTransport').textContent = data.publicTransportUsage + '%';
        
        // Store data for chart
        trafficData.push(data);
        if (trafficData.length > 15) trafficData.shift();
        
        // Update charts
        updateCharts();
        
        // Update data table
        updateDataTable(data);
        
    } catch (error) {
        console.error('Failed to update mobility data:', error);
    }
}

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
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Traffic Flow',
                    data: [],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Traffic Metrics Over Time'
                }
            }
        }
    });
    
    // Congestion Distribution Chart
    const congestionCtx = document.getElementById('congestionChart').getContext('2d');
    congestionChart = new Chart(congestionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Free Flow', 'Moderate', 'Heavy', 'Severe'],
            datasets: [{
                data: [40, 30, 20, 10],
                backgroundColor: [
                    '#27ae60',
                    '#f39c12',
                    '#e67e22',
                    '#e74c3c'
                ]
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
                    text: 'Congestion Distribution'
                }
            }
        }
    });
}

function updateCharts() {
    if (!trafficChart || !congestionChart) return;
    
    // Update traffic chart
    const labels = trafficData.map((_, i) => `${i * 5}s ago`);
    const densityData = trafficData.map(d => d.vehicleDensity);
    const flowData = trafficData.map(d => d.trafficFlow);
    
    trafficChart.data.labels = labels;
    trafficChart.data.datasets[0].data = densityData;
    trafficChart.data.datasets[1].data = flowData;
    trafficChart.update('none');
    
    // Update congestion chart based on current data
    const current = trafficData[trafficData.length - 1];
    const congestion = current.congestionLevel;
    
    congestionChart.data.datasets[0].data = [
        Math.max(0, 100 - congestion * 1.5), // Free flow
        congestion * 0.4, // Moderate
        congestion * 0.3, // Heavy
        congestion * 0.2  // Severe
    ];
    congestionChart.update('none');
}

function updateDataTable(data) {
    const tableBody = document.getElementById('trafficDataTable');
    
    const rows = [
        {
            metric: 'Vehicle Density',
            value: `${data.vehicleDensity}%`,
            status: data.vehicleDensity < 60 ? 'Good' : data.vehicleDensity < 80 ? 'Moderate' : 'High',
            trend: data.vehicleDensity > 65 ? 'Increasing' : 'Decreasing',
            recommendation: data.vehicleDensity > 70 ? 'Consider traffic diversion' : 'Normal operations'
        },
        {
            metric: 'Congestion Level',
            value: `${data.congestionLevel}%`,
            status: data.congestionLevel < 40 ? 'Good' : data.congestionLevel < 60 ? 'Moderate' : 'High',
            trend: data.congestionLevel > 45 ? 'Increasing' : 'Decreasing',
            recommendation: data.congestionLevel > 50 ? 'Activate congestion pricing' : 'Monitor'
        },
        {
            metric: 'Traffic Flow Efficiency',
            value: `${data.trafficFlow}%`,
            status: data.trafficFlow > 70 ? 'Good' : data.trafficFlow > 50 ? 'Moderate' : 'Poor',
            trend: data.trafficFlow > 75 ? 'Improving' : 'Declining',
            recommendation: data.trafficFlow < 60 ? 'Optimize traffic signals' : 'Efficient'
        },
        {
            metric: 'Public Transport Usage',
            value: `${data.publicTransportUsage}%`,
            status: data.publicTransportUsage > 60 ? 'Good' : data.publicTransportUsage > 40 ? 'Moderate' : 'Low',
            trend: data.publicTransportUsage > 65 ? 'Increasing' : 'Decreasing',
            recommendation: data.publicTransportUsage < 50 ? 'Promote public transport' : 'Adequate usage'
        },
        {
            metric: 'Average Vehicle Speed',
            value: `${data.averageSpeed} km/h`,
            status: data.averageSpeed > 40 ? 'Good' : data.averageSpeed > 30 ? 'Moderate' : 'Slow',
            trend: data.averageSpeed > 42 ? 'Improving' : 'Declining',
            recommendation: data.averageSpeed < 35 ? 'Clear traffic bottlenecks' : 'Normal speed'
        }
    ];
    
    let html = '';
    rows.forEach(row => {
        const statusClass = row.status === 'Good' ? 'text-success' : 
                          row.status === 'Moderate' ? 'text-warning' : 'text-danger';
        
        html += `
            <tr>
                <td><strong>${row.metric}</strong></td>
                <td>${row.value}</td>
                <td class="${statusClass}">${row.status}</td>
                <td>${row.trend}</td>
                <td><small>${row.recommendation}</small></td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initMobility);