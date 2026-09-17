/**
 * COMPONENTE: GeminiReportService.gs
 * PAPEL: Relatório pedagógico generativo via Google Gemini.
 *
 * Contrato de uso (frontend, google.script.run):
 *   - generateAiReport()        → relatório do panorama atual (tela inicial).
 *   - generateAiReport(payload) → relatório aprofundado; payload pode trazer
 *                                  { summary, foco, turma, periodo } vindos do clique.
 *
 * FONTE DE DADOS: getSchoolRealityAnalyticsSummary() (componente compartilhado
 * SchoolRealityAnalyticsService.gs, presente em toda a frota).
 *
 * RESILIÊNCIA (padrão da frota): retry + backoff exponencial em falhas
 * transitórias (HTTP 429/500/503 e exceções de rede). Sem GEMINI_API_KEY,
 * ou em erro permanente da API, degrada para um relatório local estruturado.
 *
 * AMBIENTE: propriedade de script GEMINI_API_KEY.
 */

var GeminiReportService = (function () {
  // FROTA-07: modelo lido da property do script, nunca hardcoded; cai no padrão local.
  function model_() {
    try {
      return PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL') || 'gemini-2.0-flash';
    } catch (e) {
      return 'gemini-2.0-flash';
    }
  }
  var BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';
  var PROJECT = 'Week In The Loop';
  var DOMAIN = 'ciclo semanal multimodal de acompanhamento (o loop da semana): destaques, alertas e próximos passos';
  var INSTRUCTION = 'Sintetize o loop da semana: destaques, alertas e recomendações concretas para a próxima semana, conectando os indicadores entre si. Diferencie sínteses descritivas de tendências de hipóteses contextuais sobre engajamento.';

  function apiKey_() {
    try { return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY'); }
    catch (e) { return null; }
  }

  function isConfigured() { return !!apiKey_(); }

  function gatherSummary_() {
    try {
      if (typeof getSchoolRealityAnalyticsSummary === 'function') {
        return getSchoolRealityAnalyticsSummary({ record: false });
      }
    } catch (e) {}
    return { projectName: PROJECT, focus: DOMAIN, analyses: [] };
  }

  function analysesText_(summary) {
    var rows = (summary && summary.analyses) || [];
    if (!rows.length) return '(sem leituras registradas ainda)';
    return rows.map(function (a) {
      var val = (a.value === undefined || a.value === '') ? '—' : a.value;
      var unit = a.unit ? (' ' + a.unit) : '';
      var dim = a.dimension ? (' [' + a.dimension + ']') : '';
      var narr = a.narrative ? (' — ' + a.narrative) : '';
      return '- ' + (a.label || a.key) + ': ' + val + unit + dim + narr;
    }).join('\n');
  }

  function buildPrompt_(summary, payload) {
    try {
      var foco = (payload && payload.foco) || (summary && summary.focus) || DOMAIN;
      var escopo = (payload && payload.turma) ? ('Turma/recorte: ' + payload.turma + '.') : 'Recorte: visão geral da escola.';
      return [
        'Você é um analista pedagógico da Escola Classe 115 Norte (SEEDF, Brasília-DF).',
        'Projeto: ' + PROJECT + '. Domínio: ' + DOMAIN + '.',
        escopo,
        'Foco da análise: ' + foco + '.',
        '',
        'Leituras (indicadores de realidade escolar):',
        analysesText_(summary),
        '',
        INSTRUCTION,
        'Limites obrigatórios: os dados são observacionais e agregados. Não produza diagnóstico clínico, laudo clínico ou conclusão sobre cansaço/fadiga. Não trate uma tendência como causa; apresente relações como hipóteses contextuais a validar pela equipe pedagógica. O acompanhamento tem finalidade pedagógica e não substitui avaliação profissional.',
        '',
        'Produza um relatório em português do Brasil, objetivo e acionável, com as seções:',
        '1. Panorama (2–3 frases).',
        '2. Destaques positivos.',
        '3. Pontos de atenção.',
        '4. Recomendações práticas para o professor/gestor (até 5 itens).',
        'Não invente números; use apenas os dados fornecidos.'
      ].join('\n');
    } catch (error) {
      Logger.log("Erro em buildPrompt_: " + error.message);
      throw error;
    }
  }

  function fetchGeminiReport_(url, options) {
    var opts = {};
    for (var k in options) { if (Object.prototype.hasOwnProperty.call(options, k)) opts[k] = options[k]; }
    opts.muteHttpExceptions = true;

    var MAX = 3;
    var waitMs = 700;
    for (var attempt = 1; attempt <= MAX; attempt++) {
      var resp;
      try {
        resp = UrlFetchApp.fetch(url, opts);
      } catch (e) {
        if (attempt >= MAX) throw e;
        Utilities.sleep(waitMs); waitMs *= 2; continue;
      }
      var code = resp.getResponseCode();
      var transient = (code === 429 || code === 500 || code === 503);
      if (transient && attempt < MAX) { Utilities.sleep(waitMs); waitMs *= 2; continue; }
      if (code >= 400) throw new Error('Gemini HTTP ' + code + ': ' + resp.getContentText().slice(0, 300));
      return resp;
    }
  }

  function callGemini_(prompt) {
    try {
      var key = apiKey_();
      var url = BASE_URL + model_() + ':generateContent?key=' + encodeURIComponent(key);
      var options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 1200 }
        })
      };
      var resp = fetchGeminiReport_(url, options);
      var data = JSON.parse(resp.getContentText());
      var text = data && data.candidates && data.candidates[0] &&
        data.candidates[0].content && data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
      if (!text) throw new Error('Resposta vazia do Gemini.');
      return String(text).trim();
    } catch (error) {
      Logger.log("Erro em callGemini_: " + error.message);
      throw error;
    }
  }

  function fallback_(summary) {
    var head = 'Relatório local (' + PROJECT + ') — IA indisponível (configure GEMINI_API_KEY para a versão completa).';
    return head + '\n\nPanorama — foco: ' + DOMAIN + '.\n\nLeituras:\n' + analysesText_(summary) +
      '\n\nRecomendações gerais:\n' +
      '- Revisar os indicadores em destaque com a turma.\n' +
      '- Priorizar os pontos de atenção com maior impacto no engajamento.\n' +
      '- Registrar novas observações para enriquecer a próxima análise.\n' +
      '\nLimite de interpretação: estas são métricas descritivas e hipóteses contextuais de engajamento; não constituem diagnóstico ou laudo clínico de cansaço.';
  }

  function generate(payload) {
    payload = payload || {};
    // FROTA-09: consentimento agregado para uso generativo de dados fisiológicos
    var _uid09 = (payload && payload.userId) || 'aggregate';
    try { ConsentService.check(_uid09, 'generative'); } catch (e) {
      if (e.isConsentError) {
        return { success: false, source: 'consent-block', status: e.status,
          report: 'Consentimento ' + e.status + ' para uso generativo dos dados.' };
      }
      throw e;
    }
    var summary = payload.summary || gatherSummary_();
    var base = { success: true, project: PROJECT, generatedAt: new Date(), summary: summary };
    if (!isConfigured()) {
      base.source = 'fallback'; base.report = fallback_(summary); return base;
    }
    try {
      var generatedReport = callGemini_(buildPrompt_(summary, payload));
      if (containsClinicalClaim_(generatedReport)) throw new Error('REPORT_SCOPE_VIOLATION');
      base.source = 'gemini'; base.report = generatedReport; return HumanReviewService.decorateResult('ai.report', base, base.report);
    } catch (e) {
      base.source = 'fallback'; base.report = fallback_(summary);
      base.error = String((e && e.message) || e); return base;
    }
  }

  function containsClinicalClaim_(text) {
    // A menção a diagnóstico/laudo clínico já foge do contrato do produto;
    // degradar para o fallback mantém o resultado pedagógico e não clínico.
    return /\b(?:diagn[oó]stico|laudo)\s+cl[ií]nico\b/i.test(String(text || '')) ||
      /\bdiagn[oó]stico\s+(?:de|para)\s+(?:cansa[cç]o|fadiga)\b/i.test(String(text || ''));
  }

  function generateText(prompt, localFallback) {
    var base = { success: true, project: PROJECT, generatedAt: new Date() };
    if (!isConfigured()) { base.source = 'fallback'; base.text = localFallback || ''; return base; }
    try { base.source = 'gemini'; base.text = callGemini_(prompt); return HumanReviewService.decorateResult('ai.text', base, base.text); }
    catch (e) { base.source = 'fallback'; base.text = localFallback || ''; base.error = String((e && e.message) || e); return base; }
  }

  return { isConfigured: isConfigured, generate: generate, generateText: generateText };
})();

