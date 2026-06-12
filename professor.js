(() => {
  const letters = ['A', 'B', 'C', 'D', 'E'];
  let settings = null;
  let questions = [];

  const DEFAULT_SETTINGS = {
    slug: 'missao-ilhas-natureza-prenat-v2',
    brand: 'PRENAT+',
    missionName: 'Missão Ilhas da Natureza',
    missionKicker: 'CAMPO DE TREINO PRENAT+',
    subtitle: 'Uma jornada RPG com questões misturadas de Biologia, Física e Química.',
    intro: 'Atravesse o arquipélago, conquiste patentes e prove que domina Ciências da Natureza sem perder todas as vidas.',
    studentThemeNote: 'As questões misturam Biologia, Física e Química. As etiquetas são internas do professor.',
    showMetaToStudent: false,
    logo: 'logo-prenat.png',
    ranks: [
      { name:'Ovo da Travessia', icon:'🥚', description:'Começo da jornada. A casca ainda protege o aluno antes da primeira ilha.' },
      { name:'Filhote do Casco', icon:'🐣', description:'A primeira conquista. O aluno rompeu a casca e entrou no arquipélago.' },
      { name:'Explorador das Marés', icon:'🌊', description:'Já atravessa conceitos básicos e começa a reconhecer padrões de prova.' },
      { name:'Guardião da Energia', icon:'⚡', description:'Aprendeu a resistir às questões médias e interpretar situações científicas.' },
      { name:'Navegador da Vida', icon:'🌱', description:'Consegue ligar fenômenos, dados, gráficos e contextos do cotidiano.' },
      { name:'Mestre da Evolução', icon:'🧬', description:'Domina questões mais densas, interdisciplinares e com distratores fortes.' },
      { name:'Grande Mestre da Natureza', icon:'🏆', description:'Venceu o Boss Final e concluiu a travessia PRENAT+.' }
    ],
    phases: [
      { id:1, name:'Ilha 1', title:'Rompendo a Casca', story:'A tartaruga PRENAT+ chegou à primeira ilha. O desafio é vencer questões básicas misturadas de Natureza.', minPercent:60, lives:3, questionLimit:10, shuffle:true, rewardRankIndex:1, difficultyLabel:'Aquecimento' },
      { id:2, name:'Ilha 2', title:'Caminho do Filhote', story:'O aluno avança para questões um pouco mais interpretativas, ainda com base conceitual forte.', minPercent:65, lives:3, questionLimit:20, shuffle:true, rewardRankIndex:2, difficultyLabel:'Base + interpretação' },
      { id:3, name:'Ilha 3', title:'Mar das Estratégias', story:'Agora o jogo exige leitura cuidadosa, comparação de dados e identificação de armadilhas.', minPercent:70, lives:3, questionLimit:30, shuffle:true, rewardRankIndex:3, difficultyLabel:'Intermediário' },
      { id:4, name:'Ilha 4', title:'Trilha da Resistência', story:'A travessia fica mais intensa: textos maiores, gráficos e situações com mais de um conceito envolvido.', minPercent:75, lives:3, questionLimit:45, shuffle:true, rewardRankIndex:4, difficultyLabel:'Médio-forte' },
      { id:5, name:'Ilha 5', title:'Templo da Evolução', story:'O aluno enfrenta questões mais profundas, com maior cobrança de raciocínio e eliminação de distratores.', minPercent:80, lives:4, questionLimit:60, shuffle:true, rewardRankIndex:5, difficultyLabel:'Avançado' },
      { id:6, name:'Boss Final', title:'Grande Batalha da Natureza', story:'Última travessia. Questões hard, integradas e com cara de prova. Só os resistentes chegam ao final.', minPercent:85, lives:4, questionLimit:90, shuffle:true, rewardRankIndex:6, difficultyLabel:'Hard, hard, hard' }
    ]
  };

  init();

  async function init() {
    settings = await fetchJson('settings.json', DEFAULT_SETTINGS);
    questions = await fetchJson('questions.json', []);
    normalize();
    setupLinks();
    setupTabs();
    populateConfigForm();
    renderPhaseEditors();
    renderQuestionForm();
    renderQuestionBank();
    setupButtons();
  }

  async function fetchJson(url, fallback) {
    try {
      const response = await fetch(`${url}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(url);
      return await response.json();
    } catch {
      return structuredClone ? structuredClone(fallback) : JSON.parse(JSON.stringify(fallback));
    }
  }

  function normalize() {
    settings = { ...DEFAULT_SETTINGS, ...settings };
    settings.ranks = Array.isArray(settings.ranks) && settings.ranks.length ? settings.ranks : DEFAULT_SETTINGS.ranks;
    settings.phases = Array.isArray(settings.phases) && settings.phases.length ? settings.phases : DEFAULT_SETTINGS.phases;
    questions = Array.isArray(questions) ? questions.map(normalizeQuestion) : [];
  }

  function normalizeQuestion(q) {
    const options = Array.isArray(q.options) ? q.options.map((op, i) => typeof op === 'string'
      ? { text: op, correct: Number(q.correctIndex) === i, feedback: '' }
      : { text: op.text || '', correct: Boolean(op.correct), feedback: op.feedback || '' }) : [];
    if (!options.some(o => o.correct) && Number.isInteger(q.correctIndex) && options[q.correctIndex]) options[q.correctIndex].correct = true;
    return {
      id: q.id || makeId(),
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

  function setupLinks() {
    const base = window.location.href.replace(/professor\.html.*$/, '').replace(/index\.html.*$/, '');
    setValue('studentLink', `${base || './'}index.html`);
    setValue('teacherLink', `${base || './'}professor.html`);
    const top = document.getElementById('studentLinkTop');
    if (top) top.href = `${base || './'}index.html`;
  }

  function setupTabs() {
    document.querySelectorAll('[data-tab-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tabBtn;
        document.querySelectorAll('[data-tab]').forEach(panel => panel.classList.toggle('hidden', panel.dataset.tab !== tab));
        document.querySelectorAll('[data-tab-btn]').forEach(b => b.className = 'btn btn-soft');
        btn.className = 'btn btn-primary';
      });
    });
  }

  function setupButtons() {
    document.getElementById('saveConfigLocal')?.addEventListener('click', () => {
      collectConfigFromForm();
      localStorage.setItem('prenat_teacher_settings', JSON.stringify(settings));
      alert('Configuração salva no navegador. Para atualizar o jogo publicado, baixe o settings.json e envie no GitHub.');
      renderQuestionForm();
      renderQuestionBank();
    });
    document.getElementById('resetConfigDefault')?.addEventListener('click', () => {
      if (!confirm('Restaurar a configuração padrão PRENAT+?')) return;
      settings = structuredClone ? structuredClone(DEFAULT_SETTINGS) : JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      populateConfigForm();
      renderPhaseEditors();
      renderQuestionForm();
    });
    document.getElementById('saveQuestionBtn')?.addEventListener('click', saveQuestionFromForm);
    document.getElementById('clearQuestionBtn')?.addEventListener('click', clearQuestionForm);
    document.getElementById('downloadSettings')?.addEventListener('click', () => { collectConfigFromForm(); downloadJson('settings.json', settings); });
    document.getElementById('downloadQuestions')?.addEventListener('click', () => downloadJson('questions.json', questions));
    document.getElementById('importSettings')?.addEventListener('change', e => importJsonFile(e, data => {
      settings = { ...DEFAULT_SETTINGS, ...data };
      normalize();
      populateConfigForm();
      renderPhaseEditors();
      renderQuestionForm();
      alert('settings.json importado.');
    }));
    document.getElementById('importQuestions')?.addEventListener('change', e => importJsonFile(e, data => {
      questions = Array.isArray(data) ? data.map(normalizeQuestion) : [];
      renderQuestionBank();
      alert('questions.json importado.');
    }));
  }

  function populateConfigForm() {
    setValue('brandInput', settings.brand);
    setValue('missionNameInput', settings.missionName);
    setValue('missionKickerInput', settings.missionKicker);
    setValue('logoInput', settings.logo);
    setValue('subtitleInput', settings.subtitle);
    setValue('introInput', settings.intro);
    setValue('studentThemeNoteInput', settings.studentThemeNote);
    setValue('showMetaInput', String(Boolean(settings.showMetaToStudent)));
  }

  function collectConfigFromForm() {
    settings.brand = getValue('brandInput');
    settings.missionName = getValue('missionNameInput');
    settings.missionKicker = getValue('missionKickerInput');
    settings.logo = getValue('logoInput') || 'logo-prenat.png';
    settings.subtitle = getValue('subtitleInput');
    settings.intro = getValue('introInput');
    settings.studentThemeNote = getValue('studentThemeNoteInput');
    settings.showMetaToStudent = getValue('showMetaInput') === 'true';
    settings.phases = settings.phases.map(phase => ({
      ...phase,
      name: getValue(`phase_${phase.id}_name`),
      title: getValue(`phase_${phase.id}_title`),
      story: getValue(`phase_${phase.id}_story`),
      minPercent: Number(getValue(`phase_${phase.id}_min`) || 60),
      lives: Number(getValue(`phase_${phase.id}_lives`) || 3),
      questionLimit: Number(getValue(`phase_${phase.id}_limit`) || 0),
      shuffle: getValue(`phase_${phase.id}_shuffle`) === 'true',
      rewardRankIndex: Number(getValue(`phase_${phase.id}_rank`) || phase.rewardRankIndex || 0),
      difficultyLabel: getValue(`phase_${phase.id}_difficulty`)
    }));
  }

  function renderPhaseEditors() {
    const wrap = document.getElementById('phaseEditorList');
    if (!wrap) return;
    wrap.innerHTML = '';
    settings.phases.forEach(phase => {
      const card = document.createElement('article');
      card.className = 'phase-editor-card';
      card.innerHTML = `
        <div class="phase-editor-head"><h3>${escapeHtml(phase.name)} · ${escapeHtml(phase.title)}</h3><span class="badge-pill">${escapeHtml(phase.difficultyLabel)}</span></div>
        <div class="form-grid three" style="margin-top:14px">
          <div class="form-field"><label>Nome curto</label><input id="phase_${phase.id}_name" value="${escapeAttr(phase.name)}"></div>
          <div class="form-field"><label>Título da fase</label><input id="phase_${phase.id}_title" value="${escapeAttr(phase.title)}"></div>
          <div class="form-field"><label>Rótulo de dificuldade</label><input id="phase_${phase.id}_difficulty" value="${escapeAttr(phase.difficultyLabel)}"></div>
          <div class="form-field"><label>Meta (%)</label><input id="phase_${phase.id}_min" type="number" min="0" max="100" value="${phase.minPercent}"></div>
          <div class="form-field"><label>Vidas</label><input id="phase_${phase.id}_lives" type="number" min="1" value="${phase.lives}"></div>
          <div class="form-field"><label>Limite de questões</label><input id="phase_${phase.id}_limit" type="number" min="0" value="${phase.questionLimit}"></div>
          <div class="form-field"><label>Embaralhar questões?</label><select id="phase_${phase.id}_shuffle"><option value="true" ${phase.shuffle ? 'selected' : ''}>Sim</option><option value="false" ${!phase.shuffle ? 'selected' : ''}>Não</option></select></div>
          <div class="form-field"><label>Patente desbloqueada</label><select id="phase_${phase.id}_rank">${settings.ranks.map((rank, idx) => `<option value="${idx}" ${idx === phase.rewardRankIndex ? 'selected' : ''}>${rank.icon} ${escapeHtml(rank.name)}</option>`).join('')}</select></div>
          <div class="form-field full"><label>História da fase</label><textarea id="phase_${phase.id}_story">${escapeHtml(phase.story)}</textarea></div>
        </div>`;
      wrap.appendChild(card);
    });
  }

  function renderQuestionForm() {
    const phaseSelect = document.getElementById('qPhase');
    if (phaseSelect) {
      phaseSelect.innerHTML = settings.phases.map(p => `<option value="${p.id}">${escapeHtml(p.name)} · ${escapeHtml(p.title)}</option>`).join('');
    }
    const options = document.getElementById('optionsEditor');
    if (!options) return;
    options.innerHTML = '';
    letters.forEach((letter, index) => {
      const card = document.createElement('div');
      card.className = 'phase-editor-card';
      card.innerHTML = `
        <div class="phase-editor-head"><h3>Alternativa ${letter}</h3><label><input type="radio" name="correctOption" value="${index}" ${index === 0 ? 'checked' : ''}> Correta</label></div>
        <div class="form-grid" style="margin-top:12px">
          <div class="form-field full"><label>Texto da alternativa ${letter}</label><textarea id="opt_${index}_text"></textarea></div>
          <div class="form-field full"><label>Comentário/distrator da alternativa ${letter}</label><textarea id="opt_${index}_feedback" placeholder="Explique por que essa alternativa está certa ou errada."></textarea></div>
        </div>`;
      options.appendChild(card);
    });
  }

  function saveQuestionFromForm() {
    const statement = getValue('qStatement').trim();
    const options = letters.map((_, i) => ({
      text: getValue(`opt_${i}_text`).trim(),
      feedback: getValue(`opt_${i}_feedback`).trim(),
      correct: Number(document.querySelector('input[name="correctOption"]:checked')?.value || 0) === i
    })).filter(op => op.text);

    if (!statement) return alert('Preencha o enunciado da questão.');
    if (options.length < 2) return alert('Preencha pelo menos duas alternativas. O ideal é usar cinco.');
    if (!options.some(op => op.correct)) options[0].correct = true;

    const editingId = getValue('editingQuestionId');
    const question = {
      id: editingId || makeId(),
      phase: Number(getValue('qPhase') || 1),
      discipline: getValue('qDiscipline'),
      topic: getValue('qTopic'),
      difficulty: getValue('qDifficulty'),
      statement,
      image: getValue('qImage'),
      options,
      explanation: getValue('qExplanation')
    };

    const index = questions.findIndex(q => q.id === editingId);
    if (index >= 0) questions[index] = question;
    else questions.push(question);

    clearQuestionForm();
    renderQuestionBank();
    alert('Questão salva no painel. Para atualizar o site publicado, baixe o questions.json e envie no GitHub.');
  }

  function editQuestion(id) {
    const q = questions.find(item => item.id === id);
    if (!q) return;
    setValue('editingQuestionId', q.id);
    setValue('qPhase', q.phase);
    setValue('qDiscipline', q.discipline);
    setValue('qTopic', q.topic);
    setValue('qDifficulty', q.difficulty);
    setValue('qStatement', q.statement);
    setValue('qImage', q.image);
    setValue('qExplanation', q.explanation);
    letters.forEach((_, i) => {
      const op = q.options[i] || { text:'', feedback:'', correct:false };
      setValue(`opt_${i}_text`, op.text);
      setValue(`opt_${i}_feedback`, op.feedback);
      const radio = document.querySelector(`input[name="correctOption"][value="${i}"]`);
      if (radio) radio.checked = Boolean(op.correct);
    });
    document.querySelector('[data-tab-btn="questoes"]')?.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteQuestion(id) {
    if (!confirm('Excluir esta questão do banco?')) return;
    questions = questions.filter(q => q.id !== id);
    renderQuestionBank();
  }

  function clearQuestionForm() {
    ['editingQuestionId','qDiscipline','qTopic','qDifficulty','qStatement','qImage','qExplanation'].forEach(id => setValue(id, ''));
    setValue('qPhase', settings.phases[0]?.id || 1);
    letters.forEach((_, i) => {
      setValue(`opt_${i}_text`, '');
      setValue(`opt_${i}_feedback`, '');
      const radio = document.querySelector(`input[name="correctOption"][value="${i}"]`);
      if (radio) radio.checked = i === 0;
    });
  }

  function renderQuestionBank() {
    const list = document.getElementById('questionBankList');
    if (!list) return;
    if (!questions.length) {
      list.innerHTML = '<p class="warning-tip">Ainda não há questões cadastradas.</p>';
      return;
    }
    list.innerHTML = '';
    const grouped = [...questions].sort((a,b) => a.phase - b.phase);
    grouped.forEach(q => {
      const phase = settings.phases.find(p => p.id === q.phase);
      const row = document.createElement('article');
      row.className = 'question-row';
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(phase ? `${phase.name} · ${phase.title}` : `Fase ${q.phase}`)}</strong>
          <small>${escapeHtml([q.discipline, q.topic, q.difficulty].filter(Boolean).join(' · ') || 'Sem etiquetas')}</small>
          <p>${escapeHtml(stripHtml(q.statement).slice(0, 180))}${stripHtml(q.statement).length > 180 ? '...' : ''}</p>
        </div>
        <div class="teacher-actions">
          <button class="btn btn-soft small" data-edit="${q.id}">Editar</button>
          <button class="btn btn-soft small danger" data-delete="${q.id}">Excluir</button>
        </div>`;
      list.appendChild(row);
    });
    list.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => editQuestion(btn.dataset.edit)));
    list.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => deleteQuestion(btn.dataset.delete)));
  }

  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importJsonFile(event, callback) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { callback(JSON.parse(reader.result)); }
      catch { alert('Arquivo JSON inválido.'); }
    };
    reader.readAsText(file);
  }

  function makeId() {
    return `q_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  }

  function getValue(id) { return document.getElementById(id)?.value ?? ''; }
  function setValue(id, value) { const el = document.getElementById(id); if (el) el.value = value ?? ''; }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[c])); }
  function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#096;'); }
  function stripHtml(value) { const div = document.createElement('div'); div.innerHTML = value || ''; return div.textContent || div.innerText || ''; }
})();
