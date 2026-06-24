const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Direct import of the summarize function from meetTranscriptService
const summarize = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY is not defined in backend/.env');
    process.exit(1);
  }

  console.log('Using API Key:', apiKey.substring(0, 10) + '...');
  
  const sampleTranscript = `
John Doe: Good morning team, let's discuss our progress on the Spaceborn Management System.
Jane Smith: I have completed the frontend routing for the dashboard. However, we need to integrate the new transcript sync feature by tomorrow. Mike, can you implement the database controller updates?
Mike Johnson: Yes, I will take care of the database controller updates today.
Jane Smith: Great. Aarav, can you write the frontend modal UI components?
Aarav Mehta: Sure, I will build the modal tabs and style it with Tailwind. I should be able to finish it by Wednesday.
John Doe: Excellent. We will use Gemini 1.5 Flash for the AI notes summary. This decision is final. Let's meet again on Thursday.
`;

  console.log('\n💬 Sending sample transcript to Gemini API...');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an AI assistant for the Spaceborn CMS. Your task is to analyze the following Google Meet transcript for the meeting titled "Project Status Update" and generate a highly detailed, premium-looking Markdown summary.

Format your response as a standard markdown string with the following sections:

### 📝 Meeting Overview
Provide a concise 3-4 sentence summary of what was discussed, the general mood, and any major announcements.

### 📌 Key Takeaways & Decisions
List the main decisions made during the meeting using bullet points.

### ⚡ Action Items
Create a checklist of actionable tasks using standard markdown checkboxes \`- [ ]\`. For each item, clearly specify the owner/assignee (e.g. \`- [ ] Task description (@AssigneeName)\`). If no owner is mentioned, write \`- [ ] Task description (@Unassigned)\`.

Here is the meeting transcript:
${sampleTranscript}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      console.log('✅ Gemini Response Received successfully!\n');
      console.log('--------------------------------------------------');
      console.log(data.candidates[0].content.parts[0].text);
      console.log('--------------------------------------------------');
    } else {
      throw new Error('Invalid response structure from Gemini API');
    }
  } catch (error) {
    console.error('❌ Summarization failed:', error.message);
    console.log('\n🛡️ Falling back to Local Parser summary:');
    console.log('--------------------------------------------------');
    
    const lines = sampleTranscript.split('\n').map(l => l.trim()).filter(Boolean);
    const actionItems = [];
    const keySentences = [];
    const keywords = ['action', 'todo', 'task', 'need to', 'assign', 'owner', 'will do', 'responsible'];
    
    for (const line of lines) {
      const speakerMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (speakerMatch) {
        const speaker = speakerMatch[1].trim();
        const content = speakerMatch[2].trim();
        if (keywords.some(kw => content.toLowerCase().includes(kw))) {
          actionItems.push(`- [ ] ${content} (@${speaker})`);
        } else if (content.length > 30 && keySentences.length < 5) {
          keySentences.push(`- **${speaker}**: ${content}`);
        }
      }
    }
    
    let md = `### 📝 Meeting Overview\n*Local fallback summary generated.* A meeting took place and a transcript was synced successfully.\n\n`;
    md += `### 📌 Key Takeaways & Highlights\n`;
    md += keySentences.join('\n') + '\n\n';
    md += `### ⚡ Action Items\n`;
    md += actionItems.join('\n') + '\n';
    
    console.log(md);
    console.log('--------------------------------------------------');
  }
};

summarize();
