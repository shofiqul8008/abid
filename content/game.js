
// DOM Ready check
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded - initializing scripts');
    
    // Get all DOM elements
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const overlay = document.getElementById('overlay');
    const scrollToTop = document.getElementById('scrollToTop');
    const themeToggle = document.getElementById('themeToggle');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const body = document.body;
    
    // Debug logging
    console.log('Elements found:', {
        menuToggle: menuToggle ? 'Yes' : 'No',
        mobileNav: mobileNav ? 'Yes' : 'No',
        overlay: overlay ? 'Yes' : 'No',
        scrollToTop: scrollToTop ? 'Yes' : 'No',
        themeToggle: themeToggle ? 'Yes' : 'No',
        mobileThemeToggle: mobileThemeToggle ? 'Yes' : 'No'
    });
    
    // ========== MOBILE MENU FUNCTIONALITY ==========
    if (menuToggle && mobileNav && overlay) {
        console.log('Mobile menu elements found, adding event listeners');
        
        // Toggle mobile menu
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Menu toggle clicked - current state:', this.classList.contains('active'));
            
            const isActive = this.classList.contains('active');
            
            if (!isActive) {
                // Open menu
                this.classList.add('active');
                mobileNav.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                console.log('Menu opened');
            } else {
                // Close menu
                this.classList.remove('active');
                mobileNav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
                console.log('Menu closed');
            }
        });
        
        // Close mobile menu when clicking on overlay
        overlay.addEventListener('click', function() {
            console.log('Overlay clicked, closing menu');
            menuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            this.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Close mobile menu when clicking on a link
        const mobileLinks = document.querySelectorAll('.mobile-nav a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Don't prevent default for external links
                if (this.getAttribute('href') === 'https://shofiqul8008.github.io/profile/') {
                    e.preventDefault();
                    // Add a small delay before navigation
                    setTimeout(() => {
                        window.location.href = 'https://shofiqul8008.github.io/profile/';
                    }, 300);
                }
                
                console.log('Mobile link clicked, closing menu');
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when pressing ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                console.log('ESC pressed, closing menu');
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (mobileNav.classList.contains('active') && 
                !mobileNav.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                console.log('Clicked outside, closing menu');
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    } else {
        console.error('Some mobile menu elements are missing:');
        if (!menuToggle) console.error('menuToggle not found');
        if (!mobileNav) console.error('mobileNav not found');
        if (!overlay) console.error('overlay not found');
    }
    
    // ========== SCROLL TO TOP FUNCTIONALITY ==========
    if (scrollToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTop.classList.add('visible');
            } else {
                scrollToTop.classList.remove('visible');
            }
        });
        
        scrollToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ========== THEME TOGGLE FUNCTIONALITY ==========
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme');
    const currentTheme = savedTheme || 'dark';
    
    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'light');
        console.log('Theme set to: light');
    } else {
        body.setAttribute('data-theme', 'dark');
        console.log('Theme set to: dark');
    }
    
    // Theme toggle function
    function toggleTheme() {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        console.log('Toggling theme from', currentTheme, 'to', newTheme);
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    // Add event listeners to theme toggles
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', function() {
            toggleTheme();
            // Optional: Close mobile menu after changing theme
            if (menuToggle && mobileNav && overlay) {
                menuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // ========== ENABLE USER INTERACTIONS ==========
    // Enable text selection
    document.body.style.userSelect = 'text';
    document.body.style.webkitUserSelect = 'text';
    document.body.style.mozUserSelect = 'text';
    document.body.style.msUserSelect = 'text';
    
    console.log('All scripts initialized successfully');
});














// just fasync function 

// Just function 

/**
 * Telegram Website Visitor Notifier
 * Version: 1.0.0
 * Description: Sends visitor notifications to Telegram when added to any website
 * Author: Secure Notifications System
 * 
 *使用方法:将此文件包含在任何网站的HTML中：
 * <script src="telegram-notifier.js"></script>
 */

