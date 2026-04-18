// Password Strength Checker with Entropy Analysis
// Analyzes passwords for security metrics, crack time estimates, and dictionary checks

// Common passwords dictionary (top 1000 most common)
const COMMON_PASSWORDS = [
'123456','password','12345678','qwerty','123456789','letmein','1234567','football','iloveyou','admin',
'welcome','monkey','login','abc123','111111','123123','password123','sunshine','master','photoshop',
'1qaz2wsx','qwertyuiop','princess','admin123','solo','starwars','dragon','baseball','football','monkey',
'696969','shadow','superman','harley','mustang','pussy','michael','jordan','killer','trustno1',
'fuckyou',' Ranger','thomas','robert','mike','hunter','jennifer','zxcvbnm','asdfgh','buster',
'soccer','ranger','batman','matrix','testing','success','hacker','killer','george','sexy',
'andrew','london','carlos','charlie','daniel','thunder','anthony','silver','google','yankees',
'spider','merlin','mickey','gateway','orange','ferrari','cowboys','martin','burn','hello',
'dave','guitar','chelsea','flower','redsox','mike','lovely','poohbear','jessica','pepper',
'angel','beach','richard','babygirl','banana','friends','matthew','liverpool','12345','password1',
'qwerty123','letmein1','welcome1','monkey1','dragon1','baseball1','football1','master1','sunshine1',
'princess1','shadow1','ashley','nicole','daniela','butterfly','flower','jasmine','peanut','ginger'
];

// Common dictionary words (simplified)
const COMMON_WORDS = [
'password','secret','admin','login','welcome','monkey','dragon','master','shadow','sunshine',
'princess','football','baseball','basketball','soccer','tennis','golf','swimming','running','walking',
'michael','jennifer','jessica','ashley','amanda','daniel','joshua','matthew','andrew','joseph',
'christopher','william','david','james','robert','john','richard','thomas','charles','daniel',
'love','hate','happy','sad','angry','peace','war','hope','dream','life',
'apple','banana','orange','grape','peach','mango','cherry','berry','melon','kiwi',
'computer','laptop','desktop','monitor','keyboard','mouse','screen','printer','scanner','camera',
'phone','mobile','tablet','device','gadget','tech','digital','online','internet','website',
'home','house','apartment','building','street','city','town','village','country','world',
'money','cash','dollar','euro','pound','price','cost','cheap','expensive','free'
];

// Keyboard sequences
const KEYBOARD_SEQUENCES = [
'qwerty','qwertz','azerty','asdfgh','zxcvbn','123456','654321','098765','abcdef','zyxwvu',
'qazwsx','wsxedc','edcrfv','rfvtgb','tgbyhn','yhnujm','ujmik','olik','plok','mnbvc',
'poiuy','lkjhg','fdsaq','1q2w3e','2w3e4r','3e4r5t','4r5t6y','5t6y7u','6y7u8i','7u8i9o'
];

// Elements
const passwordInput = document.getElementById('passwordInput');
const toggleVisibility = document.getElementById('toggleVisibility');
const eyeIcon = document.getElementById('eyeIcon');
const eyeOffIcon = document.getElementById('eyeOffIcon');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const entropyValue = document.getElementById('entropyValue');
const crackTimeValue = document.getElementById('crackTimeValue');
const poolSizeValue = document.getElementById('poolSizeValue');
const lengthValue = document.getElementById('lengthValue');
const dictionaryWarning = document.getElementById('dictionaryWarning');
const tipsList = document.getElementById('tipsList');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
// Toggle password visibility
toggleVisibility.addEventListener('click', togglePasswordVisibility);

// Real-time analysis
passwordInput.addEventListener('input', function() {
analyzePassword(this.value);
});

// Track analytics on page load
if (window.PaperclipAnalytics) {
PaperclipAnalytics.tool.track('password-strength', 'page_view', {});
}
});

// Toggle password visibility
function togglePasswordVisibility() {
const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
passwordInput.setAttribute('type', type);

if (type === 'password') {
eyeIcon.style.display = 'block';
eyeOffIcon.style.display = 'none';
} else {
eyeIcon.style.display = 'none';
eyeOffIcon.style.display = 'block';
}
}

