// Developer Time Converter JavaScript

// Timezone list
const TIMEZONES = [
{ value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 0 },
{ value: 'America/New_York', label: 'Eastern Time (ET)', offset: -5 },
{ value: 'America/Chicago', label: 'Central Time (CT)', offset: -6 },
{ value: 'America/Denver', label: 'Mountain Time (MT)', offset: -7 },
{ value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: -8 },
{ value: 'Europe/London', label: 'London (GMT)', offset: 0 },
{ value: 'Europe/Paris', label: 'Paris (CET)', offset: 1 },
{ value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 1 },
{ value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 3 },
{ value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
{ value: 'Asia/Kolkata', label: 'India (IST)', offset: 5.5 },
{ value: 'Asia/Shanghai', label: 'China (CST)', offset: 8 },
{ value: 'Asia/Tokyo', label: 'Japan (JST)', offset: 9 },
{ value: 'Asia/Seoul', label: 'Seoul (KST)', offset: 9 },
{ value: 'Australia/Sydney', label: 'Sydney (AEST)', offset: 10 },
{ value: 'Pacific/Auckland', label: 'Auckland (NZST)', offset: 12 },
{ value: 'Pacific/Honolulu', label: 'Hawaii (HST)', offset: -10 },
{ value: 'America/Toronto', label: 'Toronto (ET)', offset: -5 },
{ value: 'America/Vancouver', label: 'Vancouver (PT)', offset: -8 },
{ value: 'America/Mexico_City', label: 'Mexico City (CT)', offset: -6 },
{ value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: -3 },
{ value: 'Europe/Amsterdam', label: 'Amsterdam (CET)', offset: 1 },
{ value: 'Europe/Madrid', label: 'Madrid (CET)', offset: 1 },
{ value: 'Europe/Rome', label: 'Rome (CET)', offset: 1 },
{ value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 8 },
{ value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 8 },
{ value: 'Asia/Bangkok', label: 'Bangkok (ICT)', offset: 7 },
{ value: 'Asia/Jakarta', label: 'Jakarta (WIB)', offset: 7 },
{ value: 'Pacific/Sydney', label: 'Sydney (AEDT)', offset: 11 },
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
initTimezoneSelects();
initTabs();
initEpochConverter();
initISOConverter();
initRelativeConverter();
initTimezoneConverter();
updateLiveEpoch();
setInterval(updateLiveEpoch, 1000);
});

// Update live epoch timestamp
function updateLiveEpoch() {
const now = Math.floor(Date.now() / 1000);
document.getElementById('liveEpoch').textContent = now;
}

// Initialize timezone selects
function initTimezoneSelects() {
const fromSelect = document.getElementById('fromTimezone');
const toSelect = document.getElementById('toTimezone');

const optionsHTML = TIMEZONES.map(tz =>
`<option value="${tz.value}">${tz.label}</option>`
).join('');

fromSelect.innerHTML = optionsHTML;
toSelect.innerHTML = optionsHTML;

// Set defaults
const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
if (TIMEZONES.find(tz => tz.value === userTz)) {
fromSelect.value = userTz;
} else {
fromSelect.value = 'America/New_York';
}
toSelect.value = 'UTC';
}

// Tab switching
function initTabs() {
document.querySelectorAll('.tab-btn').forEach(btn => {
btn.addEventListener('click', function() {
document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
document.querySelectorAll('.converter-panel').forEach(p => p.classList.remove('active'));

this.classList.add('active');
document.getElementById(this.dataset.mode + 'Panel').classList.add('active');
});
});
}

// Epoch Converter
function initEpochConverter() {
const epochInput = document.getElementById('epochInput');
const epochUnit = document.getElementById('epochUnit');

epochInput.addEventListener('input', updateEpochConversion);
epochUnit.addEventListener('change', updateEpochConversion);

// Copy buttons
document.querySelectorAll('.btn-copy').forEach(btn => {
btn.addEventListener('click', function() {
const type = this.dataset.copy;
const now = type === 'seconds' ? Math.floor(Date.now() / 1000) : Date.now();
navigator.clipboard.writeText(now.toString()).then(() => {
const originalText = this.textContent;
this.textContent = 'Copied!';
this.classList.add('copied');
setTimeout(() => {
this.textContent = originalText;
this.classList.remove('copied');
}, 1500);
});
});
});

// Initial conversion
updateEpochConversion();
}

