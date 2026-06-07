using TennisStringTracker.Api.Models;

namespace TennisStringTracker.Api.Data;

/// <summary>
/// Builds <see cref="HistoryEntry"/> records describing changes to tracked data.
/// </summary>
public static class HistoryFactory
{
    public static IEnumerable<HistoryEntry> ForCreate(StringEntry s)
    {
        yield return Base(s, HistoryAction.Create, null,
            null, "Created new string entry");
    }

    public static IEnumerable<HistoryEntry> ForUpdate(StringEntry before, StringEntry after)
    {
        if (before.HorizontalWeight != after.HorizontalWeight)
            yield return Base(after, HistoryAction.Update, "Horizontal weight",
                Mapping.FormatWeight(before.HorizontalWeight),
                Mapping.FormatWeight(after.HorizontalWeight));

        if (before.VerticalWeight != after.VerticalWeight)
            yield return Base(after, HistoryAction.Update, "Vertical weight",
                Mapping.FormatWeight(before.VerticalWeight),
                Mapping.FormatWeight(after.VerticalWeight));

        if (before.StringModel != after.StringModel)
            yield return Base(after, HistoryAction.Update, "String model/manufacturer",
                before.StringModel, after.StringModel);

        if (before.Knotting != after.Knotting)
            yield return Base(after, HistoryAction.Update, "Knotting technique",
                Mapping.FormatKnotting(before.Knotting),
                Mapping.FormatKnotting(after.Knotting));

        if (before.DateOfStringing != after.DateOfStringing)
            yield return Base(after, HistoryAction.Update, "Date of stringing",
                Mapping.FormatDate(before.DateOfStringing),
                Mapping.FormatDate(after.DateOfStringing));
    }

    public static IEnumerable<HistoryEntry> ForDelete(StringEntry s)
    {
        // Record the last known state of every field before deletion.
        var summary = new List<string>
        {
            $"Date of stringing: {Mapping.FormatDate(s.DateOfStringing)}",
            $"Horizontal weight: {Mapping.FormatWeight(s.HorizontalWeight) ?? "-"}",
            $"Vertical weight: {Mapping.FormatWeight(s.VerticalWeight) ?? "-"}",
            $"String model/manufacturer: {s.StringModel ?? "-"}",
            $"Knotting technique: {Mapping.FormatKnotting(s.Knotting) ?? "-"}"
        };

        yield return Base(s, HistoryAction.Delete, null,
            string.Join("; ", summary), null);
    }

    public static HistoryEntry ForCommentCreate(StringEntry parent, Comment c)
        => new()
        {
            Id = Guid.NewGuid(),
            TrackerId = parent.TrackerId,
            EntityType = "Comment",
            EntityId = c.Id,
            EntityLabel = Mapping.Label(parent),
            Action = HistoryAction.Create,
            Field = "Comment",
            OldValue = null,
            NewValue = c.Text,
            Timestamp = DateTime.UtcNow
        };

    public static HistoryEntry ForCommentDelete(StringEntry parent, Comment c)
        => new()
        {
            Id = Guid.NewGuid(),
            TrackerId = parent.TrackerId,
            EntityType = "Comment",
            EntityId = c.Id,
            EntityLabel = Mapping.Label(parent),
            Action = HistoryAction.Delete,
            Field = "Comment",
            OldValue = c.Text,
            NewValue = null,
            Timestamp = DateTime.UtcNow
        };

    private static HistoryEntry Base(StringEntry s, HistoryAction action,
        string? field, string? oldValue, string? newValue)
        => new()
        {
            Id = Guid.NewGuid(),
            TrackerId = s.TrackerId,
            EntityType = "StringEntry",
            EntityId = s.Id,
            EntityLabel = Mapping.Label(s),
            Action = action,
            Field = field,
            OldValue = oldValue,
            NewValue = newValue,
            Timestamp = DateTime.UtcNow
        };
}
