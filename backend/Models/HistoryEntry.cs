using System.Text.Json.Serialization;

namespace TennisStringTracker.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum HistoryAction
{
    Create,
    Update,
    Delete
}

/// <summary>
/// An audit log entry describing a change made to a tracker's data.
/// Each entry records a single field change (or a create/delete event)
/// including the previous and new values so the full history can be replayed.
/// </summary>
public class HistoryEntry
{
    public Guid Id { get; set; }
    public Guid TrackerId { get; set; }
    public Tracker? Tracker { get; set; }

    /// <summary>The kind of entity affected, e.g. "StringEntry" or "Comment".</summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>The id of the affected entity.</summary>
    public Guid EntityId { get; set; }

    public HistoryAction Action { get; set; }

    /// <summary>The field that changed (for Update actions). Null for create/delete.</summary>
    public string? Field { get; set; }

    public string? OldValue { get; set; }
    public string? NewValue { get; set; }

    /// <summary>A human readable label describing the affected entity.</summary>
    public string? EntityLabel { get; set; }

    public DateTime Timestamp { get; set; }
}
