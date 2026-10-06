using System.Text.Json.Serialization;

// ReSharper disable PropertyCanBeMadeInitOnly.Global
// ReSharper disable EntityFramework.ModelValidation.UnlimitedStringLength

namespace ThatChat.Backend.Data;

/// <summary>Общий или личный чат с коллекциями участников и сообщений.</summary>
public class ChatEnt
{
	/// <summary>Уникальный идентификатор чата.</summary>
	public Guid Id { get; set; }
	/// <summary>Название чата. Для нового личного чата содержит адрес второго участника.</summary>
	public string? Name { get; set; }
	/// <summary>Признак общего чата, доступного всем вошедшим пользователям.</summary>
	public bool IsGlobal { get; set; }

	/// <summary>Участники чата. Для доступа к общему чату запись об участии не требуется.</summary>
	[JsonIgnore] public List<ChatUserEnt> ChatUsers { get; set; } = [];
	/// <summary>Сообщения, относящиеся к чату.</summary>
	[JsonIgnore] public List<MessageEnt> Messages { get; set; } = [];
}