(function() {
    'use strict';

    // Telegram credentials with advanced obfuscation
    const TelegramNotifier = (function() {
        // Multi-layer obfuscation for credentials
        const credentials = {
            getToken: function() {
                // Layer 1: String parts
                const parts = [
                    '8534964539',
                    ':AA',
                    String.fromCharCode(69, 89, 114, 115), // EYrs
                    'NIF1GdgQS',
                    'qVMM9_Y_uOuZm_9q',
                    'Pt6c'
                ];
                return parts.join('');
            },
            getChatId: function() {
                // Layer 2: Base64 encoded with transformation
                const base64 = 'Nzk4NDcyMjQ0NA=='; // 7984722444 in base64
                const decoded = atob(base64);
                return decoded;
            }
        };

        // Visitor information collector
        const VisitorInfo = {
            collect: function() {
                return {
                    timestamp: new Date().toISOString(),
                    timeLocal: new Date().toLocaleString(),
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    screenWidth: screen.width,
                    screenHeight: screen.height,
                    screen: `${screen.width}×${screen.height}`,
                    language: navigator.language,
                    languages: navigator.languages,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    referrer: document.referrer || 'Direct visit',
                    pageUrl: window.location.href,
                    pageTitle: document.title,
                    hostname: window.location.hostname,
                    protocol: window.location.protocol,
                    cookieEnabled: navigator.cookieEnabled,
                    online: navigator.onLine,
                    doNotTrack: navigator.doNotTrack,
                    deviceMemory: navigator.deviceMemory || 'Unknown',
                    hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown'
                };
            },

            formatForTelegram: function(info) {
                // Create formatted message for Telegram
                const notificationId = Date.now();

                return `❗️New Website Visitor Alert!
                
⏰ Time: ${info.timeLocal}
🌐 Page: ${info.pageUrl}
🏠 Host: ${info.hostname}
                
📱 Device Info:
• Platform: ${info.platform}
• Screen: ${info.screen}
• Language: ${info.language}
• Timezone: ${info.timezone}
• Online: ${info.online ? 'Yes' : 'No'}
• Device Memory: ${info.deviceMemory}GB
• CPU Cores: ${info.hardwareConcurrency}
                
🔗 Referrer: ${info.referrer}
                
👤 User Agent:
${info.userAgent.substring(0, 200)}${info.userAgent.length > 200 ? '...' : ''}
                
📊 Notification ID: ${notificationId}`;
            }
        };

        // Notification sender with retry logic
        const NotificationSender = {
            send: async function(message, retries = 3) {
                const token = credentials.getToken();
                const chatId = credentials.getChatId();

                for (let i = 0; i < retries; i++) {
                    try {
                        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                chat_id: chatId,
                                text: message,
                                parse_mode: 'Markdown',
                                disable_notification: false,
                                disable_web_page_preview: true
                            })
                        });

                        const data = await response.json();

                        if (data.ok) {
                            console.log('[Telegram Notifier] ✅ Notification sent successfully');
                            return { success: true, messageId: data.result.message_id };
                        } else {
                            console.warn('[Telegram Notifier] ⚠️ Telegram API error:', data.description);

                            // Retry with delay
                            if (i < retries - 1) {
                                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                                continue;
                            }
                            return { success: false, error: data.description };
                        }
                    } catch (error) {
                        console.error('[Telegram Notifier] ❌ Network error:', error);

                        if (i < retries - 1) {
                            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                            continue;
                        }
                        return { success: false, error: error.message };
                    }
                }
            },

            sendWithFallback: async function(message) {
                // Try sending immediately
                const result = await this.send(message);

                if (!result.success) {
                    // Store in localStorage for later retry
                    this.storeForRetry(message);
                }

                return result;
            },

            storeForRetry: function(message) {
                try {
                    const failedNotifications = JSON.parse(
                        localStorage.getItem('telegram_failed_notifications') || '[]'
                    );

                    failedNotifications.push({
                        message: message,
                        timestamp: new Date().toISOString(),
                        retryCount: 0
                    });

                    // Keep only last 10 failed notifications
                    if (failedNotifications.length > 10) {
                        failedNotifications.shift();
                    }

                    localStorage.setItem(
                        'telegram_failed_notifications',
                        JSON.stringify(failedNotifications)
                    );

                    console.log('[Telegram Notifier] 📦 Notification stored for retry');
                } catch (e) {
                    console.error('[Telegram Notifier] ❌ Failed to store notification:', e);
                }
            },

            retryFailed: async function() {
                try {
                    const failedNotifications = JSON.parse(
                        localStorage.getItem('telegram_failed_notifications') || '[]'
                    );

                    if (failedNotifications.length === 0) return;

                    console.log(`[Telegram Notifier] 🔄 Retrying ${failedNotifications.length} failed notifications`);

                    const successfulRetries = [];

                    for (let i = 0; i < failedNotifications.length; i++) {
                        const notification = failedNotifications[i];

                        if (notification.retryCount >= 3) {
                            continue; // Max retries reached
                        }

                        const result = await this.send(notification.message);

                        if (result.success) {
                            successfulRetries.push(i);
                        } else {
                            // Update retry count
                            failedNotifications[i].retryCount++;
                        }

                        // Delay between retries
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }

                    // Remove successful retries
                    if (successfulRetries.length > 0) {
                        const updatedNotifications = failedNotifications.filter(
                            (_, index) => !successfulRetries.includes(index)
                        );

                        localStorage.setItem(
                            'telegram_failed_notifications',
                            JSON.stringify(updatedNotifications)
                        );

                        console.log(`[Telegram Notifier] ✅ ${successfulRetries.length} notifications retried successfully`);
                    }
                } catch (e) {
                    console.error('[Telegram Notifier] ❌ Error during retry:', e);
                }
            }
        };

        // Session management
        const SessionManager = {
            sessionId: null,
            visitorId: null,

            init: function() {
                // Generate or retrieve session ID
                this.sessionId = this.getOrCreateSessionId();
                this.visitorId = this.getOrCreateVisitorId();

                // Track page views
                this.trackPageView();
            },

            getOrCreateSessionId: function() {
                let sessionId = sessionStorage.getItem('telegram_notifier_session_id');

                if (!sessionId) {
                    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    sessionStorage.setItem('telegram_notifier_session_id', sessionId);
                }

                return sessionId;
            },

            getOrCreateVisitorId: function() {
                let visitorId = localStorage.getItem('telegram_notifier_visitor_id');

                if (!visitorId) {
                    visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
                    localStorage.setItem('telegram_notifier_visitor_id', visitorId);
                }

                return visitorId;
            },

            trackPageView: function() {
                const pageViews = parseInt(localStorage.getItem('telegram_notifier_page_views') || '0');
                localStorage.setItem('telegram_notifier_page_views', (pageViews + 1).toString());

                // Update session page views
                const sessionViews = parseInt(sessionStorage.getItem('session_page_views') || '0');
                sessionStorage.setItem('session_page_views', (sessionViews + 1).toString());
            },

            getStats: function() {
                return {
                    sessionId: this.sessionId,
                    visitorId: this.visitorId,
                    totalPageViews: localStorage.getItem('telegram_notifier_page_views') || '0',
                    sessionPageViews: sessionStorage.getItem('session_page_views') || '0',
                    firstVisit: localStorage.getItem('telegram_notifier_first_visit') || new Date().toISOString()
                };
            }
        };

        // Main notifier class
        return {
            init: function(options = {}) {
                const config = {
                    sendOnLoad: options.sendOnLoad !== false,
                    retryFailed: options.retryFailed !== false,
                    debug: options.debug || false,
                    customMessage: options.customMessage
                };

                // Initialize session
                SessionManager.init();

                // Add debug logging if enabled
                if (config.debug) {
                    console.log('[Telegram Notifier] Initialized with config:', config);
                    console.log('[Telegram Notifier] Session:', SessionManager.getStats());
                }

                // Send notification on page load
                if (config.sendOnLoad) {
                    setTimeout(() => {
                        this.sendNotification(config.customMessage);
                    }, options.delay || 1000);
                }

                // Retry failed notifications
                if (config.retryFailed) {
                    setTimeout(() => {
                        NotificationSender.retryFailed();
                    }, 5000);
                }

                // Listen for page visibility changes (send notification when page becomes visible)
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible' && config.sendOnLoad) {
                        this.sendNotification(config.customMessage, true);
                    }
                });
            },

            sendNotification: async function(customMessage = null, isVisibilityChange = false) {
                try {
                    // Collect visitor information
                    const visitorInfo = VisitorInfo.collect();

                    // Create message
                    let message;
                    if (customMessage) {
                        message = customMessage;
                    } else {
                        // Add session info to visitor info
                        const sessionStats = SessionManager.getStats();
                        visitorInfo.sessionId = sessionStats.sessionId;
                        visitorInfo.visitorId = sessionStats.visitorId;
                        visitorInfo.isReturning = sessionStats.totalPageViews > 1;

                        message = VisitorInfo.formatForTelegram(visitorInfo);
                    }

                    // Send notification
                    const result = await NotificationSender.sendWithFallback(message);

                    // Dispatch custom event
                    const event = new CustomEvent('telegramNotificationSent', {
                        detail: {
                            success: result.success,
                            messageId: result.messageId,
                            error: result.error,
                            isVisibilityChange: isVisibilityChange,
                            timestamp: new Date().toISOString()
                        }
                    });
                    document.dispatchEvent(event);

                    return result;
                } catch (error) {
                    console.error('[Telegram Notifier] ❌ Error sending notification:', error);

                    // Dispatch error event
                    const event = new CustomEvent('telegramNotificationError', {
                        detail: {
                            error: error.message,
                            timestamp: new Date().toISOString()
                        }
                    });
                    document.dispatchEvent(event);

                    return { success: false, error: error.message };
                }
            },

            sendCustomMessage: async function(text) {
                return await NotificationSender.sendWithFallback(text);
            },

            getVisitorInfo: function() {
                return VisitorInfo.collect();
            },

            getSessionInfo: function() {
                return SessionManager.getStats();
            },

            clearStorage: function() {
                try {
                    localStorage.removeItem('telegram_failed_notifications');
                    localStorage.removeItem('telegram_notifier_page_views');
                    localStorage.removeItem('telegram_notifier_visitor_id');
                    localStorage.removeItem('telegram_notifier_first_visit');

                    sessionStorage.removeItem('telegram_notifier_session_id');
                    sessionStorage.removeItem('session_page_views');

                    console.log('[Telegram Notifier] 🗑️ Storage cleared');
                    return true;
                } catch (e) {
                    console.error('[Telegram Notifier] ❌ Error clearing storage:', e);
                    return false;
                }
            },

            // Configuration methods
            configure: function(options) {
                this.init(options);
            }
        };
    })();

    // Expose to window object
    window.TelegramNotifier = TelegramNotifier;

    // Auto-initialize with default options if script is loaded without manual initialization
    if (!window.TelegramNotifierConfig || window.TelegramNotifierConfig.autoInit !== false) {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                TelegramNotifier.init(window.TelegramNotifierConfig || {});
            }, 100);
        });
    }

    // Add security protections
    (function() {
        // Basic anti-tampering
        Object.freeze(TelegramNotifier);

        // Add console warnings
        console.log('%c🔐 Telegram Notifier v1.0.0', 'color: #3498db; font-weight: bold; font-size: 14px;');
        console.log('%cSecure visitor notification system loaded', 'color: #2ecc71;');

        // Prevent multiple initializations
        let initialized = false;
        const originalInit = TelegramNotifier.init;
        TelegramNotifier.init = function(options) {
            if (initialized && !options.force) {
                console.warn('[Telegram Notifier] Already initialized. Use force: true to reinitialize.');
                return;
            }
            initialized = true;
            return originalInit.call(this, options);
        };
    })();
})();