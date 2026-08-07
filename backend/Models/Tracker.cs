namespace TennisStringTracker.Api.Models;

public class Tracker
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }

    /// <summary>Argon2id hash of the optional edit password. Null when unprotected.</summary>
    public string? EditPasswordHash { get; set; }

    public List<StringEntry> StringEntries { get; set; } = new();
    public List<HistoryEntry> HistoryEntries { get; set; } = new();
}
