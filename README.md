# Jira + Zephyr Scale MCP Server

A Model Context Protocol (MCP) server for integrating Jira Cloud with Zephyr Scale, powered by AI-assisted test case generation.

## Features

- **Jira Operations** — Search, create, update issues; add and retrieve comments via the Jira REST API.
- **AI Test Case Generation** — Automatically generate positive, negative, and edge test cases from a Jira story's description and acceptance criteria using Claude.
- **Zephyr Scale Integration** — Push generated test cases to Zephyr Scale and link them to Jira stories for full traceability.
- **Bug Creation from Test Failures** — When a Zephyr test case fails, auto-create a Jira bug with steps to reproduce, and link it to both the story and the test case.

## Screenshots

![CI Test Cases Generation](Screenshot%202026-07-25%20at%207.08.44%E2%80%AFPM.png)
*CI Test Cases Generation*

![Feature Test Cases Generation](Screenshot%202026-07-25%20at%207.08.10%E2%80%AFPM.png)
*Feature Test Cases Generation*

## Tools

| Tool | Description |
|---|---|
| `jira_search_issues` | Search Jira with JQL |
| `jira_get_issue` | Get full issue details |
| `jira_create_issue` | Create a Jira issue |
| `jira_update_issue` | Update issue fields and transition status |
| `jira_add_comment` | Add a comment to an issue |
| `jira_get_comments` | Get all comments on an issue |
| `create_test_cases` | Generate test cases from a story using AI |
| `generate_in_zephyr` | Push test cases to Zephyr Scale |
| `link_zephyr_tcs_to_story` | Link Zephyr test cases to a Jira story |
| `create_bug` | Create a Jira bug from a failed Zephyr test case |

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables** in `.env`:

   ```
   JIRA_BASE_URL=https://yourcompany.atlassian.net
   JIRA_EMAIL=your-email@example.com
   JIRA_API_TOKEN=your-jira-api-token
   ZEPHYR_API_TOKEN=your-zephyr-api-token
   ANTHROPIC_API_KEY=your-anthropic-api-key
   ```

   - [Generate a Jira API token](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Generate a Zephyr Scale API token inside Jira → Zephyr Scale → API Keys
   - Get an Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

3. **Run the server**

   ```bash
   node mcpserver.js
   ```

   The server communicates over stdio using the MCP protocol. Configure your MCP client (e.g., Claude Desktop, Cursor) to launch this script.

## Example Workflow

1. `jira_search_issues` — Find a story by JQL
2. `create_test_cases` — Pick a story key and generate test cases with AI
3. `generate_in_zephyr` — Push the generated cases into Zephyr Scale
4. `link_zephyr_tcs_to_story` — Link them to the story's coverage section
5. `create_bug` — When a TC fails, create a bug with auto-filled reproduction steps
