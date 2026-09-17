/**
 * @file FormValidationService.gs
 * @description Serviço dedicado à validação de dados de formulários recebidos do frontend.
 *              Centraliza as regras de validação para diferentes tipos de formulários, garantindo a integridade dos dados antes do processamento.
 * @integration
 *   - `FormsService.gs`: Utiliza para validar os dados antes de processar as submissões.
 *   - `Validation.gs`: Pode usar funções de validação genéricas.
 */

function validateLoginForm(formData) {
  try {
    var errors = {};
    if (!formData.username || formData.username.trim() === '') {
      errors.username = 'O nome de usuário é obrigatório.';
    }
    if (!formData.password || formData.password.trim() === '') {
      errors.password = 'A senha é obrigatória.';
    }
    return { isValid: Object.keys(errors).length === 0, errors: errors };
  } catch (error) {
    Logger.log("Erro em validateLoginForm: " + error.message);
    throw error;
  }
}

function validateRegistrationForm(formData) {
  try {
    var errors = {};
    var usernameValidation = Validation.validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.message;
    }
    var passwordValidation = Validation.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
    if (!formData.email || !Utils.isValidEmail(formData.email)) {
      errors.email = 'O e-mail é inválido.';
    }
    // Adicionar verificação de senha repetida, etc.
    return { isValid: Object.keys(errors).length === 0, errors: errors };
  } catch (error) {
    Logger.log("Erro em validateRegistrationForm: " + error.message);
    throw error;
  }
}

function validatePhysiologicalDataEntry(formData) {
  try {
    var errors = {};
    if (!formData.userId) {
      errors.userId = 'ID do usuário é obrigatório.';
    }
    if (!formData.timestamp) {
      errors.timestamp = 'Timestamp é obrigatório.';
    }
    if (isNaN(formData.eegAlpha) || formData.eegAlpha < 0) {
      errors.eegAlpha = 'EEG Alpha deve ser um número positivo.';
    }
    // Adicionar validações para outros campos fisiológicos
    return { isValid: Object.keys(errors).length === 0, errors: errors };
  } catch (error) {
    Logger.log("Erro em validatePhysiologicalDataEntry: " + error.message);
    throw error;
  }
}
