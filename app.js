(() => {
  const app = document.getElementById('app');
  const letters = ['A', 'B', 'C', 'D', 'E'];
  let settings = null;
  let questions = [];
  let progress = null;
  let currentRun = null;

  const DEFAULT_SETTINGS = {
    slug: 'missao-ilhas-natureza-prenat-v7-tartarugas',
    brand: 'PRENAT+',
    missionName: 'Missão Ilhas da Natureza',
    missionKicker: 'CAMPO DE TREINO PRENAT+',
    subtitle: 'Uma travessia leve e estratégica com desafios progressivos de Ciências da Natureza.',
    intro: 'Você vai atravessar ilhas, vencer desafios mistos de Biologia, Física e Química e evoluir de ovo a mestre da travessia.',
    studentThemeNote: 'Cada tentativa sorteia questões do banco da ilha. Volte, tente de novo e construa sua evolução passo a passo.',
    showMetaToStudent: false,
    logo: 'logo-prenat.png',
    ranks: [
      { name:'Ovo da Travessia', icon:'🥚', visualStage:0, description:'Você ainda está no início da jornada. A casca protege sua preparação antes da primeira ilha.' },
      { name:'Filhote do Casco', icon:'🐢', visualStage:1, description:'Você saiu do ovo, rompeu a primeira casca e virou Filhote do Casco.' },
      { name:'Explorador das Marés', icon:'🐢', visualStage:2, description:'Você já encara a travessia com mais segurança e começa a reconhecer os caminhos da prova.' },
      { name:'Guardião da Travessia', icon:'🐢', visualStage:3, description:'Você sustenta o foco diante de armadilhas, gráficos e alternativas parecidas.' },
      { name:'Navegador da Resistência', icon:'🐢', visualStage:4, description:'Você atravessa questões maiores, interpreta dados e mantém calma até o fim.' },
      { name:'Mestre da Travessia', icon:'🐢', visualStage:5, description:'Você domina etapas exigentes, elimina distratores fortes e conduz a própria evolução.' },
      { name:'Grande Mestre da Natureza', icon:'🐢', visualStage:6, description:'Você venceu o Boss Final e concluiu a travessia PRENAT+ como Grande Mestre da Natureza.' }
    ],
    phases: []
  };

  function turtleBadgeSvg(stage = 0, mode = 'island') {
    const s = Math.max(0, Math.min(6, Number(stage) || 0));
    const shell = ['#fdf9ec', '#09999f', '#0aa7a6', '#055274', '#d01890', '#0b6979', '#fccc46'][s];
    const shell2 = ['#ffffff', '#64d8cf', '#71ded3', '#2a8aa0', '#e86ab4', '#5bc7ca', '#ffe08a'][s];
    const cape = s >= 5 ? `<path d="M90 82 C116 82 125 102 115 118 C98 111 87 101 79 88 Z" fill="#d01890" opacity="0.78"/>` : '';
    const crown = s === 6 ? `<path d="M72 34 L80 20 L90 34 L102 22 L108 40 L68 40 Z" fill="#fccc46" stroke="#6d5b2e" stroke-width="4" stroke-linejoin="round"/>` : '';
    const medal = s >= 4 ? `<circle cx="88" cy="80" r="9" fill="#fccc46" stroke="#6d5b2e" stroke-width="3"/><path d="M84 79 h8" stroke="#6d5b2e" stroke-width="3"/>` : '';
    const bandana = s === 3 ? `<path d="M95 55 q14 -2 23 6" stroke="#d01890" stroke-width="6" stroke-linecap="round"/><path d="M113 60 l14 -8 l-5 15 z" fill="#d01890"/>` : '';
    const compass = s === 2 ? `<circle cx="92" cy="77" r="10" fill="#fff" stroke="#055274" stroke-width="3"/><path d="M92 68 l4 9 l-9 4 z" fill="#d01890"/>` : '';
    const egg = s === 0 ? `<g class="egg-shell"><ellipse cx="86" cy="82" rx="27" ry="34" fill="#fffdf7" stroke="#313940" stroke-width="5"/><path d="M63 81 l10 -8 l8 9 l8 -9 l9 9 l10 -8 l6 12" fill="none" stroke="#313940" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="78" cy="88" r="4" fill="#e9e6df"/><circle cx="94" cy="101" r="5" fill="#e9e6df"/></g>` : '';
    const babyHead = s === 1 ? `<circle cx="112" cy="72" r="18" fill="#18b8b0" stroke="#4b5a5f" stroke-width="4"/>` : `<circle cx="112" cy="69" r="18" fill="#18b8b0" stroke="#4b5a5f" stroke-width="4"/>`;
    if (s === 0) {
      return `<svg class="turtle-svg turtle-stage-${s} ${mode}" viewBox="0 0 180 150" role="img" aria-label="Ovo da Travessia"><ellipse cx="90" cy="128" rx="58" ry="14" fill="#d6ad6c" opacity=".9"/><circle cx="90" cy="70" r="54" fill="#9be5df" opacity=".82"/><path d="M92 54 c13 -18 39 -8 36 14 c-2 17 -20 25 -36 18" fill="#18b8b0" stroke="#4b5a5f" stroke-width="4"/><circle cx="109" cy="58" r="3" fill="#17242b"/>${egg}</svg>`;
    }
    return `<svg class="turtle-svg turtle-stage-${s} ${mode}" viewBox="0 0 180 150" role="img" aria-label="Tartaruga estágio ${s}">
      <ellipse cx="90" cy="130" rx="62" ry="13" fill="#d6ad6c" opacity=".9"/>
      <circle cx="90" cy="74" r="55" fill="#9be5df" opacity=".78"/>
      ${cape}
      <ellipse cx="78" cy="84" rx="44" ry="34" fill="${shell}" stroke="#4b5a5f" stroke-width="4"/>
      <path d="M45 82 q33 -34 67 0 q-33 28 -67 0Z" fill="${shell2}" opacity=".52"/>
      <path d="M67 56 l13 55 M51 77 h58" stroke="rgba(5,82,116,.45)" stroke-width="3" stroke-linecap="round"/>
      ${babyHead}
      <circle cx="117" cy="64" r="3.2" fill="#17242b"/>
      <path d="M115 76 q8 7 16 0" stroke="#17242b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="51" cy="111" rx="15" ry="8" fill="#18b8b0" stroke="#4b5a5f" stroke-width="3"/>
      <ellipse cx="91" cy="113" rx="15" ry="8" fill="#18b8b0" stroke="#4b5a5f" stroke-width="3"/>
      <path d="M33 88 l-17 9 l17 7" fill="#18b8b0" stroke="#4b5a5f" stroke-width="3" stroke-linejoin="round"/>
      ${bandana}${compass}${medal}${crown}
    </svg>`;
  }

  function rankStage(rank, fallback = 0) {
    return Number(rank?.visualStage ?? fallback) || 0;
  }

  function buildVictoryMessage(phase, previousRank, nextRank) {
    const next = nextRank?.name || 'nova patente';
    if (rankStage(nextRank) === 1) {
      return `Sucesso! Você venceu ${phase.title}, saiu do ovo e agora é ${next}. A primeira ilha foi conquistada; siga com calma para a próxima travessia.`;
    }
    if (rankStage(nextRank) >= 6) {
      return `Travessia completa! Você venceu ${phase.title} e alcançou a patente ${next}. O Boss Final ficou para trás: sua evolução em Ciências da Natureza está registrada.`;
    }
    return `Sucesso! Você venceu ${phase.title} e evoluiu de ${previousRank?.name || 'sua patente anterior'} para ${next}. Uma nova ilha foi aberta para você continuar a travessia.`;
  }

  document.getElementById('resetProgress')?.addEventListener('click', () => {
    if (!settings) return;
    if (confirm('Deseja recomeçar esta missão? O progresso salvo neste navegador será apagado.')) {
      localStorage.removeItem(stateKey());
      progress = createInitialProgress();
      renderHome();
    }
  });

  init();

  async function init() {
    try {
      settings = await fetchJson('settings.json', DEFAULT_SETTINGS);
      questions = await fetchJson('questions.json', []);
      normalizeData();
      progress = loadProgress();
      applyBrand();
      renderHome();
    } catch (error) {
      console.error(error);
      app.innerHTML = `<section class="result-card glass-card"><div class="result-icon">⚠️</div><h1>Erro ao carregar</h1><p>Não consegui carregar a missão. Confira se os arquivos settings.json e questions.json foram enviados corretamente.</p></section>`;
    }
  }

  async function fetchJson(url, fallback) {
    try {
      const response = await fetch(`${url}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Falha ao buscar ${url}`);
      return await response.json();
    } catch (error) {
      console.warn(`Usando fallback para ${url}`, error);
      return structuredClone ? structuredClone(fallback) : JSON.parse(JSON.stringify(fallback));
    }
  }

  function normalizeData() {
    settings = { ...DEFAULT_SETTINGS, ...settings };
    settings.ranks = Array.isArray(settings.ranks) && settings.ranks.length ? settings.ranks : DEFAULT_SETTINGS.ranks;
    settings.phases = Array.isArray(settings.phases) ? settings.phases.map((phase, index) => ({
      id: Number(phase.id || index + 1),
      name: phase.name || `Ilha ${index + 1}`,
      title: phase.title || `Fase ${index + 1}`,
      story: phase.story || 'Vença as questões para desbloquear a próxima etapa.',
      minPercent: Number(phase.minPercent || 60),
      lives: Number(phase.lives || 3),
      questionLimit: Number(phase.questionLimit || 0),
      shuffle: phase.shuffle !== false,
      rewardRankIndex: Number(phase.rewardRankIndex ?? Math.min(index + 1, settings.ranks.length - 1)),
      difficultyLabel: phase.difficultyLabel || 'Treino'
    })) : [];
    settings.ranks = settings.ranks.map((rank, index) => ({ ...rank, visualStage: Number(rank.visualStage ?? index) }));
    questions = Array.isArray(questions) ? questions.map((q, index) => normalizeQuestion(q, index)) : [];
  }

  function normalizeQuestion(q, index) {
    let options = [];
    if (Array.isArray(q.options)) {
      options = q.options.map((op, i) => typeof op === 'string'
        ? { text: op, correct: Number(q.correctIndex) === i, feedback: '' }
        : { text: op.text || '', correct: Boolean(op.correct), feedback: op.feedback || '' });
    }
    if (!options.some(op => op.correct) && Number.isInteger(q.correctIndex) && options[q.correctIndex]) {
      options[q.correctIndex].correct = true;
    }
    return {
      id: q.id || `q_${index + 1}`,
      phase: Number(q.phase || 1),
      discipline: q.discipline || '',
      topic: q.topic || '',
      difficulty: q.difficulty || '',
      statement: q.statement || q.text || '',
      image: q.image || '',
      options,
      explanation: q.explanation || ''
    };
  }

  function applyBrand() {
    document.title = `${settings.brand} | ${settings.missionName}`;
    const brandName = document.getElementById('brandName');
    const missionMini = document.getElementById('missionMini');
    const brandLogo = document.getElementById('brandLogo');
    if (brandName) brandName.textContent = settings.brand;
    if (missionMini) missionMini.textContent = settings.missionName;
    if (brandLogo && settings.logo) brandLogo.src = settings.logo;
    document.querySelectorAll('.mission-logo-img').forEach(img => { if (settings.logo) img.src = settings.logo; });
  }

  function stateKey() {
    return `prenat_rpg_progress_${settings.slug || settings.missionName || 'missao'}`;
  }

  function createInitialProgress() {
    return { unlockedPhase: 1, completedPhases: [], rankIndex: 0, phaseScores: {} };
  }

  function loadProgress() {
    try {
      const saved = localStorage.getItem(stateKey());
      return saved ? { ...createInitialProgress(), ...JSON.parse(saved) } : createInitialProgress();
    } catch {
      return createInitialProgress();
    }
  }

  function saveProgress() {
    localStorage.setItem(stateKey(), JSON.stringify(progress));
  }

  function renderHome() {
    const template = document.getElementById('homeTemplate').content.cloneNode(true);
    app.innerHTML = '';
    app.appendChild(template);

    bindText('[data-bind="missionKicker"]', settings.missionKicker);
    bindText('[data-bind="missionName"]', settings.missionName);
    bindText('[data-bind="subtitle"]', settings.subtitle);
    bindText('[data-bind="intro"]', settings.intro);
    bindText('[data-bind="studentThemeNote"]', settings.studentThemeNote || 'Avance no seu ritmo. Cada tentativa é treino real.');

    renderRankPanel();
    renderMap();

    app.querySelector('[data-action="continue"]')?.addEventListener('click', () => {
      const next = settings.phases.find(p => !progress.completedPhases.includes(p.id) && p.id <= progress.unlockedPhase) || settings.phases.find(p => p.id === progress.unlockedPhase) || settings.phases[0];
      if (next) startPhase(next.id);
    });
    app.querySelector('[data-action="view-map"]')?.addEventListener('click', () => document.getElementById('mapa')?.scrollIntoView({ behavior: 'smooth' }));
  }

  function bindText(selector, text) {
    const el = app.querySelector(selector);
    if (el) el.textContent = text ?? '';
  }

  function renderRankPanel() {
    const rank = settings.ranks[Math.min(progress.rankIndex || 0, settings.ranks.length - 1)] || settings.ranks[0];
    const completedCount = progress.completedPhases.length;
    const total = settings.phases.length || 1;
    const percent = Math.round((completedCount / total) * 100);
    const nextPhase = settings.phases.find(p => !progress.completedPhases.includes(p.id));
    const nextRank = nextPhase ? settings.ranks[nextPhase.rewardRankIndex] : null;

    const rankIcon = app.querySelector('[data-rank-icon]');
    if (rankIcon) rankIcon.innerHTML = turtleBadgeSvg(rankStage(rank, progress.rankIndex || 0), 'rank');
    app.querySelector('[data-rank-name]').textContent = rank.name || 'Patente inicial';
    app.querySelector('[data-rank-description]').textContent = rank.description || '';
    app.querySelector('[data-progress-text]').textContent = `${percent}%`;
    app.querySelector('[data-progress-caption]').textContent = nextRank
      ? `${completedCount} de ${total} ilhas concluídas · próxima patente: ${nextRank.name}`
      : `${completedCount} de ${total} ilhas concluídas · travessia completa`;
    const circle = app.querySelector('[data-progress-circle]');
    if (circle) circle.style.strokeDashoffset = String(314 - (314 * percent / 100));
  }

  function renderMap() {
    const map = app.querySelector('[data-island-map]');
    const story = app.querySelector('[data-map-story]');
    if (story) story.textContent = 'Escolha sua próxima ilha. A cada tentativa, a rodada pode vir diferente porque o jogo sorteia perguntas do banco.';
    if (!map) return;
    map.innerHTML = '';
    settings.phases.forEach((phase, index) => {
      const unlocked = phase.id <= progress.unlockedPhase;
      const completed = progress.completedPhases.includes(phase.id);
      const phaseQuestions = getQuestionsForPhase(phase.id);
      const playableCount = getPlayableCount(phase, phaseQuestions.length);
      const rank = settings.ranks[phase.rewardRankIndex] || {};
      const visualStage = rankStage(rank, index + 1);
      const card = document.createElement('article');
      card.className = `island-card ${unlocked ? '' : 'locked'} ${completed ? 'completed' : ''}`;
      card.innerHTML = `
        ${completed ? '<span class="completed-ribbon">CONQUISTADA</span>' : ''}
        <span class="lock-badge">${completed ? '✓' : unlocked ? 'Aberta' : '🔒'}</span>
        <div class="island-art">
          <div class="turtle-medal island-turtle">${turtleBadgeSvg(visualStage, 'island')}</div>
        </div>
        <div class="island-card-body">
          <span class="tiny-label">${escapeHtml(phase.name)}</span>
          <h3>${escapeHtml(phase.title)}</h3>
          <p>${escapeHtml(phase.story)}</p>
          <div class="island-meta">
            <span class="meta-chip">Meta ${phase.minPercent}%</span>
            <span class="meta-chip">${phase.lives} vidas</span>
            <span class="meta-chip">${playableCount || phase.questionLimit || 'todas'} questões na rodada</span>
            <span class="meta-chip">${escapeHtml(phase.difficultyLabel)}</span>
          </div>
          <button class="btn ${unlocked ? 'btn-primary' : 'btn-soft'}" ${unlocked && phaseQuestions.length ? '' : 'disabled'} data-start-phase="${phase.id}">
            ${completed ? 'Refazer ilha' : unlocked ? 'Entrar na ilha' : 'Bloqueada'}
          </button>
          ${unlocked && !phaseQuestions.length ? '<p class="small-muted">Ilha em preparação: ainda não há questões cadastradas.</p>' : ''}
        </div>
      `;
      map.appendChild(card);
    });
    map.querySelectorAll('[data-start-phase]').forEach(btn => btn.addEventListener('click', () => startPhase(Number(btn.dataset.startPhase))));
  }

  function getQuestionsForPhase(phaseId) {
    return questions.filter(q => Number(q.phase) === Number(phaseId) && q.statement && q.options.length >= 2 && q.options.some(op => op.correct));
  }

  function getPlayableCount(phase, poolLength) {
    if (!poolLength) return 0;
    if (!phase.questionLimit || phase.questionLimit <= 0) return poolLength;
    return Math.min(phase.questionLimit, poolLength);
  }

  function selectQuestionsForAttempt(phase, pool) {
    const shuffled = phase.shuffle ? shuffleArray(pool) : [...pool];
    const limit = getPlayableCount(phase, shuffled.length);
    return shuffled.slice(0, limit);
  }

  function startPhase(phaseId) {
    const phase = settings.phases.find(p => p.id === phaseId);
    if (!phase || phase.id > progress.unlockedPhase) return renderHome();
    const pool = getQuestionsForPhase(phase.id);
    if (!pool.length) {
      alert('Esta ilha ainda não possui questões cadastradas.');
      return renderHome();
    }
    const phaseQuestions = selectQuestionsForAttempt(phase, pool);
    currentRun = {
      phase,
      poolSize: pool.length,
      questions: phaseQuestions,
      index: 0,
      lives: phase.lives,
      score: 0,
      answered: false
    };
    renderQuestion();
  }

  function renderQuestion() {
    const run = currentRun;
    const q = run.questions[run.index];
    const template = document.getElementById('quizTemplate').content.cloneNode(true);
    app.innerHTML = '';
    app.appendChild(template);
    app.querySelector('[data-action="back-home"]')?.addEventListener('click', renderHome);

    app.querySelector('[data-phase-title]').textContent = run.phase.title;
    app.querySelector('[data-phase-story]').textContent = run.phase.story;
    app.querySelector('[data-lives]').textContent = '❤️'.repeat(run.lives) || '0';
    app.querySelector('[data-minpercent]').textContent = `${run.phase.minPercent}%`;
    app.querySelector('[data-score]').textContent = `${run.score}/${run.questions.length}`;
    app.querySelector('[data-question-count]').textContent = `Questão ${run.index + 1} de ${run.questions.length} · sorteada do banco`;
    app.querySelector('[data-quiz-progress]').style.width = `${(run.index / run.questions.length) * 100}%`;
    app.querySelector('[data-question-index]').textContent = `Questão ${run.index + 1}`;
    app.querySelector('[data-question-meta]').textContent = settings.showMetaToStudent
      ? [q.discipline, q.topic, q.difficulty].filter(Boolean).join(' · ')
      : 'Desafio de Natureza';
    app.querySelector('[data-question-statement]').innerHTML = q.statement;

    const imgWrap = app.querySelector('[data-question-image-wrap]');
    const img = app.querySelector('[data-question-image]');
    if (q.image) {
      img.src = q.image;
      imgWrap.classList.add('visible');
    }

    const list = app.querySelector('[data-options-list]');
    q.options.forEach((op, i) => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      button.innerHTML = `<span class="option-letter">${letters[i] || i + 1}</span><span>${op.text}</span>`;
      button.addEventListener('click', () => answerQuestion(i));
      list.appendChild(button);
    });
    typesetMath();
  }

  function answerQuestion(selectedIndex) {
    const run = currentRun;
    if (run.answered) return;
    run.answered = true;
    const q = run.questions[run.index];
    const selected = q.options[selectedIndex];
    const correctIndex = q.options.findIndex(op => op.correct);
    const isCorrect = Boolean(selected?.correct);
    if (isCorrect) run.score += 1;
    else run.lives = Math.max(0, run.lives - 1);

    app.querySelector('[data-lives]').textContent = '❤️'.repeat(run.lives) || '0';
    app.querySelector('[data-score]').textContent = `${run.score}/${run.questions.length}`;
    app.querySelectorAll('.option-btn').forEach((btn, i) => {
      btn.classList.add('disabled');
      if (i === correctIndex) btn.classList.add('correct');
      if (i === selectedIndex && !isCorrect) btn.classList.add('wrong');
    });

    const panel = app.querySelector('[data-feedback-panel]');
    panel.classList.remove('hidden');
    panel.classList.toggle('correct-feedback', isCorrect);
    panel.classList.toggle('wrong-feedback', !isCorrect);
    app.querySelector('[data-feedback-title]').textContent = isCorrect ? 'Boa! Você avançou.' : (run.lives <= 0 ? 'As vidas acabaram nesta rodada.' : 'Armadilha encontrada — ajuste a rota.');
    app.querySelector('[data-feedback-text]').innerHTML = buildFeedbackText(isCorrect, q, selected);
    app.querySelector('[data-feedback-descriptor]').innerHTML = selected?.feedback || (isCorrect ? 'Boa leitura: você identificou o ponto central da situação.' : 'Volte ao conceito-chave e tente perceber por que essa alternativa seduz.');
    const nextButton = app.querySelector('[data-action="next-question"]');
    nextButton.textContent = run.lives <= 0 ? 'Ver resultado' : (run.index >= run.questions.length - 1 ? 'Concluir ilha' : 'Continuar travessia');
    nextButton.addEventListener('click', nextStep);
    typesetMath();
  }

  function buildFeedbackText(isCorrect, q) {
    const explanation = q.explanation || '';
    if (isCorrect) {
      return explanation
        ? `<strong>Mandou bem.</strong> ${explanation}`
        : '<strong>Mandou bem.</strong> Você venceu a armadilha desta questão e manteve a travessia em movimento.';
    }
    return explanation
      ? `<strong>Boa tentativa.</strong> ${explanation}<br><br>Respire, ajuste a estratégia e siga. Errar aqui também faz parte do treino.`
      : '<strong>Boa tentativa.</strong> Essa alternativa tinha uma armadilha. Respire, revise o conceito e siga para a próxima decisão.';
  }

  function nextStep() {
    if (currentRun.lives <= 0 || currentRun.index >= currentRun.questions.length - 1) return finishPhase();
    currentRun.index += 1;
    currentRun.answered = false;
    renderQuestion();
  }

  function finishPhase() {
    const run = currentRun;
    const percent = Math.round((run.score / run.questions.length) * 100);
    const passed = run.lives > 0 && percent >= run.phase.minPercent;
    const previousRank = settings.ranks[progress.rankIndex] || settings.ranks[0];
    const nextRank = settings.ranks[run.phase.rewardRankIndex] || previousRank;

    if (passed) {
      if (!progress.completedPhases.includes(run.phase.id)) progress.completedPhases.push(run.phase.id);
      progress.unlockedPhase = Math.max(progress.unlockedPhase, run.phase.id + 1);
      progress.rankIndex = Math.max(progress.rankIndex, run.phase.rewardRankIndex || 0);
      progress.phaseScores[run.phase.id] = { score: run.score, total: run.questions.length, percent, date: new Date().toISOString(), poolSize: run.poolSize };
      saveProgress();
    }
    renderResult({ passed, percent, previousRank, nextRank, run });
  }

  function renderResult({ passed, percent, previousRank, nextRank, run }) {
    const template = document.getElementById('resultTemplate').content.cloneNode(true);
    app.innerHTML = '';
    app.appendChild(template);
    const resultIcon = app.querySelector('[data-result-icon]');
    if (resultIcon) resultIcon.innerHTML = turtleBadgeSvg(passed ? rankStage(nextRank, run.phase.rewardRankIndex) : rankStage(previousRank, progress.rankIndex || 0), 'result');
    app.querySelector('[data-result-kicker]').textContent = passed ? 'Ilha conquistada' : 'Travessia em treinamento';
    app.querySelector('[data-result-title]').textContent = passed ? 'Você venceu esta ilha!' : 'Ainda não foi dessa vez.';
    app.querySelector('[data-result-message]').textContent = passed
      ? buildVictoryMessage(run.phase, previousRank, nextRank)
      : `Ainda não foi dessa vez. Você fez ${percent}% e precisava de ${run.phase.minPercent}%. Isso não é fim da jornada: é ajuste de rota. Respire, tente novamente e lembre que uma nova rodada será sorteada do banco desta ilha.`;
    app.querySelector('[data-result-score]').textContent = `${run.score}/${run.questions.length}`;
    app.querySelector('[data-result-percent]').textContent = `${percent}%`;
    app.querySelector('[data-result-target]').textContent = `${run.phase.minPercent}%`;
    app.querySelector('[data-rank-unlock]').innerHTML = passed
      ? `<span class="tiny-label">Nova patente desbloqueada</span><br><strong>${escapeHtml(previousRank.name)} → ${escapeHtml(nextRank.name)}</strong><p>${escapeHtml(nextRank.description || '')}</p>`
      : `<strong>Patente ainda bloqueada:</strong> vença esta ilha para conquistar ${escapeHtml(nextRank.name || 'a próxima patente')}. Você pode tentar novamente quantas vezes precisar: cada tentativa também é treino.`;

    const mainButton = app.querySelector('[data-action="result-main"]');
    mainButton.textContent = passed ? 'Seguir para a próxima ilha' : 'Tentar uma nova rodada';
    mainButton.addEventListener('click', () => {
      if (passed) {
        const nextPhase = settings.phases.find(p => p.id === run.phase.id + 1);
        nextPhase ? startPhase(nextPhase.id) : renderHome();
      } else {
        startPhase(run.phase.id);
      }
    });
    app.querySelector('[data-action="back-home"]')?.addEventListener('click', renderHome);
  }

  function shuffleArray(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[char]));
  }

  function typesetMath() {
    if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise().catch(() => {});
  }
})();
