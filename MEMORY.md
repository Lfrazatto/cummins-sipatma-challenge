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

## 2026-09-08 ranking fix

Fixed the public leaderboard query. The previous implementation ordered by the select alias `score`, which Drizzle emitted as `ORDER BY score` and caused a MySQL error in the deployed runtime. It now orders by the full aggregate expression `COALESCE(SUM(game_sessions.score), 0) DESC`. TypeScript, tests, production build, preview reload, server logs, and the equivalent live SQL query were validated successfully.

## 2026-09-08 timer update

Doubled the available challenge time: Fácil 120 seconds, Médio 90 seconds, Difícil 60 seconds. This applies to quiz and timed visual missions through the shared `difficultyMeta` configuration; points and completion logic remain unchanged.

## 2026-09-08 gameplay expansion

Expanded the SIPATMA question bank from 16 to 40 questions, focused on safety, care, prevention, emergency response, energy isolation, material handling, environmental responsibility and factory routines. Each new round shuffles both question order and answer options, preserving the correct answer index after shuffling.

Scoring now decays with elapsed round time: the base difficulty score is multiplied from 100% down to a 25% floor as the player uses the available time, with streak bonuses preserved. The awarded amount is shown in feedback and recorded in the database. The visual error hunt also uses the time-adjusted points and persists each discovered anomaly as an answer event.

The error hunt no longer displays visible target markers or names before discovery. It uses generic “Anomalia” slots and reveals the specific finding only after the player clicks a location in the industrial scene. The scene includes plausible factory hazards such as incomplete PPE, spill, blocked passage, poor storage, mixed waste and misplaced tools.
