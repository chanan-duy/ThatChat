using ThatChat.Backend.Data;

namespace ThatChat.Backend.Api;

/// <summary>Регистрирует стандартные маршруты ASP.NET Core Identity для учётных записей.</summary>
public static class AuthEndpoint
{
	extension(RouteGroupBuilder group)
	{
		/// <summary>Добавляет маршруты регистрации, входа, обновления токена и управления учётной записью.</summary>
		/// <returns>Исходная группа маршрутов после регистрации обработчиков.</returns>
		public RouteGroupBuilder MapAuthEndpoint()
		{
			group.MapIdentityApi<AppUserEnt>();

			return group;
		}
	}
}
