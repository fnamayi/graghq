// UI Module - User Interface Management

/**
 * UI class to handle all user interface operations
 */
class UI {
    
    /**
     * Render login page
     */
    static renderLogin() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="login-container fade-in">
                <h1>Zone01 Profile</h1>
                <p class="subtitle">Access your learning dashboard</p>
                
                <form id="login-form">
                    <div class="form-group">
                        <label for="username">Username or Email</label>
                        <input type="text" id="username" name="username" required 
                               placeholder="Enter your username or email">
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required 
                               placeholder="Enter your password">
                    </div>
                    
                    <button type="submit" class="btn" id="login-btn">
                        Login
                    </button>
                </form>
                
                <div id="login-error" class="error hidden"></div>
                
                ${FEATURES.ENABLE_CUSTOM_GRAPHIQL ? `
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 14px;">
                            Want to explore the GraphQL API? 
                            <a href="graphiql.html" target="_blank" class="graphiql-link">
                                Try our custom GraphiQL
                            </a>
                        </p>
                    </div>
                ` : ''}
            </div>
        `;

        // Attach event listeners
        this.attachLoginEventListeners();
    }

    /**
     * Attach login form event listeners
     */
    static attachLoginEventListeners() {
        const form = document.getElementById('login-form');
        const loginBtn = document.getElementById('login-btn');
        const errorDiv = document.getElementById('login-error');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            // Validate input
            if (!username || !password) {
                this.showLoginError('Please enter both username and password');
                return;
            }

            // Disable form during login
            loginBtn.disabled = true;
            loginBtn.textContent = 'Logging in...';
            errorDiv.classList.add('hidden');

            try {
                await auth.login(username, password);
                Utils.showSuccess(CONFIG.SUCCESS.LOGIN);
                
                // Redirect to profile after short delay
                setTimeout(() => {
                    this.renderProfile();
                }, 1000);

            } catch (error) {
                this.showLoginError(error.message);
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
            }
        });

        // Test invalid credentials functionality
        if (window.location.search.includes('test=invalid')) {
            document.getElementById('username').value = 'invalid_user';
            document.getElementById('password').value = 'wrong_password';
        }
    }

    /**
     * Show login error message
     * @param {string} message - Error message
     */
    static showLoginError(message) {
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    /**
     * Render profile dashboard
     */
    static async renderProfile() {
        try {
            Utils.showLoading();
            
            // Fetch user data
            const userData = await api.fetchCompleteUserData();
            
            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="profile-container fade-in">
                    ${this.createProfileHeader(userData)}
                    ${this.createDashboardGrid(userData)}
                </div>
            `;

            // Create charts after DOM is ready
            setTimeout(() => {
                this.createAllCharts(userData);
            }, 100);

            // Attach event listeners
            this.attachProfileEventListeners();
            
