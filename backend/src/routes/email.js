const express = require('express'); 
const emailService = require('../services/emailService'); 
const authMiddleware = require('../middleware/auth'); 
const rateLimit = require('express-rate-limit'); 
const router = express.Router(); 
// Rate limiting for email endpoints 
const emailLimiter = rateLimit({ 
windowMs: 60 * 1000, // 1 minute 
max: 10, // 10 requests per minute 
message: 'Too many email requests, please try again later.' 
}); 
// Send test email 
router.post('/test', authMiddleware, emailLimiter, async (req, res) => { 
try { 
const { email } = req.body; 
const testHtml = ` 
      <h1>Test Email</h1> 
      <p>This is a test email from SpaceBorn CMS Automation System.</p> 
      <p>If you received this, your email configuration is working!</p> 
      <p>Sent at: ${new Date().toLocaleString()}</p> 
    `; 
     
    const result = await emailService.sendEmail( 
      email || req.user.email, 
      'SpaceBorn CMS - Test Email', 
      testHtml 
    ); 
     
    res.json({ success: true, message: 'Test email sent' }); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
}); 
 
// Send warning email 
router.post('/warning', authMiddleware, emailLimiter, async (req, res) => { 
  try { 
    const { to, subject, html } = req.body; 
     
    // Only CEO and Managers can send warnings 
    if (!['CEO', 'COO', 'Manager'].includes(req.user.role)) { 
      return res.status(403).json({ error: 'Unauthorized' }); 
    } 
     
const result = await emailService.sendEmail(to, subject, html); 
res.json(result); 
} catch (error) { 
res.status(500).json({ error: error.message }); 
} 
}); 
// Send bulk email 
router.post('/bulk', authMiddleware, emailLimiter, async (req, res) => { 
try { 
const { recipients, subject, html } = req.body; 
if (!['CEO'].includes(req.user.role)) { 
return res.status(403).json({ error: 'Only CEO can send bulk emails' }); 
} 
const results = await emailService.sendBulkEmail(recipients, subject, html); 
res.json({ success: true, results }); 
} catch (error) { 
res.status(500).json({ error: error.message }); 
} 
}); 
// Get email logs 
router.get('/logs', authMiddleware, async (req, res) => { 
try { 
const logs = await emailService.getEmailLogs(); 
res.json(logs); 
} catch (error) { 
res.status(500).json({ error: error.message }); 
} 
}); 
module.exports = router;
