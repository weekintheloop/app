/**
 * @file SessionManager.gs
 * @description Gerencia o estado da sessão do usuário.
 *
 * BUG CORRIGIDO (FROTA-17): A implementação anterior usava
 * PropertiesService.getUserProperties(), que em deployments "Execute as: Me"
 * pertence ao DONO DO SCRIPT, não ao visitante. Quando o desenvolvedor fazia
 * login durante testes, a sessão ficava salva e todos os visitantes entravam
 * direto sem ver a tela de login.
 *
 * SOLUÇÃO: sessões gravadas em ScriptProperties (por instância de deployment,
 * não por usuário Google), com chave prefixada WEEKLOOP_SESS_.
 *
 * @integration
 *   - `AuthService.gs`: Utiliza para iniciar e encerrar sessões.
 *   - Outros serviços (.gs): Acessam para obter informações do usuário logado.
 */

var WEEKLOOP_SESS_KEY_ = 'WEEKLOOP_SESS_activeUserId';

function setSessionUser(userId) {
  try {
    PropertiesService.getScriptProperties()
      .setProperty(WEEKLOOP_SESS_KEY_, String(userId || ''));
  } catch (error) {
    Logger.log("Erro em setSessionUser: " + error.message);
    throw error;
  }
}

function getSessionUser() {
  try {
    return PropertiesService.getScriptProperties()
      .getProperty(WEEKLOOP_SESS_KEY_);
  } catch (error) {
    Logger.log("Erro em getSessionUser: " + error.message);
    throw error;
  }
}

function clearSession() {
  try {
    PropertiesService.getScriptProperties()
      .deleteProperty(WEEKLOOP_SESS_KEY_);
  } catch (error) {
    Logger.log("Erro em clearSession: " + error.message);
    throw error;
  }
}
