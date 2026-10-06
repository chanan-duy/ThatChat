using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace ThatChat.Backend.Data;

/// <summary>Преобразует время в UTC при записи и устанавливает признак UTC при чтении из базы данных.</summary>
public class DateTimeUtcConverter : ValueConverter<DateTime, DateTime>
{
	/// <summary>Задаёт правила записи и чтения значений DateTime для Entity Framework Core.</summary>
	public DateTimeUtcConverter()
		: base(
			d => d.ToUniversalTime(),
			d => DateTime.SpecifyKind(d, DateTimeKind.Utc))
	{
	}
}
