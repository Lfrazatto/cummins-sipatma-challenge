# Cummins SIPATMA Challenge — Plan

## Product slice

A polished, responsive corporate game hub for SIPATMA, safety, environment and Lean Manufacturing. The first implementation prioritizes a high-quality playable client experience with local persistence so the flow can be demonstrated end to end without requiring an external login.

## Risk slices

1. **Game state transitions:** quiz answer feedback, lives, streaks, timer, results and replay.
2. **Visual challenge:** clickable factory hotspots mapped to six safety and Lean anomalies.
3. **Kanban interaction:** card selection, WIP-aware board movement and completion state.
4. **Responsive shell:** desktop navigation, mobile navigation and compact game layouts.
5. **Persistence:** localStorage player profile and rankings, admin demo reset.

## Verification criteria

- Player can identify with nickname, sector and difficulty.
- Home screen visibly communicates the product, mission cards and industrial art direction.
- Quiz has immediate correctness feedback and scoring.
- Caça-erros uses the generated factory image and clickable hotspots.
- Kanban board supports moving cards and completing a mini mission.
- Ranking shows podium, table, sector champion and current player highlight.
- Learn, achievements, profile and admin gate are reachable and responsive.
- `pnpm check` passes and preview screenshots show no runtime or layout errors.
