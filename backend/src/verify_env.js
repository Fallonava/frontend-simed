require('dotenv').config();

const geminiKey = process.env.GEMINI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

console.log("--- Environment Verification ---");
console.log(`GEMINI_API_KEY: ${geminiKey ? "Present (Starts with " + geminiKey.substring(0, 5) + "...)" : "MISSING"}`);
console.log(`GROQ_API_KEY:   ${groqKey ? "Present (Starts with " + groqKey.substring(0, 4) + "...)" : "MISSING"}`);
console.log("--------------------------------");
