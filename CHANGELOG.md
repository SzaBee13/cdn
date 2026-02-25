# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v2.0.0] - 2026-02-25

### Added
- **PocketBase Backend** - Replaced Flask-only setup with PocketBase for authentication and file storage
- **User Authentication** - Login system with admin-only account creation
- **API Tokens** - Users can generate API tokens to access private files programmatically
- **Public/Private Files** - Users can toggle files as public (🌐) or private (🔒)
- **File Ownership** - Files linked to user accounts; only owners can delete their files
- **Smart File Copying** - 📋 button to copy file URLs with authentication tokens embedded
- **Domain-Agnostic URLs** - File URLs use current page domain instead of hardcoded values
- **Docker Support** - Complete dockerization with docker-compose configuration
- **GitHub Actions CI/CD** - Automated Docker image builds on releases
- **Multi-Version Tags** - Release v1.2.3 creates tags: v1.2.3, 1.2.3, 1.2, 1, latest
- **Collections Schema** - PocketBase "files" collection with file, user, and public fields
- **API Rules** - Fine-grained access control for files (public vs private)
- **Guest Access** - Non-authenticated users can view public files
- **Comprehensive Documentation**:
  - POCKETBASE_SETUP.md - Full setup and configuration guide
  - API_TOKEN_GUIDE.md - API token usage with code examples
  - GITHUB_ACTIONS_GUIDE.md - CI/CD workflow documentation

### Changed
- **Frontend Redesign** - Completely rewrote HTML/JavaScript to use PocketBase SDK
- **Authentication Flow** - Removed self-registration; admin creates accounts via PocketBase panel
- **Upload UI** - Added public file toggle checkbox during upload
- **File List Display** - Added visual indicators (🌐/🔒) and copy URL button
- **File Management** - Users now see their own + public files; delete button only for owners
- **API Access** - Added query filters for authenticated vs public files

### Fixed
- **File URL Handling** - File URLs now work on any domain by using window.location.origin
- **CORS Configuration** - Properly configured for both PocketBase (9111) and Flask (911) ports
- **File Permissions** - Non-owners cannot delete files they don't own
- **Session Management** - Tokens properly stored and cleared on logout

### Removed
- **Flask File Upload** - Replaced with PocketBase file storage
- **Directory-Based File Storage** - Moved from /data folder to PocketBase database
- **Self-Registration** - Only admins can create accounts
- **Hardcoded Domain** - File URLs now use current page domain
- **Manual CORS Setup** - Docker configuration handles all CORS needs

### Security
- **Authentication Required** - Login required to upload files
- **Token-Based Access** - API tokens grant access to private files only
- **File Ownership Verification** - Backend validates ownership before delete
- **Session-Based Tokens** - Tokens expire on logout
- **PocketBase Rules** - Access control enforced at database level
- **Private by Default** - Files are private unless explicitly marked public

### Technical Details
- **Backend:** PocketBase (file storage + authentication)
- **Frontend:** Vanilla JavaScript with PocketBase SDK
- **Styling:** TailwindCSS
- **Containerization:** Docker & Docker Compose
- **Registry:** GitHub Container Registry (GHCR)
- **CI/CD:** GitHub Actions

### Documentation
- README.md - Quick start and project overview
- POCKETBASE_SETUP.md - Complete setup with PocketBase collection schema
- API_TOKEN_GUIDE.md - API token generation and usage examples
- GITHUB_ACTIONS_GUIDE.md - Release workflow and Docker image management
- .env.example - Configuration template
- CHANGELOG.md - This file

### Ports & Services
- **PocketBase Admin:** http://localhost:9111/_/
- **PocketBase API:** http://localhost:9111
- **Flask Frontend:** http://localhost:911 (optional)
- **Docker Image:** ghcr.io/yourusername/cdn:latest

[v1.0.0]: https://github.com/yourusername/cdn/releases/tag/v1.0.0
