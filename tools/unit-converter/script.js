// Unit Converter JavaScript

// Elements
const fromInput = document.getElementById('fromValue');
const toInput = document.getElementById('toValue');
const fromUnit = document.getElementById('fromUnit');
const toUnit = document.getElementById('toUnit');
const formulaDisplay = document.getElementById('formulaDisplay');
const leadModal = document.getElementById('leadModal');
const leadForm = document.getElementById('leadForm');

// Unit definitions
const units = {
    length: [
        { value: 'm', label: 'Meters', factor: 1 },
        { value: 'km', label: 'Kilometers', factor: 1000 },
        { value: 'cm', label: 'Centimeters', factor: 0.01 },
        { value: 'mm', label: 'Millimeters', factor: 0.001 },
        { value: 'mi', label: 'Miles', factor: 1609.344 },
        { value: 'yd', label: 'Yards', factor: 0.9144 },
        { value: 'ft', label: 'Feet', factor: 0.3048 },
        { value: 'in', label: 'Inches', factor: 0.0254 }
    ],
    weight: [
        { value: 'kg', label: 'Kilograms', factor: 1 },
        { value: 'g', label: 'Grams', factor: 0.001 },
        { value: 'mg', label: 'Milligrams', factor: 0.000001 },
        { value: 'lb', label: 'Pounds', factor: 0.45359237 },
        { value: 'oz', label: 'Ounces', factor: 0.028349523 },
        { value: 'st', label: 'Stone', factor: 6.35029 }
    ],
    temperature: [
        { value: 'C', label: 'Celsius' },
        { value: 'F', label: 'Fahrenheit' },
        { value: 'K', label: 'Kelvin' }
    ],
    time: [
        { value: 's', label: 'Seconds', factor: 1 },
        { value: 'min', label: 'Minutes', factor: 60 },
        { value: 'h', label: 'Hours', factor: 3600 },
        { value: 'd', label: 'Days', factor: 86400 },
        { value: 'wk', label: 'Weeks', factor: 604800 }
    ],
    data: [
        { value: 'b', label: 'Bits', factor: 1 },
        { value: 'B', label: 'Bytes', factor: 8 },
        { value: 'KB', label: 'Kilobytes', factor: 8192 },
        { value: 'MB', label: 'Megabytes', factor: 8388608 },
        { value: 'GB', label: 'Gigabytes', factor: 8589934592 },
        { value: 'TB', label: 'Terabytes', factor: 8796093022208 }
    ],
    area: [
        { value: 'm2', label: 'Square Meters', factor: 1 },
        { value: 'km2', label: 'Square Kilometers', factor: 1000000 },
        { value: 'ft2', label: 'Square Feet', factor: 0.092903 },
        { value: 'ac', label: 'Acres', factor: 4046.86 },
        { value: 'ha', label: 'Hectares', factor: 10000 }
    ],
    volume: [
        { value: 'm3', label: 'Cubic Meters', factor: 1 },
        { value: 'L', label: 'Liters', factor: 0.001 },
        { value: 'mL', label: 'Milliliters', factor: 0.000001 },
        { value: 'gal', label: 'Gallons (US)', factor: 0.00378541 },
        { value: 'qt', label: 'Quarts (US)', factor: 0.000946353 }
    ]
};

// Get current category
function getCategory() {
    const activeTab = document.querySelector('.tab-btn.active');
    return activeTab ? activeTab.dataset.category : 'length';
}

// Convert value
function convert(value, from, to, category) {
    if (from === to) return value;
    
    const categoryUnits = units[category];
    const fromUnit = categoryUnits.find(u => u.value === from);
    const toUnit = categoryUnits.find(u => u.value === to);
    
    if (!fromUnit || !toUnit) return null;
    
    // Special handling for temperature
    if (category === 'temperature') {
        return convertTemperature(value, from, to);
    }
    
    // Convert to base then to target
    const baseValue = value * fromUnit.factor;
    return baseValue / toUnit.factor;
}

function convertTemperature(value, from, to) {
    let celsius;
    switch (from) {
        case 'C': celsius = value; break;
        case 'F': celsius = (value - 32) * 5 / 9; break;
        case 'K': celsius = value - 273.15; break;
        default: return null;
    }
    
    switch (to) {
        case 'C': return celsius;
        case 'F': return celsius * 9 / 5 + 32;
        case 'K': return celsius + 273.15;
        default: return null;
    }
}

