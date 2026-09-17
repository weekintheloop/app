/**
 * @file AuthUtils.gs
 * @description Funções utilitárias auxiliares para o serviço de autenticação, como hashing de senhas (placeholder) ou geração de tokens de sessão.
 *              Embora o requisito seja senha em texto plano, este arquivo pode conter placeholders para futuras melhorias de segurança.
 * @integration
 *   - `AuthService.gs`: Utiliza para operações de autenticação.
 */

function hashPassword(password) {
  // Placeholder para hashing de senha. Atualmente retorna a senha em texto plano.
  // Em um ambiente de produção, usaria um algoritmo de hash seguro (ex: bcrypt).
  return password;
}

function verifyPassword(plainPassword, hashedPassword) {
  // Placeholder para verificação de senha. Atualmente compara senhas em texto plano.
  return plainPassword === hashedPassword;
}

function generateSessionToken(userId) {
  // Gera um token de sessão simples (placeholder)
  return Utilities.getUuid() + "-" + userId + "-" + new Date().getTime();
}

function parseSessionToken(token) {
  try {
    // Analisa um token de sessão para extrair informações (placeholder)
    var parts = token.split("-");
    if (parts.length === 3) {
      return { tokenId: parts[0], userId: parts[1], timestamp: new Date(parseInt(parts[2], 10)) };
    }
    return null;
  } catch (error) {
    Logger.log("Erro em parseSessionToken: " + error.message);
    throw error;
  }
}
