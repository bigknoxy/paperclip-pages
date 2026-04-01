# Web Performance Monitoring: A Complete Guide

**Published:** March 30, 2026  
**Reading Time:** 14 minutes  
**Category:** Developer Tools

---

## Table of Contents

1. [Why Monitor Web Performance](#why-monitor-web-performance)
2. [Key Metrics to Track](#key-metrics-to-track)
3. [Real User Monitoring (RUM)](#real-user-monitoring-rum)
4. [Synthetic Monitoring](#synthetic-monitoring)
5. [Core Web Vitals Tracking](#core-web-vitals-tracking)
6. [Performance Budgets](#performance-budgets)
7. [Alerting and Incident Response](#alerting-and-incident-response)
8. [Tools Comparison](#tools-comparison)
9. [Implementation Guide](#implementation-guide)

---

## Why Monitor Web Performance

### Business Impact

| Performance | Conversion Impact |
|-------------|-----------------|
| 1s load time | 3x conversion vs 5s |
| 100ms delay | 1% revenue loss |
| 53% mobile | Abandon if >3s |

### SEO Impact

Google uses Core Web Vitals as ranking signals:
- **Largest Contentful Paint (LCP)** - Loading performance
- **First Input Delay (FID)** - Interactivity
- **Cumulative Layout Shift (CLS)** - Visual stability

---

## Key Metrics to Track

### Load Metrics

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | <2.5s | 2.5s-4s | >4s |
| **TTFB** | <600ms | 600ms-1s | >1s |
| **FCP** | <1.8s | 1.8s-3s | >3s |

### Interaction Metrics

| Metric | Good | Poor |
|--------|------|------|
| **FID** | <100ms | >300ms |
| **TBT** | <200ms | >600ms |
| **INP** | <200ms | >500ms |

### Stability Metrics

| Metric | Good | Needs Improvement |
|--------|------|-------------------|
| **CLS** | <0.1 | 0.1-0.25 |

---

## Real User Monitoring (RUM)

### What is RUM?

Collects performance data from actual users:
- Network conditions
- Device capabilities
- Geographic location
- User behavior patterns

### Implementation

```javascript
// Web Vitals library
import { getCLS, getFID, getFCP, getINP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  
  // Use navigator.sendBeacon() if available
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  } else {
    fetch('/analytics', { body, method: 'POST', keepalive: true });
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getINP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### RUM Best Practices

1. **Sample 100% of users** for accuracy
2. **Anonymize data** for privacy
3. **Track by page type** for insights
4. **Monitor by device** and connection
5. **Set up alerts** for regressions

---

## Synthetic Monitoring

### Lab vs Field Data

| Synthetic (Lab) | RUM (Field) |
|-----------------|-------------|
| Controlled environment | Real user conditions |
| Reproducible | Variable conditions |
| Pre-deployment testing | Production monitoring |
| Lighthouse, WebPageTest | Analytics, RUM tools |

### Setting Up Synthetic Tests

```javascript
// Lighthouse CI
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }]
      }
    }
  }
};
```

---

## Core Web Vitals Tracking

### Chrome User Experience Report (CrUX)

**Free data source:**
- Real-world Chrome data
- Aggregated by origin/page
- Historical trends
- API access available

```javascript
// Access CrUX API
const url = 'https://chromeuxreport.googleapis.com/v1/records:queryRecord';
const body = {
  origin: 'https://example.com',
  formFactor: 'PHONE'
};

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});
```

### Field Data Collection

```javascript
// Store Web Vitals in localStorage for session tracking
function saveWebVital(metric) {
  const vitals = JSON.parse(localStorage.getItem('web-vitals') || '[]');
  vitals.push({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    timestamp: Date.now()
  });
  localStorage.setItem('web-vitals', JSON.stringify(vitals));
}
```

---

## Performance Budgets

### Setting Budgets

```json
{
  "budgets": [
    {
      "path": "/*",
      "resourceSizes": [
        { "resourceType": "script", "budget": 300 },
        { "resourceType": "image", "budget": 500 },
        { "resourceType": "stylesheet", "budget": 50 },
        { "resourceType": "total", "budget": 2000 }
      ],
      "timings": [
        { "metric": "largest-contentful-paint", "budget": 2500 },
        { "metric": "total-blocking-time", "budget": 200 }
      ]
    }
  ]
}
```

### CI Integration

```yaml
# .github/workflows/performance.yml
name: Performance Budget Check
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

---

## Alerting and Incident Response

### Setting Up Alerts

```javascript
// Example: Alert when LCP > 4s
function checkPerformance(metric) {
  if (metric.name === 'LCP' && metric.value > 4000) {
    // Send alert
    fetch('/alerts', {
      method: 'POST',
      body: JSON.stringify({
        type: 'performance_regression',
        metric: 'LCP',
        value: metric.value,
        page: window.location.pathname
      })
    });
  }
}
```

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| LCP | > 2.5s | > 4s |
| FID | > 100ms | > 300ms |
| CLS | > 0.1 | > 0.25 |
| Error rate | > 1% | > 5% |

---

## Tools Comparison

### Free Tools

| Tool | Type | Best For |
|------|------|----------|
| **Lighthouse** | Lab | Development testing |
| **PageSpeed Insights** | Both | Quick checks |
| **Web Vitals Chrome Extension** | Lab | Browser testing |
| **Chrome DevTools** | Lab | Deep analysis |

### Paid Tools

| Tool | Price | Features |
|------|-------|----------|
| **Datadog** | $15/host | Full observability |
| **New Relic** | Custom | APM + RUM |
| **SpeedCurve** | $99/mo | RUM + synthetic |
| **GTmetrix** | $14/mo | Synthetic testing |

### Open Source

| Tool | Language | Features |
|------|----------|----------|
| **Sitespeed.io** | Node.js | Automated testing |
| **WebPageTest** | Various | Detailed metrics |
| **Calibre** | SaaS | Performance budgets |

---

## Implementation Guide

### Step 1: Add Web Vitals Library

```bash
npm install web-vitals
```

### Step 2: Create Monitoring Script

```javascript
// analytics.js
import { getCLS, getFID, getFCP, getINP, getLCP, getTTFB } from 'web-vitals';

function reportWebVitals(metric) {
  // Send to your analytics endpoint
  fetch('/api/vitals', {
    method: 'POST',
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType
    })
  });
}

// Initialize tracking
getCLS(reportWebVitals);
getFID(reportWebVitals);
getFCP(reportWebVitals);
getINP(reportWebVitals);
getLCP(reportWebVitals);
getTTFB(reportWebVitals);
```

### Step 3: Dashboard Setup

Track these metrics:
- Page-level LCP trends
- 75th percentile by device
- Regression alerts
- Resource load times

---

## Conclusion

### Key Takeaways

✅ **Monitor both lab and field data**  
✅ **Set performance budgets** in CI/CD  
✅ **Alert on regressions** quickly  
✅ **Track Core Web Vitals** continuously  
✅ **Use real user data** for insights  

### Quick Start

1. Add web-vitals library
2. Collect field data
3. Set up synthetic tests
4. Create performance budgets
5. Configure alerts

---

*Last updated: March 30, 2026*  
*Related: [Technical SEO for Developers](/content/technical-seo-developers)*

**Related Tools:**
- [JSON Formatter](/tools/json-formatter)
- [URL Encoder](/tools/url-encoder)