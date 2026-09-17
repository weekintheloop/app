/**
 * @file ApiEndpoints.gs
 * @description Define e gerencia os endpoints da API que o frontend pode chamar via `google.script.run`.
 *              Atua como uma camada de comunicação entre o cliente (HTML/JS) e a lógica de negócios (outros serviços GAS).
 * @integration
 *   - `Code.gs`: Pode ser invocado por `doPost` para rotear requisições de API.
 *   - `AuthService.gs`: Utiliza para verificar a autenticação antes de executar operações sensíveis.
 *   - `DataService.gs`: Invoca funções para operações CRUD de dados fisiológicos.
 *   - `UserService.gs`: Invoca funções para operações CRUD de usuários.
 */

function handleApiRequest(request) {
  request = request || {};
  var token = String(request.authToken || request.token || request.tok || '');
  var session = token && typeof isAuthenticatedByToken === 'function' && isAuthenticatedByToken(token)
    ? getSessionUserByToken_(token)
    : null;
  if (!session) {
    return { success: false, message: 'Não autenticado.' };
  }

  var actorId = String(session.id || session.userId || session.username || '');
  var role = String(session.role || '').toLowerCase();
  var requestedId = String(request.userId || actorId);
  if (requestedId !== actorId && role !== 'admin' && role !== 'administrator' && role !== 'professor' && role !== 'teacher') {
    return { success: false, message: 'Acesso negado aos dados de outro usuário.' };
  }

  switch (request.action) {
    case 'getPhysiologicalData':
      return { success: true, data: DataService.getPhysiologicalDataByUserId(requestedId) };
    case 'addPhysiologicalData':
      return { success: true, data: DataService.addPhysiologicalData(request.data) };
    case 'updateUserProfile':
      return { success: true, data: UserService.updateUserProfile(requestedId, request.userData) };
    // ... outros endpoints
    default:
      return { success: false, message: 'Ação de API desconhecida.' };
  }
}

/**
 * Carrega dados iniciais do dashboard.
 * Aceita o token via parâmetro para compatibilidade com auth baseada em ScriptProperties.
 * @param {string} [tok] Token da sessão (passado pelo frontend a partir do URL ?page=app#tok=).
 */
function getInitialAppData(tok) {
  // Tenta auth por token (fluxo principal: Login.html → loginWithToken → ?page=app#tok=)
  var session = null;
  if (tok && typeof isAuthenticatedByToken === 'function' && isAuthenticatedByToken(tok)) {
    session = (typeof getSessionUserByToken_ === 'function')
      ? getSessionUserByToken_(tok)
      : ((typeof getSessionUser === 'function') ? getSessionUser(tok) : null);
  }
  if (!session) {
    return { success: false, message: 'Sessão inválida. Faça login novamente.' };
  }

  var currentUser = {
    id:       session.userId   || session.id       || session.username || 'unknown',
    username: session.username || session.name     || 'Usuário',
    name:     session.nome     || session.name     || session.username || 'Usuário',
    role:     session.role     || 'USER',
    email:    session.email    || ''
  };

  // Resumo semanal — conta registros da planilha principal se configurada
  var weekSummary = { totalRegistros: 0, ultimaAtualizacao: null, status: 'ok' };
  try {
    if (typeof getAllPhysiologicalRecords_ === 'function') {
      var records = getAllPhysiologicalRecords_();
      weekSummary.totalRegistros = records.length;
      if (records.length) {
        var last = records[records.length - 1];
        weekSummary.ultimaAtualizacao = last.Timestamp || last.timestamp || null;
      }
    }
  } catch (e) { weekSummary.status = 'erro'; }

  return {
    success: true,
    currentUser: currentUser,
    weekSummary: weekSummary
  };
}
