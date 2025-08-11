// Utility Functions

/**
 * Base64 encoding utility
 * @param {string} str - String to encode
 * @returns {string|null} - Encoded string or null on error
 */
function base64Encode(str) {
    try {
        return btoa(str);
    } catch (e) {
        console.error("Error encoding string:", e);
        return null;
    }
}

/**
 * Parse JWT token to extract payload
 * @param {string} token - JWT token
 * @returns {object|null} - Parsed payload or null on error
 */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error parsing JWT:", error);
        return null;
    }
}

/**
 * Extract user ID from JWT token
 * @returns {number} - User ID
 * @throws {Error} - If token is invalid or missing
 */
function getUserIdFromToken() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    const payload = parseJwt(token);
    if (!payload || !payload.sub) {
        throw new Error('Invalid token or missing user ID');
    }
    
    return parseInt(payload.sub);
}

/**
 * Format XP amount with appropriate units
 * @param {number} xpAmount - XP amount to format
 * @returns {string} - Formatted XP string
 */
function formatXP(xpAmount) {
    if (xpAmount >= 1000000) {
        return `${(xpAmount / 1000000).toFixed(2)} MB`;
    } else if (xpAmount >= 1000) {
        return `${Math.round(xpAmount / 1000)} kB`;
    } else {
        return `${xpAmount} B`;
    }
}

/**
 * Calculate user level based on total XP
 * @param {number} totalXP - Total XP amount
 * @returns {number} - User level
 */
function calculateLevel(totalXP) {
    return Math.floor(totalXP / CONFIG.XP_PER_LEVEL);
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format date and time for display
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted datetime string
 */
function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} - Percentage
 */
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show loading spinner
 */
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 * @param {HTMLElement} container - Container element
 */
function showError(message, container = null) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    if (container) {
        container.appendChild(errorDiv);
    } else {
        const app = document.getElementById('app');
        app.insertBefore(errorDiv, app.firstChild);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

/**
 * Show success message
 * @param {string} message - Success message
 * @param {HTMLElement} container - Container element
 */
function showSuccess(message, container = null) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    
    if (container) {
        container.appendChild(successDiv);
    } else {
        const app = document.getElementById('app');
        app.insertBefore(successDiv, app.firstChild);
    }
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate random ID
 * @returns {string} - Random ID
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} - Cloned object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated
 */
function isAuthenticated() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    if (!token) return false;
    
    try {
        const payload = parseJwt(token);
        if (!payload || !payload.exp) return false;
        
        // Check if token is expired
        const now = Date.now() / 1000;
        return payload.exp > now;
    } catch (error) {
        return false;
    }
}

/**
 * Clear all stored data
 */
function clearStoredData() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
}

// Export functions to global scope
window.Utils = {
    base64Encode,
    parseJwt,
    getUserIdFromToken,
    formatXP,
    calculateLevel,
    formatDate,
    formatDateTime,
    calculatePercentage,
    debounce,
    showLoading,
    hideLoading,
    showError,
    showSuccess,
    isValidEmail,
    generateId,
    deepClone,
    isAuthenticated,
    clearStoredData
};
