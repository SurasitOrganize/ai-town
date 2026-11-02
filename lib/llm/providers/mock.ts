import { LLMProvider, LLMMessage, LLMResponse } from '../types';

export class MockLLMProvider implements LLMProvider {
  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    // Simulate some delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const lastMessage = messages[messages.length - 1];
    
    // Generate mock responses based on context
    const responses = [
      "I'd be happy to help with that task!",
      "Let me look into that for you.",
      "I can start working on this right away.",
      "That's an interesting challenge. I'll get started.",
      "Sure! I'll prioritize this task.",
    ];
    
    const content = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      content,
      finishReason: 'stop',
    };
  }
}
