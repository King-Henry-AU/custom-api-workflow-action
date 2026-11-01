# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working on HubSpot components

IMPORTANT: IF THE 'HubSpotDev' MCP SERVER IS INSTALLED USE THE TOOLS BEFORE TRYING TO MANUALLY USE CLI COMMANDS OR BEFORE TRYING TO DO ANYTHING WITH HUBSPOT ASSETS

## Project Context

### What this project is
A HubSpot marketplace app that adds a **"Custom API Call"** workflow action, plus two **agent tools** (beta) for HubSpot AI agents. All three POST to the backend at `https://hub.kinghenry.au`, which proxies the HTTP request to the target API.

```
HubSpot Workflow → hub.kinghenry.au/api/apps/custom-api-workflow/execute → Target API
HubSpot Agent    → hub.kinghenry.au/api/apps/custom-api-workflow/agent/* → Target API
```

### Current deployment state
- **Distribution:** `marketplace` (set in `src/app/app-hsmeta.json`)
- **Portal:** king-henry-developer-account (49012930)
- **OAuth callback:** `https://hub.kinghenry.au/oauth/callback/custom_api_workflow`
- **Backend:** `King-Henry-AU/hubspot-app-platform` (Coolify, `hub.kinghenry.au`), module `src/apps/custom-api-workflow/`

### Key files
| File | Purpose |
|------|---------|
| `hsproject.json` | Project name, srcDir (`src`), platformVersion (`2025.2`) |
| `src/app/app-hsmeta.json` | App config: OAuth, scopes, permittedUrls, distribution |
| `src/app/workflow-actions/workflow-actions-hsmeta.json` | Workflow action (uid `CustomAPIWorkflowAction_v2`): inputs, outputs, field dependencies |
| `src/app/workflow-actions/agent-list-connections-hsmeta.json` | Agent tool (GET_DATA): lists agent-enabled connections |
| `src/app/workflow-actions/agent-call-api-hsmeta.json` | Agent tool (TAKE_ACTION): calls an API through a connection |
| `src/app/settings/SettingsPage.tsx` | Settings page: manage saved connections (React, `@hubspot/ui-extensions`) |
| `src/app/settings/settings-page-hsmeta.json` | Settings component config (entrypoint) |
| `src/app/settings/package.json` | Dependencies for settings component |

### Saved connections
A connection is a base URL plus credentials, created on the settings page and stored encrypted in the backend (never sent back to HubSpot). The workflow action uses one when `auth_type` is `connection` (`connection_id` dropdown loads from `/options/connections`); `api_url` can then be just a path. Each connection has an `agent_access` setting (`none`, `read_only`, `read_write`) that controls whether agent tools can use it. Requests are locked to the connection's origin and base path.

### Workflow action input fields
- `step_name` (text, **required**): display name shown on the workflow card via `actionCardContent`
- `api_url` (text, required): full HTTPS URL, or a path when using a saved connection
- `http_method` (select, required): GET/POST/PUT/PATCH/DELETE
- `auth_type` (select, required): connection/none/bearer/api_key/basic
- `connection_id` (select via `optionsUrl`, optional): shown when auth_type=connection
- `bearer_token` (text, optional): shown when auth_type=bearer (legacy, visible in the workflow)
- `api_key_header_name` + `api_key_value` (text, optional): shown when auth_type=api_key (legacy)
- `basic_auth_username` + `basic_auth_password` (text, optional): shown when auth_type=basic (legacy)
- `query_parameters`, `custom_headers`, `request_body` (textarea, optional): JSON objects
- `timeout_seconds` (number, optional): capped at 15 by the backend
- `response_json_path` (text, optional): dot path to extract into `extracted_value`

### Output fields
- `status_code` (number), `response_body` (string), `success` (bool), `error_message` (string), `extracted_value` (string)
- Agent tools return all outputs as strings.

### Agent tools (beta)
- Both have `isPublished: false` while in beta. Set to `true` when ready to ship to installed portals.
- Don't make agent tool inputs required: required fields can't be changed or removed after upload.
- The agent fills inputs itself, so agent tools must never take credentials as inputs.

### Important constraints
- `distribution: marketplace` means `app-function` components are NOT allowed
- All fetch URLs in settings/card components must be listed in `app-hsmeta.json` → `permittedUrls.fetch`
- Currently permitted fetch URL: `https://hub.kinghenry.au`
- Settings component cannot use `@hubspot/ui-extensions/crm` components
- `style` props are NOT valid on `@hubspot/ui-extensions` components

