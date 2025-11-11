const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../client/public/logo.png');
const publicPath = path.join(__dirname, '../client/public');

async function generateFavicons() {
  console.log('Generating favicons from logo...');

  // Read the original logo
  const logo = sharp(logoPath);

  try {
    // Generate favicon-16x16.png
    await logo
      .clone()
      .resize(16, 16)
      .toFile(path.join(publicPath, 'favicon-16x16.png'));
    console.log('✓ Generated favicon-16x16.png');

    // Generate favicon-32x32.png
    await logo
      .clone()
      .resize(32, 32)
      .toFile(path.join(publicPath, 'favicon-32x32.png'));
    console.log('✓ Generated favicon-32x32.png');

    // Generate apple-touch-icon.png (180x180)
    await logo
      .clone()
      .resize(180, 180)
      .toFile(path.join(publicPath, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');

    // Generate android-chrome-192x192.png
    await logo
      .clone()
      .resize(192, 192)
      .toFile(path.join(publicPath, 'android-chrome-192x192.png'));
    console.log('✓ Generated android-chrome-192x192.png');

    // Generate android-chrome-512x512.png
    await logo
      .clone()
      .resize(512, 512)
      .toFile(path.join(publicPath, 'android-chrome-512x512.png'));
    console.log('✓ Generated android-chrome-512x512.png');

  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

async function generateSocialPreview() {
  console.log('\nGenerating social preview image...');

  try {
    // Create a 1200x630 canvas with background color
    const backgroundColor = '#FF6B6B'; // Your primary color
    const textColor = '#FFFFFF';

    // Create SVG with background and centered logo
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="${backgroundColor}"/>
        <text x="600" y="450" font-family="system-ui, -apple-system, sans-serif"
              font-size="72" font-weight="bold" text-anchor="middle" fill="${textColor}">Puppr</text>
        <text x="600" y="520" font-family="system-ui, -apple-system, sans-serif"
              font-size="36" text-anchor="middle" fill="${textColor}">Stop Barking at Squirrels Alone</text>
        <text x="600" y="570" font-family="system-ui, -apple-system, sans-serif"
              font-size="28" text-anchor="middle" fill="${textColor}" opacity="0.9">Find dogs who understand you</text>
      </svg>
    `;

    // Create background with text
    const background = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    // Composite logo on top of background
    await sharp(background)
      .composite([
        {
          input: await sharp(logoPath)
            .resize(250, 250)
            .toBuffer(),
          top: 100,
          left: 475
        }
      ])
      .toFile(path.join(publicPath, 'social-preview.png'));

    console.log('✓ Generated social-preview.png (1200x630)');

  } catch (error) {
    console.error('Error generating social preview:', error);
    process.exit(1);
  }
}

async function generateFaviconIco() {
  console.log('\nGenerating favicon.ico...');

  try {
    // For now, we'll copy the 32x32 as favicon.ico
    // A proper ICO file would need a different library
    await sharp(logoPath)
      .resize(32, 32)
      .toFormat('png')
      .toFile(path.join(publicPath, 'favicon.ico'));
    console.log('✓ Generated favicon.ico');
  } catch (error) {
    console.error('Error generating favicon.ico:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('Starting icon generation...\n');

  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error('Error: logo.png not found at', logoPath);
    process.exit(1);
  }

  await generateFavicons();
  await generateSocialPreview();
  await generateFaviconIco();

  console.log('\n✅ All icons generated successfully!');
}

main().catch(console.error);