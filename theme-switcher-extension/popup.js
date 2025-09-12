document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadView = document.getElementById('upload-view');
    const mainView = document.getElementById('main-view');
    const uploadResumeBtn = document.getElementById('upload-resume-btn');
    const changeResumeBtn = document.getElementById('change-resume-btn');
    const autofillBtn = document.getElementById('autofill-btn');
    const chatbotBtn = document.getElementById('chatbot-btn');
    const resumeInput = document.getElementById('resume-input');
    const resumeNameSpan = document.getElementById('resume-name');

    // --- State Management ---
    // On popup open, check if a resume is already stored
    chrome.storage.local.get(['resumeFileName'], (result) => {
        if (result.resumeFileName) {
            updateUIForResume(result.resumeFileName);
        } else {
            showUploadView();
        }
    });

    // --- Event Listeners ---
    uploadResumeBtn.addEventListener('click', () => resumeInput.click());
    changeResumeBtn.addEventListener('click', () => resumeInput.click());

    resumeInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // In a real extension, you would parse the file here.
            // For now, we just save its name for the UI.
            chrome.storage.local.set({ resumeFileName: file.name }, () => {
                updateUIForResume(file.name);
            });
        }
    });

    autofillBtn.addEventListener('click', () => {
        // This is a placeholder for the autofill logic.
        // It injects a script into the active tab to simulate the action.
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    // This function runs on the webpage
                    console.log('Form Filler AI: Autofill action triggered.');
                    // In a real app, this would find form fields and fill them
                    // with parsed resume data.
                    // For now, let's create a subtle notification.
                    const notif = document.createElement('div');
                    notif.textContent = 'Form Filler AI: Autofill initiated!';
                    notif.style.position = 'fixed';
                    notif.style.top = '20px';
                    notif.style.right = '20px';
                    notif.style.backgroundColor = '#4c6ef5';
                    notif.style.color = 'white';
                    notif.style.padding = '12px 20px';
                    notif.style.borderRadius = '8px';
                    notif.style.zIndex = '99999';
                    notif.style.fontFamily = 'sans-serif';
                    notif.style.fontSize = '14px';
                    document.body.appendChild(notif);
                    setTimeout(() => notif.remove(), 3000);
                }
            });
        });
    });

    chatbotBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: chatbotController,
            });
        });
    });

    // --- UI Update Functions ---
    function showUploadView() {
        uploadView.classList.remove('hidden');
        mainView.classList.add('hidden');
    }

    function showMainView() {
        uploadView.classList.add('hidden');
        mainView.classList.remove('hidden');
    }

    function updateUIForResume(fileName) {
        resumeNameSpan.textContent = fileName;
        resumeNameSpan.title = fileName; // for tooltip on long names
        showMainView();
    }
});

// This function is injected onto the page to create the chatbot.
function chatbotController() {
    const CHATBOT_ID = 'form-filler-ai-chatbot-container';
    if (document.getElementById(CHATBOT_ID)) {
        // Toggle visibility if it exists
        const bot = document.getElementById(CHATBOT_ID);
        bot.style.display = bot.style.display === 'none' ? 'flex' : 'none';
        return;
    }

    // --- 1. Chatbot CSS ---
    const chatbotStyles = `
        :root { --chatbot-primary: #4c6ef5; --chatbot-bg: #fff; --chatbot-text: #333; }
        .chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            max-width: 90vw;
            height: 500px;
            background-color: var(--chatbot-bg);
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 9999;
            font-family: sans-serif;
        }
        .chatbot-header {
            background-color: var(--chatbot-primary);
            color: white;
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        .chatbot-header h3 { margin: 0; font-size: 16px; }
        .chatbot-close-btn { background: none; border: none; color: white; cursor: pointer; font-size: 24px; line-height: 1; padding: 0; }
        .chatbot-messages { flex-grow: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
        .chat-message { max-width: 80%; padding: 10px 14px; border-radius: 18px; }
        .user-message { background-color: #e9ecef; align-self: flex-end; border-bottom-right-radius: 4px; }
        .bot-message { background-color: var(--chatbot-primary); color: white; align-self: flex-start; border-bottom-left-radius: 4px; }
        .chatbot-input-form { display: flex; border-top: 1px solid #e9ecef; padding: 10px; flex-shrink: 0; }
        .chatbot-input { flex-grow: 1; border: 1px solid #ccc; border-radius: 20px; padding: 8px 16px; font-size: 14px; outline: none; }
        .chatbot-input:focus { border-color: var(--chatbot-primary); }
        .chatbot-send-btn { background: var(--chatbot-primary); color: white; border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; margin-left: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    `;

    // --- 2. Chatbot HTML ---
    const chatbotHtml = `
        <div class="chatbot-header">
            <h3>AI Assistant</h3>
            <button class="chatbot-close-btn" aria-label="Close Chatbot">&times;</button>
        </div>
        <div class="chatbot-messages">
            <div class="chat-message bot-message">Hello! How can I help you with your application today?</div>
        </div>
        <form class="chatbot-input-form">
            <input type="text" class="chatbot-input" placeholder="Ask a question..." required>
            <button type="submit" class="chatbot-send-btn" aria-label="Send Message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
        </form>
    `;

    // --- 3. Inject and Control ---
    // Inject styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = chatbotStyles;
    document.head.appendChild(styleSheet);

    // Create container and inject HTML
    const container = document.createElement("div");
    container.id = CHATBOT_ID;
    container.className = 'chatbot-container';
    container.innerHTML = chatbotHtml;
    document.body.appendChild(container);

    // Get injected elements
    const chatMessages = container.querySelector('.chatbot-messages');
    const inputForm = container.querySelector('.chatbot-input-form');
    const inputField = container.querySelector('.chatbot-input');
    const closeBtn = container.querySelector('.chatbot-close-btn');

    // Add logic
    closeBtn.addEventListener('click', () => container.remove());
    inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userText = inputField.value.trim();
        if (!userText) return;

        // Display user message
        addMessage(userText, 'user-message');
        inputField.value = '';

        // Simulate bot response
        setTimeout(() => {
            addMessage("This is a placeholder response. The real AI logic will be connected later.", 'bot-message');
        }, 1000);
    });

    function addMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${className}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
