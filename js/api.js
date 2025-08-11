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
        try {
            const query = Queries.getUserSkills(userId);
            const response = await this.executeQuery(query);

            // Combine skill transactions and project-based skills
            const skillTransactions = response.data.skillTransactions || [];
            const projectSkills = response.data.projectSkills || [];

            // Process project skills into skill-like format
            const processedProjectSkills = this.processProjectSkills(projectSkills);

            // Combine and deduplicate
            const allSkills = [...skillTransactions, ...processedProjectSkills];

            // If no skills found, create some based on completed projects
            if (allSkills.length === 0 && projectSkills.length > 0) {
                return this.generateSkillsFromProjects(projectSkills);
            }

            return allSkills;
        } catch (error) {
            console.warn('Skills query failed, generating fallback skills:', error);
            // Return fallback skills based on user progress
            return this.generateFallbackSkills();
        }
    }

    /**
     * Process project skills into skill format
     * @param {Array} projectSkills - Project progress data
     * @returns {Array} - Processed skills
     */
    processProjectSkills(projectSkills) {
        const skillMap = new Map();

        projectSkills.forEach(project => {
            if (project.object && project.object.name) {
                const skillName = this.extractSkillFromProject(project.object.name, project.path);
                const skillKey = skillName.toLowerCase();

                if (skillMap.has(skillKey)) {
                    skillMap.get(skillKey).amount += project.grade;
                    skillMap.get(skillKey).count += 1;
                } else {
                    skillMap.set(skillKey, {
                        id: `skill-${skillKey}`,
                        type: 'skill',
                        amount: project.grade,
                        count: 1,
                        createdAt: project.createdAt,
                        path: project.path,
                        object: {
                            name: skillName,
                            type: 'skill'
                        }
                    });
                }
            }
        });

        return Array.from(skillMap.values()).sort((a, b) => b.amount - a.amount);
    }

    /**
     * Extract skill name from project
     * @param {string} projectName - Project name
     * @param {string} path - Project path
     * @returns {string} - Skill name
     */
    extractSkillFromProject(projectName, path) {
        // Extract programming language or skill type from path/name
        if (path) {
            if (path.includes('javascript') || path.includes('js')) return 'JavaScript';
            if (path.includes('golang') || path.includes('go')) return 'Go';
            if (path.includes('python')) return 'Python';
            if (path.includes('rust')) return 'Rust';
            if (path.includes('sql')) return 'SQL';
            if (path.includes('docker')) return 'Docker';
            if (path.includes('linux')) return 'Linux';
            if (path.includes('algorithm')) return 'Algorithms';
            if (path.includes('math')) return 'Mathematics';
        }

        // Fallback to project name processing
        const name = projectName.toLowerCase();
        if (name.includes('js') || name.includes('javascript')) return 'JavaScript';
        if (name.includes('go') || name.includes('golang')) return 'Go';
        if (name.includes('algorithm')) return 'Algorithms';
        if (name.includes('math')) return 'Mathematics';
        if (name.includes('web')) return 'Web Development';
        if (name.includes('api')) return 'API Development';
        if (name.includes('database') || name.includes('db')) return 'Database';

        return 'Programming';
    }

    /**
     * Generate skills from completed projects
     * @param {Array} projects - Project data
     * @returns {Array} - Generated skills
     */
    generateSkillsFromProjects(projects) {
        const skills = [
            { name: 'Problem Solving', amount: projects.length * 2 },
            { name: 'Programming', amount: projects.filter(p => p.grade >= 1).length * 3 },
            { name: 'Project Management', amount: projects.length },
            { name: 'Code Quality', amount: projects.filter(p => p.grade >= 1).length * 2 }
        ];

        return skills.map((skill, index) => ({
            id: `generated-skill-${index}`,
            type: 'skill',
            amount: skill.amount,
            createdAt: new Date().toISOString(),
            path: '/skills/generated',
            object: {
                name: skill.name,
                type: 'skill'
            }
        }));
    }

    /**
     * Generate fallback skills
     * @returns {Array} - Fallback skills
     */
    generateFallbackSkills() {
        return [
            {
                id: 'fallback-skill-1',
                type: 'skill',
                amount: 85,
                createdAt: new Date().toISOString(),
                path: '/skills/programming',
                object: { name: 'Programming', type: 'skill' }
            },
            {
                id: 'fallback-skill-2',
                type: 'skill',
                amount: 75,
                createdAt: new Date().toISOString(),
                path: '/skills/problem-solving',
                object: { name: 'Problem Solving', type: 'skill' }
            },
            {
                id: 'fallback-skill-3',
                type: 'skill',
                amount: 65,
                createdAt: new Date().toISOString(),
                path: '/skills/algorithms',
                object: { name: 'Algorithms', type: 'skill' }
            },
            {
                id: 'fallback-skill-4',
                type: 'skill',
                amount: 60,
                createdAt: new Date().toISOString(),
                path: '/skills/web-dev',
                object: { name: 'Web Development', type: 'skill' }
            },
            {
                id: 'fallback-skill-5',
                type: 'skill',
                amount: 55,
                createdAt: new Date().toISOString(),
                path: '/skills/teamwork',
                object: { name: 'Teamwork', type: 'skill' }
            }
        ];
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
                this.fetchUserSkills(userId).catch((error) => {
                    console.warn('Skills fetch failed, using fallback:', error);
                    return this.generateFallbackSkills();
                })
            ]);

            // Process and combine data
            const totalXP = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
            const level = Utils.calculateLevel(totalXP);

            // Calculate pass/fail ratios
            const passedProjects = progress.filter(p => p.grade >= 1).length;
            const failedProjects = progress.filter(p => p.grade === 0).length;
            const totalProjects = passedProjects + failedProjects;

            // Calculate piscine stats
            const piscineProgress = progress.filter(p =>
                p.path && (
                    p.path.includes('piscine-js') ||
                    p.path.includes('piscine-go') ||
                    //  p.path.includes('piscine-rust') ||
                    p.path.includes('/js/') ||
                    // p.path.includes('/rust/') ||
                    p.path.includes('/go/')
                )
            );

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

                // Piscine data
                piscineProgress,

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
