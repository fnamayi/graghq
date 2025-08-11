// Zone01 Profile Application - Main Entry Point

/**
 * Main Application Class
 */
class App {
    constructor() {
        this.initialized = false;
        this.version = '1.0.0';
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Initializing Zone01 Profile Application v' + this.version);
            
            // Check if user is already authenticated
            if (auth.init()) {
                console.log('✅ User authenticated, loading profile...');
                await UI.renderProfile();
            } else {
                console.log('🔐 No valid authentication, showing login...');
                UI.renderLogin();
            }
            
            this.initialized = true;
            console.log('✅ Application initialized successfully');
            
            // Log feature status
            this.logFeatureStatus();
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            Utils.showError('Failed to initialize application: ' + error.message);
            UI.renderLogin();
        }
    }

    /**
     * Log feature status for debugging
     */
    logFeatureStatus() {
        console.log('🎯 Feature Status:');
        Object.entries(FEATURES).forEach(([feature, enabled]) => {
            console.log(`  ${enabled ? '✅' : '❌'} ${feature}: ${enabled}`);
        });
    }

    /**
     * Handle application errors
     * @param {Error} error - Error object
     */
    handleError(error) {
        console.error('Application Error:', error);
        Utils.showError(error.message || 'An unexpected error occurred');
    }

    /**
     * Get application status
     * @returns {object} - Application status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            authenticated: auth.isAuthenticated(),
            version: this.version,
            features: FEATURES,
            config: {
                endpoints: {
                    graphql: CONFIG.GRAPHQL_ENDPOINT,
                    auth: CONFIG.AUTH_ENDPOINT
                },
                storage: {
                    tokenKey: CONFIG.TOKEN_KEY,
                    userKey: CONFIG.USER_KEY
                }
            }
        };
    }

    /**
     * Restart application (useful for debugging)
     */
    async restart() {
        console.log('🔄 Restarting application...');
        this.initialized = false;
        Utils.clearStoredData();
        await this.init();
    }

    /**
     * Test application functionality
     */
    async runTests() {
        console.log('🧪 Running application tests...');
        
        const tests = [
            this.testConfigLoaded,
            this.testUtilsAvailable,
            this.testAuthModule,
            this.testAPIModule,
            this.testQueriesModule,
            this.testChartsModule,
            this.testUIModule
        ];

        const results = [];
        for (const test of tests) {
            try {
                const result = await test.call(this);
                results.push({ test: test.name, status: 'pass', result });
                console.log(`✅ ${test.name}: PASS`);
            } catch (error) {
                results.push({ test: test.name, status: 'fail', error: error.message });
                console.log(`❌ ${test.name}: FAIL - ${error.message}`);
            }
        }

        return results;
    }

    // Test methods
    testConfigLoaded() {
        if (!window.CONFIG) throw new Error('CONFIG not loaded');
        if (!CONFIG.GRAPHQL_ENDPOINT) throw new Error('GraphQL endpoint not configured');
        if (!CONFIG.AUTH_ENDPOINT) throw new Error('Auth endpoint not configured');
        return 'Config loaded successfully';
    }

    testUtilsAvailable() {
        if (!window.Utils) throw new Error('Utils not available');
        if (typeof Utils.parseJwt !== 'function') throw new Error('parseJwt function missing');
        if (typeof Utils.formatXP !== 'function') throw new Error('formatXP function missing');
        return 'Utils module available';
    }

    testAuthModule() {
        if (!window.auth) throw new Error('Auth module not available');
        if (typeof auth.login !== 'function') throw new Error('login method missing');
        if (typeof auth.logout !== 'function') throw new Error('logout method missing');
        return 'Auth module available';
    }

    testAPIModule() {
        if (!window.api) throw new Error('API module not available');
        if (typeof api.executeQuery !== 'function') throw new Error('executeQuery method missing');
        if (typeof api.fetchCompleteUserData !== 'function') throw new Error('fetchCompleteUserData method missing');
        return 'API module available';
    }

    testQueriesModule() {
        if (!window.Queries) throw new Error('Queries module not available');
        if (typeof Queries.getUserInfo !== 'function') throw new Error('getUserInfo query missing');
        if (typeof Queries.getUserTransactions !== 'function') throw new Error('getUserTransactions query missing');
        return 'Queries module available';
    }

    testChartsModule() {
        if (!window.Charts) throw new Error('Charts module not available');
        if (typeof Charts.createXPProgressChart !== 'function') throw new Error('createXPProgressChart method missing');
        if (typeof Charts.createAuditRatioChart !== 'function') throw new Error('createAuditRatioChart method missing');
        return 'Charts module available';
    }

    testUIModule() {
        if (!window.UI) throw new Error('UI module not available');
        if (typeof UI.renderLogin !== 'function') throw new Error('renderLogin method missing');
        if (typeof UI.renderProfile !== 'function') throw new Error('renderProfile method missing');
        return 'UI module available';
    }
}

// Global error handlers
window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error);
    if (window.app) {
        app.handleError(event.error);
    } else {
        Utils.showError('An unexpected error occurred. Please refresh the page.');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    if (window.app) {
        app.handleError(new Error(event.reason));
    } else {
        Utils.showError('An unexpected error occurred. Please try again.');
    }
});

// Create global app instance
const app = new App();

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM Content Loaded');
    
    // Add loading indicator
    Utils.showLoading();
    
    // Small delay to ensure all modules are loaded
    setTimeout(async () => {
        await app.init();
        Utils.hideLoading();
    }, 100);
});

/**
 * Export app instance for global access and debugging
 */
window.app = app;

/**
 * Development helpers (available in console)
 */
if (typeof window !== 'undefined') {
    window.devHelpers = {
        // Quick access to app status
        status: () => app.getStatus(),
        
        // Run tests
        test: () => app.runTests(),
        
        // Restart app
        restart: () => app.restart(),
        
        // Clear all data
        reset: () => {
            Utils.clearStoredData();
            location.reload();
        },
        
        // Test login with invalid credentials
        testInvalidLogin: () => {
            UI.renderLogin();
            setTimeout(() => {
                document.getElementById('username').value = 'invalid_user';
                document.getElementById('password').value = 'wrong_password';
                document.getElementById('login-form').dispatchEvent(new Event('submit'));
            }, 100);
        },
        
        // Get current user data
        getUserData: () => api.getCachedUserData(),
        
        // Test GraphQL connection
        testConnection: () => api.testConnection()
    };
    
    console.log('🛠️ Development helpers available: window.devHelpers');
    console.log('   - status(): Get app status');
    console.log('   - test(): Run tests');
    console.log('   - restart(): Restart app');
    console.log('   - reset(): Clear data and reload');
    console.log('   - testInvalidLogin(): Test invalid credentials');
    console.log('   - getUserData(): Get cached user data');
    console.log('   - testConnection(): Test GraphQL connection');
}
