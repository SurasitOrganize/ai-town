export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  finishReason?: string;
}

export interface LLMProvider {
  chat(messages: LLMMessage[]): Promise<LLMResponse>;
}

export interface LLMConfig {
  provider: 'openai' | 'gemini' | 'groq' | 'openrouter' | 'ollama' | 'mock';
  model: string;
  apiKey?: string;
  baseUrl?: string;
}
