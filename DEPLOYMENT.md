# Custom API Workflow Action - Deployment Guide

## ✅ Project Status

The HubSpot project has been successfully created and deployed:

- **Project Name:** Custom API Workflow Action
- **Build #:** 3 (deployed)
- **Distribution:** Marketplace
- **Portal:** king-henry-developer-account (49012930)
- **Project URL:** https://app.hubspot.com/developer-projects/49012930/project/Custom%20API%20Workflow%20Action

## 📋 What's Been Completed

### 1. ✅ Project Structure Created

- Platform version: 2025.2
- Distribution: Marketplace (OAuth)
- Features: App, Workflow Action, Settings Page

### 2. ✅ App Configuration (`app-hsmeta.json`)

- OAuth redirect URL: `https://oauth.kinghenry.au/oauth/callback/custom_api_workflow`
- Required scopes: `oauth`
- Optional scopes: CRM object read/write permissions
- Support email: support@kinghenry.au

### 3. ✅ Workflow Action Configured (`workflow-actions-hsmeta.json`)

- Action URL: `https://oauth.kinghenry.au/api/workflow-action/execute`
- 12 input fields with conditional field dependencies
- 4 output fields (status_code, response_body, success, error_message)
- Supports all object types (empty objectTypes array)

**Input Fields:**

- `step_name` (text, required) — custom label shown on workflow card
- `api_url` (text, required)
- `http_method` (select: GET/POST/PUT/PATCH/DELETE, required)
- `auth_type` (select: none/bearer/api_key/basic, required)
- `bearer_token` (text, conditional on auth_type=bearer)
- `api_key_header_name` (text, conditional on auth_type=api_key)
- `api_key_value` (text, conditional on auth_type=api_key)
- `basic_auth_username` (text, conditional on auth_type=basic)
- `basic_auth_password` (text, conditional on auth_type=basic)
- `query_parameters` (textarea, JSON)
- `custom_headers` (textarea, JSON)
- `request_body` (textarea, JSON)
- `timeout_seconds` (number, optional)

### 4. ✅ Server Endpoint Created

Added to `/Users/marcelrees/Projects/hubspot/hubspot-oauth-handler/server.js`:

- Endpoint: `POST /api/workflow-action/execute`
- Features:
  - HTTPS URL validation with SSRF protection
  - All authentication types (bearer, API key, basic, none)
  - Query parameter parsing and URL building
  - Custom headers support
  - Request body parsing for POST/PUT/PATCH
  - Configurable timeout (max 60 seconds)
  - Comprehensive error handling
  - Response truncation for large payloads (100KB limit)

### 5. ✅ Settings Page Created

- Professional UI with feature descriptions
- Security best practices section
- Example use cases
- Support contact information

## 🔑 Next Steps: OAuth Configuration

### Step 1: Get OAuth Credentials from HubSpot

The project details page should now be open in your browser. Navigate to:

1. Go to the project page (should be open): https://app.hubspot.com/developer-projects/49012930/project/Custom%20API%20Workflow%20Action
2. Click on the **"Auth"** tab or **"App settings"** section
3. Copy the following credentials:
   - **Client ID**
   - **Client Secret**

### Step 2: Update oauth.kinghenry.au Environment Variables

Add the new app configuration to the `HUBSPOT_APPS` environment variable:

```json
{
  "sidebar_quick_links": {
    "clientId": "existing_client_id",
    "clientSecret": "existing_client_secret",
    "redirectUri": "https://oauth.kinghenry.au/oauth/callback/sidebar_quick_links"
  },
  "custom_api_workflow": {
    "clientId": "YOUR_CLIENT_ID_FROM_HUBSPOT",
    "clientSecret": "YOUR_CLIENT_SECRET_FROM_HUBSPOT",
    "redirectUri": "https://oauth.kinghenry.au/oauth/callback/custom_api_workflow"
  }
}
```

### Step 3: Deploy oauth.kinghenry.au

The server code has already been updated at:
`/Users/marcelrees/Projects/hubspot/hubspot-oauth-handler/server.js`

**Deploy steps:**

```bash
cd /Users/marcelrees/Projects/hubspot/hubspot-oauth-handler

# Commit changes
git add server.js
git commit -m "Add workflow action endpoint for Custom API Workflow Action app"

# Push to DigitalOcean (or your deployment platform)
git push origin main
```

### Step 4: Update Environment Variables in DigitalOcean

1. Go to your DigitalOcean App Platform dashboard
2. Navigate to the oauth.kinghenry.au app
3. Go to **Settings** → **App-Level Environment Variables**
4. Update `HUBSPOT_APPS` with the new JSON configuration (including the `custom_api_workflow` app)
5. Save and redeploy the app

### Step 5: Test OAuth Flow

