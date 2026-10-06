using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ThatChat.Backend.Data;

/// <summary>Хранит учётные записи, чаты, участников и сообщения средствами Entity Framework Core.</summary>
public class AppDbContext : IdentityDbContext<AppUserEnt, IdentityRole<Guid>, Guid>
{
	/// <summary>Постоянный идентификатор общего чата, создаваемого начальной миграцией.</summary>
	public static readonly Guid GlobalChatId = Guid.Parse("11111111-1111-1111-1111-111111111111");

	/// <summary>Чаты, включая общий чат и личные переписки.</summary>
	public DbSet<ChatEnt> Chats { get; set; }
	/// <summary>Сообщения с текстом, ссылкой на файл, автором и временем отправки.</summary>
	public DbSet<MessageEnt> Messages { get; set; }
	/// <summary>Записи об участии пользователей в чатах с составным ключом ChatId и UserId.</summary>
	public DbSet<ChatUserEnt> ChatUsers { get; set; }

	/// <summary>Создаёт контекст с заданным подключением и параметрами Entity Framework Core.</summary>
	/// <param name="options">Параметры подключения и настройки провайдера базы данных.</param>
	public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
	{
	}

	/// <summary>Настраивает ключ участников чата, начальный общий чат и хранение времени в UTC.</summary>
	/// <param name="modelBuilder">Построитель модели, включающей таблицы ASP.NET Core Identity.</param>
	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		modelBuilder.Entity<ChatUserEnt>()
			.HasKey(cu => new { cu.ChatId, cu.UserId });

		modelBuilder.Entity<ChatEnt>().HasData(
			new ChatEnt
			{
				Id = GlobalChatId,
				Name = "Общий Чат",
				IsGlobal = true,
			}
		);

		foreach (var entityType in modelBuilder.Model.GetEntityTypes())
		{
			foreach (var property in entityType.GetProperties())
			{
				if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
				{
					property.SetValueConverter(new DateTimeUtcConverter());
				}
			}
		}
	}
}
