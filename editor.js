(function(){
  const STORAGE_KEY = 'prenat_ilhas_editor_bank_v2';
  const CUSTOM_BANK_KEY = 'prenat_ilhas_custom_bank_v2';
  const letters = ['A','B','C','D','E'];
  const DEFAULT_RANKS = [
    {title:'Ovo da Travessia', badge:'🥚', message:'Começo da jornada.'},
    {title:'Filhote do Casco', badge:'🐣', message:'Primeira ilha vencida.'},
    {title:'Explorador das Marés', badge:'🌊', message:'Segunda ilha vencida.'},
    {title:'Guardião da Energia', badge:'⚡', message:'Terceira ilha vencida.'},
    {title:'Navegador da Vida', badge:'🌱', message:'Quarta ilha vencida.'},
    {title:'Mestre da Evolução', badge:'🧬', message:'Quinta ilha vencida.'},
    {title:'Grande Mestre da Natureza', badge:'🏆', message:'Boss Final vencido.'}
  ];

  const els = {
    phaseList: document.getElementById('phaseList'),
    questionList: document.getElementById('questionList'),
    questionCount: document.getElementById('questionCount'),
    selectedPhaseBadge: document.getElementById('selectedPhaseBadge'),
    questionForm: document.getElementById('questionForm'),
    phaseForm: document.getElementById('phaseForm'),
    previewPanel: document.getElementById('previewPanel'),
    formTitle: document.getElementById('formTitle'),
    jsonInput: document.getElementById('jsonInput'),
    csvInput: document.getElementById('csvInput')
  };

  let bank = loadEditorBank();
  let selectedPhaseIndex = 0;
  let editingQuestionIndex = null;

  bindEvents();
  normalizeBank(bank);
  renderAll();

  function loadEditorBank(){
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(CUSTOM_BANK_KEY);
    if(saved){
      try { return JSON.parse(saved); } catch(e){ /* ignore */ }
    }
    return JSON.parse(JSON.stringify(window.PRENAT_DEFAULT_BANK));
  }

  function saveEditorBank(){
    bank.meta = bank.meta || {};
    bank.meta.updatedAt = new Date().toISOString().slice(0,10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bank));
  }

  function normalizeBank(input){
    input.meta = input.meta || {title:'Missão Ilhas da Natureza'};
    input.meta.ranks = Array.isArray(input.meta.ranks) && input.meta.ranks.length ? input.meta.ranks : DEFAULT_RANKS;
    input.meta.initialRank = input.meta.initialRank || input.meta.ranks[0] || DEFAULT_RANKS[0];
    input.phases = Array.isArray(input.phases) ? input.phases : [];
    input.phases.forEach((phase, index) => {
      phase.id = slug(phase.id || phase.title || `fase-${index+1}`);
      phase.title = phase.title || `Fase ${index+1}`;
      phase.subtitle = phase.subtitle || '';
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
      phase.questions.forEach((q, qIndex) => normalizeQuestion(q, phase, qIndex));
    });
    if(!input.phases.length){
      input.phases.push(createBlankPhase(1));
    }
  }

  function normalizeQuestion(q, phase, qIndex){
    q.id = q.id || `${phase.id}-q${qIndex+1}`;
    q.discipline = q.discipline || 'Física';
    q.topic = q.topic || 'Tema';
    q.text = q.text || '';
    q.image = q.image || '';
    q.options = Array.isArray(q.options) ? q.options.slice(0,5) : ['', '', '', '', ''];
    while(q.options.length < 5) q.options.push('');
    q.correctIndex = clamp(Number(q.correctIndex || 0), 0, 4);
    q.explanation = q.explanation || '';
    q.descriptors = Array.isArray(q.descriptors) ? q.descriptors.slice(0,5) : ['', '', '', '', ''];
    while(q.descriptors.length < 5) q.descriptors.push('');
  }

  function bindEvents(){
    document.getElementById('exportJsonBtn').addEventListener('click', exportJson);
    document.getElementById('importJsonBtn').addEventListener('click', () => els.jsonInput.click());
    document.getElementById('importCsvBtn').addEventListener('click', () => els.csvInput.click());
    document.getElementById('downloadCsvTemplateBtn').addEventListener('click', downloadCsvTemplate);
    document.getElementById('clearLocalBtn').addEventListener('click', clearLocal);
    document.getElementById('newPhaseBtn').addEventListener('click', newPhase);
    document.getElementById('resetFormBtn').addEventListener('click', clearQuestionForm);
    document.getElementById('deletePhaseBtn').addEventListener('click', deletePhase);

    els.jsonInput.addEventListener('change', importJson);
    els.csvInput.addEventListener('change', importCsv);
    els.questionForm.addEventListener('submit', saveQuestion);
    els.phaseForm.addEventListener('submit', savePhase);

    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    ['discipline','topic','text','image','opt0','opt1','opt2','opt3','opt4','correctIndex','explanation','desc0','desc1','desc2','desc3','desc4']
      .forEach(id => document.getElementById(id).addEventListener('input', renderPreview));
  }

  function renderAll(){
    if(selectedPhaseIndex >= bank.phases.length) selectedPhaseIndex = Math.max(0, bank.phases.length - 1);
    renderPhaseList();
    renderQuestionList();
    fillPhaseForm();
    updateBadges();
    renderPreview();
  }

  function renderPhaseList(){
    els.phaseList.innerHTML = bank.phases.map((phase, index) => `
      <button class="phase-item ${index === selectedPhaseIndex ? 'active' : ''}" type="button" data-phase-index="${index}">
        <strong>${escapeHtml(phase.icon)} ${escapeHtml(phase.title)}</strong>
        <span>${phase.questions.length} questões · ${phase.lives} vidas · ${phase.minScore}% mínimo · ${escapeHtml(phase.reward?.badge || '🏅')} ${escapeHtml(phase.reward?.title || 'Conquista')}</span>
      </button>
    `).join('');

    els.phaseList.querySelectorAll('[data-phase-index]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedPhaseIndex = Number(btn.dataset.phaseIndex);
        editingQuestionIndex = null;
        clearQuestionForm(false);
        renderAll();
      });
    });
  }

  function renderQuestionList(){
    const phase = currentPhase();
    if(!phase.questions.length){
      els.questionList.innerHTML = '<div class="empty-state">Ainda não há questões nesta ilha. Preencha o formulário e clique em salvar.</div>';
      return;
    }
    els.questionList.innerHTML = phase.questions.map((q, index) => `
      <div class="question-item">
        <strong>${index+1}. ${escapeHtml(q.discipline)} · ${escapeHtml(q.topic)}</strong>
        <span>${truncate(stripHtml(q.text), 120)}</span>
        <div class="form-actions" style="margin-top:10px">
          <button class="tiny-btn" data-edit-question="${index}" type="button">Editar</button>
          <button class="tiny-btn" data-duplicate-question="${index}" type="button">Duplicar</button>
          <button class="tiny-btn" data-delete-question="${index}" type="button">Excluir</button>
        </div>
      </div>
    `).join('');

    els.questionList.querySelectorAll('[data-edit-question]').forEach(btn => {
      btn.addEventListener('click', () => editQuestion(Number(btn.dataset.editQuestion)));
    });
    els.questionList.querySelectorAll('[data-duplicate-question]').forEach(btn => {
      btn.addEventListener('click', () => duplicateQuestion(Number(btn.dataset.duplicateQuestion)));
    });
    els.questionList.querySelectorAll('[data-delete-question]').forEach(btn => {
      btn.addEventListener('click', () => deleteQuestion(Number(btn.dataset.deleteQuestion)));
    });
  }

  function updateBadges(){
    const phase = currentPhase();
    els.questionCount.textContent = `${phase.questions.length} questão${phase.questions.length === 1 ? '' : 'ões'}`;
    els.selectedPhaseBadge.textContent = phase.title;
  }

  function fillPhaseForm(){
    const phase = currentPhase();
    setVal('phaseTitle', phase.title);
    setVal('phaseSubtitle', phase.subtitle);
    setVal('phaseStory', phase.story);
    setVal('phaseLives', phase.lives);
    setVal('phaseMinScore', phase.minScore);
    setVal('phaseIcon', phase.icon);
    setVal('phaseRewardTitle', phase.reward?.title || '');
    setVal('phaseRewardBadge', phase.reward?.badge || '🏅');
    setVal('phaseRewardMessage', phase.reward?.message || '');
  }

  function savePhase(event){
    event.preventDefault();
    const phase = currentPhase();
    phase.title = val('phaseTitle').trim() || phase.title;
    phase.subtitle = val('phaseSubtitle').trim();
    phase.story = val('phaseStory').trim();
    phase.lives = clamp(Number(val('phaseLives') || 3), 1, 10);
    phase.minScore = clamp(Number(val('phaseMinScore') || 70), 0, 100);
    phase.icon = val('phaseIcon').trim() || '🏝️';
    phase.reward = phase.reward || {};
    phase.reward.title = val('phaseRewardTitle').trim() || `Conquista de ${phase.title}`;
    phase.reward.badge = val('phaseRewardBadge').trim() || '🏅';
    phase.reward.message = val('phaseRewardMessage').trim() || 'Você conquistou uma nova etapa da trilha PRENAT+.';
    if(!phase.id || phase.id.startsWith('fase-')) phase.id = slug(phase.title);
    saveEditorBank();
    renderAll();
    toast('Fase salva.', 'success');
  }

  function newPhase(){
    bank.phases.push(createBlankPhase(bank.phases.length + 1));
    selectedPhaseIndex = bank.phases.length - 1;
    editingQuestionIndex = null;
    clearQuestionForm(false);
    saveEditorBank();
    renderAll();
    switchTab('phase');
    toast('Nova fase criada.', 'success');
  }

  function createBlankPhase(number){
    return {
      id: `fase-${number}`,
      title: `Ilha ${number}`,
      subtitle: 'nova etapa da trilha',
      icon: '🏝️',
      lives: 3,
      minScore: 70,
      story: 'Escreva aqui a narrativa desta ilha.',
      reward: {
        title: DEFAULT_RANKS[Math.min(number, DEFAULT_RANKS.length - 1)]?.title || `Conquista da Ilha ${number}`,
        badge: DEFAULT_RANKS[Math.min(number, DEFAULT_RANKS.length - 1)]?.badge || '🏅',
        message: DEFAULT_RANKS[Math.min(number, DEFAULT_RANKS.length - 1)]?.message || 'Você conquistou uma nova etapa da trilha.'
      },
      questions: []
    };
  }

  function deletePhase(){
    if(bank.phases.length <= 1){
      toast('A trilha precisa ter pelo menos uma fase.', 'error');
      return;
    }
    const phase = currentPhase();
    if(!confirm(`Excluir a fase "${phase.title}" e todas as questões dela?`)) return;
    bank.phases.splice(selectedPhaseIndex, 1);
    selectedPhaseIndex = Math.max(0, selectedPhaseIndex - 1);
    editingQuestionIndex = null;
    saveEditorBank();
    renderAll();
    toast('Fase excluída.', 'success');
  }

  function saveQuestion(event){
    event.preventDefault();
    const phase = currentPhase();
    const q = formToQuestion();
    if(!q.text || q.options.some(opt => !opt.trim()) || !q.explanation){
      toast('Preencha enunciado, 5 alternativas e comentário.', 'error');
      return;
    }
    if(editingQuestionIndex !== null){
      phase.questions[editingQuestionIndex] = q;
      toast('Questão atualizada.', 'success');
    }else{
      phase.questions.push(q);
      toast('Questão adicionada à fase.', 'success');
    }
    saveEditorBank();
    editingQuestionIndex = null;
    clearQuestionForm(false);
    renderAll();
    switchTab('question');
  }

  function formToQuestion(){
    const phase = currentPhase();
    const generatedId = `${phase.id}-q${String((phase.questions.length || 0) + 1).padStart(2,'0')}`;
    return {
      id: slug(val('questionId').trim() || generatedId),
      discipline: val('discipline'),
      topic: val('topic').trim(),
      text: val('text').trim(),
      image: val('image').trim(),
      options: [0,1,2,3,4].map(i => val(`opt${i}`).trim()),
      correctIndex: Number(val('correctIndex')),
      explanation: val('explanation').trim(),
      descriptors: [0,1,2,3,4].map(i => val(`desc${i}`).trim())
    };
  }

  function editQuestion(index){
    const q = currentPhase().questions[index];
    editingQuestionIndex = index;
    els.formTitle.textContent = `Editando questão ${index+1}`;
    setVal('questionId', q.id || '');
    setVal('discipline', q.discipline || 'Física');
    setVal('topic', q.topic || '');
    setVal('text', q.text || '');
    setVal('image', q.image || '');
    [0,1,2,3,4].forEach(i => setVal(`opt${i}`, q.options?.[i] || ''));
    setVal('correctIndex', String(q.correctIndex || 0));
    setVal('explanation', q.explanation || '');
    [0,1,2,3,4].forEach(i => setVal(`desc${i}`, q.descriptors?.[i] || ''));
    renderPreview();
    switchTab('question');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function duplicateQuestion(index){
    const phase = currentPhase();
    const copy = JSON.parse(JSON.stringify(phase.questions[index]));
    copy.id = `${copy.id || phase.id}-copia-${Date.now().toString().slice(-4)}`;
    phase.questions.splice(index + 1, 0, copy);
    saveEditorBank();
    renderAll();
    toast('Questão duplicada.', 'success');
  }

  function deleteQuestion(index){
    if(!confirm('Excluir esta questão?')) return;
    currentPhase().questions.splice(index, 1);
    saveEditorBank();
    renderAll();
    toast('Questão excluída.', 'success');
  }

  function clearQuestionForm(showToast = true){
    editingQuestionIndex = null;
    els.formTitle.textContent = 'Nova questão';
    els.questionForm.reset();
    setVal('discipline', 'Física');
    setVal('correctIndex', '0');
    renderPreview();
    if(showToast) toast('Formulário limpo.', 'success');
  }

  function renderPreview(){
    const q = formToQuestion();
    els.previewPanel.innerHTML = `
      <div class="preview-question">
        <p class="eyebrow">prévia da questão</p>
        <h3>${escapeHtml(q.discipline || 'Disciplina')} · ${escapeHtml(q.topic || 'Tema')}</h3>
        <p>${sanitizeRich(q.text || 'O enunciado aparecerá aqui.')}</p>
        ${q.image ? `<img class="question-image" src="${escapeAttr(q.image)}" alt="Imagem da questão">` : ''}
        <div class="options">
          ${q.options.map((opt, i) => `
            <div class="option-btn ${i === q.correctIndex ? 'correct' : ''}">
              <span class="option-letter">${letters[i]}</span><span>${sanitizeRich(opt || `Alternativa ${letters[i]}`)}</span>
            </div>`).join('')}
        </div>
        <div class="feedback">
          <h3>Comentário</h3>
          <p>${sanitizeRich(q.explanation || 'O comentário aparecerá aqui.')}</p>
        </div>
      </div>
    `;
    typeset(els.previewPanel);
  }

  function switchTab(tabName){
    document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === tabName));
    document.querySelectorAll('[data-tab-content]').forEach(content => content.classList.toggle('active', content.dataset.tabContent === tabName));
    if(tabName === 'preview') renderPreview();
  }

  function exportJson(){
    normalizeBank(bank);
    saveEditorBank();
    localStorage.setItem(CUSTOM_BANK_KEY, JSON.stringify(bank));
    downloadFile('questions.json', JSON.stringify(bank, null, 2), 'application/json;charset=utf-8');
    toast('Banco baixado. Coloque este arquivo na pasta data/ do site.', 'success');
  }

  function importJson(event){
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const parsed = JSON.parse(reader.result);
        normalizeBank(parsed);
        bank = parsed;
        selectedPhaseIndex = 0;
        editingQuestionIndex = null;
        saveEditorBank();
        localStorage.setItem(CUSTOM_BANK_KEY, JSON.stringify(bank));
        renderAll();
        toast('JSON importado com sucesso.', 'success');
      }catch(e){
        toast('Arquivo JSON inválido.', 'error');
      }finally{
        els.jsonInput.value = '';
      }
    };
    reader.readAsText(file);
  }

  function importCsv(event){
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const rows = parseCsv(reader.result);
        if(rows.length < 2) throw new Error('CSV vazio');
        const headers = rows[0].map(h => h.trim().toLowerCase());
        const idx = name => headers.indexOf(name);
        const required = ['fase','disciplina','tema','enunciado','a','b','c','d','e','correta','comentario'];
        const missing = required.filter(h => idx(h) === -1);
        if(missing.length) throw new Error(`Colunas ausentes: ${missing.join(', ')}`);

        rows.slice(1).forEach(row => {
          if(!row.some(cell => String(cell).trim())) return;
          const faseName = cell(row, idx('fase')) || 'Ilha 1';
          let phase = bank.phases.find(p => normalizeName(p.title) === normalizeName(faseName));
          if(!phase){
            phase = createBlankPhase(bank.phases.length + 1);
            phase.title = faseName;
            phase.id = slug(faseName);
            bank.phases.push(phase);
          }
          const corretaRaw = cell(row, idx('correta')).trim().toUpperCase();
          const correctIndex = /^[A-E]$/.test(corretaRaw) ? letters.indexOf(corretaRaw) : clamp(Number(corretaRaw) - 1, 0, 4);
          const q = {
            id: `${phase.id}-q${String(phase.questions.length + 1).padStart(2,'0')}`,
            discipline: cell(row, idx('disciplina')) || 'Interdisciplinar',
            topic: cell(row, idx('tema')) || 'Tema',
            text: cell(row, idx('enunciado')),
            image: idx('imagem') >= 0 ? cell(row, idx('imagem')) : '',
            options: ['a','b','c','d','e'].map(h => cell(row, idx(h))),
            correctIndex,
            explanation: cell(row, idx('comentario')),
            descriptors: ['descritor_a','descritor_b','descritor_c','descritor_d','descritor_e'].map(h => idx(h) >= 0 ? cell(row, idx(h)) : '')
          };
          normalizeQuestion(q, phase, phase.questions.length);
          phase.questions.push(q);
        });
        normalizeBank(bank);
        selectedPhaseIndex = 0;
        saveEditorBank();
        renderAll();
        toast('CSV importado. Confira as fases e exporte o JSON.', 'success');
      }catch(e){
        toast(e.message || 'Não consegui importar o CSV.', 'error');
      }finally{
        els.csvInput.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function downloadCsvTemplate(){
    const header = ['fase','disciplina','tema','enunciado','imagem','a','b','c','d','e','correta','comentario','descritor_a','descritor_b','descritor_c','descritor_d','descritor_e'];
    const sample = [
      'Ilha do Casco','Física','Calorimetria','Em uma manhã fria, a cerâmica parece mais fria que o tapete. A explicação correta é:','','A cerâmica está sempre mais fria.','O tapete produz calor.','A cerâmica conduz melhor o calor da pele.','O frio passa da cerâmica para o pé.','A umidade vira frio.','C','Materiais podem estar à mesma temperatura, mas conduzem calor em taxas diferentes.','Erro: confunde sensação térmica com temperatura real.','Erro: atribui produção de calor ao tapete.','Correta: relaciona sensação à condução.','Erro: trata frio como substância.','Erro: explicação sem base física.'
    ];
    downloadFile('modelo_questoes_prenat.csv', [header, sample].map(row => row.map(csvEscape).join(',')).join('\n'), 'text/csv;charset=utf-8');
  }

  function clearLocal(){
    if(!confirm('Isso apaga as edições salvas neste navegador. Deseja continuar?')) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CUSTOM_BANK_KEY);
    bank = JSON.parse(JSON.stringify(window.PRENAT_DEFAULT_BANK));
    selectedPhaseIndex = 0;
    editingQuestionIndex = null;
    normalizeBank(bank);
    renderAll();
    toast('Edições locais limpas.', 'success');
  }

  function currentPhase(){ return bank.phases[selectedPhaseIndex]; }
  function val(id){ return document.getElementById(id).value; }
  function setVal(id, value){ document.getElementById(id).value = value ?? ''; }
  function cell(row, index){ return index >= 0 ? String(row[index] ?? '').trim() : ''; }
  function clamp(n, min, max){ return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min)); }
  function slug(value){
    return String(value || 'item')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || `item-${Date.now()}`;
  }
  function normalizeName(value){ return slug(value).replace(/-/g,''); }
  function truncate(value, length){ return value.length > length ? value.slice(0, length-1) + '…' : value; }
  function stripHtml(value){ return String(value || '').replace(/<[^>]*>/g,' '); }
  function escapeHtml(value){ return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function escapeAttr(value){ return escapeHtml(value).replace(/`/g, '&#96;'); }
  function csvEscape(value){
    const s = String(value ?? '');
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
  }

  function parseCsv(text){
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for(let i=0; i<text.length; i++){
      const char = text[i];
      const next = text[i+1];
      if(char === '"'){
        if(inQuotes && next === '"'){
          field += '"';
          i++;
        }else{
          inQuotes = !inQuotes;
        }
      }else if((char === ',' || char === ';') && !inQuotes){
        row.push(field);
        field = '';
      }else if((char === '\n' || char === '\r') && !inQuotes){
        if(char === '\r' && next === '\n') i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      }else{
        field += char;
      }
    }
    if(field || row.length){ row.push(field); rows.push(row); }
    return rows.filter(r => r.some(c => String(c).trim() !== ''));
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

  function downloadFile(filename, content, type){
    const blob = new Blob([content], {type});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function toast(message, type=''){
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  function typeset(root){
    if(window.MathJax && window.MathJax.typesetPromise){
      window.MathJax.typesetPromise([root || document.body]).catch(() => {});
    }
  }
})();
