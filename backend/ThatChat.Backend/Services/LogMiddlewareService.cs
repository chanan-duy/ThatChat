using System.Text;

namespace ThatChat.Backend.Services;

/// <summary>Записывает завершившиеся HTTP-запросы в ежедневный текстовый журнал в каталоге Logs.</summary>
public class LogMiddlewareService : IMiddleware
{
	private static readonly SemaphoreSlim FileLock = new(1, 1);

	/// <summary>Создаёт каталог Logs в текущем рабочем каталоге, если он отсутствует.</summary>
	/// <exception cref="IOException">Не удалось создать каталог журналов.</exception>
	/// <exception cref="UnauthorizedAccessException">Нет прав на создание каталога журналов.</exception>
	public LogMiddlewareService()
	{
		if (!Directory.Exists("Logs"))
		{
			Directory.CreateDirectory("Logs");
		}
	}

	/// <summary>Вызывает следующий обработчик и записывает сведения о запросе после его успешного завершения.</summary>
	/// <param name="context">Контекст текущего HTTP-запроса и ответа.</param>
	/// <param name="next">Следующий обработчик в конвейере ASP.NET Core.</param>
	/// <returns>Задача обработки запроса и попытки записи в журнал.</returns>
	/// <remarks>Если следующий обработчик выбрасывает исключение, запись не создаётся.
	/// Ошибки записи файла выводятся в консоль и не передаются вызывающему коду.
	/// Время записывается по местному времени сервера со смещением относительно UTC.</remarks>
	public async Task InvokeAsync(HttpContext context, RequestDelegate next)
	{
		var ip = context.Connection.RemoteIpAddress?.ToString() ?? "-";
		var user = context.User.Identity?.Name ?? "-";

		var method = context.Request.Method;
		var path = context.Request.Path;
		var protocol = context.Request.Protocol;

		await next(context);

		var status = context.Response.StatusCode;
		var time = DateTime.Now.ToString("dd/MMM/yyyy:HH:mm:ss zzz");

		var logLine = $"{ip} - {user} [{time}] \"{method} {path} {protocol}\" {status} -\n";

		var currentFileName = $"access-{DateTime.Now:yyyy-MM-dd}.log";
		var logPath = Path.Combine("Logs", currentFileName);

		await FileLock.WaitAsync();
		try
		{
			await File.AppendAllTextAsync(logPath, logLine, Encoding.UTF8);
		}
		catch (Exception ex)
		{
			Console.WriteLine($"Failed to write log: {ex.Message}");
		}
		finally
		{
			FileLock.Release();
		}
	}
}
