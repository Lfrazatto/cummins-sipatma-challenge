# Memory

- The app is implemented as a responsive React client inside the `web-db-user` scaffold.
- LocalStorage is used for the demo player and ranking so every challenge can be tested without an authenticated account or database seed.
- The database/auth scaffold remains intact and can be connected to score-submission procedures in a follow-up slice.
- Generated images were uploaded to WebDev storage; the client references `/manus-storage/...` URLs.
- Admin demo gate uses `CUMMINS2026` as a visible, non-production demonstration password. Production should replace this with the scaffold's authenticated role gate.

## 2026-09-08 update

The original mixed-topic question bank was removed and replaced with 16 SIPATMA-focused questions. The current content emphasizes prevention, recognizing risks, safe behavior, care for colleagues, emergency response, environmental responsibility, and the principle of not accepting unsafe shortcuts. The home stats, mission cards, admin summary, and learning library were updated to match this scope.

The primary navigation now uses clearer Portuguese labels: **Início**, **Jogar agora**, **Ranking**, **Aprender**, and **Meu perfil**. On mobile, the menu shows a title plus a short explanation beneath each action so the purpose of each destination is easier to understand.

## 2026-09-08 analytics and Cummins identity update

The game now records real analytics in MySQL/TiDB: `game_visits` stores visitor access events, `game_sessions` stores participant, sector, difficulty, challenge, status, score, correct/incorrect totals and accuracy, and `game_answers` stores each selected alternative and earned points. Public pages only expose aggregate statistics and an aggregate leaderboard; the detailed dashboard is protected by the existing Manus OAuth admin role.

The Admin page no longer uses the former hard-coded demo password. It requires an authenticated user with `role = admin`, and shows unique visitors, sessions, completed games, average accuracy, total points, recent participants, sector performance, and a privacy note.

The visual system now uses the Cummins red accent alongside safety cyan and includes an Osasco laboratory photo at `/manus-storage/cummins-osasco-lab_3f8bd7f1.jpg`, with an on-page attribution link to the AutoIndústria source. The photo should only remain in public production if the organization has the appropriate usage authorization.
