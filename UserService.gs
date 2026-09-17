/**
 * @file UserService.gs
 * @description Fornece funções de alto nível para gerenciar usuários, como criar, buscar, atualizar e excluir perfis de usuário.
 *              Abstrai a interação direta com a planilha, utilizando o `SheetService.gs`.
 * @integration
 *   - `SheetService.gs`: Utiliza para realizar operações CRUD na aba de usuários da planilha.
 *   - `AuthService.gs`: Pode ser invocado para verificar a existência de usuários durante o registro ou login.
 *   - `Config.gs`: Acessa o SPREADSHEETS_ID e o nome da aba de usuários.
 */

function createUserProfile(userData) {
  try {
    var user = normalizeUserRecord_(userData);

    if (isSpreadsheetConfigured()) {
      appendRow(getSpreadsheetId(), getUsersSheetName(), user);
      return user;
    }

    var users = getAllUserRecords_().filter(function(existingUser) {
      return getUserId_(existingUser) !== user.id;
    });
    users.push(user);
    saveFallbackUsers_(users);
    return user;
  } catch (error) {
    Logger.log("Erro em createUserProfile: " + error.message);
    throw error;
  }
}

function getUserProfileById(userId) {
  try {
    var user = getAllUserRecords_().find(function(existingUser) {
      return String(getUserId_(existingUser)) === String(userId);
    });
    return user ? sanitizeUser_(user) : null;
  } catch (error) {
    Logger.log("Erro em getUserProfileById: " + error.message);
    throw error;
  }
}

function getUserProfileByUsername(username) {
  var user = getUserRecordByUsername_(username);
  return user ? sanitizeUser_(user) : null;
}

function updateUserProfile(userId, newUserData) {
  try {
    var userData = newUserData || {};

    if (isSpreadsheetConfigured()) {
      var row = findRowByColumnValue(getSpreadsheetId(), getUsersSheetName(), 'id', userId);
      if (!row) return { success: false, message: 'Usuário não encontrado.' };
      updateRow(getSpreadsheetId(), getUsersSheetName(), row.rowIndex, userData);
      return { success: true, user: getUserProfileById(userId) };
    }

    var updatedUser = null;
    var users = getAllUserRecords_().map(function(existingUser) {
      if (String(getUserId_(existingUser)) !== String(userId)) return existingUser;
      updatedUser = normalizeUserRecord_(Object.assign({}, existingUser, userData, { id: getUserId_(existingUser) }));
      return updatedUser;
    });
    saveFallbackUsers_(users);
    return updatedUser ? { success: true, user: sanitizeUser_(updatedUser) } : { success: false, message: 'Usuário não encontrado.' };
  } catch (error) {
    Logger.log("Erro em updateUserProfile: " + error.message);
    throw error;
  }
}

function deleteUserProfile(userId) {
  try {
    if (isSpreadsheetConfigured()) {
      var row = findRowByColumnValue(getSpreadsheetId(), getUsersSheetName(), 'id', userId);
      return row ? deleteRow(getSpreadsheetId(), getUsersSheetName(), row.rowIndex) : false;
    }

    var users = getAllUserRecords_().filter(function(existingUser) {
      return String(getUserId_(existingUser)) !== String(userId);
    });
    saveFallbackUsers_(users);
    return true;
  } catch (error) {
    Logger.log("Erro em deleteUserProfile: " + error.message);
    throw error;
  }
}

function getAllUsers() {
  try {
    return getAllUserRecords_().map(sanitizeUser_);
  } catch (error) {
    Logger.log("Erro em getAllUsers: " + error.message);
    throw error;
  }
}

function getUsersByRole(role) {
  try {
    return getAllUserRecords_()
        .filter(function(user) { return String(getUserRole_(user)) === String(role); })
        .map(sanitizeUser_);
  } catch (error) {
    Logger.log("Erro em getUsersByRole: " + error.message);
    throw error;
  }
}

function getUserRecordByUsername_(username) {
  try {
    return getAllUserRecords_().find(function(user) {
      return String(getUsername_(user)).toLowerCase() === String(username).toLowerCase();
    }) || null;
  } catch (error) {
    Logger.log("Erro em getUserRecordByUsername_: " + error.message);
    throw error;
  }
}

function getAllUserRecords_() {
  try {
    if (isSpreadsheetConfigured()) {
      var sheetRows = getAllRows(getSpreadsheetId(), getUsersSheetName());
      if (sheetRows.length > 0) return sheetRows.map(normalizeUserRecord_);
    }

    var properties = PropertiesService.getScriptProperties();
    var rawUsers = properties.getProperty('PICS_USERS_JSON');
    var users = rawUsers ? JSON.parse(rawUsers) : [];

    if (!users.some(function(user) { return getUsername_(user) === 'demo'; })) {
      users.unshift(getDemoUserRecord_());
      saveFallbackUsers_(users);
    }

    return users.map(normalizeUserRecord_);
  } catch (error) {
    Logger.log("Erro em getAllUserRecords_: " + error.message);
    throw error;
  }
}

function saveFallbackUsers_(users) {
  try {
    PropertiesService.getScriptProperties().setProperty('PICS_USERS_JSON', JSON.stringify(users));
  } catch (error) {
    Logger.log("Erro em saveFallbackUsers_: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

function getDemoUserRecord_() {
  try {
    try {
      return {
        id: 'demo-user',
        username: 'demo',
        password: PropertiesService.getScriptProperties().getProperty('DEMO_STUDENT_PASSWORD') || SchemaService.getSyntheticDefaultPassword(),
        email: 'demo@example.com',
        role: 'admin',
        registrationDate: '2026-06-05'
      };
    } catch (error) {
      Logger.log("Erro em getDemoUserRecord_: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getDemoUserRecord_: " + error.message);
    throw error;
  }
}

function normalizeUserRecord_(userData) {
  var user = userData || {};
  return {
    id: user.id || user.ID || user.UserID || generateUniqueId(),
    username: user.username || user.Username || '',
    password: user.password || user.Password || '',
    email: user.email || user.Email || '',
    role: user.role || user.Role || 'user',
    registrationDate: user.registrationDate || user.RegistrationDate || formatTimestamp(new Date())
  };
}

function sanitizeUser_(user) {
  if (!user) return null;
  return {
    id: getUserId_(user),
    username: getUsername_(user),
    email: user.email || user.Email || '',
    role: getUserRole_(user),
    registrationDate: user.registrationDate || user.RegistrationDate || ''
  };
}

function getUserId_(user) {
  return user && (user.id || user.ID || user.UserID);
}

function getUsername_(user) {
  return user && (user.username || user.Username);
}

function getUserPassword_(user) {
  return user && (user.password || user.Password);
}

function getUserRole_(user) {
  return user && (user.role || user.Role || 'user');
}
