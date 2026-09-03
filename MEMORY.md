# Memory

- The app is implemented as a responsive React client inside the `web-db-user` scaffold.
- LocalStorage is used for the demo player and ranking so every challenge can be tested without an authenticated account or database seed.
- The database/auth scaffold remains intact and can be connected to score-submission procedures in a follow-up slice.
- Generated images were uploaded to WebDev storage; the client references `/manus-storage/...` URLs.
- Admin demo gate uses `CUMMINS2026` as a visible, non-production demonstration password. Production should replace this with the scaffold's authenticated role gate.
