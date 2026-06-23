const express = require('express');

const router = express.Router();

router.get('/google', (_req, res) => {
  res.json({
    success: true,
    data: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      driveFolderConfigured: Boolean(process.env.DRIVE_FOLDER_ID)
    }
  });
});

module.exports = router;
