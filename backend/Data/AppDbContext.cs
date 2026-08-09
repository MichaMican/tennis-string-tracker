using Microsoft.EntityFrameworkCore;
using TennisStringTracker.Api.Models;

namespace TennisStringTracker.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Tracker> Trackers => Set<Tracker>();
    public DbSet<StringEntry> StringEntries => Set<StringEntry>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<HistoryEntry> HistoryEntries => Set<HistoryEntry>();
    public DbSet<Stringer> Stringers => Set<Stringer>();
    public DbSet<TrackerBookmark> TrackerBookmarks => Set<TrackerBookmark>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Tracker>(e =>
        {
            e.HasKey(t => t.Id);
            e.HasMany(t => t.StringEntries)
                .WithOne(s => s.Tracker!)
                .HasForeignKey(s => s.TrackerId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasMany(t => t.HistoryEntries)
                .WithOne(h => h.Tracker!)
                .HasForeignKey(h => h.TrackerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StringEntry>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.HorizontalWeight).HasColumnType("numeric(5,2)");
            e.Property(s => s.VerticalWeight).HasColumnType("numeric(5,2)");
            e.HasMany(s => s.Comments)
                .WithOne(c => c.StringEntry!)
                .HasForeignKey(c => c.StringEntryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Comment>(e =>
        {
            e.HasKey(c => c.Id);
        });

        modelBuilder.Entity<HistoryEntry>(e =>
        {
            e.HasKey(h => h.Id);
            e.HasIndex(h => h.TrackerId);
        });

        modelBuilder.Entity<Stringer>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Username).HasMaxLength(64);
            e.HasIndex(s => s.Username).IsUnique();
            e.HasMany(s => s.Bookmarks)
                .WithOne(b => b.Stringer!)
                .HasForeignKey(b => b.StringerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TrackerBookmark>(e =>
        {
            e.HasKey(b => b.Id);
            e.Property(b => b.Name).HasMaxLength(200);
            e.HasIndex(b => new { b.StringerId, b.TrackerId }).IsUnique();
            e.HasOne(b => b.Tracker)
                .WithMany()
                .HasForeignKey(b => b.TrackerId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
