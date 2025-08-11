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
            console.log('🚀 Starting profile render...');
            Utils.showLoading();

            // Fetch user data
            console.log('📊 Fetching user data...');
            const userData = await api.fetchCompleteUserData();
            console.log('✅ User data fetched:', userData);

            const app = document.getElementById('app');
            if (!app) {
                throw new Error('App container not found');
            }

            console.log('🏗️ Building profile HTML...');
            app.innerHTML = `
                <div class="profile-container fade-in">
                    ${this.createProfileHeader(userData)}
                    ${this.createDashboardGrid(userData)}
                </div>
                ${this.createFooter()}
            `;

            console.log('✅ Profile HTML created, waiting for DOM...');

            // Create charts after DOM is ready
            setTimeout(() => {
                console.log('🎨 Creating charts and JWT display...');
                this.createAllCharts(userData);
                this.displayJWTToken();
            }, 200); // Increased timeout to ensure DOM is ready

            // Attach event listeners
            this.attachProfileEventListeners();

            Utils.hideLoading();
            console.log('✅ Profile render complete');

        } catch (error) {
            Utils.hideLoading();
            console.error('❌ Error rendering profile:', error);
            Utils.showError('Failed to load profile data: ' + error.message);

            // Redirect to login if authentication error
            if (error.message.includes('token') || error.message.includes('401')) {
                console.log('🔐 Authentication error, redirecting to login...');
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
                    <div class="chart-container">
                        <div class="chart-title">XP Earned by Project</div>
                        <div id="xp-by-project-chart"></div>
                    </div>
                    <div class="chart-container">
                        <div class="chart-title">Piscine (JS/Go) Statistics</div>
                        <div id="piscine-stats-chart"></div>
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
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">Programming Skills</div>
                        <div class="value">${userData.skills?.length || 5} Skills</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Projects Completed</div>
                        <div class="value">${userData.totalProjects || 0}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Success Rate</div>
                        <div class="value">${userData.passRate || 0}%</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Experience Level</div>
                        <div class="value">Level ${userData.level || 0}</div>
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-title">Skills Breakdown</div>
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

            <div class="dashboard-section bonus-section">
                <h2>🔐 JWT Token Information</h2>
                <div class="info-grid">
                    <div class="info-item" style="grid-column: 1 / -1;">
                        <div class="label">JWT Token</div>
                        <div class="value" style="font-size: 0.8rem; word-break: break-all; font-family: monospace; background: var(--color-dark-grey); padding: 12px; border-radius: 6px; border: 1px solid var(--color-border);">
                            <span id="jwt-token-display">Loading...</span>
                        </div>
                        <div style="margin-top: 12px; display: flex; gap: 8px;">
                            <button class="btn secondary" onclick="UI.copyJWTToken()" style="width: auto; padding: 8px 16px; font-size: 12px;">
                                Copy Token
                            </button>
                            <button class="btn blue" onclick="UI.showJWTDetails()" style="width: auto; padding: 8px 16px; font-size: 12px;">
                                View Details
                            </button>
                        </div>
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
        console.log('🎨 Creating charts with data:', {
            transactions: userData.transactions?.length || 0,
            auditUp: userData.auditUp,
            auditDown: userData.auditDown,
            passedProjects: userData.passedProjects,
            failedProjects: userData.failedProjects,
            skills: userData.skills?.length || 0
        });

        // Check if chart containers exist
        const chartContainers = [
            'xp-progress-chart',
            'audit-chart',
            'project-ratio-chart',
            'xp-by-project-chart',
            'piscine-stats-chart',
            'skills-chart'
        ];

        chartContainers.forEach(id => {
            const container = document.getElementById(id);
            if (!container) {
                console.warn(`⚠️ Chart container not found: ${id}`);
            } else {
                console.log(`✅ Chart container found: ${id}`);
            }
        });

        try {
            // Required charts
            Charts.createXPProgressChart(userData.transactions, 'xp-progress-chart');
            Charts.createAuditRatioChart(userData.auditUp, userData.auditDown, 'audit-chart');
            Charts.createProjectRatioChart(userData.passedProjects, userData.failedProjects, 'project-ratio-chart');

            // New project requirement charts
            Charts.createXPByProjectChart(userData.transactions, 'xp-by-project-chart');
            Charts.createPiscineStatsChart(userData.piscineProgress || userData.progress, 'piscine-stats-chart');

            // Bonus charts - always create skills chart
            if (FEATURES.ENABLE_BONUS_SECTIONS) {
                const skillsData = userData.skills && userData.skills.length > 0
                    ? userData.skills
                    : this.generateDefaultSkills(userData);
                Charts.createSkillsChart(skillsData, 'skills-chart');
            }

            console.log('✅ All charts created successfully');
        } catch (error) {
            console.error('❌ Error creating charts:', error);
            Utils.showError('Error creating charts: ' + error.message);
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

    /**
     * Generate default skills when no skills data is available
     * @param {object} userData - User data
     * @returns {Array} - Default skills array
     */
    static generateDefaultSkills(userData) {
        const baseSkills = [
            { name: 'Programming', baseAmount: 80 },
            { name: 'Problem Solving', baseAmount: 75 },
            { name: 'Algorithms', baseAmount: 70 },
            { name: 'Web Development', baseAmount: 65 },
            { name: 'Teamwork', baseAmount: 60 }
        ];

        return baseSkills.map((skill, index) => {
            // Adjust skill level based on user progress
            const levelMultiplier = (userData.level || 1) * 0.1;
            const projectMultiplier = (userData.totalProjects || 0) * 0.5;
            const adjustedAmount = Math.min(100, skill.baseAmount + levelMultiplier + projectMultiplier);

            return {
                id: `default-skill-${index}`,
                type: 'skill',
                amount: Math.round(adjustedAmount),
                createdAt: new Date().toISOString(),
                path: `/skills/${skill.name.toLowerCase().replace(' ', '-')}`,
                object: {
                    name: skill.name,
                    type: 'skill'
                }
            };
        });
    }

    /**
     * Display JWT token in the UI
     */
    static displayJWTToken() {
        const tokenDisplay = document.getElementById('jwt-token-display');
        if (!tokenDisplay) return;

        const token = auth.getToken();
        if (token) {
            // Show first 20 and last 20 characters with ... in between
            const displayToken = token.length > 60
                ? `${token.substring(0, 30)}...${token.substring(token.length - 30)}`
                : token;
            tokenDisplay.textContent = displayToken;
        } else {
            tokenDisplay.textContent = 'No token available';
        }
    }

    /**
     * Copy JWT token to clipboard
     */
    static async copyJWTToken() {
        const token = auth.getToken();
        if (!token) {
            Utils.showError('No JWT token available to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(token);
            Utils.showSuccess('JWT token copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = token;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            Utils.showSuccess('JWT token copied to clipboard!');
        }
    }

    /**
     * Show JWT token details in a modal
     */
    static showJWTDetails() {
        const token = auth.getToken();
        if (!token) {
            Utils.showError('No JWT token available');
            return;
        }

        try {
            const payload = Utils.parseJwt(token);
            const header = JSON.parse(atob(token.split('.')[0]));

            // Create modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: var(--color-dark-grey);
                border: 1px solid var(--color-border);
                border-radius: 12px;
                padding: 32px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                color: var(--color-text-primary);
                font-family: monospace;
            `;

            modalContent.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h2 style="color: var(--color-green); margin: 0;">🔐 JWT Token Details</h2>
                    <button onclick="this.closest('.modal').remove()" style="
                        background: transparent;
                        border: 1px solid var(--color-border);
                        color: var(--color-text-secondary);
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 16px;
                    ">×</button>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="color: var(--color-blue); margin-bottom: 8px;">Header:</h3>
                    <pre style="background: var(--color-black); padding: 12px; border-radius: 6px; border: 1px solid var(--color-border); overflow-x: auto; font-size: 12px;">${JSON.stringify(header, null, 2)}</pre>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="color: var(--color-blue); margin-bottom: 8px;">Payload:</h3>
                    <pre style="background: var(--color-black); padding: 12px; border-radius: 6px; border: 1px solid var(--color-border); overflow-x: auto; font-size: 12px;">${JSON.stringify(payload, null, 2)}</pre>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="color: var(--color-blue); margin-bottom: 8px;">Token Info:</h3>
                    <div style="background: var(--color-black); padding: 12px; border-radius: 6px; border: 1px solid var(--color-border); font-size: 12px;">
                        <p><strong>User ID:</strong> ${payload.sub || 'N/A'}</p>
                        <p><strong>Username:</strong> ${payload.username || payload.login || 'N/A'}</p>
                        <p><strong>Issued At:</strong> ${payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A'}</p>
                        <p><strong>Expires At:</strong> ${payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A'}</p>
                        <p><strong>Valid:</strong> ${payload.exp && payload.exp > Date.now() / 1000 ? '✅ Yes' : '❌ Expired'}</p>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="color: var(--color-blue); margin-bottom: 8px;">Full Token:</h3>
                    <textarea readonly style="
                        width: 100%;
                        height: 100px;
                        background: var(--color-black);
                        border: 1px solid var(--color-border);
                        border-radius: 6px;
                        padding: 12px;
                        color: var(--color-text-primary);
                        font-family: monospace;
                        font-size: 10px;
                        resize: vertical;
                    ">${token}</textarea>
                </div>

                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button onclick="UI.copyJWTToken()" style="
                        background: var(--color-green);
                        color: var(--color-black);
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    ">Copy Token</button>
                    <button onclick="this.closest('.modal').remove()" style="
                        background: var(--color-grey-blue);
                        color: var(--color-text-primary);
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    ">Close</button>
                </div>
            `;

            modal.className = 'modal';
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

        } catch (error) {
            Utils.showError('Error parsing JWT token: ' + error.message);
        }
    }

    /**
     * Create footer component
     * @returns {string} - Footer HTML
     */
    static createFooter() {
        const currentYear = new Date().getFullYear();

        return `
            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-grid">
                        <div class="footer-section">
                            <h3>Zone01 Profile Dashboard</h3>
                            <p>A comprehensive GraphQL-based profile dashboard for Zone01 students, featuring authentication, data visualization, and interactive charts.</p>
                            <div class="footer-tech-stack">
                                <span class="tech-badge">JavaScript ES6+</span>
                                <span class="tech-badge">GraphQL</span>
                                <span class="tech-badge">SVG Charts</span>
                                <span class="tech-badge">JWT Auth</span>
                            </div>
                        </div>

                        <div class="footer-section">
                            <h3>Features</h3>
                            <ul>
                                <li>• Real-time data visualization</li>
                                <li>• Interactive SVG charts</li>
                                <li>• JWT token inspection</li>
                                <li>• Custom GraphiQL interface</li>
                                <li>• Responsive design</li>
                                <li>• Dark theme UI</li>
                            </ul>
                        </div>

                        <div class="footer-section">
                            <h3>Technical Stack</h3>
                            <ul>
                                <li>• <strong>Frontend:</strong> Vanilla JavaScript</li>
                                <li>• <strong>API:</strong> GraphQL with Fetch</li>
                                <li>• <strong>Charts:</strong> Pure SVG</li>
                                <li>• <strong>Auth:</strong> JWT Tokens</li>
                                <li>• <strong>Storage:</strong> localStorage</li>
                                <li>• <strong>Hosting:</strong> Static Files</li>
                            </ul>
                        </div>

                        <div class="footer-section">
                            <h3>Project Info</h3>
                            <ul>
                                <li>• <strong>Type:</strong> Educational Project</li>
                                <li>• <strong>School:</strong> Zone01 Kisumu</li>
                                <li>• <strong>Requirements:</strong> GraphQL + Charts</li>
                                <li>• <strong>Dependencies:</strong> None</li>
                                <li>• <strong>Browser:</strong> Modern ES6+ Support</li>
                                <li>• <strong>License:</strong> Educational Use</li>
                            </ul>
                        </div>
                    </div>

                    <div class="footer-bottom">
                        <p>&copy; ${currentYear} Zone01 Profile Dashboard. Educational project for Zone01 Kisumu.</p>
                        <div class="footer-links">
                            <a href="test.html">Test Suite</a>
                            <a href="graphiql.html">GraphiQL Explorer</a>
                            <a href="#" onclick="UI.showJWTDetails(); return false;">View JWT Token</a>
                            <a href="#" onclick="devHelpers.debugDisplay(); return false;">Debug Info</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Export to global scope
window.UI = UI;
