// GraphQL Queries Module

/**
 * GraphQL Queries class containing all query definitions
 * Covers: Normal queries, Nested queries, Queries with arguments
 */
class Queries {
    
    /**
     * Normal Query: Get basic user information
     * @returns {object} - GraphQL query object
     */
    static getUserInfo() {
        return {
            query: `{
                user {
                    id
                    login
                    firstName
                    lastName
                    email
                    createdAt
                    updatedAt
                }
            }`
        };
    }

    /**
     * Query with Arguments: Get user XP transactions
     * @param {number} userId - User ID
     * @returns {object} - GraphQL query object
     */
    static getUserTransactions(userId) {
        return {
            query: `{
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
                    objectId
                }
            }`
        };
    }

    /**
     * Aggregate Query: Get audit up data
     * @param {number} userId - User ID
     * @returns {object} - GraphQL query object
     */
    static getAuditUp(userId) {
        return {
            query: `{
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

    /**
     * Aggregate Query: Get audit down data
     * @param {number} userId - User ID
     * @returns {object} - GraphQL query object
     */
    static getAuditDown(userId) {
        return {
            query: `{
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

    /**
     * Nested Query: Get user progress with object details
     * @param {number} userId - User ID
     * @returns {object} - GraphQL query object
     */
    static getUserProgress(userId) {
        return {
            query: `{
                progress(
                    where: {
                        userId: {_eq: ${userId}}
                    },
                    order_by: {createdAt: desc}
                ) {
                    id
                    grade
                    createdAt
                    updatedAt
                    path
                    objectId
                    object {
                        id
                        name
                        type
                        attrs
                    }
                }
            }`
        };
    }

    /**
     * Nested Query: Get user results with object details
     * @param {number} userId - User ID
     * @returns {object} - GraphQL query object
     */
    static getUserResults(userId) {
        return {
            query: `{
                result(
                    where: {
                        userId: {_eq: ${userId}}
                    },
                    order_by: {createdAt: desc}
                ) {
                    id
                    grade
                    type
                    createdAt
                    updatedAt
                    path
                    objectId
                    object {
                        id
                        name
                        type
                        attrs
                    }
                }
            }`
        };
    }

    /**
     * Complex Query with Arguments: Get user projects with filtering
     * @param {number} userId - User ID
     * @returns {object} - GraphQL query object
     */
    static getUserProjects(userId) {
        return {
            query: `{
                progress(
                    where: {
                        userId: {_eq: ${userId}},
                        object: {
                            type: {_eq: "project"}
                        }
                    },
                    order_by: {createdAt: desc}
                ) {
                    id
                    grade
                    createdAt
                    updatedAt
                    path
                    objectId
                    object {
                        id
                        name
                        type
                        attrs
                    }
                }
            }`
        };
    }

    /**
     * Bonus Query: Get user skills data (multiple approaches)
     * @param {number} userId - User ID
     * @returns {object} - GraphQL query object
     */
    static getUserSkills(userId) {
        return {
            query: `{
                # Try to get skill transactions
                skillTransactions: transaction(
                    where: {
                        type: {_eq: "skill"},
                        userId: {_eq: ${userId}}
                    },
                    order_by: {amount: desc}
                ) {
                    id
                    type
                    amount
                    createdAt
                    path
                    objectId
                    object {
                        name
                        type
                        attrs
                    }
                }

                # Get project-based skills from progress
                projectSkills: progress(
                    where: {
                        userId: {_eq: ${userId}},
                        grade: {_gte: 1}
                    },
                    order_by: {createdAt: desc}
                ) {
                    id
                    grade
                    createdAt
                    path
                    object {
                        name
                        type
                        attrs
                    }
                }
            }`
        };
    }

    /**
     * Advanced Nested Query: Get user with all related data
     * @param {number} userId - User ID
     * @returns {object} - GraphQL query object
     */
    static getUserWithRelations(userId) {
        return {
            query: `{
                user(where: {id: {_eq: ${userId}}}) {
                    id
                    login
                    firstName
                    lastName
                    email
                    createdAt
                    transactions(
                        where: {type: {_eq: "xp"}},
                        order_by: {createdAt: asc}
                    ) {
                        id
                        amount
                        createdAt
                        path
                    }
                    progresses(
                        order_by: {createdAt: desc},
                        limit: 10
                    ) {
                        id
                        grade
                        createdAt
                        path
                        object {
                            name
                            type
                        }
                    }
                }
            }`
        };
    }

    /**
     * Query with Complex Arguments: Get recent activity
     * @param {number} userId - User ID
     * @param {number} days - Number of days to look back
     * @returns {object} - GraphQL query object
     */
    static getRecentActivity(userId, days = 30) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        const isoDate = dateThreshold.toISOString();

        return {
            query: `{
                transaction(
                    where: {
                        userId: {_eq: ${userId}},
                        createdAt: {_gte: "${isoDate}"}
                    },
                    order_by: {createdAt: desc}
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

    /**
     * Bonus Query: Get leaderboard data (if accessible)
     * @param {number} limit - Number of users to fetch
     * @returns {object} - GraphQL query object
     */
    static getLeaderboard(limit = 10) {
        return {
            query: `{
                user(
                    limit: ${limit},
                    order_by: {
                        transactions_aggregate: {
                            sum: {amount: desc}
                        }
                    }
                ) {
                    id
                    login
                    firstName
                    lastName
                    transactions_aggregate(
                        where: {type: {_eq: "xp"}}
                    ) {
                        aggregate {
                            sum {
                                amount
                            }
                        }
                    }
                }
            }`
        };
    }

    /**
     * Introspection Query: Get schema information
     * @returns {object} - GraphQL query object
     */
    static getSchemaInfo() {
        return {
            query: `{
                __schema {
                    types {
                        name
                        kind
                        description
                    }
                }
            }`
        };
    }

    /**
     * Query for GraphiQL exploration: Get available tables
     * @returns {object} - GraphQL query object
     */
    static getAvailableTables() {
        return {
            query: `{
                __schema {
                    queryType {
                        fields {
                            name
                            type {
                                name
                                kind
                            }
                        }
                    }
                }
            }`
        };
    }
}

// Export to global scope
window.Queries = Queries;
