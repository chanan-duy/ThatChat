using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using ThatChat.Backend.Dto;
using ThatChat.Backend.Services;

namespace ThatChat.Backend.Hubs;

/// <summary>Описывает уведомления, которые сервер отправляет клиентам через SignalR.</summary>
public interface IChatClient
{
	/// <summary>Передаёт клиенту сохранённое сообщение чата.</summary>
	/// <param name="message">Данные сообщения, включая автора, время и необязательную ссылку на файл.</param>
	/// <returns>Задача отправки уведомления. Её завершение не подтверждает прочтение сообщения пользователем.</returns>
	Task ReceiveChatMessage(ChatMessageDto message);
	/// <summary>Уведомляет клиента о создании личного чата.</summary>
	/// <param name="chat">Идентификатор, название и признак общего чата.</param>
	/// <returns>Задача отправки уведомления клиенту.</returns>
	Task ReceiveNewChat(ChatDto chat);
}

/// <summary>Подключает пользователей к группам чатов и доставляет сохранённые сообщения через SignalR.</summary>
/// <param name="chatService">Сервис проверки доступа и сохранения сообщений.</param>
[Authorize]
public class ChatHub(IChatService chatService) : Hub<IChatClient>
{
	/// <summary>Добавляет текущее соединение в группу чата после проверки доступа.</summary>
	/// <param name="chatId">Идентификатор чата, на сообщения которого подписывается клиент.</param>
	/// <returns>Задача добавления в группу. При неверном идентификаторе пользователя или отсутствии доступа завершается без подписки.</returns>
	public async Task JoinChat(Guid chatId)
	{
		var userIdStr = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
		if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
		{
			return;
		}

		if (await chatService.HasAccessToChatAsync(userId, chatId))
		{
			await Groups.AddToGroupAsync(Context.ConnectionId, chatId.ToString());
		}
	}

	/// <summary>Удаляет текущее соединение из группы чата.</summary>
	/// <param name="chatId">Идентификатор чата, подписку на который нужно прекратить.</param>
	/// <returns>Задача удаления соединения из группы. Запись об участии пользователя в чате не меняется.</returns>
	public async Task LeaveChat(Guid chatId)
	{
		await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId.ToString());
	}

	/// <summary>Сохраняет сообщение и отправляет его соединениям, подписанным на группу чата.</summary>
	/// <param name="chatId">Идентификатор чата, доступного текущему пользователю.</param>
	/// <param name="message">Строка длиной не более 10 000 символов. Значение null не допускается. Пустой текст допустим при наличии ссылки на файл.</param>
	/// <param name="fileUrl">Ссылка на вложение или null, если сообщение не содержит файла.</param>
	/// <returns>Задача сохранения и рассылки. При неверном идентификаторе пользователя или отклонении сообщения сервисом завершается без рассылки.</returns>
	/// <exception cref="Microsoft.EntityFrameworkCore.DbUpdateException">Не удалось сохранить сообщение в базе данных.</exception>
	/// <remarks>Вызов не возвращает клиенту отдельный признак отказа. Ошибка рассылки не отменяет сохранение сообщения.</remarks>
	public async Task SendMessage(Guid chatId, string message, string? fileUrl)
	{
		var userIdStr = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
		if (userIdStr == null || !Guid.TryParse(userIdStr, out var userId))
		{
			return;
		}

		var dto = await chatService.SaveMessageAsync(userId, chatId, message, fileUrl);

		if (dto != null)
		{
			await Clients.Group(chatId.ToString()).ReceiveChatMessage(dto);
		}
	}
}
