const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyDFnBCwW4fYVvpCPrzcpj5BqzrE0pxX3k4');
async function list() {
  try {
     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
     const result = await model.generateContent('Hello');
     console.log('gemini-1.5-flash: WORKED');
  } catch(e) { console.log('gemini-1.5-flash failed:', e.message); }

  try {
     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
     const result = await model.generateContent('Hello');
     console.log('gemini-1.5-flash-latest: WORKED');
  } catch(e) { console.log('gemini-1.5-flash-latest failed:', e.message); }
}
list();
