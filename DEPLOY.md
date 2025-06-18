# Deployment on cPanel

This app requires a NodeJS environment (not just static hosting) because it uses:

1. Server API Routes (`app/api/*`)
2. Server-side rendering
3. Dynamic data fetching

## Setup Options

### Manual Setup (Recommended)

1. SSH into your cPanel server and:

   ```bash
   # Clone the repo to your home directory
   cd ~
   git clone git@github.com:Roshe-mentorship/new_roshe.git
   cd new_roshe

   # Install dependencies and build
   npm ci
   npm run build
   ```

2. In cPanel → Setup Node.js App:
   - Create new application
   - Node version: 18.x or higher
   - Mode: Production
   - App root: /home/yourusername/new_roshe
   - App URL: your domain
   - Startup file: server.js
  
3. Add all environment variables from your .env.local file

4. Save and start the application

### Alternative: Git Version Control

If you prefer automated deployment:

1. In cPanel → Git Version Control:
   - Create new repo pointing to your GitHub repo
   - Set:
     - Repository path: /home/yourusername/new_roshe
     - Branch: main
     - Deploy on update: Yes

2. In cPanel → Setup Node.js App:
   - Point to the same folder
   - Use server.js as startup

3. Update your .cpanel.yml file in your repo with:

   ```yaml
   ---
   deployment:
     tasks:
       - npm ci
       - npm run build
       - touch tmp/restart.txt
   ```

## Troubleshooting

1. Check Node.js App logs in cPanel
2. Ensure port matches (default 3000)
3. Verify environment variables are set
4. Look at error logs in cPanel → Metrics → Errors
