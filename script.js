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

function playKeySound() {
  if (!soundEnabled) return;

  const now = audioContext.currentTime;

  // Three different frequencies for variety
  const frequencies = [150, 200, 250];
  const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

  // Main click sound
  const click = audioContext.createOscillator();
  const clickGain = audioContext.createGain();
  click.connect(clickGain);
  clickGain.connect(audioContext.destination);

  click.frequency.value = freq;
  click.type = 'square';

  clickGain.gain.setValueAtTime(0.08, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  click.start(now);
  click.stop(now + 0.02);

  // Body/resonance sound
  const body = audioContext.createOscillator();
  const bodyGain = audioContext.createGain();
  body.connect(bodyGain);
  bodyGain.connect(audioContext.destination);

  body.frequency.value = freq * 1.5;
  body.type = 'triangle';

  bodyGain.gain.setValueAtTime(0.04, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  body.start(now);
  body.stop(now + 0.08);

  // Bottom-out thock
  const thock = audioContext.createOscillator();
  const thockGain = audioContext.createGain();
  thock.connect(thockGain);
  thockGain.connect(audioContext.destination);

  thock.frequency.value = freq * 0.8;
  thock.type = 'sine';

  thockGain.gain.setValueAtTime(0, now + 0.01);
  thockGain.gain.setValueAtTime(0.06, now + 0.015);
  thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  thock.start(now + 0.01);
  thock.stop(now + 0.06);

  // White noise
  const bufferSize = audioContext.sampleRate * 0.03;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const noise = audioContext.createBufferSource();
  const noiseGain = audioContext.createGain();
  const noiseFilter = audioContext.createBiquadFilter();

  noise.buffer = noiseBuffer;
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);

  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = freq * 2;
  noiseFilter.Q.value = 2;

  noiseGain.gain.setValueAtTime(0.03, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  noise.start(now);
  noise.stop(now + 0.03);
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
