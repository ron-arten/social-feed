const https = require('https');
const fs = require('fs');
const path = require('path');

const PROFILE_IMAGES = 13; // Number of profile images
const POST_IMAGES = 10; // Number of post images

async function downloadImage(url, filepath, followRedirects = false) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 302 && followRedirects) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error(`No redirect URL found for ${url}`));
          return;
        }
        downloadImage(redirectUrl, filepath, false).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if there's an error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadAllImages() {
  // Create directories if they don't exist
  const dirs = [
    path.join(__dirname, '../assets/images/profiles'),
    path.join(__dirname, '../assets/images/posts')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Download profile images
  console.log('Downloading profile images...');
  for (let i = 1; i <= PROFILE_IMAGES; i++) {
    const url = `https://avatar.iran.liara.run/public/${i}`;
    const filepath = path.join(__dirname, `../assets/images/profiles/profile_${i}.jpg`);
    try {
      await downloadImage(url, filepath);
    } catch (error) {
      console.error(`Error downloading profile image ${i}:`, error.message);
    }
  }

  // Download post images
  console.log('Downloading post images...');
  for (let i = 1; i <= POST_IMAGES; i++) {
    const url = `https://picsum.photos/800/600?random=${i}`;
    const filepath = path.join(__dirname, `../assets/images/posts/post_${i}.jpg`);
    try {
      await downloadImage(url, filepath, true); // Enable redirect following for post images
    } catch (error) {
      console.error(`Error downloading post image ${i}:`, error.message);
    }
  }

  console.log('All downloads completed!');
}

downloadAllImages().catch(console.error); 