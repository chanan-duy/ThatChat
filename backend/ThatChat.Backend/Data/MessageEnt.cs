namespace ThatChat.Backend.Data;

// ReSharper disable PropertyCanBeMadeInitOnly.Global
// ReSharper disable EntityFramework.ModelValidation.UnlimitedStringLength
/// <summary>Сохранённое сообщение с автором, чатом, временем и необязательным вложением.</summary>
public class MessageEnt
{
	/// <summary>Уникальный идентификатор сообщения.</summary>
	public Guid Id { get; set; }
	/// <summary>Текст сообщения. При отправке с файлом может быть пустым.</summary>
	public string? Text { get; set; }
	/// <summary>Ссылка на вложенный файл или null, если вложения нет.</summary>
	public string? FileUrl { get; set; }
	/// <summary>Время создания сообщения в UTC. По умолчанию задаётся при создании объекта.</summary>
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	/// <summary>Идентификатор чата, в котором сохранено сообщение.</summary>
	public Guid ChatId { get; set; }
	/// <summary>Чат, к которому относится сообщение.</summary>
	public ChatEnt Chat { get; set; } = null!;

	/// <summary>Идентификатор автора сообщения.</summary>
	public Guid SenderId { get; set; }
	/// <summary>Учётная запись автора сообщения.</summary>
	public AppUserEnt Sender { get; set; } = null!;
}
