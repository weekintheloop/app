/**
 * @file HtmlSanitizer.gs
 * @description Fornece funções para sanitizar strings HTML, removendo tags e atributos potencialmente perigosos.
 *              Essencial para prevenir ataques de Cross-Site Scripting (XSS) ao exibir conteúdo gerado pelo usuário.
 * @integration
 *   - `HtmlService.gs`: Pode ser usado antes de exibir conteúdo dinâmico.
 *   - `FeedbackService.gs`: Sanitiza feedback do usuário antes de armazenar ou exibir.
 */

function sanitizeHtml(htmlString) {
  try {
    // Remove tags HTML e atributos perigosos de uma string.
    // Esta é uma implementação simplificada e pode não ser exaustiva para todos os casos de XSS.
    // Para segurança robusta, considere bibliotecas de sanitização mais completas ou frameworks que lidam com isso.
    var sanitized = htmlString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""); // Remove tags <script>
    sanitized = sanitized.replace(/<[^>]+>/g, ""); // Remove todas as outras tags HTML
    return sanitized;
  } catch (error) {
    Logger.log("Erro em sanitizeHtml: " + error.message);
    throw error;
  }
}

function escapeHtml(text) {
  try {
    // Escapa caracteres HTML especiais para exibição segura.
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  } catch (error) {
    Logger.log("Erro em escapeHtml: " + error.message);
    throw error;
  }
}
