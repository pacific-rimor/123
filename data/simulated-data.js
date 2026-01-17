// data/simulated-data.js - Data Simulation and Analytics Engine

// Initial data state
let cityData = {
    traffic: {
        vehicleDensity: 65,
        congestionLevel: 42,
        trafficFlow: 78,
        publicTransportUsage: 65,
        accidentsToday: 3,
        averageSpeed: 45
    },
    environment: {
        airQualityIndex: 72,
        temperature: 22,
        humidity: 45,
        energyConsumption: 8500,
        renewableEnergyPercentage: 38,
        co2Levels: 420,
        rainfall: 12
    },
    health: {
        pollutionRiskLevel: 28,
        hospitalLoad: 65,
        respiratoryCases: 120,
        publicHealthIndex: 82,
        vaccinationRate: 88,
        averageLifeExpectancy: 78
    },
    agriculture: {
        cropYieldIndex: 75,
        foodSupplyStability: 82,
        waterUsageEfficiency: 68,
        smartIrrigationCoverage: 45,
        localFoodProduction: 72,
        foodWastePercentage: 18
    },
    predictions: {
        trafficImpact: 0,
        pollutionImpact: 0,
        healthImpact: 0,
        agricultureImpact: 0
    }
};

// Generate realistic simulated data
function generateData() {
    return JSON.parse(JSON.stringify(cityData)); // Deep copy
}

// Update data with realistic variations
function updateData() {
    // Random fluctuations (±5%)
    const fluctuate = (value, percent = 5) => {
        const change = (Math.random() * percent * 2) - percent;
        return Math.max(0, Math.min(100, value + change));
    };

    // Rule-Based Predictive Analytics
    // If traffic increases → pollution increases
    const trafficChange = fluctuate(cityData.traffic.vehicleDensity, 3) - cityData.traffic.vehicleDensity;
    cityData.environment.airQualityIndex = fluctuate(cityData.environment.airQualityIndex - trafficChange * 0.3);

    // If pollution increases → health risk increases
    const pollutionChange = cityData.environment.airQualityIndex - 50; // Deviation from ideal
    cityData.health.pollutionRiskLevel = fluctuate(cityData.health.pollutionRiskLevel + pollutionChange * 0.1);

    // If rainfall decreases → crop yield decreases
    const rainfallChange = fluctuate(cityData.environment.rainfall, 10) - cityData.environment.rainfall;
    cityData.agriculture.cropYieldIndex = fluctuate(cityData.agriculture.cropYieldIndex - rainfallChange * 0.5);

    // Update all metrics with natural fluctuations
    cityData.traffic.vehicleDensity = fluctuate(cityData.traffic.vehicleDensity, 3);
    cityData.traffic.congestionLevel = fluctuate(cityData.traffic.congestionLevel, 4);
    cityData.traffic.trafficFlow = fluctuate(cityData.traffic.trafficFlow, 3);

    cityData.environment.temperature = fluctuate(cityData.environment.temperature, 2, 15, 30);
    cityData.environment.humidity = fluctuate(cityData.environment.humidity, 5);
    cityData.environment.energyConsumption = fluctuate(cityData.environment.energyConsumption, 3, 7000, 10000);

    cityData.health.hospitalLoad = fluctuate(cityData.health.hospitalLoad, 2);
    cityData.health.respiratoryCases = Math.max(0, cityData.health.respiratoryCases + Math.floor(Math.random() * 6) - 3);

    cityData.agriculture.foodSupplyStability = fluctuate(cityData.agriculture.foodSupplyStability, 2);
    cityData.agriculture.waterUsageEfficiency = fluctuate(cityData.agriculture.waterUsageEfficiency, 3);

    // Generate predictions based on current trends
    updatePredictions();

    console.log(`📈 Data updated at ${new Date().toLocaleTimeString()}`);
}

// Update range-constrained fluctuation
function fluctuate(value, percent = 5, min = 0, max = 100) {
    const change = (Math.random() * percent * 2) - percent;
    const newValue = value + change;
    return Math.max(min, Math.min(max, Math.round(newValue * 100) / 100)); // Round to 2 decimal places
}

// Update predictive insights
function updatePredictions() {
    // Simple predictive model based on current trends
    const trafficTrend = (cityData.traffic.vehicleDensity - 50) / 50;
    const rainfallTrend = (cityData.environment.rainfall - 10) / 10;

    cityData.predictions = {
        trafficImpact: Math.round(trafficTrend * 15),
        pollutionImpact: Math.round(trafficTrend * 12),
        healthImpact: Math.round(trafficTrend * 8),
        agricultureImpact: Math.round(rainfallTrend * -10)
    };
}

