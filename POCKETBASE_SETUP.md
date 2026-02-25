# PocketBase Setup Guide (Docker)

This CDN application uses PocketBase for authentication and file storage, running in Docker containers.

## Quick Start

### 1. Start the Services

```powershell
# Start PocketBase and the CDN app
docker-compose up -d
```

This will:

- Pull the PocketBase Docker image
- Start PocketBase on `http://localhost:9111`
- Start the Flask app on `http://localhost:911` (optional, for development)
- Create `pb_data` folder for database and files
- Create `pb_public` folder for static files

### 2. Create Admin Account

Visit `http://localhost:9111/_/` in your browser and create an admin account.

### 3. Create Collections

#### Create "files" Collection

1. Go to Collections in the PocketBase admin panel
2. Click "New collection"
3. Choose "Base collection"
4. Set name to `files`
5. Add the following fields:

**Fields:**

- `file` (File, Required)
  - Max Select: 1
  - Max Size: 50MB (or adjust as needed)
  
- `user` (Relation, Required)
  - Collection: users
  - Max Select: 1

- `public` (Bool, Optional)
  - Default: false
  - Allows files to be publicly accessible without authentication

**API Rules:**

Set the following rules to allow authenticated users to manage their files:

- **List/Search rule:** `@request.auth.id != "" || public = true`
  - Allows authenticated users to view all files and allows everyone to view public files
  
- **View rule:** `@request.auth.id != "" || public = true`
  - Allows authenticated users to view file details and allows everyone to view public file details
  
- **Create rule:** `@request.auth.id != "" && @request.auth.id = user`
  - Allows users to upload files and link them to their account
  
- **Update rule:** `@request.auth.id = user`
  - Allows users to update only their own files
  
- **Delete rule:** `@request.auth.id = user`
  - Allows users to delete only their own files

### 4. Configure CORS (if needed)

If you're running the frontend on a different domain/port:

1. Go to Settings > API rules
2. Add your frontend URL to the allowed origins

### 5. Update Frontend Configuration (Optional)

The frontend is already configured to use `http://localhost:9111` for PocketBase.

## Running the Application

### Option 1: Serve with PocketBase (Recommended)

Serve the static files directly from PocketBase:

1. Copy your static files to `pb_public`:

```powershell
# Create public folder and copy files
New-Item -ItemType Directory -Force -Path "pb_public"
Copy-Item "templates/index.html" "pb_public/index.html"
Copy-Item -Recurse "static" "pb_public/static"
```

2. Access the app at `http://localhost:9111/`

### Option 2: Use Flask for Development

Keep using Flask alongside PocketBase:

```powershell
# PocketBase already running in Docker
# Just access Flask at:
http://localhost:911
```

## Docker Commands

```powershell
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# View PocketBase logs only
docker-compose logs -f pocketbase

# Stop services
docker-compose down

# Stop and remove volumes (CAUTION: deletes all data)
docker-compose down -v

# Restart PocketBase
docker-compose restart pocketbase

# Access PocketBase shell
docker exec -it pocketbase sh
```

## User Registration & Login

**Important:** User registration is disabled in the application. Only administrators can create user accounts.

1. **Create users via PocketBase Admin Panel:**
   - Visit `http://localhost:9111/_/`
   - Go to Collections > users
   - Click "New record" to create user accounts

2. **Users can login** with their credentials at the application login form

3. **Public file access:**
   - Files marked as "public" during upload are accessible to everyone
   - Non-authenticated users can view public files
   - Only file owners can delete their files

## API Token Access

Logged-in users can access an API token to retrieve their private files programmatically:

1. **Get your API token:**
   - Login to the application
   - Click the "API Token" button in the header
   - Copy the token

2. **Access private files with token:**
   
   **Method 1: URL Parameter (easiest for direct file access)**
   ```
   https://yourdomain.com/api/files/COLLECTION_ID/RECORD_ID/filename.jpg?token=YOUR_TOKEN
   ```

   **Method 2: Authorization Header (for API requests)**
   ```bash
   curl -H "Authorization: YOUR_TOKEN" https://yourdomain.com/api/files/...
   ```

3. **Token features:**
   - Tokens are valid while the user session is active
   - Tokens grant access to the user's private files
   - Public files don't require a token
   - Click the 📋 button next to any file to copy its URL with token embedded

4. **Security notes:**
   - Keep your token secret
   - Don't share tokens publicly
   - Tokens expire when you logout
   - Generate a new token by logging in again

## Features

- **Authentication:** Users must login to upload files (accounts created by admin only)
- **API Token Access:** Get an API token to access private files programmatically
- **File Upload:** Drag & drop or click to upload files
- **Public Files:** Option to make files publicly accessible
- **File Management:** Users can view and delete their own uploaded files
- **Copy URLs:** Easy copy of file URLs with authentication tokens embedded
- **Secure:** Files are linked to user accounts with proper access controls
- **Guest Access:** Public files are viewable without login

## Security Notes

- Each user can only delete their own files
- File access is controlled by PocketBase rules
- Authentication tokens are stored securely in PocketBase's auth store
- Consider enabling email verification in production

## Production Deployment

For production with Docker:

1. Set a strong admin password in PocketBase admin panel
2. Enable email verification (Settings > Mail settings)
3. Configure proper CORS origins
4. Use HTTPS with a reverse proxy (nginx/Traefik)
5. Set appropriate file size limits in collection settings
6. Regular backups of `pb_data` folder
7. Use Docker volumes for persistent storage
8. Consider using Docker secrets for sensitive data

- Check that PocketBase container is running: `docker-compose ps`
- Check logs: `docker-compose logs pocketbase`
- Verify PocketBase is accessible at `http://localhost:9111`
- Check browser console for CORS errors

**Upload fails:**

- Check file size limits in the collection settings
- Verify user is logged in
- Check browser console for detailed errors
- Check PocketBase logs: `docker-compose logs pocketbase`

**Can't login:**

- Verify user was created successfully in PocketBase admin panel
- Check that collection rules are set correctly
- Check PocketBase container is healthy: `docker-compose ps`

**Containers won't start:**

- Check if ports 9111 or 911 are already in use
- View logs: `docker-compose logs`
- Ensure Docker is running

## Backup and Restore

### Backup

```powershell
# Stop containers
docker-compose down

# Backup pb_data folder
Copy-Item -Recurse "pb_data" "pb_data_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Restart containers
docker-compose up -d
```

### Restore

```powershell
# Stop containers
docker-compose down

# Restore from backup
Remove-Item -Recurse -Force "pb_data"
Copy-Item -Recurse "pb_data_backup_XXXXXX" "pb_data"

# Restart containers
docker-compose up -d
```

## Troubleshooting

**"Failed to fetch" errors:**

- Check that PocketBase is running on `http://localhost:9111`
- Check browser console for CORS errors
- Verify the PocketBase URL in script.js

**Upload fails:**

- Check file size limits in the collection settings
- Verify user is logged in
- Check browser console for detailed errors

**Can't login:**

- Verify user was created successfully in PocketBase admin panel
- Check that collection rules are set correctly
