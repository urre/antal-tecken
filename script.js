const textarea = document.querySelector('textarea');
const total = document.getElementById('total');
const words = document.getElementById('words');
const lines = document.getElementById('lines');
const exampleBtn = document.getElementById('exampleText');
const copyBtn = document.getElementById('copyText');
const clearBtn = document.getElementById('clearText');
const soundToggle = document.getElementById('soundToggle');
const themeButtons = document.querySelectorAll('[data-theme]');

const exampleText = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.';

// Keyboard sound functionality
let soundEnabled = localStorage.getItem('soundEnabled') === 'true';
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let clankBuffer = null;

// Load the clank sound
fetch('clank.wav')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(buffer => {
    clankBuffer = buffer;
  })
  .catch(err => console.error('Error loading clank.wav:', err));

function playKeySound() {
  if (!soundEnabled || !clankBuffer) return;

  const source = audioContext.createBufferSource();
  source.buffer = clankBuffer;

  // Add slight randomization to pitch for variety
  source.playbackRate.value = 0.95 + Math.random() * 0.1;

  source.connect(audioContext.destination);
  source.start(0);
}

function updateSoundToggle() {
  soundToggle.classList.toggle('active', soundEnabled);
  localStorage.setItem('soundEnabled', soundEnabled);
}

function updateCount() {
  const text = textarea.value;
  const length = text.length;

  // Character count
  total.textContent = `${length.toLocaleString('sv-SE')} tecken`;

  // Word count
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  words.textContent = `${wordCount.toLocaleString('sv-SE')} ord`;

  // Line count
  const lineCount = text ? text.split('\n').length : 0;
  lines.textContent = `${lineCount.toLocaleString('sv-SE')} ${lineCount === 1 ? 'rad' : 'rader'}`;

  // Update counter appearance
  total.classList.toggle('active', length > 0);
}

textarea.addEventListener('input', (e) => {
  updateCount();

  // Play sound only for actual typing (not paste or other operations)
  if (e.inputType === 'insertText' || e.inputType === 'deleteContentBackward') {
    playKeySound();
  }
});

soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  updateSoundToggle();
  showNotification(soundEnabled ? '🔊 Ljud på' : '🔇 Ljud av');
});

exampleBtn.addEventListener('click', () => {
  textarea.value += exampleText;
  updateCount();
  textarea.focus();
});

copyBtn.addEventListener('click', async () => {
  if (textarea.value) {
    try {
      await navigator.clipboard.writeText(textarea.value);
      showNotification('✓ Text kopierad!');
    } catch (err) {
      showNotification('⚠ Kunde inte kopiera');
    }
  }
});

clearBtn.addEventListener('click', () => {
  if (textarea.value && !confirm('Är du säker på att du vill rensa texten?')) {
    return;
  }
  textarea.value = '';
  updateCount();
  textarea.focus();
});

themeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const theme = button.dataset.theme;
    document.body.className = theme;
    localStorage.setItem('theme', theme);

    // Update active button state
    themeButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.altKey) {
    switch(e.key.toLowerCase()) {
      case 'e':
        e.preventDefault();
        exampleBtn.click();
        break;
      case 'c':
        e.preventDefault();
        copyBtn.click();
        break;
      case 'r':
        e.preventDefault();
        clearBtn.click();
        break;
      case 's':
        e.preventDefault();
        soundToggle.click();
        break;
    }
  }
});

// Notification system
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.className = savedTheme;
themeButtons.forEach(btn => {
  if (btn.dataset.theme === savedTheme) {
    btn.classList.add('active');
  }
});

// Initialize
updateCount();
updateSoundToggle();
textarea.focus();
