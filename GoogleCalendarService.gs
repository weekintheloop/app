/**
 * @file GoogleCalendarService.gs
 * @description Funções para interagir com o Google Calendar, permitindo a criação de eventos, agendamento de sessões ou lembretes.
 *              Pode ser útil para agendar sessões de terapia ou acompanhamento do estudo.
 * @integration
 *   - Google Calendar API: Interage diretamente com o Google Calendar.
 *   - `UserService.gs`: Pode ser usado para convidar usuários para eventos.
 */

function createCalendarEvent(title, startTime, endTime, description, guests = []) {
  // Cria um novo evento no calendário padrão do usuário do script.
  try {
    var calendar = CalendarApp.getDefaultCalendar();
    var event = calendar.createEvent(title, startTime, endTime, { description: description, guests: guests.join(",") });
    logInfo("Evento ", title, " criado com sucesso. ID: ", event.getId());
    return { success: true, eventId: event.getId(), eventUrl: event.getGuestListUrl() };
  } catch (e) {
    logError("Falha ao criar evento ", title, ": ", e.message);
    return { success: false, message: "Falha ao criar evento." };
  }
}

function getEventsInDateRange(startTime, endTime) {
  // Obtém todos os eventos no calendário padrão dentro de um determinado período.
  try {
    var calendar = CalendarApp.getDefaultCalendar();
    var events = calendar.getEvents(startTime, endTime);
    var formattedEvents = events.map(function(event) {
      return {
        title: event.getTitle(),
        startTime: event.getStartTime(),
        endTime: event.getEndTime(),
        description: event.getDescription()
      };
    });
    return { success: true, events: formattedEvents };
  } catch (e) {
    logError("Falha ao obter eventos: ", e.message);
    return { success: false, message: "Falha ao obter eventos." };
  }
}
