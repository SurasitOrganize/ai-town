import { LLMProvider, LLMConfig } from './types';
import { MockLLMProvider } from './providers/mock';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { GroqProvider } from './providers/groq';
import { OpenRouterProvider } from './providers/openrouter';
import { OllamaProvider } from './providers/ollama';

export * from './types';

export function createLLMProvider(config?: Partial<LLMConfig>): LLMProvider {
  const provider = config?.provider || process.env.NEXT_PUBLIC_LLM_PROVIDER || 'mock';
  const model = config?.model || process.env.NEXT_PUBLIC_LLM_MODEL || 'gpt-3.5-turbo';
  const apiKey = config?.apiKey;
  const baseUrl = config?.baseUrl;

  switch (provider) {
    case 'openai': {
      const key = apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if (!key) {
        console.warn('No OpenAI API key found, falling back to mock provider');
        return new MockLLMProvider();
      }
      return new OpenAIProvider(key, model, baseUrl);
    }

    case 'gemini': {
      const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!key) {
        console.warn('No Gemini API key found, falling back to mock provider');
        return new MockLLMProvider();
      }
      return new GeminiProvider(key, model);
    }

    case 'groq': {
      const key = apiKey || process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!key) {
        console.warn('No Groq API key found, falling back to mock provider');
        return new MockLLMProvider();
      }
      return new GroqProvider(key, model);
    }

    case 'openrouter': {
      const key = apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
      if (!key) {
        console.warn('No OpenRouter API key found, falling back to mock provider');
        return new MockLLMProvider();
      }
      return new OpenRouterProvider(key, model);
    }

    case 'ollama': {
      const base = baseUrl || process.env.NEXT_PUBLIC_OLLAMA_BASE_URL;
      return new OllamaProvider(model, base);
    }

    case 'mock':
    default:
      return new MockLLMProvider();
  }
}
