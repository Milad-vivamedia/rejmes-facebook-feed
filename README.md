# Rejmes Bil - Facebook Dynamic Ads Feed

Automated Facebook Dynamic Ads feed for Rejmes Bil, showing vehicles with manufacturer warranty. Updates hourly via GitHub Actions.

## 🔗 Feed URL

Once deployed, your feed will be available at:
```
https://[YOUR-USERNAME].github.io/rejmes-facebook-feed/feed.xml
```

## 📋 Features

- ✅ **100% Free** - Uses GitHub Pages (no server costs)
- ✅ **Auto-updates** - GitHub Actions runs hourly
- ✅ **Manufacturer Warranty Filter** - Only shows vehicles with `hasManufacturerPackaging=true`
- ✅ **Facebook Compatible** - RSS 2.0 format with all required fields
- ✅ **Real-time Inventory** - Syncs from Wayke API

## 🚀 Quick Setup

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions.

### Quick Steps:
1. Create new GitHub repository: `rejmes-facebook-feed`
2. Push these files to the repository
3. Enable GitHub Actions in repository settings
4. Enable GitHub Pages (deploy from `gh-pages` branch)
5. Add feed URL to Facebook Commerce Manager

## 📊 Current Stats

- Filter: Vehicles with manufacturer warranty (`hasManufacturerPackaging=true`)
- Expected vehicles: ~108 (varies with inventory)
- Update frequency: Every hour
- Format: RSS 2.0 XML

## 🛠️ Technical Details

### Data Source
- **API**: Wayke API (https://api.wayke.se)
- **Endpoint**: `/vehicles?hasManufacturerPackaging=true&hits=200`
- **Company**: Rejmes Bil (https://www.rejmesbil.se)

### Required Facebook Fields
All required fields are included:
- ✅ `link` - Vehicle detail page
- ✅ `brand` - Manufacturer
- ✅ `condition` - new/used
- ✅ `availability` - in stock/out of stock
- ✅ `title`, `description`, `price`, `image`, etc.

## 📝 Files

- `generate-feed.js` - Main feed generator script
- `.github/workflows/update-feed.yml` - GitHub Actions workflow
- `package.json` - Node.js configuration
- `.gitignore` - Git ignore rules

## 🔄 Manual Update

To manually trigger a feed update:
1. Go to repository **Actions** tab
2. Select **Update Facebook Feed** workflow
3. Click **Run workflow**

## 📞 Support

For issues with:
- Feed format: Check Facebook Commerce Manager diagnostic tools
- API data: Contact Wayke support
- GitHub Actions: Check workflow logs in Actions tab
