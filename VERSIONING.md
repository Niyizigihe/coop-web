# Versioning & Release Guide

## Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH).

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Creating a Release

### Method 1: Automated Version Bump

1. Go to **Actions** → **Semantic Versioning**
2. Click **Run workflow**
3. Select version type: `major`, `minor`, or `patch`
4. Click **Run workflow**

This will:
- Calculate new version
- Update `package.json`
- Create a git tag
- Trigger the release workflow
- Build and push Docker image

### Method 2: Manual Tag

```bash
# Create a version tag
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3
```

The release workflow automatically triggers on version tags (`v*.*.*`).

## Docker Images

### Naming Convention
- `your-docker-username/coop-web:v1.2.3` - Specific version
- `your-docker-username/coop-web:latest` - Latest release

### Pulling Images

```bash
# Pull specific version
docker pull your-docker-username/coop-web:v1.2.3

# Pull latest
docker pull your-docker-username/coop-web:latest

# Run container
docker run -p 3000:3000 your-docker-username/coop-web:v1.2.3
```

## GitHub Releases

All tagged versions are automatically published as GitHub Releases with:
- Release notes
- Docker image references
- Commit information

View releases: https://github.com/your-repo/releases

## CI/CD Workflow

```
Code Push
    ↓
Run Tests (ci.yml)
    ↓
Version Bump (version.yml) - Manual trigger
    ↓
Create Tag + GitHub Release
    ↓
Build Docker Image (release.yml)
    ↓
Push to Docker Hub
    ↓
Create Release Manifest
    ↓
Notify Slack
```

## Release Checklist

- [ ] All tests passing
- [ ] CHANGELOG updated
- [ ] Version number decided (major/minor/patch)
- [ ] Trigger version workflow
- [ ] Verify Docker image on Docker Hub
- [ ] Test deployed image
- [ ] Announce release
