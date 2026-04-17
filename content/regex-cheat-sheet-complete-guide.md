---
title: "Regex Cheat Sheet: Complete Regular Expressions Guide (2026)"
description: "Master regular expressions with this comprehensive cheat sheet. 50+ regex patterns, syntax reference, and practical examples for JavaScript, Python, and more."
keywords: "regex cheat sheet, regular expressions guide, regex patterns, regex tutorial, regex examples, javascript regex, python regex"
author: "Paperclip"
date: "2026-04-02"
category: "Developer Tools"
---

# Regex Cheat Sheet: Complete Regular Expressions Guide (2026)

Regular expressions (regex) are one of the most powerful tools in a developer's arsenal—and one of the most misunderstood. This cheat sheet cuts through the confusion with practical patterns, clear explanations, and real-world examples you can use today.

---

## Quick Reference: Regex Symbols

| Symbol | Meaning | Example |
|--------|---------|---------|
| `.` | Any character (except newline) | `a.c` matches "abc", "a1c" |
| `*` | 0 or more of preceding | `ab*` matches "a", "ab", "abb" |
| `+` | 1 or more of preceding | `ab+` matches "ab", "abb" |
| `?` | 0 or 1 of preceding | `ab?` matches "a", "ab" |
| `^` | Start of string | `^hello` matches "hello world" |
| `$` | End of string | `world$` matches "hello world" |
| `\|` | OR operator | `cat\|dog` matches "cat" or "dog" |
| `()` | Grouping | `(ab)+` matches "ab", "abab" |
| `[]` | Character class | `[abc]` matches "a", "b", or "c" |
| `{}` | Quantifier | `a{3}` matches "aaa" |
| `\` | Escape character | `\. ` matches literal "." |

---

## Character Classes

### Basic Character Classes

```regex
[abc]      # Match any: a, b, or c
[^abc]     # Match any except: a, b, or c
[a-z]      # Match any lowercase letter
[A-Z]      # Match any uppercase letter
[0-9]      # Match any digit
[a-zA-Z]   # Match any letter
[a-zA-Z0-9] # Match any alphanumeric
```

### Predefined Character Classes

```regex
\d         # Digit [0-9]
\D         # Non-digit [^0-9]
\w         # Word character [a-zA-Z0-9_]
\W         # Non-word character
\s         # Whitespace (space, tab, newline)
\S         # Non-whitespace
\b         # Word boundary
\B         # Non-word boundary
```

### Examples

```javascript
// Match email pattern
const email = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// Match phone number (US)
const phone = /\d{3}-\d{3}-\d{4}/;

// Match hexadecimal color
const hexColor = /#[0-9A-Fa-f]{6}/;
```

---

## Quantifiers

| Pattern | Meaning | Example Match |
|---------|---------|---------------|
| `*` | Zero or more | `a*` matches "", "a", "aaa" |
| `+` | One or more | `a+` matches "a", "aaa" |
| `?` | Zero or one | `a?` matches "", "a" |
| `{n}` | Exactly n | `a{3}` matches "aaa" |
| `{n,}` | n or more | `a{2,}` matches "aa", "aaaa" |
| `{n,m}` | Between n and m | `a{2,4}` matches "aa", "aaa", "aaaa" |
| `*?` | Lazy match | Match as few as possible |
| `+?` | Lazy match | Match as few as possible |
| `??` | Lazy match | Match as few as possible |

### Greedy vs Lazy

```regex
# Greedy (default): matches as much as possible
<.*>       # Matches "<p>content</p>" entirely

# Lazy: matches as little as possible
<.*?>      # Matches "<p>", then "</p>"
```

---

## Anchors

```regex
^          # Start of string (or line in multiline mode)
$          # End of string (or line in multiline mode)
\b         # Word boundary
\B         # Non-word boundary
\A         # Start of string (always)
\z         # End of string (always)
```

### Examples

```javascript
// Match lines starting with "TODO"
/^TODO/m

