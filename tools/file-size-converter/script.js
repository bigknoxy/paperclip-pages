// File Size Converter JavaScript

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
const UNIT_NAMES = {
  'B': 'Bytes',
  'KB': 'Kilobytes',
  'MB': 'Megabytes',
  'GB': 'Gigabytes',
  'TB': 'Terabytes',
  'PB': 'Petabytes'
};

// Comparison references (in bytes)
const COMPARISONS = [
  { id: 'doc', name: 'Text Document', size: 5 * 1024, icon: '📄' },
  { id: 'photo', name: 'Photo', size: 2 * 1024 * 1024, icon: '🖼️' },
  { id: 'music', name: 'MP3 Song', size: 5 * 1024 * 1024, icon: '🎵' },
  { id: 'video', name: 'HD Video (1 min)', size: 100 * 1024 * 1024, icon: '🎬' },
  { id: 'cd', name: 'CD/DVD', size: 700 * 1024 * 1024, icon: '💿' },
  { id: 'usb', name: 'USB Drive', size: 32 * 1024 * 1024 * 1024, icon: '💾' },
  { id: 'ssd', name: 'SSD Drive', size: 500 * 1024 * 1024 * 1024, icon: '🖥️' },
  { id: 'cloud', name: 'Cloud Storage', size: 15 * 1024 * 1024 * 1024, icon: '☁️' }
];

let currentBase = 1024;
let currentBytes = 0;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  initBaseToggle();
  initInput();
  initCopyButtons();
  initPresets();
  
  // Set default value
  document.getElementById('sizeInput').value = '1024';
  document.getElementById('fromUnit').value = 'KB';
  calculate();
});

// Initialize base toggle
function initBaseToggle() {
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentBase = parseInt(this.dataset.base);
      calculate();
    });
  });
}

// Initialize input
function initInput() {
  const sizeInput = document.getElementById('sizeInput');
  const fromUnit = document.getElementById('fromUnit');
  
  sizeInput.addEventListener('input', calculate);
  fromUnit.addEventListener('change', calculate);
}

// Initialize copy buttons
function initCopyButtons() {
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', function() {
      const unit = this.dataset.copy;
      const value = document.getElementById('result' + unit).textContent;
      if (value && value !== '--') {
        navigator.clipboard.writeText(value).then(() => {
          const originalText = this.textContent;
          this.textContent = 'Copied!';
          this.classList.add('copied');
          setTimeout(() => {
            this.textContent = originalText;
            this.classList.remove('copied');
          }, 1500);
        });
      }
    });
  });
}

// Initialize presets
function initPresets() {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const size = this.dataset.size;
      const unit = this.dataset.unit;
      
      document.getElementById('sizeInput').value = size;
      document.getElementById('fromUnit').value = unit;
      calculate();
    });
  });
}

// Calculate all conversions
function calculate() {
  const input = document.getElementById('sizeInput');
  const fromUnit = document.getElementById('fromUnit');
  
  const value = parseFloat(input.value);
  if (isNaN(value) || value < 0) {
    clearResults();
    return;
  }
  
  // Convert input to bytes
  const unitIndex = UNITS.indexOf(fromUnit.value);
  currentBytes = value * Math.pow(currentBase, unitIndex);
  
  // Calculate all conversions
  UNITS.forEach((unit, index) => {
    const converted = currentBytes / Math.pow(currentBase, index);
    const element = document.getElementById('result' + unit);
    
    if (converted >= 1 || index === 0) {
      element.textContent = formatNumber(converted);
    } else if (converted > 0) {
      element.textContent = converted.toExponential(4);
    } else {
      element.textContent = '0';
    }
  });
  
  // Update visual comparisons
  updateComparisons();
}

// Format number for display
function formatNumber(num) {
  if (num >= 1000000000000) {
    return num.toExponential(4);
  }
  if (num >= 1) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 4 });
  }
  return num.toFixed(6);
}

// Clear all results
function clearResults() {
  UNITS.forEach(unit => {
    document.getElementById('result' + unit).textContent = '--';
  });
  currentBytes = 0;
  updateComparisons();
}

// Update visual comparison bars
function updateComparisons() {
  const maxBarWidth = 100;
  
  // Find the largest comparison value for scaling
  const maxComparison = Math.max(...COMPARISONS.map(c => c.size));
  
  COMPARISONS.forEach(comp => {
    const bar = document.getElementById('bar-' + comp.id);
    const item = bar.closest('.comparison-item');
    
    if (currentBytes > 0) {
      // Calculate percentage relative to the current input
      const percentage = Math.min((currentBytes / comp.size) * 100, maxBarWidth);
      bar.style.width = percentage + '%';
      
      // Highlight if input matches this range
      const ratio = currentBytes / comp.size;
      if (ratio >= 0.5 && ratio <= 2) {
        item.classList.add('highlighted');
      } else {
        item.classList.remove('highlighted');
      }
    } else {
      bar.style.width = '0%';
      item.classList.remove('highlighted');
    }
  });
}

// Get human-readable size string
function getHumanReadableSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = currentBase;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
