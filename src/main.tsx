import React from 'react';
import ReactDOM from 'react-dom/client';
import FitnessTracker from './tracker';

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <FitnessTracker />
    </React.StrictMode>
  );
}
