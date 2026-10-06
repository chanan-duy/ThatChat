using Microsoft.AspNetCore.Mvc;
using ThatChat.Backend.Services;

namespace ThatChat.Backend.Api;

/// <summary>Регистрирует HTTP-маршрут загрузки файла на сервер.</summary>
public static class UploadEndpoint
{
	extension(RouteGroupBuilder group)
	{
		/// <summary>Добавляет маршрут POST /upload для авторизованных пользователей.</summary>
		/// <returns>Исходная группа маршрутов после регистрации обработчиков.</returns>
		/// <remarks>Принимает непустой файл размером менее 20 971 520 байт.
		/// При нарушении ограничения возвращает HTTP 400, при успехе возвращает HTTP 200 с полем Url.</remarks>
		public RouteGroupBuilder MapUploadEndpoint()
		{
			group.MapPost("/upload",
					async (IFormFile? file, [FromServices] IFileUploader uploader) =>
					{
						const long maxFileSizeBytes = 20 * 1024 * 1024;

						if (file == null || file.Length == 0)
						{
							return Results.BadRequest("No file");
						}

						if (file.Length >= maxFileSizeBytes)
						{
							return Results.BadRequest($"Max file size is: {maxFileSizeBytes:N2} bytes");
						}

						var fileUrl = await uploader.UploadFileToRemote(file);

						return Results.Ok(new { Url = fileUrl });
					})
				.RequireAuthorization()
				.DisableAntiforgery();

			return group;
		}
	}
}
