/**
 * Facebook Dynamic Ads Feed Generator for Rejmes Bil
 * Runs on GitHub Actions every hour
 * Filters: hasManufacturerPackaging=true (vehicles with manufacturer warranty)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const WAYKE_API_URL = 'https://api.wayke.se/vehicles?hasManufacturerPackaging=true&hits=200';
const OUTPUT_DIR = './output';
const OUTPUT_FILE = 'feed.xml';

/**
 * Fetch vehicles from Wayke API
 */
function fetchVehicles() {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://www.rejmesbil.se',
        'Referer': 'https://www.rejmesbil.se/'
      }
    };

    https.get(WAYKE_API_URL, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.documentList || !json.documentList.documents) {
            reject(new Error('Invalid API response structure'));
            return;
          }
          console.log(`✅ Fetched ${json.documentList.documents.length} vehicles`);
          resolve(json.documentList.documents);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Map fuel type from Wayke to Facebook format
 */
function mapFuelType(fuelType) {
  const mapping = {
    'Laddhybrid': 'Plug-in Hybrid',
    'El': 'Electric',
    'Elektrisk': 'Electric',
    'Bensin': 'Gasoline',
    'Diesel': 'Diesel',
    'Elhybrid': 'Hybrid',
    'Förbränningsmotor': 'Gasoline'
  };
  return mapping[fuelType] || fuelType;
}

/**
 * Map transmission type
 */
function mapTransmission(gearboxType) {
  const mapping = {
    'Automat': 'Automatic',
    'Manuell': 'Manual'
  };
  return mapping[gearboxType] || gearboxType;
}

/**
 * Get body style from model series
 */
function getBodyStyle(modelSeries) {
  const suvModels = ['XC40', 'XC60', 'XC90', 'Q3', 'Q5', 'X3', 'X5', 'Sportage', 'Tucson', 'Kona'];
  const wagonModels = ['V60', 'V90'];

  if (suvModels.includes(modelSeries)) {
    return 'SUV';
  } else if (wagonModels.includes(modelSeries)) {
    return 'Wagon';
  }
  return 'Sedan';
}

/**
 * Determine vehicle condition
 */
function getVehicleCondition(modelYear) {
  const currentYear = new Date().getFullYear();
  return (modelYear >= currentYear) ? 'NEW' : 'USED';
}

/**
 * Clean and format description
 */
function formatDescription(vehicle) {
  const parts = [];

  if (vehicle.shortDescription) {
    parts.push(vehicle.shortDescription);
  }

  if (vehicle.equipmentLevel) {
    parts.push(`Utrustningsnivå: ${vehicle.equipmentLevel}`);
  }

  parts.push(`Miltal: ${vehicle.mileage.toLocaleString('sv-SE')} mil`);
  parts.push(`Årsmodell: ${vehicle.modelYear}`);
  parts.push(`Växellåda: ${vehicle.gearboxType}`);
  parts.push(`Bränsle: ${vehicle.fuelType}`);

  if (vehicle.registrationNumber) {
    parts.push(`Registreringsnummer: ${vehicle.registrationNumber}`);
  }

  parts.push('Kontakta oss för mer information om detta fordon');

  return parts.join('. ') + '.';
}

/**
 * Get best image URL
 */
