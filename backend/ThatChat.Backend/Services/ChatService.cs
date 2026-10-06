using Microsoft.EntityFrameworkCore;
using ThatChat.Backend.Data;
using ThatChat.Backend.Dto;

namespace ThatChat.Backend.Services;

/// <summary>Выполняет операции с чатами и сообщениями через контекст базы данных.</summary>
/// <param name="db">Контекст базы данных для текущей области зависимостей.</param>
public class ChatService(AppDbContext db) : IChatService
{
	/// <summary>Проверяет, существует ли чат и доступен ли он указанному пользователю.</summary>
	/// <param name="userId">Идентификатор пользователя, для которого проверяется доступ.</param>
	/// <param name="chatId">Идентификатор общего или личного чата.</param>
	/// <returns><see langword="true"/> для существующего общего чата или чата, в котором пользователь состоит. В остальных случаях <see langword="false"/>.</returns>
	public async Task<bool> HasAccessToChatAsync(Guid userId, Guid chatId)
	{
		return await db.Chats
			.AnyAsync(c => c.Id == chatId && (c.IsGlobal || c.ChatUsers.Any(cu => cu.UserId == userId)));
	}

	/// <summary>Проверяет сообщение и доступ к чату, сохраняет сообщение и возвращает данные для доставки.</summary>
	/// <param name="userId">Идентификатор зарегистрированного автора сообщения.</param>
	/// <param name="chatId">Идентификатор чата, в который отправляется сообщение.</param>
	/// <param name="message">Строка длиной не более 10 000 символов. Значение null не допускается. Пустой текст допустим при наличии ссылки на файл.</param>
	/// <param name="fileUrl">Ссылка на вложение или null. Метод не проверяет существование файла.</param>
	/// <returns>Сохранённое сообщение с адресом автора. Возвращает null, если текст и ссылка не содержат значимых символов,
	/// текст превышает ограничение или чат недоступен.</returns>
	/// <exception cref="Microsoft.EntityFrameworkCore.DbUpdateException">Не удалось сохранить сообщение в базе данных.</exception>
	/// <remarks>Не рассылает сообщение клиентам. Рассылку выполняет ChatHub после успешного сохранения.</remarks>
	/// <example>
	/// <code>
	/// var message = await chatService.SaveMessageAsync(userId, chatId, "Добрый день", null);
	/// if (message is not null)
	/// {
	///     Console.WriteLine(message.Id);
	/// }
	/// </code>
	/// </example>
	public async Task<ChatMessageDto?> SaveMessageAsync(Guid userId, Guid chatId, string message, string? fileUrl)
	{
		if (string.IsNullOrWhiteSpace(message) && string.IsNullOrWhiteSpace(fileUrl))
		{
			return null;
		}

		if (message.Length > 10_000)
		{
			return null;
		}

		var hasAccess = await HasAccessToChatAsync(userId, chatId);
		if (!hasAccess)
		{
			return null;
		}

		var msgEnt = new MessageEnt
		{
			Id = Guid.NewGuid(),
			ChatId = chatId,
			SenderId = userId,
			Text = message,
			FileUrl = fileUrl,
		};

		db.Messages.Add(msgEnt);
		await db.SaveChangesAsync();

		var senderEmail = await db.Users
			.Where(u => u.Id == userId)
			.Select(u => u.Email)
			.FirstOrDefaultAsync();

		return new ChatMessageDto(
			msgEnt.Id,
			msgEnt.ChatId,
			msgEnt.SenderId,
			senderEmail,
			msgEnt.Text,
			msgEnt.FileUrl,
			msgEnt.CreatedAt
		);
	}

	/// <summary>Возвращает личный чат с указанным пользователем или создаёт чат с двумя участниками.</summary>
	/// <param name="currentUserId">Идентификатор зарегистрированного пользователя, создающего чат.</param>
	/// <param name="targetEmail">Адрес второго участника. Поиск выполняется по полю Email без нормализации в этом методе.</param>
	/// <returns>Чат и признак IsNew. Признак равен true, только если метод создал новый чат.</returns>
	/// <exception cref="InvalidOperationException">Пользователь с указанным адресом не найден или пытается создать чат с собой.</exception>
	/// <exception cref="Microsoft.EntityFrameworkCore.DbUpdateException">Не удалось сохранить чат или его участников в базе данных.</exception>
	public async Task<(ChatEnt Chat, bool IsNew)> CreateOrGetPrivateChatAsync(Guid currentUserId, string targetEmail)
	{
		var targetUser = await db.Users.FirstOrDefaultAsync(u => u.Email == targetEmail);
		if (targetUser == null)
		{
			throw new InvalidOperationException("User not found");
		}

		if (targetUser.Id == currentUserId)
		{
			throw new InvalidOperationException("Self chat not allowed");
		}

		var existingChat = await db.Chats
			.Where(c => !c.IsGlobal)
			.Where(c => c.ChatUsers.Any(cu => cu.UserId == currentUserId) &&
			            c.ChatUsers.Any(cu => cu.UserId == targetUser.Id))
			.FirstOrDefaultAsync();

		if (existingChat != null)
		{
			return (existingChat, false);
		}

		var newChat = new ChatEnt
		{
			Id = Guid.NewGuid(),
			Name = targetUser.Email,
			IsGlobal = false,
		};

		db.Chats.Add(newChat);
		db.ChatUsers.Add(new ChatUserEnt { ChatId = newChat.Id, UserId = currentUserId });
		db.ChatUsers.Add(new ChatUserEnt { ChatId = newChat.Id, UserId = targetUser.Id });

		await db.SaveChangesAsync();

		return (newChat, true);
	}
}
