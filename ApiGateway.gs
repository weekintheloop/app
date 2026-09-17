/**
 * ApiGateway.gs — Gateway RPC unico da frota (consolidado em 2026-06-21).
 *
 * O ApiClient.html chama `google.script.run.apiCall(service, method, payload)`.
 * Este e o UNICO ponto de entrada `apiCall` do projeto (a colisao com
 * ApiGatewayStandard.gs foi eliminada).
 *
 * Login e sessao sao resolvidos por DESCOBERTA EM RUNTIME (typeof), espelhando
 * o FleetLoginCheck.gs (harness verde) — assim o gateway funciona com a funcao
 * de auth real de cada projeto sem hardcode. Texto plano no login (decisao de
 * frota): apenas delega; nao verifica nem gera hash.
 *
 * Convencao: switch(`${service}.${method}`); envelope de sucesso { ok:true, data },
 * de falha { ok:false, error:{ message } }. Unica rota publica: AuthService.login.
 */
function apiCall(service, method, payload) {
  try {
    var op = '';
    var request = {};

    if (arguments.length === 1 && typeof service === 'string') {
      op = service;
    } else if (arguments.length === 2 && typeof service === 'string' && typeof method !== 'string') {
      op = service;
      request = method || {};
    } else {
      op = String(service) + '.' + String(method);
      request = payload || {};
    }

    var publicCall = op === 'AuthService.login' || op === 'login';

    try {
      if (!publicCall && !gw_currentUser_(request)) {
        throw new Error('Sessao expirada. Faca login novamente.');
      }

      var data;
      var currentUser = gw_currentUser_(request);
      var defaultUserId = currentUser ? (currentUser.id || currentUser.userId || currentUser.username) : null;

      switch (op) {
        case 'AuthService.login':
        case 'login':
          data = gw_login_(
            String(request.username || '').trim(),
            String(request.password || '')
          );
          if (!gw_isLoginOk_(data)) throw new Error('Usuario ou senha invalidos.');
          data = gw_normalizeLogin_(data);
          break;
        case 'AuthService.logout':
        case 'logout':
          data = gw_logout_(request);
          if (!gw_isLogoutOk_(data)) throw new Error('Logout indisponível neste ambiente.');
          break;
        case 'SessionService.getCurrentUser':
        case 'getCurrentUser':
        case 'Api.getCurrentUser':
          data = currentUser;
          break;
        case 'UserManagementService.listAllUsersForAdmin':
        case 'listAllUsersForAdmin':
        case 'Api.listAllUsersForAdmin':
          gw_requireRole_(currentUser, ['admin', 'administrator']);
          data = listAllUsersForAdmin();
          break;
        case 'UserManagementService.createUserByAdmin':
        case 'createUserByAdmin':
        case 'Api.createUserByAdmin':
          gw_requireRole_(currentUser, ['admin', 'administrator']);
          data = createUserByAdmin(
            request.username,
            request.password,
            request.email,
            request.role
          );
          break;
        case 'UserManagementService.deleteUserByAdmin':
        case 'deleteUserByAdmin':
        case 'Api.deleteUserByAdmin':
          gw_requireRole_(currentUser, ['admin', 'administrator']);
          var delId = (typeof request === 'string' || typeof request === 'number') ? request : (request.id || request.userId);
          data = deleteUserByAdmin(delId);
          break;
        case 'FormsService.processPhysiologicalDataForm':
        case 'processPhysiologicalDataForm':
        case 'Api.processPhysiologicalDataForm':
          data = processPhysiologicalDataForm(request);
          break;
        case 'DashboardService.getDashboardOverview':
        case 'getDashboardOverview':
        case 'Api.getDashboardOverview':
          var targetUser = gw_scopedUserId_(request, currentUser);
          data = getDashboardOverview(targetUser);
          break;
        case 'DashboardService.getDashboardSummary':
        case 'getDashboardSummary':
        case 'Api.getDashboardSummary':
          var targetUserSummary = gw_scopedUserId_(request, currentUser);
          data = getDashboardSummary(targetUserSummary);
          break;
        case 'ChartService.getDashboardChartConfigs':
        case 'getDashboardChartConfigs':
        case 'Api.getDashboardChartConfigs':
          var targetUserChart = gw_scopedUserId_(request, currentUser);
          data = getDashboardChartConfigs(targetUserChart);
          break;
        default:
          throw new Error('Operacao de API nao permitida: ' + op);
      }

      return { ok: true, data: toClientSafe_(data) };
    } catch (apiError) {
      return {
        ok: false,
        error: { message: (apiError && apiError.message) || 'Erro interno do servidor.' }
      };
    }
  } catch (error) {
    Logger.log("Erro em apiCall: " + error.message);
    throw error;
  }
}