// Match exact word "cat" (not "catch")
/\bcat\b/

// Match entire string of digits
/^\d+$/
```

---

## Groups and Capturing

### Basic Groups

```regex
(abc)      # Capture group
(?:abc)    # Non-capturing group
(?<name>abc) # Named group (modern engines)
```

### Backreferences

```regex
(\w+)\s+\1     # Match repeated word (e.g., "the the")
([a-z])\1      # Match double letters (e.g., "ee", "oo")
```

### Practical Example

```javascript
// Replace repeated words
const text = "the the cat sat sat on on the mat";
const fixed = text.replace(/\b(\w+)\s+\1\b/g, '$1');
// Result: "the cat sat on the mat"
```

---

## Common Regex Patterns

### Email Validation

```regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$

# More permissive (allows most valid emails)
^[^\s@]+@[^\s@]+\.[^\s@]+$

# Named groups version
^(?<local>[^\s@]+)@(?<domain>[^\s@]+\.[^\s@]+)$
```

### URL Validation

```regex
^https?://[\w.-]+(?:/[\w./-]*)?(?:\?[\w=&-]+)?$

# More comprehensive
^(https?|ftp)://[\w.-]+(?::\d+)?(?:/[\w./-]*)?(?:\?[\w=&-]*)?(?:#[\w-]*)?$
```

### Phone Numbers (Various Formats)

```regex
# US Phone (flexible)
\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}

# International (E.123)
\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}

# Extract all phone-like patterns
\b\d{3}[-.]?\d{3}[-.]?\d{4}\b
```

### IP Address (IPv4)

```regex
\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b
```

### Credit Card Numbers

```regex
# Generic pattern (spaces or dashes allowed)
\b(?:\d{4}[-\s]?){3}\d{4}\b

# Visa
\b4[0-9]{12}(?:[0-9]{3})?\b

# Mastercard
\b5[1-5][0-9]{14}\b

# American Express
\b3[47][0-9]{13}\b
```

### Password Validation

```regex
# Strong password: 8+ chars, uppercase, lowercase, number, special
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$

# Medium: 8+ chars, any 3 of 4 types
^(?:(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])|(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])|(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])).{8,}$
```

### Date Formats

```regex
# MM/DD/YYYY
^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/\d{4}$

# YYYY-MM-DD (ISO 8601)
^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$

# Flexible date
\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b
```

### Time Formats

```regex
# 24-hour format (HH:MM)
^([01]?[0-9]|2[0-3]):[0-5][0-9]$

# 12-hour format with AM/PM
^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$
```

### HTML Tags

```regex
# Match any HTML tag
<[^>]+>

# Match specific tag (e.g., <div>)
<div[^>]*>.*?<\/div>

# Match self-closing tag
<[\w]+[^>]*\/?>

# Extract attributes
<\w+[^>]*\s(\w+)="([^"]*)"
```

### File Extensions

```regex
# Common image formats
\.(jpg|jpeg|png|gif|bmp|webp|svg)$

# Document formats
\.(pdf|doc|docx|txt|rtf)$

