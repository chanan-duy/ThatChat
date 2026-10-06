namespace ThatChat.Backend.Services;

/// <summary>Определяет сохранение загруженного файла с выдачей относительной ссылки.</summary>
public interface IFileUploader
{
	/// <summary>Сохраняет файл под именем UUID версии 7 с исходным расширением.</summary>
	/// <param name="file">Загруженный файл. Проверку наличия и размера выполняет вызывающий HTTP-обработчик.</param>
	/// <returns>Относительная ссылка вида /uploads/имя.расширение. Исходное имя файла не сохраняется.</returns>
	/// <exception cref="IOException">Не удалось создать каталог или записать файл.</exception>
	/// <exception cref="UnauthorizedAccessException">Нет прав на создание каталога или запись файла.</exception>
	/// <remarks>Метод записывает файл на локальный диск сервера, несмотря на слово Remote в названии.</remarks>
	Task<string> UploadFileToRemote(IFormFile file);
}