## HubSpot Project Information
- The project configuration is in the `hsproject.json` file
- A directory is considered a part of the project if it or a directory above it contains a `hsproject.json` file
- The project src directory is defined in the `srcDir` field in the `hsproject.json`
- The project's platform version is defined in `platformVersion` in the `hs project.json`
- The `platformVersion` determines what features the project has access to as well as the shape of the configuration files

## Local Development
### Local Development Server (`hs project dev`)
- Start a local development server with `hs project dev` to view extension changes without refreshing
- The server runs on your local machine and syncs changes to HubSpot in real-time
- When the server is running, UI extensions (cards, settings pages) display a "Developing locally" tag
- Saving changes to JSX files automatically refreshes the page

### Local Proxy Configuration (`local.json`)
- During local development, you can proxy `hubspot.fetch()` requests to a locally running backend
- Create a `local.json` file in the same directory as your app's `*-hsmeta.json` file
- The proxy configuration maps HTTPS URLs to local URLs:
  ```json
  {
    "proxy": {
      "https://example.com": "http://localhost:8080"
    }
  }
  ```
- **Important**: Proxy URLs must be valid HTTPS URLs (the key, not the value)
- Path-based routing is NOT supported (e.g., `"https://example.com/a": "http://localhost:8080"` will not work)
- When a `local.json` file is detected, the CLI confirms the proxy is active
- To disable the proxy, rename the file to `local.json.bak` and restart the dev server

### Request Signing with CLIENT_SECRET
- You can inject the `CLIENT_SECRET` environment variable when starting the local dev server:
  ```shell
  CLIENT_SECRET="abc123" hs project dev
  ```
- This enables request signing during local development for testing secure backend communications

## npm packages
### `@hubspot/ui-extensions`
- In the `@hubspot/ui-extensions` npm package, only the component properties defined by the component are valid.  `style` properties are not valid

### `hubspot.fetch` API
- `hubspot.fetch` is a function provided by `@hubspot/ui-extensions` for making HTTP requests from UI components
- **Critical**: `hubspot.fetch` requires fully qualified domain names (FQDN) with HTTPS - relative paths are NOT supported
- All URLs must be added to the `permittedUrls.fetch` array in the app's `*-hsmeta.json` configuration file
- Example:
  ```json
  "permittedUrls": {
    "fetch": ["https://api.example.com", "https://api.hubapi.com"],
    "iframe": [],
    "img": []
  }
  ```
- Fetch URLs must be valid HTTPS URLs and cannot be `localhost`
- To call a local backend during development, use the `local.json` proxy configuration (see Local Development section)

## Component Information
### General
- Component configuration files must end with `-hsmeta.json`
- The `uid` field in the `-hsmeta.json` files must be unique with the project
- The `type` field in the `-hsmeta.json` files defines the type of the component
- Components can not be in nested subdirectories, only the specified directories in their corresponding component rules.
- Example components can be found in https://github.com/HubSpot/hubspot-project-components. The directories are split up by platform version and follow this format `${platformVersion}/components`. Note the project create tool only supports platform versions >= 2025.2.
- All component subdirectories must be in the project source directory

### app component
- There can only be one `app` component
- `app` component must be in the `app` directory
- If the `config.distribution` field is set to `marketplace`, the only valid `config.auth.type` value is `oauth`

### card
- `card` components must be in the `app/cards` directory
- The global `window` object is not available in the `card` component
- Cannot use `window.fetch`, and instead must use the `hubspot.fetch` function provided by the `@hubspot/ui-extensions` npm package.  Any urls called with the `hubspot.fetch` function must be added to the `config.permittedUrls.fetch` array in the `app` component's hsmeta.json file
- `hubspot.fetch` requires fully qualified HTTPS URLs (e.g., `https://api.example.com/endpoint`) - relative paths like `/api/endpoint` are NOT supported
- Only components exported from the `@hubspot/ui-extensions` npm package can be used in `card` components

### app-event
- `app-event` components must be in the `app/app-events` directory

### app-object
- `app-object` components must be in the `app/app-object` directory

### app-function
- `app-function` components must be in the `app/functions` directory
- `app-function` components are not available when `config.distribution` is set to `marketplace` in the `app` component `-hsmeta.son` file

