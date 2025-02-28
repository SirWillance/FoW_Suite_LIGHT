# Development Journey: My Epic Quest with Force of Will Suite

Welcome to the behind-the-scenes story of building `FoW_Suite_LIGHT`, especially `PromptRefinerLight`! It’s like sharing my character’s epic quest through the coding dungeon—full of challenges, victories, and lessons for ComfyUI. 🚀🎮

---

## 1. The Beginning: Why `FoW_Suite_LIGHT`?
- **Goal**: I wanted to create a newbie-friendly node suite for ComfyUI to simplify prompt creation for low-spec users and enable collaboration with high-spec users.
- **Inspiration**: The “Force of Will” (FoW) vision grew from helping beginners refine prompts, starting with a light version focused on raw prompts, predefined libraries, and no customized tokens.

---

## 2. Challenges Along the Way
- **Tokenization vs. Simplicity**: Initially, I included tokenization, but it confused newbies. I stripped it for `FoW_Suite_LIGHT`, focusing on raw prompts with predefined libraries for agents/villains.
- **File I/O Struggles**: Loading/saving `.txt` files for cross-platform use was tricky—ensuring newline-separated Positive/Negative prompts required careful parsing.
- **UI Design**: Balancing drag, resize, collapse, and newbie guidance (e.g., alerts, tooltips) took time, but I settled on a dark theme with green/red accents for fun.
- **Git Setup**: Setting up Git for `FoW_Suite_LIGHT` on GitHub (`https://github.com/SirWillance/FoW_Suite_LIGHT`) was a puzzle—resolving “unrelated histories” errors taught me version control basics.
- **ComfyUI Manager Integration**: Registering `FoW_Suite_LIGHT` with ComfyUI Manager (`custom-node-list.json` PR) was new, but it’s now pullable via “Install Custom Nodes” for users.

---

## 3. Victories and Lessons
- **Light Version Success**: Finalizing `FoW_Suite_LIGHT` as a simple, stable suite with `PromptRefinerLight` was a win—users can enter prompts, save/load files, and use predefined libraries easily.
- **Community Feedback**: Testing with newbies showed alerts were helpful but overwhelming, leading to the “Show Tips” toggle. Twitch followers helped refine `FoW_Suite_Standard` (€15) ideas.
- **Future Plans**: I plan to expand to `FoW_Suite_Standard` (€15, enhanced Light nodes), `FoW_Suite_Pro` (€25, `PromptRefinerPro` with customized tokens), and `FoW_Suite_Ultimate` (€100, premium decoy), but `FoW_Suite_LIGHT` keeps it approachable.

---

## 4. Boosting Twitch with `FoW_Suite`
- **Twitch Affiliate Goal**: I’m streaming with `FoW_Suite_LIGHT` on [Twitch](https://www.twitch.tv/sirwillance) to reach Affiliate status (50+ followers, 500+ minutes, 7+ days, 3+ viewers in 30 days). The first 50 followers get free `FoW_Suite_Standard` (€15) via [Discord](https://discord.gg/BHSxf8HB) to speed up my audience growth!
- **Pro Tip for Coders**: Like leveling up in a game, test small changes, debug with `console.log`, and comment your code (see [Gamers_Corner](Gamers_Corner.md)). Stream your ComfyUI workflows to help me and unlock guild perks for Pro/Ultimate features!

---

### Achievement Unlocked: Documentation Legend
You’ve unlocked the story of `FoW_Suite_LIGHT`! Keep exploring, contributing, and streaming with `PromptRefinerLight` in ComfyUI. Join my guild on [Discord](https://discord.gg/BHSxf8HB) to level up together. 🚀🎮