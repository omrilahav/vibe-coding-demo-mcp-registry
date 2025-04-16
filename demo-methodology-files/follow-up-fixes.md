# Prompts executed after the first iteration was completed, for some fixes:

## First Fix

```
We’ve completed the first full iteration of the app — including UI, DB, and routing — as described in @product @design @architecture @tasks @docs.

However, we’ve noticed the app is still using local mock data for the list of MCP servers.

Your task is to:
- Investigate the current implementation of MCP server discovery and aggregation
- Replace the mock data with real data pulled from actual public sources (not just hardcoded into the DB)
- Ensure the DB is populated with meaningful, real MCP server data so the frontend reflects actual entries

Minimum requirements:
- Use the predefined public MCP sources (check product/design/arch docs)
- Fetch metadata per server: name, description, license, repo URL, basic stats if available
- Make sure it’s stored correctly in the database, using the existing schema
- The data must power the frontend views correctly (tested end-to-end)
- Fetching should happen one the user clicks on a "Load Servers" button in the main screen (we need to create one, it will trigger the entire fetching process, that should fetch everything on these remore sources).

Keep in mind:
- This is MVP: keep everything super simple and reliable
- Handle missing/invalid sources gracefully
- Do not invent entries — the goal is to fetch and use real, live MCP data

The backend and frontend are already fully functional — your job is to make sure the data shown is actually real and pulled from real sources.

here is example for the glama api to use curl 'https://glama.ai/api/mcp/v1/servers?first=20' while changing the numbers (let's start with this source only for now).
```