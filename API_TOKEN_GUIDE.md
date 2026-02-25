# API Token Usage Guide

This guide explains how to use API tokens to access your private files programmatically.

## Getting Your API Token

1. Login to the CDN application
2. Click the "API Token" button in the header
3. Copy your token from the displayed field

**Note:** Tokens are session-based and expire when you logout.

## Using the API Token

### Method 1: URL Parameter (Recommended for Direct Access)

Add `?token=YOUR_TOKEN` to the end of any file URL:

```
https://yourdomain.com/api/files/COLLECTION_ID/RECORD_ID/filename.jpg?token=YOUR_TOKEN
```

**Use cases:**
- Direct browser access to private images
- Embedding private files in HTML/markdown
- Sharing temporary access to files

**Example:**
```html
<img src="https://cdn.example.com/api/files/abc123/xyz789/photo.jpg?token=eyJhbGc...">
```

### Method 2: Authorization Header (For API Requests)

Include your token in the `Authorization` header:

```bash
curl -H "Authorization: YOUR_TOKEN" \
     https://yourdomain.com/api/files/COLLECTION_ID/RECORD_ID/filename.jpg
```

**Use cases:**
- Programmatic file downloads
- API integrations
- Automated scripts

**Example (Python):**
```python
import requests

token = "eyJhbGc..."
url = "https://cdn.example.com/api/files/abc123/xyz789/file.pdf"

response = requests.get(url, headers={"Authorization": token})
with open("downloaded.pdf", "wb") as f:
    f.write(response.content)
```

**Example (JavaScript/Node.js):**
```javascript
const token = "eyJhbGc...";
const url = "https://cdn.example.com/api/files/abc123/xyz789/file.pdf";

fetch(url, {
    headers: {
        "Authorization": token
    }
})
.then(response => response.blob())
.then(blob => {
    // Handle file blob
});
```

## Quick Copy Feature

For convenience, the CDN application provides a 📋 button next to each file:

1. Click the 📋 button next to any file
2. The complete URL with token is copied to your clipboard
3. Paste wherever you need it

## Public vs Private Files

- **Public files:** Accessible without a token (marked with 🌐)
- **Private files:** Require authentication token (marked with 🔒)

## Security Best Practices

### ✅ DO:
- Keep your tokens confidential
- Use tokens only in secure contexts (HTTPS)
- Regenerate tokens when compromised (logout and login again)
- Use short-lived sessions for sensitive data

### ❌ DON'T:
- Share tokens in public repositories
- Commit tokens to version control
- Use tokens in client-side JavaScript for sensitive files
- Share tokens via insecure channels (plain text email, chat, etc.)

## Token Lifecycle

1. **Created:** When you login to the application
2. **Valid:** While your session is active
3. **Expired:** When you logout or session times out
4. **Renewed:** By logging in again

## File Access Control

Token-based access respects PocketBase rules:

- You can access **your own private files** with your token
- You can access **any public file** without a token
- You **cannot** access other users' private files even with your token

## Troubleshooting

**Token doesn't work:**
- Verify you're logged in
- Check token wasn't truncated when copying
- Ensure token is recent (login again if old)

**"Unauthorized" errors:**
- Token may have expired (logout and login)
- You may be trying to access another user's private file
- Check that the file actually exists

**CORS errors:**
- Ensure PocketBase CORS settings allow your domain
- Use proper headers when making requests

## Examples for Common Scenarios

### Scenario 1: Display Private Image in Web App

```html
<!-- Get token from logged-in user -->
<img src="https://cdn.example.com/api/files/.../image.jpg?token=USER_TOKEN" alt="Private Image">
```

### Scenario 2: Download File via Script

```bash
#!/bin/bash
TOKEN="your_token_here"
FILE_URL="https://cdn.example.com/api/files/.../document.pdf"

curl -H "Authorization: $TOKEN" "$FILE_URL" -o downloaded.pdf
```

### Scenario 3: Batch Download Multiple Files

```python
import requests

token = "your_token_here"
files = [
    "https://cdn.example.com/api/files/.../file1.jpg",
    "https://cdn.example.com/api/files/.../file2.jpg",
    "https://cdn.example.com/api/files/.../file3.jpg"
]

for i, url in enumerate(files):
    response = requests.get(
        url,
        headers={"Authorization": token}
    )
    with open(f"file_{i}.jpg", "wb") as f:
        f.write(response.content)
    print(f"Downloaded file {i+1}")
```

## Support

For more information about PocketBase authentication, see:
- [POCKETBASE_SETUP.md](POCKETBASE_SETUP.md)
- [PocketBase Documentation](https://pocketbase.io/docs/)
