require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey ? "Present" : "Missing");

    if (!apiKey) {
        console.error("No API Key found in .env");
        return;
    }

    try {
        // We can't list models directly with the high-level SDK easily in all versions, 
        // but let's try a direct fetch to the API endpoint which is what the error suggested.
        // Or checking if the SDK exposes listModels (it does in newer versions via the client or manager, but usually not the main entry).
        // Actually, let's try a simple fetch to the REST API using the key, as it's the most reliable way to see what the server says.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
            return;
        }

        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.log("No models returned. Raw data:", data);
        }

    } catch (error) {
        console.error("Script Error:", error);
    }
}

listModels();
