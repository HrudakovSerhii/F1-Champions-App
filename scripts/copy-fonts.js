const fs = require('fs');
const path = require('path');

// Directory paths
const sourceDir = path.resolve(__dirname, '../public/fonts');
const targetDir = path.resolve(__dirname, '../apps/f1-spa/dist/fonts');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

// Copy font files
try {
  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    const sourceFile = path.join(sourceDir, file);
    const targetFile = path.join(targetDir, file);
    
    // Check if it's a file (not a directory)
    if (fs.statSync(sourceFile).isFile()) {
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`Copied: ${file}`);
    }
  });
  
  console.log('All font files copied successfully!');
} catch (error) {
  console.error('Error copying fonts:', error);
  process.exit(1);
} 