/**
 * Related Tools Widget - Reusable component for tool pages
 * Shows related tools to increase engagement and internal linking
 */

// Tool metadata with categories and relationships
const TOOL_METADATA = {
  // Developer Tools
  'base64': {
    name: 'Base64 Encoder/Decoder',
    path: '/tools/base64/',
    category: 'Developer Tools',
    icon: '🔐',
    description: 'Encode and decode Base64 strings',
    related: ['url-encoder', 'html-encoder', 'hash', 'jwt-decoder']
  },
  'url-encoder': {
    name: 'URL Encoder/Decoder',
    path: '/tools/url-encoder/',
    category: 'Developer Tools',
    icon: '🔗',
    description: 'Encode and decode URLs',
    related: ['base64', 'html-encoder', 'json-formatter', 'hash']
  },
  'html-encoder': {
    name: 'HTML Encoder/Decoder',
    path: '/tools/html-encoder/',
    category: 'Developer Tools',
    icon: '🌐',
    description: 'Encode and decode HTML entities',
    related: ['url-encoder', 'base64', 'text-processor', 'markdown-editor']
  },
  'json-formatter': {
    name: 'JSON Formatter & Validator',
    path: '/tools/json-formatter/',
    category: 'Developer Tools',
    icon: '📋',
    description: 'Format, validate, and minify JSON',
    related: ['csv-json', 'text-processor', 'code-minifier', 'jwt-decoder']
  },
  'jwt-decoder': {
    name: 'JWT Decoder',
    path: '/tools/jwt-decoder/',
    category: 'Developer Tools',
    icon: '🎫',
    description: 'Decode and inspect JSON Web Tokens',
    related: ['json-formatter', 'base64', 'hash', 'url-encoder']
  },
  'code-minifier': {
    name: 'Code Minifier',
    path: '/tools/code-minifier/',
    category: 'Developer Tools',
    icon: '🗜️',
    description: 'Minify CSS, JS, and HTML code',
    related: ['json-formatter', 'text-processor', 'css-layout', 'diff-checker']
  },

  // Text/Content Tools
  'text-case-converter': {
    name: 'Text Case Converter',
    path: '/tools/text-case-converter/',
    category: 'Text & Content',
    icon: 'Aa',
    description: 'Convert between text cases',
    related: ['text-processor', 'word-counter', 'lorem-ipsum', 'readability']
  },
  'lorem-ipsum': {
    name: 'Lorem Ipsum Generator',
    path: '/tools/lorem-ipsum/',
    category: 'Text & Content',
    icon: '📝',
    description: 'Generate placeholder text',
    related: ['text-case-converter', 'word-counter', 'markdown-editor', 'text-processor']
  },
  'markdown-editor': {
    name: 'Markdown Editor',
    path: '/tools/markdown-editor/',
    category: 'Text & Content',
    icon: '📑',
    description: 'Edit and preview Markdown',
    related: ['html-encoder', 'text-processor', 'lorem-ipsum', 'word-counter']
  },
  'word-counter': {
    name: 'Word Counter',
    path: '/tools/word-counter/',
    category: 'Text & Content',
    icon: '🔢',
    description: 'Count words, characters, and paragraphs',
    related: ['text-case-converter', 'readability', 'lorem-ipsum', 'text-processor']
  },
  'readability': {
    name: 'Readability Analyzer',
    path: '/tools/readability/',
    category: 'Text & Content',
    icon: '📊',
    description: 'Analyze text readability scores',
    related: ['word-counter', 'text-case-converter', 'text-processor', 'lorem-ipsum']
  },
  'text-processor': {
    name: 'Text Processor',
    path: '/tools/text-processor/',
    category: 'Text & Content',
    icon: '✏️',
    description: 'Advanced text transformations',
    related: ['text-case-converter', 'markdown-editor', 'word-counter', 'html-encoder']
  },

  // Security Tools
  'password-generator': {
    name: 'Password Generator',
    path: '/tools/password-generator/',
    category: 'Security',
    icon: '🔑',
    description: 'Generate secure passwords',
    related: ['hash', 'qr-generator', 'base64', 'jwt-decoder']
  },
  'hash': {
    name: 'Hash Generator',
    path: '/tools/hash/',
    category: 'Security',
    icon: '#️⃣',
    description: 'Generate MD5, SHA-1, SHA-256 hashes',
    related: ['password-generator', 'base64', 'jwt-decoder', 'text-processor']
  },

  // Data/Conversion Tools
  'csv-json': {
    name: 'CSV ↔ JSON Converter',
    path: '/tools/csv-json/',
    category: 'Data & Conversion',
    icon: '🔄',
    description: 'Convert between CSV and JSON',
    related: ['json-formatter', 'batch-converter', 'text-processor', 'unit-converter']
  },
  'unit-converter': {
    name: 'Unit Converter',
    path: '/tools/unit-converter/',
    category: 'Data & Conversion',
    icon: '📏',
    description: 'Convert between units of measurement',
    related: ['csv-json', 'batch-converter', 'text-processor', 'color']
  },
  'batch-converter': {
    name: 'Batch Converter',
    path: '/tools/batch-converter/',
    category: 'Data & Conversion',
    icon: '⚡',
    description: 'Convert multiple files at once',
    related: ['csv-json', 'unit-converter', 'text-processor', 'code-minifier']
  },

  // Design Tools
  'color': {
    name: 'Color Tools',
    path: '/tools/color/',
    category: 'Design',
    icon: '🎨',
    description: 'Color picker and converter',
    related: ['color-palette-generator', 'css-layout', 'unit-converter', 'text-processor']
  },
  'color-palette-generator': {
    name: 'Color Palette Generator',
    path: '/tools/color-palette-generator.html',
    category: 'Design',
    icon: '🎯',
    description: 'Generate color palettes',
    related: ['color', 'css-layout', 'unit-converter', 'markdown-editor']
  },
  'css-layout': {
    name: 'CSS Layout Generator',
    path: '/tools/css-layout/',
    category: 'Design',
    icon: '📐',
    description: 'Generate CSS layouts',
    related: ['color', 'code-minifier', 'color-palette-generator', 'text-processor']
  },

  // Testing Tools
  'regex-tester': {
    name: 'Regex Tester',
    path: '/tools/regex-tester/',
    category: 'Testing',
    icon: '🔍',
    description: 'Test regular expressions',
    related: ['diff-checker', 'text-processor', 'json-formatter', 'code-minifier']
  },
  'diff-checker': {
    name: 'Diff Checker',
    path: '/tools/diff-checker/',
    category: 'Testing',
    icon: '📋',
    description: 'Compare text differences',
    related: ['regex-tester', 'text-processor', 'code-minifier', 'json-formatter']
  },

  // Utility Tools
  'qr-generator': {
    name: 'QR Code Generator',
    path: '/tools/qr-generator/',
    category: 'Utilities',
    icon: '🔲',
    description: 'Generate QR codes',
    related: ['password-generator', 'hash', 'base64', 'url-encoder']
  }
};

