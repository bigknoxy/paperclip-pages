#!/usr/bin/env python3
"""
Script to add Related Tools widget to all tool pages
"""
import os
import re
import json

# Tool ID mapping based on folder structure
TOOL_ID_MAP = {
    'base64': 'base64',
    'json-formatter': 'json-formatter',
    'url-encoder': 'url-encoder',
    'html-encoder': 'html-encoder',
    'jwt-decoder': 'jwt-decoder',
    'text-case-converter': 'text-case-converter',
    'lorem-ipsum': 'lorem-ipsum',
    'markdown-editor': 'markdown-editor',
    'word-counter': 'word-counter',
    'readability': 'readability',
    'text-processor': 'text-processor',
    'password-generator': 'password-generator',
    'hash': 'hash',
    'csv-json': 'csv-json',
    'unit-converter': 'unit-converter',
    'batch-converter': 'batch-converter',
    'color': 'color',
    'css-layout': 'css-layout',
    'regex-tester': 'regex-tester',
    'diff-checker': 'diff-checker',
    'code-minifier': 'code-minifier',
    'qr-generator': 'qr-generator',
    'color-palette-generator': 'color-palette-generator',
}

def add_related_tools_to_file(file_path, tool_id):
    """Add related tools widget to a single HTML file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has related-tools
    if 'related-tools.js' in content:
        print(f"  Skipping {file_path} - already has related-tools.js")
        return

    # Add CSS link before </head>
    css_link = '<link rel="stylesheet" href="/tools/related-tools.css">'
    if '</head>' in content and css_link not in content:
        content = content.replace('</head>', f'{css_link}\n</head>')

    # Add widget container and script before </body>
    widget_html = f'''
<!-- Related Tools Widget -->
<div id="related-tools-container"></div>
<script src="/tools/related-tools.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {{
    if (window.RelatedTools) {{
      RelatedTools.renderRelatedTools('{tool_id}', '#related-tools-container', {{
        title: 'Related Tools',
        showCategory: true,
        trackClicks: true
      }});
    }}
  }});
</script>
'''

    if '</body>' in content:
        content = content.replace('</body>', f'{widget_html}</body>')
    elif '</html>' in content:
        content = content.replace('</html>', f'{widget_html}</html>')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  Updated {file_path}")

def main():
    base_dir = '/root/paperclip/gh-pages/tools'

    # Process folder-based tools
    for folder in os.listdir(base_dir):
        folder_path = os.path.join(base_dir, folder)
        if os.path.isdir(folder_path) and folder in TOOL_ID_MAP:
            index_path = os.path.join(folder_path, 'index.html')
            if os.path.exists(index_path):
                tool_id = TOOL_ID_MAP[folder]
                print(f"Processing {folder} -> {tool_id}")
                add_related_tools_to_file(index_path, tool_id)

    # Process standalone HTML files
    standalone_tools = [
        ('color-palette-generator.html', 'color-palette-generator')
    ]

    for filename, tool_id in standalone_tools:
        file_path = os.path.join(base_dir, filename)
        if os.path.exists(file_path):
            print(f"Processing {filename} -> {tool_id}")
            add_related_tools_to_file(file_path, tool_id)

    print("\nDone! Related Tools widget added to all tool pages.")

if __name__ == '__main__':
    main()
