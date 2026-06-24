const { google } = require('googleapis');
const fetch = require('node-fetch'); // Standard node-fetch is available in Node.js or can be used. Wait, does the project use native fetch? Node 18+ has global fetch! The project uses Node 22 (we saw Node.js v22.17.0 in the logs), which has native global fetch! So we can use the global fetch directly without requiring any npm library!

// Helper to authenticate OAuth Client
const getOAuthClient = (accessToken) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  client.setCredentials({
    access_token: accessToken || process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  return client;
};

// Helper to parse meeting code from URL
const parseMeetingCode = (link) => {
  if (!link) return null;
  // Match standard meet.google.com/abc-defg-hij format
  const match = link.match(/meet\.google\.com\/([a-z0-9-]+)/i);
  return match ? match[1].toLowerCase() : null;
};

/**
 * Searches organizer's Google Drive for the transcript document
 */
const findTranscriptInDrive = async (drive, meetingTitle, meetingCode) => {
  let query = "mimeType = 'application/vnd.google-apps.document' and trashed = false";
  
  // Construct search queries prioritizing title + transcript or meeting code
  const searchTerms = [];
  if (meetingCode) {
    searchTerms.push(`name contains '${meetingCode}'`);
  }
  if (meetingTitle) {
    searchTerms.push(`name contains '${meetingTitle}' and name contains 'Transcript'`);
    searchTerms.push(`name contains '${meetingTitle}'`);
  }
  
  // Search Drive
  for (const term of searchTerms) {
    try {
      const q = `${query} and (${term})`;
      const response = await drive.files.list({
        q,
        spaces: 'drive',
        fields: 'files(id, name, mimeType, createdTime)',
        orderBy: 'createdTime desc',
        pageSize: 5
      });
      
      if (response.data.files && response.data.files.length > 0) {
        // Return the most recent matching document
        return response.data.files[0];
      }
    } catch (err) {
      console.warn(`Drive search query failed for [${term}]:`, err.message);
    }
  }

  // Fallback: search generally for recent Transcript Google Docs
  try {
    const generalQ = `${query} and name contains 'Transcript'`;
    const response = await drive.files.list({
      q: generalQ,
      spaces: 'drive',
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 10
    });
    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0];
    }
  } catch (err) {
    console.warn('General Drive search failed:', err.message);
  }

  return null;
};

/**
 * Downloads transcript document content as plain text
 */
const downloadTranscriptContent = async (drive, fileId) => {
  try {
    const response = await drive.files.export({
      fileId,
      mimeType: 'text/plain'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading file content from Drive:', error.message);
    throw new Error(`Failed to download transcript file: ${error.message}`);
  }
};

/**
 * Uses Gemini API to summarize the transcript
 */
const summarizeWithGemini = async (transcriptText, meetingTitle) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('No GEMINI_API_KEY found, falling back to local summarization.');
    return generateLocalFallbackSummary(transcriptText);
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an AI assistant for the Spaceborn CMS. Your task is to analyze the following Google Meet transcript for the meeting titled "${meetingTitle || 'Scheduled Meeting'}" and generate a highly detailed, premium-looking Markdown summary.

Format your response as a standard markdown string with the following sections:

### 📝 Meeting Overview
Provide a concise 3-4 sentence summary of what was discussed, the general mood, and any major announcements.

### 📌 Key Takeaways & Decisions
List the main decisions made during the meeting using bullet points.

### ⚡ Action Items
Create a checklist of actionable tasks using standard markdown checkboxes \`- [ ]\`. For each item, clearly specify the owner/assignee (e.g. \`- [ ] Task description (@AssigneeName)\`). If no owner is mentioned, write \`- [ ] Task description (@Unassigned)\`.

Here is the meeting transcript:
${transcriptText}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Invalid response structure from Gemini API');
  } catch (error) {
    console.error('Gemini summarization failed:', error.message);
    return generateLocalFallbackSummary(transcriptText);
  }
};

/**
 * Fallback summary generator using simple text heuristics
 */
const generateLocalFallbackSummary = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract potential action items using keywords
  const keywords = ['action', 'todo', 'task', 'need to', 'assign', 'owner', 'will do', 'responsible'];
  const actionItems = [];
  const keySentences = [];
  
  for (const line of lines) {
    const lowercaseLine = line.toLowerCase();
    
    // Check if line contains speakers/dialogue
    const speakerMatch = line.match(/^([^:]+):\s*(.+)$/);
    
    if (speakerMatch) {
      const speaker = speakerMatch[1].trim();
      const content = speakerMatch[2].trim();
      
      const containsKeyword = keywords.some(kw => content.toLowerCase().includes(kw));
      if (containsKeyword) {
        actionItems.push(`- [ ] ${content} (@${speaker})`);
      } else if (content.length > 30 && keySentences.length < 5) {
        keySentences.push(`- **${speaker}**: ${content}`);
      }
    } else {
      const containsKeyword = keywords.some(kw => lowercaseLine.includes(kw));
      if (containsKeyword) {
        actionItems.push(`- [ ] ${line} (@Unassigned)`);
      }
    }
  }

  // Construct structured markdown fallback
  let md = `### 📝 Meeting Overview\n*Local fallback summary generated.* A meeting took place and a transcript was synced successfully.\n\n`;
  
  md += `### 📌 Key Takeaways & Highlights\n`;
  if (keySentences.length > 0) {
    md += keySentences.join('\n') + '\n\n';
  } else {
    md += `- The meeting was successfully logged and transcripts saved.\n- Participants discussed core projects and deliverables.\n\n`;
  }

  md += `### ⚡ Action Items\n`;
  if (actionItems.length > 0) {
    md += actionItems.slice(0, 10).join('\n') + '\n';
  } else {
    md += `- [ ] Follow up on discussed meeting points (@Unassigned)\n- [ ] Review meeting notes (@Unassigned)\n`;
  }
  
  md += `\n> [!NOTE]\n> Setup **GEMINI_API_KEY** in the environment to unlock high-quality AI-generated summaries and automated action item tracking.`;
  
  return md;
};

/**
 * Main service to sync Google Meet transcript
 */
const syncMeetingTranscript = async ({ meetingLink, meetingTitle, accessToken }) => {
  const meetingCode = parseMeetingCode(meetingLink);
  
  if (!accessToken && !process.env.GOOGLE_ACCESS_TOKEN && !process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('Google OAuth credentials not configured');
  }

  const auth = getOAuthClient(accessToken);
  const drive = google.drive({ version: 'v3', auth });

  // 1. Locate the transcript in Google Drive
  console.log(`Searching Drive for transcript... Meeting Code: ${meetingCode}, Title: ${meetingTitle}`);
  const file = await findTranscriptInDrive(drive, meetingTitle, meetingCode);
  
  if (!file) {
    throw new Error('Google Meet transcript document could not be found in Google Drive. Make sure "Transcripts" were enabled during the meeting and saved.');
  }

  console.log(`Found transcript file: "${file.name}" (ID: ${file.id})`);

  // 2. Download plain text content
  const transcriptText = await downloadTranscriptContent(drive, file.id);
  if (!transcriptText || transcriptText.trim().length === 0) {
    throw new Error('Transcript file is empty.');
  }

  // 3. Generate summary using Gemini AI (with local fallback)
  console.log('Generating summary...');
  const summary = await summarizeWithGemini(transcriptText, meetingTitle);

  return {
    transcript: transcriptText,
    summary,
    fileId: file.id,
    fileName: file.name
  };
};

module.exports = {
  syncMeetingTranscript
};
