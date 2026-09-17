/**
 * @file AdminService.gs
 * @description Fornece funções administrativas para gerenciar usuários, configurações e outros aspectos do sistema.
 *              Apenas usuários com papel de 'admin' devem ter acesso a estas funções.
 * @integration
 *   - `UserService.gs`: Utiliza para gerenciar perfis de usuário.
 *   - `SettingsService.gs`: Utiliza para gerenciar configurações da aplicação.
 *   - `Permissions.gs`: Verifica se o usuário tem permissões de administrador.
 *   - `BackupService.gs`: Pode invocar funções de backup.
 */


function changeUserRole(userId, newRole, token) {
  try {
    var auth = requireAdminToken_(token);
    if (!auth.success) return auth;
    var normalizedUserId = String(userId || '').trim();
    var normalizedRole = String(newRole || '').trim().toLowerCase();
    var allowedRoles = ['admin', 'teacher', 'user', 'student'];
    if (!normalizedUserId) return { success: false, message: 'Usuário não informado.' };
    if (allowedRoles.indexOf(normalizedRole) === -1) {
      return { success: false, message: 'Papel inválido.' };
    }
    return updateUserProfile(normalizedUserId, { role: normalizedRole });
  } catch (error) {
    Logger.log('Erro em changeUserRole: ' + error.message);
    return { success: false, message: error.message };
  }
}

function getSystemSettings(token) {
  try {
    var auth = requireAdminToken_(token);
    if (!auth.success) return auth;
    var properties = PropertiesService.getScriptProperties().getProperties();
    var allowedSettings = adminSettingRules_();
    var settings = {};
    Object.keys(allowedSettings).forEach(function (name) {
      settings[name] = Object.prototype.hasOwnProperty.call(properties, name)
        ? properties[name]
        : allowedSettings[name].defaultValue;
    });
    return { success: true, data: settings };
  } catch (error) {
    Logger.log('Erro em getSystemSettings: ' + error.message);
    return { success: false, message: error.message };
  }
}

function updateSystemSetting(settingName, settingValue, token) {
  try {
    var auth = requireAdminToken_(token);
    if (!auth.success) return auth;
    var name = String(settingName || '').trim();
    var rules = adminSettingRules_();
    if (!Object.prototype.hasOwnProperty.call(rules, name)) {
      return { success: false, message: 'Configuração não permitida.' };
    }
    var value = normalizeAdminSetting_(settingValue, rules[name]);
    setAppSetting(name, value);
    return { success: true, data: { name: name, value: value } };
  } catch (error) {
    Logger.log('Erro em updateSystemSetting: ' + error.message);
    return { success: false, message: error.message };
  }
}

function requireAdminToken_(token) {
  if (!token || typeof isAuthenticatedByToken !== 'function' || !isAuthenticatedByToken(token)) {
    return { success: false, message: 'Sessão inválida ou expirada.' };
  }
  // getSessionUser pertence ao legado de sessão ativa (sem token). O
  // resolvedor por token tem nome próprio para não ser sobrescrito por ele.
  var user = typeof getSessionUserByToken_ === 'function'
    ? getSessionUserByToken_(token)
    : (typeof getSessionUser === 'function' ? getSessionUser(token) : null);
  if (!user || String(user.role || '').toLowerCase() !== 'admin') {
    return { success: false, message: 'Acesso restrito a administradores.' };
  }
  return { success: true, data: user };
}

function adminSettingRules_() {
  return {
    APP_NAME: { type: 'text', min: 3, max: 120, defaultValue: 'Week In The Loop' },
    LOCALE: { type: 'text', min: 2, max: 12, defaultValue: 'pt-BR' },
    LOG_RETENTION_DAYS: { type: 'number', min: 30, max: 365, defaultValue: '90' },
    PUBLIC_REGISTRATION: { type: 'boolean', defaultValue: 'false' },
    MAINTENANCE_MODE: { type: 'boolean', defaultValue: 'false' }
  };
}

function normalizeAdminSetting_(settingValue, rule) {
  if (rule.type === 'boolean') {
    var normalizedBoolean = String(settingValue).toLowerCase();
    if (settingValue !== true && settingValue !== false && normalizedBoolean !== 'true' && normalizedBoolean !== 'false') {
      throw new Error('Valor booleano inválido.');
    }
    return settingValue === true || normalizedBoolean === 'true' ? 'true' : 'false';
  }
  if (rule.type === 'number') {
    var numberValue = Number(settingValue);
    if (!isFinite(numberValue) || numberValue < rule.min || numberValue > rule.max) {
      throw new Error('Valor numérico fora do intervalo permitido.');
    }
    return String(Math.round(numberValue));
  }
  var textValue = String(settingValue == null ? '' : settingValue).trim();
  if (textValue.length < rule.min || textValue.length > rule.max) {
    throw new Error('Texto fora do tamanho permitido.');
  }
  return textValue;
}
