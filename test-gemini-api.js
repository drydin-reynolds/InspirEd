const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiAPI() {
  console.log('\n🧪 Testing Gemini API Integration...\n');
  
  const apiKey = process.env.STUDIO_GEMINI_KEY;
  
  if (!apiKey) {
    console.error('❌ ERROR: STUDIO_GEMINI_KEY environment variable not set');
    process.exit(1);
  }
  
  console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...`);
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const modelName = "gemini-2.0-flash-001";
    console.log(`\n📡 Testing model: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = "Say hello and confirm you are Gemini 2.0 Flash model.";
    console.log(`\n💬 Sending prompt: "${prompt}"`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS! Model responded:');
    console.log('─'.repeat(60));
    console.log(text);
    console.log('─'.repeat(60));
    
    console.log(`\n🎉 Gemini API is working correctly with ${modelName}!`);
    console.log('This confirms the model will work in your Cloud Functions.');
    
  } catch (error) {
    console.error('\n❌ ERROR testing Gemini API:');
    console.error(error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

console.log('🚀 Gemini API Test');
console.log('==================\n');

testGeminiAPI();
