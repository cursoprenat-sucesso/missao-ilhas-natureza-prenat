# PRENAT+ | Missão Ilhas da Natureza

Esta é uma versão visual da trilha gamificada PRENAT+, com ilhas/fases, vidas, nota mínima, desbloqueio progressivo e gabarito comentado.

## Arquivos principais

- `index.html`: jogo do aluno.
- `editor.html`: Área do Professor para cadastrar questões sem mexer em código.
- `questions.json`: banco de questões que o jogo carrega.
- `css/style.css`: aparência visual.
- `js/app.js`: lógica do jogo.
- `js/editor.js`: lógica do editor.
- `js/defaultBank.js`: banco de demonstração usado como fallback.

## Como usar sem código

1. Abra `editor.html`.
2. Escolha a fase/ilha na coluna esquerda.
3. Preencha o formulário da questão.
4. Clique em **Salvar questão na fase**.
5. Repita para todas as questões.
6. Clique em **Baixar banco JSON**.
7. O navegador vai baixar um arquivo chamado `questions.json`.
8. Substitua o arquivo antigo `questions.json` por esse novo.
9. Publique a pasta do site no GitHub Pages, Netlify, Vercel ou na sua plataforma.

## Como testar o jogo

Abra `index.html` em um navegador. Se o navegador bloquear o carregamento do arquivo JSON local, publique no GitHub Pages ou use uma extensão como Live Server no VS Code. No site online, o carregamento funciona normalmente.

## Como colocar imagens

Coloque a imagem na raiz do repositório e, no editor, preencha o campo de imagem assim:

```text
assets/nome-da-imagem.png
```

Também é possível usar um link direto de imagem, mas o caminho local em `assets/` é mais seguro para material próprio.

## Fórmulas e notação

O jogo aceita:

- Subscrito: `H<sub>2</sub>O`
- Sobrescrito: `m/s<sup>2</sup>`
- Fórmula com LaTeX: `\( Q = m \cdot c \cdot \Delta T \)`

## Regras do jogo

Cada fase/ilha tem:

- número de vidas;
- porcentagem mínima para passar;
- questões próprias;
- desbloqueio da próxima fase quando o aluno passa.

Se o aluno perde todas as vidas, a fase termina em Game Over. Se acerta o percentual mínimo e ainda tem vidas, a próxima ilha é desbloqueada.

## Observação importante

Esta versão não tem banco de dados nem login. O progresso do aluno fica salvo no navegador dele. Para ranking, login de aluno e relatório por turma, seria necessária uma versão com backend, por exemplo Supabase, Firebase ou servidor próprio.


## Versão sem pastas
Nesta versão, todos os arquivos ficam soltos na raiz do repositório para facilitar o upload pelo GitHub. Envie todos os arquivos de uma vez e não altere os nomes. Para imagens de questões, faça upload da imagem na raiz e use apenas o nome do arquivo, por exemplo: `grafico01.png`.
