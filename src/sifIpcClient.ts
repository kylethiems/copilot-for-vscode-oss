// Add this to your extension's src/ directory, e.g., src/sifIpcClient.ts
import * as vscode from 'vscode';
import fetch from 'node-fetch';


const SIF_IPC_PORT = process.env.SIF_IPC_PORT || 8765;
const SIF_IPC_SECRET = 'your-strong-secret';

export async function sendToSif(command: string, args: any) {
    const url = `http://127.0.0.1:${SIF_IPC_PORT}/`;
    const headers = {
        'Content-Type': 'application/json',
        'X-Sif-Secret': SIF_IPC_SECRET,
    };
    const body = JSON.stringify({ command, args });
    try {
        const res = await fetch(url, { method: 'POST', headers, body });
        if (!res.ok) throw new Error(`Sif IPC error: ${res.status}`);
        return await res.json();
    } catch (e) {
        vscode.window.showErrorMessage(`Failed to contact Sif: ${e}`);
        return null;
    }
}
