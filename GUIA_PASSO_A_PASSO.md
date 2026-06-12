# Guia passo a passo — PRENAT+ RPG V2

## 1. Link do aluno e link do professor

O aluno entra no link normal do site:

`https://cursoprenat-sucesso.github.io/missao-ilhas-natureza-prenat/`

O professor entra no painel:

`https://cursoprenat-sucesso.github.io/missao-ilhas-natureza-prenat/professor.html`

Não divulgue o link do professor para os alunos.

---

## 2. Como cadastrar questões

1. Abra `professor.html`.
2. Clique em **Cadastrar questões**.
3. Escolha a fase/ilha.
4. Preencha disciplina, tema e dificuldade como etiquetas internas.
5. Escreva o enunciado.
6. Se a questão tiver imagem, escreva o nome do arquivo da imagem, por exemplo: `grafico01.png`.
7. Preencha alternativas A, B, C, D e E.
8. Marque a alternativa correta.
9. Escreva o comentário geral do gabarito.
10. Escreva o comentário/distrator de cada alternativa.
11. Clique em **Salvar questão**.
12. Depois clique em **Baixar questions.json**.
13. Substitua o arquivo `questions.json` no GitHub.

---

## 3. Como configurar as fases

1. Abra `professor.html`.
2. Clique em **Configurar missão**.
3. Edite:
   - nome da missão;
   - subtítulo;
   - introdução;
   - nome das ilhas;
   - vidas;
   - meta mínima;
   - limite de questões;
   - patente desbloqueada.
4. Clique em **Baixar settings.json**.
5. Substitua o arquivo `settings.json` no GitHub.

---

## 4. Como colocar imagem na questão

Suba a imagem junto com os arquivos do GitHub, na raiz do repositório.

Exemplo de nome:

`grafico-calorimetria.png`

No campo de imagem da questão, escreva exatamente:

`grafico-calorimetria.png`

Evite nomes com acentos e espaços.

Use preferencialmente:

- `.png`
- `.jpg`
- `.webp`

---

## 5. Como usar fórmulas

Subscrito:

`H<sub>2</sub>O`

Sobrescrito:

`m/s<sup>2</sup>`

Fórmula com LaTeX:

`\( Q = m \cdot c \cdot \Delta T \)`

---

## 6. Como atualizar no GitHub

1. Vá no repositório.
2. Clique em **Add file > Upload files**.
3. Arraste os arquivos novos.
4. Se aparecer aviso de substituição, pode continuar.
5. Clique em **Commit changes**.
6. Espere alguns minutos.
7. Teste o link do aluno.

---

## 7. Quantas questões posso colocar?

Não há um limite fixo no jogo. Você pode colocar muitas questões por fase.

Recomendação prática:

- fase 1: 10 questões;
- fase 2: 20 questões;
- fase 3: 30 questões;
- fase 4: 45 questões;
- fase 5: 60 questões;
- fase 6: 90 questões.

No `settings.json`, cada fase tem um campo chamado `questionLimit`. Se houver mais questões cadastradas do que o limite, o jogo usa apenas a quantidade configurada.
