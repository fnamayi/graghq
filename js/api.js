// API Module for GraphQL operations

/**
 * API class to handle GraphQL requests
 */
class API {
    constructor() {
        this.endpoint = CONFIG.GRAPHQL_ENDPOINT;
    }

    /**
     * Execute GraphQL query
     * @param {object} queryObject - GraphQL query object
     * @returns {Promise<object>} - Query result
     * @throws {Error} - API error
     */
    async executeQuery(queryObject) {
        try {
            const token = auth.getToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(queryObject)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    auth.handleAuthError(new Error(CONFIG.ERRORS.TOKEN_EXPIRED));
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.errors && data.errors.length > 0) {
                console.error("GraphQL Errors:", data.errors);
                throw new Error(`GraphQL Error: ${data.errors[0].message}`);
            }

            return data;

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Fetch user basic information
     * @returns {Promise<object>} - User data
     */
    async fetchUserInfo() {
        const query = Queries.getUserInfo();
        const response = await this.executeQuery(query);
        
        if (!response.data.user || response.data.user.length === 0) {
            throw new Error('User information not found');
        }

        return response.data.user[0];
    }

    /**
     * Fetch user XP transactions
     * @param {number} userId - User ID
     * @returns {Promise<Array>} - Transaction data
     */
    async fetchUserTransactions(userId) {
        const query = Queries.getUserTransactions(userId);
        const response = await this.executeQuery(query);
        return response.data.transaction || [];
    }

    /**
     * Fetch user audit data (up/down)
     * @param {number} userId - User ID
     * @returns {Promise<object>} - Audit data
     */
    async fetchAuditData(userId) {
        const [upQuery, downQuery] = [
            Queries.getAuditUp(userId),
            Queries.getAuditDown(userId)
        ];

        const [upResponse, downResponse] = await Promise.all([
            this.executeQuery(upQuery),
            this.executeQuery(downQuery)
        ]);

        return {
            up: upResponse.data.transaction_aggregate.aggregate.sum?.amount || 0,
            down: downResponse.data.transaction_aggregate.aggregate.sum?.amount || 0
        };
    }

    /**
     * Fetch user progress data
     * @param {number} userId - User ID
     * @returns {Promise<Array>} - Progress data
     */
    async fetchUserProgress(userId) {
        const query = Queries.getUserProgress(userId);
        const response = await this.executeQuery(query);
        return response.data.progress || [];
    }

    /**
     * Fetch user results data
     * @param {number} userId - User ID
     * @returns {Promise<Array>} - Results data
     */
    async fetchUserResults(userId) {
        const query = Queries.getUserResults(userId);
        const response = await this.executeQuery(query);
        return response.data.result || [];
    }

    /**
     * Fetch projects data
     * @param {number} userId - User ID
     * @returns {Promise<Array>} - Projects data
     */
    async fetchUserProjects(userId) {
        const query = Queries.getUserProjects(userId);
        const response = await this.executeQuery(query);
        return response.data.progress || [];
    }

    /**
     * Fetch skills data (bonus)
     * @param {number} userId - User ID
     * @returns {Promise<Array>} - Skills data
     */
    async fetchUserSkills(userId) {
        const query = Queries.getUserSkills(userId);
        const response = await this.executeQuery(query);
        return response.data.transaction || [];
    }

    /**
     * Fetch comprehensive user data
     * @returns {Promise<object>} - Complete user profile data
     */
    async fetchCompleteUserData() {
        try {
            Utils.showLoading();
            
            const userId = auth.getCurrentUserId();
            if (!userId) {
                throw new Error('User ID not available');
            }

            // Fetch all data in parallel
            const [
                userInfo,
                transactions,
                auditData,
                progress,
                results,
                projects,
                skills
            ] = await Promise.all([
                this.fetchUserInfo(),
                this.fetchUserTransactions(userId),
                this.fetchAuditData(userId),
                this.fetchUserProgress(userId),
                this.fetchUserResults(userId),
                this.fetchUserProjects(userId),
                this.fetchUserSkills(userId).catch(() => []) // Optional data
            ]);

            // Process and combine data
            const totalXP = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
            const level = Utils.calculateLevel(totalXP);

            // Calculate pass/fail ratios
            const passedProjects = progress.filter(p => p.grade >= 1).length;
            const failedProjects = progress.filter(p => p.grade === 0).length;
            const totalProjects = passedProjects + failedProjects;

            const userData = {
                // Basic info (Section 1)
                id: userId,
                login: userInfo.login,
                firstName: userInfo.firstName || userInfo.login,
                lastName: userInfo.lastName || '',
                email: userInfo.email || '',

                // XP and Level (Section 2)
                totalXP,
                level,
                transactions,
                formattedXP: Utils.formatXP(totalXP),

                // Audit info (Section 3)
                auditUp: auditData.up,
                auditDown: auditData.down,
                auditRatio: auditData.down > 0 ? (auditData.up / auditData.down).toFixed(2) : 'N/A',

                // Progress and Projects
                progress,
                results,
                projects,
                passedProjects,
                failedProjects,
                totalProjects,
                passRate: totalProjects > 0 ? Utils.calculatePercentage(passedProjects, totalProjects) : 0,

                // Skills (bonus)
                skills,

                // Metadata
                lastUpdated: new Date().toISOString(),
                dataComplete: true
            };

            // Store user data
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(userData));
            
            Utils.hideLoading();
            return userData;

        } catch (error) {
            Utils.hideLoading();
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    /**
     * Get cached user data
     * @returns {object|null} - Cached user data or null
     */
    getCachedUserData() {
        try {
            const cached = localStorage.getItem(CONFIG.USER_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error reading cached data:', error);
            return null;
        }
    }

    /**
     * Clear cached user data
     */
    clearCache() {
        localStorage.removeItem(CONFIG.USER_KEY);
    }

    /**
     * Test GraphQL connection
     * @returns {Promise<boolean>} - Connection status
     */
    async testConnection() {
        try {
            const query = { query: "{ __typename }" };
            await this.executeQuery(query);
            return true;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }
}

// Create global API instance
window.api = new API();
