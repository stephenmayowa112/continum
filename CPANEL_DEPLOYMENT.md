# cPanel deployment for NextJS (App Router)

1. In cPanel, create a Node.js application:
   - Go to "Setup Node.js App" in cPanel
   - Create an application using Node.js 18+ (or higher)
   - Set "Application mode" to Production
   - Set "Application root" to `/home/username/repositories/new_roshe` (where your repo is cloned)
   - Set "Application URL" to your domain or subdomain
   - Set "Application startup file" to `server.js`
   - Save

2. In the Node.js App settings page:
   - Set all environment variables manually:

   ```bash
   NODE_ENV=production
   AGORA_APP_ID=your-agora-app-id
   AGORA_APP_CERTIFICATE=your-agora-certificate
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SUPABASE_URL=your-public-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Create a Git Version Control deployment in cPanel:
   - Go to "Git Version Control"
   - Create a repo with URL: `git@github.com:Roshe-mentorship/new_roshe.git`
   - Branch: `main`
   - Set Repository Path to `/home/username/repositories/new_roshe`
   - Set Deployment Path to empty (we won't use this for direct file deployment)
   - Enable "Automatic Deployment"

4. In Repository settings:
   - Set "Deployment Commands" to:

   ```bash
   npm ci
   npm run build
   touch tmp/restart.txt
   ```

5. Run a manual pull/deploy to initialize everything

6. Troubleshooting:
   - Check cPanel error logs (Metrics → Errors)
   - Look at Node.js app logs
   - Make sure .env.local file isn't overriding your Node.js App settings
   - Confirm port settings in server.js match cPanel expectations
