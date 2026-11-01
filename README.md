# Custom API Workflow Action

A HubSpot workflow action that enables sending HTTP API calls/webhooks directly from workflows with support for multiple authentication types.

[![HubSpot Platform](https://img.shields.io/badge/HubSpot-Platform%202025.2-orange)](https://developers.hubspot.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🚀 Features

- **Multiple HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Saved connections**: store an API's base URL and credentials once, encrypted on the backend, and reuse them across workflows without exposing the secret
- **AI agent tools (beta)**: let HubSpot AI agents call APIs through connections an admin has enabled
- **Authentication Support**:
  - Saved connection (recommended)
  - None (public APIs)
  - Bearer Token
  - API Key (custom header)
  - Basic Authentication
- **Flexible Configuration**:
  - Custom query parameters
  - Custom headers
  - JSON request body
  - Configurable timeout
- **Comprehensive Output**:
  - HTTP status code
  - Response body
  - Success/failure status
  - Error messages
- **Universal Support**: Works with all HubSpot objects including custom objects

## 📋 Architecture

This workflow action uses an external server approach to handle dynamic API calls:

```
Workflow → HubSpot → hub.kinghenry.au/api/apps/custom-api-workflow/execute → Target API
Agent    → HubSpot → hub.kinghenry.au/api/apps/custom-api-workflow/agent/*  → Target API
```

The workflow action sends configuration to our secure server endpoint, which makes the actual HTTP request to the user-specified API and returns the response.

## 🔧 Installation

### Prerequisites

- HubSpot account with workflow access
- Access to deploy the OAuth handler server (or use our hosted version)

### Steps

1. **Install the App** (Coming soon to HubSpot Marketplace)
   - Or contact support@kinghenry.au for private installation

2. **Complete OAuth Authorization**
   - Navigate to Settings → Integrations → Private Apps
   - Find "Custom API Workflow Action"
   - Click "Connect" and authorize

3. **Start Using in Workflows**
   - Create or edit a workflow
   - Add "Custom API Call" action
   - Configure your API endpoint and authentication

## 📖 Usage

### Basic GET Request

```
API URL: https://api.example.com/data
HTTP Method: GET
Authentication Type: None
```

### POST with Bearer Token

```
API URL: https://api.example.com/users
HTTP Method: POST
Authentication Type: Bearer Token
Bearer Token: your-secret-token
Request Body: {"name": "John Doe", "email": "john@example.com"}
```

### API Key Authentication

```
API URL: https://api.example.com/data
HTTP Method: GET
Authentication Type: API Key
API Key Header Name: X-API-Key
API Key Value: your-api-key
```

### Query Parameters

```
API URL: https://api.example.com/search
HTTP Method: GET
Query Parameters: {"query": "test", "limit": "10"}
```

### Custom Headers

```
API URL: https://api.example.com/data
HTTP Method: POST
Custom Headers: {"Content-Type": "application/json", "X-Request-ID": "12345"}
Request Body: {"data": "value"}
```

## 🎯 Use Cases

- **Webhooks**: Send notifications to Slack, Microsoft Teams, Discord
- **Automation**: Trigger workflows in Zapier, Make, n8n
- **Data Sync**: Update external databases or CRMs
- **Microservices**: Call internal APIs and services
- **Integrations**: Connect with payment processors, shipping providers
- **Analytics**: Send data to monitoring and analytics platforms

## 📊 Output Fields

Use these fields in subsequent workflow actions:

- `status_code` (number): HTTP response status (200, 404, 500, etc.)
- `response_body` (string): API response content
- `success` (boolean): Request success indicator
- `error_message` (string): Error details if request failed

**Example Workflow Branch:**
```
If success = true → Send success email
If success = false → Send alert to admin
```

## 🔒 Security Features

- **HTTPS Only**: Only HTTPS URLs are accepted
- **SSRF Protection**: Blocks localhost, private IP addresses and hostnames that resolve to them, including on redirects
- **Timeout Limits**: Maximum 15-second request timeout
- **Response Size Limits**: 100KB maximum response size
- **Saved connections**: Credentials are encrypted (AES-256-GCM) on the backend, never returned to HubSpot, and only sent to the connection's own host
- **Inline credentials**: Credentials typed directly into a workflow action are stored in the workflow and visible to anyone who can view it
- **Request Validation**: Comprehensive input validation

## 🧪 Testing

See [TEST_SCENARIOS.md](TEST_SCENARIOS.md) for 19 comprehensive test scenarios using httpbin.org and real-world integrations.

**Quick Test:**
```
API URL: https://httpbin.org/get
HTTP Method: GET
Authentication Type: None
```

Expected: `status_code: 200`, `success: true`

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment and OAuth configuration guide
- **[TEST_SCENARIOS.md](TEST_SCENARIOS.md)** - Ready-to-use test configurations
- **[CLAUDE.md](CLAUDE.md)** - Developer guide for HubSpot projects
- **[AGENTS.md](AGENTS.md)** - AI agent integration guide

## 🛠️ Development

### Project Structure

```
custom-api-workflow-action/
├── hsproject.json                 # HubSpot project configuration
├── README.md                      # This file
├── DEPLOYMENT.md                  # Deployment guide
├── TEST_SCENARIOS.md              # Test scenarios
└── src/
    └── app/
        ├── app-hsmeta.json        # OAuth configuration
        ├── settings/
        │   ├── settings-page-hsmeta.json
        │   ├── SettingsPage.tsx   # Settings UI
        │   └── package.json
        └── workflow-actions/
            └── workflow-actions-hsmeta.json  # Workflow action config
```

### Local Development

```bash
# Start local development server
hs project dev

# Validate project
hs project validate

# Upload to HubSpot
hs project upload --message "Your update message"

# Deploy build
hs project deploy --build BUILD_NUMBER
```

### Server Endpoint

The workflow action endpoint is located in the `hubspot-oauth-handler` repository:

- Endpoint: `POST /api/workflow-action/execute`
- Location: `/Users/marcelrees/Projects/hubspot/hubspot-oauth-handler/server.js`

## 🚦 Status

- ✅ **Build #3**: Successfully deployed
- ✅ **OAuth**: Configured and ready
- ✅ **Endpoint**: Server implementation complete
- ✅ **Distribution**: Marketplace

## 🤝 Support

For issues, questions, or feature requests:

- **Email**: support@kinghenry.au
- **GitHub Issues**: [Create an issue](https://github.com/kinghenry-marcel/custom-api-workflow-action/issues)
- **Documentation**: https://github.com/kinghenry-marcel/custom-api-workflow-action

## 📄 License

MIT License - see LICENSE file for details

## 🏗️ Built With

- **HubSpot Platform**: 2025.2
- **React**: 18.2.0
- **@hubspot/ui-extensions**: Latest
- **Node.js**: 18+
- **Express**: Server endpoint implementation

## 🙏 Acknowledgments

- Built for the HubSpot Developer Platform
- Powered by oauth.kinghenry.au infrastructure
- Tested with httpbin.org

---

**Version**: 1.0.0 (Build #3)
**Last Updated**: 2026-03-09
**Platform**: HubSpot 2025.2
**Distribution**: Marketplace
