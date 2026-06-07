namespace TennisStringTracker.Api.Models;

public class Comment
{
    public Guid Id { get; set; }
    public Guid StringEntryId { get; set; }
    public StringEntry? StringEntry { get; set; }

    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
