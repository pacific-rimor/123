// files.js
const fs = require('fs');

// Read current directory
fs.readdir('.', (err, files) => {
    if (err) throw err;
    console.log('Files in project:');
    files.forEach(file => console.log(`- ${file}`));
});