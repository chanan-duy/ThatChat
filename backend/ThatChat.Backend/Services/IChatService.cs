using ThatChat.Backend.Data;
using ThatChat.Backend.Dto;

namespace ThatChat.Backend.Services;

/// <summary>Определяет операции проверки доступа, сохранения сообщений и создания личных чатов.</summary>
public interface IChatService
{
	/// <summary>Проверяет, существует ли чат и доступен ли он указанному пользователю.</summary>
	/// <param name="userId">Идентификатор пользователя, для которого проверяется доступ.</param>
	/// <param name="chatId">Идентификатор общего или личного чата.</param>
	/// <returns><see langword="true"/> для существующего общего чата или чата, в котором пользователь состоит. В остальных случаях <see langword="false"/>.</returns>
	Task<bool> HasAccessToChatAsync(Guid userId, Guid chatId);
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
	Task<ChatMessageDto?> SaveMessageAsync(Guid userId, Guid chatId, string message, string? fileUrl);
	/// <summary>Возвращает личный чат с указанным пользователем или создаёт чат с двумя участниками.</summary>
	/// <param name="currentUserId">Идентификатор зарегистрированного пользователя, создающего чат.</param>
	/// <param name="targetEmail">Адрес второго участника. Поиск выполняется по полю Email без нормализации в этом методе.</param>
	/// <returns>Чат и признак IsNew. Признак равен true, только если метод создал новый чат.</returns>
	/// <exception cref="InvalidOperationException">Пользователь с указанным адресом не найден или пытается создать чат с собой.</exception>
	/// <exception cref="Microsoft.EntityFrameworkCore.DbUpdateException">Не удалось сохранить чат или его участников в базе данных.</exception>
	Task<(ChatEnt Chat, bool IsNew)> CreateOrGetPrivateChatAsync(Guid currentUserId, string targetEmail);
}
