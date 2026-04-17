// Advanced Password Generator with Entropy Analysis

// Character sets
const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const similarChars = '0O1lI';
const ambiguousSymbols = '{}[]()/\\\'"`~,;:.<>';

// Elements
const passwordOutput = document.getElementById('passwordOutput');
const lengthSlider = document.getElementById('lengthSlider');
const lengthInput = document.getElementById('lengthInput');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const entropyValue = document.getElementById('entropyValue');
const crackTime = document.getElementById('crackTime');
const leadModal = document.getElementById('leadModal');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Sync slider and input
    lengthSlider.addEventListener('input', function() {
        lengthInput.value = this.value;
        generatePassword();
    });
    
    lengthInput.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (value < 8) value = 8;
        if (value > 64) value = 64;
        this.value = value;
        lengthSlider.value = value;
        generatePassword();
    });
    
    // Checkbox changes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', generatePassword);
    });
    
    // Generate button
    document.getElementById('generateBtn').addEventListener('click', function() {
        generatePassword();
        trackGeneration();
    });
    
    // Regenerate button
    document.getElementById('regenerateBtn').addEventListener('click', function() {
        generatePassword();
        trackGeneration();
    });
    
    // Copy button
    document.getElementById('copyBtn').addEventListener('click', copyPassword);
    
    // Modal handlers
    document.querySelector('.close-btn').addEventListener('click', closeModal);
    document.getElementById('skipBtn').addEventListener('click', closeModal);
    
    leadModal.addEventListener('click', function(e) {
        if (e.target === leadModal) closeModal();
    });
    
    // Lead form
    document.getElementById('leadForm').addEventListener('submit', handleLeadSubmit);
    
    // Initial generation
    generatePassword();
});

// Generate password
function generatePassword() {
    const length = parseInt(lengthInput.value);
    const useUppercase = document.getElementById('uppercase').checked;
    const useLowercase = document.getElementById('lowercase').checked;
    const useNumbers = document.getElementById('numbers').checked;
    const useSymbols = document.getElementById('symbols').checked;
    const excludeSimilar = document.getElementById('excludeSimilar').checked;
    const easyToRead = document.getElementById('easyToRead').checked;
    
    // Build character set
    let chars = '';
    let mandatoryChars = [];
    
    if (useLowercase) {
        chars += charSets.lowercase;
        mandatoryChars.push(getRandomChar(charSets.lowercase));
    }
    if (useUppercase) {
        chars += charSets.uppercase;
        mandatoryChars.push(getRandomChar(charSets.uppercase));
    }
    if (useNumbers) {
        chars += charSets.numbers;
        mandatoryChars.push(getRandomChar(charSets.numbers));
    }
    if (useSymbols) {
        const symbolSet = easyToRead ? 
            charSets.symbols.replace(new RegExp('[' + ambiguousSymbols.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ']', 'g'), '') : 
            charSets.symbols;
        chars += symbolSet;
        mandatoryChars.push(getRandomChar(symbolSet));
    }
    
    // Exclude similar characters
    if (excludeSimilar) {
        for (let char of similarChars) {
            chars = chars.replace(char, '');
        }
    }
    
    if (chars.length === 0) {
        passwordOutput.value = '';
        updateStrength(0);
        return;
    }
    
    // Generate password
    let password = mandatoryChars.join('');
    
    for (let i = mandatoryChars.length; i < length; i++) {
        password += getRandomChar(chars);
    }
    
    // Shuffle password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    passwordOutput.value = password;
    updateAnalysis(password, chars.length);
}

// Get random character
function getRandomChar(charSet) {
    return charSet.charAt(Math.floor(Math.random() * charSet.length));
}

// Update strength and entropy
function updateAnalysis(password, poolSize) {
    const length = password.length;
    
    // Calculate entropy: log2(poolSize^length) = length * log2(poolSize)
    const entropy = Math.round(length * Math.log2(poolSize));
    
    // Update entropy display
    entropyValue.textContent = entropy;
    
    // Update strength meter
    updateStrength(entropy);
    
    // Estimate crack time
    updateCrackTime(entropy);
}

// Update strength meter
function updateStrength(entropy) {
    strengthFill.className = 'strength-fill';
    
    let strength = 'weak';
    let text = 'Weak';
    
    if (entropy >= 120) {
        strength = 'strong';
        text = 'Very Strong - Unbreakable';
    } else if (entropy >= 80) {
        strength = 'strong';
        text = 'Strong - Excellent';
    } else if (entropy >= 60) {
        strength = 'good';
        text = 'Good - Recommended';
    } else if (entropy >= 40) {
        strength = 'fair';
        text = 'Fair - Acceptable';
    } else {
        strength = 'weak';
        text = 'Weak - Not Recommended';
    }
    
    strengthFill.classList.add(strength);
    strengthText.textContent = text;
}

// Update crack time estimate
function updateCrackTime(entropy) {
    // Assuming 100 billion guesses per second (distributed attack)
    const guessesPerSecond = 100000000000;
    const combinations = Math.pow(2, entropy);
    const seconds = combinations / guessesPerSecond / 2; // Average case
    
    let time = '';
    
    if (seconds < 1) {
        time = 'Instant';
    } else if (seconds < 60) {
        time = Math.round(seconds) + ' seconds';
    } else if (seconds < 3600) {
        time = Math.round(seconds / 60) + ' minutes';
    } else if (seconds < 86400) {
        time = Math.round(seconds / 3600) + ' hours';
    } else if (seconds < 31536000) {
        time = Math.round(seconds / 86400) + ' days';
    } else if (seconds < 3153600000) {
        time = Math.round(seconds / 31536000) + ' years';
    } else if (seconds < 31536000000) {
        time = Math.round(seconds / 3153600000) + ' centuries';
    } else {
        time = 'Millennia';
    }
    
    crackTime.textContent = time;
}

// Copy password
function copyPassword() {
  if (!passwordOutput.value) return;

  passwordOutput.select();
  passwordOutput.setSelectionRange(0, 99999);

  navigator.clipboard.writeText(passwordOutput.value).then(() => {
    const originalBtn = document.getElementById('copyBtn').innerHTML;
    document.getElementById('copyBtn').innerHTML = '✓';

    setTimeout(() => {
      document.getElementById('copyBtn').innerHTML = originalBtn;
    }, 2000);

    // Track copy action
    if (window.PaperclipAnalytics) {
      PaperclipAnalytics.tool.track('password-generator', 'copy', {});
    }
  });
}

// Track password generation for lead capture and analytics
function trackGeneration() {
  const count = parseInt(localStorage.getItem('passwordGenCount') || '0') + 1;
  localStorage.setItem('passwordGenCount', count.toString());

  // Track in Paperclip Analytics
  if (window.PaperclipAnalytics) {
    PaperclipAnalytics.tool.track('password-generator', 'generate', {});
  }

  // Show lead modal after 2 generations
  if (count === 2 && !localStorage.getItem('leadCaptured')) {
    setTimeout(showLeadModal, 1000);
  }
}

// Show lead modal
function showLeadModal() {
    leadModal.classList.add('show');
}

// Close modal
function closeModal() {
    leadModal.classList.remove('show');
}

// Handle lead form submission
function handleLeadSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    
    if (email && email.includes('@')) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('leadCaptured', 'true');
        localStorage.setItem('leadCaptureTime', new Date().toISOString());
        
        document.querySelector('.modal-body').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
    }
}

// Close modal function (global)
window.closeModal = closeModal;