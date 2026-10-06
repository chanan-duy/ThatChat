namespace ThatChat.Backend.Api;

/// <summary>Объединяет маршруты учётных записей, чатов и загрузки файлов.</summary>
public static class ApiMain
{
	extension(RouteGroupBuilder group)
	{
		/// <summary>Регистрирует маршруты /auth, /chats и /upload внутри указанной группы.</summary>
		/// <returns>Исходная группа маршрутов после регистрации обработчиков.</returns>
		public RouteGroupBuilder MapApi()
		{
			group.MapGroup("/auth").MapAuthEndpoint().WithTags("Auth");
			group.MapUploadEndpoint().WithTags("Upload");
			group.MapGroup("/chats").MapChatEndpoint().WithTags("Chat");

			return group;
		}
	}
}
