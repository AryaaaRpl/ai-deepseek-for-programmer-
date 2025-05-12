document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#00b4d8" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#4a6fa5", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" }
            },
            modes: {
                grab: { distance: 140, line_linked: { opacity: 1 } },
                push: { particles_nb: 4 }
            }
        }
    });

    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const featureBtns = document.querySelectorAll('.feature-btn');
    
    let chatHistory = [];
    
    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Send message on Enter (but allow Shift+Enter for new line)
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
    
    // Feature buttons
    featureBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            userInput.value = prompt;
            userInput.focus();
        });
    });
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage('user', message);
        chatHistory.push({ sender: 'user', message: message });
        
        // Clear input
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot-message typing-indicator';
        typingIndicator.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;
        chatBox.appendChild(typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // Send to backend
        fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: message,
                history: chatHistory.slice(-6) // Send last 6 messages as context
            })
        })
        .then(response => response.json())
        .then(data => {
            // Remove typing indicator
            chatBox.removeChild(typingIndicator);
            
            if (data.status === 'success') {
                // Add bot response to chat
                addMessage('bot', data.response);
                chatHistory.push({ sender: 'bot', message: data.response });
            } else {
                addMessage('bot', `Error: ${data.response}`);
            }
        })
        .catch(error => {
            chatBox.removeChild(typingIndicator);
            addMessage('bot', `Network error: ${error.message}`);
        });
    }
    
 function addMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    // Proses blok kode
    let processedMessage = message.replace(/```(\w*)([\s\S]*?)```/g, 
        (match, lang, code) => {
            const language = lang || 'code';
            return `
                <div class="code-container">
                    <div class="code-header">
                        <span>${language}</span>
                    </div>
                    <div class="code-content">
                        <pre>${escapeHtml(code.trim())}</pre>
                    </div>
                </div>
            `;
        }
    );
    
    // Proses inline code
    processedMessage = processedMessage.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    // Proses line breaks
    processedMessage = processedMessage.replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = processedMessage;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
    // Initial greeting from the bot
    setTimeout(() => {
        const greeting = `Halo! Saya AI Assistant khusus untuk programmer. Saya bisa membantu dengan:\n\n` +
                         `• Memberikan solusi kode langsung\n` +
                         `• Debugging masalah teknis\n` +
                         `• Optimasi kode\n` +
                         `• Contoh implementasi\n\n` +
                         `Silakan ajukan pertanyaan coding Anda!`;
        addMessage('bot', greeting);
        chatHistory.push({ sender: 'bot', message: greeting });
    }, 1000);
});

// Add event listener for copy buttons
document.addEventListener('click', function(e) {
    if (e.target.matches('pre::after, pre')) {
        const codeBlock = e.target.tagName === 'PRE' ? e.target : e.target.parentElement;
        const code = codeBlock.querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const originalText = codeBlock.querySelector('::after')?.content || 'copy';
            codeBlock.style.setProperty('--after-content', '"Copied!"');
            setTimeout(() => {
                codeBlock.style.setProperty('--after-content', `"${originalText}"`);
            }, 2000);
        });
    }
});

fetch('/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: "Buatkan website dengan desain yang sempurna dan memiliki animasi background" })
})
.then(res => res.json())
.then(data => console.log(data))

function formatCodeBlocks(message) {
    // Process multi-file code blocks first
    let formatted = message.replace(/```(\w*)\n([\s\S]*?)```/g, 
        (match, lang, code) => {
            const language = lang || 'code';
            return `
            <div class="code-block">
                <div class="code-header">
                    <span>${language}</span>
                    <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                </div>
                <pre><code>${escapeHtml(code.trim())}</code></pre>
            </div>`;
        }
    );
    
    // Process inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    return formatted;
}

// Add this function to handle copying code
async function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    const feedback = codeBlock.querySelector('.copy-feedback');
    
    try {
        await navigator.clipboard.writeText(code);
        
        // Show feedback
        feedback.classList.add('show');
        
        // Change button appearance temporarily
        button.innerHTML = '<i class="fas fa-check"></i> Copied';
        button.style.background = 'var(--highlight)';
        button.style.color = 'white';
        
        // Reset after 2 seconds
        setTimeout(() => {
            feedback.classList.remove('show');
            button.innerHTML = '<i class="far fa-copy"></i> Copy';
            button.style.background = 'rgba(255, 255, 255, 0.1)';
            button.style.color = '#aaa';
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy:', err);
        feedback.textContent = 'Failed to copy';
        feedback.classList.add('show');
        setTimeout(() => feedback.classList.remove('show'), 2000);
    }
}

// Update your code block formatting function
function formatCodeBlocks(message) {
    return message.replace(/```(\w*)\n([\s\S]*?)```/g, 
        (match, lang, code) => {
            const language = lang || 'code';
            return `
            <div class="code-block">
                <div class="code-header">
                    <span>${language}</span>
                    <span class="copy-feedback">Copied!</span>
                    <button class="copy-btn" onclick="copyCode(this)">
                        <i class="far fa-copy"></i> Copy
                    </button>
                </div>
                <pre><code>${escapeHtml(code.trim())}</code></pre>
            </div>`;
        }
    );
}