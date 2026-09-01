import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processImages() {
  const imgDir = path.resolve('public/assets/images');
  const targetDir2 = path.resolve('assets/images');
  const distDir = path.resolve('dist/assets/images');

  if (!fs.existsSync(targetDir2)) fs.mkdirSync(targetDir2, { recursive: true });
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  // 1. Convert dest-valparai.png to dest-valparai.webp
  if (fs.existsSync(path.join(imgDir, 'dest-valparai.png'))) {
    await sharp(path.join(imgDir, 'dest-valparai.png'))
      .webp({ quality: 82 })
      .toFile(path.join(imgDir, 'dest-valparai.webp'));
    console.log('Created dest-valparai.webp');
  }

  // 2. Convert dest-wayanad.png to dest-wayanad.webp
  if (fs.existsSync(path.join(imgDir, 'dest-wayanad.png'))) {
    await sharp(path.join(imgDir, 'dest-wayanad.png'))
      .webp({ quality: 82 })
      .toFile(path.join(imgDir, 'dest-wayanad.webp'));
    console.log('Created dest-wayanad.webp');
  }

  // 3. Convert fleet-sedan.png to fleet-sedan.webp
  if (fs.existsSync(path.join(imgDir, 'fleet-sedan.png'))) {
    await sharp(path.join(imgDir, 'fleet-sedan.png'))
      .webp({ quality: 82 })
      .toFile(path.join(imgDir, 'fleet-sedan.webp'));
    console.log('Created fleet-sedan.webp');
  }

  // 4. Create dest-isha-yoga.webp and .png from dest-adiyogi.png
  if (fs.existsSync(path.join(imgDir, 'dest-adiyogi.png'))) {
    fs.copyFileSync(path.join(imgDir, 'dest-adiyogi.png'), path.join(imgDir, 'dest-isha-yoga.png'));
    await sharp(path.join(imgDir, 'dest-adiyogi.png'))
      .webp({ quality: 82 })
      .toFile(path.join(imgDir, 'dest-isha-yoga.webp'));
    console.log('Created dest-isha-yoga.webp & dest-isha-yoga.png');
  }

  // 5. Create dest-cjb-airport.webp & png from coimbatore-local-cab.png
  if (fs.existsSync(path.join(imgDir, 'coimbatore-local-cab.png'))) {
    fs.copyFileSync(path.join(imgDir, 'coimbatore-local-cab.png'), path.join(imgDir, 'dest-cjb-airport.png'));
    await sharp(path.join(imgDir, 'coimbatore-local-cab.png'))
      .webp({ quality: 82 })
      .toFile(path.join(imgDir, 'dest-cjb-airport.webp'));
    console.log('Created dest-cjb-airport.webp & dest-cjb-airport.png');
  }

  // Synchronize all images into assets/images and dist/assets/images
  const allImages = fs.readdirSync(imgDir);
  for (const img of allImages) {
    fs.copyFileSync(path.join(imgDir, img), path.join(targetDir2, img));
    fs.copyFileSync(path.join(imgDir, img), path.join(distDir, img));
  }
  console.log(`Synchronized ${allImages.length} images across public/assets/images, assets/images, and dist/assets/images`);
}

processImages().catch(console.error);
