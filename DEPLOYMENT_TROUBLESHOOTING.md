# Vercel Deployment Troubleshooting Guide

## Issue: Real-time features not working on Vercel but work locally

### 🔧 **Step-by-Step Solution:**

## 1. **Environment Variables** (Most Common Issue)
Your AirState configuration requires `NEXT_PUBLIC_AIRSTATE_APP_ID` to be available in production.

### ✅ **Fix in Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com) → Your Project → **Settings** → **Environment Variables**
2. Add these variables for **ALL environments** (Development, Preview, Production):
   ```
   NEXT_PUBLIC_AIRSTATE_APP_ID = pk_airstate_4nhQXwWvGK2mKLBsryylp
   ```
3. **Redeploy** your application after adding the environment variable

## 2. **Domain/CORS Issues**
If you're using a custom domain or the AirState service has CORS restrictions:

### ✅ **Check in Browser Console:**
1. Open your deployed app
2. Open Developer Tools (F12) → Console
3. Look for:
   - ❌ CORS errors
   - ❌ "AirState APP_ID is missing" 
   - ❌ Network connection failures
   - ✅ "AirState configured successfully"

## 3. **WebSocket/Real-time Connection Issues**
Vercel's serverless nature can sometimes interfere with persistent connections.

### ✅ **Debugging Steps:**
1. Check console logs for connection status
2. Test with multiple browser tabs to verify real-time sync
3. Try using the app in incognito mode

## 4. **Build Configuration Issues**

### ✅ **Add to next.config.ts:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure client-side code works properly
  reactStrictMode: true,
  
  // Handle WebSocket connections
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app']
    }
  },
  
  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_AIRSTATE_APP_ID: process.env.NEXT_PUBLIC_AIRSTATE_APP_ID,
  }
};

export default nextConfig;
```

## 5. **Serverless Function Limitations**
If the issue persists, consider these alternatives:

### ✅ **Alternative Solutions:**
1. **Upgrade Vercel Plan**: Hobby plan has limitations on serverless functions
2. **Use Vercel Edge Functions**: Better for real-time apps
3. **Deploy to Railway/Render**: Better support for persistent connections
4. **Self-host on VPS**: Full control over WebSocket connections

## 6. **Common Verification Steps**

### ✅ **Check These in Production:**
1. **Open Browser Console** on your deployed app
2. **Verify Environment Variables** are loaded:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_AIRSTATE_APP_ID)
   ```
3. **Test Real-time Features**:
   - Open app in two browser tabs
   - Add a task in one tab
   - Verify it appears in the other tab
4. **Check Connection Status**:
   - Look for the connection indicator in the header
   - Should show "Connected" when working properly

## 🚨 **Emergency Fix**
If nothing works, try this quick fix:

1. In Vercel dashboard, go to **Deployments**
2. Find your latest deployment
3. Click **"Redeploy"** (this forces a fresh build with new env vars)
4. Wait for deployment to complete
5. Test the app again

## 📊 **Debug Information**
The app now logs debug information to the console. Check for:
- ✅ "AirState configured successfully" 
- ❌ "AirState APP_ID is missing"
- 📊 Connection status updates

---

### 💡 **Most Likely Solution:**
**90% of deployment issues are due to missing environment variables in Vercel.**
Make sure `NEXT_PUBLIC_AIRSTATE_APP_ID` is set in your Vercel project settings!