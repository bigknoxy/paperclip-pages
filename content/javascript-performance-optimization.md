# JavaScript Performance Optimization: Write Fast Code

**Published:** March 30, 2026  
**Reading Time:** 18 minutes  
**Category:** Developer Tools

---

## Table of Contents

1. [Why JavaScript Performance Matters](#why-javascript-performance-matters)
2. [Code Execution Optimization](#code-execution-optimization)
3. [Memory Management](#memory-management)
4. [DOM Manipulation](#dom-manipulation)
5. [Async Operations](#async-operations)
6. [Event Handling](#event-handling)
7. [Loops and Iteration](#loops-and-iteration)
8. [Data Structures](#data-structures)
9. [Bundle Size Optimization](#bundle-size-optimization)
10. [Web Workers](#web-workers)
11. [Testing and Profiling](#testing-and-profiling)

---

## Why JavaScript Performance Matters

Slow JavaScript causes:
- **Poor Core Web Vitals** - Lower search rankings
- **User frustration** - Abandoned sessions
- **Battery drain** - Mobile users leave
- **High bounce rates** - Lost revenue

### Performance Metrics

| Metric | Good | Poor |
|--------|------|------|
| Time to Interactive | < 3.8s | > 7.3s |
| Total Blocking Time | < 200ms | > 600ms |
| Bundle Size | < 170KB | > 1MB |

---

## Code Execution Optimization

### Avoid Global Lookups

❌ **Slow:**
```javascript
function processData() {
  for (let i = 0; i < document.getElementsByTagName('div').length; i++) {
    // Accessing DOM repeatedly
  }
}
```

✅ **Fast:**
```javascript
function processData() {
  const divs = document.getElementsByTagName('div');
  const length = divs.length;
  for (let i = 0; i < length; i++) {
    // Cached reference
  }
}
```

### Minimize DOM Access

```javascript
// ❌ Bad: Accessing DOM in loop
for (let i = 0; i < 1000; i++) {
  document.getElementById('counter').textContent = i;
}

// ✅ Good: Batch DOM updates
let counter = 0;
for (let i = 0; i < 1000; i++) {
  counter = i;
}
document.getElementById('counter').textContent = counter;
```

### Use Strict Equality

```javascript
// ❌ Loose equality (type coercion)
if (value == 1) { }

// ✅ Strict equality (faster)
if (value === 1) { }
```

---

## Memory Management

### Avoid Memory Leaks

```javascript
// ❌ Memory leak: Event listener not removed
function setupListener() {
  const element = document.getElementById('btn');
  element.addEventListener('click', () => {
    console.log('clicked');
  });
}

// ✅ Proper cleanup
function setupListener() {
  const element = document.getElementById('btn');
  const handler = () => console.log('clicked');
  element.addEventListener('click', handler);
  
  // Cleanup when done
  return () => element.removeEventListener('click', handler);
}
```

### Use Object Pools

```javascript
// ❌ Creating objects constantly
function getPosition() {
  return { x: 0, y: 0 }; // New object every call
}

// ✅ Reuse objects
const positionPool = [];
let poolIndex = 0;

function getPooledPosition() {
  if (poolIndex < positionPool.length) {
    return positionPool[poolIndex++];
  }
  const pos = { x: 0, y: 0 };
  positionPool.push(pos);
  poolIndex++;
  return pos;
}

function resetPool() {
  poolIndex = 0;
}
```

### WeakMap/WeakSet for Private Data

```javascript
const privateData = new WeakMap();

class MyClass {
  constructor(secret) {
    privateData.set(this, { secret });
  }
  
  getSecret() {
    return privateData.get(this).secret;
  }
}

// Automatically garbage collected when instance is gone
```

---

## DOM Manipulation

### Batch DOM Updates

```javascript
// ❌ 1000 reflows
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  document.body.appendChild(div);
}

// ✅ 1 reflow
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment);
```

### Use DocumentFragment

```javascript
// Build off-DOM, then insert
const list = document.getElementById('myList');
const fragment = document.createDocumentFragment();

items.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item.name;
  fragment.appendChild(li);
});

list.appendChild(fragment); // Single DOM insertion
```

### Cache Layout Values

```javascript
// ❌ Forces reflow on every access
function animate() {
  element.style.left = (element.offsetLeft + 1) + 'px';
  requestAnimationFrame(animate);
}

// ✅ Cache layout values
let currentLeft = element.offsetLeft;
function animate() {
  currentLeft += 1;
  element.style.transform = `translateX(${currentLeft}px)`;
  requestAnimationFrame(animate);
}
```

### CSS Classes Over Style

```javascript
// ❌ Slow: Setting individual styles
element.style.color = 'red';
element.style.background = 'blue';
element.style.padding = '10px';

// ✅ Fast: CSS class toggle
element.classList.add('highlighted');

// CSS
.highlighted {
  color: red;
  background: blue;
  padding: 10px;
}
```

---

## Async Operations

### Promise.all for Parallel

```javascript
// ❌ Sequential (slow)
const user = await fetchUser();
const posts = await fetchPosts(user.id);
const comments = await fetchComments(posts[0].id);

// ✅ Parallel (fast)
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
]);
```

### Debounce and Throttle

```javascript
// Debounce: Execute after pause
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle: Execute at most once per period
function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage
window.addEventListener('scroll', throttle(handleScroll, 100));
window.addEventListener('resize', debounce(handleResize, 250));
```

### Lazy Loading

```javascript
// Intersection Observer for lazy loading
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});
```

---

## Event Handling

### Event Delegation

```javascript
// ❌ Individual listeners (1000 events)
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handleClick);
});

// ✅ Event delegation (1 event)
document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.classList.contains('item')) {
    handleClick(e);
  }
});
```

### Remove Unused Listeners

```javascript
class Component {
  constructor() {
    this.handleScroll = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.handleScroll);
  }
  
  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
```

### Passive Event Listeners

```javascript
// ✅ Improves scrolling performance
window.addEventListener('scroll', handleScroll, { passive: true });

// ❌ Don't prevent default in passive listeners
// This will throw an error
window.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Error!
}, { passive: true });
```

---

## Loops and Iteration

### Fastest Loop Types

```javascript
// 1. For loop (fastest for arrays)
const arr = [1, 2, 3, 4, 5];
for (let i = 0, len = arr.length; i < len; i++) {
  process(arr[i]);
}

// 2. While loop (slightly slower)
let i = arr.length;
while (i--) {
  process(arr[i]);
}

// 3. forEach (cleaner but slower)
arr.forEach(item => process(item));

// 4. For...of (ES6, clean)
for (const item of arr) {
  process(item);
}
```

### Early Exit

```javascript
// ❌ Always iterates entire array
const found = array.filter(x => x.id === targetId)[0];

// ✅ Stops at first match
const found = array.find(x => x.id === targetId);

// ✅ Even better for existence check
const exists = array.some(x => x.id === targetId);
```

### Map vs Object

```javascript
// ❌ Slow object iteration
const users = { alice: { age: 30 }, bob: { age: 25 } };
Object.keys(users).forEach(key => {
  console.log(users[key]);
});

// ✅ Fast Map iteration
const users = new Map();
users.set('alice', { age: 30 });
users.set('bob', { age: 25 });

users.forEach((value, key) => {
  console.log(value);
});
```

---

## Data Structures

### Set for Uniqueness

```javascript
// ❌ O(n^2) uniqueness check
const unique = array.filter((v, i, a) => a.indexOf(v) === i);

// ✅ O(n) with Set
const unique = [...new Set(array)];

// Fast membership test
const set = new Set([1, 2, 3]);
set.has(2); // O(1)
```

### Map vs Object

```javascript
// Map benefits
const map = new Map();

// Any key type
map.set({ id: 1 }, 'value');
map.set(function() {}, 'another');

// Preserves insertion order
// Better performance for frequent additions/removals
// Built-in size property

// Object benefits
const obj = {};

// Better for fixed schemas
// JSON serialization
// Smaller memory footprint for small datasets
```

### Typed Arrays

```javascript
// Fast numeric operations
const buffer = new ArrayBuffer(1024);
const view = new Int32Array(buffer);

// Much faster than regular arrays for math
for (let i = 0; i < view.length; i++) {
  view[i] = i * 2;
}
```

---

## Bundle Size Optimization

### Tree Shaking

```javascript
// ❌ Imports everything
import * as utils from './utils';

// ✅ Only imports used functions
import { debounce, throttle } from './utils';

// ✅ Even better with path imports
import debounce from 'lodash/debounce';
```

### Dynamic Imports

```javascript
// Load on demand
const Chart = await import('./chart.js');

// Route-based splitting
const routes = {
  '/dashboard': () => import('./Dashboard'),
  '/profile': () => import('./Profile')
};
```

### Code Splitting

```javascript
// Webpack/Vite automatic splitting
import(/* webpackChunkName: "analytics" */ './analytics')
  .then(module => module.init());
```

---

## Web Workers

### Offload Heavy Work

```javascript
// worker.js
self.onmessage = function(e) {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};

function heavyComputation(data) {
  // CPU-intensive work
  return data.map(x => x * x);
}

// main.js
const worker = new Worker('worker.js');

worker.postMessage([1, 2, 3, 4, 5]);
worker.onmessage = function(e) {
  console.log('Result:', e.data);
};
```

### Comlink for Easier Workers

```javascript
import * as Comlink from 'comlink';

// worker.js
export const api = {
  expensiveOperation(data) {
    // Heavy computation
    return result;
  }
};
Comlink.expose(api);

// main.js
const Worker = new Worker('./worker.js');
const api = Comlink.wrap(Worker);
const result = await api.expensiveOperation(data);
```

---

## Testing and Profiling

### Performance API

```javascript
// Measure function performance
performance.mark('start');
expensiveFunction();
performance.mark('end');

performance.measure('function', 'start', 'end');
const measure = performance.getEntriesByName('function')[0];
console.log(`Took ${measure.duration}ms`);
```

### console.time

```javascript
console.time('operation');
// ... code to measure
console.timeEnd('operation');
// Output: operation: 234.567ms
```

### Memory Profiling

```javascript
// Force garbage collection (Chrome DevTools)
// Enable "Allow JavaScript to force garbage collection" in DevTools settings

// Check memory usage
console.log(performance.memory.usedJSHeapSize);
```

### Benchmarking

```javascript
function benchmark(fn, iterations = 1000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  return (end - start) / iterations;
}

// Compare two approaches
const timeA = benchmark(() => approachA());
const timeB = benchmark(() => approachB());
console.log(`A: ${timeA}ms, B: ${timeB}ms`);
```

---

## Conclusion

JavaScript performance is crucial for user experience and SEO.

### Key Takeaways

✅ **Minimize DOM access** - Cache references, batch updates  
✅ **Use requestAnimationFrame** - Smooth animations  
✅ **Debounce/throttle** events - Prevent excessive handlers  
✅ **Choose right data structures** - Set, Map, TypedArrays  
✅ **Lazy load** - Load only what's needed  
✅ **Use Web Workers** - Offload heavy computation  
✅ **Profile first** - Measure before optimizing  

### Quick Reference

| Operation | Best Practice |
|-----------|---------------|
| DOM updates | Batch with DocumentFragment |
| Animations | requestAnimationFrame + transform |
| Events | Delegate, use passive listeners |
| Scrolling | Throttle to 16ms |
| Async | Promise.all for parallel |
| Loops | Cache length, use for...of |
| Memory | Clean up listeners, use WeakMap |

---

*Last updated: March 30, 2026*
*Related: [CSS Performance Optimization](/content/css-performance-optimization) | [Technical SEO for Developers](/content/technical-seo-developers)*

---

<!-- Email CTA -->
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; margin: 2rem 0; border-radius: 12px; color: white; text-align: center;">
  <h4 style="margin: 0 0 0.75rem 0; font-size: 1.25rem;">Get the JavaScript Performance Cheatsheet</h4>
  <p style="margin: 0 0 1rem 0; opacity: 0.95;">Join 500+ developers. Get the <strong>JS Performance Quick Reference</strong> + weekly optimization tips.</p>
  <form id="emailCtaForm10" style="display: flex; gap: 0.5rem; max-width: 400px; margin: 0 auto; flex-wrap: wrap; justify-content: center;">
    <input type="email" id="emailCta10" placeholder="your@email.com" required style="flex: 1; min-width: 200px; padding: 0.75rem 1rem; border: none; border-radius: 6px; font-size: 1rem;">
    <button type="submit" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer;">Get Cheatsheet</button>
  </form>
  <p style="font-size: 0.875rem; opacity: 0.8; margin-top: 0.75rem;">No spam. Instant download. Write faster code.</p>
</div>
<script>
document.getElementById('emailCtaForm10').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('emailCta10').value;
  let emails = JSON.parse(localStorage.getItem('ghp_emails') || '[]');
  emails.push({email: email, source: 'js-performance-article', timestamp: new Date().toISOString()});
  localStorage.setItem('ghp_emails', JSON.stringify(emails));
  if (typeof gtag !== 'undefined') gtag('event', 'email_signup', {category: 'lead_capture', label: 'js-performance'});
  this.innerHTML = '<p style="margin:0">✓ Cheatsheet sent! Check your inbox.</p>';
});
</script>