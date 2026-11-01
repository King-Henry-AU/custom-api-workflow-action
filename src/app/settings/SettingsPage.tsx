import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  Link,
  LoadingSpinner,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  Text,
  TextArea,
} from "@hubspot/ui-extensions";
import { hubspot } from "@hubspot/ui-extensions";

hubspot.extend<"settings">(() => <SettingsPage />);

// hubspot.fetch signs every request and appends portalId/userEmail, which the
// backend uses to scope connections to this portal.
const API = "https://hub.kinghenry.au/api/apps/custom-api-workflow";

type AuthType = "none" | "bearer" | "api_key" | "basic";
type AgentAccess = "none" | "read_only" | "read_write";

interface Connection {
  id: string;
  name: string;
  description: string;
  base_url: string;
  auth_type: AuthType;
  api_key_header_name: string;
  secret_hint: string;
  agent_access: AgentAccess;
  updated_at: string;
  updated_by: string;
}

interface FormState {
  id: string;
  name: string;
  description: string;
  base_url: string;
  auth_type: AuthType;
  bearer_token: string;
  api_key_header_name: string;
  api_key_value: string;
  basic_auth_username: string;
  basic_auth_password: string;
  agent_access: AgentAccess;
}

const EMPTY_FORM: FormState = {
  id: "",
  name: "",
  description: "",
  base_url: "",
  auth_type: "bearer",
  bearer_token: "",
  api_key_header_name: "",
  api_key_value: "",
  basic_auth_username: "",
  basic_auth_password: "",
  agent_access: "none",
};

const AUTH_OPTIONS = [
  { label: "Bearer token", value: "bearer" },
  { label: "API key header", value: "api_key" },
  { label: "Basic auth", value: "basic" },
  { label: "None", value: "none" },
];

const AGENT_OPTIONS = [
  { label: "Not available to AI agents", value: "none" },
  { label: "Read only (GET requests)", value: "read_only" },
  { label: "Read and write (all methods)", value: "read_write" },
];

const AUTH_LABELS: Record<AuthType, string> = {
  none: "No auth",
  bearer: "Bearer",
  api_key: "API key",
  basic: "Basic",
};

const AGENT_LABELS: Record<AgentAccess, string> = {
  none: "Off",
  read_only: "Read only",
  read_write: "Read and write",
};

async function callApi<T>(
  path: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
): Promise<T> {
  const response = await hubspot.fetch(`${API}${path}`, {
    method,
    ...(body ? { body } : {}),
  });
  const json = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(json.error || `Request failed (${response.status})`);
  }
  return json;
}

