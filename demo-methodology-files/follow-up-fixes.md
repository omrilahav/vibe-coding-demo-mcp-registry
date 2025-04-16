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

## Second Fix
```
We’ve completed the first MVP version of the MCP Registry app.

However, submitting feedback for a server currently fails with the error:

> “Failed to submit feedback. Please try again.”

Your task:
- Investigate and fix the feedback submission functionality
- Ensure users can submit feedback (name, rating, text) on individual MCP servers
- Make sure it is stored correctly in the database and reflected on the frontend
- Submitting a new server flow works great, so you can learn what we did there (everything from the frontend inputs to storing in the db)

Check:
- The form validation and frontend logic
- The backend handler (API route, DB write)
- Any missing schema fields or DB issues

Requirements:
- Fix this flow end-to-end
- Ensure errors are handled clearly on the frontend (e.g., field validation, network issues)
- Keep the solution very simple and aligned with the MVP scope

Once fixed:
- Test submitting feedback
- Make sure it appears under the correct server’s “Feedback” section
- Append a short summary to the implementation log
```