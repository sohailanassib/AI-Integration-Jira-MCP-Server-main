#!/usr/bin/env node

/**
 * Jira MCP Server
 *
 * A Model Context Protocol (MCP) server that lets an AI assistant
 * (like Claude Desktop or Cursor) talk to Jira Cloud: search issues,
 * read issue details, create issues, update issues, add/read comments,
 * and generate AI-powered test cases from a story's description.
 *
 * Setup:
 *   npm install @modelcontextprotocol/sdk node-fetch @anthropic-ai/sdk
 *
 * Environment variables (required, put them in a .env file):
 *   JIRA_BASE_URL      - e.g. https://yourcompany.atlassian.net
 *   JIRA_EMAIL         - your Atlassian account email
 *   JIRA_API_TOKEN     - your Atlassian API token
 *                        (generate at https://id.atlassian.com/manage-profile/security/api-tokens)
 *   ANTHROPIC_API_KEY  - your Anthropic API key (used by create_test_cases)
 *                        (get one at https://console.anthropic.com)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import Anthropic from "@anthropic-ai/sdk";

// ─── Config ───────────────────────────────────────────────────────────────

const JIRA_BASE_URL     = process.env.JIRA_BASE_URL?.replace(/\/$/, "");
const JIRA_EMAIL        = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN    = process.env.JIRA_API_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error("Missing required env vars: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN");
  process.exit(1);
}

const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

const JIRA_AUTH_HEADER =
  "Basic " + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

// ─── Jira API helper ────────────────────────────────────────────────────────
// Every tool below calls this one function to talk to Jira's REST API.
// Centralizing it here means we only write the auth headers / error handling once.

async function jiraRequest(method, path, body) {
  const url = `${JIRA_BASE_URL}/rest/api/3${path}`;
  const options = {
    method,
    headers: {
      Authorization: JIRA_AUTH_HEADER,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res  = await fetch(url, options);
  const text = await res.text();
  if (!res.ok) throw new Error(`Jira API error ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

// ─── Tool definitions ───────────────────────────────────────────────────────
// This is the list of tools the AI assistant is allowed to call.
// Each one describes its name, what it does, and what inputs it needs.

const TOOLS = [
  {
    name: "jira_search_issues",
    description:
      "Search Jira issues using JQL (Jira Query Language). Returns key, summary, status, assignee, and priority for each result.",
    inputSchema: {
      type: "object",
      properties: {
        jql: {
          type: "string",
          description: 'JQL query string. Example: "project = MYPROJ AND status = Open ORDER BY created DESC"',
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return (default: 20, max: 100)",
        },
      },
      required: ["jql"],
    },
  },
  {
    name: "jira_get_issue",
    description: "Get full details of a single Jira issue by its key (e.g. PROJ-123).",
    inputSchema: {
      type: "object",
      properties: {
        issueKey: { type: "string", description: "The Jira issue key, e.g. PROJ-123" },
      },
      required: ["issueKey"],
    },
  },
  {
    name: "jira_create_issue",
    description: "Create a new Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        projectKey:  { type: "string", description: "The project key, e.g. PROJ" },
        summary:     { type: "string", description: "Issue summary / title" },
        issueType:   { type: "string", description: 'Issue type name, e.g. "Bug", "Task", "Story" (default: Task)' },
        description: { type: "string", description: "Issue description (plain text)" },
        priority:    { type: "string", description: 'Priority name, e.g. "High", "Medium", "Low"' },
      },
      required: ["projectKey", "summary"],
    },
  },
  {
    name: "jira_update_issue",
    description: "Update fields of an existing Jira issue. Only the fields you provide are changed.",
    inputSchema: {
      type: "object",
      properties: {
        issueKey:    { type: "string", description: "The Jira issue key, e.g. PROJ-123" },
        summary:     { type: "string", description: "New summary / title" },
        description: { type: "string", description: "New description (plain text)" },
        priority:    { type: "string", description: 'New priority name, e.g. "High", "Medium", "Low"' },
        status:      { type: "string", description: 'Transition issue to this status name, e.g. "In Progress", "Done"' },
      },
      required: ["issueKey"],
    },
  },
  {
    name: "jira_add_comment",
    description: "Add a comment to a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueKey: { type: "string", description: "The Jira issue key, e.g. PROJ-123" },
        comment:  { type: "string", description: "The comment text (plain text)" },
      },
      required: ["issueKey", "comment"],
    },
  },
  {
    name: "jira_get_comments",
    description: "Get all comments on a Jira issue.",
    inputSchema: {
      type: "object",
      properties: {
        issueKey: { type: "string", description: "The Jira issue key, e.g. PROJ-123" },
      },
      required: ["issueKey"],
    },
  },
  {
    name: "create_test_cases",
    description:
      "Fetch a Jira story by key, read its summary and description, then use AI " +
      "to generate positive, negative, and edge test cases for it.",
    inputSchema: {
      type: "object",
      properties: {
        issueKey: {
          type: "string",
          description: "The Jira issue key of the story, e.g. PROJ-123.",
        },
        additionalContext: {
          type: "string",
          description: "Optional extra instructions for test generation, e.g. 'Focus on mobile scenarios'.",
        },
      },
      required: ["issueKey"],
    },
  },
];

// ─── Tool handlers ──────────────────────────────────────────────────────────
// One function per tool. Each one turns Jira's raw API response into a
// clean, small object so the AI assistant doesn't have to wade through
// Jira's very verbose JSON.

async function handleSearchIssues({ jql, maxResults = 20 }) {
  const fields = ["summary", "status", "assignee", "priority", "issuetype", "created", "updated"];

  const data = await jiraRequest("POST", "/search", {
    jql,
    maxResults: Math.min(maxResults, 100),
    fields,
  });

  const issues = (data.issues || []).map((issue) => ({
    key:       issue.key,
    summary:   issue.fields.summary,
    status:    issue.fields.status?.name,
    assignee:  issue.fields.assignee?.displayName ?? "Unassigned",
    priority:  issue.fields.priority?.name,
    issueType: issue.fields.issuetype?.name,
    url:       `${JIRA_BASE_URL}/browse/${issue.key}`,
  }));

  return { total: data.total, returned: issues.length, issues };
}

async function handleGetIssue({ issueKey }) {
  const issue = await jiraRequest("GET", `/issue/${issueKey}`);
  const f = issue.fields;

  return {
    key:         issue.key,
    url:         `${JIRA_BASE_URL}/browse/${issue.key}`,
    summary:     f.summary,
    status:      f.status?.name,
    issueType:   f.issuetype?.name,
    priority:    f.priority?.name,
    assignee:    f.assignee?.displayName ?? "Unassigned",
    reporter:    f.reporter?.displayName,
    created:     f.created,
    updated:     f.updated,
    description: extractTextFromADF(f.description),
    labels:      f.labels,
  };
}

async function handleCreateIssue({ projectKey, summary, issueType = "Task", description, priority }) {
  const fields = {
    project:   { key: projectKey },
    summary,
    issuetype: { name: issueType },
  };

  if (description) fields.description = textToADF(description);
  if (priority)     fields.priority    = { name: priority };

  const result = await jiraRequest("POST", "/issue", { fields });

  return {
    key:     result.key,
    url:     `${JIRA_BASE_URL}/browse/${result.key}`,
    message: `Issue ${result.key} created successfully.`,
  };
}

async function handleUpdateIssue({ issueKey, summary, description, priority, status }) {
  const fields = {};

  if (summary)     fields.summary     = summary;
  if (description) fields.description = textToADF(description);
  if (priority)    fields.priority    = { name: priority };

  if (Object.keys(fields).length > 0) {
    await jiraRequest("PUT", `/issue/${issueKey}`, { fields });
  }

  if (status) {
    const { transitions } = await jiraRequest("GET", `/issue/${issueKey}/transitions`);
    const transition = transitions.find((t) => t.name.toLowerCase() === status.toLowerCase());
    if (!transition) {
      const names = transitions.map((t) => t.name).join(", ");
      throw new Error(`Status "${status}" not found. Available transitions: ${names}`);
    }
    await jiraRequest("POST", `/issue/${issueKey}/transitions`, { transition: { id: transition.id } });
  }

  return {
    key:     issueKey,
    url:     `${JIRA_BASE_URL}/browse/${issueKey}`,
    message: `Issue ${issueKey} updated successfully.`,
  };
}

async function handleAddComment({ issueKey, comment }) {
  const result = await jiraRequest("POST", `/issue/${issueKey}/comment`, {
    body: textToADF(comment),
  });

  return {
    commentId: result.id,
    author:    result.author?.displayName,
    created:   result.created,
    message:   `Comment added to ${issueKey}.`,
  };
}

async function handleGetComments({ issueKey }) {
  const data = await jiraRequest("GET", `/issue/${issueKey}/comment?orderBy=created`);

  const comments = (data.comments || []).map((c) => ({
    id:      c.id,
    author:  c.author?.displayName,
    created: c.created,
    body:    extractTextFromADF(c.body),
  }));

  return { issueKey, total: data.total, comments };
}

// ─── AI test case generation ────────────────────────────────────────────────

async function handleCreateTestCases({ issueKey, additionalContext = "" }) {
  if (!anthropic) {
    throw new Error("ANTHROPIC_API_KEY is not set — required for create_test_cases.");
  }

  const issue = await jiraRequest("GET", `/issue/${issueKey}`);
  const f = issue.fields;

  const summary     = f.summary || "";
  const description = extractTextFromADF(f.description);

  const systemPrompt = `You are a QA engineer. Generate test cases based on a Jira user story.
Return ONLY valid JSON — no markdown fences, no explanation outside the JSON.

Return a JSON array of test case objects with this exact shape:
[
  {
    "title": "Short descriptive TC title",
    "type": "positive" | "negative" | "edge",
    "steps": [
      { "step": "Action to perform", "expectedResult": "What should happen" }
    ]
  }
]

Rules:
- At minimum: 2 positive, 2 negative, 1 edge case.
- Steps should be clear, atomic, and independently executable.`;

  const userPrompt = `
Story Key: ${issueKey}
Summary:   ${summary}

Description:
${description || "(No description provided)"}

${additionalContext ? `Additional context: ${additionalContext}` : ""}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const raw = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim()
    .replace(/^```json\s*|\s*```$/g, "");

  const testCases = JSON.parse(raw);

  return { issueKey, summary, total: testCases.length, testCases };
}

// ─── ADF helpers ────────────────────────────────────────────────────────────
// Jira Cloud stores rich text (descriptions, comments) in a format called
// ADF (Atlassian Document Format) instead of plain strings. These two
// helpers convert plain text -> ADF (for writing) and ADF -> plain text
// (for reading), so the rest of the code can just deal with normal strings.

function textToADF(text) {
  return {
    type: "doc",
    version: 1,
    content: text.split("\n\n").map((para) => ({
      type: "paragraph",
      content: [{ type: "text", text: para }],
    })),
  };
}

function extractTextFromADF(adf) {
  if (!adf) return "";
  if (typeof adf === "string") return adf;

  const extractNode = (node) => {
    if (!node) return "";
    if (node.type === "text") return node.text || "";
    if (node.content) return node.content.map(extractNode).join(" ");
    return "";
  };

  return extractNode(adf).trim();
}

// ─── MCP Server ─────────────────────────────────────────────────────────────
// This part wires everything above into the actual MCP protocol:
// 1. Tell the client the list of tools we support.
// 2. When the client calls one, run the matching handler and return the result.

const server = new Server(
  { name: "jira-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "jira_search_issues": result = await handleSearchIssues(args); break;
      case "jira_get_issue":     result = await handleGetIssue(args);     break;
      case "jira_create_issue":  result = await handleCreateIssue(args);  break;
      case "jira_update_issue":  result = await handleUpdateIssue(args);  break;
      case "jira_add_comment":   result = await handleAddComment(args);   break;
      case "jira_get_comments":  result = await handleGetComments(args);  break;
      case "create_test_cases":  result = await handleCreateTestCases(args); break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

// ─── Start ──────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Jira MCP server running on stdio");
