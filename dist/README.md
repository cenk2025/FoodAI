# FoodAi Deployment Package

This is a pre-built deployment package for the FoodAi application.

## Deployment Instructions

1. Upload the entire contents of this folder to your server via FTP/SFTP
2. Make sure Node.js is installed on your server
3. Run the start script:
   ```bash
   ./start.sh
   ```
   Or manually:
   ```bash
   npm install
   node server.js
   ```

## Environment Configuration

The application will run on port 3000 by default. You can change this by modifying the `.env` file.

## Supabase Configuration

Make sure your Supabase credentials in `.env.local` are correctly configured for your production environment.

## Accessing the Application

After starting the server, you can access the application at:
- http://your-server-ip:3000/fi (Finnish)
- http://your-server-ip:3000/en (English)