/**
 * Resolve o login na MESMA ordem do FleetLoginCheck.gs: a primeira funcao de
 * login existente vence. Tenta a forma posicional (u, p) e, se falhar, a forma
 * de objeto ({ username, password, senha, email }). Cobre as duas convencoes da frota.
 */
function gw_login_(username, password) {
  try {
    var entries = [];
    if (typeof AuthService !== 'undefined' && AuthService && typeof AuthService.login === 'function') {
      entries.push(function (form) { return AuthService.login.apply(AuthService, form); });
    }
    if (typeof loginWithPassword === 'function')   entries.push(function (form) { return loginWithPassword.apply(null, form); });
    if (typeof loginWithToken === 'function')      entries.push(function (form) { return loginWithToken.apply(null, form); });
    if (typeof processLoginRequest === 'function') entries.push(function (form) { return processLoginRequest.apply(null, form); });
    if (typeof doLogin === 'function')             entries.push(function (form) { return doLogin.apply(null, form); });
    if (typeof login === 'function')               entries.push(function (form) { return login.apply(null, form); });
    if (typeof authenticate === 'function')   entries.push(function (form) { return authenticate.apply(null, form); });
    if (typeof loginUser === 'function')      entries.push(function (form) { return loginUser.apply(null, form); });

    var positional = [username, password];
    var objectForm = [{ username: username, password: password, senha: password, email: username }];
    var last = null;
    for (var i = 0; i < entries.length; i++) {
      try {
        var r = entries[i](positional);
        if (gw_isLoginOk_(r)) return r;
        last = r;
        try {
          var r2 = entries[i](objectForm);
          if (gw_isLoginOk_(r2)) return r2;
          last = last || r2;
        } catch (ignoredObj) {}
      } catch (err) {
        last = last || { success: false, message: (err && err.message) || String(err) };
      }
    }
    return last;
  } catch (error) {
    Logger.log("Erro em gw_login_: " + error.message);
    throw error;
  }
}

/** Resolve o logout pela primeira funcao existente; nunca lanca. */
function gw_logout_(request) {
  try {
    request = request || {};
    var token = typeof request === 'string' ? request : (request.authToken || request.token || request.tok || '');
    if (token && typeof logoutWithToken === 'function') return logoutWithToken(token);
    if (typeof doLogout === 'function') return doLogout();
    if (typeof logout === 'function') return logout();
    if (typeof logoutUser === 'function') return logoutUser();
    if (typeof logoutWTL === 'function') return logoutWTL();
    if (typeof AuthService !== 'undefined' && AuthService && typeof AuthService.logoutUser === 'function') return AuthService.logoutUser();
    if (typeof logoutWithToken === 'function') return { success: false, message: 'Token de sessão não informado.' };
  } catch (error) {
    return { success: false, message: error.message || 'Não foi possível encerrar a sessão.' };
  }
  return { success: false, message: 'Serviço de logout não configurado.' };
}

function gw_isLogoutOk_(value) {
  if (value === true) return true;
  if (!value || typeof value !== 'object') return false;
  return value.success === true || value.ok === true;
}

