(function() {
    'use strict';
    
    // Prevent multiple widget instances
    if (window.MissedHVACWidget) {
        console.warn('MissedHVAC Widget already loaded');
        return;
    }

    // Configuration - customers can customize via script attributes
    const config = {
        // FIXED: Correct n8n webhook endpoint  
        apiEndpoint: document.currentScript?.getAttribute('data-api-endpoint') || 'https://oxendineleads.app.n8n.cloud/webhook/38bab8c2-35b9-4f73-9d87-93f5eacd42e5',
        // SaaS customer configuration
        customerId: document.currentScript?.getAttribute('data-customer-id') || 'demo',
        apiKey: document.currentScript?.getAttribute('data-api-key') || 'sk-test-missedhvac-20250726',
        // Customer branding options
        emergencyPhone: document.currentScript?.getAttribute('data-emergency-phone') || '(555) 987-6643',
        companyName: document.currentScript?.getAttribute('data-company-name') || 'HVAC Pro',
        theme: document.currentScript?.getAttribute('data-theme') || 'orange',
        position: document.currentScript?.getAttribute('data-position') || 'bottom-right',
        assistantName: document.currentScript?.getAttribute('data-assistant-name') || 'HVAC AI Assistant'
    };

    // Enhanced CSS with better mobile support and professional styling
    const styles = `
        #hvac-chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 380px;
            height: 650px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            z-index: 10000;
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid rgba(0, 0, 0, 0.08);
        }

        #hvac-chat-widget.open {
            display: flex;
            animation: slideInUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @keyframes slideInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .chat-header {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        .chat-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="80" r="1.5" fill="white" opacity="0.1"/><circle cx="40" cy="70" r="1" fill="white" opacity="0.1"/></svg>');
            pointer-events: none;
        }

        .chat-header-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .chat-title {
            font-weight: 600;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .chat-subtitle {
            font-size: 12px;
            opacity: 0.9;
        }

        .chat-status {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            opacity: 0.85;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }

        .chat-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 8px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
        }

        .chat-close:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            scroll-behavior: smooth;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background: linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%);
        }

        .message {
            max-width: 85%;
            word-wrap: break-word;
            animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
            margin-left: auto;
        }

        .message.assistant {
            margin-right: auto;
        }

        .message-bubble {
            padding: 14px 18px;
            border-radius: 20px;
            font-size: 14px;
            line-height: 1.5;
            white-space: pre-wrap;
        }

        .message.user .message-bubble {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            border-bottom-right-radius: 8px;
            box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
        }

        .message.assistant .message-bubble {
            background: white;
            color: #374151;
            border-bottom-left-radius: 8px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        }

        .quick-actions {
            padding: 16px 20px 0;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .quick-action-btn {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 20px;
            padding: 8px 14px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            color: #6b7280;
        }

        .quick-action-btn:hover {
            background: #f97316;
            color: white;
            border-color: #f97316;
            transform: translateY(-1px);
        }

        .chat-input-container {
            padding: 20px;
            border-top: 1px solid #e5e7eb;
            background: white;
        }

        .chat-input-wrapper {
            display: flex;
            gap: 12px;
            align-items: flex-end;
            background: #f9fafb;
            border-radius: 24px;
            padding: 8px;
            border: 1px solid #e5e7eb;
            transition: all 0.2s;
        }

        .chat-input-wrapper:focus-within {
            border-color: #f97316;
            background: white;
            box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .chat-input {
            flex: 1;
            border: none;
            background: transparent;
            padding: 10px 16px;
            font-size: 14px;
            resize: none;
            max-height: 100px;
            min-height: 20px;
            outline: none;
            font-family: inherit;
        }

        .chat-input::placeholder {
            color: #9ca3af;
        }

        .chat-send {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
        }

        .chat-send:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
        }

        .chat-send:disabled {
            background: #d1d5db;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        #hvac-chat-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            border-radius: 50%;
            border: none;
            cursor: pointer;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            color: white;
            font-size: 26px;
            z-index: 9999;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #hvac-chat-button:hover {
            transform: scale(1.1) rotate(5deg);
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
        }

        #hvac-chat-button.pulse {
            animation: buttonPulse 2s infinite;
        }

        @keyframes buttonPulse {
            0%, 100% { box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(249, 115, 22, 0.4); }
            50% { box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 0 0 20px rgba(249, 115, 22, 0); }
        }

        .typing-indicator {
            display: none;
            padding: 16px 20px;
            font-style: italic;
            color: #6b7280;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .typing-dots {
            display: flex;
            gap: 4px;
        }

        .typing-dot {
            width: 6px;
            height: 6px;
            background: #f97316;
            border-radius: 50%;
            animation: typingBounce 1.4s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingBounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-8px); }
        }

        .powered-by {
            text-align: center;
            padding: 12px;
            font-size: 11px;
            color: #9ca3af;
            background: #f9fafb;
            border-top: 1px solid #e5e7eb;
        }

        .powered-by a {
            color: #f97316;
            text-decoration: none;
            font-weight: 500;
        }

        .powered-by a:hover {
            text-decoration: underline;
        }

        .error-message {
            background: #fef2f2;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            margin: 8px 20px;
            border-left: 3px solid #dc2626;
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
            #hvac-chat-widget {
                width: calc(100vw - 20px);
                height: calc(100vh - 40px);
                bottom: 10px;
                right: 10px;
                border-radius: 12px;
            }
            
            #hvac-chat-button {
                bottom: 15px;
                right: 15px;
                width: 56px;
                height: 56px;
                font-size: 22px;
            }
        }

        @media (max-width: 380px) {
            .message {
                max-width: 90%;
            }
            
            .chat-messages {
                padding: 16px;
            }
            
            .chat-input-container {
                padding: 16px;
            }
        }
    `;

    // Create and inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create chat widget HTML with enhanced UI
    const widgetHTML = `
        <button id="hvac-chat-button" class="pulse" title="Chat with ${config.companyName}">
            🔧
        </button>
        <div id="hvac-chat-widget">
            <div class="chat-header">
                <div class="chat-header-content">
                    <div class="chat-title">
                        🔧 ${config.assistantName}
                    </div>
                    <div class="chat-subtitle">Powered by ${config.companyName}</div>
                    <div class="chat-status">
                        <span class="status-dot"></span>
                        Online • Instant responses
                    </div>
                </div>
                <button class="chat-close">×</button>
            </div>
            
            <div class="chat-messages" id="chat-messages">
                <div class="message assistant">
                    <div class="message-bubble">
                        👋 Hi! I'm your 24/7 HVAC assistant. I can help with:
                        <br><br>• Emergency diagnostics & troubleshooting
                        <br>• Service appointment scheduling
                        <br>• Instant pricing estimates
                        <br>• System maintenance advice
                        <br>• Equipment recommendations
                        <br><br>What's going on with your HVAC system today?
                    </div>
                </div>
            </div>

            <div class="quick-actions" id="quick-actions">
                <button class="quick-action-btn" onclick="window.MissedHVACWidget.sendQuickMessage('My AC is not cooling properly')">❄️ AC Not Cooling</button>
                <button class="quick-action-btn" onclick="window.MissedHVACWidget.sendQuickMessage('My heater is not working')">🔥 Heater Issues</button>
                <button class="quick-action-btn" onclick="window.MissedHVACWidget.sendQuickMessage('I need a service appointment')">📅 Schedule Service</button>
                <button class="quick-action-btn" onclick="window.MissedHVACWidget.sendQuickMessage('What are your pricing rates?')">💰 Get Pricing</button>
            </div>

            <div class="typing-indicator" id="typing-indicator" style="display: none;">
                🤖 AI is analyzing your issue
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
            
            <div class="chat-input-container">
                <div class="chat-input-wrapper">
                    <textarea 
                        id="chat-input" 
                        class="chat-input" 
                        placeholder="Describe your HVAC issue..."
                        rows="1"
                    ></textarea>
                    <button id="chat-send" class="chat-send" title="Send message">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L11 13L15 17L22 2Z" fill="currentColor"/>
                            <path d="M22 2L15 17L11 13L2 22L22 2Z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="powered-by">
                Powered by <a href="https://missedhvac.com?ref=widget" target="_blank">MissedHVAC</a> • 
                24/7 AI Support
            </div>
        </div>
    `;

    // Add HTML to page
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    let isOpen = false;
    let conversationHistory = [];
    let messageCount = 0;

    function trackEvent(eventName, data = {}) {
        // Analytics tracking for SaaS metrics
        console.log('Widget Event:', eventName, { customerId: config.customerId, ...data });
        
        // You can integrate with Google Analytics, Mixpanel, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                custom_parameter_1: config.customerId,
                ...data
            });
        }
    }

    function scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    function toggleChat() {
        const widget = document.getElementById('hvac-chat-widget');
        const button = document.getElementById('hvac-chat-button');
        
        isOpen = !isOpen;
        
        if (isOpen) {
            widget.classList.add('open');
            button.style.display = 'none';
            document.getElementById('chat-input').focus();
            trackEvent('chat_opened');
            
            // Hide quick actions after first message
            if (messageCount > 0) {
                document.getElementById('quick-actions').style.display = 'none';
            }
            
            setTimeout(scrollToBottom, 300);
        } else {
            widget.classList.remove('open');
            button.style.display = 'flex';
            trackEvent('chat_closed');
        }
    }

    function showTypingIndicator() {
        document.getElementById('typing-indicator').style.display = 'flex';
        scrollToBottom();
    }

    function hideTypingIndicator() {
        document.getElementById('typing-indicator').style.display = 'none';
    }

    function addMessage(content, isUser = false) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        
        // Handle markdown-like formatting
        let formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
        
        bubbleDiv.innerHTML = formattedContent;
        messageDiv.appendChild(bubbleDiv);
        messagesContainer.appendChild(messageDiv);
        
        scrollToBottom();
        
        // Hide quick actions after first user message
        if (isUser && messageCount === 0) {
            document.getElementById('quick-actions').style.display = 'none';
            messageCount++;
        }
    }

    // FIXED: Ultimate API call with no CORS issues
    async function sendToAPI(message, isQuickAction = false) {
        console.log('Widget Debug:', {
            url: config.apiEndpoint,
            message: message,
            customerId: config.customerId,
            timestamp: new Date().toISOString()
        });

        try {
            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // NO AUTHORIZATION HEADER = NO CORS PREFLIGHT!
                },
                body: JSON.stringify({
                    // Auth moved to body to avoid CORS
                    message: message,
                    context: `HVAC service chat for ${config.companyName} - help with heating, cooling, repairs, estimates, and scheduling. Customer ID: ${config.customerId}`,
                    apiKey: config.apiKey,
                    customerId: config.customerId,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        isQuickAction: isQuickAction,
                        sessionId: Date.now().toString(),
                        userAgent: navigator.userAgent,
                        referrer: document.referrer
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Handle multiple possible response formats from n8n
            let responseText = '';
            if (typeof data === 'string') {
                responseText = data;
            } else if (data.response) {
                responseText = data.response;
            } else if (data.reply) {
                responseText = data.reply;
            } else if (data.message) {
                responseText = data.message;
            } else if (data.content) {
                responseText = data.content;
            } else {
                responseText = "I received your message but I'm having trouble processing it right now. Please try again or call for immediate assistance.";
            }

            return responseText;

        } catch (error) {
            console.error('MissedHVAC Widget: API Error', error);
            
            // Detailed error handling
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return `I'm having trouble connecting to our AI service right now. This might be a network issue. For immediate HVAC assistance, please call ${config.emergencyPhone}.`;
            } else if (error.message.includes('524')) {
                return `Our AI service is taking longer than expected to respond. For urgent HVAC issues, please call ${config.emergencyPhone} for immediate assistance.`;
            } else {
                return `I apologize, but I'm experiencing technical difficulties. For immediate HVAC support, please call ${config.emergencyPhone}.`;
            }
        }
    }

    async function sendMessage(message = null) {
        const input = document.getElementById('chat-input');
        const sendButton = document.getElementById('chat-send');
        const messageText = message || input.value.trim();

        if (!messageText) return;

        // Add user message
        addMessage(messageText, true);
        conversationHistory.push({ role: 'user', content: messageText });
        
        // Clear input if it was typed (not a quick action)
        if (!message) {
            input.value = '';
            input.style.height = 'auto';
        }
        
        sendButton.disabled = true;
        
        // Show typing indicator
        showTypingIndicator();

        // Track the interaction
        trackEvent('message_sent', { 
            messageLength: messageText.length,
            isQuickAction: !!message 
        });

        try {
            const responseText = await sendToAPI(messageText, !!message);
            
            hideTypingIndicator();
            
            // Add AI response
            addMessage(responseText);
            conversationHistory.push({ role: 'assistant', content: responseText });
            
            trackEvent('response_received', { 
                responseLength: responseText.length 
            });

        } catch (error) {
            hideTypingIndicator();
            
            const errorMessage = `I apologize, but I'm having trouble connecting right now. For immediate HVAC assistance, please call ${config.emergencyPhone}.`;
            addMessage(errorMessage);
            
            trackEvent('message_error', { error: error.message });
            
            // Show error in UI
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Connection issue - please try again or call for immediate assistance';
            document.getElementById('chat-messages').appendChild(errorDiv);
            
            setTimeout(() => errorDiv.remove(), 5000);
            
        } finally {
            sendButton.disabled = false;
            if (!message) {
                input.focus();
            }
        }
    }

    // Quick action handler
    function sendQuickMessage(message) {
        sendMessage(message);
    }

    // Event listeners
    document.getElementById('hvac-chat-button').addEventListener('click', toggleChat);
    document.querySelector('.chat-close').addEventListener('click', toggleChat);
    document.getElementById('chat-send').addEventListener('click', () => sendMessage());

    // Auto-resize textarea
    document.getElementById('chat-input').addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    // Send on Enter (but allow Shift+Enter for new lines)
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Add pulse effect to button after 10 seconds if not opened
    setTimeout(() => {
        if (!isOpen) {
            document.getElementById('hvac-chat-button').classList.add('pulse');
        }
    }, 10000);

    // Public API for external control
    window.MissedHVACWidget = {
        open: function() {
            if (!isOpen) toggleChat();
        },
        close: function() {
            if (isOpen) toggleChat();
        },
        sendMessage: function(message) {
            if (!isOpen) toggleChat();
            setTimeout(() => sendMessage(message), 300);
        },
        sendQuickMessage: sendQuickMessage,
        getHistory: function() {
            return conversationHistory;
        },
        clearHistory: function() {
            conversationHistory = [];
            const messagesContainer = document.getElementById('chat-messages');
            messagesContainer.innerHTML = `
                <div class="message assistant">
                    <div class="message-bubble">
                        👋 Hi! I'm your 24/7 HVAC assistant. How can I help you today?
                    </div>
                </div>
            `;
            document.getElementById('quick-actions').style.display = 'flex';
            messageCount = 0;
        }
    };

    // Mark as loaded
    window.MissedHVACWidget.loaded = true;
    console.log('✅ MissedHVAC Widget loaded successfully');
    
    // Track widget load
    trackEvent('widget_loaded', { 
        customerId: config.customerId,
        companyName: config.companyName 
    });

})();
