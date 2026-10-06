namespace ThatChat.Backend.Data;

// ReSharper disable PropertyCanBeMadeInitOnly.Global
// ReSharper disable EntityFramework.ModelValidation.UnlimitedStringLength
/// <summary>Связывает пользователя с чатом. Пара ChatId и UserId образует первичный ключ.</summary>
public class ChatUserEnt
{
	/// <summary>Идентификатор участника чата.</summary>
	public Guid UserId { get; set; }
	/// <summary>Учётная запись участника чата.</summary>
	public AppUserEnt User { get; set; } = null!;

	/// <summary>Идентификатор чата, в котором состоит пользователь.</summary>
	public Guid ChatId { get; set; }
	/// <summary>Чат, к которому относится запись об участии.</summary>
	public ChatEnt Chat { get; set; } = null!;
}
