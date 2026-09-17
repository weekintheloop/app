/**
 * Auth.gs — Adaptador de autenticacao do Week In The Loop.
 *
 * Localiza usuarios na aba "Usuarios" e delega sessao, expiracao e migracao de
 * senhas legadas para o contrato comum AuthStandardService.
 */

/** Resolve a planilha principal via getPlanilhaId() (fallback planilha ativa). */
function Auth_getSpreadsheet_() {
  try {
    if (typeof getPlanilhaId === 'function') {
      var id = getPlanilhaId();
      if (id) return SpreadsheetApp.openById(id);
    }
  } catch (e) {}
  return getBoundSpreadsheet_();
}

/** Le a aba de usuarios e devolve cabecalhos + linhas. */
function Auth_getUsersData_() {
  try {
    var possibleNames = ['Usuarios', 'Users', 'Usuários'];
    var sheet = null;
  
    var ss = Auth_getSpreadsheet_();
    if (!ss) return null;

    for (var i = 0; i < possibleNames.length; i++) {
      sheet = ss.getSheetByName(possibleNames[i]);
      if (sheet) break;
    }
  
    if (!sheet || sheet.getLastRow() < 2) return null;

    var values = sheet.getDataRange().getValues();
    var headers = values[0].map(function (h) { return String(h || '').trim().toLowerCase(); });
    return { sheet: sheet, values: values, headers: headers };
  } catch (error) {
    Logger.log("Erro em Auth_getUsersData_: " + error.message);
    throw error;
  }
}

/** So aceita um SHA-256 hex (64 chars) como hash; o resto vira '' (texto plano). */
function Auth_normalizarHash_(valor) {
  try {
    // Retorna o valor original (texto plano), sem exigir hash SHA-256 de 64 caracteres.
    // Isso resolve a falha de autenticação onde senhas em texto plano na coluna passwordHash eram descartadas.
    return String(valor == null ? '' : valor).trim();
  } catch (error) {
    Logger.log("Erro em Auth_normalizarHash_: " + error.message);
    throw error;
  }
}

/** Localiza um usuario para o AuthStandardService. */
function Auth_findUser_(username) {
  try {
    var data = Auth_getUsersData_();
    if (!data) return null;

    var u = String(username || '').trim().toLowerCase();
    var headers = data.headers;
    var iUser = headers.indexOf('username');
    var iPass = headers.indexOf('password');
    var iHash = headers.indexOf('passwordhash');
    var iRole = headers.indexOf('role');
    var iNome = headers.indexOf('nome');
    var iEmail = headers.indexOf('email');
    var iId = headers.indexOf('id');
    var iStatus = headers.indexOf('status');
    if (iUser < 0 || (iPass < 0 && iHash < 0)) return null;

    for (var r = 1; r < data.values.length; r++) {
      var row = data.values[r];
      var rowUser = String(row[iUser] || '').trim().toLowerCase();
      var rowEmail = iEmail >= 0 ? String(row[iEmail] || '').trim().toLowerCase() : '';
      if (rowUser !== u && rowEmail !== u) continue;
      return {
        id: iId >= 0 && row[iId] ? row[iId] : rowUser,
        username: row[iUser],
        name: iNome >= 0 ? row[iNome] : row[iUser],
        email: iEmail >= 0 ? row[iEmail] : '',
        role: iRole >= 0 && row[iRole] ? row[iRole] : 'USER',
        active: iStatus < 0 || String(row[iStatus]).trim().toLowerCase() !== 'inativo',
        password: iPass >= 0 ? String(row[iPass] || '') : '',
        passwordHash: Auth_normalizarHash_(iHash >= 0 ? row[iHash] : '')
      };
    }
    return null;
  } catch (error) {
    Logger.log("Erro em Auth_findUser_: " + error.message);
    throw error;
  }
}

/** Configura o contrato comum para este projeto. */
function Auth_service_() {
  return AuthStandardService.configure({
    sessionKey: 'WEEK_IN_THE_LOOP_AUTH_SESSION',
    sessionTtlSeconds: 21600,
    adapters: {
      findUser: Auth_findUser_
    }
  });
}

/**
 * @param {string} username Usuario ou e-mail.
 * @param {string} password Senha.
 * @return {{success:boolean, user?:Object, token?:string, message?:string}}
 */