// Main analysis function
function analyzePassword(password) {
if (!password) {
resetAnalysis();
return;
}

const analysis = calculatePasswordStrength(password);
updateUI(analysis);
}

// Reset UI when password is empty
function resetAnalysis() {
strengthFill.className = 'strength-fill';
strengthFill.style.width = '0%';
strengthText.textContent = 'Enter a password to begin analysis';
entropyValue.textContent = '0';
crackTimeValue.textContent = 'Instant';
poolSizeValue.textContent = '0';
lengthValue.textContent = '0';
dictionaryWarning.style.display = 'none';

// Reset all checks
const checks = ['length','uppercase','lowercase','numbers','symbols','unique','dictionary','sequences'];
checks.forEach(check => {
const item = document.querySelector(`[data-check="${check}"]`);
const icon = document.getElementById(`${check}Check`);
if (item) item.className = 'analysis-item';
if (icon) icon.textContent = '○';
});
}

// Calculate password strength
function calculatePasswordStrength(password) {
const length = password.length;

// Calculate character pool size
let poolSize = 0;
let hasLowercase = /[a-z]/.test(password);
let hasUppercase = /[A-Z]/.test(password);
let hasNumbers = /[0-9]/.test(password);
let hasSymbols = /[^a-zA-Z0-9]/.test(password);

if (hasLowercase) poolSize += 26;
if (hasUppercase) poolSize += 26;
if (hasNumbers) poolSize += 10;
if (hasSymbols) poolSize += 32;

// Calculate entropy
const entropy = length * Math.log2(poolSize || 1);

// Check for unique characters
const uniqueChars = new Set(password).size;
const hasRepeated = uniqueChars < length;

// Check dictionary
const isCommonPassword = COMMON_PASSWORDS.includes(password.toLowerCase());
const isCommonWord = COMMON_WORDS.some(word => password.toLowerCase().includes(word));
const hasDictionary = isCommonPassword || isCommonWord;

// Check keyboard sequences
const hasSequence = KEYBOARD_SEQUENCES.some(seq => password.toLowerCase().includes(seq));

// Calculate strength level (0-5)
let strengthLevel = 0;
if (entropy < 25) strengthLevel = 0;
else if (entropy < 40) strengthLevel = 1;
else if (entropy < 60) strengthLevel = 2;
else if (entropy < 80) strengthLevel = 3;
else if (entropy < 100) strengthLevel = 4;
else strengthLevel = 5;

// Penalties
if (hasDictionary) strengthLevel = Math.min(strengthLevel, 1);
if (hasSequence && strengthLevel > 2) strengthLevel -= 1;

// Crack time calculation
const crackTime = calculateCrackTime(entropy, hasDictionary, hasSequence);

return {
length,
entropy: Math.round(entropy),
poolSize,
hasLowercase,
hasUppercase,
hasNumbers,
hasSymbols,
hasRepeated,
hasDictionary,
isCommonPassword,
hasSequence,
strengthLevel,
crackTime
};
}

// Calculate realistic crack time
function calculateCrackTime(entropy, hasDictionary, hasSequence) {
// Modern cracking speeds (guesses per second)
const onlineRate = 100; // Online attack
const offlineRate = 100000000000; // Offline attack (100 billion/sec)

// Use offline rate for calculation (worst case)
const combinations = Math.pow(2, entropy);
const seconds = combinations / offlineRate / 2; // Average case

// If in dictionary, crack time is effectively instant
if (hasDictionary) {
return { value: 'Instant', category: 'instant' };
}

// If has keyboard sequence, significantly reduce time
let adjustedSeconds = seconds;
if (hasSequence) {
adjustedSeconds = seconds / 1000000; // Sequences reduce entropy
}

let time = '';
let category = '';

if (adjustedSeconds < 1) {
time = 'Instant';
category = 'instant';
} else if (adjustedSeconds < 60) {
time = Math.round(adjustedSeconds) + ' seconds';
category = 'seconds';
} else if (adjustedSeconds < 3600) {
time = Math.round(adjustedSeconds / 60) + ' minutes';
category = 'minutes';
} else if (adjustedSeconds < 86400) {
time = Math.round(adjustedSeconds / 3600) + ' hours';
category = 'hours';
} else if (adjustedSeconds < 31536000) {
time = Math.round(adjustedSeconds / 86400) + ' days';
category = 'days';
} else if (adjustedSeconds < 3153600000) {
time = Math.round(adjustedSeconds / 31536000) + ' years';
category = 'years';
} else if (adjustedSeconds < 31536000000) {
time = Math.round(adjustedSeconds / 3153600000) + ' centuries';
category = 'centuries';
} else {
time = 'Millennia';
category = 'millennia';
}

return { value: time, category };
}

