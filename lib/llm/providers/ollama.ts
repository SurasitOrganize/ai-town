import { LLMProvider, LLMMessage, LLMResponse } from '../types';

export class OllamaProvider implements LLMProvider {
  private model: string;
  private baseUrl: string;

  constructor(model: string, baseUrl?: string) {
    this.model = model;
    this.baseUrl = baseUrl || 'http://localhost:11434';
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.message.content,
      finishReason: 'stop',
    };
  }
}
