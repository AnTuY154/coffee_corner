const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error('credentials.json not found!');
  process.exit(1);
}

const raw = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
const json = JSON.parse(raw);
if (json.private_key) {
  json.private_key = json.private_key.replace(/\n/g, '\\n');
}

const result = JSON.stringify(json);
console.log('Copy the following string into your GOOGLE_CREDENTIALS env variable:');
console.log(result); 