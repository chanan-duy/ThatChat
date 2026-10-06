using JetBrains.Annotations;

namespace ThatChat.Backend.Dto;

/// <summary>Запрос на создание личного чата с пользователем по адресу электронной почты.</summary>
/// <param name="Email">Адрес зарегистрированного пользователя, отличный от адреса отправителя запроса.</param>
[UsedImplicitly]
public record CreateChatRequest(string Email);

/// <summary>Данные чата для HTTP-ответа или уведомления о новом чате.</summary>
/// <param name="Id">Идентификатор чата.</param>
/// <param name="Name">Название чата или null, если оно не задано.</param>
/// <param name="IsGlobal">Признак общего чата, доступного всем вошедшим пользователям.</param>
[UsedImplicitly]
public record ChatDto(
	Guid Id,
	string? Name,
	bool IsGlobal
);

/// <summary>Данные сообщения для истории переписки и доставки через SignalR.</summary>
/// <param name="Id">Идентификатор сообщения.</param>
/// <param name="ChatId">Идентификатор чата.</param>
/// <param name="SenderId">Идентификатор автора.</param>
/// <param name="SenderEmail">Адрес электронной почты автора или null, если он отсутствует.</param>
/// <param name="Text">Текст сообщения, который может быть пустым при наличии файла.</param>
/// <param name="FileUrl">Ссылка на вложенный файл или null, если вложения нет.</param>
/// <param name="CreatedAt">Время создания сообщения в UTC.</param>
[UsedImplicitly]
public record ChatMessageDto(
	Guid Id,
	Guid ChatId,
	Guid SenderId,
	string? SenderEmail,
	string? Text,
	string? FileUrl,
	DateTime CreatedAt
);
