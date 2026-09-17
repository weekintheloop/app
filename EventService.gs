/**
 * @file EventService.gs
 * @description Gerencia a criação, registro e disparo de eventos personalizados dentro da aplicação.
 *              Permite uma arquitetura baseada em eventos, onde diferentes partes do sistema podem reagir a ocorrências.
 * @integration
 *   - Diversos serviços (.gs): Podem disparar ou ouvir eventos.
 *   - `NotificationService.gs`: Pode ser acionado por eventos específicos.
 */

var eventListeners = {};

function addEventListener(eventName, callback) {
  try {
    if (!eventListeners[eventName]) {
      eventListeners[eventName] = [];
    }
    eventListeners[eventName].push(callback);
  } catch (error) {
    Logger.log("Erro em addEventListener: " + error.message);
    throw error;
  }
}

function dispatchEvent(eventName, eventData) {
  try {
    if (eventListeners[eventName]) {
      eventListeners[eventName].forEach(function(callback) {
        try {
          callback(eventData);
        } catch (e) {
          logError("Erro ao executar listener para o evento " + eventName + ": " + e.message);
        }
      });
    }
  } catch (error) {
    Logger.log("Erro em dispatchEvent: " + error.message);
    throw error;
  }
}

function onUserLogin(callback) {
  addEventListener("userLogin", callback);
}

function onDataAdded(callback) {
  addEventListener("dataAdded", callback);
}
