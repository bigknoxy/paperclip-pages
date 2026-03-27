# Infrastructure Setup Guide

This document covers the infrastructure for tracking, monitoring, and deployment automation.

## Overview

The Paperclip GitHub Pages site uses the following infrastructure:

- **Hosting**: GitHub Pages (free, automated)
- **Analytics**: Google Analytics 4
- **Search**: Google Search Console
- **Monitoring**: Uptime monitoring via health check endpoint
- **Deployment**: GitHub Actions automated deployment

## Deployment

### Automated Deployment

The site deploys automatically on every push to `main`:

- Workflow: `.github/workflows/deploy-pages.yml`
- Trigger: Push to `main` branch
- Build: Node.js 18 + Vite
- Output: `dist/` folder deployed to GitHub Pages

### Manual Deployment

```bash
# Install dependencies
npm ci

# Build
npm run build

# Verify build output
ls -la dist/

# Deploy (GitHub Actions handles this automatically on push)
git push origin main
```

## Analytics Setup

### Google Analytics 4

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property for your site
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)
4. Update `index.html`:
   - Replace `G-XXXXXXXXXX` with your actual Measurement ID

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOURMEASUREMENTID"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-YOURMEASUREMENTID');
</script>
```

### Events to Track

Current setup tracks:
- Page views (automatic)
- User engagement

## Search Console Setup

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: `https://bigknoxy.github.io/paperclip-pages/`
3. Choose HTML tag verification method
4. Copy the verification meta tag
5. Update `index.html` meta tag:

```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

## Uptime Monitoring

### Health Check Endpoint

The site provides a health check endpoint at `/health.html`:

- Status: Returns HTTP 200 if site is accessible
- Response: JSON with timestamp and status

### UptimeRobot Setup (Free Tier)

1. Go to [UptimeRobot](https://uptimerobot.com/)
2. Create account (free tier: 50 monitors)
3. Add HTTP(s) monitor:
   - URL: `https://bigknoxy.github.io/paperclip-pages/health.html`
   - Monitoring interval: 5 minutes
   - Alert contacts: Email

## Error Tracking

### Sentry Setup (Free Tier)

1. Go to [Sentry](https://sentry.io/)
2. Create account (free tier: 5k errors/month)
3. Create new project for your site
4. Add DSN to site (optional for static sites)

For static GitHub Pages sites, Sentry is optional but recommended for JavaScript error tracking.

## Key Metrics

Track these metrics for the $100k MRR goal:

### Traffic
- Monthly unique visitors (GA4)
- Page views per session
- Bounce rate
- Traffic sources

### SEO
- Search impressions (Search Console)
- Click-through rate
- Average position
- Indexed pages

### Revenue (when monetized)
- Conversion rate
- Revenue per visitor
- Ad impressions/clicks

## Monitoring Dashboard

### Quick Health Check

Visit these URLs to verify everything is working:

- Site: https://bigknoxy.github.io/paperclip-pages/
- Health: https://bigknoxy.github.io/paperclip-pages/health.html

### GitHub Actions Status

View deployment status:
https://github.com/bigknoxy/paperclip-pages/actions

## Troubleshooting

### Build Failures

1. Check Actions tab in GitHub repo
2. Verify `npm ci` completes without errors
3. Ensure `dist/` folder is created

### Analytics Not Working

1. Verify Measurement ID is correct
2. Check Network tab for `gtag.js` loading
3. Wait 24-48 hours for GA4 data to appear

### Search Console Issues

1. Verify meta tag is in `<head>` section
2. Check robots.txt allows indexing
3. Submit sitemap if available

## Resources

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Google Analytics 4](https://support.google.com/analytics/answer/10089681)
- [Google Search Console](https://support.google.com/webmasters/answer/9128668)
- [UptimeRobot](https://uptimerobot.com/help/)
