# DeepSeek AI Configuration

## Overview

This document explains how to configure the DeepSeek AI integration for the FoodAI application.

## Environment Variables

The application requires the following DeepSeek AI environment variable:

### Required Variable

`DEEPSEEK_API_KEY` - Your DeepSeek API key for accessing the AI chat functionality

## Getting Your API Key

1. Go to https://platform.deepseek.com/
2. Sign up for an account or log in if you already have one
3. Navigate to the API keys section
4. Generate a new API key
5. Copy and paste it into your `.env.local` file

## API Usage

The application uses the DeepSeek API for the chatbot functionality:

1. User queries are sent to the `/api/ai` endpoint
2. The endpoint retrieves relevant offers from Supabase
3. The offers data is sent to DeepSeek API with a Finnish language prompt
4. The AI response is returned to the user in Finnish

## Security Notes

- Keep your API key secret and never commit it to version control
- The API key is only used server-side to prevent exposure to clients
- Use environment variables to manage your API key across different environments

## Testing the Integration

To test the AI chat functionality:

1. Ensure your `DEEPSEEK_API_KEY` is set in `.env.local`
2. Start the development server: `npm run dev`
3. Navigate to the homepage
4. Use the chatbot interface to ask questions about food deals

## Troubleshooting

### Common Issues

1. **API key invalid**: Verify your API key is correct and active
2. **Rate limiting**: Check if you've exceeded your API quota
3. **Network errors**: Ensure your server can reach the DeepSeek API endpoint

### Getting Help

If you're having trouble with your DeepSeek API configuration:
1. Check the DeepSeek documentation: https://platform.deepseek.com/docs
2. Verify your API key in the DeepSeek dashboard
3. Check the application logs for detailed error messages