namespace TennisStringTracker.Api.Models;

public class Tracker
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }

    public List<StringEntry> StringEntries { get; set; } = new();
    public List<HistoryEntry> HistoryEntries { get; set; } = new();
}