function updateEpochConversion() {
const input = document.getElementById('epochInput').value.trim();
const unit = document.getElementById('epochUnit').value;

let timestamp;
if (input) {
timestamp = unit === 'seconds' ? parseInt(input) * 1000 : parseInt(input);
} else {
timestamp = Date.now();
}

if (isNaN(timestamp)) {
document.getElementById('epochLocal').textContent = '--';
document.getElementById('epochUTC').textContent = '--';
document.getElementById('epochISO').textContent = '--';
document.getElementById('epochRelative').textContent = '--';
return;
}

const date = new Date(timestamp);

document.getElementById('epochLocal').textContent = formatLocalDate(date);
document.getElementById('epochUTC').textContent = formatUTCDate(date);
document.getElementById('epochISO').textContent = date.toISOString();
document.getElementById('epochRelative').textContent = getRelativeTime(date);
}

// ISO 8601 Converter
function initISOConverter() {
const isoInput = document.getElementById('isoInput');

isoInput.addEventListener('input', updateISOConversion);

// Quick buttons
document.querySelectorAll('.quick-btn[data-iso]').forEach(btn => {
btn.addEventListener('click', function() {
const type = this.dataset.iso;
const now = new Date();
let date;

switch(type) {
case 'now':
date = now;
break;
case 'today':
date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
break;
case 'yesterday':
date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
break;
case 'tomorrow':
date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
break;
}

isoInput.value = date.toISOString().slice(0, -1);
updateISOConversion();
});
});
}

function updateISOConversion() {
const input = document.getElementById('isoInput').value.trim();

if (!input) {
document.getElementById('isoEpochSeconds').textContent = '--';
document.getElementById('isoEpochMs').textContent = '--';
document.getElementById('isoLocal').textContent = '--';
document.getElementById('isoUTC').textContent = '--';
return;
}

const date = new Date(input);

if (isNaN(date.getTime())) {
document.getElementById('isoEpochSeconds').textContent = 'Invalid';
document.getElementById('isoEpochMs').textContent = 'Invalid';
document.getElementById('isoLocal').textContent = 'Invalid';
document.getElementById('isoUTC').textContent = 'Invalid';
return;
}

const epochMs = date.getTime();
const epochSec = Math.floor(epochMs / 1000);

document.getElementById('isoEpochSeconds').textContent = epochSec;
document.getElementById('isoEpochMs').textContent = epochMs;
document.getElementById('isoLocal').textContent = formatLocalDate(date);
document.getElementById('isoUTC').textContent = formatUTCDate(date);
}

// Relative Time Converter
function initRelativeConverter() {
const relativeInput = document.getElementById('relativeInput');

relativeInput.addEventListener('input', updateRelativeConversion);

// Quick buttons
document.querySelectorAll('.quick-btn[data-relative]').forEach(btn => {
btn.addEventListener('click', function() {
const type = this.dataset.relative;
updateRelativeFromButton(type);
});
});
}

function updateRelativeFromButton(type) {
const now = new Date();
let date;

switch(type) {
case 'now':
date = now;
break;
case '+1h':
date = new Date(now.getTime() + 60 * 60 * 1000);
break;
case '+1d':
date = new Date(now.getTime() + 24 * 60 * 60 * 1000);
break;
case '-1d':
date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
break;
case '+1w':
date = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
break;
}

document.getElementById('relativeInput').value = date.toISOString().slice(0, 19).replace('T', ' ');
updateRelativeConversion();
}

function updateRelativeConversion() {
const input = document.getElementById('relativeInput').value.trim();

if (!input) {
document.getElementById('relativeResult').textContent = '--';
document.getElementById('relativeEpoch').textContent = '--';
document.getElementById('relativeLocal').textContent = '--';
document.getElementById('relativeISO').textContent = '--';
return;
}

let date = parseDateInput(input);

if (!date || isNaN(date.getTime())) {
document.getElementById('relativeResult').textContent = 'Invalid date';
document.getElementById('relativeEpoch').textContent = '--';
document.getElementById('relativeLocal').textContent = '--';
document.getElementById('relativeISO').textContent = '--';
return;
}

const epochMs = date.getTime();
const epochSec = Math.floor(epochMs / 1000);

document.getElementById('relativeResult').textContent = getRelativeTime(date);
document.getElementById('relativeEpoch').textContent = epochSec;
document.getElementById('relativeLocal').textContent = formatLocalDate(date);
document.getElementById('relativeISO').textContent = date.toISOString();
}

function parseDateInput(input) {
// Try various formats
const patterns = [
/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, // 2024-01-01 12:00:00
/^\d{4}-\d{2}-\d{2}$/, // 2024-01-01
/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, // 2024-01-01T12:00:00
/^\d{2}\/\d{2}\/\d{4}$/, // 01/01/2024
/^\d{2}-\d{2}-\d{4}$/, // 01-01-2024
];

// Try direct parse
let date = new Date(input);
if (!isNaN(date.getTime())) return date;

// Try replacing space with T for ISO-like
if (input.includes(' ') && !input.includes('T')) {
date = new Date(input.replace(' ', 'T'));
if (!isNaN(date.getTime())) return date;
}

return null;
}

