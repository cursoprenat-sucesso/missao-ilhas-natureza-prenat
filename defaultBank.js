window.PRENAT_DEFAULT_BANK = {
  "meta": {
    "title": "Missão Ilhas da Natureza",
    "version": "3.0",
    "updatedAt": "2026-06-12",
    "subtitle": "Trilha gamificada de Ciências da Natureza PRENAT+",
    "initialRank": {
      "title": "Ovo da Travessia",
      "badge": "🥚",
      "message": "Todo mestre começa como um ovo: pequeno, protegido e pronto para romper a casca."
    },
    "ranks": [
      {
        "title": "Ovo da Travessia",
        "badge": "🥚",
        "message": "Começo da jornada. O aluno ainda está preparando a casca para entrar no arquipélago."
      },
      {
        "title": "Filhote do Casco",
        "badge": "🐣",
        "message": "Primeira ilha vencida. O aluno saiu do ovo e começou a caminhar com autonomia."
      },
      {
        "title": "Explorador das Marés",
        "badge": "🌊",
        "message": "Segunda ilha vencida. O aluno já atravessa fenômenos do cotidiano com mais segurança."
      },
      {
        "title": "Guardião da Energia",
        "badge": "⚡",
        "message": "Terceira ilha vencida. O aluno domina melhor transformações, energia e conservação."
      },
      {
        "title": "Navegador da Vida",
        "badge": "🌱",
        "message": "Quarta ilha vencida. O aluno interpreta saúde, ambiente e seres vivos em situações reais."
      },
      {
        "title": "Mestre da Evolução",
        "badge": "🧬",
        "message": "Quinta ilha vencida. O aluno já encara questões médias e interdisciplinares com estratégia."
      },
      {
        "title": "Grande Mestre da Natureza",
        "badge": "🏆",
        "message": "Boss Final vencido. O aluno concluiu a travessia e provou maturidade nas Ciências da Natureza."
      }
    ]
  },
  "phases": [
    {
      "id": "ilha-casco",
      "title": "Ilha do Casco",
      "subtitle": "fundamentos para sair do ovo",
      "icon": "🐢",
      "lives": 3,
      "minScore": 60,
      "story": "A tartaruga PRENAT+ chegou à primeira ilha. Aqui o aluno rompe a casca: precisa mostrar que domina os conceitos de base antes de atravessar o arquipélago.",
      "questions": [
        {
          "id": "casco-q01",
          "discipline": "Física",
          "topic": "Termologia",
          "text": "Em uma manhã fria, uma pessoa pisa descalça no piso de cerâmica e depois em um tapete. Os dois estavam no mesmo quarto durante toda a noite, mas a cerâmica parece mais fria. A melhor explicação física para essa sensação é:",
          "image": "",
          "options": [
            "A cerâmica está obrigatoriamente em temperatura menor que o tapete.",
            "O tapete produz calor e aquece os pés da pessoa.",
            "A cerâmica conduz melhor o calor da pele, retirando energia térmica mais rapidamente.",
            "O frio passa da cerâmica para o pé com mais intensidade.",
            "A cerâmica absorve umidade do ar e por isso vira uma fonte de frio."
          ],
          "correctIndex": 2,
          "explanation": "Mesmo estando à mesma temperatura ambiente, materiais diferentes transferem calor em taxas diferentes. A cerâmica tem maior condutividade térmica que o tapete, por isso retira calor dos pés mais rapidamente e gera maior sensação de frio.",
          "descriptors": [
            "Erro comum: confunde sensação térmica com temperatura real.",
            "Erro comum: atribui produção espontânea de calor ao tapete.",
            "Correta: relaciona a sensação térmica à condução de calor.",
            "Erro comum: trata o frio como algo que se desloca.",
            "Erro comum: cria uma causa sem relação física direta com a transferência de calor."
          ]
        },
        {
          "id": "casco-q02",
          "discipline": "Biologia",
          "topic": "Ecologia",
          "text": "Em uma horta escolar, estudantes percebem que joaninhas aparecem com frequência nas folhas atacadas por pulgões. O professor explica que isso pode ser usado como exemplo de controle biológico. Nesse caso, o raciocínio ecológico correto é:",
          "image": "",
          "options": [
            "A joaninha ocupa o mesmo nicho ecológico do pulgão, por isso compete diretamente com ele por seiva.",
            "A joaninha pode predar pulgões, reduzindo a população da praga sem uso direto de inseticidas.",
            "O pulgão deixa de se reproduzir porque a presença de joaninhas aumenta a fotossíntese da planta.",
            "A joaninha transforma o pulgão em produtor, equilibrando a cadeia alimentar.",
            "O controle biológico ocorre porque todos os organismos da horta passam a ter a mesma função ecológica."
          ],
          "correctIndex": 1,
          "explanation": "Controle biológico é o uso de um organismo para controlar a população de outro. Joaninhas predam pulgões, podendo reduzir a praga de forma ecológica.",
          "descriptors": [
            "Erro: confunde predação com competição e nicho ecológico.",
            "Correta: reconhece a relação predador-presa aplicada ao controle biológico.",
            "Erro: atribui efeito fisiológico falso à presença do predador.",
            "Erro: altera indevidamente o papel trófico dos organismos.",
            "Erro: ignora a diferença entre nicho, população e cadeia alimentar."
          ]
        }
      ],
      "reward": {
        "title": "Filhote do Casco",
        "badge": "🐣",
        "message": "Você rompeu o ovo da travessia. Agora é um Filhote do Casco: começou pequeno, mas já está andando sozinho pela trilha."
      }
    },
    {
      "id": "ilha-equilibrio",
      "title": "Ilha do Equilíbrio",
      "subtitle": "cotidiano, fenômenos e interpretação",
      "icon": "⚖️",
      "lives": 3,
      "minScore": 65,
      "story": "Na segunda ilha, o aluno precisa interpretar situações reais sem cair em frases decoradas ou explicações de senso comum.",
      "questions": [
        {
          "id": "equilibrio-q01",
          "discipline": "Química",
          "topic": "Separação de misturas",
          "text": "Uma comunidade usa água barrenta retirada de um açude. Antes da filtração, um agente adiciona uma substância que favorece a união de partículas muito pequenas, formando flocos maiores que decantam com mais facilidade. O processo descrito é melhor identificado como:",
          "image": "",
          "options": [
            "Destilação fracionada, pois separa sólidos dissolvidos por diferença de ponto de ebulição.",
            "Floculação, pois partículas finas se agregam em flocos maiores, facilitando a decantação.",
            "Cromatografia, pois os componentes são separados por afinidade com uma fase móvel.",
            "Separação magnética, pois todas as partículas de barro apresentam atração por ímãs.",
            "Evaporação, pois a água precisa desaparecer para que as impurezas sejam removidas."
          ],
          "correctIndex": 1,
          "explanation": "A floculação é a etapa em que partículas pequenas se unem em flocos maiores. Isso facilita a sedimentação/decantação e costuma anteceder a filtração no tratamento de água.",
          "descriptors": [
            "Erro: confunde tratamento de água com destilação.",
            "Correta: identifica a formação de flocos como floculação.",
            "Erro: aplica cromatografia fora do contexto.",
            "Erro: presume magnetismo inexistente nas partículas de barro.",
            "Erro: propõe remoção da água, não das impurezas."
          ]
        },
        {
          "id": "equilibrio-q02",
          "discipline": "Física",
          "topic": "Mudanças de estado",
          "text": "Após uma corrida, uma pessoa sente resfriamento quando o suor evapora da pele. Em um dia muito úmido, esse alívio é menor. A explicação mais adequada é:",
          "image": "",
          "options": [
            "A evaporação libera calor para a pele, e a umidade impede essa liberação.",
            "O suor evapora absorvendo energia da pele; quando o ar está úmido, a evaporação diminui e o resfriamento é menor.",
            "O frio entra no corpo por meio das gotas de suor.",
            "A umidade transforma calor em temperatura, anulando a função do suor.",
            "O suor só resfria quando está parado; em movimento, não há troca de calor."
          ],
          "correctIndex": 1,
          "explanation": "Evaporar exige energia. Parte dessa energia é retirada da pele na forma de calor latente, causando resfriamento. Quando o ar está úmido, a evaporação é dificultada, reduzindo o efeito refrescante.",
          "descriptors": [
            "Erro: inverte o sentido energético da evaporação.",
            "Correta: relaciona evaporação, calor latente e umidade do ar.",
            "Erro: usa a ideia incorreta de que frio entra no corpo.",
            "Erro: mistura calor e temperatura sem mecanismo físico.",
            "Erro: nega indevidamente a troca de calor durante movimento."
          ]
        }
      ],
      "reward": {
        "title": "Explorador das Marés",
        "badge": "🌊",
        "message": "Você aprendeu a atravessar ondas de interpretação. Agora é Explorador das Marés e já não se perde em explicações superficiais."
      }
    },
    {
      "id": "ilha-energia",
      "title": "Ilha da Energia",
      "subtitle": "transformações, sistemas e conservação",
      "icon": "⚡",
      "lives": 3,
      "minScore": 70,
      "story": "Aqui aparecem fenômenos que envolvem energia no corpo, nos aparelhos, na química e no ambiente. A exigência começa a subir.",
      "questions": [],
      "reward": {
        "title": "Guardião da Energia",
        "badge": "⚡",
        "message": "Você protegeu a ilha da energia e mostrou que consegue relacionar fenômenos, transformações e conservação."
      }
    },
    {
      "id": "ilha-vida",
      "title": "Ilha da Vida",
      "subtitle": "biologia em problemas reais",
      "icon": "🌱",
      "lives": 3,
      "minScore": 75,
      "story": "Nesta ilha, o aluno usa Biologia para explicar saúde, ambiente, genética e relações ecológicas em contextos reais.",
      "questions": [],
      "reward": {
        "title": "Navegador da Vida",
        "badge": "🌱",
        "message": "Você navegou pelos sistemas vivos. Agora entende melhor como a vida aparece em problemas de prova e do cotidiano."
      }
    },
    {
      "id": "ilha-evolucao",
      "title": "Ilha da Evolução",
      "subtitle": "questões médias e interdisciplinares",
      "icon": "🧬",
      "lives": 3,
      "minScore": 80,
      "story": "As questões ficam mais longas e pedem leitura de textos, tabelas, gráficos e situações-problema. Aqui começa a travessia avançada.",
      "questions": [],
      "reward": {
        "title": "Mestre da Evolução",
        "badge": "🧬",
        "message": "Você evoluiu na estratégia. Agora é Mestre da Evolução: interpreta melhor, erra menos por distração e conecta áreas diferentes."
      }
    },
    {
      "id": "boss-natureza",
      "title": "Boss Final Natureza",
      "subtitle": "fase hard, hard, hard",
      "icon": "🏆",
      "lives": 3,
      "minScore": 85,
      "story": "A última ilha reúne os desafios mais fortes. Para vencer, o aluno precisa atravessar Química, Física e Biologia sem perder todas as vidas.",
      "questions": [],
      "reward": {
        "title": "Grande Mestre da Natureza",
        "badge": "🏆",
        "message": "Você venceu o Boss Final. Agora é Grande Mestre da Natureza: concluiu a travessia e desbloqueou o nível máximo da trilha."
      }
    }
  ]
};