/** Resolve o principal exclusivamente a partir do token da requisição. */
function gw_currentUser_(request) {
  try {
    request = request || {};
    var token = String(request.authToken || request.token || request.tok || '');
    if (!token || typeof isAuthenticatedByToken !== 'function' || !isAuthenticatedByToken(token)) return null;
    var session = typeof getSessionUserByToken_ === 'function'
      ? getSessionUserByToken_(token)
      : (typeof getSessionUser === 'function' ? getSessionUser(token) : null);
    if (!session) return null;
    return {
      id: String(session.id || session.userId || session.username || ''),
      username: String(session.username || session.id || ''),
      role: String(session.role || session.perfil || 'user').toLowerCase()
    };
  } catch (ignored) {}
  return null;
}

function gw_requireRole_(principal, allowedRoles) {
  var role = String(principal && principal.role || '').toLowerCase();
  if (allowedRoles.indexOf(role) === -1) throw new Error('Permissão insuficiente para esta operação.');
}

/** Restringe consultas de dashboard ao próprio usuário, salvo perfis de gestão. */
function gw_scopedUserId_(request, principal) {
  var requested = typeof request === 'string' ? request : (request && request.userId);
  requested = String(requested || '').trim();
  var ownId = String(principal && (principal.id || principal.userId || '') || '').trim();
  if (!ownId) throw new Error('Usuário autenticado sem identidade.');
  if (!requested || requested === ownId) return ownId;
  var role = String(principal.role || '').toLowerCase();
  if (role === 'admin' || role === 'administrator' || role === 'professor' || role === 'teacher') return requested;
  throw new Error('Você só pode consultar seus próprios dados.');
}

/** Normaliza o resultado do login para um booleano de sucesso (igual ao harness). */
function gw_isLoginOk_(r) {
  if (r === null || r === undefined || r === false) return false;
  if (typeof r === 'object') {
    if (r.success === false || r.ok === false) return false;
    if (r.success === true || r.ok === true) return true;
    if (r.token || r.sessionToken || r.redirectUrl || r.session) return true;
    if (r.user || r.id || r.username || r.role || r.perfil) return true;
    return false;
  }
  return !!r;
}


/**
 * Normaliza qualquer resultado de login aceito por gw_isLoginOk_ para o
 * envelope { success:true, user?:{}, token?:string } esperado pelo Login.html.
 * Sem esta etapa, funcoes que retornam { ok:true } ou o objeto de usuario
 * diretamente passam a validacao mas chegam ao cliente sem .success=true.
 */
function gw_normalizeLogin_(r) {
  if (!r || typeof r !== 'object') return { success: false, message: 'Resposta de autenticação inválida.' };
  if ('success' in r) return r;
  if ('ok' in r) {
    var out = { success: !!r.ok };
    if (r.user)         out.user         = r.user;
    if (r.principal)    out.user         = r.principal;
    if (r.token)        out.token        = r.token;
    if (r.sessionToken) out.sessionToken = r.sessionToken;
    if (r.message)      out.message      = r.message;
    return out;
  }
  if (r.id || r.username || r.role || r.perfil) return { success: true, user: r };
  if (r.token || r.sessionToken) return { success: true, token: r.token || r.sessionToken };
  return { success: false, message: 'Resposta de autenticação sem identidade ou token.' };
}

/** Sanitiza dados para o cliente: remove credenciais, serializa Date, recursivo. */
function toClientSafe_(value) {
  try {
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map(toClientSafe_);
    if (value && typeof value === 'object') {
      var safe = {};
      Object.keys(value).forEach(function (key) {
        if (key === 'password' || key === 'passwordHash' || key === 'senha' || key === 'senha_hash') return;
        safe[key] = toClientSafe_(value[key]);
      });
      return safe;
    }
    return value;
  } catch (error) {
    Logger.log("Erro em toClientSafe_: " + error.message);
    throw error;
  }
}
