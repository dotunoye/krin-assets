const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Target your assets folder
const inputDir = './assets/danny1';
const outputDir = './assets/danny';

// Generate the output directory if it is missing
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read the directory and filter for standard image files
fs.readdir(inputDir, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        
        // Target PNG and JPG files
        if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
            const fileName = path.parse(file).name;
            const inputPath = `${inputDir}/${file}`;
            const outputPath = `${outputDir}/${fileName}.webp`;

            // Execute compression pipeline
            sharp(inputPath)
                // Cap the width at 1200px to kill massive files, but don't upscale small ones
                .resize({ width: 1200, withoutEnlargement: true })
                // Convert to WebP with an 80% quality compression
                .webp({ quality: 80 })
                .toFile(outputPath)
                .then(info => {
                    console.log(`SUCCESS: ${file} converted to ${fileName}.webp (${(info.size / 1024).toFixed(2)} KB)`);
                })
                .catch(err => {
                    console.error(`FAILED on ${file}:`, err);
                });
        }
    });
});