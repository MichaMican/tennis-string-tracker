using System.Text.Json.Serialization;

namespace TennisStringTracker.Api.Models;

/// <summary>Who wrote a comment.</summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CommentAuthor
{
    /// <summary>Visible to everyone who opens the tracker.</summary>
    Player = 0,

    /// <summary>Internal note, only visible in the edit view.</summary>
    Stringer = 1
}

public class Comment
{
    public Guid Id { get; set; }
    public Guid StringEntryId { get; set; }
    public StringEntry? StringEntry { get; set; }

    public string Text { get; set; } = string.Empty;

    public CommentAuthor Author { get; set; } = CommentAuthor.Player;

    public DateTime CreatedAt { get; set; }
}
