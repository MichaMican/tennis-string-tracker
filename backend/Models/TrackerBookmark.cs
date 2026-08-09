namespace TennisStringTracker.Api.Models;

/// <summary>
/// A tracker bookmarked by a stringer, with an optional display name and tags.
/// Purely a personal reference — grants no edit rights on the tracker itself.
/// </summary>
public class TrackerBookmark
{
    public Guid Id { get; set; }

    public Guid StringerId { get; set; }
    public Stringer? Stringer { get; set; }

    public Guid TrackerId { get; set; }
    public Tracker? Tracker { get; set; }

    public string? Name { get; set; }

    public List<string> Tags { get; set; } = new();

    public DateTime CreatedAt { get; set; }
}
