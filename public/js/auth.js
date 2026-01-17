const API_CheckUser = '/api/check-user';
const API_Register = '/api/register';
const API_Login = '/api/login';
const API_ForgotPassword = '/api/forgot-password';
const API_ResetPassword = '/api/reset-password';
const API_AddOfficial = '/api/add-official';

// 1. Check User Status
async function checkUserStatus(email) {
    const res = await fetch(API_CheckUser, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return await res.json();
}

// 2. Register / Set Password
async function registerUser(email, password, role) {
    const res = await fetch(API_Register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
    });
    return await res.json();
}

// 3. Login
async function loginUser(email, password) {
    const res = await fetch(API_Login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('isLoggedIn', 'true');
        // Redirect to Dashboard
        window.location.href = '/home';
    }
    return data;
}

// 4. Request Reset
async function requestPasswordReset(email) {
    const res = await fetch(API_ForgotPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return await res.json();
}

// 5. Confirm Reset
async function confirmPasswordReset(email, token, newPassword) {
    const res = await fetch(API_ResetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
    });
    return await res.json();
}

// Strict Redirect Logic
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    // If we are on the login page (root / or login.html), do nothing or redirect to home if logged in
    const isLoginPage = window.location.pathname === '/' || window.location.pathname.includes('login.html');

    if (!isLoggedIn) {
        if (!isLoginPage) {
            window.location.href = '/'; // Go to Login
            return false;
        }
    } else {
        // If logged in AND on login page, go to home
        if (isLoginPage) {
            window.location.href = '/home';
            return true;
        }
    }
    return true;
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = '/';
}

// 6. Update Profile
async function updateUserProfile(profileData) {
    const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (data.success) {
        // Update Local Storage
        if (data.user.name) localStorage.setItem('userName', data.user.name);
        if (data.user.area) localStorage.setItem('userArea', data.user.area);
        if (data.user.profilePic) localStorage.setItem('userPic', data.user.profilePic);
        if (data.user.phoneNumber) localStorage.setItem('userPhone', data.user.phoneNumber);
        if (data.user.gender) localStorage.setItem('userGender', data.user.gender);
        if (data.user.dob) localStorage.setItem('userDOB', data.user.dob);
    }
    return data;
}

// 7. Submit Feedback
async function submitUserFeedback(feedbackData) {
    const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
    });
    return await res.json();
}

// Add New Official (Admin Only)
async function addOfficialEmail(newEmail) {
    const role = localStorage.getItem('userRole');
    if (role !== 'official') {
        alert('Only officials can perform this action.');
        return;
    }

    try {
        const response = await fetch(API_AddOfficial, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newEmail, requesterRole: role })
        });

        const data = await response.json();

        if (data.success) {
            alert('Success: ' + data.message);
            // Clear input if successful
            const input = document.getElementById('new-official-email');
            if (input) input.value = '';
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Failed to add official:', error);
        alert('Network error occurred.');
    }
}

// Update UI based on Role
function updateUIForRole() {
    // Run Strict Auth Check first
    if (!checkAuth()) return;

    const role = localStorage.getItem('userRole');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // Update Navigation
    updateNavigation(isLoggedIn);

    // Feature Gating: Scenario Planning
    const scenarioPanel = document.querySelector('.scenario-panel');
    if (scenarioPanel) {
        if (role === 'official') {
            scenarioPanel.style.display = 'block'; // Show for officials
        } else {
            // Hide or Disable for citizens
            const inputs = scenarioPanel.querySelectorAll('input, button');
            inputs.forEach(input => input.disabled = true);

            // Optional: Add a visual "Locked" overlay or message
            const lockMessage = document.getElementById('citizen-lock-msg');
            if (!lockMessage) {
                const msg = document.createElement('div');
                msg.id = 'citizen-lock-msg';
                msg.className = 'alert alert-info mt-3';
                msg.innerHTML = '🔒 <strong>Read-Only Mode:</strong> Only City Officials can modify simulation parameters.';
                scenarioPanel.prepend(msg);
            }
        }
    }
}

// Update Navbar Links
function updateNavigation(isLoggedIn) {
    const navList = document.querySelector('.navbar-nav');
    if (!navList) return;

    // Remove existing Login/Settings links to prevent duplicates
    const existAuth = navList.querySelector('.auth-link');
    if (existAuth) existAuth.remove();

    const li = document.createElement('li');
    li.className = 'nav-item auth-link';

    if (isLoggedIn) {
        li.innerHTML = `<a class="nav-link" href="/settings.html">⚙️ Settings</a>`;
    } else {
        li.innerHTML = `<a class="nav-link" href="/login.html">🔑 Login</a>`;
    }

    navList.appendChild(li);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUIForRole();
});
