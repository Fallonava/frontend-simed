const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const groqKey = "";
const keyEntry = `\nGROQ_API_KEY=${groqKey}\n`;

try {
    const currentContent = fs.readFileSync(envPath, 'utf8');
    if (!currentContent.includes('GROQ_API_KEY')) {
        fs.appendFileSync(envPath, keyEntry);
        console.log("Successfully appended GROQ_API_KEY to .env");
    } else {
        console.log("GROQ_API_KEY already exists in .env");
    }
} catch (error) {
    console.error("Error updating .env:", error);
}
