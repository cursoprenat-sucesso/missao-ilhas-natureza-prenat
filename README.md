# PRENAT+ | Missão Ilhas da Natureza — V5 Editor Fácil

Esta versão mantém o jogo do aluno com mapa leve, banco de questões sorteado por tentativa, vidas, metas, patentes e mensagens de flow.

## Novidade principal da V5

O painel do professor ficou mais fácil para cadastrar questões:

- botão de **subscrito**: transforma seleção em `<sub>...</sub>`;
- botão de **sobrescrito**: transforma seleção em `<sup>...</sup>`;
- botão de **fórmula LaTeX**: insere `\( ... \)`;
- botão **Auto química**: transforma fórmulas como `Na2CO3` em `Na<sub>2</sub>CO<sub>3</sub>`;
- botões de símbolos: `→`, `⇌` e `Δ`;
- imagem por arquivo, arrastar ou **Ctrl + V** na caixa da imagem;
- prévia da imagem no painel do professor.

## Links

- Aluno: `index.html`
- Professor: `professor.html`

No GitHub Pages, o link do professor fica igual ao link do aluno, acrescentando `/professor.html` ao final.

## Arquivos principais

- `index.html`: jogo do aluno.
- `professor.html`: painel do professor.
- `settings.json`: configurações da missão, fases, vidas e metas.
- `questions.json`: banco de questões.
- `app.js`: lógica do jogo do aluno.
- `professor.js`: lógica do painel do professor.
- `style.css`: visual do aluno e professor.
- `logo-prenat.png`: logo usada no topo.