/**
 * Ponto de entrada para o frontend (google.script.run.generateAiReport).
 * @param {Object=} payload { summary?, foco?, turma?, periodo? }
 * @return {{success:boolean, source:string, project:string, report:string, summary:Object}}
 */
function generateAiReport(payload) {
  return GeminiReportService.generate(payload || {});
}

/**
 * Proposta #4 — Texto acessível às famílias sobre o ciclo de acompanhamento
 * semanal e como apoiar a criança em casa, sem expor dados individuais.
 * @param {Object=} payload { turma? }
 * @return {{success:boolean, source:string, text:string}}
 */
function gerarTextoFamiliasCiclo(payload) {
  try {
    payload = payload || {};
    var turma = payload.turma ? (' da turma ' + payload.turma) : '';
    var prompt = [
      'Você é a coordenação pedagógica da Escola Classe 115 Norte (SEEDF, Brasília-DF).',
      'Escreva um texto acessível e acolhedor às famílias' + turma + ' explicando o que é o acompanhamento semanal (o "loop da semana"): registro de atividades, bem-estar e conquistas, com foco pedagógico.',
      'Explique como a família pode apoiar a criança em casa (rotina, escuta, incentivo).',
      'Importante: NÃO mencione medições individuais nem dados sensíveis de saúde; linguagem geral e orientadora; português do Brasil; 2 a 3 parágrafos curtos.'
    ].join('\n');
    var fallback = 'Prezadas famílias,\n\n' +
      'Durante a semana acompanhamos atividades, bem-estar e conquistas dos estudantes' + turma + ' — o nosso "loop da semana" — sempre com finalidade pedagógica. ' +
      'Vocês podem apoiar em casa mantendo uma rotina tranquila, ouvindo a criança sobre o seu dia e incentivando pequenas conquistas.\n\n' +
      'Qualquer dúvida, estamos à disposição na escola. Atenciosamente, Coordenação da EC 115 Norte.';
    return GeminiReportService.generateText(prompt, fallback);
  } catch (error) {
    Logger.log("Erro em gerarTextoFamiliasCiclo: " + error.message);
    throw error;
  }
}

