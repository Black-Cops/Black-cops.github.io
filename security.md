# Security Guidelines for Saki Browser

This document outlines security best practices for deploying and maintaining Saki Browser in production environments.

## 🔐 API Key Management

### Storage

**Never commit API keys to version control!**

✅ **Do:**
- Store keys in `.env` files (which are gitignored)
- Use environment variables in production
- Use secrets management services (AWS Secrets Manager, GCP Secret Manager, etc.)

❌ **Don't:**
- Hardcode keys in source code
- Commit `.env` files to git
- Share keys in chat/email
- Log keys in application logs

### Environment Variables

**Backend (.env):**
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
ALLOWED_ORIGINS=https://your-frontend.com
APP_URL=https://your-frontend.com
```

**Frontend (.env):**
```env
VITE_API_BASE=https://your-backend.onrender.com
VITE_CONVEX_URL=https://your-convex.cloud
```

### Key Rotation

Rotate your OpenRouter API key every 90 days or immediately if compromised:

1. **Generate new key** in OpenRouter dashboard
2. **Update environment variables**:
   - Render: Dashboard → Environment → Edit
   - Vercel: Dashboard → Settings → Environment Variables
3. **Restart services** to apply new keys
4. **Revoke old key** in OpenRouter dashboard
5. **Test** that application still works

### Access Control

- **Limit key permissions** to minimum required (if provider supports)
- **Use separate keys** for dev/staging/production
- **Monitor usage** in OpenRouter dashboard
- **Set spending limits** to prevent abuse

## 🌐 CORS Configuration

### Backend CORS Setup

Restrict allowed origins to specific domains:

```python
# main.py
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Not "*" in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Production Configuration:**
```env
ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.your-domain.com
```

### Testing CORS

```bash
# Should succeed
curl -H "Origin: https://your-app.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  https://your-backend.onrender.com/api/chat

# Should fail
curl -H "Origin: https://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  https://your-backend.onrender.com/api/chat
```

## 🔒 SSE Security Hardening

### Connection Security

**Always use HTTPS in production:**
- Backend: Render provides HTTPS automatically
- Frontend: Vercel provides HTTPS automatically

**Implement connection timeouts:**
```python
# main.py
async with httpx.AsyncClient(timeout=60.0) as client:
    # ... streaming code
```

### Rate Limiting

Implement rate limiting to prevent abuse:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/chat")
@limiter.limit("10/minute")
async def chat(request: ChatRequest):
    # ... existing code
```

Install: `pip install slowapi`

### Input Validation

Validate all user inputs:

```python
from pydantic import BaseModel, validator, Field

class ChatRequest(BaseModel):
    messages: List[Message] = Field(..., max_items=100)
    model: str = Field(..., min_length=1, max_length=100)
    stream: bool = True
    persona: str = "helpful"
    
    @validator('messages')
    def validate_messages(cls, v):
        if not v:
            raise ValueError('messages cannot be empty')
        for msg in v:
            if len(msg.content) > 10000:
                raise ValueError('message content too long')
        return v
```

### Error Handling

Don't expose sensitive information in error messages:

```python
try:
    # ... code
except Exception as e:
    logger.error(f"Internal error: {str(e)}")  # Log internally
    raise HTTPException(
        status_code=500,
        detail="An error occurred"  # Generic message to user
    )
```

## 🛡️ Convex Security

### Authentication

For production applications with user authentication:

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: "your-auth0-domain.auth0.com",
      applicationID: "your-app-id",
    }
  ]
};
```

### Data Access Control

Implement row-level security:

```typescript
// convex/workspaces.ts
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    return await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
  },
});
```

### Environment Isolation

Use separate Convex projects for different environments:

- Development: `https://dev-project.convex.cloud`
- Staging: `https://staging-project.convex.cloud`
- Production: `https://prod-project.convex.cloud`

## 🚨 Monitoring & Alerting

### Application Monitoring

**Backend (Render):**
- Enable log persistence
- Set up error notifications
- Monitor response times
- Track API usage

**Frontend (Vercel):**
- Enable Analytics
- Monitor Web Vitals
- Track error rates
- Set up Sentry or similar

### Security Monitoring

**Watch for:**
- Unusual API key usage patterns
- High error rates
- Slow response times
- CORS errors from unknown origins
- Increased traffic from single IPs

**Alert Thresholds:**
- API calls > 1000/hour
- Error rate > 5%
- Response time > 5s
- Failed auth attempts > 10/hour

### Logging Best Practices

```python
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Good logging
logger.info(f"Chat request from origin: {request.headers.get('origin')}")
logger.error(f"API error: {response.status_code}")

# Bad logging - never log sensitive data
# logger.debug(f"API Key: {OPENROUTER_API_KEY}")  # DON'T DO THIS
# logger.info(f"User message: {message.content}")  # Privacy concern
```

## 📋 Security Checklist

### Pre-Deployment

- [ ] Remove all hardcoded secrets
- [ ] Configure `.gitignore` to exclude `.env`
- [ ] Set up environment variables in hosting platforms
- [ ] Configure CORS with specific origins
- [ ] Enable HTTPS (automatic on Render/Vercel)
- [ ] Set up rate limiting
- [ ] Add input validation
- [ ] Configure error handling
- [ ] Enable logging
- [ ] Test CORS configuration

### Post-Deployment

- [ ] Verify HTTPS is working
- [ ] Test API key is working
- [ ] Monitor initial traffic
- [ ] Set up alerts
- [ ] Review logs
- [ ] Test rate limiting
- [ ] Verify CORS restrictions
- [ ] Check for exposed secrets (with tools like truffleHog)

### Ongoing Maintenance

- [ ] Rotate API keys every 90 days
- [ ] Review access logs monthly
- [ ] Update dependencies regularly
- [ ] Monitor for security advisories
- [ ] Audit user access
- [ ] Review CORS configuration
- [ ] Check rate limits are appropriate
- [ ] Test backup/recovery procedures

## 🔧 Security Headers

Add security headers to your backend:

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

# In production
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["your-backend.onrender.com"]
    )

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

## 🚨 Incident Response

### If API Key is Compromised

1. **Immediate Actions:**
   - Revoke compromised key in OpenRouter dashboard
   - Generate new key
   - Update environment variables
   - Restart all services
   - Monitor for unusual activity

2. **Investigation:**
   - Check git history for exposed keys
   - Review access logs
   - Identify how key was exposed
   - Assess impact

3. **Prevention:**
   - Update `.gitignore`
   - Add pre-commit hooks to detect secrets
   - Train team on security practices
   - Implement additional monitoring

### Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Email security@your-domain.com (or maintainer)
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security Best Practices](https://fastapi.tiangolo.com/tutorial/security/)
- [React Security Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/React_Security_Cheat_Sheet.html)
- [OpenRouter Security](https://openrouter.ai/docs/security)
- [Convex Security](https://docs.convex.dev/auth)

---

**Last Updated:** 2024
**Review Schedule:** Quarterly
