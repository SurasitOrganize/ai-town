# AI Agent Office

A web application where users assign tasks to a team of AI agents shown in a Gather Town style 2D office environment.

## Features

### Milestone 1 (Current)

- **Interactive 2D Office**: Top-down pixel-art office built with Phaser 3 and Tiled
  - Walk around with arrow keys
  - Collide with walls and furniture
  - Multiple rooms: work area with desks, meeting room, and lounge
  
- **AI Agent Team**:
  - Multiple AI agents with different roles (Developer, Designer, Product Manager, Data Analyst)
  - Real-time status indicators (Online/Busy/Offline)
  - Agents move around the office based on their task state:
    - **Idle**: Agents hang out in the lounge area
    - **Working**: Agents sit at their desks
    - **Meeting**: Agents gather in the meeting room
  
- **Proximity-Based Chat**:
  - Walk near any agent to see a prompt
  - Press 'E' to open a chat panel with that agent
  - AI-powered responses using configurable LLM providers
  
- **Task Management**:
  - Kanban board with To Do / Doing / Done columns
  - Assign tasks to agents (UI ready)
  - Track task progress
  
- **Provider-Agnostic LLM Integration**:
  - Support for multiple LLM providers:
    - OpenAI (GPT models)
    - Google Gemini
    - Groq
    - OpenRouter
    - Ollama (local models)
    - Mock provider (for development without API keys)
  - Easy switching between providers via environment variables
  
- **Future-Ready Architecture**:
  - Repository pattern for data access (currently in-memory)
  - Easy to plug in a database (Supabase, Firebase, etc.) later
  - Clean separation of concerns

## Setup

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-agent-office
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. (Optional) Set up an LLM provider by editing `.env`:
   - For OpenAI: Set `NEXT_PUBLIC_LLM_PROVIDER=openai` and add your `NEXT_PUBLIC_OPENAI_API_KEY`
   - For Gemini: Set `NEXT_PUBLIC_LLM_PROVIDER=gemini` and add your `NEXT_PUBLIC_GEMINI_API_KEY`
   - For other providers: See `.env.example` for configuration options
   - **Note**: The app works without any API keys using the mock provider

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

- Use **arrow keys** to move your avatar around the office
- Walk **near an agent** to see a chat prompt
- Press **E** to open a chat with the nearby agent
- Type messages to assign tasks or ask questions
- View the **kanban board** at the bottom to see task status
- Check the **team sidebar** on the left to see all agents and their status

## Architecture

### Project Structure

```
/app                  # Next.js App Router pages
  /page.tsx          # Main office page
  /layout.tsx        # Root layout
  /globals.css       # Global styles

/components          # React components
  /TeamSidebar.tsx   # Left sidebar with agent list
  /OfficeCanvas.tsx  # Phaser game container
  /TaskPanel.tsx     # Right chat panel
  /KanbanBoard.tsx   # Bottom task board

/lib
  /store.ts          # Zustand state management
  /llm               # LLM provider abstraction
    /types.ts        # Shared interfaces
    /index.ts        # Provider factory
    /providers/      # Individual provider implementations
  /game              # Phaser game logic
    /OfficeScene.ts  # Main game scene
  /repository        # Data access layer
    /types.ts        # Repository interfaces
    /memory.ts       # In-memory implementation

/public
  /assets            # Game assets
    /office-map.json # Tiled map definition
```

### Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Phaser 3**: 2D game engine for the office view
- **Zustand**: Lightweight state management
- **Tiled**: Map editor format for office layout

### LLM Provider Layer

The application uses a provider-agnostic LLM layer that supports multiple backends:

```typescript
// Simple usage
import { createLLMProvider } from '@/lib/llm';

const provider = createLLMProvider(); // Uses env config
const response = await provider.chat(messages);
```

Providers are configured via environment variables and fall back to the mock provider if no API keys are provided.

### Repository Pattern

Data access is abstracted through repository interfaces:

```typescript
interface AgentRepository {
  getAll(): Promise<Agent[]>;
  getById(id: string): Promise<Agent | null>;
  create(agent: Omit<Agent, 'id'>): Promise<Agent>;
  update(id: string, updates: Partial<Agent>): Promise<Agent>;
  delete(id: string): Promise<void>;
}
```

The current implementation uses in-memory storage. To add database support:

1. Create a new implementation (e.g., `lib/repository/supabase.ts`)
2. Export the implementation from `lib/repository/memory.ts`
3. No changes needed to components or other business logic

## Building for Production

```bash
npm run build
npm start
```

## Linting

```bash
npm run lint
```

## Credits

### Art Assets

- **Tiles**: Simple procedurally-generated placeholder tiles (CC0/Public Domain)
- **Map Design**: Created with [Tiled](https://www.mapeditor.org/) (open source)

The current implementation uses basic colored rectangles as placeholder tiles. These are generated at runtime and are in the public domain. For a production version, consider replacing with proper tile assets from:

- [OpenGameArt.org](https://opengameart.org/)
- [itch.io](https://itch.io/game-assets/free)
- [Kenney.nl](https://kenney.nl/)

## Roadmap

### Milestone 2 (Planned)
- Database integration (Supabase or Firebase)
- Real task assignment and tracking
- Agent AI decision-making
- User authentication
- Multiple office rooms/floors

### Milestone 3 (Planned)
- Real-time collaboration
- Agent performance metrics
- Custom agent creation
- Advanced AI capabilities

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
