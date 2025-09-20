# FoodAI

A trivago-like metasearch for discounted food offers in Finland.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Firebase Auth
- DeepSeek AI

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Copy `.env.local.example` to `.env.local` and fill in your credentials.

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js app router pages
- `components/` - React components
- `lib/` - Utility functions and Supabase clients
- `public/` - Static assets
- `scripts/` - Utility scripts
- `styles/` - Global styles
- `types/` - TypeScript types

## Supabase Setup

1. Create a Supabase project at https://supabase.com/
2. Get your project URL and API keys from Settings > API
3. Update `.env.local` with your Supabase credentials
4. Run the database generation script:
```bash
npm run db:gen
```

## DeepSeek AI Setup

1. Get your API key from https://platform.deepseek.com/
2. Update `.env.local` with your DEEPSEEK_API_KEY
3. The AI chatbot will be available on the homepage

## Learn More

To learn more about the technologies used in this project, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)