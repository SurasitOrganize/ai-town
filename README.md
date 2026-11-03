# AI Agent Office

A web application where users assign tasks to a team of AI agents in a Gather Town-style 2D office environment with full backend integration.

## Features

### Milestone 1 ✅

Foundation with in-memory data storage.

### Milestone 2 ✅  

Full Supabase backend integration with real-time updates.

### Current Features

- **Interactive 2D Office**: Top-down pixel-art office built with Phaser 3 and Tiled
  - Walk around with arrow keys
  - Collide with walls and furniture
  - Multiple rooms: work area with desks, meeting room, and lounge
  
- **AI Agent Team**:
  - Multiple AI agents with different roles (Developer, Designer, Product Manager, Data Analyst)
  - Real-time status indicators (Online/Busy/Offline)
  - **Add new agents** via modal form with name, role, avatar, and allowed tools
  - Agents stored in Supabase with real-time synchronization
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
  
- **Backend & Real-time**:
  - **Supabase integration** for persistent storage
  - **Real-time subscriptions** for live updates
  - Anonymous authentication support
  - Repository pattern with in-memory fallback
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

4. **(Required for full functionality)** Add Supabase credentials to `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
   
   The app will fall back to in-memory storage if Supabase is not configured.

5. (Optional) Set up an LLM provider by editing `.env`:
   - For OpenAI: Set `NEXT_PUBLIC_LLM_PROVIDER=openai` and add your `NEXT_PUBLIC_OPENAI_API_KEY`
   - For Gemini: Set `NEXT_PUBLIC_LLM_PROVIDER=gemini` and add your `NEXT_PUBLIC_GEMINI_API_KEY`
   - For other providers: See `.env.example` for configuration options
   - **Note**: The app works without any API keys using the mock provider

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

- Use **arrow keys** to move your avatar around the office
- **Click agents** in the sidebar to start a chat
- Walk **near an agent** to see a chat prompt, press **E** to open chat
- Type messages to assign tasks or ask questions
- Click **+ Add Agent** to create new team members
- View the **kanban board** at the bottom to see task status
- All changes sync in real-time when using Supabase

## Architecture

### Project Structure

```
/app                  # Next.js App Router pages
  /page.tsx          # Main office page
  /layout.tsx        # Root layout
  /globals.css       # Global styles

/components           # React components
  /TeamSidebar.tsx    # Left sidebar with agent list
  /OfficeCanvas.tsx   # Phaser game container
  /TaskPanel.tsx      # Right chat panel
  /KanbanBoard.tsx    # Bottom task board
  /AddAgentModal.tsx  # Add agent form modal

/lib
  /store.ts           # Zustand state management
  /hooks              # React hooks
    /useSupabaseData.ts  # Supabase initialization & realtime
  /llm                # LLM provider abstraction
    /types.ts         # Shared interfaces
    /index.ts         # Provider factory
    /providers/       # Individual provider implementations
  /game               # Phaser game logic
    /OfficeScene.ts   # Main game scene
  /repository         # Data access layer
    /types.ts         # Repository interfaces
    /memory.ts        # In-memory implementation
    /supabase.ts      # Supabase implementation
  /supabase           # Supabase client
    /client.ts        # Client configuration
    /auth.ts          # Authentication helpers
    /types.ts         # Database types

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
- **Supabase**: Backend database and real-time subscriptions
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

Two implementations are provided:

1. **Supabase** (`lib/repository/supabase.ts`) - Full database with real-time
2. **In-Memory** (`lib/repository/memory.ts`) - Fallback for development

The app automatically uses Supabase when `NEXT_PUBLIC_SUPABASE_URL` is set, otherwise falls back to in-memory storage.

### Supabase Schema

The app connects to these tables:

- **agents**: name, role, instructions, allowed_tools, status, desk_x, desk_y, avatar, is_lead
- **tasks**: title, description, status, assignee_id, parent_id, created_by, updated_at
- **messages**: agent_id, role, content, task_id
- **approvals**: task_id, action, payload, status

All tables have RLS enabled and are in the `supabase_realtime` publication for live updates.

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

## Testing

### Automated Tests

```bash
npm run build  # Verify build passes
npm run lint   # Verify no linting errors
```

### Manual Supabase Test

```bash
# Test Supabase connection and CRUD operations
NEXT_PUBLIC_SUPABASE_URL=<url> NEXT_PUBLIC_SUPABASE_ANON_KEY=<key> npx tsx scripts/test-supabase.ts
```

## Roadmap

### Milestone 1 ✅
- Next.js foundation with Phaser 3 office
- In-memory data storage
- LLM provider abstraction
- Repository pattern

### Milestone 2 ✅
- Supabase backend integration
- Real-time synchronization
- Persistent chat history
- Add agent functionality

### Milestone 3 (Planned)
- Real-time collaboration
- Agent performance metrics
- Custom agent creation
- Advanced AI capabilities

## Art credits

Pixel-art tiles and characters are from Kenney's CC0 packs:

- [Roguelike Indoor](https://kenney.nl/assets/roguelike-indoors) — desks, chairs, tables, plants, benches
- [RPG Urban Pack](https://kenney.nl/assets/rpg-urban-pack) — wood floor, doors, and the six 4-direction walk-cycle characters

Wall caps, the carpet weave, and the desk monitors are original tiles drawn to match that set. License: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Credit Kenney (www.kenney.nl). Avatar ids `green`, `red`, `purple`, `worker`, `beard`, and `band` select those six characters.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
