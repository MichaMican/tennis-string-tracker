using Microsoft.EntityFrameworkCore;
using TennisStringTracker.Api.Data;
using TennisStringTracker.Api.Dtos;
using TennisStringTracker.Api.Models;
using TennisStringTracker.Api.Security;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException(
        "Connection string 'Default' is not configured. " +
        "Set ConnectionStrings__Default via environment or appsettings.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

const string CorsPolicy = "frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// Apply migrations automatically on startup (retry while the DB container starts).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var attempts = 0;
    while (true)
    {
        try
        {
            db.Database.Migrate();
            break;
        }
        catch (Exception) when (attempts++ < 10)
        {
            Thread.Sleep(3000);
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors(CorsPolicy);

var api = app.MapGroup("/api");

// --- Trackers -------------------------------------------------------------

api.MapPost("/trackers", async (CreateTrackerDto? dto, AppDbContext db) =>
{
    var tracker = new Tracker
    {
        Id = Guid.NewGuid(),
        CreatedAt = DateTime.UtcNow,
        EditPasswordHash = string.IsNullOrWhiteSpace(dto?.EditPassword)
            ? null
            : EditPassword.Hash(dto.EditPassword)
    };
    db.Trackers.Add(tracker);
    await db.SaveChangesAsync();
    return Results.Created($"/api/trackers/{tracker.Id}", tracker.ToDto());
});

api.MapGet("/trackers/{id:guid}", async (Guid id, AppDbContext db) =>
{
    var tracker = await db.Trackers
        .Include(t => t.StringEntries)
            .ThenInclude(s => s.Comments)
        .FirstOrDefaultAsync(t => t.Id == id);

    return tracker is null ? Results.NotFound() : Results.Ok(tracker.ToDto());
});

api.MapGet("/trackers/{id:guid}/history", async (Guid id, AppDbContext db) =>
{
    var exists = await db.Trackers.AnyAsync(t => t.Id == id);
    if (!exists) return Results.NotFound();

    var history = await db.HistoryEntries
        .Where(h => h.TrackerId == id)
        .OrderByDescending(h => h.Timestamp)
        .ToListAsync();

    return Results.Ok(history.Select(h => h.ToDto()).ToList());
});

api.MapPost("/trackers/{id:guid}/verify-edit-password", async (
    Guid id, VerifyEditPasswordDto dto, AppDbContext db) =>
{
    var tracker = await db.Trackers.FindAsync(id);
    if (tracker is null) return Results.NotFound();

    if (tracker.EditPasswordHash is null) return Results.NoContent();

    return !string.IsNullOrEmpty(dto.Password)
        && EditPassword.Verify(tracker.EditPasswordHash, dto.Password)
        ? Results.NoContent()
        : Results.Unauthorized();
});

// --- String entries -------------------------------------------------------

api.MapPost("/trackers/{id:guid}/entries", async (
    Guid id, CreateStringEntryDto dto, AppDbContext db, HttpRequest request) =>
{
    var tracker = await db.Trackers.FindAsync(id);
    if (tracker is null) return Results.NotFound();
    if (!EditPassword.IsAuthorized(tracker, request)) return Results.Unauthorized();

    var entry = new StringEntry
    {
        Id = Guid.NewGuid(),
        TrackerId = id,
        HorizontalWeight = dto.HorizontalWeight,
        VerticalWeight = dto.VerticalWeight,
        StringModel = dto.StringModel,
        Knotting = dto.Knotting,
        DateOfStringing = DateTime.SpecifyKind(dto.DateOfStringing, DateTimeKind.Utc),
        CreatedAt = DateTime.UtcNow
    };

    db.StringEntries.Add(entry);
    db.HistoryEntries.AddRange(HistoryFactory.ForCreate(entry));
    await db.SaveChangesAsync();

    return Results.Created($"/api/trackers/{id}/entries/{entry.Id}", entry.ToDto());
});

api.MapPut("/trackers/{id:guid}/entries/{entryId:guid}", async (
    Guid id, Guid entryId, UpdateStringEntryDto dto, AppDbContext db, HttpRequest request) =>
{
    var tracker = await db.Trackers.FindAsync(id);
    if (tracker is null) return Results.NotFound();
    if (!EditPassword.IsAuthorized(tracker, request)) return Results.Unauthorized();

    var entry = await db.StringEntries
        .Include(s => s.Comments)
        .FirstOrDefaultAsync(s => s.Id == entryId && s.TrackerId == id);
    if (entry is null) return Results.NotFound();

    // Snapshot for history comparison.
    var before = new StringEntry
    {
        Id = entry.Id,
        TrackerId = entry.TrackerId,
        HorizontalWeight = entry.HorizontalWeight,
        VerticalWeight = entry.VerticalWeight,
        StringModel = entry.StringModel,
        Knotting = entry.Knotting,
        DateOfStringing = entry.DateOfStringing
    };

    entry.HorizontalWeight = dto.HorizontalWeight;
    entry.VerticalWeight = dto.VerticalWeight;
    entry.StringModel = dto.StringModel;
    entry.Knotting = dto.Knotting;
    entry.DateOfStringing = DateTime.SpecifyKind(dto.DateOfStringing, DateTimeKind.Utc);

    db.HistoryEntries.AddRange(HistoryFactory.ForUpdate(before, entry));
    await db.SaveChangesAsync();

    return Results.Ok(entry.ToDto());
});

api.MapDelete("/trackers/{id:guid}/entries/{entryId:guid}", async (
    Guid id, Guid entryId, AppDbContext db, HttpRequest request) =>
{
    var tracker = await db.Trackers.FindAsync(id);
    if (tracker is null) return Results.NotFound();
    if (!EditPassword.IsAuthorized(tracker, request)) return Results.Unauthorized();

    var entry = await db.StringEntries
        .FirstOrDefaultAsync(s => s.Id == entryId && s.TrackerId == id);
    if (entry is null) return Results.NotFound();

    db.HistoryEntries.AddRange(HistoryFactory.ForDelete(entry));
    db.StringEntries.Remove(entry);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

// --- Comments -------------------------------------------------------------

api.MapPost("/trackers/{id:guid}/entries/{entryId:guid}/comments", async (
    Guid id, Guid entryId, CreateCommentDto dto, AppDbContext db, HttpRequest request) =>
{
    if (string.IsNullOrWhiteSpace(dto.Text))
        return Results.BadRequest("Comment text is required.");

    var tracker = await db.Trackers.FindAsync(id);
    if (tracker is null) return Results.NotFound();
    if (!EditPassword.IsAuthorized(tracker, request)) return Results.Unauthorized();

    var entry = await db.StringEntries
        .FirstOrDefaultAsync(s => s.Id == entryId && s.TrackerId == id);
    if (entry is null) return Results.NotFound();

    var comment = new Comment
    {
        Id = Guid.NewGuid(),
        StringEntryId = entryId,
        Text = dto.Text.Trim(),
        CreatedAt = DateTime.UtcNow
    };

    db.Comments.Add(comment);
    db.HistoryEntries.Add(HistoryFactory.ForCommentCreate(entry, comment));
    await db.SaveChangesAsync();

    return Results.Created(
        $"/api/trackers/{id}/entries/{entryId}/comments/{comment.Id}",
        comment.ToDto());
});

api.MapDelete("/trackers/{id:guid}/entries/{entryId:guid}/comments/{commentId:guid}", async (
    Guid id, Guid entryId, Guid commentId, AppDbContext db, HttpRequest request) =>
{
    var tracker = await db.Trackers.FindAsync(id);
    if (tracker is null) return Results.NotFound();
    if (!EditPassword.IsAuthorized(tracker, request)) return Results.Unauthorized();

    var comment = await db.Comments
        .Include(c => c.StringEntry)
        .FirstOrDefaultAsync(c => c.Id == commentId
            && c.StringEntryId == entryId
            && c.StringEntry!.TrackerId == id);
    if (comment is null || comment.StringEntry is null) return Results.NotFound();

    db.HistoryEntries.Add(HistoryFactory.ForCommentDelete(comment.StringEntry, comment));
    db.Comments.Remove(comment);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.MapFallbackToFile("index.html");

app.Run();
