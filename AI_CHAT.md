# AI Chatbot Functionality

## Overview

The AI chatbot uses DeepSeek API to provide intelligent responses about food discounts. It retrieves relevant offers from Supabase based on user queries and generates Finnish responses with offer cards.

## Implementation Details

### API Endpoint

The chatbot functionality is implemented in `/app/api/ai/route.ts` and provides a POST endpoint that:

1. Receives a user query and optional city filter
2. Queries the Supabase `offer_index` table for relevant offers
3. Sends the offers data to DeepSeek API
4. Returns the AI-generated response in Finnish

### Frontend Component

The chat interface is implemented in `/components/ai/chat.tsx` as a client-side component that:

1. Provides an input field for user queries
2. Sends requests to the API endpoint
3. Displays the AI-generated responses

### Homepage Integration

The chatbot is integrated into the homepage (`/app/page.tsx`) using Next.js dynamic imports to ensure it's only loaded on the client side.

## Environment Variables

The following environment variables are required:

- `DEEPSEEK_API_KEY` - API key for DeepSeek
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE` - Supabase service role key

## How It Works

1. User enters a query in the chat interface
2. The query is sent to the `/api/ai` endpoint
3. The API endpoint:
   - Queries Supabase for relevant offers (limited to 8, ordered by discount percent)
   - Filters by query keywords and city if provided
   - Sends the top 5 offers to DeepSeek API
   - Returns the AI-generated response
4. The frontend displays the response to the user

## AI Prompt Structure

The AI is instructed to:

- Always respond in Finnish
- Summarize the top 3-5 discounts with bullet points
- Include call-to-action lines with links to `/go/{offerId}`
- Keep responses concise

## Testing

Run the test suite with:
```bash
npm run test
```

## Security Considerations

- API keys are only accessed server-side
- User queries are sanitized and limited in length
- Supabase queries use parameterized inputs to prevent injection
- The AI response is returned as-is to the client without additional processing

## Customization

To modify the AI behavior:
1. Update the system prompt in `/app/api/ai/route.ts`
2. Adjust the query parameters for Supabase
3. Modify the response format in the frontend component