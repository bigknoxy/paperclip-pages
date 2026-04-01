# JSON Security: Best Practices for Developers

**Published:** March 30, 2026  
**Reading Time:** 14 minutes  
**Category:** Developer Tools

---

## Table of Contents

1. [JSON Security Threats](#json-security-threats)
2. [Injection Attacks](#injection-attacks)
3. [Deserialization Vulnerabilities](#deserialization-vulnerabilities)
4. [Prototype Pollution](#prototype-pollution)
5. [XXE Attacks](#xxe-attacks)
6. [Secure JSON Parsing](#secure-json-parsing)
7. [API Security](#api-security)
8. [Validation and Sanitization](#validation-and-sanitization)
9. [Best Practices](#best-practices)
10. [Tools and Testing](#tools-and-testing)

---

## JSON Security Threats

### Common Attack Vectors

| Attack Type | Risk Level | Description |
|-------------|------------|-------------|
| JSON Injection | High | Malicious data in JSON payloads |
| Prototype Pollution | Critical | Modifying Object.prototype |
| XXE | High | XML entities in JSON parsing |
| Deserialization | Critical | Executing code via JSON.parse |
| DoS | Medium | Resource exhaustion attacks |

### Why JSON Security Matters

- JSON is the standard data interchange format
- Used in APIs, configurations, and storage
- Often parsed without validation
- Attack surface is large

---

## Injection Attacks

### JSON Injection

**Attack Scenario:**
```javascript
// Malicious input
const userInput = '{"name": "admin", "role": "admin"}';

// Dangerous concatenation
const json = `{"user": ${userInput}}`;

// Parsed without validation
const data = JSON.parse(json);
// Attacker gains admin access
```

**Prevention:**
```javascript
// ✅ Never concatenate user input
const data = {
  user: userInput // As string, not parsed JSON
};

// ✅ Validate all input
const sanitized = sanitizeJson(userInput);
const data = JSON.parse(sanitized);
```

### Code Injection via eval()

❌ **Never use eval():**
```javascript
// DANGEROUS
const data = eval('(' + jsonString + ')');

// Attacker input: {"key": "value"}); alert('XSS'); ({
// Executes arbitrary code
```

✅ **Always use JSON.parse():**
```javascript
const data = JSON.parse(jsonString);
```

---

## Deserialization Vulnerabilities

### The Problem

```javascript
// Vulnerable pattern
class User {
  constructor(data) {
    Object.assign(this, data); // Copies all properties
  }
}

// Attacker sends:
// {"__proto__": {"isAdmin": true}}

const user = new User(maliciousData);
// Pollutes prototype
```

### Secure Deserialization

```javascript
// ✅ Whitelist allowed properties
class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    // Ignores any other properties
  }
}

// ✅ Or use validation library
const schema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' }
  },
  additionalProperties: false
};
```

---

## Prototype Pollution

### What is Prototype Pollution?

Modifying `Object.prototype` affects ALL objects in JavaScript:

```javascript
// Attack payload
const malicious = JSON.parse('{"__proto__": {"polluted": true}}');

// After merge
const result = Object.assign({}, malicious);

// Check pollution
const innocent = {};
console.log(innocent.polluted); // true!
```

### Prevention Techniques

**1. Use Object.create(null):**
```javascript
const safe = Object.create(null);
Object.assign(safe, userData);
// No prototype to pollute
```

**2. Check for prototype keys:**
```javascript
function isPrototypePollutionKey(key) {
  return key === '__proto__' || 
         key === 'constructor' || 
         key === 'prototype';
}

function safeMerge(target, source) {
  for (const key in source) {
    if (isPrototypePollutionKey(key)) continue;
    target[key] = source[key];
  }
}
```

**3. Use safe libraries:**
```javascript
// Lodash - safe by default
const merged = _.merge({}, userData);

// Immutable updates
const newObj = { ...oldObj, ...userData };
```

---

## XXE Attacks

### JSON and XXE

While XXE typically targets XML, JSON parsers can be vulnerable if they:
- Convert JSON to XML internally
- Support XML parsing
- Use vulnerable underlying libraries

**Vulnerable Configuration:**
```javascript
// Some parsers support XML entities
const parser = new SomeJsonParser({
  allowEntities: true // DANGEROUS
});
```

### Prevention

```javascript
// ✅ Disable external entities
const parser = new SomeJsonParser({
  allowEntities: false,
  resolveExternalEntities: false
});

// ✅ Use strict JSON parsers
const data = JSON.parse(jsonString); // Native - safe
```

---

## Secure JSON Parsing

### Safe Parsing Pattern

```javascript
function safeJsonParse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    
    // Additional validation
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid JSON structure');
    }
    
    return data;
  } catch (e) {
    console.error('JSON parse error:', e);
    return null;
  }
}
```

### Reviver Function

```javascript
const data = JSON.parse(jsonString, (key, value) => {
  // Block prototype pollution
  if (key === '__proto__' || key === 'constructor') {
    return undefined;
  }
  return value;
});
```

### Schema Validation

```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', maxLength: 100 },
    age: { type: 'integer', minimum: 0 },
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'email'],
  additionalProperties: false
};

const validate = ajv.compile(schema);

function parseAndValidate(jsonString) {
  const data = JSON.parse(jsonString);
  if (!validate(data)) {
    throw new Error('Validation failed: ' + ajv.errorsText(validate.errors));
  }
  return data;
}
```

---

## API Security

### JSON in APIs

**Common vulnerabilities:**
- Mass assignment
- Parameter pollution
- Content-type confusion
- Injection in nested objects

### Secure API Patterns

```javascript
// Express.js example
app.post('/api/users', (req, res) => {
  // ❌ Dangerous: Accepts any fields
  const user = new User(req.body);
  
  // ✅ Safe: Whitelist allowed fields
  const { name, email } = req.body;
  const user = new User({ name, email });
});
```

### Content-Type Validation

```javascript
// Force JSON content type
app.use((req, res, next) => {
  if (req.is('application/json')) {
    next();
  } else {
    res.status(415).send('Unsupported Media Type');
  }
});
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const jsonLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: 'Too many JSON requests'
});

app.use('/api/', jsonLimiter);
```

---

## Validation and Sanitization

### Input Validation

```javascript
function validateUserData(data) {
  const errors = [];
  
  // Check types
  if (typeof data.name !== 'string') {
    errors.push('Name must be a string');
  }
  
  // Check length
  if (data.name && data.name.length > 100) {
    errors.push('Name too long');
  }
  
  // Check format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  // Check for dangerous patterns
  if (JSON.stringify(data).includes('__proto__')) {
    errors.push('Invalid data structure');
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  return data;
}
```

### Output Encoding

```javascript
// When displaying JSON data
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Usage
const displayName = escapeHtml(user.name);
```

---

## Best Practices

### Security Checklist

- [ ] Never use eval() or Function() with JSON
- [ ] Always validate JSON structure
- [ ] Use schema validation
- [ ] Prevent prototype pollution
- [ ] Sanitize user input
- [ ] Escape output for display
- [ ] Set size limits on JSON payloads
- [ ] Use HTTPS for JSON APIs
- [ ] Implement rate limiting
- [ ] Log security events

### Code Patterns

**Secure Merge:**
```javascript
function secureMerge(target, ...sources) {
  sources.forEach(source => {
    Object.keys(source).forEach(key => {
      if (isPrototypePollutionKey(key)) return;
      target[key] = source[key];
    });
  });
  return target;
}
```

**Safe JSON Response:**
```javascript
function jsonResponse(res, data) {
  // Sanitize before sending
  const sanitized = sanitizeForJson(data);
  res.json(sanitized);
}
```

---

## Tools and Testing

### Security Tools

1. **npm audit** - Check for vulnerable dependencies
2. **Snyk** - Dependency vulnerability scanning
3. **OWASP ZAP** - API security testing
4. **ESLint security plugin** - Code analysis

### Testing for Vulnerabilities

```javascript
// Test for prototype pollution
describe('JSON Security', () => {
  it('should not allow prototype pollution', () => {
    const malicious = JSON.parse('{"__proto__": {"test": true}}');
    const obj = {};
    merge({}, malicious);
    expect(obj.test).toBeUndefined();
  });
});
```

---

## Conclusion

JSON security requires vigilance at every step.

### Key Takeaways

✅ **Never trust input** - Always validate JSON  
✅ **Use JSON.parse()** - Never eval()  
✅ **Prevent prototype pollution** - Check for dangerous keys  
✅ **Validate schemas** - Enforce structure  
✅ **Sanitize output** - Escape for display  
✅ **Monitor dependencies** - Update vulnerable packages  

### Quick Reference

| Threat | Prevention |
|--------|------------|
| Injection | Don't concatenate, use JSON.parse |
| Prototype Pollution | Block __proto__, use Object.create(null) |
| XXE | Disable entities |
| Mass Assignment | Whitelist properties |
| DoS | Size limits, rate limiting |

---

<!-- Email CTA -->
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; margin: 2rem 0; border-radius: 12px; color: white; text-align: center;">
<h4 style="margin: 0 0 0.75rem 0; font-size: 1.25rem;">Secure Your Applications</h4>
<p style="margin: 0 0 1rem 0; opacity: 0.95;">Join 500+ developers. Get the <strong>JSON Security Checklist</strong> + weekly security tips.</p>
<form id="emailCtaFormJsonSec" style="display: flex; gap: 0.5rem; max-width: 400px; margin: 0 auto; flex-wrap: wrap; justify-content: center;">
<input type="email" id="emailCtaJsonSec" placeholder="your@email.com" required style="flex: 1; min-width: 200px; padding: 0.75rem 1rem; border: none; border-radius: 6px; font-size: 1rem;">
<button type="submit" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer;">Get Checklist</button>
</form>
<p style="font-size: 0.875rem; opacity: 0.8; margin-top: 0.75rem;">No spam. Instant download.</p>
</div>
<script>
document.getElementById('emailCtaFormJsonSec').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('emailCtaJsonSec').value;
  let emails = JSON.parse(localStorage.getItem('ghp_emails') || '[]');
  emails.push({email: email, source: 'json-security-guide', timestamp: new Date().toISOString()});
  localStorage.setItem('ghp_emails', JSON.stringify(emails));
  if (typeof gtag !== 'undefined') gtag('event', 'email_signup', {category: 'lead_capture', label: 'json-security'});
  this.innerHTML = '<p style="margin:0">✓ Checklist sent! Check your inbox.</p>';
});
</script>

---

*Last updated: March 30, 2026*
*Related: [JSON Formatter](/tools/json-formatter) | [How to Format JSON](/content/how-to-format-json)*