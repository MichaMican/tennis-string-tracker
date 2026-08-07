using TennisStringTracker.Api.Models;

namespace TennisStringTracker.Api.Dtos;

public record CommentDto(Guid Id, string Text, DateTime CreatedAt);

public record StringEntryDto(
    Guid Id,
    decimal? HorizontalWeight,
    decimal? VerticalWeight,
    string? StringModel,
    KnottingTechnique? Knotting,
    DateTime DateOfStringing,
    DateTime CreatedAt,
    List<CommentDto> Comments);

public record TrackerDto(
    Guid Id,
    DateTime CreatedAt,
    bool HasEditPassword,
    List<StringEntryDto> StringEntries);

public record CreateTrackerDto(string? EditPassword);

public record VerifyEditPasswordDto(string Password);

public record CreateStringEntryDto(
    decimal? HorizontalWeight,
    decimal? VerticalWeight,
    string? StringModel,
    KnottingTechnique? Knotting,
    DateTime DateOfStringing);

public record UpdateStringEntryDto(
    decimal? HorizontalWeight,
    decimal? VerticalWeight,
    string? StringModel,
    KnottingTechnique? Knotting,
    DateTime DateOfStringing);

public record CreateCommentDto(string Text);

public record HistoryEntryDto(
    Guid Id,
    string EntityType,
    Guid EntityId,
    string? EntityLabel,
    HistoryAction Action,
    string? Field,
    string? OldValue,
    string? NewValue,
    DateTime Timestamp);
