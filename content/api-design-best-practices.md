# API Design Best Practices: A Complete Guide

**Published:** March 30, 2026  
**Reading Time:** 16 minutes  
**Category:** Developer Tools

---

## Table of Contents

1. [REST API Design](#rest-api-design)
2. [HTTP Methods and Status Codes](#http-methods-and-status-codes)
3. [URL Structure](#url-structure)
4. [Request and Response Formats](#request-and-response-formats)
5. [Authentication and Security](#authentication-and-security)
6. [Rate Limiting](#rate-limiting)
7. [Versioning](#versioning)
8. [Error Handling](#error-handling)
9. [Documentation](#documentation)
10. [Testing](#testing)

---

## REST API Design

### REST Principles

**Resource-Based:**
```
✅ /users           (collection)
✅ /users/123       (specific resource)
✅ /users/123/posts (sub-resource)

❌ /getUsers
❌ /createUser
```

**Stateless:**
- No server-side session
- Each request contains all necessary information
- Authentication in every request

**Cacheable:**
- Responses explicitly marked as cacheable
- Improves performance
- Reduces server load

### HTTP Methods

| Method | Operation | Idempotent |
|--------|-----------|------------|
| GET | Read | Yes |
| POST | Create | No |
| PUT | Update/Replace | Yes |
| PATCH | Partial Update | No |
| DELETE | Delete | Yes |

---

## URL Structure

### URL Patterns

```
Base URL: https://api.example.com/v1

Resources:
GET    /users                 # List users
POST   /users                 # Create user
GET    /users/{id}            # Get user
PUT    /users/{id}            # Update user
PATCH  /users/{id}            # Partial update
DELETE /users/{id}            # Delete user
GET    /users/{id}/orders     # Get user's orders
POST   /users/{id}/orders     # Create order for user
```

### Query Parameters

```
GET /users?page=1&limit=10
GET /users?role=admin&status=active
GET /products?sort=price&order=desc
GET /search?q=keyword&category=books
```

**Standard Parameters:**
- `page` / `offset` - Pagination
- `limit` / `size` - Page size
- `sort` - Sort field
- `order` - asc/desc
- `q` - Search query
- `fields` - Field selection

---

## Request and Response Formats

### Request Format

```http
POST /api/v1/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer token123

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

### Response Format

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/users/123

{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2026-03-30T10:00:00Z",
  "_links": {
    "self": "/api/v1/users/123",
    "orders": "/api/v1/users/123/orders"
  }
}
```

### Response Wrapper

```json
{
  "data": {
    "id": "123",
    "name": "John Doe"
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  },
  "links": {
    "self": "/api/v1/users?page=1",
    "next": "/api/v1/users?page=2",
    "prev": null
  }
}
```

---

## Authentication and Security

### API Keys

```http
GET /api/v1/users HTTP/1.1
X-API-Key: your-api-key-here
```

**Pros:** Simple, fast  
**Cons:** Hard to revoke, no user context

### Bearer Tokens (JWT)

```http
GET /api/v1/users HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Pros:** Stateless, scalable, user context  
**Cons:** Token size, can't revoke immediately

### OAuth 2.0

```
Authorization Code Flow:
1. User authorizes app
2. Get authorization code
3. Exchange code for tokens
4. Use access token
5. Refresh when expired
```

### Security Headers

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'none'
```

---

## Rate Limiting

### Standard Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 3600
```

### Response When Limited

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Retry-After: 3600

{
  "error": "Rate limit exceeded",
  "message": "You have exceeded 1000 requests per hour",
  "retryAfter": 3600
}
```

### Rate Limit Strategies

| Strategy | Use Case |
|----------|----------|
| Fixed Window | Simple counting |
| Sliding Window | Smooth rate distribution |
| Token Bucket | Burst handling |
| Leaky Bucket | Constant output rate |

---

## Versioning

### URL Versioning (Recommended)

```
/api/v1/users
/api/v2/users
```

**Pros:** Clear, cacheable, bookmarkable  
**Cons:** URL changes

### Header Versioning

```http
GET /api/users HTTP/1.1
Accept: application/vnd.api.v1+json
```

**Pros:** Clean URLs  
**Cons:** Harder to test, less discoverable

### Deprecation Strategy

```http
Sunset: Sat, 31 Dec 2026 23:59:59 GMT
Deprecation: true
Link: </api/v2/users>; rel="successor-version"
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "age",
        "message": "Must be at least 18"
      }
    ],
    "requestId": "req-123-456"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 204 | No Content | Delete success |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing credentials |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Semantic errors |
| 429 | Too Many Requests | Rate limit |
| 500 | Server Error | Internal error |
| 503 | Service Unavailable | Maintenance |

---

## Documentation

### OpenAPI (Swagger)

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
```

### Documentation Tools

- **Swagger UI** - Interactive docs
- **Redoc** - Responsive documentation
- **Postman** - API testing + docs
- **Stoplight** - Design-first approach

---

## Testing

### Unit Tests

```javascript
describe('User API', () => {
  test('GET /users returns list', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .expect(200);
    
    expect(res.body.data).toBeArray();
  });
  
  test('POST /users creates user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ name: 'John', email: 'john@example.com' })
      .expect(201);
    
    expect(res.body.data.name).toBe('John');
  });
});
```

### Contract Testing

```javascript
// Pact contract test
const pact = new Pact({
  consumer: 'WebApp',
  provider: 'UserService'
});

test('user service contract', async () => {
  await pact.addInteraction({
    state: 'user exists',
    uponReceiving: 'get user by id',
    withRequest: {
      method: 'GET',
      path: '/api/v1/users/123'
    },
    willRespondWith: {
      status: 200,
      body: {
        id: '123',
        name: 'John'
      }
    }
  });
});
```

---

## Conclusion

### Best Practices Checklist

- [ ] Use resource-based URLs
- [ ] Proper HTTP methods
- [ ] Consistent response format
- [ ] Secure authentication
- [ ] Rate limiting
- [ ] Versioning strategy
- [ ] Comprehensive error handling
- [ ] OpenAPI documentation
- [ ] Contract testing
- [ ] Monitoring and logging

### Design Principles

✅ **RESTful resources** - Nouns, not verbs  
✅ **Consistent patterns** - Predictable URLs  
✅ **Stateless** - Each request independent  
✅ **Cacheable** - Proper headers  
✅ **Versioned** - Support evolution  
✅ **Secure** - Authentication + HTTPS  
✅ **Documented** - OpenAPI spec  
✅ **Tested** - Contract tests  

---

*Last updated: March 30, 2026*  
*Related: [Technical SEO for Developers](/content/technical-seo-developers)*

**Related Tools:**
- [JSON Formatter](/tools/json-formatter)
- [URL Encoder](/tools/url-encoder)
- [Base64 Encoder](/tools/base64)

---

<!-- Email CTA -->
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; margin: 2rem 0; border-radius: 12px; color: white; text-align: center;">
  <h4 style="margin: 0 0 0.75rem 0; font-size: 1.25rem;">Get the API Design Template Pack</h4>
  <p style="margin: 0 0 1rem 0; opacity: 0.95;">Join 500+ developers. Get <strong>OpenAPI templates + API design patterns</strong> + weekly API tips.</p>
  <form id="emailCtaForm8" style="display: flex; gap: 0.5rem; max-width: 400px; margin: 0 auto; flex-wrap: wrap; justify-content: center;">
    <input type="email" id="emailCta8" placeholder="your@email.com" required style="flex: 1; min-width: 200px; padding: 0.75rem 1rem; border: none; border-radius: 6px; font-size: 1rem;">
    <button type="submit" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer;">Get Templates</button>
  </form>
  <p style="font-size: 0.875rem; opacity: 0.8; margin-top: 0.75rem;">No spam. Instant download. Build better APIs.</p>
</div>
<script>
document.getElementById('emailCtaForm8').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('emailCta8').value;
  let emails = JSON.parse(localStorage.getItem('ghp_emails') || '[]');
  emails.push({email: email, source: 'api-design-article', timestamp: new Date().toISOString()});
  localStorage.setItem('ghp_emails', JSON.stringify(emails));
  if (typeof gtag !== 'undefined') gtag('event', 'email_signup', {category: 'lead_capture', label: 'api-design'});
  this.innerHTML = '<p style="margin:0">✓ Templates sent! Check your inbox.</p>';
});
</script>