// Apply scenario planning (What-if analysis)
function applyScenario(trafficIncrease, rainfallDecrease, energyIncrease) {
    console.log(`🔮 Applying scenario: Traffic +${trafficIncrease}%, Rainfall -${rainfallDecrease}%, Energy +${energyIncrease}%`);

    const baseData = generateData();

    // Rule-Based Predictive Analytics for Scenario Planning
    const impacts = {
        original: baseData,
        adjusted: {},
        predictions: {}
    };

    // Calculate impacts
    // Traffic increase impacts
    impacts.adjusted.trafficCongestion = Math.min(100, baseData.traffic.congestionLevel + trafficIncrease * 0.8);
    impacts.adjusted.airQuality = Math.max(0, baseData.environment.airQualityIndex - trafficIncrease * 0.6);
    impacts.adjusted.energyUse = baseData.environment.energyConsumption * (1 + energyIncrease / 100);

    // Rainfall decrease impacts
    impacts.adjusted.cropYield = Math.max(0, baseData.agriculture.cropYieldIndex - rainfallDecrease * 1.2);
    impacts.adjusted.waterEfficiency = Math.max(0, baseData.agriculture.waterUsageEfficiency - rainfallDecrease * 0.5);

    // Energy increase impacts
    impacts.adjusted.pollution = Math.max(0, baseData.health.pollutionRiskLevel + energyIncrease * 0.4);
    impacts.adjusted.healthRisk = Math.min(100, baseData.health.pollutionRiskLevel + energyIncrease * 0.3);

    // Generate predictive insights
    impacts.predictions = {
        message: `Scenario Analysis Complete`,
        insights: [
            `If traffic increases by ${trafficIncrease}%, congestion will increase to ${impacts.adjusted.trafficCongestion.toFixed(1)}%`,
            `Reducing rainfall by ${rainfallDecrease}% could decrease crop yield by ${(baseData.agriculture.cropYieldIndex - impacts.adjusted.cropYield).toFixed(1)}%`,
            `Energy increase of ${energyIncrease}% may raise pollution risk by ${(impacts.adjusted.pollution - baseData.health.pollutionRiskLevel).toFixed(1)}%`
        ],
        recommendations: [
            'Consider promoting public transport to reduce traffic impact',
            'Implement smart irrigation to mitigate rainfall effects',
            'Increase renewable energy sources to balance energy demand'
        ]
    };

    return impacts;
}

// Get dashboard aggregated data
function getDashboardData() {
    const data = generateData();
    return {
        timestamp: new Date().toISOString(),
        overallCityHealth: calculateOverallHealth(data),
        modules: {
            mobility: {
                score: Math.round((100 - data.traffic.congestionLevel + data.traffic.trafficFlow) / 2),
                status: data.traffic.congestionLevel < 50 ? 'Good' : 'Moderate'
            },
            environment: {
                score: Math.round((data.environment.airQualityIndex + (100 - data.environment.co2Levels / 6)) / 2),
                status: data.environment.airQualityIndex > 70 ? 'Good' : 'Needs Attention'
            },
            health: {
                score: Math.round((data.health.publicHealthIndex + (100 - data.health.pollutionRiskLevel)) / 2),
                status: data.health.hospitalLoad < 70 ? 'Good' : 'Moderate'
            },
            agriculture: {
                score: Math.round((data.agriculture.cropYieldIndex + data.agriculture.foodSupplyStability) / 2),
                status: data.agriculture.foodSupplyStability > 75 ? 'Good' : 'Stable'
            }
        },
        predictions: data.predictions,
        alerts: generateAlerts(data)
    };
}

// Calculate overall city health score
function calculateOverallHealth(data) {
    const weights = {
        traffic: 0.25,
        environment: 0.25,
        health: 0.25,
        agriculture: 0.25
    };

    const trafficScore = (100 - data.traffic.congestionLevel + data.traffic.trafficFlow) / 2;
    const envScore = (data.environment.airQualityIndex + (100 - data.environment.co2Levels / 6)) / 2;
    const healthScore = (data.health.publicHealthIndex + (100 - data.health.pollutionRiskLevel)) / 2;
    const agriScore = (data.agriculture.cropYieldIndex + data.agriculture.foodSupplyStability) / 2;

    return Math.round(
        trafficScore * weights.traffic +
        envScore * weights.environment +
        healthScore * weights.health +
        agriScore * weights.agriculture
    );
}

// Generate system alerts
function generateAlerts(data) {
    const alerts = [];

    if (data.traffic.congestionLevel > 60) {
        alerts.push({
            type: 'warning',
            module: 'Mobility',
            message: 'High traffic congestion detected',
            action: 'Consider traffic diversion'
        });
    }

    if (data.environment.airQualityIndex < 50) {
        alerts.push({
            type: 'danger',
            module: 'Environment',
            message: 'Poor air quality detected',
            action: 'Activate pollution control measures'
        });
    }

    if (data.health.hospitalLoad > 80) {
        alerts.push({
            type: 'warning',
            module: 'Health',
            message: 'High hospital load',
            action: 'Prepare additional resources'
        });
    }

    if (data.agriculture.cropYieldIndex < 60) {
        alerts.push({
            type: 'warning',
            module: 'Agriculture',
            message: 'Low crop yield predicted',
            action: 'Review irrigation and fertilization'
        });
    }

    return alerts;
}

// Initialize predictions
updatePredictions();

module.exports = {
    generateData,
    updateData,
    applyScenario,
    getDashboardData,
    setRealTimeData
};

// Set real-time data from external APIs
function setRealTimeData(realData) {
    if (realData.temperature) cityData.environment.temperature = realData.temperature;
    if (realData.humidity) cityData.environment.humidity = realData.humidity;
    if (realData.aqi) cityData.environment.airQualityIndex = realData.aqi;
    if (realData.rainfall !== undefined) cityData.environment.rainfall = realData.rainfall;

    // Recalculate derived metrics
    // If AQI is real, update pollution risk
    const pollutionChange = cityData.environment.airQualityIndex - 50;
    cityData.health.pollutionRiskLevel = Math.max(0, Math.min(100, 28 + pollutionChange * 0.1));

    console.log('🔄 Real-time environment data integrated');
}