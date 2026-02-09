# Production Server Fixes for PetrolHead

## Issues Found:
1. ❌ Demo URLs work with correct IDs (1, 2, 3) but might have nginx routing issues
2. ❌ Session endpoints returning 403 - nginx `/api/` path stripping  
3. ❌ LOG_LEVEL=DEBUG flooding logs with Supabase internals
4. ❌ Nginx proxy configuration stripping `/api/` prefix

---

## Fixes to Apply on Server

### 1. Update Nginx Configuration

**File:** `/root/PlainCrisp/infra/ServerSetup/nginxConfigs/AyushDhiman/petrolhead.ayushdhiman.dev`

**Change this:**
```nginx
location /api/ {
    proxy_pass http://localhost:6055/;  # ❌ Trailing slash strips /api/
```

**To this:**
```nginx
location /api/ {
    proxy_pass http://localhost:6055;  # ✅ No trailing slash preserves /api/
```

**Then run:**
```bash
sudo bash /root/PlainCrisp/infra/ServerSetup/deploy_certs.sh
sudo systemctl status nginx  # Verify it's running
```

---

### 2. Update Backend .env (Already pushed to GitHub)

Pull the latest changes which include:
- `LOG_LEVEL=INFO` (was DEBUG - caused log flooding)
- `CORS_ORIGINS` includes production domain

```bash
cd /root/PetrolHead
git pull
```

Verify the `.env` has:
```bash
grep "LOG_LEVEL" backend/.env
# Should show: LOG_LEVEL=INFO

grep "CORS_ORIGINS" backend/.env
# Should include: https://petrolhead.ayushdhiman.dev
```

---

### 3. Restart Backend

```bash
cd /root/PetrolHead
# Stop current process (Ctrl+C if running)
python3 -m petrolhead run
```

---

## Testing

### Test Demo Pages:
- ✅ https://petrolhead.ayushdhiman.dev/demo/1 (Sher Service Station)
- ✅ https://petrolhead.ayushdhiman.dev/demo/2 (Jay Garud Gas Station)
- ✅ https://petrolhead.ayushdhiman.dev/demo/3 (Jai Shree Ganesh Filling Station)

### Test API Directly:
```bash
# From server
curl http://localhost:6055/api/dashboard/demos
curl http://localhost:6055/api/dashboard/demo/1

# From outside (after nginx fix)
curl https://petrolhead.ayushdhiman.dev/api/dashboard/demos
```

### Check Logs:
After fixes, logs should be clean:
```bash
# Should see INFO level logs, not DEBUG hpack noise
tail -f backend/outputs/logs/petrolhead.log
```

---

## Summary of What Was Wrong:

1. **Nginx Trailing Slash**: The `/` after `:6055` in `proxy_pass` was stripping `/api/` from requests
   - Request: `/api/dashboard/demos` → Backend received: `/dashboard/demos` ❌
   - Fix: Remove trailing slash → Backend receives: `/api/dashboard/demos` ✅

2. **DEBUG Logging**: Flooded logs with low-level HTTP2 protocol details (hpack encoding)
   - Fixed by changing `LOG_LEVEL=DEBUG` to `LOG_LEVEL=INFO`

3. **CORS**: Production domain wasn't in allowed origins
   - Fixed by adding `https://petrolhead.ayushdhiman.dev` to CORS_ORIGINS

---

## Quick Fix Commands (Run on Server):

```bash
# 1. Pull latest code
cd /root/PetrolHead
git pull

# 2. Fix nginx config (manual edit or use sed)
sudo sed -i 's|proxy_pass http://localhost:6055/;|proxy_pass http://localhost:6055;|' \
  /root/PlainCrisp/infra/ServerSetup/nginxConfigs/AyushDhiman/petrolhead.ayushdhiman.dev

# 3. Deploy nginx changes
sudo bash /root/PlainCrisp/infra/ServerSetup/deploy_certs.sh

# 4. Restart backend
cd /root/PetrolHead
# (Stop current process with Ctrl+C first)
python3 -m petrolhead run
```
