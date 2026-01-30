# AI Agents & Services Architecture

## 1. The Screenwriter Agent (DreamWeaver)
**Service:** `libs/ai-core`
**Powered by:** Google Gemini 1.5 Pro via Vertex AI / AI Studio.
**Role:**
- Takes raw user ideas and converts them into structured comic scripts.
- Maintains context (characters, plot points) across the session.
- **Output:** JSON object containing `panels`, `dialogues`, and `visual_prompts` (in English).
- **Critical Constraint:** Must strictly adhere to the defined JSON schema for the frontend renderer.

## 2. The Illustrator Agent (VisualEngine)
**Service:** `libs/image-gen`
**Powered by:** Nano Banana Pro (or Stable Diffusion API).
**Role:**
- Receives specific visual prompts from the Screenwriter.
- Handles negative prompting and style injection (DreamWeaver Style).
- **Output:** URL of the generated image (stored in hot storage).

## 3. The Studio Manager (Backend Core)
**Service:** `apps/server` (Fastify)
**Role:**
- Orchestrates the flow between Screenwriter and Illustrator.
- **Google Drive Integration:** Acts as the "Archivist". Periodically syncs completed pages/projects to the users Google Drive folder as a backup/export.
- **Stripe Integration:** Manages the "Studio Funds". Checks balance before authorizing API calls to Agents 1 & 2.
- **Database:** Manages MongoDB (Atlas) for persisting project state, character sheets, and user settings.

## 4. The Editor (Frontend UI)
**Service:** `apps/client` (React)
**Role:**
- Real-time WYSIWYG editor.
- Displays the generated panels.
- Allows user to edit text bubbles overlay (Canvas/DOM).
- Sends "Regenerate" requests back to the Studio Manager.
