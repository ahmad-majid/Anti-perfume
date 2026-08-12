import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Mark lazy images as loaded for CSS fade-in transition
document.addEventListener('load', (e) => {
  if (e.target.tagName === 'IMG') {
    e.target.classList.add('loaded');
  }
}, true);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
