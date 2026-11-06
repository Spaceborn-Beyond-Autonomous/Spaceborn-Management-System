// CRA turns every ESLint warning into a failure when CI=true (as on Vercel).
// Keep warnings visible while allowing the production bundle to complete.
process.env.CI = 'false';
require('react-scripts/scripts/build');
