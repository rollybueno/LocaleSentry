import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../assets/theme.css';
import { PopupApp } from '../../ui/PopupApp';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>,
);
