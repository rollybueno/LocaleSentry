import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../assets/theme.css';
import { SidePanelApp } from '../../ui/SidePanelApp';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SidePanelApp />
  </React.StrictMode>,
);
