# Simple CDN with PocketBase Authentication

A lightweight CDN-like server with user authentication, allowing file uploads via drag-and-drop or click. Built with PocketBase for backend and authentication, with a clean TailwindCSS frontend.

## Features

- **User Authentication:** Login required to upload files (admin creates accounts)
- **API Token Access:** Get tokens to access private files programmatically
- **Secure File Management:** Users can only delete their own files
- **Public Files:** Option to make files publicly accessible without login
- **Drag-and-Drop Upload:** Modern file upload interface
- **File Ownership:** Files are linked to user accounts
- **Guest Access:** Public files viewable by anyone
- **Easy URL Copying:** Copy file URLs with auth tokens embedded
- **Dockerized:** Easy deployment with Docker Compose
- **PocketBase Backend:** Fast, self-contained backend with built-in auth

## Requirements

- Docker & Docker Compose
- Modern browser (Chrome, Firefox, Edge)

## Folder Structure

```bash
cdn/
├─ server.py (Flask - optional for development)
├─ templates/
│  └─ index.html
├─ static/
│  └─ script.js
├─ data/ (legacy)
├─ pb_data/ (PocketBase database & files)
├─ pb_public/ (static files served by PocketBase)
├─ Dockerfile
├─ docker-compose.yml
├─ requirements.txt
├─ POCKETBASE_SETUP.md
└─ README.md
```

## Quick Start

1. **Start the services:**
```powershell
docker-compose up -d
```
2. **Create PocketBase admin account:**
Visit `http://localhost:9111/_/` and create an admin account.
3. **Set up the files collection:**
Follow the instructions in [POCKETBASE_SETUP.md](POCKETBASE_SETUP.md) to:
- Create the "files" collection
- Configure fields and API rules
4. **Access the application:**

- **Option A:** Serve from PocketBase (recommended)
  ```powershell
  # Copy files to pb_public
  New-Item -ItemType Directory -Force -Path "pb_public"
  Copy-Item "templates/index.html" "pb_public/index.html"
  Copy-Item -Recurse "static" "pb_public/static"
  ```
  Then visit `http://localhost:9111/`

- **Option B:** Use Flask for development
  
  Visit `http://localhost:911/`

5. **Create user accounts:**

Create user accounts via PocketBase admin panel (`http://localhost:9111/_/`), then users can login and start uploading files!

## Docker Commands

```powershell
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart PocketBase
docker-compose restart pocketbase
```

## Documentation

See [POCKETBASE_SETUP.md](POCKETBASE_SETUP.md) for detailed setup instructions, including:
- Collection schema configuration
- API rules setup
- Production deployment
- Backup and restore procedures

## API Tokens

See [API_TOKEN_GUIDE.md](API_TOKEN_GUIDE.md) for:
- Getting API tokens
- Accessing private files programmatically
- Security best practices
- Code examples

## GitHub Actions & Docker Registry

This project includes automated GitHub Actions that build and push Docker images to GHCR (GitHub Container Registry):

- Automatically builds on release creation
- Tags images with version number and `latest`
- See [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md) for setup and usage

**Quick start for releases:**
```bash
# Create a release tag
git tag v1.0.0
git push origin v1.0.0

# Image automatically builds and pushes to:
# ghcr.io/yourusername/cdn:v1.0.0
# ghcr.io/yourusername/cdn:latest
```

## Notes

- Files are stored in PocketBase's database (`pb_data/` folder)
- Each user can only manage their own files
- User accounts must be created by admin in PocketBase panel
- Files can be marked as public for unauthenticated access
- API tokens available for programmatic file access
- Click 📋 next to files to copy URLs with embedded auth tokens
- Admin panel: `http://localhost:9111/_/`
- See POCKETBASE_SETUP.md for complete configuration details