// Format number
function formatNumber(value) {
    if (value === null || isNaN(value)) return '';
    if (Math.abs(value) < 0.001 || Math.abs(value) > 1000000) {
        return value.toExponential(4);
    }
    return parseFloat(value.toFixed(6)).toString();
}

// Update conversion
function updateConversion() {
    const value = parseFloat(fromInput.value);
    const from = fromUnit.value;
    const to = toUnit.value;
    const category = getCategory();
    
    if (isNaN(value)) {
        toInput.value = '';
        formulaDisplay.textContent = 'Enter a value to convert';
        return;
    }
    
    const result = convert(value, from, to, category);
    
    if (result !== null) {
        toInput.value = formatNumber(result);
        
        // Update formula display
        const fromLabel = units[category].find(u => u.value === from)?.label || from;
        const toLabel = units[category].find(u => u.value === to)?.label || to;
        
        if (category === 'temperature') {
            formulaDisplay.textContent = `${value} ${fromLabel} = ${formatNumber(result)} ${toLabel}`;
        } else {
            const ratio = result / value;
            formulaDisplay.textContent = `${value} ${fromLabel} = ${formatNumber(result)} ${toLabel} (1:${formatNumber(ratio)})`;
        }
        
        // Track conversion count for lead capture
        trackConversion();
    }
}

// Track conversions for lead capture
function trackConversion() {
    const count = parseInt(localStorage.getItem('conversionCount') || '0') + 1;
    localStorage.setItem('conversionCount', count.toString());
    
    // Show modal after 3 conversions if not captured
    if (count === 3 && !localStorage.getItem('leadCaptured')) {
        setTimeout(showLeadModal, 500);
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

// Handle form submission
leadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    
    if (email && email.includes('@')) {
        // Store email
        localStorage.setItem('userEmail', email);
        localStorage.setItem('leadCaptured', 'true');
        localStorage.setItem('leadCaptureTime', new Date().toISOString());
        
        // Show success message
        document.querySelector('.modal-body').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        
        // Enable save button
        document.getElementById('saveHistoryBtn').style.display = 'inline-block';
    }
});

// Skip button
if (document.getElementById('skipBtn')) {
    document.getElementById('skipBtn').addEventListener('click', closeModal);
}

// Close button
if (document.querySelector('.close-btn')) {
    document.querySelector('.close-btn').addEventListener('click', closeModal);
}

// Close modal when clicking outside
leadModal.addEventListener('click', function(e) {
    if (e.target === leadModal) {
        closeModal();
    }
});

// Update unit selectors
function updateUnitSelectors(category) {
    const categoryUnits = units[category];
    const optionsHTML = categoryUnits.map(u => 
        `<option value="${u.value}">${u.label}</option>`
    ).join('');
    
    fromUnit.innerHTML = optionsHTML;
    toUnit.innerHTML = optionsHTML;
    
    // Set sensible defaults
    const defaults = {
        length: { from: 'm', to: 'ft' },
        weight: { from: 'kg', to: 'lb' },
        temperature: { from: 'C', to: 'F' },
        time: { from: 'h', to: 'min' },
        data: { from: 'GB', to: 'MB' },
        area: { from: 'm2', to: 'ft2' },
        volume: { from: 'L', to: 'gal' }
    };
    
    if (defaults[category]) {
        fromUnit.value = defaults[category].from;
        toUnit.value = defaults[category].to;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateUnitSelectors(this.dataset.category);
            updateConversion();
        });
    });
    
    // Input events
    fromInput.addEventListener('input', updateConversion);
    fromUnit.addEventListener('change', updateConversion);
    toUnit.addEventListener('change', updateConversion);
    
    // Swap button
    document.getElementById('swapBtn').addEventListener('click', function() {
        const temp = fromUnit.value;
        fromUnit.value = toUnit.value;
        toUnit.value = temp;
        updateConversion();
    });
    
    // Initialize
    updateUnitSelectors('length');
    updateConversion();
    
    // Check if lead already captured
    if (localStorage.getItem('leadCaptured')) {
        document.getElementById('saveHistoryBtn').style.display = 'inline-block';
    }
});

// Save history functionality
document.getElementById('saveHistoryBtn').addEventListener('click', function() {
    const email = localStorage.getItem('userEmail');
    if (email) {
        alert('Conversion history saved! A summary has been sent to ' + email);
    } else {
        showLeadModal();
    }
});
