# Google Meet Transcript Sync & AI Summarization - How to Test Guide

Follow these steps to test the newly implemented transcript sync and AI summary features with a real Google Meet session.

---

## 🛠️ Step 1: Conduct the Google Meet Session
1. **Launch the Call**: Open and join the scheduled meeting using the registered Google Meet link (e.g., `https://meet.google.com/abc-defg-hij`).
2. **Start Transcription**: Once the call starts, the host must click **Activities** (the Shapes icon in the bottom right corner) -> **Transcripts** -> **Start Transcription**.
3. **Record Conversation**: Speak during the call so that speech-to-text dialogue is recorded by Google's native services.
4. **End/Stop**: Click **Stop Transcription** or end the meeting call.
5. **Wait for File Generation**: Wait **1-3 minutes** for Google's servers to process the audio. Google will automatically save the transcript as a Google Doc file in the organizer's Google Drive inside the default folder named **"Meet Recordings"**.

---

## 🚀 Step 2: Trigger Sync in Spaceborn CMS
1. **Start Servers**: Ensure both the backend and frontend development servers are running.
2. **Navigate**: Open the browser, log in to the Spaceborn dashboard, and go to the **Meetings** page.
3. **Identify Meeting Card**: Find the card of the meeting you conducted. Since the meeting date/time has passed, it will show a **"Sync Transcript"** button.
4. **Click Sync**: Click the **Sync Transcript** button.
    *   *Note: Under the hood, the backend uses the logged-in user's Google OAuth credentials to search Google Drive for the Google Doc containing the meeting code/title. It exports the document text and sends it to the Gemini 3.1 Flash Lite API for structured summarization.*

---

## 📊 Step 3: View the AI Notes & Transcript
1. **Verification Badge**: Once the sync completes, the meeting card's status badge will update to **Completed (Transcript Synced)**.
2. **Open Modal**: Click the new **View Notes** button on the card.
3. **Explore Tabs**:
    *   **📝 AI Summary & Actions Tab**: Displays the Gemini-generated Meeting Overview, key decisions, and checklisted Action Items (highlighting user assignees like `@Jane` in blue tags).
    *   **💬 Full Transcript Tab**: Displays the raw, scrollable speaker-labeled dialogue text retrieved from Google.