1. In HubSpot, navigate to **Settings** → **Integrations** → **Private Apps**
2. Find "Custom API Workflow Action" and click **Connect** or **Install**
3. Complete the OAuth authorization flow
4. Verify the success screen:
   - ✅ Shows **King Henry brand colors** (red gradient: #ED1943 to #CB163A)
   - ✅ Displays "**Custom API Workflow Action** has been connected"
   - ✅ Redirects to `https://app.hubspot.com/connected-apps/[your-portal-id]`

## 🧪 Testing the Workflow Action

### Test 1: Simple GET Request (No Auth)

Use httpbin.org to test basic functionality:

**Create a test workflow:**

1. Go to **Automation** → **Workflows**
2. Create a new workflow (Contact-based)
3. Add the **"Custom API Call"** action
4. Configure:
   - API URL: `https://httpbin.org/get`
   - HTTP Method: `GET`
   - Auth Type: `None`
5. Enroll a test contact
6. Check output fields for successful response

### Test 2: POST with Bearer Token

**Configuration:**

- API URL: `https://httpbin.org/bearer`
- HTTP Method: `GET`
- Auth Type: `Bearer Token`
- Bearer Token: `test-token-12345`

Expected: `status_code = 200`, `success = true`

### Test 3: Query Parameters

**Configuration:**

- API URL: `https://httpbin.org/get`
- HTTP Method: `GET`
- Auth Type: `None`
- Query Parameters: `{"foo": "bar", "test": "value"}`

Expected: Response body contains query parameters

### Test 4: POST with JSON Body

**Configuration:**

- API URL: `https://httpbin.org/post`
- HTTP Method: `POST`
- Auth Type: `None`
- Request Body: `{"name": "Test", "email": "test@example.com"}`

Expected: `status_code = 200`, response contains posted data

### Test 5: Basic Authentication

**Configuration:**

- API URL: `https://httpbin.org/basic-auth/user/pass`
- HTTP Method: `GET`
- Auth Type: `Basic Auth`
- Username: `user`
- Password: `pass`

Expected: `status_code = 200`, `success = true`

### Test 6: API Key

**Configuration:**

- API URL: `https://httpbin.org/headers`
- HTTP Method: `GET`
- Auth Type: `API Key`
- API Key Header Name: `X-API-Key`
- API Key Value: `test-key-12345`

Expected: Response contains custom header

### Test 7: Error Handling

**Configuration:**

- API URL: `https://httpbin.org/status/404`
- HTTP Method: `GET`
- Auth Type: `None`

Expected: `status_code = 404`, `success = false`, `error_message` populated

## 📊 Monitoring and Debugging

### Check Server Logs

Monitor the oauth.kinghenry.au server logs for workflow action executions:

```bash
# View logs in DigitalOcean
# Or if you have SSH access:
pm2 logs oauth-handler
```

### Check HubSpot Workflow Logs

1. Go to the workflow with the Custom API Call action
2. Click on an enrolled record
3. View the action execution history
4. Check the output field values

### Common Issues

**Issue: "No apps found" or OAuth fails**

- Solution: Verify `HUBSPOT_APPS` environment variable is properly formatted JSON
- Ensure the app is deployed in DigitalOcean

**Issue: "Invalid URL format"**

- Solution: URL must start with `https://` (HTTPS required)
- Localhost and private IPs are blocked for security

**Issue: Timeout errors**

- Solution: Increase timeout_seconds (max 60)
- Check if the target API is responsive

**Issue: Conditional fields not showing**

- Solution: Field dependencies are configured; select the appropriate auth_type value

## 🔒 Security Features Implemented

1. **HTTPS Only:** Only HTTPS URLs are allowed
2. **SSRF Protection:** Blocks localhost and private IP ranges
3. **Request Timeout:** Maximum 60 seconds to prevent hanging
4. **Response Size Limit:** 100KB max to prevent memory issues
5. **Error Sanitization:** Sensitive errors are not exposed to users
6. **Token Encryption:** OAuth tokens stored encrypted in HubSpot

## 📝 Production Checklist

Before using in production workflows:

- [ ] OAuth credentials configured in oauth.kinghenry.au
- [ ] Server deployed and accessible
- [ ] Test all authentication types with httpbin.org
- [ ] Test with actual target APIs
- [ ] Verify error handling works correctly
- [ ] Test workflow branching based on success/failure
- [ ] Monitor server logs during initial deployments
- [ ] Document API endpoints being called
- [ ] Set up alerts for server errors

## 📞 Support

For issues or questions:

- **Email:** support@kinghenry.au
- **GitHub:** https://github.com/marcelrees/custom-api-workflow-action
- **HubSpot Portal:** king-henry-developer-account (49012930)

---

**Project Location:** `/Users/marcelrees/Projects/hubspot/custom-api-workflow-action`
**Server Location:** `/Users/marcelrees/Projects/hubspot/hubspot-oauth-handler`
**Created:** 2026-01-25
**Last Updated:** 2026-03-09
