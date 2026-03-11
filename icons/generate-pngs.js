const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgPath = path.join(__dirname, 'icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

(async () => {
  for (const { name, size } of sizes) {
    const outPath = path.join(__dirname, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`Created ${name} (${size}x${size})`);
  }
  console.log('Done!');
})();
