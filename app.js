// Zone01 Profile Application - Consolidated
// Constants and Configuration
const ENDPOINT = "https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql";
const AUTH_ENDPOINT = "https://learn.zone01kisumu.ke/api/auth/signin";

// Global variables
let currentUser = null;

// ============ UTILITY FUNCTIONS ============

function base64Encode(str) {
    try {
        return btoa(str);
    } catch (e) {
        console.error("Error encoding string:", e);
        return null;
    }
}

function parseJwt(token) {
    try {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error parsing JWT:", error);
        return null;
    }
}

function getUserIdFromToken() {
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    const payload = parseJwt(token);
    if (!payload || !payload.sub) {
        throw new Error('Invalid token or missing user ID');
    }
    
    return parseInt(payload.sub);
}

// ============ API FUNCTIONS ============

async function authenticateUser(username, password) {
    const encodedCredentials = base64Encode(`${username}:${password}`);
    
    const response = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json'
        },
    });

    if (!response.ok) {
        const errorMessage = response.status === 401
            ? 'Username or password incorrect'
            : `Error code: ${response.status}`;
        throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return typeof data === 'string' ? data : data.jwt;
}

async function executeGraphQLQuery(queryObject) {
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    
    const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(queryObject)
    });

    const data = await response.json();

    if (data.errors) {
        console.error("GraphQL Query Error:", data.errors);
        throw new Error("GraphQL query failed: " + JSON.stringify(data.errors));
    }

    return data;
}

// ============ GRAPHQL QUERIES ============

function getUserInfoQuery() {
    return {
        "query": `{
            user {
                id
                login
                firstName
                lastName
            }
        }`
    };
}

function getUserXPQuery(userId) {
    return {
        "query": `{
            transaction(
                where: {
                    type: {_eq: "xp"},
                    userId: {_eq: ${userId}}
                },
                order_by: {createdAt: asc}
            ) {
                id
                type
                amount
                createdAt
                path
            }
        }`
    };
}

function getXPDownQuery(userId) {
    return {
        "query": `{
            transaction_aggregate(
                where: {
                    type: {_eq: "down"},
                    userId: {_eq: ${userId}}
                }
            ) {
                aggregate { 
                    sum { 
                        amount 
                    } 
                }
            }
        }`
    };
}

function getXPUpQuery(userId) {
    return {
        "query": `{
            transaction_aggregate(
                where: {
                    type: {_eq: "up"},
                    userId: {_eq: ${userId}}
                }
            ) {
                aggregate { 
                    sum { 
                        amount 
                    } 
                }
            }
        }`
    };
}

// ============ DATA FETCHING ============

async function fetchUserData() {
    const user = {};

    try {
        const userId = getUserIdFromToken();
        user.id = userId;

        // Fetch user info
        const userInfoResponse = await executeGraphQLQuery(getUserInfoQuery());
        if (userInfoResponse.data.user && userInfoResponse.data.user.length > 0) {
            const userData = userInfoResponse.data.user[0];
            user.firstName = userData.firstName || userData.login;
            user.lastName = userData.lastName || '';
            user.login = userData.login;
        }

        // Fetch transactions
        const transactionsResponse = await executeGraphQLQuery(getUserXPQuery(userId));
        user.listTransaction = transactionsResponse.data.transaction || [];
        user.maxXP = user.listTransaction.reduce((sum, transaction) => sum + transaction.amount, 0);
        user.lvl = Math.floor(user.maxXP / 66000);

        // Fetch audit data
        const [xpDownResponse, xpUpResponse] = await Promise.all([
            executeGraphQLQuery(getXPDownQuery(userId)),
            executeGraphQLQuery(getXPUpQuery(userId))
        ]);
        
        user.XPdown = xpDownResponse.data.transaction_aggregate.aggregate.sum?.amount || 0;
        user.XPup = xpUpResponse.data.transaction_aggregate.aggregate.sum?.amount || 0;

        return user;
    } catch (error) {
        console.error('Data retrieval error:', error);
        throw error;
    }
}

// ============ UI RENDERING ============

function renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="login-container">
            <h1>Zone01 Profile</h1>
            <div id="error-message" class="error" style="display: none;"></div>
            <form id="login-form">
                <input type="text" id="username" placeholder="Username or Email" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');
    
    try {
        const token = await authenticateUser(username, password);
        localStorage.setItem('token', token);
        localStorage.setItem('jwt', token);
        await renderProfile();
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}

async function renderProfile() {
    try {
        const userData = await fetchUserData();
        currentUser = userData;
        updateDashboard(userData);
    } catch (error) {
        console.error('Profile render error:', error);
        renderLogin();
    }
}

function updateDashboard(user) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="profile-container">
            <header>
                <h1>Welcome, ${user.firstName} ${user.lastName}!</h1>
                <button id="logout-btn">Logout</button>
            </header>
            
            <div class="user-info">
                <h2>User Information</h2>
                <p><strong>Login:</strong> ${user.login}</p>
                <p><strong>Level:</strong> ${user.lvl}</p>
                <p><strong>Total XP:</strong> ${formatXP(user.maxXP)}</p>
            </div>

            <div class="audit-info">
                <h2>Audit Information</h2>
                <p><strong>XP Given:</strong> ${formatXP(user.XPup)}</p>
                <p><strong>XP Received:</strong> ${formatXP(user.XPdown)}</p>
                <p><strong>Audit Ratio:</strong> ${user.XPdown > 0 ? (user.XPup / user.XPdown).toFixed(1) : 'N/A'}</p>
                <div id="audit-ratio-chart"></div>
            </div>

            <div class="xp-graph">
                <h2>XP Progress Over Time</h2>
                <div id="xp-chart"></div>
            </div>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Create charts
    createAuditRatioChart(user.XPup, user.XPdown);
    createXPChart(user.listTransaction);
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    currentUser = null;
    renderLogin();
}

