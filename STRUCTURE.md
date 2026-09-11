# Estrutura atual

- `client/src/App.tsx`: shell React, navegação, estado das partidas, pontuação e páginas.
- `client/src/content/README.md`: regras e localização das perguntas editáveis.
- `client/src/games/README.md`: descrição dos jogos Ache o erro e Organize e cuide.
- `client/src/admin/README.md`: permissões e controles do painel administrativo.
- `client/src/index.css`: tema claro, identidade Cummins e responsividade.
- `server/db.ts`: persistência de acessos, partidas, respostas e limpeza de rankings.
- `server/routers.ts`: procedures públicas de jogo e procedures protegidas do admin.
- `drizzle/schema.ts`: tabelas de usuários, visitas, sessões e respostas.

Para editar conteúdo sem alterar a infraestrutura, comece pelo `questionBank` em `client/src/App.tsx` e pelos componentes `ErrorHunt` e `KanbanBoard` (apresentado ao jogador como Organize e cuide).
