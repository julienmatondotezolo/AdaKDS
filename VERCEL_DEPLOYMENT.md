# 🚀 Vercel Deployment Guide for AdaKDS

## Overview

AdaKDS now uses **Supabase Realtime** instead of Socket.IO for real-time functionality, making it fully compatible with Vercel's serverless architecture.

## Required Environment Variables

Add these environment variables in your **Vercel Dashboard** → **Project Settings** → **Environment Variables**:

### Production Configuration

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api-kds.adasystems.app
NEXT_PUBLIC_RESTAURANT_ID=c1cbea71-ece5-4d63-bb12-fe06b03d1140
NEXT_PUBLIC_AUTH_URL=https://auth.adasystems.app

# Supabase Realtime (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://dxxtxdyrovawugvvrhah.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4eHR4ZHlyb3Zhd3VndnZyaGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzNjgyMDUsImV4cCI6MjA0NDk0NDIwNX0.lNiKXvO8vQ8wfcKHQ4vf0YAqWgCm3_IqPUJ-u0mLNM4
```

### Legacy Variables (Optional - for fallback)

```bash
# WebSocket (legacy - not used but kept for compatibility)
NEXT_PUBLIC_WS_URL=wss://api-kds.adasystems.app
```

## How Real-time Works

### ✅ **NEW: Supabase Realtime** 
- **Database subscriptions** to `kds_orders` table changes
- **Restaurant filtering** with `restaurant_id=c1cbea71-ece5-4d63-bb12-fe06b03d1140`
- **Automatic reconnection** and connection management
- **Works on Vercel** - no server-side WebSocket dependencies

### ❌ **OLD: Socket.IO WebSockets** 
- Required persistent server connections
- Not compatible with Vercel serverless functions
- Replaced but kept for potential future use

## Features Enabled

✅ **Real-time order updates**  
✅ **Live status changes** (New → Preparing → Ready → Completed)  
✅ **Audio notifications** for order status changes  
✅ **Browser push notifications** for new orders  
✅ **Connection status indicators**  
✅ **Restaurant isolation** (only shows orders for configured restaurant)  
✅ **Automatic data loading** on connection  

## Deployment Steps

1. **Push code** to GitHub main branch
2. **Configure environment variables** in Vercel dashboard  
3. **Deploy** - Vercel will automatically detect the changes
4. **Test real-time functionality** by creating orders via API

## Testing Real-time

After deployment, test with a curl command:

```bash
curl -X POST https://api-kds.adasystems.app/api/v1/restaurants/c1cbea71-ece5-4d63-bb12-fe06b03d1140/orders/ada-menu \
  -H "Content-Type: application/json" \
  -d '{
    "menu_id": "losteria-menu-v1",
    "customer_name": "Test Customer",
    "customer_type": "dine_in", 
    "table_number": "Table 5",
    "items": [{"menu_item_id": "test", "name": "Test Item", "quantity": 1, "price": 10}],
    "total_price": 10
  }'
```

The order should appear **instantly** in the KDS interface without page refresh!

## Troubleshooting

### No real-time updates?
- Check Vercel environment variables are set correctly
- Verify Supabase project URL and anon key  
- Check browser console for connection errors
- Ensure `NEXT_PUBLIC_RESTAURANT_ID` matches your database records

### Database permissions?
- Supabase anon key has read access to `kds_orders` table
- Row Level Security (RLS) may need configuration for your use case
- Test database queries directly in Supabase dashboard

## Architecture Benefits

🎯 **Serverless-first**: No server state or persistent connections  
🎯 **Cost-effective**: Supabase handles realtime infrastructure  
🎯 **Scalable**: Automatic scaling with Vercel + Supabase  
🎯 **Reliable**: Built-in reconnection and error handling  
🎯 **Restaurant-ready**: Professional-grade kitchen display system  

---

**Result**: ✅ **Production-ready KDS** deployable on Vercel with real-time functionality!