// Update UI with analysis results
function updateUI(analysis) {
// Update strength meter
strengthFill.className = `strength-fill level-${analysis.strengthLevel}`;

// Update strength labels
const labels = document.querySelectorAll('.strength-level');
labels.forEach((label, index) => {
if (index === analysis.strengthLevel) {
label.classList.add('active');
} else {
label.classList.remove('active');
}
});

// Update strength text
const strengthLabels = [
'Very Weak - Can be cracked instantly',
'Weak - Can be cracked quickly',
'Fair - Might hold up briefly',
'Good - Decent protection',
'Strong - Very difficult to crack',
'Excellent - Practically unbreakable'
];
strengthText.textContent = strengthLabels[analysis.strengthLevel];

// Update metrics
entropyValue.textContent = analysis.entropy;
crackTimeValue.textContent = analysis.crackTime.value;
poolSizeValue.textContent = analysis.poolSize;
lengthValue.textContent = analysis.length;

// Update check indicators
updateCheckIndicator('length', analysis.length >= 12);
updateCheckIndicator('uppercase', analysis.hasUppercase);
updateCheckIndicator('lowercase', analysis.hasLowercase);
updateCheckIndicator('numbers', analysis.hasNumbers);
updateCheckIndicator('symbols', analysis.hasSymbols);
updateCheckIndicator('unique', !analysis.hasRepeated);
updateCheckIndicator('dictionary', !analysis.hasDictionary);
updateCheckIndicator('sequences', !analysis.hasSequence);

// Show/hide dictionary warning
if (analysis.isCommonPassword) {
dictionaryWarning.style.display = 'flex';
} else {
dictionaryWarning.style.display = 'none';
}

// Update tips
updateTips(analysis);
}

// Update individual check indicator
function updateCheckIndicator(checkName, passed) {
const item = document.querySelector(`[data-check="${checkName}"]`);
const icon = document.getElementById(`${checkName}Check`);

if (!item || !icon) return;

if (passed) {
item.classList.add('passed');
item.classList.remove('failed');
icon.textContent = '✓';
} else {
item.classList.add('failed');
item.classList.remove('passed');
icon.textContent = '✗';
}
}

// Update improvement tips
function updateTips(analysis) {
const tips = [];

if (analysis.length < 12) {
tips.push(`Add ${12 - analysis.length} more characters (currently ${analysis.length})`);
}
if (!analysis.hasUppercase) {
tips.push('Add uppercase letters (A-Z)');
}
if (!analysis.hasLowercase) {
tips.push('Add lowercase letters (a-z)');
}
if (!analysis.hasNumbers) {
tips.push('Add numbers (0-9)');
}
if (!analysis.hasSymbols) {
tips.push('Add symbols (!@#$%^&*)');
}
if (analysis.hasRepeated) {
tips.push('Remove repeated characters');
}
if (analysis.hasDictionary) {
tips.push('Avoid dictionary words and common passwords');
}
if (analysis.hasSequence) {
tips.push('Avoid keyboard patterns (qwerty, 123456)');
}

if (tips.length === 0) {
tips.push('Your password looks great! Consider using a password manager.');
}

tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
}

// Global functions
window.togglePasswordVisibility = togglePasswordVisibility;