            Utils.hideLoading();

        } catch (error) {
            Utils.hideLoading();
            console.error('Error rendering profile:', error);
            Utils.showError('Failed to load profile data: ' + error.message);
            
            // Redirect to login if authentication error
            if (error.message.includes('token') || error.message.includes('401')) {
                setTimeout(() => {
                    this.renderLogin();
                }, 2000);
            }
        }
    }

    /**
     * Create profile header HTML
     * @param {object} userData - User data
     * @returns {string} - Header HTML
     */
    static createProfileHeader(userData) {
        return `
            <header class="profile-header">
                <div>
                    <h1>Welcome back, ${userData.firstName}!</h1>
                    <div class="user-meta">
                        <span>@${userData.login}</span> • 
                        <span>Level ${userData.level}</span> • 
                        <span>${userData.formattedXP}</span>
                    </div>
                </div>
                <button class="logout-btn" id="logout-btn">
                    Logout
                </button>
            </header>
        `;
    }

    /**
     * Create dashboard grid HTML
     * @param {object} userData - User data
     * @returns {string} - Dashboard HTML
     */
    static createDashboardGrid(userData) {
        return `
            <div class="dashboard-grid">
                <!-- Section 1: Basic User Information -->
                ${this.createUserInfoSection(userData)}
                
                <!-- Section 2: XP and Level Information -->
                ${this.createXPSection(userData)}
                
                <!-- Section 3: Audit Information -->
                ${this.createAuditSection(userData)}
                
                <!-- Section 4: Graphical Statistics (Full Width) -->
                ${this.createStatisticsSection(userData)}
                
                ${FEATURES.ENABLE_BONUS_SECTIONS ? this.createBonusSections(userData) : ''}
            </div>
        `;
    }

    /**
     * Create user info section (Section 1)
     * @param {object} userData - User data
     * @returns {string} - Section HTML
     */
    static createUserInfoSection(userData) {
        return `
            <div class="dashboard-section">
                <h2>👤 User Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">Login</div>
                        <div class="value">${userData.login}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Full Name</div>
                        <div class="value">${userData.firstName} ${userData.lastName}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">User ID</div>
                        <div class="value">#${userData.id}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Current Level</div>
                        <div class="value">Level ${userData.level}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create XP section (Section 2)
     * @param {object} userData - User data
     * @returns {string} - Section HTML
     */
    static createXPSection(userData) {
        return `
            <div class="dashboard-section">
                <h2>⚡ Experience Points</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">Total XP</div>
                        <div class="value">${userData.formattedXP}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Raw XP</div>
                        <div class="value">${userData.totalXP.toLocaleString()}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Transactions</div>
                        <div class="value">${userData.transactions.length}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Progress to Next Level</div>
                        <div class="value">${Utils.formatXP(CONFIG.XP_PER_LEVEL - (userData.totalXP % CONFIG.XP_PER_LEVEL))}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create audit section (Section 3)
     * @param {object} userData - User data
     * @returns {string} - Section HTML
     */
    static createAuditSection(userData) {
        return `
            <div class="dashboard-section">
                <h2>🔍 Audit Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">Audit Given</div>
                        <div class="value">${Utils.formatXP(userData.auditUp)}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Audit Received</div>
                        <div class="value">${Utils.formatXP(userData.auditDown)}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Audit Ratio</div>
                        <div class="value">${userData.auditRatio}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Audit Balance</div>
                        <div class="value">${Utils.formatXP(userData.auditUp - userData.auditDown)}</div>
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-title">Audit Ratio Visualization</div>
                    <div id="audit-chart"></div>
                </div>
            </div>
        `;
    }

    /**
     * Create statistics section (Section 4)
     * @param {object} userData - User data
     * @returns {string} - Section HTML
     */
    static createStatisticsSection(userData) {
        return `
            <div class="dashboard-section stats-full-width">
                <h2>📊 Graphical Statistics</h2>
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-title">XP Progress Over Time</div>
                        <div id="xp-progress-chart"></div>
                    </div>
                    <div class="chart-container">
                        <div class="chart-title">Project Pass/Fail Ratio</div>
                        <div id="project-ratio-chart"></div>
                        <div style="text-align: center; margin-top: 10px;">
                            <small>Passed: ${userData.passedProjects} | Failed: ${userData.failedProjects} | Rate: ${userData.passRate}%</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create bonus sections
     * @param {object} userData - User data
     * @returns {string} - Bonus sections HTML
     */
    static createBonusSections(userData) {
        return `
            <div class="dashboard-section bonus-section">
                <h2>🎯 Skills & Achievements</h2>
                <div class="chart-container">
                    <div class="chart-title">Top Skills</div>
                    <div id="skills-chart"></div>
                </div>
            </div>
            
            <div class="dashboard-section bonus-section">
                <h2>📈 Additional Statistics</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">Total Projects</div>
                        <div class="value">${userData.totalProjects}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Success Rate</div>
                        <div class="value">${userData.passRate}%</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Last Activity</div>
                        <div class="value">${userData.transactions.length > 0 ? Utils.formatDate(userData.transactions[userData.transactions.length - 1].createdAt) : 'N/A'}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Data Updated</div>
                        <div class="value">${Utils.formatDateTime(userData.lastUpdated)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create all charts
     * @param {object} userData - User data
     */
    static createAllCharts(userData) {
        // Required charts
        Charts.createXPProgressChart(userData.transactions, 'xp-progress-chart');
        Charts.createAuditRatioChart(userData.auditUp, userData.auditDown, 'audit-chart');
        Charts.createProjectRatioChart(userData.passedProjects, userData.failedProjects, 'project-ratio-chart');
        
        // Bonus charts
        if (FEATURES.ENABLE_BONUS_SECTIONS && userData.skills) {
            Charts.createSkillsChart(userData.skills, 'skills-chart');
        }
    }

    /**
     * Attach profile event listeners
     */
    static attachProfileEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    auth.logout();
                }
            });
        }
    }

    /**
     * Show loading state
     */
    static showLoading() {
        Utils.showLoading();
    }

    /**
     * Hide loading state
     */
    static hideLoading() {
        Utils.hideLoading();
    }
}

// Export to global scope
window.UI = UI;
