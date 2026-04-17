# Analytics Setup Guide

Complete guide for setting up analytics tracking on Paperclip.

## Overview

This analytics system tracks:
- Page views and user flows
- Tool usage events
- Affiliate link clicks
- Carbon Ads performance
- Revenue attribution

## 1. Google Analytics 4 Setup

### Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Create new property for "Paperclip Developer Tools"
3. Select "Web" as platform
4. Enter site URL: `https://bigknoxy.github.io/paperclip-pages/`
5. Copy the Measurement ID (starts with G-)

### Step 2: Update Tracking Code

In `/root/paperclip/gh-pages/index.html` and all tool pages, replace:

```html
<!-- Current placeholder -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX');
</script>
```

With your actual Measurement ID:

```html
<!-- Replace G-XXXXXXXXXX with your actual ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-ABC123XYZ', {
  'custom_map': {
    'dimension1': 'tool_name',
    'dimension2': 'action_type'
  }
});
</script>
```

### Step 3: Configure Custom Events in GA4

In GA4 Admin > Custom Definitions > Create Custom Dimensions:

| Dimension Name | Scope | Description |
|----------------|-------|-------------|
| tool_name | Event | Name of tool being used |
| action_type | Event | Type of action (encode, decode, format, etc.) |
| affiliate_tool | Event | Affiliate tool clicked |
| scroll_depth | Event | Percentage scrolled |

### Step 4: Set Up Conversions

Mark these events as conversions:
- `affiliate_click` - When user clicks affiliate link
- `tool_usage` - When user uses a tool
- `carbon_ad_click` - When user clicks Carbon Ads

## 2. Carbon Ads Setup

### Step 1: Apply for Carbon Ads

