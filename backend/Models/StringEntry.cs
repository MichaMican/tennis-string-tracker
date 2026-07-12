namespace TennisStringTracker.Api.Models;

public enum KnottingTechnique
{
    TwoKnots = 2,
    FourKnots = 4
}

public class StringEntry
{
    public Guid Id { get; set; }
    public Guid TrackerId { get; set; }
    public Tracker? Tracker { get; set; }

    /// <summary>Horizontal (cross) string tension/weight in kg.</summary>
    public decimal? HorizontalWeight { get; set; }

    /// <summary>Vertical (main) string tension/weight in kg.</summary>
    public decimal? VerticalWeight { get; set; }

    /// <summary>String model and/or manufacturer.</summary>
    public string? StringModel { get; set; }

    public KnottingTechnique? Knotting { get; set; }

    public DateTime DateOfStringing { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<Comment> Comments { get; set; } = new();
}
