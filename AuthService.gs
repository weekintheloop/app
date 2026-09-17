/**
 * @file AuthService.gs
 * @description Gerencia todas as operações relacionadas à autenticação de usuários, incluindo registro, login, logout e verificação de sessão.
 *              As credenciais são armazenadas em texto plano em uma aba específica do Google Sheet, conforme solicitado.
 * @integration
 *   - `SheetService.gs`: Utiliza para ler e escrever dados de usuários na planilha.
 *   - `Config.gs`: Acessa o SPREADSHEETS_ID para identificar a planilha de usuários.
 *   - `UserService.gs`: Pode interagir para criar ou buscar detalhes de usuários.
 *   - `SessionManager.gs`: Gerencia o estado da sessão do usuário.
 * @warning
 *   - **Segurança:** Este módulo armazena e processa senhas em texto plano, o que é uma prática **altamente insegura** e não recomendada para ambientes de produção. Em um cenário real, senhas deveriam ser hasheadas e salgadas.
 */

function registerUser(username, password, email, role) {
  if (getUserRecordByUsername_(username)) {
    return { success: false, message: 'Usuário já existe.' };
  }

  var user = createUserProfile({
    username: username,
    password: password,
    email: email,
    role: role || 'user'
  });

  return { success: true, message: 'Usuário registrado com sucesso.', user: sanitizeUser_(user) };
}

function loginUser(username, password) {
  try {
    var user = getUserRecordByUsername_(username);
    if (!user || String(getUserPassword_(user)) !== String(password)) {
      return { success: false, message: 'Credenciais inválidas.' };
    }

    setSessionUser(getUserId_(user));
    return {
      success: true,
      message: 'Login realizado com sucesso.',
      currentUser: sanitizeUser_(user),
      user: sanitizeUser_(user)
    };
  } catch (error) {
    Logger.log("Erro em loginUser: " + error.message);
    throw error;
  }
}

function logoutUser() {
  clearSession();
  return { success: true, message: 'Sessão encerrada.' };
}

function isAuthenticated() {
  return Boolean(getSessionUser());
}

function getCurrentUser() {
  var activeUserId = getSessionUser();
  if (!activeUserId) return null;
  return sanitizeUser_(getUserProfileById(activeUserId));
}
