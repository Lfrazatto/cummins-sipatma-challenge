# Structure

The app uses React for the product shell and plain TypeScript data structures for challenge content. The primary route is rendered by `client/src/App.tsx` with page state instead of nested URLs so the experience feels like a focused game console.

- `App.tsx`: navigation, localStorage persistence, player/ranking state, challenge state and page components.
- `index.css`: dark industrial design system, responsive breakpoints, game UI, motion and accessibility states.
- `questionBank`: 60 starter questions across Segurança, Meio ambiente, Lean Manufacturing, 5S, Kaizen and Kanban.
- Generated art is referenced from WebDev storage paths and is intentionally not committed to the project tree.

The client state model is ready to be replaced by tRPC procedures: player profile, score submissions, question management, rankings and admin operations map cleanly to server procedures in the existing full-stack scaffold.
