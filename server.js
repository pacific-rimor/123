// server.js - Main Backend Server
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

// Import simulated data module
const { generateData, updateData, applyScenario, getDashboardData, setRealTimeData } = require('./data/simulated-data');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve Login as Landing Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve Main Dashboard
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve subdomain pages
app.get('/mobility', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'mobility.html'));
});

app.get('/environment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'environment.html'));
});

app.get('/health', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'health.html'));
});

app.get('/agriculture', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'agriculture.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});


// API Endpoints
app.get('/api/dashboard', (req, res) => {
    res.json(getDashboardData());
});

app.get('/api/traffic', (req, res) => {
    const data = generateData();
    res.json({
        timestamp: new Date().toISOString(),
        vehicleDensity: data.traffic.vehicleDensity,
        congestionLevel: data.traffic.congestionLevel,
        trafficFlow: data.traffic.trafficFlow,
        publicTransportUsage: data.traffic.publicTransportUsage,
        accidentsToday: data.traffic.accidentsToday,
        averageSpeed: data.traffic.averageSpeed
    });
});

app.get('/api/environment', (req, res) => {
    const data = generateData();
    res.json({
        timestamp: new Date().toISOString(),
        airQualityIndex: data.environment.airQualityIndex,
        temperature: data.environment.temperature,
        humidity: data.environment.humidity,
        energyConsumption: data.environment.energyConsumption,
        renewableEnergyPercentage: data.environment.renewableEnergyPercentage,
        co2Levels: data.environment.co2Levels,
        rainfall: data.environment.rainfall
    });
});

app.get('/api/health', (req, res) => {
    const data = generateData();
    res.json({
        timestamp: new Date().toISOString(),
        pollutionRiskLevel: data.health.pollutionRiskLevel,
        hospitalLoad: data.health.hospitalLoad,
        respiratoryCases: data.health.respiratoryCases,
        publicHealthIndex: data.health.publicHealthIndex,
        vaccinationRate: data.health.vaccinationRate,
        averageLifeExpectancy: data.health.averageLifeExpectancy
    });
});

app.get('/api/agriculture', (req, res) => {
    const data = generateData();
    res.json({
        timestamp: new Date().toISOString(),
        cropYieldIndex: data.agriculture.cropYieldIndex,
        foodSupplyStability: data.agriculture.foodSupplyStability,
        waterUsageEfficiency: data.agriculture.waterUsageEfficiency,
        smartIrrigationCoverage: data.agriculture.smartIrrigationCoverage,
        localFoodProduction: data.agriculture.localFoodProduction,
        foodWastePercentage: data.agriculture.foodWastePercentage
    });
});

app.post('/api/scenario', (req, res) => {
    const { trafficIncrease, rainfallDecrease, energyIncrease } = req.body;

    if (trafficIncrease === undefined || rainfallDecrease === undefined || energyIncrease === undefined) {
        return res.status(400).json({ error: 'Missing scenario parameters' });
    }

    const result = applyScenario(trafficIncrease, rainfallDecrease, energyIncrease);
    res.json(result);
});

const fs = require('fs');

// Data Persistence Paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const WHITELIST_FILE = path.join(DATA_DIR, 'whitelist.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Load Data Helpers
function loadData(file, defaultData) {
    try {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
        console.error(`Error loading ${file}:`, err);
        return defaultData;
    }
}

function saveData(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error saving ${file}:`, err);
    }
}

// Initialize Data
let users = loadData(USERS_FILE, {
    'admin@smartcity.com': { password: 'admin', role: 'official' }
});

let officialWhitelist = loadData(WHITELIST_FILE, ['admin@smartcity.com']);

// Activity Logs (load and ensure it's an array)
let activityLogs = loadData(LOGS_FILE, []);
if (!Array.isArray(activityLogs)) activityLogs = [];


// AUTH API ENDPOINTS
// ------------------

// 1. Check User Status (Used for UI Flow)
app.post('/api/check-user', (req, res) => {
    const { email } = req.body;

    // Check if official (Whitelisted)
    const isOfficial = officialWhitelist.includes(email);
    const userExists = users[email] !== undefined;

    if (isOfficial && !userExists) {
        return res.json({ status: 'new_official', message: 'Official Activation Required' });
    }

    if (userExists) {
        return res.json({ status: 'existing', role: users[email].role });
    }

    return res.json({ status: 'new_citizen', message: 'Citizen Registration' });
});

// 2. Register / Set Password (First Time)
app.post('/api/register', (req, res) => {
    const { email, password, role } = req.body;

    if (role === 'official') {
        if (!officialWhitelist.includes(email)) {
            return res.status(403).json({ success: false, message: 'Email not authorized as Official.' });
        }
    }

    // Save User
    users[email] = { password, role };
    saveData(USERS_FILE, users);
    console.log(`🆕 User Registered: ${email} (${role})`);

    res.json({ success: true, name: role === 'official' ? 'City Official' : 'Citizen', role });
});

// 3. Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users[email];

    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
    }

    logActivity(email, user.role, 'Logged In');

    res.json({
        success: true,
        role: user.role,
        name: user.role === 'official' ? 'City Official' : 'Citizen',
        email: email
    });
});

// 4. Forgot Password (Generate Token)
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;
    const user = users[email];

    if (!user) {
        // Security: Don't reveal user existence, but for demo we can be loose
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate Mock Token (4 digit code)
    const token = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetToken = token;
    saveData(USERS_FILE, users);

    // Simulate Email Sending
    console.log(`📧 [MOCK EMAIL] Password Reset Code for ${email}: ${token}`);

    res.json({ success: true, message: 'Reset code sent to email (Check Console)' });
});

// 5. Reset Password
app.post('/api/reset-password', (req, res) => {
    const { email, token, newPassword } = req.body;
    const user = users[email];

    if (!user || user.resetToken !== token) {
        return res.status(400).json({ success: false, message: 'Invalid Reset Code' });
    }

    user.password = newPassword;
    delete user.resetToken; // Clear token
    saveData(USERS_FILE, users);

    res.json({ success: true, message: 'Password updated successfully' });
});

// Admin: Add Official
app.post('/api/add-official', (req, res) => {
    const { newEmail, requesterRole } = req.body;

    if (requesterRole !== 'official') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (officialWhitelist.includes(newEmail)) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    officialWhitelist.push(newEmail);
    saveData(WHITELIST_FILE, officialWhitelist);
    console.log(`👨‍💼 New Official Whitelisted: ${newEmail}`);
    res.json({ success: true, message: `Access granted. Ask ${newEmail} to sign up.` });
});

// ---------------------------------------------
// ACTIVITY LOGGING SYSTEM
// ---------------------------------------------
function logActivity(user, role, action) {
    const timestamp = new Date().toLocaleTimeString();
    activityLogs.unshift({ timestamp, user, role, action });
    if (activityLogs.length > 50) activityLogs.pop();
    saveData(LOGS_FILE, activityLogs);
}

// API: Get Logs
app.post('/api/logs', (req, res) => {
    const { email, role } = req.body;
    if (role === 'official') {
        res.json({ success: true, logs: activityLogs });
    } else {
        const userLogs = activityLogs.filter(log => log.user === email);
        res.json({ success: true, logs: userLogs });
    }
});

// 6. Update Profile
app.post('/api/update-profile', (req, res) => {
    const { email, name, password, currentPassword, area, profilePic, phoneNumber, gender, dob } = req.body;
    const user = users[email];

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Security Check for Password Change
    if (password) {
        if (!currentPassword) {
            return res.json({ success: false, message: 'Current Password is required to set a new password.' });
        }
        if (user.password !== currentPassword) {
            return res.json({ success: false, message: 'Incorrect Current Password.' });
        }
        user.password = password; // Set new password
    }

    // Update other fields
    if (name) user.name = name;
    if (area) user.area = area;
    if (profilePic) user.profilePic = profilePic;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;

    saveData(USERS_FILE, users);

    logActivity(email, user.role, 'Updated Profile');

    res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            name: user.name,
            email,
            role: user.role,
            area: user.area,
            profilePic: user.profilePic,
            phoneNumber: user.phoneNumber,
            gender: user.gender,
            dob: user.dob
        }
    });
});

// 7. Submit Feedback
app.post('/api/feedback', (req, res) => {
    const { email, type, message } = req.body;
    logActivity(email, 'citizen', `Submitted Feedback: ${type}`);
    console.log(`📝 FEEDBACK from ${email} [${type}]: ${message}`);
    res.json({ success: true, message: 'Feedback received. Thank you!' });
});


// Start server
app.listen(PORT, () => {
    console.log(`🚀 Smart City Dashboard running at http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/`);
    console.log(`🚗 Mobility: http://localhost:${PORT}/mobility`);
    console.log(`🌿 Environment: http://localhost:${PORT}/environment`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
    console.log(`🌾 Agriculture: http://localhost:${PORT}/agriculture`);
});

// Start simulated data updates
setInterval(updateData, 5000); // Update every 5 seconds

// Fetch real-time data from Open-Meteo (Weather & Air Quality)
async function fetchRealTimeData() {
    try {
        // Fetch Weather Data (London)
        const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=temperature_2m,relative_humidity_2m,rain');

        // Fetch Air Quality Data (London)
        const airRes = await axios.get('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=51.5074&longitude=-0.1278&current=us_aqi');

        if (weatherRes.data.current && airRes.data.current) {
            setRealTimeData({
                temperature: weatherRes.data.current.temperature_2m,
                humidity: weatherRes.data.current.relative_humidity_2m,
                rainfall: weatherRes.data.current.rain,
                aqi: airRes.data.current.us_aqi
            });
            console.log(`☁️  Real-time data fetched: ${weatherRes.data.current.temperature_2m}°C, AQI ${airRes.data.current.us_aqi}`);
        }
    } catch (error) {
        console.error('❌ Error fetching real-time data:', error.message);
    }
}

// Fetch immediately and then every 15 minutes
fetchRealTimeData();
setInterval(fetchRealTimeData, 15 * 60 * 1000);