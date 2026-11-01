# Changelog

All notable changes to the Custom API Workflow Action project.

## [Unreleased] - Saved connections and agent tools

Needs the matching `hubspot-app-platform` backend deployed first.

### Added
- **Saved connections** on the settings page: a base URL plus credentials (bearer, API key header or Basic auth), encrypted on the backend and never shown again after saving.
- **"Saved connection (recommended)"** option for Authentication Type in the workflow action, with a connection dropdown. With a connection, API URL can be just a path such as `/v1/customers`.
- **Agent tools (beta)**: "List external API connections" (GET_DATA) and "Call external API" (TAKE_ACTION). Agents can only use connections an admin has enabled for agents (read only or read and write), only under the connection's base URL, and never see credentials. Both tools ship with `isPublished: false`.

### Changed
- Inline credential fields now warn that anyone who can view the workflow can see them.
- Timeout description corrected to the real 15 second cap.
- Settings page support link points to the public app page instead of the GitHub repo.

### Security (backend)
- Connection credentials are locked to the connection's host: other hosts, other base paths and cross-host redirects are refused.
- Outbound requests refuse hostnames that resolve to private IP ranges, and redirects to HTTP or private hosts.

## [Build #3] - 2026-01-25

### Added
- **"Name this step" field** at the top of the workflow action configuration
  - Optional text field allowing users to give custom names to each workflow action
  - Appears as the first field in the configuration UI
  - Updates the workflow card display with the custom name

### Changed
- **Workflow Card Display** now shows: `{{step_name}} - {{http_method}} {{api_url}}`
  - When `step_name` is filled: Shows the custom name prominently (e.g., "Send to Slack - POST https://hooks.slack.com/...")
  - When `step_name` is empty: Shows the method and URL (e.g., "- GET https://api.example.com/...")
  - Previous format: `Call {{api_url}} with {{http_method}}`

### Examples

**With custom name:**
- Configuration: step_name = "Notify Sales Team"
- Workflow card displays: **"Notify Sales Team - POST https://api.slack.com/..."**

**Without custom name:**
- Configuration: step_name = (empty)
- Workflow card displays: **"- GET https://httpbin.org/get"**

**Use cases for custom names:**
- "Send to Slack" instead of "Call https://hooks.slack.com/..."
- "Update CRM" instead of "Call https://api.crm.com/..."
- "Trigger Webhook" instead of "Call https://webhook.site/..."
- "Notify Admin" instead of "Call https://api.sendgrid.com/..."

### Technical Details
- Field name: `step_name`
- Field type: `string` (text input)
- Required: `false` (optional)
- Supported value types: `STATIC_VALUE`
- Position: First field in the configuration form

## [Build #2] - 2026-01-25

### Added
- Initial release of Custom API Workflow Action
- Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Multiple authentication types (None, Bearer Token, API Key, Basic Auth)
- Query parameters, custom headers, and request body support
- 4 output fields (status_code, response_body, success, error_message)
- Conditional field visibility based on authentication type
- Professional settings page with documentation
- Server endpoint at oauth.kinghenry.au for processing workflow actions

### Security Features
- HTTPS-only URL validation
- SSRF protection (blocks localhost and private IPs)
- Request timeout limits (max 60 seconds)
- Response size limits (100KB max)
- Comprehensive error handling

## OAuth Handler Updates - 2026-01-25

### Changed
- **OAuth Success Screen Branding**
  - Updated to King Henry brand colors (red gradient: #ED1943 to #CB163A)
  - Dynamic app name display (shows correct app name instead of hardcoded "Sidebar Quick Links")
  - Redirect changed to `https://app.hubspot.com/connected-apps/[hub-id]` instead of marketplace

### Added
- Workflow action endpoint: `POST /api/workflow-action/execute`
- Support for all HTTP methods and authentication types
- SSRF protection and URL validation
- Request/response handling with comprehensive error messages

---

## Deployment Status

- ✅ **Latest Build:** #3
- ✅ **Status:** Deployed
- ✅ **Platform:** HubSpot 2025.2
- ✅ **Distribution:** Private (OAuth)
- 🔗 **Project URL:** https://app.hubspot.com/developer-projects/49012930/project/Custom%20API%20Workflow%20Action
- 🔗 **GitHub:** https://github.com/kinghenry-marcel/custom-api-workflow-action

## Next Steps

1. Complete integration testing with httpbin.org (see TEST_SCENARIOS.md)
2. Test with production APIs
3. Submit app for HubSpot Marketplace review

---

**Version:** 1.0.0 (Build #3)
**Last Updated:** 2026-01-25
