// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const renderApp = (clientId) => {
  root.render(
    <GoogleOAuthProvider clientId={clientId || 'missing-google-client-id'}>
      <App />
    </GoogleOAuthProvider>
  );
};

fetch(`${apiBaseUrl}/config/google`)
  .then((response) => response.ok ? response.json() : null)
  .then((config) => {
    renderApp(config?.data?.clientId || process.env.REACT_APP_GOOGLE_CLIENT_ID);
  })
  .catch(() => {
    renderApp(process.env.REACT_APP_GOOGLE_CLIENT_ID);
  });
