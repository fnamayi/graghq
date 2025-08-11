# Zone01 Profile Dashboard

A comprehensive GraphQL-based profile dashboard for Zone01 students, featuring authentication, data visualization, and interactive charts.

## 🚀 Features

### Core Requirements ✅
- **Authentication System**: Login with username/email and password
- **JWT Token Inspection**: Extracts user ID from JWT for personalized data
- **Three Required Sections**:
  1. **User Information**: Basic identification (login, name, ID, level)
  2. **Experience Points**: XP amount, level calculation, transaction history
  3. **Audit Information**: Audit given/received, ratio calculations
- **Graphical Statistics Section**: Multiple SVG-based charts and visualizations
- **GraphQL Integration**: Normal, nested, and argument-based queries
- **Logout Functionality**: Secure session management

### Bonus Features 🎯
- **Additional Information Sections**: Skills, achievements, project statistics
- **Extra Charts**: 4+ different chart types (line, bar, pie, radar)
- **Custom GraphiQL Interface**: Built-in GraphQL explorer and query builder
- **Advanced Statistics**: Pass/fail ratios, progress tracking, skill analysis
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Comprehensive error management and user feedback

## 📁 Project Structure

```
graphql/
├── index.html              # Main application entry point
├── graphiql.html           # Custom GraphiQL interface (bonus)
├── test.html              # Testing and validation suite
├── README.md              # Project documentation
├── css/
│   └── styles.css         # Application styles
└── js/
    ├── config.js          # Configuration and constants
    ├── utils.js           # Utility functions
    ├── auth.js            # Authentication module
    ├── api.js             # GraphQL API interface
    ├── queries.js         # GraphQL query definitions
    ├── charts.js          # SVG chart creation
    ├── ui.js              # User interface management
    └── app.js             # Main application controller
```

## 🛠️ Installation & Setup

### Prerequisites
- Modern web browser with JavaScript enabled
- Python 3.x (for local HTTP server)
- Valid Zone01 credentials

### Quick Start
1. **Clone or download** the project files
2. **Navigate** to the project directory:
   ```bash
   cd graphql
   ```
3. **Start HTTP server**:
   ```bash
   python3 -m http.server 8000
   ```
4. **Open browser** and navigate to:
   ```
   http://localhost:8000
   ```

### Alternative Hosting
The application works with any HTTP server:
- **Node.js**: `npx http-server`
- **PHP**: `php -S localhost:8000`
- **Apache/Nginx**: Deploy to web server
- **GitHub Pages**: Host directly from repository

## 📊 GraphQL Queries

The application demonstrates all required query types:

### Normal Queries
```graphql
{
  user {
    id
    login
    firstName
    lastName
  }
}
```

### Nested Queries
```graphql
{
  user {
    id
    login
    transactions(limit: 5) {
      amount
      createdAt
      type
    }
    progresses(limit: 5) {
      grade
      object {
        name
        type
      }
    }
  }
}
```

### Queries with Arguments
```graphql
{
  transaction(
    where: {
      type: {_eq: "xp"},
      userId: {_eq: 123}
    },
    order_by: {createdAt: desc},
    limit: 10
  ) {
    amount
    createdAt
    path
  }
}
```

### Aggregate Queries
```graphql
{
  transaction_aggregate(
    where: {
      type: {_eq: "xp"},
      userId: {_eq: 123}
    }
  ) {
    aggregate {
      sum {
        amount
      }
      count
    }
  }
}
```

## 📈 Charts & Visualizations

### Required Charts (2+)
1. **XP Progress Over Time**: Line chart showing cumulative XP growth
2. **Audit Ratio Visualization**: Bar chart comparing audit given vs received

### Project Requirement Charts
3. **XP Earned by Project**: Bar chart showing XP distribution across projects
4. **Piscine (JS/Go) Statistics**: Grouped bar chart showing pass/fail rates for JavaScript and Go piscines

### Bonus Charts
5. **Project Pass/Fail Ratio**: Pie chart showing overall success rate
6. **Skills Analysis**: Bar chart of top skills and achievements

**Total: 6 different chart types implemented!**

All charts are created using pure SVG without external dependencies, featuring:
- Interactive tooltips with detailed information
- Responsive design that adapts to container size
- Color-coded data for easy interpretation
- Professional styling with proper legends and labels

## 🔐 Authentication

### Login Process
1. Enter Zone01 username/email and password
2. Application encodes credentials using Base64
3. Sends POST request to Zone01 auth endpoint
4. Receives JWT token on successful authentication
5. Stores token securely in localStorage
6. Uses token for all subsequent GraphQL requests

### JWT Token Inspection
- Parses JWT payload to extract user ID (`sub` field)
- Validates token expiration
- Uses user ID to filter all GraphQL queries
- Ensures data privacy and security

### Error Handling
- **Invalid Credentials**: Clear error message displayed
- **Network Errors**: Appropriate error handling and retry options
- **Token Expiration**: Automatic logout and re-authentication prompt

## 🧪 Testing

### Manual Testing
1. **Open test suite**: Navigate to `test.html`
2. **Follow test instructions**: Step-by-step validation guide
3. **Verify requirements**: Interactive checklist of all features

### Test Invalid Credentials
- Use test mode: `index.html?test=invalid`
- Verify appropriate error messages are shown

### Data Accuracy Verification
1. **Login to main application**
2. **Open GraphiQL explorer**: `graphiql.html`
3. **Set JWT token** in GraphiQL
4. **Run verification queries** to compare data
5. **Confirm accuracy** between GraphiQL and profile display



## 🔧 Technical Details

### Technologies Used
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Charts**: SVG with vanilla JavaScript
- **Authentication**: JWT tokens with Base64 encoding
- **API**: GraphQL with fetch API
- **Storage**: localStorage for token persistence

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+



## 📝 API Endpoints

- **GraphQL**: `https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql`
- **Authentication**: `https://learn.zone01kisumu.ke/api/auth/signin`

## 🤝 Contributing

This is a student project for Zone01. For educational purposes only.

## 📄 License

Educational use only. Zone01 project submission.

---

