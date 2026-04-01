// Email Capture & Lead Nurture System
// Handles email capture from all tools and content

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        // Using Mailchimp API - replace with your credentials
        mailchimpApiKey: null, // Set via environment or config
        audienceId: null, // Your Mailchimp audience/list ID
        serverPrefix: null, // e.g., 'us1', 'us2', etc.
        
        // Local fallback for development
        useLocalStorage: true,
        
        // Lead scoring thresholds
        leadScoreThresholds: {
            cold: 0,
            warm: 10,
            hot: 25
        },
        
        // Events that add to lead score
        scoreEvents: {
            emailCapture: 5,
            toolUsage: 2,
            contentRead: 1,
            downloadLeadMagnet: 10,
            pricingPageView: 15,
            returnVisit: 3
        }
    };

    // Storage keys
    const STORAGE = {
        subscribers: 'paperclip_subscribers',
        leadScores: 'paperclip_lead_scores',
        emailEvents: 'paperclip_email_events',
        sequences: 'paperclip_email_sequences',
        analytics: 'paperclip_email_analytics'
    };

    // EmailCapture class
    class EmailCapture {
        constructor() {
            this.subscribers = this.loadSubscribers();
            this.leadScores = this.loadLeadScores();
            this.analytics = this.loadAnalytics();
        }

        // Load data from localStorage
        loadSubscribers() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE.subscribers)) || {};
            } catch {
                return {};
            }
        }

        loadLeadScores() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE.leadScores)) || {};
            } catch {
                return {};
            }
        }

        loadAnalytics() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE.analytics)) || {
                    totalCaptures: 0,
                    sequencesSent: 0,
                    opens: 0,
                    clicks: 0,
                    bySource: {}
                };
            } catch {
                return {
                    totalCaptures: 0,
                    sequencesSent: 0,
                    opens: 0,
                    clicks: 0,
                    bySource: {}
                };
            }
        }

        // Save data
        saveSubscribers() {
            localStorage.setItem(STORAGE.subscribers, JSON.stringify(this.subscribers));
        }

        saveLeadScores() {
            localStorage.setItem(STORAGE.leadScores, JSON.stringify(this.leadScores));
        }

        saveAnalytics() {
            localStorage.setItem(STORAGE.analytics, JSON.stringify(this.analytics));
        }

        // Capture email
        async captureEmail(email, options = {}) {
            const {
                source = 'website',
                tags = [],
                leadMagnet = null,
                metadata = {}
            } = options;

            // Validate email
            if (!this.isValidEmail(email)) {
                return { success: false, error: 'Invalid email address' };
            }

            // Check if already subscribed
            if (this.subscribers[email]) {
                // Update tags and source
                this.subscribers[email].tags = [...new Set([
                    ...this.subscribers[email].tags,
                    ...tags
                ])];
                this.subscribers[email].lastInteraction = new Date().toISOString();
                this.subscribers[email].interactions.push({
                    type: 're-subscribe',
                    source,
                    timestamp: new Date().toISOString()
                });
                this.saveSubscribers();
                
                return { 
                    success: true, 
                    message: 'Welcome back! Your preferences have been updated.',
                    isReturning: true
                };
            }

            // Create new subscriber
            const subscriber = {
                email,
                source,
                tags,
                leadMagnet,
                subscribedAt: new Date().toISOString(),
                status: 'active',
                welcomeSequenceStatus: 'pending',
                interactions: [{
                    type: 'subscription',
                    source,
                    timestamp: new Date().toISOString()
                }],
                metadata
            };

            this.subscribers[email] = subscriber;
            
            // Initialize lead score
            this.leadScores[email] = {
                score: CONFIG.scoreEvents.emailCapture,
                tier: 'cold',
                history: [{
                    event: 'email_capture',
                    points: CONFIG.scoreEvents.emailCapture,
                    timestamp: new Date().toISOString()
                }]
            };

            // Update analytics
            this.analytics.totalCaptures++;
            this.analytics.bySource[source] = (this.analytics.bySource[source] || 0) + 1;

            // Save
            this.saveSubscribers();
            this.saveLeadScores();
            this.saveAnalytics();

            // Trigger welcome sequence
            this.triggerWelcomeSequence(email);

            // Send to Mailchimp if configured
            if (CONFIG.mailchimpApiKey) {
                await this.syncToMailchimp(email, subscriber);
            }

            // Track GA4 event
            this.trackEvent('email_signup', {
                source,
                has_lead_magnet: !!leadMagnet
            });

            return { 
                success: true, 
                message: 'Welcome to Paperclip! Check your inbox for your welcome gift.',
                isReturning: false
            };
        }

        // Trigger welcome sequence
        async triggerWelcomeSequence(email) {
            const sequence = this.getWelcomeSequence();
            
            // Simulate sending emails (in production, this would use an ESP API)
            for (let i = 0; i < sequence.length; i++) {
                const emailData = sequence[i];
                const sendTime = new Date();
                sendTime.setDate(sendTime.getDate() + emailData.delay);
                
                // Store scheduled email
                if (!this.subscribers[email].scheduledEmails) {
                    this.subscribers[email].scheduledEmails = [];
                }
                
                this.subscribers[email].scheduledEmails.push({
                    ...emailData,
                    scheduledFor: sendTime.toISOString(),
                    status: 'scheduled'
                });
            }

            this.subscribers[email].welcomeSequenceStatus = 'active';
            this.saveSubscribers();
            
            // Log analytics
            this.analytics.sequencesSent += sequence.length;
            this.saveAnalytics();
        }

        // Get welcome sequence emails
        getWelcomeSequence() {
            return [
                {
                    id: 'welcome_1',
                    subject: 'Welcome to Paperclip - Here\'s your toolkit 🎁',
                    delay: 0, // Send immediately
                    template: 'welcome_1',
                    leadMagnet: 'developer-toolkit-checklist'
                },
                {
                    id: 'welcome_2',
                    subject: 'The #1 mistake developers make with their tools',
                    delay: 1, // Day 1
                    template: 'welcome_2',
                    content: 'value_education'
                },
                {
                    id: 'welcome_3',
                    subject: 'Your exclusive tools are waiting...',
                    delay: 3, // Day 3
                    template: 'welcome_3',
                    content: 'product_focus'
                }
            ];
        }

        // Track lead score
        trackLeadScore(email, event, points = null) {
            if (!this.leadScores[email]) return;

            const eventPoints = points || CONFIG.scoreEvents[event] || 1;
            
            this.leadScores[email].score += eventPoints;
            this.leadScores[email].history.push({
                event,
                points: eventPoints,
                timestamp: new Date().toISOString()
            });

            // Update tier
            const score = this.leadScores[email].score;
            if (score >= CONFIG.leadScoreThresholds.hot) {
                this.leadScores[email].tier = 'hot';
            } else if (score >= CONFIG.leadScoreThresholds.warm) {
                this.leadScores[email].tier = 'warm';
            }

            this.saveLeadScores();
        }

        // Sync to Mailchimp
        async syncToMailchimp(email, subscriber) {
            try {
                const url = `https://${CONFIG.serverPrefix}.api.mailchimp.com/3.0/lists/${CONFIG.audienceId}/members`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${CONFIG.mailchimpApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email_address: email,
                        status: 'subscribed',
                        merge_fields: {
                            SOURCE: subscriber.source,
                            TAGS: subscriber.tags.join(', ')
                        },
                        tags: subscriber.tags.map(tag => ({ name: tag, status: 'active' }))
                    })
                });

                if (!response.ok) {
                    console.error('Mailchimp sync failed:', await response.text());
                }
            } catch (error) {
                console.error('Mailchimp sync error:', error);
            }
        }

        // Track GA4 event
        trackEvent(eventName, params = {}) {
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    ...params,
                    event_category: 'email_marketing',
                    event_label: 'lead_capture'
                });
            }
            
            // Also track to local analytics
            this.analytics.events = this.analytics.events || [];
            this.analytics.events.push({
                event: eventName,
                params,
                timestamp: new Date().toISOString()
            });
            this.saveAnalytics();
        }

        // Validate email
        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        // Get subscriber stats
        getStats() {
            const subscribers = Object.values(this.subscribers);
            return {
                total: subscribers.length,
                active: subscribers.filter(s => s.status === 'active').length,
                bySource: this.analytics.bySource,
                averageScore: subscribers.reduce((sum, s) => 
                    sum + (this.leadScores[s.email]?.score || 0), 0) / Math.max(subscribers.length, 1),
                tierBreakdown: {
                    cold: subscribers.filter(s => this.leadScores[s.email]?.tier === 'cold').length,
                    warm: subscribers.filter(s => this.leadScores[s.email]?.tier === 'warm').length,
                    hot: subscribers.filter(s => this.leadScores[s.email]?.tier === 'hot').length
                }
            };
        }

        // Export subscribers (for backup/transfer)
        exportSubscribers() {
            return {
                subscribers: this.subscribers,
                leadScores: this.leadScores,
                analytics: this.analytics,
                exportedAt: new Date().toISOString()
            };
        }

        // Import subscribers (from backup)
        importSubscribers(data) {
            if (data.subscribers) {
                this.subscribers = { ...this.subscribers, ...data.subscribers };
                this.saveSubscribers();
            }
            if (data.leadScores) {
                this.leadScores = { ...this.leadScores, ...data.leadScores };
                this.saveLeadScores();
            }
            if (data.analytics) {
                this.analytics = { ...this.analytics, ...data.analytics };
                this.saveAnalytics();
            }
        }
    }

    // Create global instance
    window.EmailCapture = new EmailCapture();

    // Helper function for easy capture
    window.captureEmail = async function(email, options) {
        return window.EmailCapture.captureEmail(email, options);
    };

    // Helper to track events
    window.trackLeadEvent = function(email, event, points) {
        window.EmailCapture.trackLeadScore(email, event, points);
    };

    // Helper to get stats
    window.getEmailStats = function() {
        return window.EmailCapture.getStats();
    };

    console.log('✉️ Email Capture System loaded');
})();
