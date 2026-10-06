using Microsoft.AspNetCore.Identity;

namespace ThatChat.Backend.Data;

/// <summary>Учётная запись пользователя с идентификатором Guid и полями ASP.NET Core Identity.</summary>
public class AppUserEnt : IdentityUser<Guid>
{
}
