# Administração

O painel é restrito a usuários autenticados com `role = admin`. Ele mostra acessos, partidas, respostas, precisão, pontos, participações recentes, vencedores e desempenho por setor.

O botão **Apagar ranking real** remove partidas e respostas persistidas do banco e exige confirmação do administrador. O botão de reset local afeta apenas o navegador atual.

Rotas tRPC relacionadas: `analytics.dashboard` e `analytics.clearRankings`.
