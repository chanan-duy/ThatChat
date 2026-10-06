namespace ThatChat.Backend.Services;

/// <summary>Сохраняет файлы в каталоге wwwroot/uploads текущего рабочего каталога.</summary>
/// <param name="logger">Журнал для записи размера файла и пути сохранения.</param>
public class FileUploaderService(ILogger<FileUploaderService> logger) : IFileUploader
{
	/// <summary>Сохраняет файл под именем UUID версии 7 с исходным расширением.</summary>
	/// <param name="file">Загруженный файл. Проверку наличия и размера выполняет вызывающий HTTP-обработчик.</param>
	/// <returns>Относительная ссылка вида /uploads/имя.расширение. Исходное имя файла не сохраняется.</returns>
	/// <exception cref="IOException">Не удалось создать каталог или записать файл.</exception>
	/// <exception cref="UnauthorizedAccessException">Нет прав на создание каталога или запись файла.</exception>
	/// <remarks>Метод записывает файл на локальный диск сервера, несмотря на слово Remote в названии.</remarks>
	public async Task<string> UploadFileToRemote(IFormFile file)
	{
		var ext = Path.GetExtension(file.FileName);
		var newName = $"{Guid.CreateVersion7()}{ext}";

		var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
		if (!Directory.Exists(uploadPath))
		{
			Directory.CreateDirectory(uploadPath);
		}

		var fullPath = Path.Combine(uploadPath, newName);

		logger.LogInformation("Uploading to path: {FullPath}", fullPath);
		logger.LogInformation("File size: {FileSize:N2} bytes, {FileSizeKiB:N2} KiB, {FileSizeMiB:N2} MiB",
			file.Length,
			file.Length / 1024f,
			file.Length / 1024f / 1024f);

		await using (var stream = new FileStream(fullPath, FileMode.Create))
		{
			await file.CopyToAsync(stream);
		}

		logger.LogInformation("Uploaded {FullPath}", fullPath);

		var fileUrl = $"/uploads/{newName}";

		return fileUrl;
	}
}
