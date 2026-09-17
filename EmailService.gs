/**
 * @file EmailService.gs
 * @description Fornece funcionalidades para o envio de e-mails, como notificações, recuperação de senha ou confirmações.
 *              Utiliza o serviço `MailApp` do Google Apps Script.
 * @integration
 *   - `AuthService.gs`: Pode ser usado para enviar e-mails de recuperação de senha.
 *   - `NotificationService.gs`: Pode usar para enviar notificações por e-mail.
 */

function sendEmail(recipient, subject, body) {
  try {
    MailApp.sendEmail(recipient, subject, body);
    logInfo("Email enviado para %s com sucesso.", recipient);
    return { success: true, message: "Email enviado." };
  } catch (e) {
    logError("Falha ao enviar email para %s: %s", recipient, e.message);
    return { success: false, message: "Falha ao enviar email." };
  }
}

