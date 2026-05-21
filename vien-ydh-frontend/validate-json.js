const fs = require('fs');

function validateJSON(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    JSON.parse(content);
    console.log(`${file}: VALID`);
    return true;
  } catch (e) {
    console.log(`${file}: INVALID - ${e.message}`);
    // Show line/column if possible
    const match = e.message.match(/position (\d+)/);
    if (match) {
      const pos = parseInt(match[1]);
      const lines = content.substring(0, pos).split('\n');
      console.log(`  Line ${lines.length}, near: ${lines[lines.length-1]}`);
    }
    return false;
  }
}

validateJSON('messages/vi.json');
validateJSON('messages/en.json');
validateJSON('messages/zh.json');
