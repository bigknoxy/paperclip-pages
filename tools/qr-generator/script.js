// QR Code Generator with Lead Capture
(function() {
    'use strict';

    // State
    let currentQR = null;
    let generationCount = 0;
    const STORAGE_KEY = 'qr_lead_captured';
    const COUNT_KEY = 'qr_generation_count';
    let isPremium = false;

    // DOM Elements
    const generateBtn = document.getElementById('generateBtn');
    const qrPreview = document.getElementById('qrPreview');
    const downloadOptions = document.getElementById('downloadOptions');
    const downloadPng = document.getElementById('downloadPng');
    const downloadSvg = document.getElementById('downloadSvg');
    const downloadPdf = document.getElementById('downloadPdf');
    const leadModal = document.getElementById('leadModal');
    const modalClose = document.getElementById('modalClose');
    const leadForm = document.getElementById('leadForm');
    const leadEmail = document.getElementById('leadEmail');
    const unlockPremium = document.getElementById('unlockPremium');

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = {
        url: document.getElementById('urlPanel'),
        text: document.getElementById('textPanel'),
        email: document.getElementById('emailPanel'),
        phone: document.getElementById('phonePanel'),
        wifi: document.getElementById('wifiPanel'),
        vcard: document.getElementById('vcardPanel')
    };

    let currentType = 'url';

    // Initialize
    function init() {
        loadState();
        setupEventListeners();
        updatePremiumUI();
    }

    function loadState() {
        const stored = localStorage.getItem(STORAGE_KEY);
        isPremium = stored === 'true';
        const count = localStorage.getItem(COUNT_KEY);
        generationCount = count ? parseInt(count, 10) : 0;
    }

    function saveState() {
        localStorage.setItem(COUNT_KEY, generationCount.toString());
    }

    function setupEventListeners() {
        // Tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.type));
        });

        // Generate button
        generateBtn.addEventListener('click', generateQR);

        // Download buttons
        downloadPng.addEventListener('click', () => downloadQR('png'));
        downloadSvg.addEventListener('click', () => downloadQR('svg'));
        downloadPdf.addEventListener('click', () => downloadQR('pdf'));

        // Modal
        modalClose.addEventListener('click', closeModal);
        leadModal.addEventListener('click', (e) => {
            if (e.target === leadModal) closeModal();
        });

        // Unlock premium link
        unlockPremium.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });

        // Lead form
        leadForm.addEventListener('submit', handleLeadSubmit);

        // Color pickers
        document.getElementById('qrColor').addEventListener('input', updateColorDisplay);
        document.getElementById('qrBgColor').addEventListener('input', updateColorDisplay);

        // Slider
        document.getElementById('qrSize').addEventListener('input', updateSliderValue);
    }

function switchTab(type) {
  currentType = type;

  // Update tab buttons
  tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });

  // Show/hide panels
  Object.keys(panels).forEach(key => {
    if (panels[key]) {
      panels[key].classList.toggle('hidden', key !== type);
    }
  });

  // Track analytics event
  if (window.PaperclipAnalytics) {
    window.PaperclipAnalytics.track('tab_switch', { tool: 'qr-generator', tab: type });
  }
}

    function updateColorDisplay(e) {
        const display = e.target.nextElementSibling;
        if (display) display.textContent = e.target.value;
    }

    function updateSliderValue(e) {
        const display = e.target.nextElementSibling;
        if (display) display.textContent = e.target.value + 'px';
    }

    function getContent() {
        switch (currentType) {
            case 'url':
                const url = document.getElementById('urlInput').value.trim();
                return url || null;

            case 'text':
                const text = document.getElementById('textInput').value.trim();
                return text || null;

            case 'email':
                const email = document.getElementById('emailAddress').value.trim();
                if (!email) return null;
                const subject = document.getElementById('emailSubject').value.trim();
                const body = document.getElementById('emailBody').value.trim();
                let mailto = `mailto:${email}`;
                const params = [];
                if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
                if (body) params.push(`body=${encodeURIComponent(body)}`);
                if (params.length) mailto += '?' + params.join('&');
                return mailto;

            case 'phone':
                const phone = document.getElementById('phoneInput').value.trim();
                return phone ? `tel:${phone}` : null;

            case 'wifi':
                const ssid = document.getElementById('wifiSsid').value.trim();
                const password = document.getElementById('wifiPassword').value;
                const security = document.getElementById('wifiSecurity').value;
                if (!ssid) return null;
                return `WIFI:T:${security};S:${ssid};P:${password};;`;

            case 'vcard':
                const name = document.getElementById('vcardName').value.trim();
                if (!name) return null;
                const vPhone = document.getElementById('vcardPhone').value.trim();
                const vEmail = document.getElementById('vcardEmail').value.trim();
                const org = document.getElementById('vcardOrg').value.trim();
                const url = document.getElementById('vcardUrl').value.trim();
                
                let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
                vcard += `FN:${name}\n`;
                vcard += `N:${name.split(' ').reverse().join(';')};\n`;
                if (vPhone) vcard += `TEL:${vPhone}\n`;
                if (vEmail) vcard += `EMAIL:${vEmail}\n`;
                if (org) vcard += `ORG:${org}\n`;
                if (url) vcard += `URL:${url}\n`;
                vcard += 'END:VCARD';
                return vcard;

            default:
                return null;
        }
    }

