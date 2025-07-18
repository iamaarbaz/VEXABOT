const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const darkToggle = document.getElementById('darkToggle');
const speechBtn = document.getElementById('speech-btn');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const downloadBtn = document.getElementById('download-btn');

// Add sound effects
const sendSound = new Audio('https://www.soundjay.com/buttons/sounds/button-29.mp3');
const replySound = new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3');

let recognition;
let typingElement = null;

// Speech Recognition Setup
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    speechBtn.style.display = 'none';
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onstart = () => {
    speechBtn.textContent = '🎙️...';
  };
  recognition.onresult = e => {
    userInput.value = e.results[0][0].transcript;
    sendMessage();
  };
  recognition.onerror = e => {
    alert('Mic error: ' + e.error);
    speechBtn.textContent = '🎤';
  };
  recognition.onend = () => {
    speechBtn.textContent = '🎤';
  };

  speechBtn.addEventListener('click', () => {
    if (recognition && recognition.running) return;
    recognition.start();
  });
}

function appendMessage(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);

  const avatar = document.createElement('img');
  avatar.classList.add('avatar');
  avatar.src = sender === 'user'
    ? 'https://randomuser.me/api/portraits/lego/1.jpg'
    : 'https://cdn-icons-png.flaticon.com/512/4712/4712006.png';
  avatar.alt = sender;

  const timestamp = document.createElement('span');
  timestamp.classList.add('timestamp');
  timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  messageElement.appendChild(avatar);
  messageElement.appendChild(document.createTextNode(message));
  messageElement.appendChild(timestamp);

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  typingElement = document.createElement('div');
  typingElement.classList.add('message', 'bot');
  typingElement.textContent = 'VexaBot is typing...';
  chatBox.appendChild(typingElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingIndicator() {
  if (typingElement) {
    chatBox.removeChild(typingElement);
    typingElement = null;
  }
}

function getBotReply(input) {
  input = input.toLowerCase();

  // Greetings
  if (/hello|hi|hey/.test(input)) return "Hello! How can I help you today?";
  if (/how are you/.test(input)) return "I'm doing great, thank you! How can I assist you today?";

  // Bot identity
  if (/your name/.test(input)) return "I'm VexaBot, your friendly customer support assistant.";

  // Time and date
  if (input.includes('time')) return `It's ${new Date().toLocaleTimeString()}.`;
  if (input.includes('date')) return `Today's date is ${new Date().toLocaleDateString()}.`;

  // Customer service-related queries
  if (input.includes('return') || input.includes('refund')) {
    return "You can return any item within 30 days of purchase. Refunds are processed within 5-7 business days.";
  }

  if (input.includes('shipping') || input.includes('delivery')) {
    return "We offer free shipping on orders over $50. Delivery typically takes 3-5 business days.";
  }

  if (input.includes('track') && input.includes('order')) {
    return "To track your order, please visit your account > Orders and click 'Track'.";
  }

  if (input.includes('cancel') && input.includes('order')) {
    return "To cancel an order, go to your Orders page and click on 'Cancel'. If it's already shipped, contact support.";
  }

  if (input.includes('contact') || input.includes('support')) {
    return "You can reach our support team at support@example.com or call us at +1-800-123-4567.";
  }

  if (input.includes('hours') || input.includes('working time')) {
    return "Our customer support is available from 9 AM to 6 PM, Monday through Friday.";
  }

  if (input.includes('available') && input.includes('product')) {
    return "Please provide the product name or SKU so I can check availability.";
  }

  if (input.includes('payment') || input.includes('pay')) {
    return "We accept Visa, MasterCard, PayPal, and Apple Pay.";
  }

  if (input.includes('warranty')) {
    return "All our products come with a 1-year warranty against manufacturing defects.";
  }

  return "I'm sorry, I didn't understand that. Could you please rephrase your question?";
}

function botReplyWithEffect(userInput) {
  const reply = getBotReply(userInput);
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'bot');

  const avatar = document.createElement('img');
  avatar.classList.add('avatar');
  avatar.src = 'https://cdn-icons-png.flaticon.com/512/4712/4712006.png';
  avatar.alt = 'Bot avatar';

  const textSpan = document.createElement('span');
  textSpan.classList.add('bot-text');

  messageElement.appendChild(avatar);
  messageElement.appendChild(textSpan);
  chatBox.appendChild(messageElement);

  let i = 0;
  function typeText() {
    if (i < reply.length) {
      textSpan.textContent += reply.charAt(i);
      i++;
      chatBox.scrollTop = chatBox.scrollHeight;
      setTimeout(typeText, 30);
    } else {
      const timestamp = document.createElement('span');
      timestamp.classList.add('timestamp');
      timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      messageElement.appendChild(timestamp);
      replySound.play();
    }
  }

  typeText();
}

function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage(message, 'user');
  userInput.value = '';
  userInput.focus();
  sendSound.play();

  showTypingIndicator();
  setTimeout(() => {
    hideTypingIndicator();
    botReplyWithEffect(message);
  }, 800);
}

function clearChat() {
  chatBox.innerHTML = '';
}

function downloadChat() {
  const lines = Array.from(chatBox.children).map(el => {
    const sender = el.classList.contains('user') ? 'User' : 'VexaBot';
    const msg = el.childNodes[1]?.textContent || '';
    const time = el.querySelector('.timestamp')?.textContent || '';
    return `[${time}] ${sender}: ${msg}`;
  }).join('\n');

  const blob = new Blob([lines], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'vexabot_chat.txt';
  link.click();
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode', darkToggle.checked);
  localStorage.setItem('darkMode', darkToggle.checked);
}

// Dark mode preference load
if (localStorage.getItem('darkMode') === 'true') {
  darkToggle.checked = true;
  toggleDarkMode();
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', e => e.key === 'Enter' && sendMessage());
clearBtn.addEventListener('click', clearChat);
downloadBtn.addEventListener('click', downloadChat);
darkToggle.addEventListener('change', toggleDarkMode);

setupSpeechRecognition();
