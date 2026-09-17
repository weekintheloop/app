/**
 * @file Utils.gs
 * @description Contém funções utilitárias gerais que podem ser usadas por vários serviços da aplicação.
 *              Inclui funções para validação básica, formatação de dados, e outras operações auxiliares.
 * @integration
 *   - Diversos serviços (.gs) que necessitam de funcionalidades auxiliares.
 */

function isValidEmail(email) {
  // Valida se a string fornecida é um formato de e-mail válido
  return /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);
}

function formatTimestamp(date) {
  try {
    // Formata um objeto Date para uma string de timestamp padronizada
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  } catch (error) {
    Logger.log("Erro em formatTimestamp: " + error.message);
    throw error;
  }
}

function generateUniqueId() {
  // Gera um ID único simples (para fins de exemplo, não robusto para produção)
  return Utilities.getUuid();
}