function getImageUrl(vehicle) {
  if (vehicle.featuredImage && vehicle.featuredImage.files && vehicle.featuredImage.files[0]) {
    const formats = vehicle.featuredImage.files[0].formats;

    // Try to find 800x or 770x514 format
    for (const format of formats) {
      if (format.format === '800x' || format.format === '770x514') {
        return format.jpeg || format.url;
      }
    }

    // Fallback to first available
    if (formats[0]) {
      return formats[0].jpeg || formats[0].url;
    }
  }
  return '';
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate XML feed in RSS 2.0 format for Facebook
 */
function generateXMLFeed(vehicles) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
  xml += '  <channel>\n';
  xml += '    <title>Rejmes Bil - Begagnade Bilar med Tillverkarg</title>\n';
  xml += '    <link>https://www.rejmesbil.se</link>\n';
  xml += '    <description>Rejmes Bil Vehicle Inventory - Manufacturer Warranty</description>\n';

  let processedCount = 0;
  let skippedCount = 0;

  vehicles.forEach(vehicle => {
    // Skip if missing essential data
    if (!vehicle.id || !vehicle.manufacturer || !vehicle.price) {
      skippedCount++;
      return;
    }

    xml += '    <item>\n';

    // Required Facebook fields
    xml += '    <google_product_category>916</google_product_category>\n';
    xml += '    <fb_product_category>173</fb_product_category>\n';
    xml += `    <vehicle_id>${escapeXml(vehicle.id)}</vehicle_id>\n`;

    // Registration plate
    if (vehicle.registrationNumber) {
      xml += `    <vehicle_registration_plate>${escapeXml(vehicle.registrationNumber)}</vehicle_registration_plate>\n`;
    }

    // Title
    const titleParts = [vehicle.manufacturer];
    if (vehicle.modelSeries) titleParts.push(vehicle.modelSeries);
    if (vehicle.shortDescription) titleParts.push(vehicle.shortDescription);
    const title = titleParts.join(' ').substring(0, 200);
    xml += `    <title>${escapeXml(title)}</title>\n`;

    // Description
    const description = formatDescription(vehicle);
    xml += `    <description>${escapeXml(description)}</description>\n`;

    // URL / Link (Facebook requires 'link' field)
    const vehicleUrl = `https://www.rejmesbil.se/sok/id/${vehicle.id}`;
    xml += `    <link>${escapeXml(vehicleUrl)}</link>\n`;
    xml += `    <url>${escapeXml(vehicleUrl)}</url>\n`;

    // Make / Brand (Facebook requires 'brand' field)
    xml += `    <brand>${escapeXml(vehicle.manufacturer)}</brand>\n`;
    xml += `    <make>${escapeXml(vehicle.manufacturer)}</make>\n`;

    // Image
    const imageUrl = getImageUrl(vehicle);
    if (imageUrl) {
      xml += '    <image>\n';
      xml += `      <url>${escapeXml(imageUrl)}</url>\n`;
      xml += '      <tag>Exterior</tag>\n';
      xml += '    </image>\n';
    }

    if (vehicle.modelSeries) {
      xml += `    <model>${escapeXml(vehicle.modelSeries)}</model>\n`;
    }

    // Year
    if (vehicle.modelYear) {
      xml += `    <year>${vehicle.modelYear}</year>\n`;
    }

    // Mileage (convert from Swedish mil to km)
    if (vehicle.mileage) {
      xml += '    <mileage>\n';
      xml += `      <value>${vehicle.mileage * 10}</value>\n`;
      xml += '      <unit>KM</unit>\n';
      xml += '    </mileage>\n';
    }

    // Body style
    const bodyStyle = getBodyStyle(vehicle.modelSeries || '');
    xml += `    <body_style>${bodyStyle}</body_style>\n`;

    // Fuel type
    if (vehicle.fuelType) {
      const fuelType = mapFuelType(vehicle.fuelType);
      xml += `    <fuel_type>${escapeXml(fuelType)}</fuel_type>\n`;
    }

    // Transmission
    if (vehicle.gearboxType) {
      const transmission = mapTransmission(vehicle.gearboxType);
      xml += `    <transmission>${transmission}</transmission>\n`;
    }

    // Price
    const price = `${vehicle.price} SEK`;
    xml += `    <price>${price}</price>\n`;

    // Address
    if (vehicle.position && vehicle.position.city) {
      xml += '    <address format="simple">\n';

      const branchName = (vehicle.branches && vehicle.branches[0])
        ? vehicle.branches[0].name
        : `Rejmes Bil ${vehicle.position.city}`;

      xml += `      <component name="addr1">${escapeXml(branchName)}</component>\n`;
      xml += `      <component name="city">${escapeXml(vehicle.position.city)}</component>\n`;
      xml += `      <component name="region">${escapeXml(vehicle.position.city)}</component>\n`;
      xml += '      <component name="country">SE</component>\n';
      xml += '    </address>\n';
    }

    // Sale price
    xml += `    <sale_price>${price}</sale_price>\n`;

    // Availability (Facebook standard format)
    const availability = (vehicle.status === 'Published') ? 'in stock' : 'out of stock';
    xml += `    <availability>${availability}</availability>\n`;

    // Condition (Facebook requires lowercase: new, used, refurbished)
    const state = getVehicleCondition(vehicle.modelYear || 0);
    const condition = state === 'NEW' ? 'new' : 'used';
    xml += `    <condition>${condition}</condition>\n`;
    xml += `    <state_of_vehicle>${state}</state_of_vehicle>\n`;

    // Dealer ID
    if (vehicle.branches && vehicle.branches[0] && vehicle.branches[0].id) {
      xml += `    <dealer_id>${escapeXml(vehicle.branches[0].id)}</dealer_id>\n`;
    }

    xml += '    </item>\n';
    processedCount++;
  });

  xml += '  </channel>\n';
  xml += '</rss>';

  console.log(`✅ Generated feed with ${processedCount} vehicles`);
  if (skippedCount > 0) {
    console.log(`⚠️  Skipped ${skippedCount} vehicles (missing required data)`);
  }

  return xml;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting feed generation...');
    console.log(`📡 Fetching from: ${WAYKE_API_URL}`);

    // Fetch vehicles
    const vehicles = await fetchVehicles();

    // Generate XML
    const xml = generateXMLFeed(vehicles);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Write XML to file
    const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);
    fs.writeFileSync(outputPath, xml, 'utf8');

    console.log(`💾 Saved feed to: ${outputPath}`);
    console.log(`📊 File size: ${(xml.length / 1024).toFixed(2)} KB`);
    console.log('✅ Feed generation complete!');

    // Also create an index.html for GitHub Pages
    const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Rejmes Bil Facebook Feed</title>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    h1 { color: #333; }
    .info { background: #f0f0f0; padding: 20px; border-radius: 5px; }
    .feed-url { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>🚗 Rejmes Bil Facebook Dynamic Ads Feed</h1>

  <div class="info">
    <h2>Feed URL</h2>
    <div class="feed-url">
      <strong>Use this URL in Facebook Commerce Manager:</strong><br><br>
      <code id="feedUrl">Loading...</code>
    </div>

    <h2>Status</h2>
    <p>✅ Feed is active and updating automatically every hour</p>
    <p>Last updated: <strong>${new Date().toLocaleString('sv-SE')}</strong></p>
    <p>Total vehicles: <strong>${vehicles.length}</strong></p>

    <h2>Quick Links</h2>
    <ul>
      <li><a href="feed.xml">View XML Feed</a></li>
      <li><a href="https://business.facebook.com/commerce/" target="_blank">Facebook Commerce Manager</a></li>
      <li><a href="https://www.rejmesbil.se" target="_blank">Rejmes Bil Website</a></li>
    </ul>
  </div>

  <script>
    // Set the feed URL dynamically
    const feedUrl = window.location.origin + window.location.pathname + 'feed.xml';
    document.getElementById('feedUrl').textContent = feedUrl;
  </script>
</body>
</html>`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf8');
    console.log('📄 Created index.html');

  } catch (error) {
    console.error('❌ Error generating feed:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
