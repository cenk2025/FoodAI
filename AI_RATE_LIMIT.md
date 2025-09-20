# AI API Rate Limiting

## Overview

This document explains the rate limiting implementation for the AI API endpoint to prevent abuse and ensure fair usage.

## Implementation Details

### Rate Limit Utility
Located in [lib/rate-limit.ts](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/lib/rate-limit.ts)

The rate limiter uses a simple in-memory sliding window approach:
- **Window Size**: 1 minute (60,000 milliseconds)
- **Request Limit**: 10 requests per IP per minute
- **Storage**: In-memory Map to track request timestamps per IP

### AI API Route
Located in [app/api/ai/route.ts](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/app/api/ai/route.ts)

The AI API route implements the following security and rate limiting measures:

1. **API Key Validation**: Returns 401 if DEEPSEEK_API_KEY is missing
2. **IP Rate Limiting**: Uses the rate limit utility to restrict requests to 10 per minute per IP
3. **Secret Protection**: Avoids logging sensitive information like API keys
4. **Input Sanitization**: Limits query and city parameters to prevent abuse

## Rate Limiting Algorithm

The rate limiter uses a sliding window approach:
1. For each request, the IP address is used as a key
2. Timestamps of recent requests are stored in an array for each IP
3. When a new request arrives:
   - Old timestamps (older than 1 minute) are filtered out
   - If 10 or more recent requests exist, the request is rejected
   - Otherwise, the current timestamp is added and the request is allowed

## Response Codes

- **401 Unauthorized**: Returned when DEEPSEEK_API_KEY is missing
- **429 Too Many Requests**: Returned when rate limit is exceeded
- **500 Internal Server Error**: Returned for general server errors
- **502 Bad Gateway**: Returned when the upstream AI service fails

## Security Considerations

1. **Secret Protection**: Error messages avoid exposing sensitive information
2. **Input Validation**: Query parameters are sanitized and limited in length
3. **Rate Limiting**: Prevents abuse and ensures fair usage
4. **IP Tracking**: Uses x-forwarded-for header to identify clients

## Limitations

1. **In-Memory Storage**: Rate limiting data is not persisted across server restarts
2. **Single Server**: Rate limiting only works per server instance
3. **IP Spoofing**: Sophisticated attackers may be able to bypass IP-based limits

## Testing

To test the rate limiting:
1. Make 10 rapid requests to the AI endpoint - all should succeed
2. Make an 11th request within the same minute - should return 429
3. Wait 1 minute and try again - should succeed

## Future Improvements

1. **Persistent Storage**: Use Redis or similar for distributed rate limiting
2. **Advanced Tracking**: Implement more sophisticated client identification
3. **Configurable Limits**: Allow different limits for different user tiers