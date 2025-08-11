// Authentication Module

/**
 * Authentication class to handle login/logout operations
 */
class Auth {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
    }

    /**
     * Authenticate user with credentials
     * @param {string} username - Username or email
     * @param {string} password - Password
     * @returns {Promise<string>} - JWT token
     * @throws {Error} - Authentication error
     */
    async login(username, password) {
        try {
            // Validate input
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            // Show loading
            Utils.showLoading();

            // Encode credentials
            const encodedCredentials = Utils.base64Encode(`${username}:${password}`);
            if (!encodedCredentials) {
                throw new Error('Failed to encode credentials');
            }

            // Make authentication request
            const response = await fetch(CONFIG.AUTH_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${encodedCredentials}`,
                    'Content-Type': 'application/json'
                },
            });

            // Handle response
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error(CONFIG.ERRORS.INVALID_CREDENTIALS);
                } else {
                    throw new Error(`${CONFIG.ERRORS.NETWORK_ERROR} (${response.status})`);
                }
            }

            const data = await response.json();
            const token = typeof data === 'string' ? data : data.jwt;

            if (!token) {
                throw new Error('No token received from server');
            }

            // Validate token
            const payload = Utils.parseJwt(token);
            if (!payload || !payload.sub) {
                throw new Error('Invalid token received');
            }

            // Store token
            localStorage.setItem(CONFIG.TOKEN_KEY, token);
            this.isLoggedIn = true;

            Utils.hideLoading();
            return token;

        } catch (error) {
            Utils.hideLoading();
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logout current user
     */
    logout() {
        try {
            // Clear stored data
            Utils.clearStoredData();
            
            // Reset state
            this.isLoggedIn = false;
            this.currentUser = null;

            // Show success message
            Utils.showSuccess(CONFIG.SUCCESS.LOGOUT);

            // Redirect to login
            setTimeout(() => {
                UI.renderLogin();
            }, 1000);

        } catch (error) {
            console.error('Logout error:', error);
            Utils.showError('Error during logout');
        }
    }

    /**
     * Check if user is currently authenticated
     * @returns {boolean} - Authentication status
     */
    isAuthenticated() {
        return Utils.isAuthenticated();
    }

    /**
     * Get current user ID from token
     * @returns {number|null} - User ID or null if not authenticated
     */
    getCurrentUserId() {
        try {
            return Utils.getUserIdFromToken();
        } catch (error) {
            return null;
        }
    }

    /**
     * Get stored token
     * @returns {string|null} - JWT token or null
     */
    getToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    }

    /**
     * Validate current session
     * @returns {boolean} - True if session is valid
     */
    validateSession() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = Utils.parseJwt(token);
            if (!payload || !payload.exp) return false;

            // Check if token is expired
            const now = Date.now() / 1000;
            if (payload.exp <= now) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Session validation error:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Initialize authentication state
     */
    init() {
        const token = this.getToken();
        if (token && this.validateSession()) {
            this.isLoggedIn = true;
            return true;
        } else {
            this.isLoggedIn = false;
            return false;
        }
    }

    /**
     * Handle authentication errors
     * @param {Error} error - Error object
     */
    handleAuthError(error) {
        console.error('Authentication error:', error);
        
        if (error.message.includes('401') || error.message.includes('token')) {
            this.logout();
        } else {
            Utils.showError(error.message || CONFIG.ERRORS.NETWORK_ERROR);
        }
    }

    /**
     * Refresh token if needed (placeholder for future implementation)
     * @returns {Promise<string>} - New token
     */
    async refreshToken() {
        // This would be implemented if the API supports token refresh
        throw new Error('Token refresh not implemented');
    }

    /**
     * Get user info from token
     * @returns {object|null} - User info or null
     */
    getUserInfoFromToken() {
        try {
            const token = this.getToken();
            if (!token) return null;

            const payload = Utils.parseJwt(token);
            return {
                id: payload.sub,
                username: payload.username || payload.login,
                email: payload.email,
                exp: payload.exp,
                iat: payload.iat
            };
        } catch (error) {
            console.error('Error extracting user info from token:', error);
            return null;
        }
    }
}

// Create global auth instance
window.auth = new Auth();
