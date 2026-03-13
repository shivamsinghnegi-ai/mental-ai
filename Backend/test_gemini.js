require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function test() {
  const key = process.env.GEMINI_API_KEY;
  
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('Say hello');
    fs.writeFileSync('test_results.txt', 'SUCCESS: ' + result.response.text());
  } catch (e) {
    const full = JSON.stringify({
      message: e.message,
      status: e.status,
      statusText: e.statusText,
      errorDetails: e.errorDetails,
      name: e.name,
    }, null, 2);
    fs.writeFileSync('test_results.txt', full);
  }
}

test();
