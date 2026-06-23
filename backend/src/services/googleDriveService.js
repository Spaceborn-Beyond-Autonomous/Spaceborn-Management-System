const { Readable } = require('stream');
const { google } = require('googleapis');

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

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

const sanitizeFileName = (value = 'document') =>
  String(value)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'document';

const uploadEmployeeDocumentToDrive = async ({ file, employee, documentType, accessToken }) => {
  const folderId = process.env.DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error('DRIVE_FOLDER_ID is not configured');
  }

  if (!accessToken && !process.env.GOOGLE_ACCESS_TOKEN && !process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('Google Drive OAuth credentials are not configured');
  }

  const auth = getOAuthClient(accessToken);
  const drive = google.drive({ version: 'v3', auth });
  const employeeName = sanitizeFileName(employee.fullName || `${employee.firstName} ${employee.lastName}`);
  const employeeId = sanitizeFileName(employee.employeeId || String(employee._id));
  const safeType = sanitizeFileName(documentType);
  const originalName = sanitizeFileName(file.originalname);
  const name = `${employeeId}_${employeeName}_${safeType}_${Date.now()}_${originalName}`;

  const response = await drive.files.create({
    requestBody: {
      name,
      parents: [folderId],
      description: `Employee document uploaded from Spaceborn CMS for ${employeeName} (${employeeId})`
    },
    media: {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer)
    },
    fields: 'id,name,mimeType,size,webViewLink,webContentLink,createdTime'
  });

  return response.data;
};

module.exports = {
  DRIVE_SCOPE,
  uploadEmployeeDocumentToDrive
};