// ============ CHART CREATION ============

function createAuditRatioChart(xpUp, xpDown) {
    const container = document.getElementById('audit-ratio-chart');
    if (!xpUp && !xpDown) {
        container.innerHTML = '<p>No audit data available</p>';
        return;
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '300');
    svg.setAttribute('height', '60');
    svg.setAttribute('viewBox', '0 0 300 60');

    const maxValue = Math.max(xpUp, xpDown);
    const upWidth = maxValue > 0 ? (xpUp / maxValue) * 280 : 0;
    const downWidth = maxValue > 0 ? (xpDown / maxValue) * 280 : 0;

    // XP Up bar
    const upRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    upRect.setAttribute('x', '10');
    upRect.setAttribute('y', '10');
    upRect.setAttribute('width', upWidth);
    upRect.setAttribute('height', '15');
    upRect.setAttribute('fill', '#4CAF50');

    // XP Down bar
    const downRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    downRect.setAttribute('x', '10');
    downRect.setAttribute('y', '35');
    downRect.setAttribute('width', downWidth);
    downRect.setAttribute('height', '15');
    downRect.setAttribute('fill', '#f44336');

    svg.appendChild(upRect);
    svg.appendChild(downRect);
    container.appendChild(svg);
}

function createXPChart(transactions) {
    const container = document.getElementById('xp-chart');
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p>No XP data available</p>';
        return;
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '600');
    svg.setAttribute('height', '300');
    svg.setAttribute('viewBox', '0 0 600 300');

    // Background
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', '600');
    bgRect.setAttribute('height', '300');
    bgRect.setAttribute('fill', '#f9f9f9');
    bgRect.setAttribute('stroke', '#ddd');
    svg.appendChild(bgRect);

    if (transactions.length < 2) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '300');
        text.setAttribute('y', '150');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#666');
        text.textContent = 'Not enough data for chart';
        svg.appendChild(text);
        container.appendChild(svg);
        return;
    }

    // Calculate cumulative XP
    let cumulativeXP = 0;
    const chartData = transactions.map(transaction => {
        cumulativeXP += transaction.amount;
        return {
            date: new Date(transaction.createdAt),
            xp: cumulativeXP
        };
    });

    // Chart dimensions
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = 600 - margin.left - margin.right;
    const chartHeight = 300 - margin.top - margin.bottom;

    // Scales
    const minDate = chartData[0].date;
    const maxDate = chartData[chartData.length - 1].date;
    const maxXP = Math.max(...chartData.map(d => d.xp));

    // Create chart group
    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

    // Create path for XP line
    let pathData = '';
    chartData.forEach((point, index) => {
        const x = (point.date - minDate) / (maxDate - minDate) * chartWidth;
        const y = chartHeight - (point.xp / maxXP * chartHeight);

        if (index === 0) {
            pathData += `M ${x} ${y}`;
        } else {
            pathData += ` L ${x} ${y}`;
        }
    });

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#2196F3');
    path.setAttribute('stroke-width', '2');
    chartGroup.appendChild(path);

    // Add axes
    // X-axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', '0');
    xAxis.setAttribute('y1', chartHeight);
    xAxis.setAttribute('x2', chartWidth);
    xAxis.setAttribute('y2', chartHeight);
    xAxis.setAttribute('stroke', '#333');
    chartGroup.appendChild(xAxis);

    // Y-axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', '0');
    yAxis.setAttribute('y1', '0');
    yAxis.setAttribute('x2', '0');
    yAxis.setAttribute('y2', chartHeight);
    yAxis.setAttribute('stroke', '#333');
    chartGroup.appendChild(yAxis);

    // Add labels
    const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xLabel.setAttribute('x', chartWidth / 2);
    xLabel.setAttribute('y', chartHeight + 35);
    xLabel.setAttribute('text-anchor', 'middle');
    xLabel.setAttribute('font-size', '12');
    xLabel.textContent = 'Time';
    chartGroup.appendChild(xLabel);

    const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabel.setAttribute('x', -chartHeight / 2);
    yLabel.setAttribute('y', -40);
    yLabel.setAttribute('text-anchor', 'middle');
    yLabel.setAttribute('font-size', '12');
    yLabel.setAttribute('transform', `rotate(-90, -40, ${chartHeight / 2})`);
    yLabel.textContent = 'XP';
    chartGroup.appendChild(yLabel);

    svg.appendChild(chartGroup);
    container.appendChild(svg);
}

// ============ UTILITY FUNCTIONS ============

function formatXP(xpAmount) {
    if (xpAmount >= 1000000) {
        return `${(xpAmount / 1000000).toFixed(2)} MB`;
    } else if (xpAmount >= 1000) {
        return `${Math.round(xpAmount / 1000)} kB`;
    } else {
        return `${xpAmount} B`;
    }
}

// ============ INITIALIZATION ============

async function initializeApp() {
    const token = localStorage.getItem('token') || localStorage.getItem('jwt');
    if (token) {
        try {
            await renderProfile();
        } catch (error) {
            console.error('Failed to load profile:', error);
            renderLogin();
        }
    } else {
        renderLogin();
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
