(() => {
  const letters = ['A', 'B', 'C', 'D', 'E'];
  let settings = null;
  let questions = [];


  // ===== PRENAT+ BLOCO DE IMPORTAÇÃO, PRÉVIA E EXCLUSÃO EM MASSA =====
  let selectedQuestionIds = new Set();

  function makeImportBatchSafe(sourceLabel, fileName = '') {
    const now = new Date();
    const stamp = now.toLocaleString('pt-BR');
    return {
      id: `batch_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      label: `${sourceLabel}${fileName ? ' · ' + fileName : ''} · ${stamp}`,
      source: sourceLabel,
      fileName,
      importedAt: now.toISOString()
    };
  }

  function attachImportBatchSafe(bank, batch) {
    return bank.map((q, index) => normalizeQuestion({
      ...q,
      metadata: {
        ...(q.metadata || {}),
        importBatchId: batch.id,
        importBatchLabel: batch.label,
        importBatchSource: batch.source,
        importBatchFile: batch.fileName,
        importBatchOrder: index + 1,
        importedAt: batch.importedAt
      }
    }));
  }

  function getQuestionBatchIdSafe(q) {
    return String(q?.metadata?.importBatchId || q?.importBatchId || '');
  }

  function getQuestionBatchLabelSafe(q) {
    return String(q?.metadata?.importBatchLabel || q?.metadata?.importBatchFile || 'Sem bloco identificado');
  }

  function currentVisibleQuestionsSafe() {
    const filter = document.getElementById('bankPhaseFilter')?.value || 'all';
    return [...questions]
      .filter(q => filter === 'all' || Number(q.phase) === Number(filter))
      .sort((a,b) => Number(a.phase || 0) - Number(b.phase || 0));
  }

  function ensureBulkQuestionToolsSafe() {
    const list = document.getElementById('questionBankList');
    if (!list || document.getElementById('bulkQuestionTools')) return;
    const panel = document.createElement('div');
    panel.id = 'bulkQuestionTools';
    panel.className = 'csv-import-panel';
    panel.style.margin = '16px 0';
    panel.innerHTML = `
      <strong>Revisão rápida do banco</strong>
      <p>Use seleção em massa para apagar questões importadas com erro sem precisar excluir uma por uma. Isso altera apenas o banco local do professor; publique somente depois de baixar o questions.json atualizado.</p>
      <div class="teacher-actions csv-import-actions">
        <button type="button" class="btn btn-soft" id="selectVisibleQuestions">Selecionar visíveis</button>
        <button type="button" class="btn btn-soft" id="clearSelectedQuestions">Limpar seleção</button>
        <button type="button" class="btn btn-soft danger" id="deleteSelectedQuestions">Excluir selecionadas</button>
      </div>
      <div id="selectionCounter" class="small-muted" style="margin-top:8px">0 questão(ões) selecionada(s).</div>
      <div id="importBatchPanel" style="margin-top:14px"></div>
    `;
    list.parentElement.insertBefore(panel, list);
    document.getElementById('selectVisibleQuestions')?.addEventListener('click', selectVisibleQuestionsSafe);
    document.getElementById('clearSelectedQuestions')?.addEventListener('click', clearQuestionSelectionSafe);
    document.getElementById('deleteSelectedQuestions')?.addEventListener('click', deleteSelectedQuestionsSafe);
  }

  function updateSelectionCounterSafe() {
    const counter = document.getElementById('selectionCounter');
    if (counter) counter.textContent = `${selectedQuestionIds.size} questão(ões) selecionada(s).`;
  }

  function enhanceQuestionSelectionSafe() {
    ensureBulkQuestionToolsSafe();
    document.querySelectorAll('.question-row').forEach(row => {
      const id = row.dataset.questionId;
      if (!id || row.querySelector('.question-select-wrap')) return;
      const wrap = document.createElement('label');
      wrap.className = 'question-select-wrap';
      wrap.style.cssText = 'display:flex;align-items:center;gap:8px;margin-right:10px;font-weight:800;color:#055274;';
      wrap.innerHTML = `<input type="checkbox" data-select-question="${escapeHtml(id)}"> selecionar`;
      row.insertBefore(wrap, row.firstChild);
    });
    document.querySelectorAll('[data-select-question]').forEach(input => {
      input.checked = selectedQuestionIds.has(input.dataset.selectQuestion);
      input.onchange = () => {
        if (input.checked) selectedQuestionIds.add(input.dataset.selectQuestion);
        else selectedQuestionIds.delete(input.dataset.selectQuestion);
        updateSelectionCounterSafe();
      };
    });
    updateSelectionCounterSafe();
  }

  function selectVisibleQuestionsSafe() {
    currentVisibleQuestionsSafe().forEach(q => selectedQuestionIds.add(String(q.id)));
    enhanceQuestionSelectionSafe();
  }

  function clearQuestionSelectionSafe() {
    selectedQuestionIds.clear();
    enhanceQuestionSelectionSafe();
  }

  function deleteSelectedQuestionsSafe() {
    const ids = new Set([...selectedQuestionIds]);
    if (!ids.size) return alert('Nenhuma questão selecionada.');
    if (!confirm(`Excluir ${ids.size} questão(ões) selecionada(s) do banco local?`)) return;
    questions = questions.filter(q => !ids.has(String(q.id)));
    selectedQuestionIds.clear();
    renderQuestionBank();
    saveTeacherDraftAfterBulkSafe(`Excluídas ${ids.size} questão(ões) selecionada(s). Banco atual: ${questions.length}.`);
    downloadBackupAfterBulkSafe();
  }

  function getImportBatchesSafe() {
    const map = new Map();
    questions.forEach(q => {
      const id = getQuestionBatchIdSafe(q);
      if (!id) return;
      if (!map.has(id)) {
        map.set(id, { id, label: getQuestionBatchLabelSafe(q), count: 0, images: 0, phases: new Set() });
      }
      const item = map.get(id);
      item.count += 1;
      if (q.image) item.images += 1;
      item.phases.add(Number(q.phase || 0));
    });
    return [...map.values()].sort((a,b) => String(b.id).localeCompare(String(a.id)));
  }

  function renderImportBatchPanelSafe() {
    const panel = document.getElementById('importBatchPanel');
    if (!panel) return;
    const batches = getImportBatchesSafe();
    if (!batches.length) {
      panel.innerHTML = '<p class="small-muted">Nenhum bloco importado identificado ainda. As próximas importações por CSV ou ZIP ficarão agrupadas aqui.</p>';
      return;
    }
    panel.innerHTML = `
      <strong>Blocos de importação</strong>
      <div class="safe-save-chips" style="margin-top:8px">
        ${batches.map(batch => `
          <span class="bank-chip" style="display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap">
            <strong>${escapeHtml(batch.label)}</strong> · ${batch.count} questão(ões) · ${batch.images} imagem(ns)
            <button type="button" class="btn btn-soft small" data-select-batch="${escapeHtml(batch.id)}">Selecionar bloco</button>
            <button type="button" class="btn btn-soft small danger" data-delete-batch="${escapeHtml(batch.id)}">Excluir bloco</button>
          </span>
        `).join('')}
      </div>`;
    panel.querySelectorAll('[data-select-batch]').forEach(btn => btn.addEventListener('click', () => {
      questions.filter(q => getQuestionBatchIdSafe(q) === btn.dataset.selectBatch).forEach(q => selectedQuestionIds.add(String(q.id)));
      enhanceQuestionSelectionSafe();
    }));
    panel.querySelectorAll('[data-delete-batch]').forEach(btn => btn.addEventListener('click', () => deleteImportBatchSafe(btn.dataset.deleteBatch)));
  }

  function deleteImportBatchSafe(batchId) {
    const batchQuestions = questions.filter(q => getQuestionBatchIdSafe(q) === batchId);
    if (!batchQuestions.length) return alert('Esse bloco não foi encontrado no banco atual.');
    const label = getQuestionBatchLabelSafe(batchQuestions[0]);
    if (!confirm(`Excluir o bloco importado abaixo?\n\n${label}\n\nTotal: ${batchQuestions.length} questão(ões).`)) return;
    const ids = new Set(batchQuestions.map(q => String(q.id)));
    questions = questions.filter(q => !ids.has(String(q.id)));
    [...ids].forEach(id => selectedQuestionIds.delete(id));
    renderQuestionBank();
    saveTeacherDraftAfterBulkSafe(`Bloco excluído: ${label}. Banco atual: ${questions.length}.`);
    downloadBackupAfterBulkSafe();
  }

  function saveTeacherDraftAfterBulkSafe(message) {
    if (typeof persistTeacherDraftSafe === 'function') return persistTeacherDraftSafe(message);
    try {
      localStorage.setItem(`${settings?.slug || 'prenat'}_teacher_questions`, JSON.stringify(questions));
      return { ok: true, mode: 'simple' };
    } catch (error) {
      console.error(error);
      return { ok: false, error };
    }
  }

  function downloadBackupAfterBulkSafe() {
    if (typeof autoDownloadBackupAfterSaveSafe === 'function') autoDownloadBackupAfterSaveSafe();
  }

  function getQuestionPreviewWarningsSafe(q) {
    const warnings = [];
    const problems = typeof validateQuestionBeforeStoreSafe === 'function' ? validateQuestionBeforeStoreSafe(q) : (typeof validateImportedQuestionNatureza === 'function' ? validateImportedQuestionNatureza(q) : []);
    if (problems.length) warnings.push(...problems);
    const img = String(q.image || '');
    if (img.startsWith('data:image/')) {
      const kb = Math.round((img.length * 0.75) / 1024);
      if (kb > 500) warnings.push(`imagem pesada: ~${kb} KB`);
    }
    if (/<img\b/i.test(String(q.statement || ''))) warnings.push('enunciado contém tag de imagem; use somente o campo Imagem');
    return warnings;
  }

  function showImportPreviewSafe(imported, options = {}) {
    return new Promise(resolve => {
      const selected = new Set(imported.map(q => String(q.id)));
      const overlay = document.createElement('div');
      overlay.className = 'prenat-import-preview-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);display:flex;align-items:flex-start;justify-content:center;padding:26px;overflow:auto;';
      const box = document.createElement('div');
      box.style.cssText = 'width:min(1080px,96vw);background:#fff;border-radius:24px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.35);max-height:92vh;overflow:auto;color:#053d56;';
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      const byPhase = {};
      imported.forEach(q => { byPhase[q.phase] = (byPhase[q.phase] || 0) + 1; });
      const summary = Object.entries(byPhase).map(([phase, count]) => {
        const p = settings.phases?.find(item => Number(item.id) === Number(phase));
        return `${p?.name || 'Ilha ' + phase}: ${count}`;
      }).join(' · ');

      function render() {
        box.innerHTML = `
          <h2 style="margin:0 0 8px">Prévia antes de salvar no banco</h2>
          <p style="margin:0 0 12px">Revise as questões importadas. Desmarque o que estiver ruim, principalmente imagem cortada, imagem com enunciado/alternativas ou item incompatível.</p>
          <p class="warning-tip" style="margin:10px 0"><strong>${escapeHtml(options.source || 'Importação')}</strong>${options.fileName ? ' · ' + escapeHtml(options.fileName) : ''}<br>${escapeHtml(summary)}</p>
          <div class="teacher-actions" style="position:sticky;top:0;background:#fff;padding:10px 0;z-index:2;border-bottom:1px solid #d6eef2">
            <button type="button" class="btn btn-soft" id="previewSelectAll">Selecionar todas</button>
            <button type="button" class="btn btn-soft" id="previewClearAll">Desmarcar todas</button>
            <button type="button" class="btn btn-primary" id="previewConfirm">Salvar selecionadas (${selected.size})</button>
            <button type="button" class="btn btn-soft danger" id="previewCancel">Cancelar importação</button>
          </div>
          <div style="display:grid;gap:12px;margin-top:14px">
            ${imported.map((q, idx) => {
              const phase = settings.phases?.find(p => Number(p.id) === Number(q.phase));
              const warnings = getQuestionPreviewWarningsSafe(q);
              const img = String(q.image || '');
              const imageHtml = img.startsWith('data:image/') || /^https?:\/\//i.test(img)
                ? `<img src="${img}" style="max-width:260px;max-height:170px;border:1px solid #bce9ef;border-radius:14px;background:#fff;object-fit:contain">`
                : '<span class="small-muted">sem imagem</span>';
              const correct = (q.options || []).findIndex(op => op.correct);
              return `
                <article style="border:1px solid #c7edf2;border-radius:18px;padding:14px;background:#f8feff;display:grid;grid-template-columns:32px 280px 1fr;gap:14px;align-items:start">
                  <input type="checkbox" data-preview-check="${escapeHtml(String(q.id))}" ${selected.has(String(q.id)) ? 'checked' : ''} style="margin-top:6px;transform:scale(1.2)">
                  <div>${imageHtml}<div class="small-muted" style="margin-top:6px">${escapeHtml(q.metadata?.imagemOriginal || '')}</div></div>
                  <div>
                    <strong>${idx + 1}. ${escapeHtml(phase ? `${phase.name} · ${phase.title}` : 'Ilha ' + q.phase)}</strong>
                    <p style="margin:7px 0">${escapeHtml(stripHtml(q.statement || '').slice(0, 520))}${stripHtml(q.statement || '').length > 520 ? '...' : ''}</p>
                    <small>${escapeHtml((q.options || []).map((op, i) => `${letters[i] || i+1}) ${op.correct ? '✓ ' : ''}${stripHtml(op.text || '').slice(0, 90)}`).join(' | '))}</small>
                    ${warnings.length ? `<p class="safe-save-warning" style="margin-top:8px">Atenção: ${escapeHtml(warnings.join('; '))}</p>` : ''}
                  </div>
                </article>`;
            }).join('')}
          </div>`;

        box.querySelectorAll('[data-preview-check]').forEach(input => {
          input.onchange = () => {
            if (input.checked) selected.add(input.dataset.previewCheck);
            else selected.delete(input.dataset.previewCheck);
            const btn = box.querySelector('#previewConfirm');
            if (btn) btn.textContent = `Salvar selecionadas (${selected.size})`;
          };
        });
        box.querySelector('#previewSelectAll')?.addEventListener('click', () => { imported.forEach(q => selected.add(String(q.id))); render(); });
        box.querySelector('#previewClearAll')?.addEventListener('click', () => { selected.clear(); render(); });
        box.querySelector('#previewCancel')?.addEventListener('click', () => { overlay.remove(); resolve(null); });
        box.querySelector('#previewConfirm')?.addEventListener('click', () => {
          const chosen = imported.filter(q => selected.has(String(q.id)));
          if (!chosen.length) return alert('Nenhuma questão selecionada para salvar.');
          overlay.remove();
          resolve(chosen);
        });
      }
      render();
    });
  }

  function finishImportedQuestionsSafe(imported, batch, sourceLabel, withImages = 0) {
    const importedWithBatch = attachImportBatchSafe(imported, batch);
    questions = [...questions, ...importedWithBatch].map(normalizeQuestion);
    renderQuestionBank();
    const saveResult = saveTeacherDraftAfterBulkSafe(`${sourceLabel} importado com ${importedWithBatch.length} questão(ões). Banco atual: ${questions.length}.`);
    downloadBackupAfterBulkSafe();
    if (saveResult?.ok === false) {
      alert(`As questões foram importadas para a tela, mas o navegador não conseguiu salvar no armazenamento local.\n\nQuestões adicionadas: ${importedWithBatch.length}\nImagens vinculadas: ${withImages}\nBanco atual na tela: ${questions.length}\n\nAÇÃO NECESSÁRIA: clique agora em "Baixar questions.json atualizado".`);
    } else {
      alert(`Importação concluída.\n\nQuestões adicionadas: ${importedWithBatch.length}\nImagens vinculadas: ${withImages}\nBanco atual: ${questions.length} questão(ões).`);
    }
  }

  // ===== FIM BLOCO DE IMPORTAÇÃO, PRÉVIA E EXCLUSÃO EM MASSA =====


  const FONT_OPTIONS = ['inter','arial','trebuchet','verdana','georgia','times','palatino'];

  const DEFAULT_SETTINGS = {
    slug: 'missao-ilhas-natureza-prenat-v15-definitivo',
    brand: 'PRENAT+',
    missionName: 'Missão Ilhas da Natureza',
    missionKicker: 'CAMPO DE TREINO PRENAT+',
    subtitle: 'Uma travessia leve e estratégica com desafios progressivos de Ciências da Natureza.',
    intro: 'Você vai atravessar ilhas, vencer desafios mistos de Biologia, Física e Química e evoluir de ovo a mestre da travessia.',
    studentThemeNote: 'Cada rodada sorteia questões do banco da ilha. Tente novamente quando precisar: o treino muda, e sua estratégia melhora.',
    showMetaToStudent: false,
    logo: 'logo-prenat.png',
    fontBodyKey: 'inter',
    fontHeadingKey: 'inter',
    ranks: [
      { name:'Ovo da Travessia', icon:'🥚', visualStage:0, description:'Você ainda está no início da jornada. A casca protege sua preparação antes da primeira ilha.' },
      { name:'Filhote do Casco', icon:'🐢', visualStage:1, description:'Você saiu do ovo, rompeu a primeira casca e virou Filhote do Casco.' },
      { name:'Explorador das Marés', icon:'🐢', visualStage:2, description:'Você já encara a travessia com mais segurança e começa a reconhecer os caminhos da prova.' },
      { name:'Guardião da Travessia', icon:'🐢', visualStage:3, description:'Você sustenta o foco diante de armadilhas, gráficos e alternativas parecidas.' },
      { name:'Navegador da Resistência', icon:'🐢', visualStage:4, description:'Você atravessa questões maiores, interpreta dados e mantém calma até o fim.' },
      { name:'Mestre da Travessia', icon:'🐢', visualStage:5, description:'Você domina etapas exigentes, elimina distratores fortes e conduz a própria evolução.' },
      { name:'Grande Mestre da Natureza', icon:'🐢', visualStage:6, description:'Você venceu o Boss Final e concluiu a travessia PRENAT+ como Grande Mestre da Natureza.' }
    ],
    phases: [
      { id:1, name:'Ilha 1', title:'Rompendo a Casca', story:'Nesta primeira ilha, você vai aquecer a mente com questões básicas e misturadas de Natureza. Para avançar, mantenha o foco, proteja suas vidas e supere a meta.', minPercent:60, lives:3, questionLimit:10, shuffle:true, rewardRankIndex:1, difficultyLabel:'Aquecimento' },
      { id:2, name:'Ilha 2', title:'Caminho do Filhote', story:'Nesta ilha, você vai enfrentar enunciados um pouco mais interpretativos, alternativas parecidas e conceitos que pedem atenção.', minPercent:65, lives:3, questionLimit:15, shuffle:true, rewardRankIndex:2, difficultyLabel:'Base + interpretação' },
      { id:3, name:'Ilha 3', title:'Mar das Estratégias', story:'Agora você vai cruzar gráficos, comparações, contextos do cotidiano e armadilhas típicas de prova.', minPercent:70, lives:3, questionLimit:20, shuffle:true, rewardRankIndex:3, difficultyLabel:'Intermediário' },
      { id:4, name:'Ilha 4', title:'Trilha da Resistência', story:'Aqui a resistência aumenta: você vai lidar com textos maiores, ideias combinadas e decisões que exigem calma até o fim.', minPercent:75, lives:3, questionLimit:30, shuffle:true, rewardRankIndex:4, difficultyLabel:'Médio-forte' },
      { id:5, name:'Ilha 5', title:'Templo da Evolução', story:'Nesta ilha, você vai encarar questões mais profundas, distratores fortes e raciocínio mais exigente.', minPercent:80, lives:4, questionLimit:35, shuffle:true, rewardRankIndex:5, difficultyLabel:'Avançado' },
      { id:6, name:'Boss Final', title:'Grande Batalha da Natureza', story:'Chegou o Boss Final. Você vai enfrentar questões hard, integradas e com cara de prova. Supere a meta final e conclua a travessia.', minPercent:80, lives:4, questionLimit:45, shuffle:true, rewardRankIndex:6, difficultyLabel:'Hard final' }
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
    setupRichTextHelpers();
    setupImageTools();
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
    document.getElementById('importQuestionsCsv')?.addEventListener('change', importCsvQuestionsNatureza);
    document.getElementById('downloadCsvModelNatureza')?.addEventListener('click', downloadCsvModelNatureza);
    document.getElementById('importQuestionsZipImages')?.addEventListener('change', importQuestionsFromZipWithImagesNatureza);
    document.getElementById('downloadZipImageTemplate')?.addEventListener('click', downloadZipImageTemplateNatureza);
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
    document.getElementById('qImage')?.addEventListener('input', updateImagePreview);
    document.getElementById('clearImageBtn')?.addEventListener('click', () => {
      setValue('qImage', '');
      updateImagePreview();
    });
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
    setValue('fontBodyInput', FONT_OPTIONS.includes(settings.fontBodyKey) ? settings.fontBodyKey : 'inter');
    setValue('fontHeadingInput', FONT_OPTIONS.includes(settings.fontHeadingKey) ? settings.fontHeadingKey : 'inter');
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
    settings.fontBodyKey = FONT_OPTIONS.includes(getValue('fontBodyInput')) ? getValue('fontBodyInput') : 'inter';
    settings.fontHeadingKey = FONT_OPTIONS.includes(getValue('fontHeadingInput')) ? getValue('fontHeadingInput') : settings.fontBodyKey;
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
          <div class="form-field"><label>Questões por tentativa</label><input id="phase_${phase.id}_limit" type="number" min="0" value="${phase.questionLimit}"></div>
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
          <div class="form-field full rich-field"><label>Texto da alternativa ${letter}</label><textarea id="opt_${index}_text" data-rich="true"></textarea></div>
          <div class="form-field full rich-field"><label>Comentário/distrator da alternativa ${letter}</label><textarea id="opt_${index}_feedback" data-rich="true" placeholder="Explique por que essa alternativa está certa ou errada."></textarea></div>
        </div>`;
      options.appendChild(card);
    });
    setupRichTextHelpers();
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
    updateImagePreview();
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
    selectedQuestionIds.delete(String(id));
    renderQuestionBank();
    saveTeacherDraftAfterBulkSafe(`Questão excluída. Banco atual: ${questions.length} questão(ões).`);
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
    updateImagePreview();
  }

  function renderQuestionBank() {
    const list = document.getElementById('questionBankList');
    if (!list) return;
    ensureBulkQuestionToolsSafe();
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
      row.dataset.questionId = q.id;
      row.dataset.importBatchId = getQuestionBatchIdSafe(q);
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
    enhanceQuestionSelectionSafe();
    renderImportBatchPanelSafe();
  }


  function setupRichTextHelpers() {
    document.querySelectorAll('textarea[data-rich="true"]').forEach(textarea => {
      if (textarea.dataset.toolbarReady === 'true') return;
      textarea.dataset.toolbarReady = 'true';
      const toolbar = document.createElement('div');
      toolbar.className = 'rich-toolbar';
      toolbar.innerHTML = `
        <button type="button" data-rich-action="sub">x<sub>2</sub> Subscrito</button>
        <button type="button" data-rich-action="sup">x<sup>2</sup> Sobrescrito</button>
        <button type="button" data-rich-action="latex">Fórmula \( \)</button>
        <button type="button" data-rich-action="chem">Auto química</button>
        <button type="button" data-rich-action="arrow">→</button>
        <button type="button" data-rich-action="equilibrium">⇌</button>
        <button type="button" data-rich-action="delta">Δ</button>
      `;
      textarea.parentElement.insertBefore(toolbar, textarea.nextSibling);
      toolbar.addEventListener('click', event => {
        const btn = event.target.closest('button[data-rich-action]');
        if (!btn) return;
        applyRichAction(textarea, btn.dataset.richAction);
      });
    });
  }

  function applyRichAction(textarea, action) {
    textarea.focus();
    if (action === 'sub') return wrapSelection(textarea, '<sub>', '</sub>', '2');
    if (action === 'sup') return wrapSelection(textarea, '<sup>', '</sup>', '2');
    if (action === 'latex') return wrapSelection(textarea, '\\( ', ' \\)', 'Q = m \\cdot c \\cdot \\Delta T');
    if (action === 'arrow') return insertAtCursor(textarea, ' → ');
    if (action === 'equilibrium') return insertAtCursor(textarea, ' ⇌ ');
    if (action === 'delta') return insertAtCursor(textarea, 'Δ');
    if (action === 'chem') return autoSubscriptChemistry(textarea);
  }

  function wrapSelection(textarea, before, after, placeholder) {
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const selected = textarea.value.slice(start, end) || placeholder;
    const next = textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end);
    textarea.value = next;
    const newStart = start + before.length;
    const newEnd = newStart + selected.length;
    textarea.setSelectionRange(newStart, newEnd);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function insertAtCursor(textarea, value) {
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    textarea.value = textarea.value.slice(0, start) + value + textarea.value.slice(end);
    const pos = start + value.length;
    textarea.setSelectionRange(pos, pos);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function autoSubscriptChemistry(textarea) {
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const hasSelection = end > start;
    const original = hasSelection ? textarea.value.slice(start, end) : textarea.value;
    const converted = convertChemicalNumbers(original);
    if (hasSelection) {
      textarea.value = textarea.value.slice(0, start) + converted + textarea.value.slice(end);
      textarea.setSelectionRange(start, start + converted.length);
    } else {
      textarea.value = converted;
    }
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function convertChemicalNumbers(value) {
    // Converte números em fórmulas químicas comuns sem mexer em números de etapa, porcentagens ou datas.
    // Exemplos: H2O -> H<sub>2</sub>O; Na2CO3 -> Na<sub>2</sub>CO<sub>3</sub>; Ca(OH)2 -> Ca(OH)<sub>2</sub>.
    return String(value || '').replace(/([A-Z][a-z]?|\))([0-9]+)/g, '$1<sub>$2</sub>');
  }

  function setupImageTools() {
    const fileInput = document.getElementById('qImageFile');
    const zone = document.getElementById('imagePasteZone');
    const imageInput = document.getElementById('qImage');
    if (fileInput && fileInput.dataset.imageReady !== 'true') {
      fileInput.dataset.imageReady = 'true';
      fileInput.addEventListener('change', event => {
        const file = event.target.files?.[0];
        if (file) handleImageFile(file);
        event.target.value = '';
      });
    }
    if (zone && zone.dataset.imageReady !== 'true') {
      zone.dataset.imageReady = 'true';
      zone.addEventListener('paste', event => handlePasteImage(event));
      zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('dragging'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
      zone.addEventListener('drop', event => {
        event.preventDefault();
        zone.classList.remove('dragging');
        const file = [...(event.dataTransfer?.files || [])].find(item => item.type.startsWith('image/'));
        if (file) handleImageFile(file);
      });
    }
    if (imageInput && imageInput.dataset.pasteReady !== 'true') {
      imageInput.dataset.pasteReady = 'true';
      imageInput.addEventListener('paste', event => handlePasteImage(event));
    }
    document.addEventListener('paste', event => {
      const active = document.activeElement;
      const isQuestionTabOpen = !document.querySelector('[data-tab="questoes"]')?.classList.contains('hidden');
      if (!isQuestionTabOpen) return;
      if (active?.tagName === 'TEXTAREA' && !event.clipboardData?.files?.length) return;
      handlePasteImage(event);
    });
    updateImagePreview();
  }

  function handlePasteImage(event) {
    const items = [...(event.clipboardData?.items || [])];
    const file = items.find(item => item.type.startsWith('image/'))?.getAsFile();
    if (!file) return;
    event.preventDefault();
    handleImageFile(file);
  }

  async function handleImageFile(file) {
    if (!file.type.startsWith('image/')) return alert('Escolha um arquivo de imagem.');
    try {
      const dataUrl = await imageFileToDataUrl(file, 1200, 0.86);
      setValue('qImage', dataUrl);
      updateImagePreview();
      alert('Imagem adicionada à questão. Ela será salva dentro do questions.json.');
    } catch (error) {
      console.error(error);
      alert('Não consegui carregar essa imagem. Tente PNG ou JPG.');
    }
  }

  function imageFileToDataUrl(file, maxSize = 1200, quality = 0.86) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = async () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const type = file.type === 'image/png' && file.size < 350000 ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(type, quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function updateImagePreview() {
    const value = getValue('qImage').trim();
    const wrap = document.getElementById('qImagePreviewWrap');
    const img = document.getElementById('qImagePreview');
    if (!wrap || !img) return;
    if (!value) {
      wrap.classList.add('hidden');
      img.removeAttribute('src');
      return;
    }
    img.src = value;
    wrap.classList.remove('hidden');
  }




  // ===== PRENAT+ CSV/ZIP IMPORT COM IMAGENS =====
  function normalizeHeaderNatureza(value) {
    return String(value || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function parseCsvTextNatureza(text) {
    const rows = [];
    let current = [];
    let cell = '';
    let inQuotes = false;
    const input = String(text || '').replace(/^\uFEFF/, '');
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      const next = input[i + 1];
      if (ch === '"') {
        if (inQuotes && next === '"') { cell += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ';' && !inQuotes) {
        current.push(cell); cell = '';
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && next === '\n') i++;
        current.push(cell); cell = '';
        if (current.some(v => String(v).trim() !== '')) rows.push(current);
        current = [];
      } else {
        cell += ch;
      }
    }
    current.push(cell);
    if (current.some(v => String(v).trim() !== '')) rows.push(current);
    if (!rows.length) return [];
    const headers = rows[0].map(h => String(h || '').trim());
    return rows.slice(1).map(values => {
      const row = {};
      headers.forEach((header, index) => { row[header] = values[index] ?? ''; });
      return row;
    }).filter(row => Object.values(row).some(v => String(v).trim() !== ''));
  }

  function pickCsvCellNatureza(row, names) {
    const entries = Object.entries(row || {});
    for (const name of names) {
      const wanted = normalizeHeaderNatureza(name);
      const found = entries.find(([key]) => normalizeHeaderNatureza(key) === wanted);
      if (found && String(found[1] ?? '').trim() !== '') return String(found[1]).trim();
    }
    return '';
  }

  function truthyCsvNatureza(value) {
    return /^(sim|s|yes|y|true|1|correta|certo|x)$/i.test(String(value || '').trim());
  }

  function csvQuoteNatureza(value) {
    return '"' + String(value ?? '').replace(/"/g, '""') + '"';
  }

  function phaseFromCsvNatureza(value) {
    const text = String(value || '').trim();
    const direct = Number(text);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const match = text.match(/\d+/);
    if (match) return Number(match[0]);
    const normalized = normalizeHeaderNatureza(text);
    const found = settings.phases?.find(p => normalizeHeaderNatureza(p.name).includes(normalized) || normalized.includes(normalizeHeaderNatureza(p.name)));
    return Number(found?.id || 1);
  }

  function metadataFromCsvNatureza(row, key) {
    for (let i = 1; i <= 5; i++) {
      const meta = pickCsvCellNatureza(row, [`Metadado ${i}`, `Metadata ${i}`]);
      const val = pickCsvCellNatureza(row, [`Valor ${i}`, `Value ${i}`]);
      if (normalizeHeaderNatureza(meta) === normalizeHeaderNatureza(key)) return val;
    }
    return '';
  }

  function questionFromCsvRowNatureza(row, index) {
    const statement = pickCsvCellNatureza(row, ['Enunciado','Questão','Questao','Texto','Statement']);
    if (!statement) return null;
    const positive = pickCsvCellNatureza(row, ['Feedback Positivo','Feedback quando acertar','Feedback Correto','Comentário correto']);
    const negative = pickCsvCellNatureza(row, ['Feedback Negativo','Feedback quando errar','Feedback Incorreto','Comentário errado']);
    const category = pickCsvCellNatureza(row, ['Categoria','Tema','Assunto','Conteúdo','Conteudo']);
    const phase = phaseFromCsvNatureza(pickCsvCellNatureza(row, ['Ilha/Fase','Ilha','Fase','Phase']));
    const options = [];
    for (let i = 1; i <= 8; i++) {
      const text = pickCsvCellNatureza(row, [`Alternativa ${i}`, `Alternativa ${String.fromCharCode(64+i)}`, `Opção ${i}`, `Opcao ${i}`]);
      if (!text) continue;
      const correct = truthyCsvNatureza(pickCsvCellNatureza(row, [`Alternativa ${i} Correta`, `Correta ${i}`, `Gabarito ${i}`]));
      options.push({ text, correct, feedback: correct ? positive : negative });
    }
    if (options.length < 2) return null;
    if (!options.some(op => op.correct)) options[0].correct = true;
    return normalizeQuestion({
      id: makeId(),
      phase,
      discipline: metadataFromCsvNatureza(row, 'Disciplina') || pickCsvCellNatureza(row, ['Disciplina']),
      topic: metadataFromCsvNatureza(row, 'Tema') || category,
      difficulty: metadataFromCsvNatureza(row, 'Dificuldade') || metadataFromCsvNatureza(row, 'Nível') || pickCsvCellNatureza(row, ['Dificuldade','Nível','Nivel']),
      statement,
      image: pickCsvCellNatureza(row, ['Imagem','Image','Arquivo da Imagem','Nome da Imagem','URL da Imagem','Link da Imagem']),
      options,
      explanation: [positive, negative].filter(Boolean).join('\n\n')
    });
  }

  function validateImportedQuestionNatureza(q) {
    const problems = [];
    if (!q.statement || !q.statement.trim()) problems.push('sem enunciado');
    if (!Array.isArray(q.options) || q.options.length < 2) problems.push('menos de duas alternativas');
    if (Array.isArray(q.options) && !q.options.some(op => op.correct)) problems.push('sem alternativa correta');
    if (!Number(q.phase)) problems.push('sem ilha/fase válida');
    return problems;
  }

  async function addImportedQuestionsNatureza(imported, label, fileName = '') {
    const invalid = [];
    imported.forEach((q, i) => {
      const problems = validateImportedQuestionNatureza(q);
      if (problems.length) invalid.push(`Questão ${i + 1}: ${problems.join('; ')}`);
    });
    if (invalid.length) {
      alert('Problema(s) encontrado(s):\n\n' + invalid.slice(0, 12).join('\n') + (invalid.length > 12 ? `\n... e mais ${invalid.length - 12}` : ''));
      return false;
    }
    const previewed = await showImportPreviewSafe(imported, { source: label, fileName });
    if (!previewed || !previewed.length) return false;
    const batch = makeImportBatchSafe(label, fileName);
    const withImages = previewed.filter(q => q.image && String(q.image).startsWith('data:image/')).length;
    finishImportedQuestionsSafe(previewed, batch, label, withImages);
    return true;
  }

  function importCsvQuestionsNatureza(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rows = parseCsvTextNatureza(reader.result);
        const imported = rows.map(questionFromCsvRowNatureza).filter(Boolean);
        if (!imported.length) return alert('Nenhuma questão válida encontrada no CSV. Confira Enunciado, Alternativas e Correta.');
        await addImportedQuestionsNatureza(imported, 'CSV', file.name);
      } catch (error) {
        console.error(error);
        alert('Não foi possível importar a planilha. Salve como CSV separado por ponto e vírgula e tente novamente.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function getZipImageMimeNatureza(filename) {
    const ext = String(filename || '').split('.').pop().toLowerCase();
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'svg') return 'image/svg+xml';
    return 'application/octet-stream';
  }

  function basenameNatureza(path) {
    return String(path || '').split('/').pop().split('\\').pop().trim();
  }

  function normalizeImageNameNatureza(name) {
    return normalizeHeaderNatureza(basenameNatureza(name));
  }

  async function buildImageMapNatureza(zip) {
    const imageMap = {};
    const entries = Object.values(zip.files || {});
    for (const entry of entries) {
      if (entry.dir || entry.name.includes('__MACOSX/')) continue;
      if (!/\.(png|jpe?g|webp|gif|svg)$/i.test(entry.name)) continue;
      const base = basenameNatureza(entry.name);
      const dataUrl = `data:${getZipImageMimeNatureza(base)};base64,${await entry.async('base64')}`;
      imageMap[normalizeImageNameNatureza(base)] = dataUrl;
      imageMap[normalizeImageNameNatureza(entry.name)] = dataUrl;
    }
    return imageMap;
  }

  function findCsvFileNatureza(zip) {
    const files = Object.values(zip.files || {}).filter(entry => !entry.dir && !entry.name.includes('__MACOSX/') && /\.csv$/i.test(entry.name));
    if (!files.length) return null;
    return files.find(entry => /(^|\/)questoes\.csv$/i.test(entry.name)) || files[0];
  }

  async function importQuestionsFromZipWithImagesNatureza(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (typeof JSZip === 'undefined') {
      alert('A biblioteca JSZip não carregou. Confira a internet e recarregue o professor.');
      event.target.value = '';
      return;
    }
    try {
      const zip = await JSZip.loadAsync(file);
      const csvFile = findCsvFileNatureza(zip);
      if (!csvFile) return alert('O ZIP não possui arquivo CSV. Inclua um arquivo chamado questoes.csv.');
      const imageMap = await buildImageMapNatureza(zip);
      const rows = parseCsvTextNatureza(await csvFile.async('string'));
      const missing = [];
      const imported = rows.map((row, index) => {
        const q = questionFromCsvRowNatureza(row, index);
        if (!q) return null;
        const imageRef = pickCsvCellNatureza(row, ['Imagem','Image','Arquivo da Imagem','Nome da Imagem','URL da Imagem','Link da Imagem']);
        if (imageRef) {
          const linked = imageMap[normalizeImageNameNatureza(imageRef)];
          if (linked) q.image = linked;
          else if (/^https?:\/\//i.test(imageRef) || /^data:image\//i.test(imageRef)) q.image = imageRef;
          else { q.image = ''; missing.push(`Linha ${index + 2}: ${imageRef}`); }
        }
        return q;
      }).filter(Boolean);
      if (!imported.length) return alert('Nenhuma questão válida foi encontrada no ZIP.');
      const withImages = imported.filter(q => q.image && String(q.image).startsWith('data:image/')).length;
      let extra = missing.length ? `\n\nAtenção: ${missing.length} imagem(ns) citada(s) não foram encontradas:\n${missing.slice(0, 8).join('\n')}` : '';
      if (extra) alert(extra);
      await addImportedQuestionsNatureza(imported, 'ZIP com imagens', file.name);
    } catch (error) {
      console.error(error);
      alert('Não foi possível importar o ZIP. Confira se ele contém questoes.csv e imagens PNG, JPG ou WEBP.');
    } finally {
      event.target.value = '';
    }
  }

  function downloadCsvModelNatureza() {
    const headers = ['Enunciado','Categoria','Feedback Positivo','Feedback Negativo','Alternativa 1','Alternativa 1 Correta','Alternativa 2','Alternativa 2 Correta','Alternativa 3','Alternativa 3 Correta','Alternativa 4','Alternativa 4 Correta','Alternativa 5','Alternativa 5 Correta','Alternativa 6','Alternativa 6 Correta','Alternativa 7','Alternativa 7 Correta','Alternativa 8','Alternativa 8 Correta','Metadado 1','Valor 1','Metadado 2','Valor 2','Metadado 3','Valor 3','Ilha/Fase','Imagem'];
    const row = ['Observe a imagem associada ao item e responda à questão teste de Natureza.','Teste com imagem','Parabéns, você acertou! 🐢💙 A imagem foi vinculada corretamente ao item.','Que pena, não foi dessa vez, mas vou te explicar para você evoluir! 🐢💙 Este é um teste de importação.','Alternativa correta de teste','Sim','Distrator 1','','Distrator 2','','Distrator 3','','Distrator 4','','','','','','','', 'Ano','2026','Disciplina','Natureza','Dificuldade','Teste','1','Q001.png'];
    const csv = headers.map(csvQuoteNatureza).join(';') + '\n' + row.map(csvQuoteNatureza).join(';');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'modelo-importacao-natureza-prenat.csv';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  }

  function downloadZipImageTemplateNatureza() {
    if (typeof JSZip === 'undefined') return alert('A biblioteca JSZip não carregou. Confira a internet e recarregue o professor.');
    const headers = ['Enunciado','Categoria','Feedback Positivo','Feedback Negativo','Alternativa 1','Alternativa 1 Correta','Alternativa 2','Alternativa 2 Correta','Alternativa 3','Alternativa 3 Correta','Alternativa 4','Alternativa 4 Correta','Alternativa 5','Alternativa 5 Correta','Alternativa 6','Alternativa 6 Correta','Alternativa 7','Alternativa 7 Correta','Alternativa 8','Alternativa 8 Correta','Metadado 1','Valor 1','Metadado 2','Valor 2','Metadado 3','Valor 3','Ilha/Fase','Imagem'];
    const row = ['Observe a imagem associada ao item e responda à questão teste de Natureza.','Teste com imagem','Parabéns, você acertou! 🐢💙 A imagem foi vinculada corretamente ao item.','Que pena, não foi dessa vez, mas vou te explicar para você evoluir! 🐢💙 Este é um teste de importação.','Alternativa correta de teste','Sim','Distrator 1','','Distrator 2','','Distrator 3','','Distrator 4','','','','','','','', 'Ano','2026','Disciplina','Natureza','Dificuldade','Teste','1','Q001.png'];
    const csv = headers.map(csvQuoteNatureza).join(';') + '\n' + row.map(csvQuoteNatureza).join(';');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520"><rect width="900" height="520" fill="#fff"/><rect x="40" y="40" width="820" height="440" rx="32" fill="#e8fbfb" stroke="#09999F" stroke-width="8"/><text x="450" y="120" font-family="Arial" font-size="46" font-weight="700" text-anchor="middle" fill="#055274">Imagem teste PRENAT+</text><text x="450" y="280" font-family="Arial" font-size="54" font-weight="700" text-anchor="middle" fill="#D01890">Q001.png</text><text x="450" y="410" font-family="Arial" font-size="28" text-anchor="middle" fill="#055274">Se aparecer no aluno, funcionou.</text></svg>`;
    const zip = new JSZip();
    zip.file('questoes.csv', csv);
    zip.folder('imagens').file('Q001.png', svg);
    zip.file('LEIA-ME.txt', 'Modelo PRENAT+ para importação com imagens. Mantenha questoes.csv e a pasta imagens.');
    zip.generateAsync({ type: 'blob' }).then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'modelo-zip-com-imagens-natureza-prenat.zip';
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    });
  }
  // ===== FIM CSV/ZIP IMPORT COM IMAGENS =====

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
