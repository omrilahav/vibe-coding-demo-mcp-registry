# API Documentation

Welcome to the MCP Registry API documentation. This API allows you to programmatically interact with the MCP Registry system.

## API Overview

The MCP Registry API is a RESTful API that uses JSON for request and response payloads. All endpoints are prefixed with `/api/v1`.

## Base URL

When running locally, the API is available at:
```
http://localhost:3000/api/v1
```

## Authentication

Currently, the API is designed for local use and does not require authentication. Future versions will implement authentication for remote access.

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "error": null
}
```

Or in case of an error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Available Endpoints

### Servers

- `GET /servers` - List all MCP servers
- `GET /servers/{id}` - Get details of a specific server
- `POST /servers` - Register a new server
- `PUT /servers/{id}` - Update server information
- `DELETE /servers/{id}` - Remove a server

### Reputation

- `GET /servers/{id}/reputation` - Get server reputation details
- `POST /servers/{id}/feedback` - Submit feedback for a server

### Search

- `GET /search` - Search for servers
- `GET /search/suggest` - Get search suggestions

## Known API Issues

### Glama.ai External API Integration

There is a known issue with the Glama.ai API integration:

- The endpoint at `/api/load-servers` attempts to fetch data from `https://glama.ai/api/mcp/v1/servers`
- Currently, there are connectivity problems with this external service
- This affects the ability to load server data from external sources
- The application falls back to using local data when external data cannot be fetched
- Future versions will implement additional data sources and more robust error handling

If you're developing applications that interact with the MCP Registry API, it's recommended to handle potential failures gracefully when calling the `/api/load-servers` endpoint.

## Rate Limiting

The API implements rate limiting to ensure fair usage:
- 100 requests per minute per IP address
- 1000 requests per hour per IP address

## Error Codes

Common error codes you might encounter:

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | The request was malformed or invalid |
| `SERVER_NOT_FOUND` | The requested server was not found |
| `RATE_LIMIT_EXCEEDED` | You've exceeded the rate limit |
| `VALIDATION_ERROR` | The request data failed validation |
| `INTERNAL_ERROR` | An internal server error occurred |

## Detailed Documentation

- [Authentication Guide](./authentication.md)
- [Complete Endpoints Reference](./endpoints.md)
- [Error Handling Guide](./errors.md)

## Tools and SDKs

- [API Client Library (TypeScript)](https://github.com/yourusername/mcp-registry-client)
- [Postman Collection](./postman/mcp-registry.json)

## Need Help?

If you need assistance with the API:
1. Check the detailed documentation for each endpoint
2. Look through our [examples](./examples/)
3. [Open an issue](https://github.com/yourusername/mcp-registry/issues) for technical problems 