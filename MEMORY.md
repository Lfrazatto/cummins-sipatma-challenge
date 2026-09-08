# Memory

- The app is implemented as a responsive React client inside the `web-db-user` scaffold.
- LocalStorage is used for the demo player and ranking so every challenge can be tested without an authenticated account or database seed.
- The database/auth scaffold remains intact and can be connected to score-submission procedures in a follow-up slice.
- Generated images were uploaded to WebDev storage; the client references `/manus-storage/...` URLs.
- Admin demo gate uses `CUMMINS2026` as a visible, non-production demonstration password. Production should replace this with the scaffold's authenticated role gate.

## 2026-09-08 update

The original mixed-topic question bank was removed and replaced with 16 SIPATMA-focused questions. The current content emphasizes prevention, recognizing risks, safe behavior, care for colleagues, emergency response, environmental responsibility, and the principle of not accepting unsafe shortcuts. The home stats, mission cards, admin summary, and learning library were updated to match this scope.

The primary navigation now uses clearer Portuguese labels: **Início**, **Jogar agora**, **Ranking**, **Aprender**, and **Meu perfil**. On mobile, the menu shows a title plus a short explanation beneath each action so the purpose of each destination is easier to understand.
