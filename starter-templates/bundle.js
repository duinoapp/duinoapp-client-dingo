// #!/bin/bash

// # Get the absolute path of the script directory
// SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

// cd "$SCRIPT_DIR"

// # Purge the public directory
// rm -rf "$SCRIPT_DIR/../public/starter-templates"

// # Create the public directory if it doesn't exist
// mkdir -p "$SCRIPT_DIR/../public/starter-templates"


// # Loop through all the subdirectories
// for dir in ./*/; do
//   # Remove the trailing slash from the directory name
//   dir=${dir%/}

//   # Zip the directory
//   zip -rq "$SCRIPT_DIR/../public/starter-templates/${dir##*/}.zip" "$dir"
// done

const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');
const templates = require('./templates.json');
const zip = require('cross-zip');

const SCRIPT_DIR = path.resolve(__dirname);
const PUBLIC_DIR = path.resolve(SCRIPT_DIR, '../public');
const TEMPS_DIR = path.resolve(PUBLIC_DIR, 'starter-templates');

// Purge the public directory
try {
  fs.rmSync(TEMPS_DIR, { recursive: true });
} catch (err) {
  console.error(err);
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

  zip.zipSync(dirPath, path.resolve(TEMPS_DIR, template.src.replace('/starter-templates/', '')));
  // const files = fs.readdirSync(dirPath, { recursive: true }).map((pathname) => {
  //   console.log(pathname, fs.statSync(path.resolve(dirPath, pathname)).isDirectory());
  //   if (fs.statSync(path.resolve(dirPath, pathname)).isDirectory()) {
  //     return;
  //   }
  //   return {
  //     pathname,
  //     file: new Blob([fs.readFileSync(path.resolve(dirPath, pathname))]),
  //   };
  // }).filter(v => v);
  // Archive.write({
  //   files,
  //   outputFileName: template.src.replace('/starter-templates/', ''),
  //   compression: 'zip',
  //   format: 'zip',
  // }).then((zipFile) => {
  //   console.log(`Writing ${template.src}`, zipFile);
  //   fs.writeFileSync(path.resolve(PUBLIC_DIR, template.src), zipFile);
  // });
});

console.log('Done bundling starter templates.');
