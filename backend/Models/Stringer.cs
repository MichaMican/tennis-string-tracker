namespace TennisStringTracker.Api.Models;

public class Stringer
{
    public Guid Id { get; set; }

    /// <summary>Unique username identifying the stringer.</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>Argon2id hash of the stringer's password. Only the one-way hash is stored.</summary>
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public List<TrackerBookmark> Bookmarks { get; set; } = new();
}
