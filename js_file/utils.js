/*
 * Version: 2.1.0
 * Description: Sends visitor notifications with IP address to Telegram
 * Author: shofiqul
 */

(function() {
    'use strict';
    
    // Check if TelegramNotifier already exists to prevent duplicate loading
    if (window.TelegramNotifier) {
        console.warn('[Telegram Notifier] Already loaded. Skipping duplicate initialization.');
        return;
    }

    // Safe Storage Utility with fallback for when localStorage is blocked
    const SafeStorage = {
        isAvailable: function() {
            try {
                const test = '__storage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        getItem: function(key, defaultValue = null) {
            try {
                const value = localStorage.getItem(key);
                return value !== null ? value : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        },
        
        setItem: function(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        removeItem: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        // In-memory fallback storage for when localStorage is blocked
        memoryStorage: {},
        
        getItemMemory: function(key, defaultValue = null) {
            return this.memoryStorage[key] !== undefined ? this.memoryStorage[key] : defaultValue;
        },
        
        setItemMemory: function(key, value) {
            this.memoryStorage[key] = value;
            return true;
        },
        
        removeItemMemory: function(key) {
            delete this.memoryStorage[key];
            return true;
        },
        
        // Combined methods that try localStorage first, then fallback to memory
        get: function(key, defaultValue = null) {
            if (this.isAvailable()) {
                return this.getItem(key, defaultValue);
            } else {
                return this.getItemMemory(key, defaultValue);
            }
        },
        
        set: function(key, value) {
            if (this.isAvailable()) {
                return this.setItem(key, value);
            } else {
                return this.setItemMemory(key, value);
            }
        },
        
        remove: function(key) {
            if (this.isAvailable()) {
                return this.removeItem(key);
            } else {
                return this.removeItemMemory(key);
            }
        },
        
        clear: function() {
            try {
                if (this.isAvailable()) {
                    localStorage.removeItem('telegram_failed_notifications');
                    localStorage.removeItem('telegram_notifier_page_views');
                    localStorage.removeItem('telegram_notifier_visitor_id');
                    localStorage.removeItem('telegram_notifier_first_visit');
                    localStorage.removeItem('telegram_notifier_ip_address');
                }
                
                // Always clear memory storage
                this.memoryStorage = {};
                
                return true;
            } catch (e) {
                return false;
            }
        }
    };
    
    // Safe Session Storage Utility
    const SafeSessionStorage = {
        isAvailable: function() {
            try {
                const test = '__session_storage_test__';
                sessionStorage.setItem(test, test);
                sessionStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        get: function(key, defaultValue = null) {
            try {
                const value = sessionStorage.getItem(key);
                return value !== null ? value : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        },
        
        set: function(key, value) {
            try {
                sessionStorage.setItem(key, value);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        remove: function(key) {
            try {
                sessionStorage.removeItem(key);
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    // IP Address Detection Service
    const IPDetector = {
        // Multiple IP detection services for redundancy
        ipServices: [
            'https://api.ipify.org?format=json',
            'https://api64.ipify.org?format=json',
            'https://ipinfo.io/json',
            'https://ipapi.co/json/',
            'https://geolocation-db.com/json/'
        ],
        
        // Cached IP to avoid multiple requests
        cachedIP: null,
        
        // Get IP address with multiple fallback methods
        getIPAddress: async function() {
            // Return cached IP if available
            if (this.cachedIP) {
                return this.cachedIP;
            }
            
            // Try to get from localStorage first
            try {
                const savedIP = SafeStorage.get('telegram_notifier_ip_address');
                if (savedIP && savedIP !== 'unknown') {
                    this.cachedIP = savedIP;
                    return savedIP;
                }
            } catch (e) {
                // Ignore storage errors
            }
            
            let ipAddress = 'unknown';
            
            // Method 1: Try WebRTC (for local IP in some browsers)
            const localIP = await this.getLocalIP();
            if (localIP && localIP !== 'unknown') {
                ipAddress = `Local: ${localIP}`;
                this.cachedIP = ipAddress;
                this.saveIP(ipAddress);
                return ipAddress;
            }
            
            // Method 2: Try multiple public IP services
            for (const service of this.ipServices) {
                try {
                    const response = await fetch(service, {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/json'
                        },
                        timeout: 5000
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        if (service.includes('ipify')) {
                            ipAddress = data.ip || 'unknown';
                        } else if (service.includes('ipinfo')) {
                            ipAddress = data.ip || 'unknown';
                        } else if (service.includes('ipapi')) {
                            ipAddress = data.ip || 'unknown';
                        } else if (service.includes('geolocation-db')) {
                            ipAddress = data.IPv4 || 'unknown';
                        }
                        
                        if (ipAddress !== 'unknown') {
                            this.cachedIP = ipAddress;
                            this.saveIP(ipAddress);
                            
                            // Also get location info if available
                            const locationInfo = await this.getLocationInfo(data);
                            if (locationInfo) {
                                ipAddress += ` (${locationInfo})`;
                            }
                            
                            return ipAddress;
                        }
                    }
                } catch (error) {
                    console.log(`[IP Detector] Service ${service} failed:`, error.message);
                    continue;
                }
            }
            
            // Method 3: Fallback to using iframe method
            const iframeIP = await this.getIPViaIframe();
            if (iframeIP && iframeIP !== 'unknown') {
                ipAddress = iframeIP;
                this.cachedIP = ipAddress;
                this.saveIP(ipAddress);
                return ipAddress;
            }
            
            // Method 4: Try DNS leak test method
            const dnsIP = await this.getIPViaDNS();
            if (dnsIP && dnsIP !== 'unknown') {
                ipAddress = dnsIP;
                this.cachedIP = ipAddress;
                this.saveIP(ipAddress);
                return ipAddress;
            }
            
            // Save the result (even if unknown)
            this.cachedIP = ipAddress;
            this.saveIP(ipAddress);
            
            return ipAddress;
        },
        
        // Try to get local IP via WebRTC
        getLocalIP: function() {
            return new Promise((resolve) => {
                if (!window.RTCPeerConnection) {
                    resolve('unknown');
                    return;
                }
                
                const pc = new RTCPeerConnection({ iceServers: [] });
                const ips = [];
                
                pc.createDataChannel('');
                pc.createOffer()
                    .then(offer => pc.setLocalDescription(offer))
                    .catch(() => resolve('unknown'));
                
                pc.onicecandidate = (event) => {
                    if (!event || !event.candidate) {
                        if (ips.length > 0) {
                            resolve(ips[0]);
                        } else {
                            resolve('unknown');
                        }
                        return;
                    }
                    
                    const candidate = event.candidate.candidate;
                    const regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                    const match = candidate.match(regex);
                    
                    if (match) {
                        const ip = match[1];
                        if (ips.indexOf(ip) === -1) {
                            ips.push(ip);
                        }
                    }
                };
                
                // Timeout after 3 seconds
                setTimeout(() => {
                    if (ips.length > 0) {
                        resolve(ips[0]);
                    } else {
                        resolve('unknown');
                    }
                }, 3000);
            });
        },
        
        // Get IP via iframe method (old school)
        getIPViaIframe: function() {
            return new Promise((resolve) => {
                try {
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.srcdoc = `
                        <script>
                            window.addEventListener('message', function(e) {
                                if (e.data === 'getIP') {
                                    window.parent.postMessage({
                                        type: 'ipResponse',
                                        ip: 'unknown'
                                    }, '*');
                                }
                            });
                        </script>
                    `;
                    
                    document.body.appendChild(iframe);
                    
                    window.addEventListener('message', function handler(e) {
                        if (e.data.type === 'ipResponse') {
                            document.body.removeChild(iframe);
                            window.removeEventListener('message', handler);
                            resolve(e.data.ip);
                        }
                    });
                    
                    iframe.contentWindow.postMessage('getIP', '*');
                    
                    setTimeout(() => {
                        if (document.body.contains(iframe)) {
                            document.body.removeChild(iframe);
                        }
                        resolve('unknown');
                    }, 3000);
                } catch (e) {
                    resolve('unknown');
                }
            });
        },
        
        // Try DNS leak method
        getIPViaDNS: function() {
            return new Promise((resolve) => {
                const img = new Image();
                img.style.display = 'none';
                
                img.onload = img.onerror = function() {
                    resolve('unknown');
                };
                
                // This URL triggers a DNS request that might leak IP
                img.src = `https://dnsleaktest.com/pixel.png?t=${Date.now()}`;
                
                setTimeout(() => {
                    resolve('unknown');
                }, 2000);
            });
        },
        
        // Extract location info from IP service response
        getLocationInfo: function(data) {
            try {
                const parts = [];
                
                if (data.city) parts.push(data.city);
                if (data.region) parts.push(data.region);
                if (data.country) parts.push(data.country);
                
                if (parts.length > 0) {
                    return parts.join(', ');
                }
                
                if (data.location) {
                    return data.location;
                }
                
                return null;
            } catch (e) {
                return null;
            }
        },
        
        // Save IP to storage
        saveIP: function(ip) {
            try {
                SafeStorage.set('telegram_notifier_ip_address', ip);
            } catch (e) {
                // Ignore storage errors
            }
        },
        
        // Get cached IP (no network request)
        getCachedIP: function() {
            if (this.cachedIP) {
                return this.cachedIP;
            }
            
            try {
                const savedIP = SafeStorage.get('telegram_notifier_ip_address', 'unknown');
                this.cachedIP = savedIP;
                return savedIP;
            } catch (e) {
                return 'unknown';
            }
        }
    };

    // Enhanced Device Detection with mobile-specific information
    const DeviceDetector = {
        getDeviceInfo: function() {
            const ua = navigator.userAgent || '';
            const platform = navigator.platform || '';
            
            return {
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
                isAndroid: /Android/i.test(ua),
                isIOS: /iPhone|iPad|iPod/i.test(ua),
                isWindowsPhone: /Windows Phone/i.test(ua),
                isTablet: /iPad|Android(?!.*Mobile)/i.test(ua),
                browser: this.getBrowserInfo(ua),
                os: this.getOSInfo(ua, platform),
                deviceModel: this.getDeviceModel(ua)
            };
        },
        
        getBrowserInfo: function(ua) {
            if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) return 'Chrome';
            if (/Firefox/i.test(ua)) return 'Firefox';
            if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
            if (/Edge/i.test(ua)) return 'Edge';
            if (/Opera|OPR/i.test(ua)) return 'Opera';
            if (/MSIE|Trident/i.test(ua)) return 'Internet Explorer';
            return 'Unknown';
        },
        
        getOSInfo: function(ua, platform) {
            if (/Android/i.test(ua)) {
                const androidVersion = ua.match(/Android\s([0-9\.]+)/);
                return `Android ${androidVersion ? androidVersion[1] : ''}`.trim();
            }
            if (/iOS|iPhone|iPad|iPod/i.test(ua)) {
                const iosVersion = ua.match(/OS\s([0-9_]+)/);
                return `iOS ${iosVersion ? iosVersion[1].replace(/_/g, '.') : ''}`.trim();
            }
            if (/Windows/i.test(ua)) {
                const windowsVersion = ua.match(/Windows NT\s([0-9\.]+)/);
                return `Windows ${windowsVersion ? windowsVersion[1] : ''}`.trim();
            }
            if (/Mac/i.test(platform)) return 'Mac OS';
            if (/Linux/i.test(platform)) return 'Linux';
            return platform || 'Unknown';
        },
        
        getDeviceModel: function(ua) {
            // Extract device model from user agent
            if (/Android/i.test(ua)) {
                const match = ua.match(/Android.*;\s([^;]+)\sBuild/i);
                if (match) return match[1].trim();
            }
            if (/iPhone/i.test(ua)) {
                const match = ua.match(/iPhone\s([^;]+);/i);
                if (match) return `iPhone ${match[1]}`;
            }
            if (/iPad/i.test(ua)) {
                const match = ua.match(/iPad\s([^;]+);/i);
                if (match) return `iPad ${match[1]}`;
            }
            if (/Windows Phone/i.test(ua)) {
                const match = ua.match(/Windows Phone.*;\s([^;]+)\)/i);
                if (match) return match[1].trim();
            }
            return 'Unknown Device';
        },
        
        getScreenInfo: function() {
            return {
                width: window.screen ? window.screen.width : 0,
                height: window.screen ? window.screen.height : 0,
                availWidth: window.screen ? window.screen.availWidth : 0,
                availHeight: window.screen ? window.screen.availHeight : 0,
                colorDepth: window.screen ? window.screen.colorDepth : 0,
                pixelDepth: window.screen ? window.screen.pixelDepth : 0,
                orientation: window.screen && window.screen.orientation ? 
                    window.screen.orientation.type : 'Unknown',
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio || 1
            };
        },
        
        getNetworkInfo: function() {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            return {
                online: navigator.onLine,
                type: connection ? connection.type || 'unknown' : 'unknown',
                downlink: connection ? connection.downlink || 'unknown' : 'unknown',
                rtt: connection ? connection.rtt || 'unknown' : 'unknown',
                effectiveType: connection ? connection.effectiveType || 'unknown' : 'unknown',
                saveData: connection ? connection.saveData || false : false
            };
        },
        
        getBatteryInfo: async function() {
            if (navigator.getBattery) {
                try {
                    const battery = await navigator.getBattery();
                    return {
                        charging: battery.charging,
                        level: Math.round(battery.level * 100) + '%',
                        chargingTime: battery.chargingTime,
                        dischargingTime: battery.dischargingTime
                    };
                } catch (e) {
                    return { error: 'Battery API not accessible' };
                }
            }
            return { error: 'Battery API not supported' };
        }
    };

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
                try {
                    const decoded = atob(base64);
                    return decoded;
                } catch (e) {
                    return '7984722444'; // Fallback
                }
            }
        };

        // Enhanced Visitor information collector with IP detection
        const VisitorInfo = {
            collect: async function() {
                try {
                    const deviceInfo = DeviceDetector.getDeviceInfo();
                    const screenInfo = DeviceDetector.getScreenInfo();
                    const networkInfo = DeviceDetector.getNetworkInfo();
                    const batteryInfo = await DeviceDetector.getBatteryInfo();
                    
                    // Get IP address (with timeout)
                    let ipAddress = 'Fetching...';
                    try {
                        ipAddress = await Promise.race([
                            IPDetector.getIPAddress(),
                            new Promise(resolve => setTimeout(() => resolve('Timeout'), 4000))
                        ]);
                    } catch (ipError) {
                        console.warn('[Telegram Notifier] IP detection failed:', ipError.message);
                        ipAddress = IPDetector.getCachedIP();
                    }
                    
                    // Get current time in a readable format
                    const now = new Date();
                    const timeLocal = now.toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });
                    
                    // Get page information
                    const pageUrl = window.location.href;
                    const pageTitle = document.title || 'No Title';
                    const hostname = window.location.hostname;
                    
                    // Get referrer information
                    let referrer = document.referrer || 'Direct visit';
                    if (referrer.includes('://')) {
                        try {
                            const url = new URL(referrer);
                            referrer = url.hostname;
                        } catch (e) {
                            // Keep original referrer if URL parsing fails
                        }
                    }
                    
                    // Get additional browser capabilities
                    const capabilities = {
                        cookies: navigator.cookieEnabled,
                        javascript: true,
                        localStorage: SafeStorage.isAvailable(),
                        sessionStorage: SafeSessionStorage.isAvailable(),
                        serviceWorker: 'serviceWorker' in navigator,
                        pushManager: 'PushManager' in window,
                        webgl: this.hasWebGL(),
                        webRTC: 'RTCPeerConnection' in window,
                        webSocket: 'WebSocket' in window,
                        webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
                        geolocation: 'geolocation' in navigator,
                        notifications: 'Notification' in window,
                        vibration: 'vibrate' in navigator
                    };
                    
                    return {
                        // Timestamps
                        timestamp: now.toISOString(),
                        timeLocal: timeLocal,
                        timezone: Intl ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Unknown',
                        
                        // IP Address
                        ipAddress: ipAddress,
                        
                        // Device information
                        deviceType: deviceInfo.isMobile ? 'Mobile' : (deviceInfo.isTablet ? 'Tablet' : 'Desktop'),
                        isMobile: deviceInfo.isMobile,
                        isAndroid: deviceInfo.isAndroid,
                        isIOS: deviceInfo.isIOS,
                        isTablet: deviceInfo.isTablet,
                        deviceModel: deviceInfo.deviceModel,
                        
                        // OS and Browser
                        platform: navigator.platform || 'Unknown',
                        os: deviceInfo.os,
                        browser: deviceInfo.browser,
                        userAgent: navigator.userAgent || 'Unknown',
                        languages: navigator.languages ? Array.from(navigator.languages) : ['Unknown'],
                        language: navigator.language || 'Unknown',
                        
                        // Screen information
                        screenWidth: screenInfo.width,
                        screenHeight: screenInfo.height,
                        screen: `${screenInfo.width}×${screenInfo.height}`,
                        availScreen: `${screenInfo.availWidth}×${screenInfo.availHeight}`,
                        windowSize: `${screenInfo.innerWidth}×${screenInfo.innerHeight}`,
                        colorDepth: `${screenInfo.colorDepth}-bit`,
                        pixelRatio: screenInfo.devicePixelRatio,
                        orientation: screenInfo.orientation,
                        
                        // Network information
                        online: networkInfo.online,
                        connectionType: networkInfo.type,
                        connectionSpeed: networkInfo.effectiveType,
                        downlink: networkInfo.downlink,
                        rtt: networkInfo.rtt,
                        saveData: networkInfo.saveData,
                        
                        // Battery information
                        batteryCharging: batteryInfo.charging,
                        batteryLevel: batteryInfo.level,
                        
                        // Page information
                        pageUrl: pageUrl,
                        pageTitle: pageTitle,
                        hostname: hostname,
                        protocol: window.location.protocol,
                        referrer: referrer,
                        
                        // Browser capabilities
                        capabilities: capabilities,
                        
                        // Additional information
                        doNotTrack: navigator.doNotTrack || 'Unknown',
                        deviceMemory: navigator.deviceMemory || 'Unknown',
                        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
                        maxTouchPoints: navigator.maxTouchPoints || 0,
                        vendor: navigator.vendor || 'Unknown',
                        product: navigator.product || 'Unknown'
                    };
                } catch (error) {
                    console.error('[Telegram Notifier] Error collecting visitor info:', error);
                    return this.getBasicInfo();
                }
            },
            
            getBasicInfo: async function() {
                const now = new Date();
                let ipAddress = 'unknown';
                try {
                    ipAddress = IPDetector.getCachedIP();
                } catch (e) {
                    // Ignore IP errors in basic mode
                }
                
                return {
                    timestamp: now.toISOString(),
                    timeLocal: now.toLocaleString(),
                    ipAddress: ipAddress,
                    userAgent: navigator.userAgent || 'Unknown',
                    platform: navigator.platform || 'Unknown',
                    screenWidth: window.screen ? window.screen.width : 0,
                    screenHeight: window.screen ? window.screen.height : 0,
                    screen: window.screen ? `${window.screen.width}×${window.screen.height}` : 'Unknown',
                    language: navigator.language || 'Unknown',
                    timezone: Intl ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Unknown',
                    referrer: document.referrer || 'Direct visit',
                    pageUrl: window.location.href,
                    pageTitle: document.title || 'No Title',
                    hostname: window.location.hostname,
                    protocol: window.location.protocol,
                    online: navigator.onLine || false
                };
            },
            
            hasWebGL: function() {
                try {
                    const canvas = document.createElement('canvas');
                    return !!(window.WebGLRenderingContext && 
                        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
                } catch (e) {
                    return false;
                }
            },

            formatForTelegram: function(info) {
                // Create formatted message for Telegram
                const notificationId = Date.now();
                const userAgentShort = info.userAgent ? 
                    info.userAgent.substring(0, 180) + (info.userAgent.length > 180 ? '...' : '') : 
                    'Unknown';
                
                // Build device info string
                let deviceInfo = '';
                
                // Add IP address at the top
                deviceInfo += `• IP Address: ${info.ipAddress}\n`;
                
                if (info.deviceModel !== 'Unknown Device') {
                    deviceInfo += `• Device: ${info.deviceModel}\n`;
                }
                deviceInfo += `• Type: ${info.deviceType}\n`;
                if (info.isMobile) {
                    deviceInfo += `• Mobile: ${info.isAndroid ? 'Android' : (info.isIOS ? 'iOS' : 'Other')}\n`;
                }
                deviceInfo += `• Platform: ${info.platform}\n`;
                deviceInfo += `• OS: ${info.os}\n`;
                deviceInfo += `• Browser: ${info.browser}\n`;
                deviceInfo += `• Screen: ${info.screen}\n`;
                deviceInfo += `• Window: ${info.windowSize}\n`;
                deviceInfo += `• Language: ${info.language}\n`;
                deviceInfo += `• Timezone: ${info.timezone}\n`;
                deviceInfo += `• Pixel Ratio: ${info.pixelRatio}\n`;
                deviceInfo += `• Orientation: ${info.orientation}\n`;
                deviceInfo += `• Online: ${info.online ? 'Yes' : 'No'}\n`;
                
                // Add connection info if available
                if (info.connectionType && info.connectionType !== 'unknown') {
                    deviceInfo += `• Connection: ${info.connectionType} (${info.connectionSpeed})\n`;
                }
                
                // Add battery info if available
                if (info.batteryLevel && info.batteryLevel !== 'error') {
                    deviceInfo += `• Battery: ${info.batteryLevel} ${info.batteryCharging ? '(Charging)' : ''}\n`;
                }
                
                // Add network speed if available
                if (info.downlink && info.downlink !== 'unknown') {
                    deviceInfo += `• Network Speed: ${info.downlink} Mbps\n`;
                }
                
                return `❗️New Website Visitor Alert!
                
⏰ Time: ${info.timeLocal}
🌐 Page: ${info.pageUrl}
🏠 Host: ${info.hostname}
                
📱 Device & Network Info:
${deviceInfo}
🔗 Referrer: ${info.referrer}
                
👤 User Agent:
${userAgentShort}
                
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
                    // Store in storage for later retry (using SafeStorage)
                    this.storeForRetry(message);
                }

                return result;
            },

            storeForRetry: function(message) {
                try {
                    let failedNotifications = [];
                    
                    // Try to get existing notifications from storage
                    const stored = SafeStorage.get('telegram_failed_notifications', '[]');
                    if (stored) {
                        try {
                            failedNotifications = JSON.parse(stored);
                        } catch (e) {
                            failedNotifications = [];
                        }
                    }

                    failedNotifications.push({
                        message: message,
                        timestamp: new Date().toISOString(),
                        retryCount: 0
                    });

                    // Keep only last 10 failed notifications
                    if (failedNotifications.length > 10) {
                        failedNotifications.shift();
                    }

                    // Save back to storage
                    SafeStorage.set('telegram_failed_notifications', JSON.stringify(failedNotifications));

                    console.log('[Telegram Notifier] 📦 Notification stored for retry');
                } catch (e) {
                    console.error('[Telegram Notifier] ❌ Failed to store notification:', e);
                }
            },

            retryFailed: async function() {
                try {
                    let failedNotifications = [];
                    
                    // Get failed notifications from storage
                    const stored = SafeStorage.get('telegram_failed_notifications', '[]');
                    if (stored) {
                        try {
                            failedNotifications = JSON.parse(stored);
                        } catch (e) {
                            failedNotifications = [];
                        }
                    }

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

                        SafeStorage.set('telegram_failed_notifications', JSON.stringify(updatedNotifications));

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
                try {
                    let sessionId = SafeSessionStorage.get('telegram_notifier_session_id');
                    
                    if (!sessionId) {
                        sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                        SafeSessionStorage.set('telegram_notifier_session_id', sessionId);
                    }
                    
                    return sessionId;
                } catch (e) {
                    return 'sess_' + Date.now();
                }
            },

            getOrCreateVisitorId: function() {
                try {
                    let visitorId = SafeStorage.get('telegram_notifier_visitor_id');
                    
                    if (!visitorId) {
                        visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
                        SafeStorage.set('telegram_notifier_visitor_id', visitorId);
                    }
                    
                    return visitorId;
                } catch (e) {
                    return 'vis_' + Date.now();
                }
            },

            trackPageView: function() {
                try {
                    const pageViews = parseInt(SafeStorage.get('telegram_notifier_page_views', '0'));
                    SafeStorage.set('telegram_notifier_page_views', (pageViews + 1).toString());

                    // Update session page views
                    const sessionViews = parseInt(SafeSessionStorage.get('session_page_views', '0'));
                    SafeSessionStorage.set('session_page_views', (sessionViews + 1).toString());

                    // Store first visit timestamp
                    if (!SafeStorage.get('telegram_notifier_first_visit')) {
                        SafeStorage.set('telegram_notifier_first_visit', new Date().toISOString());
                    }
                } catch (e) {
                    // Silent error for storage
                }
            },

            getStats: function() {
                try {
                    return {
                        sessionId: this.sessionId,
                        visitorId: this.visitorId,
                        totalPageViews: SafeStorage.get('telegram_notifier_page_views', '0'),
                        sessionPageViews: SafeSessionStorage.get('session_page_views', '0'),
                        firstVisit: SafeStorage.get('telegram_notifier_first_visit', new Date().toISOString())
                    };
                } catch (e) {
                    return {
                        sessionId: this.sessionId,
                        visitorId: this.visitorId,
                        totalPageViews: '0',
                        sessionPageViews: '0',
                        firstVisit: new Date().toISOString()
                    };
                }
            }
        };

        // Main notifier class
        const notifier = {
            init: function(options = {}) {
                const config = {
                    sendOnLoad: options.sendOnLoad !== false,
                    retryFailed: options.retryFailed !== false,
                    debug: options.debug || false,
                    customMessage: options.customMessage,
                    delay: options.delay || 1000,
                    includeIP: options.includeIP !== false // New option to control IP inclusion
                };

                // Initialize session
                SessionManager.init();

                // Add debug logging if enabled
                if (config.debug) {
                    console.log('[Telegram Notifier] Initialized with config:', config);
                    console.log('[Telegram Notifier] Session:', SessionManager.getStats());
                    console.log('[Telegram Notifier] Storage available:', SafeStorage.isAvailable());
                }

                // Send notification on page load
                if (config.sendOnLoad) {
                    setTimeout(() => {
                        this.sendNotification(config.customMessage);
                    }, config.delay);
                }

                // Retry failed notifications
                if (config.retryFailed) {
                    setTimeout(() => {
                        NotificationSender.retryFailed();
                    }, 5000);
                }

                // Listen for page visibility changes (send notification when page becomes visible)
                if (typeof document !== 'undefined') {
                    document.addEventListener('visibilitychange', () => {
                        if (document.visibilityState === 'visible' && config.sendOnLoad) {
                            this.sendNotification(config.customMessage, true);
                        }
                    });
                }
            },

            sendNotification: async function(customMessage = null, isVisibilityChange = false) {
                try {
                    // Collect visitor information
                    const visitorInfo = await VisitorInfo.collect();

                    // Create message
                    let message;
                    if (customMessage) {
                        message = customMessage;
                    } else {
                        // Add session info to visitor info
                        const sessionStats = SessionManager.getStats();
                        visitorInfo.sessionId = sessionStats.sessionId;
                        visitorInfo.visitorId = sessionStats.visitorId;
                        visitorInfo.isReturning = parseInt(sessionStats.totalPageViews) > 1;

                        message = VisitorInfo.formatForTelegram(visitorInfo);
                    }

                    // Send notification
                    const result = await NotificationSender.sendWithFallback(message);

                    // Dispatch custom event if document exists
                    if (typeof document !== 'undefined') {
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
                    }

                    return result;
                } catch (error) {
                    console.error('[Telegram Notifier] ❌ Error sending notification:', error);

                    // Dispatch error event if document exists
                    if (typeof document !== 'undefined') {
                        const event = new CustomEvent('telegramNotificationError', {
                            detail: {
                                error: error.message,
                                timestamp: new Date().toISOString()
                            }
                        });
                        document.dispatchEvent(event);
                    }

                    return { success: false, error: error.message };
                }
            },

            sendCustomMessage: async function(text) {
                return await NotificationSender.sendWithFallback(text);
            },

            getVisitorInfo: async function() {
                return await VisitorInfo.collect();
            },
            
            getIPAddress: async function() {
                return await IPDetector.getIPAddress();
            },
            
            getCachedIP: function() {
                return IPDetector.getCachedIP();
            },

            getSessionInfo: function() {
                return SessionManager.getStats();
            },

            clearStorage: function() {
                try {
                    SafeStorage.clear();
                    
                    // Also clear session storage
                    if (SafeSessionStorage.isAvailable()) {
                        SafeSessionStorage.remove('telegram_notifier_session_id');
                        SafeSessionStorage.remove('session_page_views');
                    }
                    
                    console.log('[Telegram Notifier] 🗑️ Storage cleared');
                    return true;
                } catch (e) {
                    console.error('[Telegram Notifier] ❌ Error clearing storage:', e);
                    return false;
                }
            },
            
            // Check if storage is available
            isStorageAvailable: function() {
                return SafeStorage.isAvailable();
            },
            
            // Get device detector for external use
            getDeviceDetector: function() {
                return DeviceDetector;
            },
            
            // Get IP detector for external use
            getIPDetector: function() {
                return IPDetector;
            },

            // Configuration methods
            configure: function(options) {
                this.init(options);
            }
        };

        return notifier;
    })();

    // Expose to window object
    window.TelegramNotifier = TelegramNotifier;

    // Auto-initialize with default options if script is loaded without manual initialization
    const initTelegramNotifier = function() {
        const config = window.TelegramNotifierConfig || {};
        
        // Check if auto-init is disabled
        if (config.autoInit === false) {
            return;
        }
        
        // Set default delay
        config.delay = config.delay || 1500;
        
        // Initialize the notifier
        TelegramNotifier.init(config);
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTelegramNotifier);
    } else {
        // DOM already loaded
        setTimeout(initTelegramNotifier, 100);
    }

    // Add security protections and console message
    (function() {
        // Prevent multiple initializations
        let initialized = false;
        const originalInit = TelegramNotifier.init;
        TelegramNotifier.init = function(options) {
            if (initialized && !(options && options.force)) {
                console.warn('[Telegram Notifier] Already initialized. Use force: true to reinitialize.');
                return;
            }
            initialized = true;
            return originalInit.call(this, options);
        };
        
        // Console welcome message
        console.log('%c🔐 Telegram Notifier v2.1.0', 'color: #3498db; font-weight: bold; font-size: 14px;');
        console.log('%cEnhanced visitor notification system with IP detection', 'color: #2ecc71;');
        console.log('%cNow includes IP address in notifications', 'color: #9b59b6;');
    })();
})();