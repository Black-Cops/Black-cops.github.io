# Security Guidelines for Saki Browser

This document outlines security best practices for using and maintaining Saki Browser, particularly regarding API key management and data security.

## API Key Security

### Storage and Management

1. **Never commit API keys to version control**
   - Always use `.env` files for storing sensitive credentials
   - Ensure `.env` is listed in `.gitignore`
   - Use `.env.example` as a template without real credentials

2. **Environment Variables**
   - Store the OpenRouter API key in a `.env` file:
     ```env
     OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
     ```
   - Never hardcode API keys in source code
   - Use environment variable loading (python-dotenv) for development
   - Use secure secret management services in production

3. **File Permissions**
   - Set restrictive permissions on `.env` files:
     ```bash
     chmod 600 .env
     ```
   - Ensure only the application user can read the file

### API Key Rotation

To rotate your OpenRouter API key:

1. **Generate a New Key**
   - Log in to your OpenRouter account
   - Navigate to API Keys section
   - Generate a new API key
   - Copy the new key immediately (it won't be shown again)

2. **Update Your Environment**
   ```bash
   # Edit your .env file
   nano .env
   
   # Update the OPENROUTER_API_KEY value
   OPENROUTER_API_KEY=sk-or-v1-your-new-key-here
   ```

3. **Restart the Backend**
   ```bash
   # Stop the current backend process (Ctrl+C)
   # Start it again
   python main.py
   ```

4. **Revoke the Old Key**
   - Return to OpenRouter dashboard
   - Revoke/delete the old API key
   - Verify the application still works with the new key

5. **Update All Deployments**
   - If running multiple instances, update all of them
   - Update any CI/CD pipelines or deployment configurations
   - Update documentation if needed

### Key Rotation Schedule

- **Regular Rotation**: Rotate API keys every 90 days minimum
- **Immediate Rotation**: Rotate immediately if:
  - Key is accidentally exposed (committed to git, shared publicly)
  - Suspicious activity is detected
  - Team member with key access leaves
  - Security breach is suspected

## Production Deployment Security

### Backend Security

1. **HTTPS Only**
   - Always use HTTPS in production
   - Redirect HTTP to HTTPS
   - Use valid SSL/TLS certificates

2. **CORS Configuration**
   - Restrict `allow_origins` to specific domains:
     ```python
     app.add_middleware(
         CORSMiddleware,
         allow_origins=["https://yourdomain.com"],
         allow_credentials=True,
         allow_methods=["GET", "POST"],
         allow_headers=["*"],
     )
     ```

3. **Rate Limiting**
   - Implement rate limiting to prevent abuse
   - Use tools like `slowapi` for FastAPI
   - Set reasonable limits per user/IP

4. **Input Validation**
   - Validate all user inputs
   - Sanitize messages before forwarding to OpenRouter
   - Set maximum message length limits

5. **Error Handling**
   - Don't expose internal errors to clients
   - Log errors securely without exposing sensitive data
   - Implement proper error recovery

### Frontend Security

1. **Content Security Policy (CSP)**
   - Add CSP headers to prevent XSS attacks
   - Restrict script sources
   - Prevent inline script execution where possible

2. **Data Sanitization**
   - Sanitize all user inputs
   - Escape HTML in markdown rendering
   - Validate code before download

3. **Secure Communication**
   - Always use HTTPS for API calls
   - Implement request timeouts
   - Handle network errors gracefully

### Monitoring and Logging

1. **Access Logs**
   - Log all API requests (without sensitive data)
   - Monitor for unusual patterns
   - Set up alerts for suspicious activity

2. **Error Logs**
   - Log errors with context
   - Don't log API keys or user data
   - Implement log rotation

3. **Usage Monitoring**
   - Track API usage and costs
   - Set up billing alerts with OpenRouter
   - Monitor for unexpected usage spikes

## Data Privacy

### User Data

1. **No Persistent Storage**
   - Current implementation stores sessions in browser memory only
   - Sessions are lost on page reload
   - No server-side session storage

2. **Conversation Privacy**
   - Messages are sent to OpenRouter for processing
   - Review OpenRouter's privacy policy
   - Inform users their conversations are processed by AI

3. **GDPR Compliance**
   - Don't collect personal information without consent
   - Provide clear privacy policy
   - Implement data deletion on request if storing data

### Future Enhancements

If implementing persistent storage:

1. **Database Security**
   - Encrypt sensitive data at rest
   - Use parameterized queries to prevent SQL injection
   - Implement proper access controls

2. **User Authentication**
   - Use secure authentication methods (OAuth, JWT)
   - Implement password policies
   - Enable two-factor authentication

3. **Session Management**
   - Use secure session tokens
   - Implement session expiration
   - Invalidate sessions on logout

## Incident Response

### If API Key is Compromised

1. **Immediate Actions**
   - Rotate the API key immediately
   - Check OpenRouter usage logs for unauthorized access
   - Review application logs for suspicious activity

2. **Investigation**
   - Determine how the key was exposed
   - Identify affected systems
   - Document the incident

3. **Prevention**
   - Update security practices
   - Implement additional safeguards
   - Train team members on security best practices

### Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Contact the maintainers privately
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be fixed before public disclosure

## Security Checklist

### Development
- [ ] `.env` file is in `.gitignore`
- [ ] No API keys in source code
- [ ] Environment variables are properly loaded
- [ ] Input validation is implemented
- [ ] Error messages don't expose sensitive information

### Deployment
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Monitoring is set up
- [ ] Logs are secure and rotated
- [ ] API key is stored securely (not in code or config files)

### Maintenance
- [ ] API keys are rotated regularly
- [ ] Dependencies are updated
- [ ] Security patches are applied promptly
- [ ] Access logs are reviewed periodically
- [ ] Backup and recovery procedures are tested

## Additional Resources

- [OpenRouter Security Best Practices](https://openrouter.ai/docs/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

## Updates

This security document should be reviewed and updated:
- Every 6 months
- After any security incident
- When adding new features
- When changing infrastructure

---

**Last Updated:** 2024
**Version:** 1.0
