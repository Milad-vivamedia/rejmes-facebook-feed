# Rejmes Bil Facebook Feed - Complete Setup Guide

This guide will walk you through setting up the automated Facebook Dynamic Ads feed for Rejmes Bil.

## Prerequisites

- GitHub account
- Facebook Business Manager access
- 10 minutes of time

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `rejmes-facebook-feed` (or any name you prefer)
3. Description: "Automated Facebook feed for Rejmes Bil"
4. Set to **Public** (required for free GitHub Pages)
5. **DO NOT** initialize with README
6. Click **Create repository**

## Step 2: Upload Files to Repository

### Option A: Using Git Command Line

```bash
# Navigate to this folder
cd rejmes-setup

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Facebook Dynamic Ads Feed for Rejmes Bil

- GitHub Actions workflow for hourly updates
- Feed generator script (fetches from Wayke API)
- Complete setup documentation
- 100% free solution using GitHub Pages"

# Add your repository as remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/rejmes-facebook-feed.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Web Interface

1. On your new repository page, click **uploading an existing file**
2. Drag and drop ALL files from the `rejmes-setup` folder:
   - `generate-feed.js`
   - `package.json`
   - `.gitignore`
   - `.github/workflows/update-feed.yml`
   - `README.md`
   - `SETUP_GUIDE.md`
3. Commit message: "Initial commit"
4. Click **Commit changes**

## Step 3: Enable GitHub Actions

1. In your repository, go to **Settings** tab
2. In left sidebar, click **Actions** → **General**
3. Under "Actions permissions":
   - Select ✅ **Allow all actions and reusable workflows**
4. Under "Workflow permissions":
   - Select ✅ **Read and write permissions**
5. Click **Save**

## Step 4: Run First Workflow

1. Go to **Actions** tab
2. Click **Update Facebook Feed** workflow
3. Click **Run workflow** → **Run workflow**
4. Wait 30-60 seconds for it to complete
5. You should see a green checkmark ✅

## Step 5: Enable GitHub Pages

1. Go to **Settings** tab
2. In left sidebar, click **Pages**
3. Under "Source":
   - Branch: Select **gh-pages**
   - Folder: Select **/ (root)**
4. Click **Save**
5. Wait 1-2 minutes for deployment

## Step 6: Get Your Feed URL

Your feed URL will be:
```
https://YOUR-USERNAME.github.io/rejmes-facebook-feed/feed.xml
```

**Test it**: Open this URL in your browser. You should see XML content with vehicle data.

Also available:
```
https://YOUR-USERNAME.github.io/rejmes-facebook-feed/
```
(Status page showing feed info)

## Step 7: Add Feed to Facebook

1. Go to [Facebook Commerce Manager](https://business.facebook.com/commerce/)
2. Go to **Catalog** → **Data Sources** → **Data Feeds**
3. Click **Add Items** → **Use Data Feeds**
4. Choose **Scheduled fetch**
5. Enter your feed URL from Step 6
6. Set update frequency: **Hourly**
7. Click **Start Upload**

### Facebook will validate your feed:
- ✅ All required fields present
- ✅ Valid RSS 2.0 format
- ✅ Vehicle data formatted correctly

## Step 8: Verify Everything Works

### Check Feed Content
Visit your feed URL and verify:
- XML is valid
- Shows ~108 vehicles (with manufacturer warranty)
- Vehicle data looks correct (prices, images, descriptions)

### Check Automatic Updates
1. Wait 1 hour
2. Go to repository **Actions** tab
3. You should see a new workflow run (scheduled)

### Check Facebook Upload
1. In Facebook Commerce Manager
2. Go to **Data Sources** → **Feeds**
3. Check upload status and any errors

## Troubleshooting

### Feed not updating?
- Check **Actions** tab for workflow errors
- Verify workflow permissions are enabled
- Check if scheduled cron job is running

### Facebook rejecting feed?
- Use Facebook's diagnostic tool
- Common issues:
  - Missing required fields (all are included)
  - Invalid XML format (check feed URL directly)
  - Image URLs not accessible

### GitHub Pages not working?
- Verify `gh-pages` branch exists
- Check Settings → Pages is enabled
- Wait 2-3 minutes after first deployment

### No vehicles in feed?
- Check Wayke API is accessible
- Verify manufacturer packaging filter is working
- Check workflow logs for API errors

## Customization

### Change Update Frequency

Edit `.github/workflows/update-feed.yml`:

```yaml
schedule:
  - cron: '0 * * * *'  # Every hour
  # - cron: '*/30 * * * *'  # Every 30 minutes
  # - cron: '0 */2 * * *'   # Every 2 hours
```

### Modify Vehicle Filter

Edit `generate-feed.js`:

```javascript
// Current filter: Vehicles with manufacturer warranty
const WAYKE_API_URL = 'https://api.wayke.se/vehicles?hasManufacturerPackaging=true&hits=200';

// Alternative: All vehicles
// const WAYKE_API_URL = 'https://api.wayke.se/vehicles?hits=200';
```

## Next Steps

1. ✅ Monitor first few automatic updates
2. ✅ Check Facebook catalog regularly for any issues
3. ✅ Create Facebook Dynamic Ads campaigns using the catalog
4. ✅ Track ad performance

## Support

- **GitHub Actions Issues**: Check Actions tab logs
- **Feed Format Issues**: Validate XML at feed URL
- **Facebook Issues**: Use Commerce Manager diagnostic tools
- **API Issues**: Contact Wayke support

---

**Estimated Setup Time**: 10 minutes
**Cost**: 100% Free (GitHub Pages)
**Maintenance**: Zero - fully automated
