# PRENAT+ | Natureza — Banco rotativo V23

Versão com banco rotativo de questões por aluno.

## Regra implementada

O aluno só repete uma questão depois de esgotar todo o banco daquela ilha/ciclo.

Exemplo: se a ilha tem 50 questões e a tentativa usa 10, as próximas tentativas vão priorizar questões ainda não vistas. Se restarem menos questões inéditas do que a quantidade da tentativa, o jogo aplica somente as restantes para encerrar o ciclo. Na tentativa seguinte, um novo ciclo é iniciado.

## Permanece ativo

- Cadastro do aluno
- Ranking/registro via Google Planilhas
- Importador CSV no professor
- Feedback positivo
- Feedback negativo
- Backup automático
- Validação contra alternativas duplicadas
- Embaralhamento de questões e alternativas

## Atenção

Esse controle é salvo no navegador/dispositivo do aluno, associado ao aluno identificado no jogo. Para sincronizar entre aparelhos diferentes, será necessária uma próxima etapa com consulta ao Google Apps Script/Planilhas.

## Links após subir no GitHub

Aluno:
https://cursoprenat-sucesso.github.io/missao-ilhas-natureza/?v=24

Professor:
https://cursoprenat-sucesso.github.io/missao-ilhas-natureza/professor.html?v=24


## Correção V24

As alternativas agora ficam fixas na ordem cadastrada. Isso evita divergência entre a letra indicada no feedback e a alternativa marcada no jogo do aluno.