# Any extension
\.[^.\\\/:*?"<>|\r\n]+$
```

### Whitespace Handling

```regex
# Remove leading/trailing whitespace
^\s+|\s+$

# Collapse multiple spaces
\s{2,}

# Match blank lines
^\s*$

# Normalize line endings
\r\n|\r|\n
```

---

## Lookahead and Lookbehind

### Positive Lookahead

```regex
\w+(?=\s+world)    # Match word before "world"
\d+(?=USD)         # Match number before "USD"
foo(?=bar)         # Match "foo" only if followed by "bar"
```

### Negative Lookahead

```regex
\w+(?!\s+world)    # Match word NOT before "world"
\d+(?!USD)         # Match number NOT before "USD"
foo(?!bar)         # Match "foo" only if NOT followed by "bar"
```

### Positive Lookbehind

```regex
(?<=\$)\d+         # Match number preceded by $
(?<=Mr\.\s)\w+     # Match word after "Mr. "
(?<=foo)bar        # Match "bar" only if preceded by "foo"
```

### Negative Lookbehind

```regex
(?<!\$)\d+         # Match number NOT preceded by $
(?<!Mr\.\s)\w+     # Match word NOT after "Mr. "
(?<!foo)bar        # Match "bar" only if NOT preceded by "foo"
```

### Practical Examples

```javascript
// Match prices without currency symbol
const prices = "$100 $200 USD300 $400".match(/(?<=\$)\d+/g);
// Result: ["100", "200", "400"]

// Match "quick" only if preceded by "the"
const text = "the quick brown fox";
const match = text.match(/(?<=the\s)quick/);

// Validate password has no spaces
const noSpaces = /^(?!.*\s)/;
```

---

## Regex by Language

### JavaScript

```javascript
// Basic match
const pattern = /hello/;
const result = pattern.test("hello world");  // true

// With flags
const pattern2 = /hello/i;  // case-insensitive
const pattern3 = /hello/g;  // global (all matches)
const pattern4 = /hello/m;  // multiline
const pattern5 = /hello/s;  // dot matches newline

// Match and extract
const text = "Contact: john@example.com";
const email = text.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
// email[0] = "john@example.com"

// Replace
const phone = "Call me at 555-1234";
const masked = phone.replace(/\d{3}-\d{4}/, "XXX-XXXX");

// Split
const csv = "apple,banana,cherry";
const fruits = csv.split(/,/);

// Replace with function
const nums = "100 200 300";
const doubled = nums.replace(/\d+/g, (match) => match * 2);
// Result: "200 400 600"

// Named groups (ES2018+)
const datePattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = "2026-04-02".match(datePattern);
// match.groups.year = "2026"
```

### Python

```python
import re

# Basic match
if re.search(r'hello', 'hello world'):
    print('Found!')

# Match with flags
pattern = re.compile(r'hello', re.IGNORECASE | re.MULTILINE)

# Find all matches
text = "Emails: a@b.com, c@d.com"
emails = re.findall(r'[\w.-]+@[\w.-]+\.\w{2,}', text)
# ['a@b.com', 'c@d.com']

# Replace
phone = "Call 555-1234 today"
masked = re.sub(r'\d{3}-\d{4}', 'XXX-XXXX', phone)

# Split
csv = "apple,banana,cherry"
fruits = re.split(r',', csv)

# Replace with function
nums = "100 200 300"
doubled = re.sub(r'\d+', lambda m: str(int(m.group()) * 2), nums)

# Named groups
pattern = r'(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})'
match = re.search(pattern, '2026-04-02')
# match.group('year') = '2026'

# Validation
def is_valid_email(email):
    pattern = r'^[\w.-]+@[\w.-]+\.\w{2,}$'
    return re.match(pattern, email) is not None
```

### PHP

```php
<?php
// Basic match
if (preg_match('/hello/', 'hello world')) {
    echo 'Found!';
}

// Match with flags
preg_match('/hello/i', 'HELLO', $matches);  // case-insensitive

// Find all
$text = "Emails: a@b.com, c@d.com";
preg_match_all('/[\w.-]+@[\w.-]+\.\w{2,}/', $text, $matches);
// $matches[0] = ['a@b.com', 'c@d.com']

// Replace
$phone = "Call 555-1234";
$masked = preg_replace('/\d{3}-\d{4}/', 'XXX-XXXX', $phone);

// Replace with callback
$nums = "100 200 300";
$doubled = preg_replace_callback('/\d+/', function($m) {
    return $m[0] * 2;
}, $nums);

// Named groups
$pattern = '/(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})/';
preg_match($pattern, '2026-04-02', $matches);
// $matches['year'] = '2026'
?>
```

### Java

```java
import java.util.regex.*;

// Compile pattern
Pattern pattern = Pattern.compile("hello", Pattern.CASE_INSENSITIVE);

// Match
Matcher matcher = pattern.matcher("HELLO World");
boolean found = matcher.find();  // true

// Find all
Pattern emailPattern = Pattern.compile("[\\w.-]+@[\\w.-]+\\.\\w{2,}");
Matcher emailMatcher = emailPattern.matcher("a@b.com, c@d.com");
while (emailMatcher.find()) {
    System.out.println(emailMatcher.group());
}

// Replace
String phone = "Call 555-1234";
String masked = phone.replaceAll("\\d{3}-\\d{4}", "XXX-XXXX");

// Named groups (Java 7+)
Pattern datePattern = Pattern.compile("(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})");
Matcher dateMatcher = datePattern.matcher("2026-04-02");
if (dateMatcher.find()) {
    String year = dateMatcher.group("year");
}
```

### Go

```go
package main

import (
    "fmt"
    "regexp"
)

func main() {
    // Compile pattern
    re := regexp.MustCompile(`hello`)
    
    // Match
    matched := re.MatchString("hello world")
    fmt.Println(matched)  // true
    
    // Find all
    emailRe := regexp.MustCompile(`[\w.-]+@[\w.-]+\.\w{2,}`)
    emails := emailRe.FindAllString("a@b.com, c@d.com", -1)
    fmt.Println(emails)  // [a@b.com c@d.com]
    
    // Replace
    phoneRe := regexp.MustCompile(`\d{3}-\d{4}`)
    masked := phoneRe.ReplaceAllString("Call 555-1234", "XXX-XXXX")
    fmt.Println(masked)
    
    // Replace with function (using Expand)
    numRe := regexp.MustCompile(`\d+`)
    result := numRe.ReplaceAllStringFunc("100 200", func(s string) string {
        // Convert and double
        return s  // simplified
    })
}
```

---

## Regex Flags Reference

| Flag | JavaScript | Python | PHP | Meaning |
|------|------------|--------|-----|---------|
| `i` | ✅ | `re.I` | `i` | Case-insensitive |
| `g` | ✅ | N/A | `g` | Global match |
| `m` | ✅ | `re.M` | `m` | Multiline (`^`/`$` match lines) |
| `s` | ✅ | `re.S` | `s` | Dotall (`.` matches newlines) |
| `u` | ✅ | N/A | `u` | Unicode mode |
| `y` | ✅ | N/A | N/A | Sticky match |
| `x` | N/A | `re.X` | `x` | Verbose/extended |

---

## Performance Tips

### 1. Avoid Catastrophic Backtracking

```regex
# Bad: Can cause exponential backtracking
(a+)+$

# Bad: Nested quantifiers
(.*)*

# Good: Specific, bounded patterns
[a-z]+@
```

### 2. Use Possessive Quantifiers (if available)

```regex
# Regular (backtracks)
a+$

# Possessive (no backtracking)
a++$
```

### 3. Prefer Character Classes over Alternation

```regex
# Slower
a|b|c|d

# Faster
[abcd]

# Slower
(abc|def)

# Often faster
(?:abc|def)
```

### 4. Anchor When Possible

```regex
# Without anchor (checks every position)
\d{3}-\d{4}

# With anchor (checks once)
^\d{3}-\d{4}$
```

### 5. Pre-compile Patterns

```javascript
// Compile once, use many times
const EMAIL_PATTERN = /^[\w.-]+@[\w.-]+\.\w{2,}$/;

function validateEmail(email) {
    return EMAIL_PATTERN.test(email);  // Fast!
}
```

---

## Common Mistakes

### ❌ Using regex for HTML/XML parsing

```javascript
// Don't do this
const content = html.match(/<p>(.*)<\/p>/);

// Do this instead
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');
const paragraphs = doc.querySelectorAll('p');
```

### ❌ Unescaped special characters

```javascript
// Wrong: dot matches everything
const domain = /example.com/;  // Matches "exampleacom", "examplexcom"

// Right: escape the dot
const domain = /example\.com/;
```

### ❌ Forgetting word boundaries

```javascript
// Wrong: matches "catch" too
/cat/.test("catch");  // true

// Right: exact word match
/\bcat\b/.test("catch");  // false
```

### ❌ Greedy vs Lazy confusion

```javascript
// Greedy (matches too much)
const html = "<p>Hello</p><p>World</p>";
html.match(/<p>.*<\/p>/)[0];  // "<p>Hello</p><p>World</p>"

// Lazy (correct)
html.match(/<p>.*?<\/p>/)[0];  // "<p>Hello</p>"
```

---

## Interactive Regex Tester

Try your patterns with these test strings:

```
Emails:
john.doe@example.com
jane@company.co.uk
invalid@.com
support@sub.domain.org

Phone Numbers:
555-1234
(555) 123-4567
+1 555-123-4567

URLs:
https://www.example.com
http://sub.site.org/path
ftp://files.server.net

Dates:
2026-04-02
04/02/2026
02-Apr-2026

Credit Cards:
4111-1111-1111-1111 (Visa)
5555-5555-5555-4444 (MC)
3782-822463-10005 (Amex)
```

---

## Downloadable Quick Reference

### One-Pager Cheat Sheet

```
ANCHORS
^    Start of string
$    End of string
\b   Word boundary

QUANTIFIERS
*     0 or more
+     1 or more
?     0 or 1
{n}   Exactly n
{n,}  n or more
{n,m} n to m
*?    Lazy *
+?    Lazy +
??    Lazy ?

CHARACTER CLASSES
[abc]   Match a, b, or c
[^abc]  Not a, b, or c
[a-z]   Any lowercase
[A-Z]   Any uppercase
[0-9]   Any digit
\d      Digit
\D      Not digit
\w      Word char
\W      Not word char
\s      Whitespace
\S      Not whitespace

GROUPS
(abc)     Capture group
(?:abc)   Non-capturing
(?=abc)   Positive lookahead
(?!abc)   Negative lookahead
(?<=abc)  Positive lookbehind
(?<!abc)  Negative lookbehind

COMMON PATTERNS
Email:    ^[\w.-]+@[\w.-]+\.\w{2,}$
URL:      ^https?://[\w.-]+.*$
IP:       \b(?:\d{1,3}\.){3}\d{1,3}\b
Date:     \d{4}-\d{2}-\d{2}
Phone:    \d{3}-\d{3}-\d{4}
Hex:      #[0-9A-Fa-f]{6}
UUID:     [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}
```

---

## Recommended Tools

- **regex101.com** — Best for learning (explanations, debugger)
- **regexr.com** — Great for JavaScript testing
- **RegExr** — Desktop app available
- **Regex Crossword** — Learn by playing
- **Browser DevTools** — Built-in regex testing

---

## Summary

Regular expressions are powerful but require practice. Start with simple patterns, test thoroughly, and build up complexity gradually.

**Key Takeaways:**
- ✅ Use anchors (`^`, `$`) when matching complete strings
- ✅ Escape special characters (`.`, `*`, `+`, `?`, etc.)
- ✅ Use word boundaries (`\b`) for exact word matching
- ✅ Prefer lazy quantifiers (`*?`, `+?`) for HTML-like content
- ✅ Test edge cases and unexpected inputs
- ✅ Don't use regex for parsing HTML/XML
- ✅ Pre-compile patterns used repeatedly
- ✅ Comment complex patterns

---

*Last updated: April 2, 2026 | Practice at [regex101.com](https://regex101.com)*

**Related Tools:**
- [Base64 Encoder](/tools/base64)
- [URL Encoder](/tools/url-encoder)
- [HTML Entity Encoder](/tools/html-encoder)
- [JSON Formatter](/tools/json)