# settings
- There can only be one `settings` component
- `settings` components must be in the `app/settings` directory
- The global `window` object is not available in the `settings` component
- Cannot use `window.fetch`, and instead must use the `hubspot.fetch` function provided by the `@hubspot/ui-extensions` npm package.  Any urls called with the `hubspot.fetch` function must be added to the `config.permittedUrls.fetch` array in the `app` component's `hsmeta.json` file
- `hubspot.fetch` requires fully qualified HTTPS URLs - relative paths are NOT supported
- Only components exported from the `@hubspot/ui-extensions` npm package can be used in `settings` components
- React Components from `@hubspot/ui-extensions/crm` cannot be used in `settings` components

# scim
- There can only be one `scim` component
- `scim` components must be in the `app/scim` directory

# webhooks
- There can only be one `webhooks` component.
- `webhooks` components must be in the `app/webhooks` directory

### workflow-actions
- `workflow-action` components must be in the `app/workflow-actions` directory

## HubSpot CLI commands
- All the commands and subcommands have a `--help` argument that provides details on the command and it's arguments
- The help output is standard yargs output
- The commands for working with projects in HubSpot are subcommands of `hs project`
- Debugging flag that can be added to `hs` commands and subcommands: `--debug`
- Debugging problems with CLI installation: `hs doctor`

### Project Commands
- `hs project create` - Create a new HubSpot project interactively
- `hs project upload` - Upload the project to HubSpot (build is created automatically)
- `hs project deploy` - Deploy a specific build of the project to make it live
- `hs project dev` - Start a local development server for real-time development of UI extensions
- `hs project watch` - Watch for file changes and automatically upload them
- `hs project list` - List all projects in the account
- `hs project download` - Download a project from HubSpot to local
- `hs project open` - Open the current project page in the browser
- `hs project logs` - View logs for deployed projects
- `hs project list-builds` - List all builds for a project
- `hs project validate` - Validate project configuration files
- `hs project migrate` - Migrate a project to a newer platform version
- `hs project migrate-app` - Migrate a legacy app to the projects framework
- `hs project clone-app` - Clone an existing app configuration

### Account Management
- `hs init` - Initial setup of the hubspot configuration file
- `hs account auth` - Authenticate a new account (requires browser interaction)
- `hs account list` - List all configured accounts
- `hs account use` - Switch the default account
- `hs account info` - Display information about an account
- `hs account rename` - Rename an account in the config
- `hs account remove` - Remove an account from the config
- `hs account clean` - Clean up invalid/expired authentication
- `hs account create-override` - Create a project-specific account override
- `hs account remove-override` - Remove a project-specific account override

### CMS Commands
- `hs cms upload <src> <dest>` - Upload files to HubSpot
- `hs cms fetch <src> <dest>` - Download files from HubSpot
- `hs cms watch <src> <dest>` - Watch for changes and automatically upload
- `hs cms list <path>` - List remote files in HubSpot
- `hs cms delete <path>` - Delete files from HubSpot
- `hs cms mv <srcPath> <destPath>` - Move/rename files in HubSpot
- `hs cms function list` - List all serverless functions
- `hs cms function logs <path>` - View logs for a serverless function
- `hs create template <name>` - Create a new template
- `hs create module <name>` - Create a new module
- `hs create function <name>` - Create a new serverless function
- `hs theme preview` - Preview a theme locally at https://hslocal.net:3000/

### Sandbox Management
- `hs sandbox create` - Create a development sandbox account
- `hs sandbox delete` - Delete a sandbox account

### Secrets Management
- `hs secret list` - List secrets for serverless functions
- `hs secret add <name> <value>` - Add a secret
- `hs secret update <name> <value>` - Update a secret
- `hs secret delete <name>` - Delete a secret

### Test Account Management
- `hs test-account create` - Create a configurable test account
- `hs test-account delete` - Delete a test account
- `hs test-account import-data` - Import test data

## General
- Follow existing patterns in the codebase
- Use proper component structure based on component `type` in the `-hsmeta.json` file
- Ensure configuration files follow HubSpot naming conventions
- Always validate that components are placed in correct directories
- When working with UI extensions, remember that `hubspot.fetch` requires HTTPS URLs in `permittedUrls.fetch`
- Use `hs project dev` for iterative development of cards and settings pages
- Use `local.json` to proxy API requests to a local backend during development
