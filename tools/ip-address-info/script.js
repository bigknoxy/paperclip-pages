/**
 * IP Address Info Tool
 * IPv4/IPv6 validation, subnet calculator, CIDR support, IP type detection
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
initTabs();
initValidation();
initSubnetCalculator();
initCidrCalculator();
initMyIpPanel();
});

// Tab switching
function initTabs() {
document.querySelectorAll('.tab-btn').forEach(btn => {
btn.addEventListener('click', function() {
const mode = this.dataset.mode;

// Update active tab
document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
document.querySelectorAll('.converter-panel').forEach(p => p.classList.remove('active'));

this.classList.add('active');
document.getElementById(mode + 'Panel').classList.add('active');

// Trigger panel-specific initialization
if (mode === 'myip') {
fetchMyIp();
}
});
});
}

// ==================== IP VALIDATION ====================

function initValidation() {
const ipInput = document.getElementById('ipInput');
const clearBtn = document.getElementById('clearIpBtn');

ipInput.addEventListener('input', function() {
validateIp(this.value.trim());
});

clearBtn.addEventListener('click', function() {
ipInput.value = '';
validateIp('');
ipInput.focus();
});

// Validate empty initially
validateIp('');
}

function validateIp(ip) {
const statusEl = document.getElementById('validationStatus');
const detailsEl = document.getElementById('ipDetails');

if (!ip) {
statusEl.className = 'result-status unknown';
statusEl.innerHTML = '<span class="status-icon">❓</span><span class="status-text">Enter an IP address to validate</span>';
detailsEl.style.display = 'none';
document.getElementById('ipInput').className = '';
return;
}

const result = analyzeIp(ip);

if (result.valid) {
statusEl.className = 'result-status valid';
statusEl.innerHTML = `<span class="status-icon">✓</span><span class="status-text">Valid ${result.version.toUpperCase()} Address</span>`;
document.getElementById('ipInput').className = 'valid';
displayIpDetails(result);
detailsEl.style.display = 'block';
} else {
statusEl.className = 'result-status invalid';
statusEl.innerHTML = `<span class="status-icon">✗</span><span class="status-text">Invalid IP Address: ${result.error}</span>`;
document.getElementById('ipInput').className = 'invalid';
detailsEl.style.display = 'none';
}
}

function analyzeIp(ip) {
// Try IPv4 first
const ipv4Result = analyzeIPv4(ip);
if (ipv4Result.valid) return ipv4Result;

// Try IPv6
const ipv6Result = analyzeIPv6(ip);
if (ipv6Result.valid) return ipv6Result;

return { valid: false, error: 'Not a valid IPv4 or IPv6 address' };
}

function analyzeIPv4(ip) {
const parts = ip.split('.');
if (parts.length !== 4) {
return { valid: false, error: 'IPv4 must have 4 octets' };
}

const octets = [];
for (const part of parts) {
// Check for leading zeros (invalid in strict parsing)
if (part.length > 1 && part[0] === '0') {
return { valid: false, error: 'IPv4 octets cannot have leading zeros' };
}

const num = parseInt(part, 10);
if (isNaN(num) || num < 0 || num > 255 || part === '') {
return { valid: false, error: 'Each octet must be 0-255' };
}
octets.push(num);
}

const integer = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
const binary = octets.map(o => o.toString(2).padStart(8, '0')).join('.');

return {
valid: true,
version: 'ipv4',
ip: ip,
octets: octets,
integer: integer >>> 0, // Unsigned
binary: binary,
type: detectIPv4Type(octets),
reverseDns: octets.slice().reverse().join('.') + '.in-addr.arpa'
};
}

function analyzeIPv6(ip) {
// Handle compressed notation
let expanded = ip;

// Check for double colon
if (ip.includes('::')) {
const parts = ip.split('::');
if (parts.length !== 2) {
return { valid: false, error: 'IPv6 can only have one :: compression' };
}

const left = parts[0] ? parts[0].split(':') : [];
const right = parts[1] ? parts[1].split(':') : [];
const missing = 8 - left.length - right.length;

if (missing < 0) {
return { valid: false, error: 'Too many groups in IPv6 address' };
}

const middle = Array(missing).fill('0000');
expanded = [...left, ...middle, ...right].join(':');
}

const groups = expanded.split(':');
if (groups.length !== 8) {
return { valid: false, error: 'IPv6 must have 8 groups' };
}

const hexGroups = [];
for (const group of groups) {
if (!/^[0-9a-fA-F]{1,4}$/.test(group)) {
return { valid: false, error: 'Invalid hex group in IPv6' };
}
hexGroups.push(group.toLowerCase().padStart(4, '0'));
}

// Check for embedded IPv4 at end
let hasEmbeddedIPv4 = false;
let embeddedIPv4 = null;

// Build full address
const fullHex = hexGroups.join('');
const integer = BigInt('0x' + fullHex);

return {
valid: true,
version: 'ipv6',
ip: ip,
expanded: hexGroups.join(':'),
hexGroups: hexGroups,
integer: integer.toString(),
fullHex: fullHex,
type: detectIPv6Type(hexGroups),
reverseDns: buildIPv6ReverseDNS(hexGroups)
};
}

function detectIPv4Type(octets) {
const [a, b, c, d] = octets;

// Loopback: 127.0.0.0/8
if (a === 127) return 'Loopback';

// Private ranges
if (a === 10) return 'Private (Class A)';
if (a === 172 && b >= 16 && b <= 31) return 'Private (Class B)';
if (a === 192 && b === 168) return 'Private (Class C)';

// Link-local: 169.254.0.0/16
if (a === 169 && b === 254) return 'Link-Local';

// Multicast: 224.0.0.0/4
if (a >= 224 && a <= 239) return 'Multicast';

// Reserved/broadcast
if (a === 255 && b === 255 && c === 255 && d === 255) return 'Broadcast';
if (a >= 240) return 'Reserved/Experimental';

// Default route
if (a === 0) return 'Default/Current Network';

return 'Public';
}

function detectIPv6Type(hexGroups) {
const first = parseInt(hexGroups[0], 16);

// Loopback: ::1
if (hexGroups.every(g => g === '0000') || 
(hexGroups.slice(0, 7).every(g => g === '0000') && hexGroups[7] === '0001')) {
return 'Loopback';
}

// Link-local: fe80::/10
if ((first & 0xffc0) === 0xfe80) return 'Link-Local';

// Unique local: fc00::/7
if ((first & 0xfe00) === 0xfc00) return 'Unique Local (Private)';

// Multicast: ff00::/8
if ((first & 0xff00) === 0xff00) return 'Multicast';

// Documentation ranges
if (hexGroups[0] === '2001' && hexGroups[1] === '0db8') return 'Documentation';

// Global unicast
return 'Global Unicast';
}

function buildIPv6ReverseDNS(hexGroups) {
const nibbles = hexGroups
.join('')
.split('')
.reverse()
.join('.');
return nibbles + '.ip6.arpa';
}

function displayIpDetails(result) {
// Version
const versionEl = document.getElementById('detailVersion');
versionEl.textContent = result.version.toUpperCase();

// Type
const typeEl = document.getElementById('detailType');
typeEl.textContent = result.type;

// Binary
const binaryEl = document.getElementById('detailBinary');
binaryEl.textContent = result.version === 'ipv4' ? result.binary : 'N/A (128-bit)';

// Octets (IPv4 only)
const octetDetail = document.getElementById('octetDetail');
const hexDetail = document.getElementById('hexDetail');

if (result.version === 'ipv4') {
octetDetail.style.display = 'block';
hexDetail.style.display = 'none';
document.getElementById('detailOctets').textContent = result.octets.join('.');
} else {
octetDetail.style.display = 'none';
hexDetail.style.display = 'block';
document.getElementById('detailHex').textContent = result.hexGroups.join(':');
}

// Integer
const intEl = document.getElementById('detailInteger');
intEl.textContent = result.integer.toString();

// Reverse DNS
const reverseEl = document.getElementById('detailReverseDNS');
reverseEl.textContent = result.reverseDns;

// Flags
const flags = {
private: result.type.toLowerCase().includes('private'),
loopback: result.type === 'Loopback',
multicast: result.type === 'Multicast',
reserved: result.type === 'Reserved/Experimental' || result.type === 'Documentation',
broadcast: result.type === 'Broadcast',
linklocal: result.type === 'Link-Local'
};

for (const [flag, isSet] of Object.entries(flags)) {
const el = document.querySelector(`[data-flag="${flag}"]`);
if (el) {
el.textContent = isSet ? 'Yes' : 'No';
el.className = 'flag-value ' + (isSet ? 'yes' : 'no');
}
}
}

// ==================== SUBNET CALCULATOR ====================

function initSubnetCalculator() {
const ipInput = document.getElementById('subnetIpInput');
const maskInput = document.getElementById('subnetMaskInput');

ipInput.addEventListener('input', calculateSubnet);
maskInput.addEventListener('input', calculateSubnet);

// Quick mask buttons
document.querySelectorAll('.quick-btn[data-mask]').forEach(btn => {
btn.addEventListener('click', function() {
maskInput.value = this.dataset.mask;
calculateSubnet();
});
});

// Copy buttons
document.querySelectorAll('[data-copy]').forEach(btn => {
btn.addEventListener('click', function() {
copyToClipboard(getSubnetValue(this.dataset.copy));
showCopyFeedback(this);
});
});
}

function calculateSubnet() {
const ipInput = document.getElementById('subnetIpInput').value.trim();
const maskInput = document.getElementById('subnetMaskInput').value.trim();
const resultEl = document.getElementById('subnetResult');
const visualEl = document.getElementById('subnetVisual');

if (!ipInput || !maskInput) {
resultEl.style.display = 'none';
visualEl.style.display = 'none';
return;
}

// Parse IP
const ipParts = ipInput.split('.');
if (ipParts.length !== 4) return;

const ipOctets = ipParts.map(p => parseInt(p, 10));
if (ipOctets.some(o => isNaN(o) || o < 0 || o > 255)) return;

// Parse mask
let maskOctets;
if (maskInput.startsWith('/')) {
const prefix = parseInt(maskInput.slice(1), 10);
if (isNaN(prefix) || prefix < 0 || prefix > 32) return;
maskOctets = cidrToOctets(prefix);
} else {
const maskParts = maskInput.split('.');
if (maskParts.length !== 4) return;
maskOctets = maskParts.map(p => parseInt(p, 10));
if (maskOctets.some(o => isNaN(o) || o < 0 || o > 255)) return;
}

// Calculate network
const networkOctets = ipOctets.map((octet, i) => octet & maskOctets[i]);
const wildcardOctets = maskOctets.map(o => 255 - o);
const broadcastOctets = networkOctets.map((octet, i) => octet | wildcardOctets[i]);

// Calculate usable range
const prefix = octetsToCidr(maskOctets);
const totalHosts = Math.pow(2, 32 - prefix);
const usableHosts = totalHosts <= 2 ? 0 : totalHosts - 2;

const firstUsable = totalHosts <= 2 ? networkOctets : [...networkOctets.slice(0, 3), networkOctets[3] + 1];
const lastUsable = totalHosts <= 2 ? broadcastOctets : [...broadcastOctets.slice(0, 3), broadcastOctets[3] - 1];

// Display results
updateSubnetDisplay({
network: networkOctets.join('.'),
broadcast: broadcastOctets.join('.'),
mask: maskOctets.join('.'),
cidr: '/' + prefix,
first: usableHosts > 0 ? firstUsable.join('.') : 'N/A',
last: usableHosts > 0 ? lastUsable.join('.') : 'N/A',
hosts: usableHosts.toLocaleString(),
total: totalHosts.toLocaleString(),
range: usableHosts > 0 ? `${firstUsable.join('.')} - ${lastUsable.join('.')}` : 'N/A',
wildcard: wildcardOctets.join('.'),
totalHosts: totalHosts,
usableHosts: usableHosts
});

resultEl.style.display = 'block';
visualEl.style.display = 'block';
}

function cidrToOctets(prefix) {
const octets = [];
for (let i = 0; i < 4; i++) {
const bits = Math.min(8, Math.max(0, prefix - i * 8));
octets.push(0xff << (8 - bits) & 0xff);
}
return octets;
}

function octetsToCidr(octets) {
let prefix = 0;
for (const octet of octets) {
let bits = octet;
while (bits & 0x80) {
prefix++;
bits <<= 1;
}
if (bits !== 0) return -1; // Invalid mask
}
return prefix;
}

function updateSubnetDisplay(data) {
document.getElementById('subnetNetwork').textContent = data.network;
document.getElementById('subnetBroadcast').textContent = data.broadcast;
document.getElementById('subnetMask').textContent = data.mask;
document.getElementById('subnetCidr').textContent = data.cidr;
document.getElementById('subnetFirst').textContent = data.first;
document.getElementById('subnetLast').textContent = data.last;
document.getElementById('subnetHosts').textContent = data.hosts;
document.getElementById('subnetTotal').textContent = data.total;
document.getElementById('subnetRange').textContent = data.range;
document.getElementById('subnetWildcard').textContent = data.wildcard;

// Update visualization
const networkPct = (1 / data.totalHosts) * 100;
const broadcastPct = (1 / data.totalHosts) * 100;
const usablePct = ((data.totalHosts - 2) / data.totalHosts) * 100;

document.getElementById('visualNetwork').style.width = networkPct + '%';
document.getElementById('visualBroadcast').style.width = broadcastPct + '%';
document.getElementById('visualUsable').style.width = usablePct + '%';
document.getElementById('legendUsable').textContent = `Usable Hosts (${data.usableHosts.toLocaleString()})`;
}

function getSubnetValue(key) {
const map = {
network: 'subnetNetwork',
broadcast: 'subnetBroadcast',
mask: 'subnetMask',
cidr: 'subnetCidr',
first: 'subnetFirst',
last: 'subnetLast'
};
return document.getElementById(map[key])?.textContent || '';
}

// ==================== CIDR CALCULATOR ====================

function initCidrCalculator() {
const cidrInput = document.getElementById('cidrInput');

cidrInput.addEventListener('input', function() {
calculateCidr(this.value.trim());
});

// Quick CIDR buttons
document.querySelectorAll('.quick-btn[data-cidr]').forEach(btn => {
btn.addEventListener('click', function() {
cidrInput.value = this.dataset.cidr;
calculateCidr(cidrInput.value);
});
});

// Copy buttons
if (!document.querySelector('[data-copy-cidr]')) {
document.querySelectorAll('[data-copy-cidr]').forEach(btn => {
btn.addEventListener('click', function() {
copyToClipboard(getCidrValue(this.dataset.copyCidr));
showCopyFeedback(this);
});
});
}
}

function calculateCidr(cidr) {
const resultEl = document.getElementById('cidrResult');
const subnetsEl = document.getElementById('cidrSubnets');

if (!cidr || !cidr.includes('/')) {
resultEl.style.display = 'none';
subnetsEl.style.display = 'none';
return;
}

const [ipPart, prefixPart] = cidr.split('/');
const prefix = parseInt(prefixPart, 10);

if (isNaN(prefix) || prefix < 0 || prefix > 32) {
resultEl.style.display = 'none';
subnetsEl.style.display = 'none';
return;
}

// Parse IP
const ipParts = ipPart.split('.');
if (ipParts.length !== 4) {
resultEl.style.display = 'none';
subnetsEl.style.display = 'none';
return;
}

const ipOctets = ipParts.map(p => parseInt(p, 10));
if (ipOctets.some(o => isNaN(o) || o < 0 || o > 255)) {
resultEl.style.display = 'none';
subnetsEl.style.display = 'none';
return;
}

const maskOctets = cidrToOctets(prefix);
const wildcardOctets = maskOctets.map(o => 255 - o);
const networkOctets = ipOctets.map((octet, i) => octet & maskOctets[i]);
const broadcastOctets = networkOctets.map((octet, i) => octet | wildcardOctets[i]);

const totalHosts = Math.pow(2, 32 - prefix);
const usableHosts = totalHosts <= 2 ? 0 : totalHosts - 2;

const firstUsable = totalHosts <= 2 ? networkOctets : [...networkOctets.slice(0, 3), networkOctets[3] + 1];
const lastUsable = totalHosts <= 2 ? broadcastOctets : [...broadcastOctets.slice(0, 3), broadcastOctets[3] - 1];

// Display results
document.getElementById('cidrNetwork').textContent = networkOctets.join('.');
document.getElementById('cidrBroadcast').textContent = broadcastOctets.join('.');
document.getElementById('cidrMask').textContent = maskOctets.join('.');
document.getElementById('cidrPrefix').textContent = '/' + prefix;
document.getElementById('cidrFirst').textContent = usableHosts > 0 ? firstUsable.join('.') : 'N/A';
document.getElementById('cidrLast').textContent = usableHosts > 0 ? lastUsable.join('.') : 'N/A';
document.getElementById('cidrTotal').textContent = totalHosts.toLocaleString();
document.getElementById('cidrUsable').textContent = usableHosts.toLocaleString();
document.getElementById('cidrRange').textContent = usableHosts > 0 
? `${firstUsable.join('.')} - ${lastUsable.join('.')}`
: 'N/A';

// Generate subnet breakdown for larger prefixes
if (prefix >= 16 && prefix <= 30) {
generateSubnetBreakdown(networkOctets, prefix);
subnetsEl.style.display = 'block';
} else {
subnetsEl.style.display = 'none';
}

resultEl.style.display = 'block';
}

function generateSubnetBreakdown(networkOctets, prefix) {
const container = document.getElementById('subnetsTable');

// For larger blocks, show /24 breakdown
if (prefix <= 24) {
const subnets = [];
const numSubnets = Math.pow(2, 24 - prefix);
const baseThird = networkOctets[2];

for (let i = 0; i < Math.min(numSubnets, 16); i++) {
const subnetNetwork = [...networkOctets.slice(0, 2), baseThird + i, 0];
const subnetBroadcast = [...networkOctets.slice(0, 2), baseThird + i, 255];
subnets.push({
num: i + 1,
network: subnetNetwork.join('.'),
broadcast: subnetBroadcast.join('.')
});
}

let html = `
<div class="subnet-row header">
<div>#</div>
<div>Network</div>
<div>Broadcast</div>
</div>
`;

for (const s of subnets) {
html += `
<div class="subnet-row">
<div>${s.num}</div>
<div>${s.network}</div>
<div>${s.broadcast}</div>
</div>
`;
}

if (numSubnets > 16) {
html += `
<div class="subnet-row">
<div>...</div>
<div>+${numSubnets - 16} more subnets</div>
<div>...</div>
</div>
`;
}

container.innerHTML = html;
} else {
// For /25 to /30, show individual subnets
const subnets = [];
const numSubnets = Math.pow(2, 30 - prefix);
const increment = Math.pow(2, 32 - prefix);
const networkInt = (networkOctets[0] << 24) | (networkOctets[1] << 16) | (networkOctets[2] << 8) | networkOctets[3];

for (let i = 0; i < numSubnets; i++) {
const subnetInt = networkInt + (i * increment);
const subnetOctets = [
(subnetInt >>> 24) & 0xff,
(subnetInt >>> 16) & 0xff,
(subnetInt >>> 8) & 0xff,
subnetInt & 0xff
];
const broadcastInt = subnetInt + increment - 1;
const broadcastOctets = [
(broadcastInt >>> 24) & 0xff,
(broadcastInt >>> 16) & 0xff,
(broadcastInt >>> 8) & 0xff,
broadcastInt & 0xff
];
subnets.push({
num: i + 1,
network: subnetOctets.join('.'),
broadcast: broadcastOctets.join('.')
});
}

let html = `
<div class="subnet-row header">
<div>#</div>
<div>Network</div>
<div>Broadcast</div>
</div>
`;

for (const s of subnets) {
html += `
<div class="subnet-row">
<div>${s.num}</div>
<div>${s.network}</div>
<div>${s.broadcast}</div>
</div>
`;
}

container.innerHTML = html;
}
}

function getCidrValue(key) {
const map = {
network: 'cidrNetwork',
broadcast: 'cidrBroadcast',
mask: 'cidrMask',
first: 'cidrFirst',
last: 'cidrLast'
};
return document.getElementById(map[key])?.textContent || '';
}

// ==================== MY IP PANEL ====================

function initMyIpPanel() {
document.getElementById('copyMyIp').addEventListener('click', function() {
const ip = document.getElementById('myipAddress').textContent;
if (ip && ip !== '--') {
copyToClipboard(ip);
showCopyFeedback(this, 'Copied!', 1500);
}
});

document.getElementById('retryMyIp').addEventListener('click', fetchMyIp);

// Detect local IP via WebRTC
detectLocalIpWebRTC();
}

async function fetchMyIp() {
const loadingEl = document.getElementById('myipLoading');
const resultEl = document.getElementById('myipResult');
const errorEl = document.getElementById('myipError');

loadingEl.style.display = 'block';
resultEl.style.display = 'none';
errorEl.style.display = 'none';

// Set local info immediately
document.getElementById('localHostname').textContent = window.location.hostname || 'N/A';
document.getElementById('localLanguage').textContent = navigator.language || 'N/A';
document.getElementById('localScreen').textContent = `${window.screen.width}x${window.screen.height}`;

try {
// Try multiple IP APIs with fallback
let data = null;
const apis = [
'https://ipapi.co/json/',
'https://ipinfo.io/json',
'https://api.ipify.org?format=json'
];

for (const api of apis) {
try {
const response = await fetch(api, { timeout: 5000 });
if (response.ok) {
data = await response.json();
break;
}
} catch (e) {
continue;
}
}

if (!data) {
throw new Error('All IP APIs failed');
}

// Extract IP (different APIs use different field names)
const ip = data.ip || data.query || data.origin;
const version = ip && ip.includes(':') ? 'IPv6' : 'IPv4';

// Update display
document.getElementById('myipAddress').textContent = ip;
document.getElementById('myipVersion').textContent = version;
document.getElementById('myipIsp').textContent = data.org || data.asn?.name || data.isp || 'Unknown';
document.getElementById('myipCountry').textContent = data.country_name || data.country || 'Unknown';
document.getElementById('myipRegion').textContent = data.region || data.region_code || 'Unknown';
document.getElementById('myipCity').textContent = data.city || 'Unknown';
document.getElementById('myipTimezone').textContent = data.timezone || 'Unknown';

// Coordinates
const lat = data.latitude || data.loc?.split(',')[0];
const lon = data.longitude || data.loc?.split(',')[1];
document.getElementById('myipCoords').textContent = lat && lon ? `${lat}, ${lon}` : 'Unknown';

// User agent (truncated)
const ua = navigator.userAgent;
document.getElementById('myipUserAgent').textContent = ua.length > 80 ? ua.substring(0, 80) + '...' : ua;

loadingEl.style.display = 'none';
resultEl.style.display = 'block';

} catch (error) {
loadingEl.style.display = 'none';
errorEl.style.display = 'block';
}
}

async function detectLocalIpWebRTC() {
try {
const pc = new RTCPeerConnection({
iceServers: []
});

pc.createDataChannel('');

pc.onicecandidate = (e) => {
if (!e.candidate) return;

const ipMatch = /([0-9]{1,3}\.){3}[0-9]{1,3}/.exec(e.candidate.candidate);
if (ipMatch) {
document.getElementById('localIpWebRTC').textContent = ipMatch[0];
pc.close();
}
};

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

// Timeout fallback
setTimeout(() => {
if (pc.connectionState !== 'closed') {
document.getElementById('localIpWebRTC').textContent = 'Not detected';
pc.close();
}
}, 3000);

} catch (e) {
document.getElementById('localIpWebRTC').textContent = 'Not available';
}
}

// ==================== UTILITIES ====================

function copyToClipboard(text) {
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(text).catch(() => {
// Fallback
copyFallback(text);
});
} else {
copyFallback(text);
}
}

function copyFallback(text) {
const textarea = document.createElement('textarea');
textarea.value = text;
textarea.style.position = 'fixed';
textarea.style.opacity = '0';
document.body.appendChild(textarea);
textarea.select();
try {
document.execCommand('copy');
} catch (e) {}
document.body.removeChild(textarea);
}

function showCopyFeedback(btn, text = 'Copied!', duration = 1500) {
const originalText = btn.textContent;
btn.textContent = text;
btn.classList.add('copied');
setTimeout(() => {
btn.textContent = originalText;
btn.classList.remove('copied');
}, duration);
}