const SettingsPage = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await callApi<{ connections: Connection[] }>(
        "/connections",
        "GET",
      );
      setConnections(result.connections);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Couldn't load connections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const editing = form !== null && form.id !== "";
  const existing = editing
    ? connections.find((c) => c.id === form?.id)
    : undefined;
  // On edit, blank secret fields keep the stored secret if the auth type is unchanged.
  const keepsSecret = Boolean(existing && existing.auth_type === form?.auth_type);
  const secretPlaceholder = keepsSecret
    ? `Leave blank to keep the saved value (${existing?.secret_hint || "hidden"})`
    : "";

  const update = (patch: Partial<FormState>) =>
    setForm((current) => (current ? { ...current, ...patch } : current));

  const startAdd = () => {
    setNotice("");
    setFormError("");
    setForm({ ...EMPTY_FORM });
  };

  const startEdit = (connection: Connection) => {
    setNotice("");
    setFormError("");
    setForm({
      ...EMPTY_FORM,
      id: connection.id,
      name: connection.name,
      description: connection.description,
      base_url: connection.base_url,
      auth_type: connection.auth_type,
      api_key_header_name: connection.api_key_header_name,
      agent_access: connection.agent_access,
    });
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setFormError("");
    try {
      const result = await callApi<{ connection: Connection }>(
        "/connections/save",
        "POST",
        { ...form },
      );
      setForm(null);
      setNotice(`Saved "${result.connection.name}".`);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (connection: Connection) => {
    if (confirmDeleteId !== connection.id) {
      setConfirmDeleteId(connection.id);
      return;
    }
    setConfirmDeleteId("");
    try {
      await callApi("/connections/delete", "POST", { id: connection.id });
      setNotice(
        `Deleted "${connection.name}". Workflows that used it will fail until you pick another connection.`,
      );
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Couldn't delete");
    }
  };

  return (
    <Flex direction="column" gap="medium">
      <Box>
        <Heading>Custom API Workflow Action</Heading>
        <Text variant="microcopy">
          Send HTTP requests to any API from your workflows and AI agents
        </Text>
      </Box>

      <Divider />

      <Box>
        <Heading>Saved connections</Heading>
        <Text>
          A connection stores an API's base URL and credentials. Credentials are
          encrypted on King Henry's server and never shown again after you save
          them, so they don't appear in your workflows. In the "Custom API Call"
          workflow action, set Authentication Type to "Saved connection" and
          pick one.
        </Text>
      </Box>

      {notice && (
        <Alert title="Done" variant="success">
          {notice}
        </Alert>
      )}
      {loadError && (
        <Alert title="Something went wrong" variant="error">
          {loadError}
        </Alert>
      )}

      {loading ? (
        <LoadingSpinner label="Loading connections" />
      ) : connections.length === 0 ? (
        <Text>No connections yet.</Text>
      ) : (
        <Table bordered={true}>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Base URL</TableHeader>
              <TableHeader>Auth</TableHeader>
              <TableHeader>AI agents</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {connections.map((connection) => (
              <TableRow key={connection.id}>
                <TableCell>
                  <Text format={{ fontWeight: "bold" }}>{connection.name}</Text>
                  {connection.description && (
                    <Text variant="microcopy">{connection.description}</Text>
                  )}
                </TableCell>
                <TableCell>{connection.base_url}</TableCell>
                <TableCell>
                  <Text>{AUTH_LABELS[connection.auth_type]}</Text>
                  {connection.secret_hint && (
                    <Text variant="microcopy">{connection.secret_hint}</Text>
                  )}
                </TableCell>
                <TableCell>
                  <Tag
                    variant={
                      connection.agent_access === "none"
                        ? "default"
                        : connection.agent_access === "read_only"
                          ? "info"
                          : "warning"
                    }
                  >
                    {AGENT_LABELS[connection.agent_access]}
                  </Tag>
                </TableCell>
                <TableCell>
                  <Flex direction="row" gap="small">
                    <Button size="xs" onClick={() => startEdit(connection)}>
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => remove(connection)}
                    >
                      {confirmDeleteId === connection.id
                        ? "Click again to delete"
                        : "Delete"}
                    </Button>
                  </Flex>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {form === null ? (
        <Box>
          <Button variant="primary" onClick={startAdd}>
            Add connection
          </Button>
        </Box>
      ) : (
        <Flex direction="column" gap="small">
          <Heading>{editing ? `Edit "${existing?.name ?? ""}"` : "New connection"}</Heading>
          {formError && (
            <Alert title="Couldn't save" variant="error">
              {formError}
            </Alert>
          )}
          <Input
            label="Name"
            name="name"
            required={true}
            value={form.name}
            placeholder="e.g. Stripe (live)"
            onChange={(value) => update({ name: value })}
          />
          <TextArea
            label="Description"
            name="description"
            value={form.description}
            description="What this API is for. AI agents read this to decide when to use it."
            onChange={(value) => update({ description: value })}
          />
          <Input
            label="Base URL"
            name="base_url"
            required={true}
            value={form.base_url}
            placeholder="https://api.example.com/v1"
            description="Must start with https://. Workflows and agents can only call paths under this URL."
            onChange={(value) => update({ base_url: value })}
          />
          <Select
            label="Authentication"
            name="auth_type"
            value={form.auth_type}
            options={AUTH_OPTIONS}
            onChange={(value) => update({ auth_type: value as AuthType })}
          />
          {form.auth_type === "bearer" && (
            <Input
              type="password"
              label="Bearer token"
              name="bearer_token"
              value={form.bearer_token}
              placeholder={secretPlaceholder}
              onChange={(value) => update({ bearer_token: value })}
            />
          )}
          {form.auth_type === "api_key" && (
            <>
              <Input
                label="API key header name"
                name="api_key_header_name"
                value={form.api_key_header_name}
                placeholder="X-API-Key"
                onChange={(value) => update({ api_key_header_name: value })}
              />
              <Input
                type="password"
                label="API key value"
                name="api_key_value"
                value={form.api_key_value}
                placeholder={secretPlaceholder}
                onChange={(value) => update({ api_key_value: value })}
              />
            </>
          )}
          {form.auth_type === "basic" && (
            <>
              <Input
                label="Username"
                name="basic_auth_username"
                value={form.basic_auth_username}
                placeholder={keepsSecret ? "Leave both blank to keep the saved login" : ""}
                onChange={(value) => update({ basic_auth_username: value })}
              />
              <Input
                type="password"
                label="Password"
                name="basic_auth_password"
                value={form.basic_auth_password}
                placeholder={keepsSecret ? "Leave both blank to keep the saved login" : ""}
                onChange={(value) => update({ basic_auth_password: value })}
              />
            </>
          )}
          <Select
            label="AI agent access (beta)"
            name="agent_access"
            value={form.agent_access}
            options={AGENT_OPTIONS}
            description="Lets HubSpot AI agents that have the Custom API Call tools call this API. Agents never see the credentials."
            onChange={(value) => update({ agent_access: value as AgentAccess })}
          />
          {form.agent_access === "read_write" && (
            <Alert title="Agents can change data" variant="warning">
              Agents will be able to send POST, PUT, PATCH and DELETE requests to
              this API. HubSpot asks a user to approve each call by default; keep
              that on unless you trust every agent that has this tool.
            </Alert>
          )}
          <Flex direction="row" gap="small">
            <Button variant="primary" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save connection"}
            </Button>
            <Button onClick={() => setForm(null)} disabled={saving}>
              Cancel
            </Button>
          </Flex>
        </Flex>
      )}

      <Divider />

      <Box>
        <Heading>Getting started</Heading>
        <Flex direction="column" gap="small">
          <Text>1. Add a saved connection above for each API you call.</Text>
          <Text>2. In a workflow, add the "Custom API Call" action.</Text>
          <Text>
            3. Set Authentication Type to "Saved connection", pick the
            connection, and enter a path such as /v1/customers.
          </Text>
          <Text>
            4. Use the outputs (status_code, response_body, success,
            error_message, extracted_value) in later workflow steps.
          </Text>
        </Flex>
      </Box>

      <Box>
        <Heading>AI agents (beta)</Heading>
        <Text>
          Add the "List external API connections" and "Call external API" tools
          to a HubSpot agent, then turn on AI agent access for the connections
          that agent may use. Agents can only reach connections you enable, only
          under their base URL, and never see credentials.
        </Text>
      </Box>

      <Box>
        <Alert title="Security">
          <Text>• Requests must use HTTPS and can't reach private networks.</Text>
          <Text>
            • Credentials typed straight into a workflow action are visible to
            anyone who can view that workflow. Use saved connections instead.
          </Text>
          <Text>• Test with non-production data first.</Text>
        </Alert>
      </Box>

      <Divider />

      <Box>
        <Heading>Support</Heading>
        <Flex direction="column" gap="small">
          <Text>
            <Text inline={true} format={{ fontWeight: "bold" }}>
              Email:
            </Text>{" "}
            <Link href="mailto:support@kinghenry.au">support@kinghenry.au</Link>
          </Text>
          <Text>
            <Text inline={true} format={{ fontWeight: "bold" }}>
              Documentation:
            </Text>{" "}
            <Link href="https://kinghenry.au/apps/custom-api-workflow-action">
              kinghenry.au/apps/custom-api-workflow-action
            </Link>
          </Text>
        </Flex>
      </Box>

      <Box>
        <Text variant="microcopy">
          Custom API Workflow Action v1.1.0 • Built with HubSpot Platform 2025.2
        </Text>
      </Box>
    </Flex>
  );
};
