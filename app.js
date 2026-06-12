(function(){
  const app = document.getElementById('app');
  const resetBtn = document.getElementById('resetProgressBtn');
  const fileInput = document.getElementById('bankFileInput');
  const STORAGE_KEY = 'prenat_ilhas_progress_v2';
  const CUSTOM_BANK_KEY = 'prenat_ilhas_custom_bank_v2';

  let bank = null;
  let progress = loadProgress();
  let state = {
    phaseIndex: null,
    questionIndex: 0,
    score: 0,
    lives: 0,
    answered: false,
    selectedIndex: null
  };

  const letters = ['A','B','C','D','E'];
  const DEFAULT_RANKS = [
    {title:'Ovo da Travessia', badge:'🥚', message:'Todo mestre começa como um ovo: pequeno, protegido e pronto para romper a casca.'},
    {title:'Filhote do Casco', badge:'🐣', message:'Você saiu do ovo e começou a caminhar pela trilha.'},
    {title:'Explorador das Marés', badge:'🌊', message:'Você interpreta melhor os fenômenos do cotidiano.'},
    {title:'Guardião da Energia', badge:'⚡', message:'Você domina melhor transformações e conservação.'},
    {title:'Navegador da Vida', badge:'🌱', message:'Você navega por saúde, ambiente e seres vivos.'},
    {title:'Mestre da Evolução', badge:'🧬', message:'Você encara questões médias e interdisciplinares.'},
    {title:'Grande Mestre da Natureza', badge:'🏆', message:'Você venceu o Boss Final da trilha.'}
  ];

  init();

  async function init(){
    renderLoading();
    resetBtn.addEventListener('click', resetProgress);
    fileInput.addEventListener('change', handleLocalBankUpload);
    bank = await loadBank();
    normalizeBank(bank);
    ensureProgressShape();
    renderHome();
  }

  function renderLoading(){
    const tpl = document.getElementById('loadingTemplate');
    app.innerHTML = '';
    app.appendChild(tpl.content.cloneNode(true));
  }

  async function loadBank(){
    const custom = localStorage.getItem(CUSTOM_BANK_KEY);
    if(custom){
      try { return JSON.parse(custom); } catch(e){ localStorage.removeItem(CUSTOM_BANK_KEY); }
    }
    try{
      const response = await fetch('questions.json', {cache:'no-store'});
      if(!response.ok) throw new Error('Banco não encontrado');
      return await response.json();
    }catch(err){
      return JSON.parse(JSON.stringify(window.PRENAT_DEFAULT_BANK || fallbackBank()));
    }
  }

  function fallbackBank(){
    return {meta:{title:'Missão Ilhas da Natureza'},phases:[]};
  }

  function normalizeBank(input){
    input.meta = input.meta || {title:'Missão Ilhas da Natureza'};
    input.meta.ranks = Array.isArray(input.meta.ranks) && input.meta.ranks.length ? input.meta.ranks : DEFAULT_RANKS;
    input.meta.initialRank = input.meta.initialRank || input.meta.ranks[0] || DEFAULT_RANKS[0];
    input.phases = Array.isArray(input.phases) ? input.phases : [];
    input.phases.forEach((phase, index) => {
      phase.id = phase.id || `fase-${index+1}`;
      phase.title = phase.title || `Fase ${index+1}`;
      phase.subtitle = phase.subtitle || 'desafio da trilha';
      phase.icon = phase.icon || '🏝️';
      phase.lives = Number(phase.lives || 3);
      phase.minScore = Number(phase.minScore || 70);
      phase.story = phase.story || '';
      const defaultReward = input.meta.ranks[index + 1] || input.meta.ranks[input.meta.ranks.length - 1] || DEFAULT_RANKS[Math.min(index + 1, DEFAULT_RANKS.length - 1)];
      phase.reward = phase.reward || {};
      phase.reward.title = phase.reward.title || defaultReward.title || `Conquista da fase ${index+1}`;
      phase.reward.badge = phase.reward.badge || defaultReward.badge || '🏅';
      phase.reward.message = phase.reward.message || defaultReward.message || 'Você conquistou uma nova etapa da trilha.';
      phase.questions = Array.isArray(phase.questions) ? phase.questions : [];
      phase.questions.forEach((q, qIndex) => {
        q.id = q.id || `${phase.id}-q${qIndex+1}`;
        q.options = Array.isArray(q.options) ? q.options.slice(0,5) : [];
        q.correctIndex = Number(q.correctIndex || 0);
        q.descriptors = Array.isArray(q.descriptors) ? q.descriptors : [];
      });
    });
  }

  function loadProgress(){
    try{
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {completed:{}, unlocked:{}};
    }catch(e){
      return {completed:{}, unlocked:{}};
    }
  }

  function saveProgress(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function ensureProgressShape(){
    progress.completed = progress.completed || {};
    progress.unlocked = progress.unlocked || {};
    if(bank.phases[0]) progress.unlocked[bank.phases[0].id] = true;
    bank.phases.forEach((phase, index) => {
      if(index === 0) progress.unlocked[phase.id] = true;
      if(index > 0 && bank.phases[index-1] && progress.completed[bank.phases[index-1].id]){
        progress.unlocked[phase.id] = true;
      }
    });
    saveProgress();
  }

  function resetProgress(){
    if(!confirm('Deseja reiniciar o progresso deste navegador?')) return;
    localStorage.removeItem(STORAGE_KEY);
    progress = loadProgress();
    ensureProgressShape();
    renderHome();
  }

  function completedCount(){
    return bank.phases.filter(p => progress.completed[p.id]).length;
  }

  function rankForCompleted(count){
    const ranks = bank.meta?.ranks || DEFAULT_RANKS;
    const safeIndex = Math.max(0, Math.min(Number(count || 0), ranks.length - 1));
    return ranks[safeIndex] || DEFAULT_RANKS[0];
  }

  function rewardForPhase(index){
    const phase = bank.phases[index] || {};
    return phase.reward || rankForCompleted(index + 1);
  }

  function renderHome(){
    const total = bank.phases.length || 1;
    const completed = completedCount();
    const percent = Math.round((completed / total) * 100);
    const nextPhase = bank.phases.find(p => progress.unlocked[p.id] && !progress.completed[p.id]) || bank.phases[bank.phases.length-1];
    const currentRank = rankForCompleted(completed);
    const nextRank = rankForCompleted(Math.min(completed + 1, total));

    app.innerHTML = `
      <section class="hero">
        <div class="hero-card">
          <p class="eyebrow">trilha gamificada</p>
          <h1>Ilhas da Natureza</h1>
          <p>Avance pelo arquipélago PRENAT+: vença uma ilha, desbloqueie a próxima e chegue ao Boss Final sem perder todas as vidas.</p>
          <div class="hero-actions">
            <button class="primary-btn" id="continueBtn" type="button">Continuar missão</button>
            <button class="secondary-btn" id="loadBankBtn" type="button">Carregar banco JSON local</button>
          </div>
        </div>
        <aside class="status-card">
          <div class="mascot-badge">${escapeHtml(currentRank.badge || '🐢')}</div>
          <div class="rank-box">
            <span class="rank-label">patente atual</span>
            <strong>${escapeHtml(currentRank.title || 'Ovo da Travessia')}</strong>
            <small>${escapeHtml(currentRank.message || '')}</small>
          </div>
          <div class="progress-ring" style="--progress:${percent}%"><span>${percent}%</span></div>
          <small>${completed} de ${total} ilhas concluídas · próxima patente: ${escapeHtml(nextRank.title || 'conquista final')}</small>
        </aside>
      </section>

      <section class="phase-map">
        <div class="map-header">
          <div>
            <h2>Mapa do arquipélago</h2>
            <p>Cada ilha é uma fase. As ilhas com cadeado só abrem após vencer a anterior.</p>
          </div>
          <span class="pill">${bank.meta?.title || 'PRENAT+'}</span>
        </div>
        <div class="story-strip">${escapeHtml(nextPhase?.story || 'Escolha uma ilha desbloqueada para começar.')}</div>
        <div class="island-grid">
          ${bank.phases.map((phase, index) => islandCard(phase, index)).join('')}
        </div>
      </section>
    `;

    document.getElementById('continueBtn').addEventListener('click', () => {
      const idx = Math.max(0, bank.phases.findIndex(p => p.id === nextPhase?.id));
      startPhase(idx);
    });
    document.getElementById('loadBankBtn').addEventListener('click', () => fileInput.click());
    app.querySelectorAll('[data-start-phase]').forEach(btn => {
      btn.addEventListener('click', () => startPhase(Number(btn.dataset.startPhase)));
    });
    typeset();
  }

  function islandCard(phase, index){
    const unlocked = !!progress.unlocked[phase.id];
    const completed = !!progress.completed[phase.id];
    const status = completed ? 'concluída' : unlocked ? 'liberada' : 'bloqueada';
    const statusClass = completed ? 'completed' : unlocked ? '' : 'locked';
    const questionCount = phase.questions.length;
    return `
      <article class="island-card ${unlocked ? 'unlocked' : 'locked'}">
        <div class="island-top">
          <div class="island-icon" aria-hidden="true">${escapeHtml(phase.icon || '🏝️')}</div>
          <span class="island-status ${statusClass}">${completed ? '✓ ' : unlocked ? '• ' : '🔒 '}${status}</span>
        </div>
        <div class="island-content">
          <h3>${index+1}. ${escapeHtml(phase.title)}</h3>
          <p>${escapeHtml(phase.subtitle || '')}</p>
          <div class="island-meta">
            <span class="pill">${phase.lives} vidas</span>
            <span class="pill">${phase.minScore}% para passar</span>
            <span class="pill">${questionCount} questões</span>
            <span class="pill reward-pill">${escapeHtml(phase.reward?.badge || '🏅')} ${escapeHtml(phase.reward?.title || 'Conquista')}</span>
          </div>
        </div>
        <button class="${unlocked ? 'primary-btn' : 'secondary-btn'}" type="button" ${unlocked ? `data-start-phase="${index}"` : 'disabled'}>
          ${completed ? 'Refazer ilha' : unlocked ? 'Entrar na ilha' : 'Bloqueada'}
        </button>
      </article>
    `;
  }

  function startPhase(index){
    const phase = bank.phases[index];
    if(!phase || !progress.unlocked[phase.id]) return;
    if(!phase.questions.length){
      renderNoQuestions(phase, index);
      return;
    }
    state = {
      phaseIndex:index,
      questionIndex:0,
      score:0,
      lives:Number(phase.lives || 3),
      answered:false,
      selectedIndex:null
    };
    renderQuestion();
  }

  function renderNoQuestions(phase, index){
    const reward = phase.reward || rewardForPhase(index);
    app.innerHTML = `
      <section class="result-card">
        <div class="score-badge">${escapeHtml(phase.icon || '🏝️')}</div>
        <p class="eyebrow">ilha em construção</p>
        <h1>${escapeHtml(phase.title)}</h1>
        <p>Esta ilha ainda não tem questões cadastradas. Abra a Área do Professor, cadastre as questões e baixe o novo <strong>questions.json</strong>.</p>
        <div class="reward-card locked-reward">
          <span class="reward-emoji">${escapeHtml(reward.badge || '🏅')}</span>
          <div>
            <span class="rank-label">recompensa planejada</span>
            <strong>${escapeHtml(reward.title || 'Nova conquista')}</strong>
            <p>${escapeHtml(reward.message || 'Mensagem exibida quando o aluno vencer esta ilha.')}</p>
          </div>
        </div>
        <div class="result-actions">
          <a class="primary-btn" href="editor.html">Abrir editor</a>
          <button class="secondary-btn" id="backMapBtn" type="button">Voltar ao mapa</button>
        </div>
      </section>
    `;
    document.getElementById('backMapBtn').addEventListener('click', renderHome);
  }

  function renderQuestion(){
    const phase = bank.phases[state.phaseIndex];
    const q = phase.questions[state.questionIndex];
    const total = phase.questions.length;
    const progressWidth = ((state.questionIndex) / total) * 100;

    app.innerHTML = `
      <section class="quiz-card">
        <div class="quiz-top">
          <div>
            <p class="eyebrow">${escapeHtml(phase.title)}</p>
            <h1>Questão ${state.questionIndex + 1} de ${total}</h1>
            <p class="quiz-sub">Meta da ilha: ${phase.minScore}% ou mais, mantendo pelo menos 1 vida. Recompensa: ${escapeHtml(phase.reward?.badge || '🏅')} ${escapeHtml(phase.reward?.title || 'nova patente')}.</p>
          </div>
          <div class="lives" title="vidas restantes">${renderLives(state.lives, phase.lives)}</div>
        </div>
        <div class="quiz-progress"><span style="width:${progressWidth}%"></span></div>
        <div class="question-meta">
          <span class="pill">${escapeHtml(q.discipline || 'Natureza')}</span>
          <span class="pill">${escapeHtml(q.topic || 'Tema')}</span>
          <span class="pill">Pontuação: ${state.score}/${state.questionIndex}</span>
        </div>
        <div class="question-text">${sanitizeRich(q.text || '')}</div>
        ${q.image ? `<img class="question-image" src="${escapeAttr(q.image)}" alt="Imagem da questão" loading="lazy">` : ''}
        <div class="options">
          ${(q.options || []).map((opt, i) => `
            <button class="option-btn" type="button" data-option="${i}">
              <span class="option-letter">${letters[i] || i+1}</span>
              <span>${sanitizeRich(opt)}</span>
            </button>
          `).join('')}
        </div>
        <div id="feedbackSlot"></div>
        <div class="quiz-footer">
          <button class="secondary-btn" id="quitBtn" type="button">Voltar ao mapa</button>
          <button class="primary-btn" id="nextBtn" type="button" disabled>Próxima</button>
        </div>
      </section>
    `;

    document.getElementById('quitBtn').addEventListener('click', renderHome);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    app.querySelectorAll('[data-option]').forEach(btn => {
      btn.addEventListener('click', () => answerQuestion(Number(btn.dataset.option)));
    });
    typeset();
  }

  function answerQuestion(selectedIndex){
    if(state.answered) return;
    const phase = bank.phases[state.phaseIndex];
    const q = phase.questions[state.questionIndex];
    const correct = Number(q.correctIndex) === selectedIndex;
    state.answered = true;
    state.selectedIndex = selectedIndex;
    if(correct){
      state.score += 1;
    }else{
      state.lives -= 1;
    }

    app.querySelectorAll('[data-option]').forEach(btn => {
      const idx = Number(btn.dataset.option);
      btn.disabled = true;
      if(idx === Number(q.correctIndex)) btn.classList.add('correct');
      if(idx === selectedIndex && !correct) btn.classList.add('wrong');
    });

    const feedback = document.getElementById('feedbackSlot');
    feedback.innerHTML = `
      <div class="feedback">
        <h3>${correct ? 'Resposta correta!' : 'Resposta incorreta'}</h3>
        <p><strong>Gabarito: ${letters[q.correctIndex] || q.correctIndex + 1}.</strong> ${sanitizeRich(q.explanation || 'Sem comentário cadastrado.')}</p>
        ${renderDescriptors(q)}
      </div>
    `;
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.disabled = false;
    nextBtn.textContent = state.lives <= 0 ? 'Ver resultado' : (state.questionIndex + 1 >= phase.questions.length ? 'Finalizar ilha' : 'Próxima');
    typeset();
  }

  function renderDescriptors(q){
    if(!q.descriptors || !q.descriptors.length) return '';
    return `
      <div class="descriptor-list">
        ${q.descriptors.map((d, i) => `<div class="descriptor"><strong>${letters[i] || i+1})</strong> ${sanitizeRich(d)}</div>`).join('')}
      </div>
    `;
  }

  function nextQuestion(){
    const phase = bank.phases[state.phaseIndex];
    if(state.lives <= 0 || state.questionIndex + 1 >= phase.questions.length){
      renderResult();
      return;
    }
    state.questionIndex += 1;
    state.answered = false;
    state.selectedIndex = null;
    renderQuestion();
  }

  function renderResult(){
    const phase = bank.phases[state.phaseIndex];
    const total = phase.questions.length || 1;
    const percent = Math.round((state.score / total) * 100);
    const passed = percent >= Number(phase.minScore || 70) && state.lives > 0;
    if(passed){
      progress.completed[phase.id] = true;
      const nextPhase = bank.phases[state.phaseIndex + 1];
      if(nextPhase) progress.unlocked[nextPhase.id] = true;
      saveProgress();
    }
    const previousRank = rankForCompleted(Math.max(0, state.phaseIndex));
    const reward = rewardForPhase(state.phaseIndex);
    const finalVictory = passed && state.phaseIndex + 1 >= bank.phases.length;
    app.innerHTML = `
      <section class="result-card ${passed ? 'victory' : 'defeat'}">
        <div class="score-badge">${passed ? escapeHtml(reward.badge || '🏅') : percent + '%'}</div>
        <p class="eyebrow">${escapeHtml(phase.title)}</p>
        <h1>${passed ? (finalVictory ? 'Travessia concluída!' : 'Ilha conquistada!') : state.lives <= 0 ? 'Game over na ilha' : 'Quase lá!'}</h1>
        <p>${passed ? `Você fez ${state.score} de ${total} e venceu a ilha. A próxima etapa foi desbloqueada.` : `Você fez ${state.score} de ${total}. Para passar nesta ilha, precisava de pelo menos ${phase.minScore}% e não poderia perder todas as vidas.`}</p>
        ${passed ? `
          <div class="reward-card">
            <span class="reward-emoji">${escapeHtml(reward.badge || '🏅')}</span>
            <div>
              <span class="rank-label">nova patente desbloqueada</span>
              <strong>${escapeHtml(reward.title || 'Nova conquista')}</strong>
              <p>${escapeHtml(reward.message || 'Você avançou na trilha PRENAT+.')}</p>
              <small>Antes: ${escapeHtml(previousRank.title || 'Ovo da Travessia')} → Agora: ${escapeHtml(reward.title || 'Nova conquista')}</small>
            </div>
          </div>
        ` : `
          <div class="reward-card locked-reward">
            <span class="reward-emoji">🔒</span>
            <div>
              <span class="rank-label">patente ainda bloqueada</span>
              <strong>${escapeHtml(reward.title || 'Nova conquista')}</strong>
              <p>Refaça a ilha, proteja suas vidas e alcance a meta para liberar esta conquista.</p>
            </div>
          </div>
        `}
        <p><strong>Vidas restantes:</strong> ${renderLives(state.lives, phase.lives)}</p>
        <div class="result-actions">
          ${passed && bank.phases[state.phaseIndex + 1] ? '<button class="primary-btn" id="nextPhaseBtn" type="button">Ir para próxima ilha</button>' : ''}
          ${finalVictory ? '<button class="primary-btn" id="mapBtnVictory" type="button">Ver mapa concluído</button>' : ''}
          <button class="secondary-btn" id="retryBtn" type="button">Refazer esta ilha</button>
          <button class="secondary-btn" id="mapBtn" type="button">Voltar ao mapa</button>
        </div>
      </section>
    `;
    const nextPhaseBtn = document.getElementById('nextPhaseBtn');
    if(nextPhaseBtn) nextPhaseBtn.addEventListener('click', () => startPhase(state.phaseIndex + 1));
    const mapBtnVictory = document.getElementById('mapBtnVictory');
    if(mapBtnVictory) mapBtnVictory.addEventListener('click', renderHome);
    document.getElementById('retryBtn').addEventListener('click', () => startPhase(state.phaseIndex));
    document.getElementById('mapBtn').addEventListener('click', renderHome);
    typeset();
  }

  function renderLives(current, total){
    return Array.from({length: Number(total || 3)}, (_, i) => i < current ? '❤️' : '🖤').join(' ');
  }

  function handleLocalBankUpload(event){
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const parsed = JSON.parse(reader.result);
        normalizeBank(parsed);
        localStorage.setItem(CUSTOM_BANK_KEY, JSON.stringify(parsed));
        bank = parsed;
        progress = loadProgress();
        ensureProgressShape();
        renderHome();
        toast('Banco carregado neste navegador.', 'success');
      }catch(err){
        toast('Não consegui ler esse JSON. Verifique se exportou pelo editor.', 'error');
      }finally{
        fileInput.value = '';
      }
    };
    reader.readAsText(file);
  }

  function toast(message, type=''){
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  function typeset(){
    if(window.MathJax && window.MathJax.typesetPromise){
      window.MathJax.typesetPromise([app]).catch(() => {});
    }
  }

  function sanitizeRich(value){
    const raw = String(value ?? '');
    const allowed = ['sub','sup','strong','b','em','i','br','u'];
    const template = document.createElement('template');
    template.innerHTML = raw;
    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
    const toRemove = [];
    while(walker.nextNode()){
      const node = walker.currentNode;
      const tag = node.tagName.toLowerCase();
      if(!allowed.includes(tag)){
        toRemove.push(node);
      }else{
        [...node.attributes].forEach(attr => node.removeAttribute(attr.name));
      }
    }
    toRemove.forEach(node => node.replaceWith(document.createTextNode(node.textContent || '')));
    return template.innerHTML;
  }

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }
  function escapeAttr(value){
    return escapeHtml(value).replace(/`/g, '&#96;');
  }
})();
