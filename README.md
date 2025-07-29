# GuardDog Test Project

A simple TypeScript Express API designed to test GuardDog security scanning capabilities. This project includes various dependencies and code patterns that may trigger GuardDog's security heuristics.

## Features

- **Express.js API** with TypeScript
- **Authentication** using JWT tokens
- **Security middleware** (Helmet, CORS)
- **Logging** with Winston
- **Password hashing** with bcrypt
- **External API calls** with Axios
- **Data processing** with Lodash and Moment.js

## Project Structure

```
guarddog-test-project/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication middleware
│   │   └── errorHandler.ts   # Global error handling
│   ├── routes/
│   │   ├── auth.ts           # Authentication routes
│   │   └── users.ts          # User management routes
│   └── utils/
│       └── logger.ts         # Winston logging configuration
├── .env.example              # Environment variables template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

   Or for development with hot reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/verify` - Verify JWT token

### Users (Protected)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats/summary` - Get user statistics

### Health Check
- `GET /health` - Server health status

## Testing GuardDog

This project is specifically designed to test GuardDog's security scanning capabilities. It includes:

### Dependencies that may trigger alerts:
- **moment.js** - Known for security issues in older versions
- **lodash** - Has had prototype pollution vulnerabilities
- **axios** - HTTP client that makes external requests
- **jsonwebtoken** - JWT handling (sensitive operation)

### Code patterns that may trigger heuristics:
- **External API calls** in `/api/users/:id`
- **JWT token handling** throughout auth routes
- **Password hashing** operations
- **Dynamic data processing** with lodash
- **Environment variable usage** for secrets

### Files that GuardDog will scan:
- `package.json` - For dependency analysis
- All `.ts` files - For source code analysis
- `.env.example` - For potential secret patterns

## Running GuardDog Locally

To test GuardDog on this project:

```bash
# Install GuardDog
pip install guarddog

# Scan the package.json for suspicious packages
guarddog npm verify package.json

# Scan with specific rules
guarddog npm verify package.json --rules npm-exec-base64 --rules npm-exfiltrate-sensitive-data

# Output results as JSON
guarddog npm verify package.json --output-format json
```

## Expected GuardDog Results

Based on the dependencies and code patterns, you might see alerts for:

1. **Metadata heuristics**: Packages with potential security concerns
2. **Source code heuristics**: External HTTP requests, environment variable access
3. **Typosquatting**: If any dependencies have suspicious names
4. **Potentially compromised packages**: Based on maintainer email domains

## GitHub Actions Integration

This project includes a GitHub Actions workflow (`.github/workflows/guarddog.yml`) that automatically:

- Runs GuardDog scans on pull requests
- Uploads results to GitHub Security tab
- Provides automated security feedback

## Contributing

This is a test project for security scanning. Feel free to:

- Add more suspicious (but safe) dependencies
- Include additional code patterns that might trigger GuardDog
- Improve the API functionality
- Add more comprehensive tests

## Security Note

⚠️ **This project is for testing purposes only.** It includes various patterns that security tools flag as potentially suspicious. Do not use this code in production without proper security review and hardening.

## License

MIT License - See LICENSE file for details