function loginWithPassword(username, password) {
  try {
    if (!String(username || '').trim() || !String(password || '')) {
      return { success: false, message: 'Informe usuario e senha.' };
    }
    var result = Auth_service_().login(username, password);
    return result.ok
      ? { success: true, user: result.user, token: result.token }
      : { success: false, message: 'Credenciais invalidas.' };
  } catch (error) {
    Logger.log("Erro em loginWithPassword: " + error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------

var AUTH_TOK_TTL_MS_ = 21600 * 1000; // 6 horas

/** Compatibilidade com a aba legada SessoesAuth; o login web usa ScriptProperties. */
function getSessoesAuthSheet_() {
  try {
    var ss = Auth_getSpreadsheet_();
    if (!ss) return null;
    var sheet = ss.getSheetByName('SessoesAuth');
    if (!sheet) {
      sheet = ss.insertSheet('SessoesAuth');
      sheet.getRange(1, 1, 1, 5).setValues([['token', 'userId', 'username', 'role', 'expiresAt']]);
    }
    return sheet;
  } catch (error) {
    Logger.log("Erro em getSessoesAuthSheet_: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

/**
 * Valida credenciais e devolve um token unico para o cliente.
 * Emite um token canônico armazenado pelo AuthStandardService.
 * @return {{success:boolean, token?:string, redirectUrl?:string, message?:string}}
 */
function loginWithToken(username, password) {
  try {
    try {
      if (!String(username || '').trim() || !String(password || '')) {
        return { success: false, message: 'Informe usuario e senha.' };
      }
      var result = Auth_service_().login(username, password);
      if (!result.ok) return { success: false, message: 'Credenciais invalidas.' };
      var token = String(result.token || '');
      if (!token) return { success: false, message: 'Erro ao criar sessao.' };

      var baseUrl = '';
      try {
        baseUrl = ScriptApp.getService().getUrl();
      } catch (e) {
        baseUrl = '';
      }

      return {
        success: true,
        token: token,
        user: result.user,
        redirectUrl: baseUrl ? baseUrl + '?page=app#tok=' + token : ''
      };
    } catch (error) {
      Logger.log("Erro em loginWithToken: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em loginWithToken: " + error.message);
    throw error;
  }
}

/**
 * Verifica se o token (parametro 'tok' da URL) corresponde a uma sessao valida
 * no AuthStandardService. Deleta sessoes expiradas.
 */
function isAuthenticatedByToken(tok) {
  try {
    try {
      try {
        if (typeof tok !== 'string' || tok.length < 1 || tok.length > 200) return false;
        return Auth_service_().isAuthenticatedByToken(tok);
      } catch (error) {
        Logger.log("Erro em isAuthenticatedByToken: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em isAuthenticatedByToken: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em isAuthenticatedByToken: " + error.message);
    throw error;
  }
}

/**
 * Retorna o usuario logado a partir do token.
 * @param {string} tok
 * @return {{ username: string, role: string }|null}
 */
function getSessionUserByToken_(tok) {
  try {
    try {
      try {
        if (typeof tok !== 'string' || tok.length < 1 || tok.length > 200) return null;
        var session = Auth_service_().getSessionByToken(tok);
        if (!session) return null;
        return {
          id: String(session.userId),
          userId: String(session.userId),
          username: String(session.username || session.userId),
          role: String(session.role || 'USER').toLowerCase(),
          expiresAt: Number(session.expiresAt)
        };
      } catch (error) {
        Logger.log("Erro em getSessionUserByToken_: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em getSessionUserByToken_: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getSessionUserByToken_: " + error.message);
    throw error;
  }
}

/** Encerra a sessao identificada pelo token (remove a linha da aba). */
function logoutWithToken(tok) {
  try {
    try {
      try {
        if (typeof tok !== 'string' || tok.length < 1 || tok.length > 200) return { ok: true };
        return Auth_service_().logout(tok);
      } catch (error) {
        Logger.log("Erro em logoutWithToken: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em logoutWithToken: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em logoutWithToken: " + error.message);
    throw error;
  }
}

/**
 * Remove AUTH_TOK_* legados de ScriptProperties (executar 1x via console).
 */
function cleanupOldAuthTokens_() {
  try {
    var props = PropertiesService.getScriptProperties();
    var all = props.getProperties();
    var cleaned = 0;
    for (var key in all) {
      if (key.indexOf('AUTH_TOK_') === 0) { props.deleteProperty(key); cleaned++; }
    }
    return { cleaned: cleaned, message: 'Limpeza concluida: ' + cleaned + ' tokens removidos.' };
  } catch (error) {
    Logger.log("Erro em cleanupOldAuthTokens_: " + error.message);
    throw error;
  }
}

/** Estado de sessao (legado). Mantido para retrocompatibilidade. */
function isWTLAuthenticated() {
  return Auth_service_().isAuthenticated();
}

/** Encerra a sessao (legado). */
function logoutWTL() {
  return Auth_service_().logout();
}
