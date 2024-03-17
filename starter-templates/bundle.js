const fs = require('fs');
const path = require('path');
const templates = require('./templates.json');
const AdmZip = require("adm-zip");

const SCRIPT_DIR = path.resolve(__dirname);
const PUBLIC_DIR = path.resolve(SCRIPT_DIR, '../public');
const TEMPS_DIR = path.resolve(PUBLIC_DIR, 'starter-templates');

// Purge the public directory
try {
  fs.rmSync(TEMPS_DIR, { recursive: true });
} catch (err) {
  // console.error(err);
}

// Create the public directory if it doesn't exist
fs.mkdirSync(TEMPS_DIR, { recursive: true });

// Loop through all the subdirectories
Object.values(templates.templates).forEach((template) => {
  // ignore files
  if (!template.src.startsWith('/starter-templates')) {
    return;
  }
  const dirPath = path.resolve(SCRIPT_DIR, template.id);
  if (!fs.statSync(dirPath).isDirectory()) {
    return;
  }

  // Zip the directory
  const zip = new AdmZip();
  const files = fs.readdirSync(dirPath, { recursive: true }).map((pathname) => {
  //   console.log(pathname, fs.statSync(path.resolve(dirPath, pathname)).isDirectory());
    if (fs.statSync(path.resolve(dirPath, pathname)).isDirectory()) {
      return;
    }
    return {
      pathname,
      file: fs.readFileSync(path.resolve(dirPath, pathname)),
    };
  }).filter(v => v);
  files.forEach((file) => {
    zip.addFile(file.pathname, file.file);
  });
  zip.writeZip(path.resolve(TEMPS_DIR, template.src.replace('/starter-templates/', '')));
});

console.log('Done bundling starter templates.');
