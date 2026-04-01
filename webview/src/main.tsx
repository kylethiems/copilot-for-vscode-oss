// TypeScript global declaration for VS Code webview API
declare function acquireVsCodeApi(): any;
// Prevent service worker registration in VS Code webview
if (typeof acquireVsCodeApi !== 'undefined' && 'serviceWorker' in navigator) {
    // Unregister all service workers (if any)
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const reg of registrations) {
            reg.unregister();
        }
    });
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { VSCodeProvider } from './hooks/useVSCode';
import App from './App';
import './styles/index.css';
import './i18n/i18n'; // Initialize i18n

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <VSCodeProvider>
            <App />
        </VSCodeProvider>
    </StrictMode>
);
