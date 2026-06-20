(function () {
  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWER = 'abcdefghijklmnopqrstuvwxyz';
  const DIGITS = '0123456789';
  const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';

  const passwordEl = document.getElementById('password');
  const copyBtn = document.getElementById('copy-btn');
  const slider = document.getElementById('length-slider');
  const lengthVal = document.getElementById('length-val');
  const optUpper = document.getElementById('opt-upper');
  const optLower = document.getElementById('opt-lower');
  const optDigits = document.getElementById('opt-digits');
  const optSymbols = document.getElementById('opt-symbols');
  const genBtn = document.getElementById('gen-btn');
  const strengthFill = document.getElementById('strength-fill');
  const strengthLabel = document.getElementById('strength-label');

  function randInt(max) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function generate() {
    const pools = [];
    if (optUpper.checked) pools.push(UPPER);
    if (optLower.checked) pools.push(LOWER);
    if (optDigits.checked) pools.push(DIGITS);
    if (optSymbols.checked) pools.push(SYMBOLS);

    if (pools.length === 0) {
      passwordEl.textContent = '—';
      setStrength(0);
      return;
    }

    const len = +slider.value;
    const all = pools.join('');
    const chars = [];

    for (const pool of pools) {
      chars.push(pool[randInt(pool.length)]);
    }

    while (chars.length < len) {
      chars.push(all[randInt(all.length)]);
    }

    shuffle(chars);
    passwordEl.textContent = chars.join('');
    setStrength(score(len, pools.length));
  }

  function score(len, variety) {
    if (len < 10 || variety < 2) return 1;
    if (len < 14 || variety < 3) return 2;
    if (len < 20) return 3;
    return 4;
  }

  const STRENGTH_MAP = [
    { pct: 0,   color: 'transparent',  label: '' },
    { pct: 25,  color: '#ef4444',      label: 'Weak' },
    { pct: 50,  color: '#f97316',      label: 'Fair' },
    { pct: 75,  color: '#22c55e',      label: 'Strong' },
    { pct: 100, color: '#10b981',      label: 'Very Strong' },
  ];

  function setStrength(level) {
    const s = STRENGTH_MAP[level];
    strengthFill.style.width = s.pct + '%';
    strengthFill.style.background = s.color;
    strengthLabel.textContent = s.label;
    strengthLabel.style.color = level === 0 ? 'var(--muted)' : s.color;
  }

  slider.addEventListener('input', () => {
    lengthVal.textContent = slider.value;
    generate();
  });

  [optUpper, optLower, optDigits, optSymbols].forEach(el => {
    el.addEventListener('change', generate);
  });

  genBtn.addEventListener('click', generate);

  copyBtn.addEventListener('click', () => {
    const pw = passwordEl.textContent;
    if (!pw || pw === '—') return;
    navigator.clipboard.writeText(pw).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 1500);
    });
  });

  generate();
}());

// PWA install
(function () {
  if (window.matchMedia('(display-mode: standalone)').matches) return;

  const btn = document.getElementById('install-btn');
  let prompt;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    btn.textContent = '⊕ Install';
    btn.hidden = false;
    btn.addEventListener('click', () => alert('Tap the Share icon ⎋, then "Add to Home Screen".'));
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    prompt = e;
    btn.hidden = false;
  });

  window.addEventListener('appinstalled', () => { btn.hidden = true; prompt = null; });

  btn.addEventListener('click', async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') btn.hidden = true;
    prompt = null;
  });
}());
