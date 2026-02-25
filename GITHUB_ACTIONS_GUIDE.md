# GitHub Actions - Docker Build & Push

This project includes automated GitHub Actions workflows to build and push Docker images to GitHub Container Registry (GHCR).

## Setup

### 1. Initial Configuration

The workflow is configured in [.github/workflows/build-and-push.yml](.github/workflows/build-and-push.yml) and runs automatically.

### 2. Configure Repository Settings

**Enable Container Registry:**
1. Go to your GitHub repository
2. Settings → Packages and Registries
3. Ensure "Docker packages" is enabled

**Set Package Visibility (optional):**
1. Go to your repository's Packages section
2. Find the package
3. Click "Package settings"
4. Set visibility to Public if you want others to pull the image

## How It Works

### Triggers

The workflow runs **only on GitHub Releases**:

1. **GitHub Releases** (Primary)
   - Creates images with multiple version tags
   - Example: Release tag `v1.0.0` creates multiple tags

### Docker Image Tags

On each release, images are created with all version variants:

**Example for release tag `v1.2.3`:**
- `ghcr.io/yourusername/cdn:v1.2.3` (original tag with v)
- `ghcr.io/yourusername/cdn:1.2.3` (version without v)
- `ghcr.io/yourusername/cdn:1.2` (major.minor without v)
- `ghcr.io/yourusername/cdn:1` (major version only)
- `ghcr.io/yourusername/cdn:latest` (always points to latest release)

### Semantic Versioning Examples

```
v1.0.0      → Creates: v1.0.0, 1.0.0, 1.0, 1, latest
v1.2.3      → Creates: v1.2.3, 1.2.3, 1.2, 1, latest
v2.5.1      → Creates: v2.5.1, 2.5.1, 2.5, 2, latest
v0.1.0-beta → Creates: v0.1.0-beta, 0.1.0-beta, 0.1, 0, latest
```

## Creating a Release

### Method 1: Via GitHub Web UI

1. Go to your repository
2. Click "Releases" on the sidebar
3. Click "Create a new release"
4. **Tag version:** Enter `v1.0.0` (use semantic versioning)
5. **Release title:** "Version 1.0.0" (or any description)
6. **Description:** Add release notes (optional)
7. Click "Publish release"

The workflow will automatically:
- Build the Docker image
- Tag it with all version variants
- Push to GHCR

### Method 2: Via Git Command Line

```bash
# Create a git tag
git tag v1.0.0

# Add a message to the tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push the tag to GitHub
git push origin v1.0.0

# The workflow triggers automatically
```

## Using the Docker Image

### Pull from GHCR

```bash
# Pull latest release
docker pull ghcr.io/yourusername/cdn:latest

# Pull specific version (with or without v)
docker pull ghcr.io/yourusername/cdn:v1.0.0
docker pull ghcr.io/yourusername/cdn:1.0.0

# Pull major.minor version (always latest patch)
docker pull ghcr.io/yourusername/cdn:1.0

# Pull major version only (always latest minor.patch)
docker pull ghcr.io/yourusername/cdn:1
```

**Version tag benefits:**
- `1.0` = Always get latest patch for 1.0.x
- `1` = Always get latest minor.patch for 1.x.x  
- `latest` = Always get the latest release
- `v1.0.0` = Exact pinned version

### Using in Docker Compose

Update `docker-compose.yml` to use the built image:

```yaml
services:
  cdn:
    # Option 1: Always use latest release
    image: ghcr.io/yourusername/cdn:latest
    
    # Option 2: Pin to major version (get latest patches)
    # image: ghcr.io/yourusername/cdn:1
    
    # Option 3: Pin to major.minor (get latest patch only)
    # image: ghcr.io/yourusername/cdn:1.2
    
    # Option 4: Pin to exact version
    # image: ghcr.io/yourusername/cdn:v1.0.0
    
    container_name: cdn
    ports:
      - "911:911"
    volumes:
      - ./data:/app/data
      - ./static:/app/static
      - ./templates:/app/templates
    depends_on:
      pocketbase:
        condition: service_healthy
    restart: unless-stopped
```

### Using in a Dockerfile

```dockerfile
FROM ghcr.io/yourusername/cdn:1.0

# Your additional configuration
```

## Viewing Workflow Runs

The workflow **only runs when you create a release**:

1. Go to your GitHub repository
2. Click "Actions" tab
3. You'll see "Build and Push Docker Image" runs
4. **Each run corresponds to a release**

**Check what was built:**
- Click a specific run
- Scroll to "Build and push Docker image"
- Expand to see build output and push details

## Authentication for Private Repositories

If your repository is private, users need to authenticate:

```bash
# Login to GHCR (use Personal Access Token)
docker login ghcr.io -u yourusername -p YOUR_PERSONAL_ACCESS_TOKEN

# Then pull the image
docker pull ghcr.io/yourusername/cdn:latest
```

## Environment Variables

The workflow uses:
- `REGISTRY`: Set to `ghcr.io` (cannot be changed)
- `IMAGE_NAME`: Automatically set from repository name

## Troubleshooting

**"Permission denied" error:**
- Check that GitHub Actions has permission to push packages
- Go to Settings → Actions → General
- Ensure "Allow GitHub Actions to create and approve pull requests" is enabled

**Image not pushed:**
- Check the Actions tab for workflow errors
- Verify release was published (not in draft)
- Ensure Dockerfile exists in repository root

**Image not pulling:**
- Verify image name: `ghcr.io/USERNAME/REPOSITORY:TAG`
- Check repository visibility (private repos need auth)
- Use `docker pull` command with correct tag

## Manual Trigger

The workflow **automatically triggers on every release**.

To manually trigger:
1. Create a new release on GitHub
2. The workflow runs automatically
3. Images are built and pushed to GHCR

## Cache Strategy

The workflow uses GitHub Actions cache to speed up builds:
- Images are cached between runs
- Cache is automatically invalidated when dependencies change
- Reduces build time by 30-50% for subsequent builds

## Next Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add GitHub Actions workflow"
   git push origin main
   ```

2. **Create your first release**
   - Follow "Creating a Release" section above
   - Use tag `v0.1.0` or `v1.0.0`

3. **Verify the build**
   - Check Actions tab for successful run
   - Verify image appears in your Packages

4. **Start using the image**
   - Pull with `docker pull ghcr.io/yourusername/cdn:latest`
   - Update docker-compose.yml to use it

## Security Notes

- **GITHUB_TOKEN:** Automatically created per workflow run (never hardcode!)
- **Personal Access Token:** Only needed for manual authentication
- **Repository visibility:** Public = public images, Private = private images
- **Best practice:** Keep releases versioned and documented

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GHCR Documentation](https://docs.github.com/en/packages/container-packages/about-container-packages)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Semantic Versioning](https://semver.org/)
