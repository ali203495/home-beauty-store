# Marrakech Luxe — Production Deployment Guide

This document outlines the steps to deploy the Marrakech Luxe platform to a live environment using a hybrid approach (Backend on Render, Frontend on Vercel).

## 1. Backend Deployment (Render)
- **Service Type**: Web Service (Node.js)
- **Root Directory**: `./`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment Variables**:
    - `NODE_ENV`: `production`
    - `PORT`: `3000` (or leave default)
    - `DATABASE_URL`: (Optional) Use for Postgres transition.
    - `VERCEL`: `0`
- **Persist Storage**:
    - Build a "Disk" mount at `/opt/render/project/src/db` to ensure SQLite data persists across restarts.

## 2. Frontend Deployment (Vercel)
- **Service Type**: Static / Serverless (Hybrid)
- **Framework**: Other / Next.js (detected automatically via server.js)
- **Environment Variables**:
    - `POSTGRES_URL`: (Optional) Use if using Vercel Postgres.
    - `VERCEL`: `1`
- **Configuration**: `vercel.json` is already optimized for routing and security headers.

## 3. Domain & DNS Configuration
- **Canonical Domain**: `marrakech-luxe.ma`
- **DNS Records**:
    - `Type A`: Point `@` to Vercel/Render IP.
    - `Type CNAME`: Point `www` to `cname.vercel-dns.com`.
- **SSL**: Automatically managed by Vercel/Render.

## 4. Final Cleanup Checklist
- [ ] Remove `G-XXXXXXXXXX` and replace with your actual GA4 Measurement ID in `index.html`.
- [ ] Update `WHATSAPP_NUMBER` in `js/main.js` if the commercial number changes.
- [ ] Verify `assets/webp/og-banner.webp` is visible on social previews (use Open Graph Debugger).

## 5. Security Posture
- The platform uses `Helmet`-style headers (X-Frame-Options, XSS Protection).
- Ensure your hosting dashboard has "DDoS Protection" and "Firewall" enabled (standard on Vercel/Render).