// Timezone Converter
function initTimezoneConverter() {
const tzInput = document.getElementById('tzInput');
const fromTimezone = document.getElementById('fromTimezone');
const toTimezone = document.getElementById('toTimezone');

// Set current time
const now = new Date();
const localISO = now.toISOString().slice(0, 19);
tzInput.value = localISO;

tzInput.addEventListener('input', updateTimezoneConversion);
fromTimezone.addEventListener('change', updateTimezoneConversion);
toTimezone.addEventListener('change', updateTimezoneConversion);

// Initial conversion
updateTimezoneConversion();
}

function updateTimezoneConversion() {
const input = document.getElementById('tzInput').value;
const fromTz = document.getElementById('fromTimezone').value;
const toTz = document.getElementById('toTimezone').value;

if (!input) {
document.getElementById('tzResult').textContent = '--';
document.getElementById('tzOffset').textContent = '--';
return;
}

const date = new Date(input);

if (isNaN(date.getTime())) {
document.getElementById('tzResult').textContent = 'Invalid date';
document.getElementById('tzOffset').textContent = '--';
return;
}

try {
// Convert to target timezone
const options = {
timeZone: toTz,
year: 'numeric',
month: '2-digit',
day: '2-digit',
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
hour12: false
};

const formatter = new Intl.DateTimeFormat('en-US', options);
const parts = formatter.formatToParts(date);

const converted = new Date(
parseInt(parts.find(p => p.type === 'year').value),
parseInt(parts.find(p => p.type === 'month').value) - 1,
parseInt(parts.find(p => p.type === 'day').value),
parseInt(parts.find(p => p.type === 'hour').value),
parseInt(parts.find(p => p.type === 'minute').value),
parseInt(parts.find(p => p.type === 'second').value)
);

document.getElementById('tzResult').textContent = formatLocalDate(converted);

// Calculate offset difference
const offsetDiff = getTimezoneOffset(fromTz, toTz, date);
const offsetStr = offsetDiff === 0 ? 'Same time' : 
(offsetDiff > 0 ? `+${offsetDiff} hours ahead` : `${offsetDiff} hours behind`);
document.getElementById('tzOffset').textContent = offsetStr;
} catch (e) {
document.getElementById('tzResult').textContent = 'Conversion error';
document.getElementById('tzOffset').textContent = '--';
}
}

function getTimezoneOffset(fromTz, toTz, date) {
try {
const fromDate = new Date(date.toLocaleString('en-US', { timeZone: fromTz }));
const toDate = new Date(date.toLocaleString('en-US', { timeZone: toTz }));
return (toDate - fromDate) / (1000 * 60 * 60);
} catch (e) {
return 0;
}
}

// Utility Functions
function formatLocalDate(date) {
return date.toLocaleString('en-US', {
weekday: 'short',
year: 'numeric',
month: 'short',
day: 'numeric',
hour: '2-digit',
minute: '2-digit',
second: '2-digit'
});
}

function formatUTCDate(date) {
return date.toLocaleString('en-US', {
timeZone: 'UTC',
weekday: 'short',
year: 'numeric',
month: 'short',
day: 'numeric',
hour: '2-digit',
minute: '2-digit',
second: '2-digit'
}) + ' UTC';
}

function getRelativeTime(date) {
const now = new Date();
const diffMs = date.getTime() - now.getTime();
const diffSec = Math.round(diffMs / 1000);
const diffMin = Math.round(diffSec / 60);
const diffHour = Math.round(diffMin / 60);
const diffDay = Math.round(diffHour / 24);
const diffWeek = Math.round(diffDay / 7);
const diffMonth = Math.round(diffDay / 30);
const diffYear = Math.round(diffDay / 365);

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

if (Math.abs(diffSec) < 60) {
return rtf.format(diffSec, 'second');
} else if (Math.abs(diffMin) < 60) {
return rtf.format(diffMin, 'minute');
} else if (Math.abs(diffHour) < 24) {
return rtf.format(diffHour, 'hour');
} else if (Math.abs(diffDay) < 7) {
return rtf.format(diffDay, 'day');
} else if (Math.abs(diffWeek) < 4) {
return rtf.format(diffWeek, 'week');
} else if (Math.abs(diffMonth) < 12) {
return rtf.format(diffMonth, 'month');
} else {
return rtf.format(diffYear, 'year');
}
}