1. Visit [Carbon Ads](https://www.carbonads.net/)
2. Apply as a publisher
3. Wait for approval (typically 1-2 weeks)
4. Once approved, get your placement code

### Step 2: Add Carbon Ads Code

Add to tool pages where you want ads displayed:

```html
<!-- Carbon Ads -->
<script async type="text/javascript" 
  src="//cdn.carbonads.com/carbon.js?serve=YOUR_SERVE_CODE&placement=YOUR_PLACEMENT" 
  id="_carbonads_js">
</script>
```

### Step 3: Configure Carbon Dashboard

1. Log into Carbon Ads publisher dashboard
2. Set up earnings notifications
3. Configure payment method (PayPal or bank transfer)
4. Set minimum payout threshold ($100)

## 3. Affiliate Link Tracking

### Step 1: Set Up Affiliate Programs

Recommended programs for developer tools:

| Program | Commission | Cookie | Sign Up |
|---------|-----------|--------|---------|
| **Jasper** | 30% recurring | 45 days | [Apply](https://www.jasper.ai/affiliates) |
| **Copy.ai** | 25% recurring | 60 days | [Apply](https://www.copy.ai/affiliates) |
| **Grammarly** | $0.20 per registration | 90 days | [Apply](https://www.grammarly.com/affiliates) |
| **JetBrains** | 25% per sale | 90 days | [Apply](https://www.jetbrains.com/affiliate/) |
| **DigitalOcean** | $25 per signup | 60 days | [Apply](https://www.digitalocean.com/referral-program) |
| **Vercel** | $10 per signup | 60 days | [Apply](https://vercel.com/affiliates) |
| **Notion** | 50% first year | 90 days | [Apply](https://www.notion.so/affiliate) |
| **Grammarly Business** | $25 per sale | 90 days | [Apply](https://www.grammarly.com/affiliates) |

### Step 2: Add Affiliate Links to Content

Update blog posts and tool pages with affiliate links:

```html
<!-- Before -->
<a href="https://www.jasper.ai">Try Jasper →</a>

<!-- After - with tracking -->
<a href="https://www.jasper.ai" 
   data-affiliate="jasper"
   class="affiliate-link">
   Try Jasper →
</a>
```

### Step 3: Configure Link Tracking

The analytics.js file automatically adds UTM parameters:
- `utm_source=paperclip`
- `utm_medium=affiliate`
- `utm_campaign=[tool_name]`
- `utm_content=[page_path]`

## 4. Dashboard Setup

### Option 1: Google Analytics Dashboard

Create a custom dashboard in GA4:

**Widget 1: Revenue Overview**
- Metric: Affiliate clicks (last 7 days)
- Metric: Carbon Ads impressions
- Metric: Total page views

**Widget 2: Top Tools**
- Dimension: tool_name
- Metric: tool_usage events
- Filter: Last 7 days

**Widget 3: Traffic Sources**
- Dimension: Session source
- Metric: Sessions
- Filter: Last 7 days

**Widget 4: Top Pages**
- Dimension: Page path
- Metric: Views
- Filter: Last 7 days

### Option 2: Simple Custom Dashboard

Use the included dashboard at `/analytics-dashboard.html`

## 5. Event Tracking Reference

### Tool Usage Events

```javascript
// Track tool encode
PaperclipAnalytics.tool.trackEncode('base64', input.length);

// Track tool decode
PaperclipAnalytics.tool.trackDecode('base64', input.length);

// Track format
PaperclipAnalytics.tool.trackFormat('json', input.length);

// Track convert
PaperclipAnalytics.tool.trackConvert('csv-to-json', 'csv', 'json', input.length);

// Track generate
PaperclipAnalytics.tool.trackGenerate('password', { length: 16 });

// Track copy
PaperclipAnalytics.tool.trackCopy('base64');

// Track download
PaperclipAnalytics.tool.trackDownload('json', 'json');
```

### Page Events

```javascript
// Track page view
PaperclipAnalytics.pageView('/tools/base64');

// Track custom event
PaperclipAnalytics.track('custom_event', { key: 'value' });
```

### Affiliate Events

```javascript
// Generate tracked URL
const trackedUrl = PaperclipAnalytics.affiliate.generateUrl(
  'jasper',
  'https://www.jasper.ai'
);
```

## 6. Testing Analytics

### Verify GA4 is Working

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
2. Open browser DevTools
3. Navigate to your site
4. Check Console for GA4 events

### Verify Event Tracking

```javascript
// Enable debug mode
PaperclipAnalytics.track('test_event', { test: true });

// Check network tab for requests to google-analytics.com
```

## 7. Privacy Compliance

### GDPR Considerations

1. **Consent Required**: Add cookie consent banner
2. **Anonymize IP**: Already enabled in analytics.js
3. **Data Retention**: Set to 14 months in GA4
4. **Right to be Forgotten**: Document deletion process

### Cookie Consent Banner

Add to all pages:

```html
<div id="cookie-banner" style="display:none;">
  <p>We use analytics to understand how visitors use our tools. 
     <a href="#" onclick="acceptCookies()">Accept</a> | 
     <a href="#" onclick="declineCookies()">Decline</a></p>
</div>

<script>
function acceptCookies() {
  localStorage.setItem('cookies_accepted', 'true');
  document.getElementById('cookie-banner').style.display = 'none';
  // Initialize analytics
}

function declineCookies() {
  localStorage.setItem('cookies_accepted', 'false');
  document.getElementById('cookie-banner').style.display = 'none';
}

// Show banner if not set
if (localStorage.getItem('cookies_accepted') === null) {
  document.getElementById('cookie-banner').style.display = 'block';
}
</script>
```

## 8. Weekly Review Checklist

Every Monday, check:

- [ ] Total page views (week over week)
- [ ] Top 5 pages by traffic
- [ ] Top 5 tools by usage
- [ ] Affiliate clicks and estimated revenue
- [ ] Carbon Ads impressions and earnings
- [ ] Traffic sources (organic, direct, referral)
- [ ] Any errors in analytics.js console
- [ ] New content performance

## 9. Revenue Attribution

### Track Revenue by Page

Create a spreadsheet:

| Page | Traffic | Affiliate Clicks | Est. Revenue | RPM |
|------|---------|-----------------|--------------|-----|
| /tools/base64 | 1,234 | 12 | $12 | $9.72 |
| /best-ai-writing-tools | 567 | 45 | $45 | $79.36 |
| ... | ... | ... | ... | ... |

### Calculate Key Metrics

**RPM (Revenue Per Mille)**:
```
RPM = (Revenue / Page Views) × 1000
```

**Conversion Rate**:
```
Conversion % = (Affiliate Clicks / Page Views) × 100
```

**Revenue Per Click**:
```
RPC = Revenue / Affiliate Clicks
```

## 10. Optimization Tips

1. **Double down on high-RPM content**: Create more posts like your top performers
2. **Optimize tool CTAs**: Test different button text and placement
3. **Add more affiliate links**: Where appropriate, not spammy
4. **Improve Carbon Ads placement**: Above the fold, visible but not intrusive
5. **Cross-promote tools**: Link between related tools
6. **Update old content**: Refresh top posts with new information
7. **A/B test headlines**: Use analytics to measure what works

## Resources

- [GA4 Documentation](https://support.google.com/analytics/topic/9143232)
- [Carbon Ads Publisher Guide](https://www.carbonads.net/publishers)
- [UTM Parameter Guide](https://support.google.com/analytics/answer/10917952)
- [GDPR Compliance Checklist](https://gdpr.eu/checklist/)
