// Configuration and Constants
const CONFIG = {
    // API Endpoints
    GRAPHQL_ENDPOINT: "https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql",
    AUTH_ENDPOINT: "https://learn.zone01kisumu.ke/api/auth/signin",
    
    // Storage Keys
    TOKEN_KEY: "zone01_token",
    USER_KEY: "zone01_user",
    
    // UI Settings
    LOADING_DELAY: 500,
    ANIMATION_DURATION: 300,
    
    // Chart Settings
    CHART_COLORS: {
        primary: "#2196F3",
        secondary: "#ff9800",
        success: "#4caf50",
        danger: "#f44336",
        warning: "#ff9800",
        info: "#17a2b8",
        light: "#f8f9fa",
        dark: "#343a40"
    },
    
    // XP Level Calculation
    XP_PER_LEVEL: 66000,
    
    // Error Messages
    ERRORS: {
        INVALID_CREDENTIALS: "Invalid username or password",
        NETWORK_ERROR: "Network error. Please check your connection",
        TOKEN_EXPIRED: "Session expired. Please login again",
        NO_DATA: "No data available",
        GRAPHQL_ERROR: "Failed to fetch data from server"
    },
    
    // Success Messages
    SUCCESS: {
        LOGIN: "Login successful",
        LOGOUT: "Logged out successfully",
        DATA_LOADED: "Profile data loaded successfully"
    }
};

// Feature Flags
const FEATURES = {
    ENABLE_BONUS_SECTIONS: true,
    ENABLE_CUSTOM_GRAPHIQL: true,
    ENABLE_ADVANCED_CHARTS: true,
    ENABLE_REAL_TIME_UPDATES: false,
    ENABLE_DARK_MODE: false
};

// Export for global access
window.CONFIG = CONFIG;
window.FEATURES = FEATURES;