function generateQR() {
  const content = getContent();

  if (!content) {
    showError('Please enter content to generate a QR code');
    return;
  }

  // Clear previous
  qrPreview.innerHTML = '';

  // Get options
  const size = parseInt(document.getElementById('qrSize').value, 10);
  const color = document.getElementById('qrColor').value;
  const bgColor = document.getElementById('qrBgColor').value;
  const errorCorrection = document.getElementById('qrErrorCorrection').value;

  // Generate QR code
  try {
    currentQR = new QRCode(qrPreview, {
      text: content,
      width: size,
      height: size,
      colorDark: color,
      colorLight: bgColor,
      correctLevel: QRCode.CorrectLevel[errorCorrection]
    });

    // Show download options
    downloadOptions.classList.remove('hidden');

    // Track generation
    generationCount++;
    saveState();

    // Track analytics event
    if (window.PaperclipAnalytics) {
      window.PaperclipAnalytics.tool.trackGenerate('qr-generator', { type: currentType, size: size });
    }

    // Check for lead capture trigger
    if (!isPremium && generationCount >= 2) {
      setTimeout(() => openModal(), 500);
    }

  } catch (error) {
    showError('Failed to generate QR code. Please try again.');
    console.error('QR generation error:', error);
  }
}

    function downloadQR(format) {
        if (!currentQR) return;

        const img = qrPreview.querySelector('img');
        if (!img) return;

        // Check if premium feature
        if ((format === 'svg' || format === 'pdf') && !isPremium) {
            openModal();
            return;
        }

        const canvas = qrPreview.querySelector('canvas');
        const size = document.getElementById('qrSize').value;

        if (format === 'png') {
            // Download PNG
            const link = document.createElement('a');
            link.download = `qr-code-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else if (format === 'svg') {
            // For SVG, we need to create one from the canvas
            const svgData = canvasToSVG(canvas, size);
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `qr-code-${Date.now()}.svg`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        } else if (format === 'pdf') {
            // Simple PDF download using data URL
            const pdfWindow = window.open('');
            pdfWindow.document.write(`
                <html>
                <head><title>QR Code</title></head>
                <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;">
                <img src="${canvas.toDataURL('image/png')}" style="max-width:100%;max-height:100%;">
                </body>
                </html>
            `);
            pdfWindow.document.close();
            pdfWindow.print();
        }
    }

    function canvasToSVG(canvas, size) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const color = document.getElementById('qrColor').value;
        
        let paths = '';
        const moduleSize = canvas.width / size;
        
        // Simple approach: create SVG with the canvas as data URL
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${canvas.width} ${canvas.height}">
    <image href="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}"/>
</svg>`;
    }

    function openModal() {
        leadModal.classList.remove('hidden');
        leadEmail.focus();
    }

    function closeModal() {
        leadModal.classList.add('hidden');
    }

    function handleLeadSubmit(e) {
        e.preventDefault();
        
        const email = leadEmail.value.trim();
        if (!email || !isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        // Save email and mark as captured
        localStorage.setItem('qr_lead_email', email);
        localStorage.setItem(STORAGE_KEY, 'true');
        isPremium = true;
        
        // Update UI
        updatePremiumUI();
        closeModal();
        
        // Show success
        showSuccess('Premium features unlocked! You can now download SVG and PDF formats.');
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function updatePremiumUI() {
        if (isPremium) {
            downloadSvg.classList.remove('hidden');
            downloadPdf.classList.remove('hidden');
            if (unlockPremium) {
                unlockPremium.textContent = 'Premium features unlocked ✓';
                unlockPremium.style.color = '#22c55e';
                unlockPremium.style.pointerEvents = 'none';
            }
        }
    }

    function showError(message) {
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: #ef4444;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            z-index: 1001;
            font-weight: 500;
            animation: slideUp 0.3s ease;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: #22c55e;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            z-index: 1001;
            font-weight: 500;
            animation: slideUp 0.3s ease;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateX(-50%) translateY(100%); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Start
    init();
})();
