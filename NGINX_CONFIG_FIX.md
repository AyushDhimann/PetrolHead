# Nginx Configuration Fix for PetrolHead

## Problem
- `/api/chat` is a Next.js API route (runs on port 5055)
- Other `/api/*` routes are FastAPI endpoints (run on port 6055)
- Current nginx proxies ALL `/api/*` to FastAPI, breaking chat

## Solution
Update nginx config to handle both:

```nginx
# Next.js API route - must come FIRST (more specific)
location /api/chat {
    proxy_pass http://localhost:5055;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# FastAPI backend routes - must come SECOND (less specific)
location /api/ {
    proxy_pass http://localhost:6055/;  # Keep trailing slash to strip /api/ prefix
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Next.js frontend - root and all other routes
location / {
    proxy_pass http://localhost:5055;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Key Points
1. **Order matters** - More specific route (`/api/chat`) MUST come before generic (`/api/`)
2. `/api/chat` → Next.js (5055) - Chat widget functionality
3. `/api/*` → FastAPI (6055) - Research, dashboard, session APIs
4. Keep trailing slash on FastAPI proxy_pass to strip `/api/` prefix
5. No trailing slash needed on Next.js routes

## Deployment Steps
```bash
# 1. SSH to server
ssh root@139.59.89.115

# 2. Edit nginx config (typically in /etc/nginx/sites-available/)
nano /etc/nginx/sites-available/petrolhead.ayushdhiman.dev

# 3. Apply the location block ordering above

# 4. Test config
sudo nginx -t

# 5. Reload nginx
sudo systemctl reload nginx

# 6. Pull latest code
cd /root/PetrolHead
git pull

# 7. Restart backend
python3 -m petrolhead run
```

## Verification
After deployment:
- ✅ https://petrolhead.ayushdhiman.dev/api/chat → Next.js (chat works)
- ✅ https://petrolhead.ayushdhiman.dev/api/research → FastAPI
- ✅ https://petrolhead.ayushdhiman.dev/api/session → FastAPI
- ✅ https://petrolhead.ayushdhiman.dev/demo/1 → Next.js frontend
