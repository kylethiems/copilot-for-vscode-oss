import * as vscode from 'vscode';
import * as os from 'os';

// SDK types - loaded dynamically since the SDK is ESM-only
type CopilotClient = any;
type CopilotSession = any;
type SessionEvent = any;

// Import types
import type { FileAttachment, ChatMessage, ToolEvent, ModelOption } from '../types/messages';

/**
 * Structure for grouping session events into conversation turns
 */
interface ConversationTurn {
    userMessage: any | null;
    assistantMessages: any[];
    toolExecutions: Map<string, { start?: any; complete?: any }>;
    activeModel: string | null;  // Track which model was active during this turn
}

/**
 * Service wrapper for GitHub Copilot SDK integration.
 * Handles session management, streaming, and message routing.
 * 
 * Note: The @github/copilot-sdk is an ESM-only module, so we must use
 * dynamic import() to load it in the CommonJS VS Code extension environment.
 */
export class CopilotService {
    private client: CopilotClient | null = null;
    private session: CopilotSession | null = null;
    private webview: vscode.Webview | null = null;
    private currentMessageId: string | null = null;
    private currentModel: string | null = null;
    private isInitialized = false;
    private CopilotClientClass: any = null;
    // Track pending tool calls so completion events can access tool info
    private pendingToolCalls: Map<string, { toolName: string; arguments: any }> = new Map();
    // Track current system message for session
    private currentSystemMessage: string | undefined = undefined;

    /**
     * Sets the webview instance for sending messages
     */
    setWebview(webview: vscode.Webview): void {
        this.webview = webview;
    }

    async initialize(): Promise<void> {
        // Sif-only mode: skip Copilot SDK initialization
        this.isInitialized = true;
        this.client = null;
        console.log('[CopilotService] Sif-only mode: Copilot SDK initialization skipped.');
    }

                    // Sif-only: No session/model logic needed
                    async createSession(_model: string, _systemMessage?: string): Promise<void> {
                        // No-op in Sif-only mode
                    }

                    // Sif-only: Route chat messages to Sif backend
                    async sendMessage(prompt: string, modelId: string, attachments: FileAttachment[], systemMessage?: string): Promise<void> {
                        try {
                            const { sendToSif } = await import('../sifIpcClient');
                            let command = 'chat';
                            let args = { prompt, model: modelId, attachments, systemMessage };
                            // Route to correct mesh host script based on modelId
                            if (modelId === 'sif-120-mesh') {
                                command = 'chat_sif_120_mesh';
                            } else if (modelId === 'sif-sylph') {
                                command = 'chat_sif_sylph';
                            }
                            const response = await sendToSif(command, args);
                            // eslint-disable-next-line no-console
                            console.log('[Sif DEBUG] Raw response from Sif:', response);
                            this.webview?.postMessage({
                                type: 'addMessage',
                                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                role: 'assistant',
                                content: response?.content || '[Sif: No response]',
                                model: modelId
                            });
                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.error('[Sif DEBUG] Error in sendMessage:', e);
                            this.webview?.postMessage({
                                type: 'addMessage',
                                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                role: 'assistant',
                                content: `[Sif error: ${e}]`,
                                model: modelId
                            });
                        }
                    }

                    // Sif-only: Not implemented
                    async stopGeneration(): Promise<void> {
                        this.webview?.postMessage({
                            type: 'generationComplete'
                        });
                    }

                    // Sif-only: Not implemented
                    async selectModel(modelId: string): Promise<void> {
                        this.webview?.postMessage({
                            type: 'modelChanged',
                            modelId
                        });
                    }

                    // Sif-only: Not implemented
                    newSession(): void {
                        this.currentMessageId = null;
                    }

                    // Sif-only: Return empty session list
                    async listSessions(): Promise<any[]> {
                        return [];
                    }

                    // Sif-only: Return hardcoded model list
                    async listModels(): Promise<ModelOption[]> {
                        return [
                            {
                                id: 'sif-120-mesh',
                                name: 'Sif (120 Dodeca Mesh)',
                                multiplier: 'MoE',
                                isPremium: false,
                                supportsVision: false,
                                isEnabled: true,
                                restrictedTo: undefined
                            },
                            {
                                id: 'sif-sylph',
                                name: 'Sif the Sylph (4 Dodeca LoRA)',
                                multiplier: 'Light',
                                isPremium: false,
                                supportsVision: false,
                                isEnabled: true,
                                restrictedTo: undefined
                            },
                            {
                                id: 'gpt-4.1',
                                name: 'GPT-4.1',
                                multiplier: '1.0x',
                                isPremium: false,
                                supportsVision: false,
                                isEnabled: true,
                                restrictedTo: undefined
                            }
                        ];
                    }

                    // Sif-only: Not implemented
                    async resumeSession(_sessionId: string, _modelId?: string): Promise<ChatMessage[]> {
                        return [];
                    }

                    // Sif-only: Nothing to dispose
                    async dispose(): Promise<void> {
                        // No-op
                    }
                }
