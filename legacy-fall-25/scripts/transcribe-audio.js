#!/usr/bin/env node
/**
 * Audio Transcription Script using Gemini API
 * 
 * Usage: node scripts/transcribe-audio.js <audio-file>
 */

const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function transcribeAudio(audioPath) {
  console.log('\n🎙️ Transcribing audio file...\n');
  
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable is not set');
    process.exit(1);
  }
  
  if (!fs.existsSync(audioPath)) {
    console.error(`❌ File not found: ${audioPath}`);
    process.exit(1);
  }
  
  const audioData = fs.readFileSync(audioPath);
  const base64Audio = audioData.toString('base64');
  const fileName = path.basename(audioPath);
  
  // Determine MIME type
  const ext = path.extname(audioPath).toLowerCase();
  const mimeTypes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',
  };
  const mimeType = mimeTypes[ext] || 'audio/mpeg';
  
  console.log(`📁 File: ${fileName}`);
  console.log(`📊 Size: ${(audioData.length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🎵 Type: ${mimeType}`);
  console.log('\n⏳ Sending to Gemini API...\n');
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Audio,
              },
            },
            {
              text: `Please transcribe this audio recording accurately and completely.
              
Format the transcription as follows:
- Include all spoken words
- Use proper punctuation and paragraphs
- If there are distinct sections or topics, separate them with line breaks
- Preserve the natural flow of speech

Just provide the transcription text, no additional commentary.`,
            },
          ],
        }],
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ Gemini API error: ${response.status}`);
    console.error(error);
    process.exit(1);
  }
  
  const result = await response.json();
  const transcript = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  if (!transcript) {
    console.error('❌ No transcription returned');
    process.exit(1);
  }
  
  // Save transcript
  const outputPath = audioPath.replace(/\.[^.]+$/, '_transcript.md');
  const outputContent = `# Transcription: ${fileName}

**Generated:** ${new Date().toISOString()}
**Source:** ${fileName}

---

${transcript}
`;
  
  fs.writeFileSync(outputPath, outputContent);
  
  console.log('✅ Transcription complete!\n');
  console.log('━'.repeat(60));
  console.log(transcript);
  console.log('━'.repeat(60));
  console.log(`\n📄 Saved to: ${outputPath}\n`);
  
  return transcript;
}

// Run with command line argument or default file
const audioFile = process.argv[2] || 'attached_assets/Your_Lungs__Secret_Helper_1765460555349.mp3';
transcribeAudio(audioFile).catch(console.error);
