/**
 * @file Validation.gs
 * @description Fornece funções para validar dados de entrada em diferentes contextos da aplicação.
 *              Ajuda a garantir a integridade dos dados antes de serem processados ou armazenados.
 * @integration
 *   - `AuthService.gs`: Valida credenciais de usuário.
 *   - `DataService.gs`: Valida dados fisiológicos antes de serem adicionados ou atualizados.
 *   - `UserService.gs`: Valida dados de perfil de usuário.
 */

function validateUsername(username) {
  if (!username || username.length < 3) {
    return { isValid: false, message: "O nome de usuário deve ter pelo menos 3 caracteres." };
  }
  return { isValid: true };
}

function validatePassword(password) {
  if (!password || password.length < 6) {
    return { isValid: false, message: "A senha deve ter pelo menos 6 caracteres." };
  }
  return { isValid: true };
}

function validatePhysiologicalData(data) {
  // Exemplo de validação para dados fisiológicos
  if (!data.userId || !data.timestamp || typeof data.eegAlpha === 'undefined') {
    return { isValid: false, message: "Dados fisiológicos incompletos." };
  }
  // Adicionar mais regras de validação conforme necessário
  return { isValid: true };
}