/**
 * Get related tools for a given tool ID
 * @param {string} toolId - The current tool identifier
 * @param {number} limit - Maximum number of tools to return (default: 4)
 * @returns {Array} Array of related tool objects
 */
function getRelatedTools(toolId, limit = 4) {
  const currentTool = TOOL_METADATA[toolId];
  if (!currentTool) return [];

  // Get explicitly defined related tools
  let related = [];
  if (currentTool.related && currentTool.related.length > 0) {
    related = currentTool.related
      .map(id => TOOL_METADATA[id])
      .filter(Boolean);
  }

  // Fill up with tools from the same category if needed
  if (related.length < limit) {
    const sameCategory = Object.entries(TOOL_METADATA)
      .filter(([id, tool]) => {
        return tool.category === currentTool.category &&
               id !== toolId &&
               !currentTool.related?.includes(id);
      })
      .map(([, tool]) => tool);

    for (const tool of sameCategory) {
      if (related.length >= limit) break;
      if (!related.includes(tool)) {
        related.push(tool);
      }
    }
  }

  // If still not enough, add tools from other categories
  if (related.length < limit) {
    const otherTools = Object.entries(TOOL_METADATA)
      .filter(([id, tool]) => {
        return tool.category !== currentTool.category &&
               id !== toolId &&
               !related.includes(tool);
      })
      .map(([, tool]) => tool);

    for (const tool of otherTools) {
      if (related.length >= limit) break;
      related.push(tool);
    }
  }

  return related.slice(0, limit);
}

