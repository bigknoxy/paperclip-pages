// Barcode & QR Code Reader
(function() {
  'use strict';

  // State
  let codeReader = null;
  let isCameraActive = false;
  let currentStream = null;
  let scanInterval = null;
  let currentResult = null;

  // DOM Elements
  const video = document.getElementById('video');
  const cameraCanvas = document.getElementById('cameraCanvas');
  const cameraContainer = document.getElementById('cameraContainer');
  const cameraPlaceholder = document.getElementById('cameraPlaceholder');
  const startCameraBtn = document.getElementById('startCameraBtn');
  const stopCameraBtn = document.getElementById('stopCameraBtn');
  const cameraSelect = document.getElementById('cameraSelect');
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const uploadPreview = document.getElementById('uploadPreview');
  const previewImage = document.getElementById('previewImage');
  const clearUploadBtn = document.getElementById('clearUploadBtn');
  const scanStatus = document.getElementById('scanStatus');
  const resultPlaceholder = document.getElementById('resultPlaceholder');
  const resultDetails = document.getElementById('resultDetails');
  const resultValue = document.getElementById('resultValue');
  const resultFormat = document.getElementById('resultFormat');
  const copyBtn = document.getElementById('copyBtn');
  const openUrlBtn = document.getElementById('openUrlBtn');
  const searchBtn = document.getElementById('searchBtn');
  const tabBtns = document.querySelectorAll('.tab-btn');

  // Initialize
  function init() {
    setupEventListeners();
    initZXing();
  }

  function initZXing() {
    try {
      if (window.ZXingBrowser) {
        codeReader = new window.ZXingBrowser.BrowserMultiFormatReader();
      }
    } catch (error) {
      console.error('Failed to initialize ZXing:', error);
      showStatus('Scanner initialization failed', 'error');
    }
  }

  function setupEventListeners() {
    // Tab switching
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // Camera controls
    startCameraBtn.addEventListener('click', startCamera);
    stopCameraBtn.addEventListener('click', stopCamera);
    cameraSelect.addEventListener('change', switchCamera);

    // Upload controls
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    clearUploadBtn.addEventListener('click', clearUpload);

    // Result actions
    copyBtn.addEventListener('click', copyResult);
  }

  // Mode Switching
  function switchMode(mode) {
    // Update tabs
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Show/hide panels
    document.getElementById('cameraPanel').classList.toggle('hidden', mode !== 'camera');
    document.getElementById('uploadPanel').classList.toggle('hidden', mode !== 'upload');

    // Stop camera if switching away
    if (mode !== 'camera' && isCameraActive) {
      stopCamera();
    }

    // Track analytics
    if (window.PaperclipAnalytics) {
      window.PaperclipAnalytics.track('mode_switch', { tool: 'barcode-reader', mode: mode });
    }
  }

  // Camera Functions
  async function startCamera() {
    try {
      if (!codeReader) {
        showStatus('Scanner not initialized', 'error');
        return;
      }

      showStatus('Requesting camera access...', 'scanning');

      // Get available cameras
      const devices = await window.ZXingBrowser.BrowserCodeReader.listVideoInputDevices();
      
      if (devices.length === 0) {
        showStatus('No camera found', 'error');
        return;
      }

      // Populate camera selector
      cameraSelect.innerHTML = '<option value="">Select camera...</option>';
      devices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.textContent = device.label || `Camera ${index + 1}`;
        cameraSelect.appendChild(option);
      });

      // Show camera selector if multiple cameras
      if (devices.length > 1) {
        cameraSelect.classList.remove('hidden');
      }

      // Start with first camera
      const firstDeviceId = devices[0].deviceId;
      cameraSelect.value = firstDeviceId;

      await startVideoStream(firstDeviceId);

    } catch (error) {
      console.error('Camera error:', error);
      if (error.name === 'NotAllowedError') {
        showStatus('Camera access denied. Please allow camera access in your browser.', 'error');
      } else if (error.name === 'NotFoundError') {
        showStatus('No camera found on this device', 'error');
      } else {
        showStatus('Failed to access camera: ' + error.message, 'error');
      }
    }
  }

  async function startVideoStream(deviceId) {
    try {
      showStatus('Starting camera...', 'scanning');

      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      currentStream = stream;
      video.srcObject = stream;

      await video.play();

      isCameraActive = true;
      cameraPlaceholder.classList.add('hidden');
      video.classList.remove('hidden');
      startCameraBtn.classList.add('hidden');
      stopCameraBtn.classList.remove('hidden');

      showStatus('Camera active - scanning...', 'scanning');

      // Start scanning loop
      startScanning();

      // Track analytics
      if (window.PaperclipAnalytics) {
        window.PaperclipAnalytics.tool.trackGenerate('barcode-reader', { mode: 'camera' });
      }

    } catch (error) {
      console.error('Stream error:', error);
      throw error;
    }
  }

  async function switchCamera() {
    const deviceId = cameraSelect.value;
    if (!deviceId) return;

    stopCameraStream();
    await startVideoStream(deviceId);
  }

  function stopCamera() {
    stopCameraStream();
    
    isCameraActive = false;
    video.classList.add('hidden');
    cameraPlaceholder.classList.remove('hidden');
    startCameraBtn.classList.remove('hidden');
    stopCameraBtn.classList.add('hidden');
    cameraSelect.classList.add('hidden');
    
    clearResult();
    showStatus('Ready to scan', 'ready');
  }

  function stopCameraStream() {
    if (scanInterval) {
      clearInterval(scanInterval);
      scanInterval = null;
    }

    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      currentStream = null;
    }

    video.srcObject = null;
  }

  function startScanning() {
    // Scan every 200ms
    scanInterval = setInterval(async () => {
      if (!isCameraActive || !codeReader) return;

      try {
        const result = await codeReader.decodeFromVideoElement(video);
        if (result) {
          handleScanResult(result);
        }
      } catch (error) {
        // No code found - this is normal, just continue scanning
      }
    }, 200);
  }

  // Upload Functions
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  }

  function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  }

  async function processImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showStatus('Please select an image file', 'error');
      return;
    }

    try {
      showStatus('Processing image...', 'scanning');

      // Display preview
      const imageUrl = URL.createObjectURL(file);
      previewImage.src = imageUrl;
      uploadArea.classList.add('hidden');
      uploadPreview.classList.remove('hidden');

      // Decode barcode from image
      if (!codeReader) {
        showStatus('Scanner not initialized', 'error');
        return;
      }

      const result = await codeReader.decodeFromImageUrl(imageUrl);
      
      if (result) {
        handleScanResult(result);
      } else {
        showStatus('No barcode found in image', 'error');
      }

      // Track analytics
      if (window.PaperclipAnalytics) {
        window.PaperclipAnalytics.tool.trackGenerate('barcode-reader', { mode: 'upload' });
      }

    } catch (error) {
      console.error('Image processing error:', error);
      showStatus('Failed to read barcode from image. Try a clearer image.', 'error');
    }
  }

  function clearUpload() {
    fileInput.value = '';
    previewImage.src = '';
    uploadPreview.classList.add('hidden');
    uploadArea.classList.remove('hidden');
    clearResult();
    showStatus('Ready to scan', 'ready');
  }

  // Result Handling
  function handleScanResult(result) {
    if (!result || !result.text) return;

    // Avoid duplicate results
    if (currentResult && currentResult.text === result.text) {
      return;
    }

    currentResult = result;

    // Update UI
    resultPlaceholder.classList.add('hidden');
    resultDetails.classList.remove('hidden');

    resultValue.textContent = result.text;
    resultFormat.textContent = result.format || 'Unknown';
    showStatus('Barcode detected!', 'success');

    // Determine result type and show appropriate actions
    setupResultActions(result.text);

    // Vibrate on mobile (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Play subtle sound (optional)
    playSuccessSound();
  }

  function setupResultActions(text) {
    // Check if it's a URL
    const isUrl = /^https?:\/\//i.test(text);
    
    if (isUrl) {
      openUrlBtn.href = text;
      openUrlBtn.classList.remove('hidden');
    } else {
      openUrlBtn.classList.add('hidden');
    }

    // Set up search link
    searchBtn.href = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
    searchBtn.classList.remove('hidden');
  }

  function clearResult() {
    currentResult = null;
    resultPlaceholder.classList.remove('hidden');
    resultDetails.classList.add('hidden');
    resultValue.textContent = '';
    resultFormat.textContent = '';
    openUrlBtn.classList.add('hidden');
    searchBtn.classList.add('hidden');
  }

  async function copyResult() {
    if (!currentResult) return;

    try {
      await navigator.clipboard.writeText(currentResult.text);
      showStatus('Copied to clipboard!', 'success');
    } catch (error) {
      showStatus('Failed to copy', 'error');
    }
  }

  // UI Helpers
  function showStatus(message, type) {
    scanStatus.textContent = message;
    scanStatus.className = 'scan-status';
    
    if (type) {
      scanStatus.classList.add(type);
    }
  }

  function playSuccessSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Audio not critical, ignore errors
    }
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    stopCameraStream();
  });

  // Start
  init();
})();
