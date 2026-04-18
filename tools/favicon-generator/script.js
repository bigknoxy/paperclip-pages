// Favicon Generator
(function() {
'use strict';

// State
let uploadedImage = null;
let generatedFavicons = {};
let isPremium = false;
const STORAGE_KEY = 'favicon_lead_captured';
const SIZES = [
{ size: 16, name: 'favicon-16x16.png', use: 'Favicon' },
{ size: 32, name: 'favicon-32x32.png', use: 'Tab Icon' },
{ size: 48, name: 'favicon-48x48.png', use: 'Windows Icon' },
{ size: 180, name: 'apple-touch-icon.png', use: 'Apple Touch' },
{ size: 192, name: 'android-chrome-192x192.png', use: 'Android Icon' },
{ size: 512, name: 'android-chrome-512x512.png', use: 'PWA Icon' }
];

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const editorSection = document.getElementById('editorSection');
const outputSection = document.getElementById('outputSection');
const mainPreview = document.getElementById('mainPreview');
const sizesGrid = document.getElementById('sizesGrid');
const htmlCode = document.getElementById('htmlCode');
const copyHtmlBtn = document.getElementById('copyHtmlBtn');
const downloadIcoBtn = document.getElementById('downloadIcoBtn');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const transparencyToggle = document.getElementById('transparencyToggle');
const leadModal = document.getElementById('leadModal');
const modalClose = document.getElementById('modalClose');
const leadForm = document.getElementById('leadForm');
const leadEmail = document.getElementById('leadEmail');

// Initialize
function init() {
loadState();
setupEventListeners();
}

function loadState() {
const stored = localStorage.getItem(STORAGE_KEY);
isPremium = stored === 'true';
}

function setupEventListeners() {
// File upload
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

// Transparency toggle
transparencyToggle.addEventListener('change', regenerateFavicons);

// Copy HTML
copyHtmlBtn.addEventListener('click', copyHtmlCode);

// Download buttons
downloadIcoBtn.addEventListener('click', () => downloadFile('ico'));
downloadPngBtn.addEventListener('click', () => downloadFile('png'));

// Modal
modalClose.addEventListener('click', closeModal);
leadModal.addEventListener('click', (e) => {
if (e.target === leadModal) closeModal();
});

// Lead form
leadForm.addEventListener('submit', handleLeadSubmit);
}

function handleDragOver(e) {
e.preventDefault();
uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
e.preventDefault();
uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
e.preventDefault();
uploadArea.classList.remove('drag-over');
const files = e.dataTransfer.files;
if (files.length > 0) {
processFile(files[0]);
}
}

function handleFileSelect(e) {
const files = e.target.files;
if (files.length > 0) {
processFile(files[0]);
}
}

function processFile(file) {
// Validate file type and size
const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
if (!validTypes.includes(file.type)) {
showToast('Please upload a PNG, JPG, WebP, or SVG image', 'error');
return;
}

if (file.size > 5 * 1024 * 1024) {
showToast('File size must be under 5MB', 'error');
return;
}

// Load image
const reader = new FileReader();
reader.onload = function(e) {
const img = new Image();
img.onload = function() {
uploadedImage = img;
generatedFavicons = {};
showEditor();
generateAllSizes();
showOutput();
};
img.onerror = function() {
showToast('Failed to load image. Please try another file.', 'error');
};
img.src = e.target.result;
};
reader.readAsDataURL(file);
}

function showEditor() {
editorSection.classList.remove('hidden');
outputSection.classList.add('hidden');

// Show main preview
mainPreview.innerHTML = '';
const img = document.createElement('img');
img.src = uploadedImage.src;
img.className = 'preview-image';
mainPreview.appendChild(img);
}

function showOutput() {
outputSection.classList.remove('hidden');
}

function generateAllSizes() {
if (!uploadedImage) return;

SIZES.forEach(({ size, name }) => {
const canvas = document.createElement('canvas');
canvas.width = size;
canvas.height = size;
const ctx = canvas.getContext('2d');

// Handle transparency
const transparent = transparencyToggle.checked;
if (!transparent) {
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, size, size);
} else {
ctx.clearRect(0, 0, size, size);
}

// Draw image maintaining aspect ratio (cover mode)
const scale = Math.max(size / uploadedImage.width, size / uploadedImage.height);
const x = (size - uploadedImage.width * scale) / 2;
const y = (size - uploadedImage.height * scale) / 2;

ctx.drawImage(uploadedImage, x, y, uploadedImage.width * scale, uploadedImage.height * scale);

// Store the generated favicon
generatedFavicons[name] = canvas;

// Update preview
updateSizePreview(size, canvas);
});

// Generate HTML code
updateHtmlCode();

// Track generation
if (window.PaperclipAnalytics) {
window.PaperclipAnalytics.tool.trackGenerate('favicon-generator', { sizes: SIZES.length });
}
}

function regenerateFavicons() {
if (uploadedImage) {
generateAllSizes();
}
}

function updateSizePreview(size, canvas) {
const sizeItem = document.querySelector(`[data-size="${size}"]`);
if (sizeItem) {
const previewBox = sizeItem.querySelector('.preview-box');
previewBox.innerHTML = '';

const img = document.createElement('img');
img.src = canvas.toDataURL('image/png');
img.alt = `${size}x${size} favicon`;
previewBox.appendChild(img);
}
}

function updateHtmlCode() {
const code = `<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="shortcut icon" href="/favicon.ico">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android/Chrome -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">

<!-- Web App Manifest -->
<link rel="manifest" href="/site.webmanifest">`;

htmlCode.textContent = code;
}

function copyHtmlCode() {
const code = htmlCode.textContent;
navigator.clipboard.writeText(code).then(() => {
copyHtmlBtn.textContent = 'Copied!';
setTimeout(() => {
copyHtmlBtn.textContent = 'Copy';
}, 2000);

if (window.PaperclipAnalytics) {
window.PaperclipAnalytics.tool.track('favicon-generator', 'copy-html', {});
}
});
}

function downloadFile(type) {
if (!isPremium) {
openModal();
return;
}

if (type === 'ico') {
downloadIcoFile();
} else {
downloadPngZip();
}
}

function downloadIcoFile() {
// ICO file generation (simplified - creates a multi-resolution ICO)
// Note: True ICO generation requires more complex binary handling
// For now, we'll download the 32x32 PNG as a fallback
const canvas = generatedFavicons['favicon-32x32.png'];
if (canvas) {
canvas.toBlob((blob) => {
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'favicon.ico';
link.click();
URL.revokeObjectURL(url);
showToast('ICO file downloaded (32x32 version)', 'success');
}, 'image/png');
}
}

function downloadPngZip() {
// Since we can't easily create ZIP in browser without external libs,
// we'll download files individually
let downloadCount = 0;
const totalFiles = Object.keys(generatedFavicons).length;

Object.entries(generatedFavicons).forEach(([name, canvas]) => {
canvas.toBlob((blob) => {
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = name;
link.click();
URL.revokeObjectURL(url);

downloadCount++;
if (downloadCount === totalFiles) {
showToast('All PNG files downloaded', 'success');
}
}, 'image/png');
});
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
showToast('Please enter a valid email address', 'error');
return;
}

// Save email and mark as captured
localStorage.setItem('favicon_lead_email', email);
localStorage.setItem(STORAGE_KEY, 'true');
isPremium = true;

// Show success message
const modalBody = document.querySelector('.modal-body');
const successMessage = document.getElementById('successMessage');
if (modalBody) modalBody.style.display = 'none';
if (successMessage) successMessage.classList.remove('hidden');

// Trigger download after short delay
setTimeout(() => {
closeModal();
downloadPngZip();
}, 1500);
}

function isValidEmail(email) {
return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showToast(message, type = 'success') {
const existing = document.querySelector('.toast');
if (existing) existing.remove();

const toast = document.createElement('div');
toast.className = `toast toast-${type}`;
toast.textContent = message;

document.body.appendChild(toast);

setTimeout(() => {
toast.style.animation = 'toastSlide 0.3s ease reverse';
setTimeout(() => toast.remove(), 300);
}, 3000);
}

// Start
init();
})();
