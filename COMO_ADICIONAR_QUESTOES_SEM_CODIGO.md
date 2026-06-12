# Como adicionar questões sem mexer em código

## Caminho mais fácil: formulário do editor

1. Abra o arquivo `editor.html`.
2. Clique na ilha desejada.
3. Preencha:
   - Disciplina
   - Tema
   - Enunciado
   - Alternativas A, B, C, D e E
   - Alternativa correta
   - Comentário do gabarito
   - Descritores/distratores
4. Clique em **Salvar questão na fase**.
5. Quando terminar, clique em **Baixar banco JSON**.
6. Substitua o arquivo `questions.json` pelo novo arquivo baixado.

Pronto. Você não precisa abrir `app.js`, `editor.js` nem escrever código.

## Caminho em massa: planilha CSV

O editor também tem o botão **Baixar modelo CSV**.

Você pode preencher a planilha com as colunas:

```text
fase, disciplina, tema, enunciado, imagem, a, b, c, d, e, correta, comentario, descritor_a, descritor_b, descritor_c, descritor_d, descritor_e
```

Depois:

1. Clique em **Importar CSV**.
2. Escolha a planilha `.csv`.
3. Confira as questões no editor.
4. Clique em **Baixar banco JSON**.
5. Substitua `questions.json`.

## Como indicar a alternativa correta

No formulário, basta escolher A, B, C, D ou E.

Na planilha CSV, use uma letra:

```text
A
B
C
D
E
```

## Como inserir fórmulas

Use LaTeX entre `\(` e `\)`:

```text
\( Q = m \cdot c \cdot \Delta T \)
```

## Como inserir subscrito e sobrescrito

Subscrito:

```text
H<sub>2</sub>O
```

Sobrescrito:

```text
m/s<sup>2</sup>
```

## Como inserir imagem

Coloque a imagem na raiz do repositório e escreva no campo de imagem:

```text
assets/minha-imagem.png
```

## Como publicar depois de editar

Depois de substituir `questions.json`, envie a pasta atualizada para o GitHub Pages ou para a plataforma onde o site estiver hospedado.


## Versão sem pastas
Nesta versão, todos os arquivos ficam soltos na raiz do repositório para facilitar o upload pelo GitHub. Envie todos os arquivos de uma vez e não altere os nomes. Para imagens de questões, faça upload da imagem na raiz e use apenas o nome do arquivo, por exemplo: `grafico01.png`.