/**
 * Generate HTML for the Related Tools widget
 * @param {string} toolId - The current tool identifier
 * @param {Object} options - Configuration options
 * @returns {string} HTML string
 */
function generateRelatedToolsHTML(toolId, options = {}) {
  const {
    title = 'Related Tools',
    showCategory = true,
    trackClicks = true
  } = options;

  const relatedTools = getRelatedTools(toolId, 4);
  if (relatedTools.length === 0) return '';

  const cards = relatedTools.map(tool => `
    <a href="${tool.path}"
       class="related-tool-card"
       data-tool-id="${Object.keys(TOOL_METADATA).find(k => TOOL_METADATA[k] === tool)}"
       ${trackClicks ? `data-analytics="related-tool-click"` : ''}>
      <div class="related-tool-icon">${tool.icon}</div>
      <div class="related-tool-info">
        <div class="related-tool-name">${tool.name}</div>
        <div class="related-tool-desc">${tool.description}</div>
        ${showCategory ? `<div class="related-tool-category">${tool.category}</div>` : ''}
      </div>
    </a>
  `).join('');

  return `
    <div class="related-tools-widget">
      <h3 class="related-tools-title">${title}</h3>
      <div class="related-tools-grid">
        ${cards}
      </div>
    </div>
  `;
}

/**
 * Render the Related Tools widget into a container
 * @param {string} toolId - The current tool identifier
 * @param {string|Element} container - Container selector or element
 * @param {Object} options - Configuration options
 */
function renderRelatedTools(toolId, container, options = {}) {
  const containerEl = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!containerEl) {
    console.warn('RelatedTools: Container not found', container);
    return;
  }

  const html = generateRelatedToolsHTML(toolId, options);
  containerEl.innerHTML = html;
}

/**
 * Get category name for a tool
 * @param {string} toolId - The tool identifier
 * @returns {string} Category name or empty string
 */
function getToolCategory(toolId) {
  return TOOL_METADATA[toolId]?.category || '';
}

/**
 * Get all tools in a category
 * @param {string} category - The category name
 * @returns {Array} Array of tool objects
 */
function getToolsByCategory(category) {
  return Object.entries(TOOL_METADATA)
    .filter(([, tool]) => tool.category === category)
    .map(([id, tool]) => ({ id, ...tool }));
}

/**
 * Get all available categories
 * @returns {Array} Array of category names
 */
function getAllCategories() {
  const categories = new Set();
  Object.values(TOOL_METADATA).forEach(tool => {
    if (tool.category) categories.add(tool.category);
  });
  return Array.from(categories);
}

// Export for module usage (if supported)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TOOL_METADATA,
    getRelatedTools,
    generateRelatedToolsHTML,
    renderRelatedTools,
    getToolCategory,
    getToolsByCategory,
    getAllCategories
  };
}

// Also expose to window for script tag usage
if (typeof window !== 'undefined') {
  window.RelatedTools = {
    TOOL_METADATA,
    getRelatedTools,
    generateRelatedToolsHTML,
    renderRelatedTools,
    getToolCategory,
    getToolsByCategory,
    getAllCategories
  };
}
