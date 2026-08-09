using System.Globalization;
using TennisStringTracker.Api.Dtos;
using TennisStringTracker.Api.Models;

namespace TennisStringTracker.Api.Data;

/// <summary>
/// Helpers for mapping entities to DTOs and for building history (audit) entries.
/// </summary>
public static class Mapping
{
    public static CommentDto ToDto(this Comment c) => new(c.Id, c.Text, c.Author, c.CreatedAt);

    public static StringEntryDto ToDto(this StringEntry s, bool includeStringerComments = false) => new(
        s.Id,
        s.HorizontalWeight,
        s.VerticalWeight,
        s.StringModel,
        s.Knotting,
        s.DateOfStringing,
        s.CreatedAt,
        s.Comments
            .Where(c => includeStringerComments || c.Author != CommentAuthor.Stringer)
            .OrderBy(c => c.CreatedAt)
            .Select(c => c.ToDto())
            .ToList());

    public static TrackerDto ToDto(this Tracker t, bool includeStringerComments = false) => new(
        t.Id,
        t.CreatedAt,
        t.EditPasswordHash is not null,
        t.StringEntries
            // latest stringing date on top
            .OrderByDescending(s => s.DateOfStringing)
            .ThenByDescending(s => s.CreatedAt)
            .Select(s => s.ToDto(includeStringerComments))
            .ToList());

    public static HistoryEntryDto ToDto(this HistoryEntry h) => new(
        h.Id,
        h.EntityType,
        h.EntityId,
        h.EntityLabel,
        h.Action,
        h.Field,
        h.OldValue,
        h.NewValue,
        h.Timestamp);

    public static TrackerBookmarkDto ToDto(this TrackerBookmark b) => new(
        b.Id,
        b.TrackerId,
        b.Name,
        b.Tags,
        b.CreatedAt);

    public static string Label(StringEntry s)
        => $"String entry ({s.DateOfStringing:yyyy-MM-dd})";

    public static string? FormatWeight(decimal? value)
        => value?.ToString("0.##", CultureInfo.InvariantCulture);

    public static string? FormatKnotting(KnottingTechnique? value)
        => value switch
        {
            KnottingTechnique.TwoKnots => "2 knots",
            KnottingTechnique.FourKnots => "4 knots",
            _ => null
        };

    public static string FormatDate(DateTime value)
        => value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
}
