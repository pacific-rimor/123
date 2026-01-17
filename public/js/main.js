// public/js/main.js - Shared JavaScript Functions

// Chart.js Dark Mode Defaults
if (typeof Chart !== 'undefined') {
    Chart.defaults.color = '#1a0453ff';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
    Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
    Chart.defaults.plugins.legend.labels.color = '#f8fafc';
    Chart.defaults.plugins.title.color = '#f8fafc';
}

let updateInterval;

// Format numbers with commas
function formatNumber(num) {
    if (typeof num === 'number') {
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return num;
}

// Update timestamp display
function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('last-update').textContent = timeString;
}

// Set status indicator
function setStatusIndicator(elementId, status) {
    const element = document.getElementById(elementId);
    element.className = 'status-indicator';

    if (status === 'Good' || status === 'good') {
        element.classList.add('status-good');
    } else if (status === 'Moderate' || status === 'moderate') {
        element.classList.add('status-warning');
    } else {
        element.classList.add('status-danger');
    }
}

// Create alert element
function createAlertElement(alert) {
    const alertClass = alert.type === 'danger' ? 'alert-danger' :
        alert.type === 'warning' ? 'alert-warning' : 'alert-info';

    return `
        <div class="alert ${alertClass} alert-card fade-in">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${alert.module}:</strong> ${alert.message}
                </div>
                <div>
                    <small class="text-muted">${alert.action}</small>
                </div>
            </div>
        </div>
    `;
}

// Create prediction element
function createPredictionElement(prediction) {
    return `
        <div class="prediction-item mb-3 p-3 border rounded fade-in">
            <h6>${prediction.title}</h6>
            <p class="mb-2">${prediction.description}</p>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar ${prediction.impact > 0 ? 'bg-danger' : 'bg-success'}" 
                     style="width: ${Math.abs(prediction.impact)}%"></div>
            </div>
            <small class="text-muted">Impact: ${prediction.impact > 0 ? '+' : ''}${prediction.impact}%</small>
        </div>
    `;
}

// Initialize sliders
function initializeSliders() {
    const trafficSlider = document.getElementById('trafficSlider');
    const rainfallSlider = document.getElementById('rainfallSlider');
    const energySlider = document.getElementById('energySlider');

    if (trafficSlider) {
        trafficSlider.addEventListener('input', function () {
            document.getElementById('trafficValue').textContent = this.value + '%';
        });
    }

    if (rainfallSlider) {
        rainfallSlider.addEventListener('input', function () {
            document.getElementById('rainfallValue').textContent = this.value + '%';
        });
    }

    if (energySlider) {
        energySlider.addEventListener('input', function () {
            document.getElementById('energyValue').textContent = this.value + '%';
        });
    }
}

// Run scenario analysis
async function runScenario() {
    const trafficSlider = document.getElementById('trafficSlider');
    const rainfallSlider = document.getElementById('rainfallSlider');
    const energySlider = document.getElementById('energySlider');

    if (!trafficSlider || !rainfallSlider || !energySlider) return;

    const traffic = parseInt(trafficSlider.value);
    const rainfall = parseInt(rainfallSlider.value);
    const energy = parseInt(energySlider.value);

    try {
        const response = await fetch('/api/scenario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trafficIncrease: traffic,
                rainfallDecrease: rainfall,
                energyIncrease: energy
            })
        });

        const results = await response.json();
        displayScenarioResults(results);
    } catch (error) {
        console.error('Scenario analysis failed:', error);
        alert('Scenario analysis failed. Please try again.');
    }
}

// Display scenario results
function displayScenarioResults(results) {
    const container = document.getElementById('scenarioResults');
    if (!container) return;

    let html = `
        <div class="scenario-results fade-in">
            <h4>📊 Scenario Analysis Results</h4>
            <div class="row mt-4">
                <div class="col-md-6">
                    <h5>Predicted Impacts:</h5>
                    <ul class="list-group">
    `;

    // Add insights
    results.predictions.insights.forEach(insight => {
        html += `<li class="list-group-item">${insight}</li>`;
    });

    html += `
                    </ul>
                </div>
                <div class="col-md-6">
                    <h5>Recommendations:</h5>
                    <ul class="list-group">
    `;

    results.predictions.recommendations.forEach(rec => {
        html += `<li class="list-group-item list-group-item-info">${rec}</li>`;
    });

    html += `
                    </ul>
                </div>
            </div>
            <div class="alert alert-warning mt-3">
                <strong>Note:</strong> These predictions are based on rule-based analytics. 
                The system architecture supports integration of machine learning models for more accurate predictions.
            </div>
        </div>
    `;

    container.innerHTML = html;
    container.style.display = 'block';
}

// Reset scenario
function resetScenario() {
    const trafficSlider = document.getElementById('trafficSlider');
    if (!trafficSlider) return; // Assume if one is missing, all are missing

    trafficSlider.value = 0;
    document.getElementById('rainfallSlider').value = 0;
    document.getElementById('energySlider').value = 0;
    document.getElementById('trafficValue').textContent = '0%';
    document.getElementById('rainfallValue').textContent = '0%';
    document.getElementById('energyValue').textContent = '0%';

    const results = document.getElementById('scenarioResults');
    if (results) results.style.display = 'none';
}

// Start data updates
function startDataUpdates(updateFunction, interval = 5000) {
    // Initial update
    updateFunction();
    updateTimestamp();

    // Set up interval for updates
    if (updateInterval) {
        clearInterval(updateInterval);
    }

    updateInterval = setInterval(() => {
        updateFunction();
        updateTimestamp();
    }, interval);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeSliders();

    // Setup scenario buttons
    const runBtn = document.getElementById('runScenario');
    const resetBtn = document.getElementById('resetScenario');

    if (runBtn) runBtn.addEventListener('click', runScenario);
    if (resetBtn) resetBtn.addEventListener('click', resetScenario);

    updateTimestamp();
});