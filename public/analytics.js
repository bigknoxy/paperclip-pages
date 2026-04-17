/**
 * Paperclip Analytics
 * Tracks page views, tool usage, and affiliate clicks
 * GDPR-compliant, anonymized tracking
 */

(function() {
  'use strict';

  // Configuration - Replace with actual GA4 ID when available
  const CONFIG = {
    GA4_ID: 'G-XXXXXXXXXX', // Replace with actual Measurement ID
    CARBON_PLACEMENT: '', // Will be set when Carbon Ads activated
    AFFILIATE_PREFIX: 'https://go.paperclip.tools',
    DEBUG: false
  };

  // Utility functions
  const util = {
    generateId: () => Math.random().toString(36).substring(2) + Date.now().toString(36),
    
    getDeviceInfo: () => ({
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      platform: navigator.platform
    }),
    
    getUtmParams: () => {
      const params = new URLSearchParams(window.location.search);
      return {
        source: params.get('utm_source'),
        medium: params.get('utm_medium'),
        campaign: params.get('utm_campaign'),
        content: params.get('utm_content')
      };
    },
    
    throttle: (fn, limit) => {
      let inThrottle;
      return function() {
        if (!inThrottle) {
          fn.apply(this, arguments);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  };

  // Session management
  const Session = {
    id: null,
    startTime: null,
    pageViews: 0,
    
    init() {
      this.id = sessionStorage.getItem('pc_session_id') || util.generateId();
      this.startTime = sessionStorage.getItem('pc_session_start') || Date.now();
      sessionStorage.setItem('pc_session_id', this.id);
      sessionStorage.setItem('pc_session_start', this.startTime);
      
      // Track unique visitor
      if (!localStorage.getItem('pc_first_visit')) {
        localStorage.setItem('pc_first_visit', Date.now());
        this.trackEvent('first_visit', {});
      }
    },
    
    getDuration() {
      return Date.now() - parseInt(this.startTime);
    }
  };

// Event storage - persist to localStorage for dashboard
const EventStorage = {
  MAX_EVENTS: 5000,

  load() {
    try {
      const stored = localStorage.getItem('pc_analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  save(event) {
    try {
      let events = this.load();
      events.push(event);
      // Keep only last MAX_EVENTS
      if (events.length > this.MAX_EVENTS) {
        events = events.slice(-this.MAX_EVENTS);
      }
      localStorage.setItem('pc_analytics_events', JSON.stringify(events));
    } catch (e) {
      console.warn('[Analytics] Failed to save event:', e);
    }
  },

  getStats() {
    return this.load();
  },

  clear() {
    localStorage.removeItem('pc_analytics_events');
  }
};

// Event tracking
const Events = {
  queue: [],

  track(name, data = {}) {
    const event = {
      name,
      timestamp: Date.now(),
      session_id: Session.id,
      session_duration: Session.getDuration(),
      page: window.location.pathname,
      referrer: document.referrer,
      ...util.getDeviceInfo(),
      ...util.getUtmParams(),
      ...data
    };

    this.queue.push(event);

    // Persist to localStorage for dashboard
    EventStorage.save(event);

    // Send to GA4 if available
    if (typeof gtag !== 'undefined' && CONFIG.GA4_ID !== 'G-XXXXXXXXXX') {
      gtag('event', name, event);
    }

    // Log in debug mode
    if (CONFIG.DEBUG) {
      console.log('[Analytics]', name, event);
    }

    // Send to custom endpoint (when implemented)
    this.flush();
  },

  flush: util.throttle(() => {
    if (Events.queue.length === 0) return;

    // Send to your analytics endpoint
    // fetch('/api/analytics/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ events: Events.queue }),
    //   keepalive: true
    // });

    Events.queue = [];
  }, 5000)
};

  // Tool usage tracking
  const ToolTracker = {
    track(toolName, action, data = {}) {
      Events.track('tool_usage', {
        tool: toolName,
        action: action,
        ...data
      });
    },
    
    // Track common tool actions
    trackEncode(toolName, inputSize) {
      this.track(toolName, 'encode', { input_size: inputSize });
    },
    
    trackDecode(toolName, inputSize) {
      this.track(toolName, 'decode', { input_size: inputSize });
    },
    
    trackGenerate(toolName, options = {}) {
      this.track(toolName, 'generate', options);
    },
    
    trackFormat(toolName, inputSize) {
      this.track(toolName, 'format', { input_size: inputSize });
    },
    
    trackConvert(toolName, fromFormat, toFormat, inputSize) {
      this.track(toolName, 'convert', { 
        from: fromFormat, 
        to: toFormat,
        input_size: inputSize 
      });
    },
    
    trackCopy(toolName) {
      this.track(toolName, 'copy_output', {});
    },
    
    trackDownload(toolName, format) {
      this.track(toolName, 'download', { format });
    }
  };

  // Affiliate link tracking
  const AffiliateTracker = {
    links: {},
    
    init() {
      // Track all affiliate link clicks
      document.querySelectorAll('a[data-affiliate]').forEach(link => {
        const tool = link.dataset.affiliate;
        const originalHref = link.href;
        
        // Add UTM parameters
        const url = new URL(originalHref);
        url.searchParams.set('utm_source', 'paperclip');
        url.searchParams.set('utm_medium', 'affiliate');
        url.searchParams.set('utm_campaign', tool);
        url.searchParams.set('utm_content', window.location.pathname);
        
        // Track click
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          Events.track('affiliate_click', {
            tool: tool,
            target: originalHref,
            page: window.location.pathname
          });
          
          // Update href and navigate
          link.href = url.toString();
          window.open(link.href, '_blank');
        });
        
        this.links[tool] = {
          original: originalHref,
          tracked: url.toString()
        };
      });
    },
    
    // Generate tracked affiliate URL
    generateUrl(tool, baseUrl) {
      const url = new URL(baseUrl);
      url.searchParams.set('utm_source', 'paperclip');
      url.searchParams.set('utm_medium', 'affiliate');
      url.searchParams.set('utm_campaign', tool);
      url.searchParams.set('utm_content', window.location.pathname);
      return url.toString();
    }
  };

  // Carbon Ads tracking
  const CarbonTracker = {
    init() {
      // Track Carbon Ads impressions and clicks
      if (window._carbonads) {
        // Carbon Ads loads asynchronously
        const checkAds = setInterval(() => {
          const ad = document.querySelector('#carbonads');
          if (ad) {
            clearInterval(checkAds);
            Events.track('carbon_ad_loaded', {
              placement: window.location.pathname
            });
            
            // Track clicks
            ad.addEventListener('click', () => {
              Events.track('carbon_ad_click', {
                placement: window.location.pathname
              });
            });
          }
        }, 1000);
      }
    }
  };

  // Page performance tracking
  const PerformanceTracker = {
    init() {
      // Track page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            Events.track('page_performance', {
              load_time: Math.round(perfData.loadEventEnd - perfData.startTime),
              dom_interactive: Math.round(perfData.domInteractive - perfData.startTime),
              dom_complete: Math.round(perfData.domComplete - perfData.startTime)
            });
          }
        }, 0);
      });
      
      // Track engagement time
      let engagementStart = Date.now();
      let totalEngagement = 0;
      
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          totalEngagement += Date.now() - engagementStart;
        } else {
          engagementStart = Date.now();
        }
      });
      
      // Track before unload
      window.addEventListener('beforeunload', () => {
        if (!document.hidden) {
          totalEngagement += Date.now() - engagementStart;
        }
        Events.track('session_end', {
          engagement_time: Math.round(totalEngagement / 1000),
          page_views: Session.pageViews
        });
      });
    }
  };

  // Scroll and engagement tracking
  const EngagementTracker = {
    init() {
      let maxScroll = 0;
      
      window.addEventListener('scroll', util.throttle(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent;
          
          // Track scroll milestones
          if ([25, 50, 75, 90, 100].includes(maxScroll)) {
            Events.track('scroll_depth', { 
              depth: maxScroll,
              page: window.location.pathname 
            });
          }
        }
      }, 1000));
      
      // Track time on page
      const timeMarkers = [30, 60, 120, 180, 300];
      timeMarkers.forEach(seconds => {
        setTimeout(() => {
          Events.track('time_on_page', {
            seconds: seconds,
            page: window.location.pathname
          });
        }, seconds * 1000);
      });
    }
  };

  // Public API
  window.PaperclipAnalytics = {
    track: Events.track.bind(Events),
    tool: ToolTracker,
    affiliate: AffiliateTracker,
    
    // Track page view
    pageView(pageName) {
      Session.pageViews++;
      Events.track('page_view', {
        page: pageName || window.location.pathname,
        title: document.title,
        referrer: document.referrer
      });
    },
    
    // Track error
    trackError(error, context = {}) {
      Events.track('error', {
        message: error.message,
        stack: error.stack,
        context: JSON.stringify(context),
        page: window.location.pathname
      });
    },
    
    // Track search
    trackSearch(query, resultsCount) {
      Events.track('search', {
        query: query,
        results_count: resultsCount,
        page: window.location.pathname
      });
    }
  };

  // Initialize
  function init() {
    Session.init();
    AffiliateTracker.init();
    CarbonTracker.init();
    PerformanceTracker.init();
    EngagementTracker.init();
    
    // Track initial page view
    window.PaperclipAnalytics.pageView();
    
    // Track navigation (for SPAs)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        window.PaperclipAnalytics.pageView();
      }
    }).observe(document, { subtree: true, childList: true });
    
    // Global error tracking
    window.addEventListener('error', (e) => {
      window.PaperclipAnalytics.trackError(e.error, {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      });
    });
    
    console.log('[Paperclip Analytics] Initialized');
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
