/**
 * @file NotificationService.gs
 * @description Gerencia o envio de notificações aos usuários, podendo utilizar diferentes canais como e-mail ou alertas na interface.
 * @integration
 *   - `EmailService.gs`: Utiliza para enviar notificações por e-mail.
 *   - `SessionManager.gs`: Pode ser usado para identificar o usuário logado para notificações na UI.
 */

function sendUserNotification(userId, message) {
  // Lógica para enviar uma notificação para um usuário específico
  // Pode ser um e-mail, um alerta na UI na próxima vez que o usuário logar, etc.
  var user = UserService.getUserProfileById(userId);
  if (user && user.email) {
    EmailService.sendEmail(user.email, "Notificação do Sistema PICS", message);
  }
  logInfo("Notificação enviada para o usuário %s: %s", userId, message);
}

function sendAdminNotification(message) {
  // Lógica para enviar uma notificação para todos os administradores
  // Ex: Erros críticos, atividades suspeitas
  // var admins = UserService.getUsersByRole("admin");
  // admins.forEach(function(admin) { EmailService.sendEmail(admin.email, "Alerta de Administração PICS", message); });
  logWarning("Notificação de ADMIN: %s", message);
}
