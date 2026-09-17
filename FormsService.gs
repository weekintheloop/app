/**
 * @file FormsService.gs
 * @description Gerencia o processamento de submissões de formulários do frontend, incluindo a extração e validação dos dados.
 *              Atua como um intermediário entre os formulários HTML e os serviços de dados.
 * @integration
 *   - `ApiEndpoints.gs`: Pode ser invocado por endpoints de API para processar dados de formulário.
 *   - `Validation.gs`: Utiliza para validar os dados recebidos dos formulários.
 *   - `DataService.gs`, `UserService.gs`, etc.: Invoca funções para persistir os dados processados.
 */

function processLoginForm(formObject) {
  // Processa os dados de um formulário de login
  var validationResult = Validation.validateUsername(formObject.username);
  if (!validationResult.isValid) return { success: false, message: validationResult.message };
  validationResult = Validation.validatePassword(formObject.password);
  if (!validationResult.isValid) return { success: false, message: validationResult.message };

  return AuthService.loginUser(formObject.username, formObject.password);
}

function processRegistrationForm(formObject) {
  // Processa os dados de um formulário de registro
  var validationResult = Validation.validateUsername(formObject.username);
  if (!validationResult.isValid) return { success: false, message: validationResult.message };
  validationResult = Validation.validatePassword(formObject.password);
  if (!validationResult.isValid) return { success: false, message: validationResult.message };
  validationResult = Utils.isValidEmail(formObject.email);
  if (!validationResult) return { success: false, message: "Email inválido." };

  return AuthService.registerUser(formObject.username, formObject.password, formObject.email, "user");
}

function processPhysiologicalDataForm(formObject) {
  // Processa os dados de um formulário de entrada de dados fisiológicos
  var validationResult = Validation.validatePhysiologicalData(formObject);
  if (!validationResult.isValid) return { success: false, message: validationResult.message };

  return DataService.addPhysiologicalData(formObject);
}
