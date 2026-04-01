import * as vscode from 'vscode';
import { AIChatViewProvider } from './provider';
import { CopilotService } from './services/copilot-service';

let copilotService: CopilotService | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Chat Plugin is now active');

    // Initialize the Copilot service
    copilotService = new CopilotService();

    // Create and register the webview provider
    const provider = new AIChatViewProvider(context.extensionUri, copilotService);    journalctl -u venom-math -e

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            AIChatViewProvider.viewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: false // Use state serialization instead
                }
            }
        )
    );

    // Register commands

    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-oss.newSession', () => {
            provider.newSession();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-oss.clearHistory', () => {
            provider.clearHistory();
        })
    );

    // Register Sif command handler
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-oss.sifCommand', async (...args) => {
            // Forward command to Sif via IPC
            try {
                const { sendToSif } = await import('./sifIpcClient');
                const command = args[0]?.command || 'unknown';
                const commandArgs = args[0]?.args || {};
                const result = await sendToSif(command, commandArgs);
                vscode.window.showInformationMessage('Sif response: ' + JSON.stringify(result));
            } catch (e) {
                vscode.window.showErrorMessage('Failed to send command to Sif: ' + e);
            }
        })
    );

    console.log('AI Chat Plugin registered successfully');
}

export function deactivate() {
    copilotService?.dispose();
    console.log('AI Chat Plugin deactivated');
}
