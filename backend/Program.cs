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

api.MapGet("/trackers/{id:guid}", async (Guid id, AppDbContext db, HttpRequest request) =>
{
    var tracker = await db.Trackers
        .Include(t => t.StringEntries)
            .ThenInclude(s => s.Comments)
        .FirstOrDefaultAsync(t => t.Id == id);

    if (tracker is null) return Results.NotFound();

    // Stringer comments are internal notes and only exposed to editors.
    var includeStringerComments = EditPassword.IsAuthorized(tracker, request);
    return Results.Ok(tracker.ToDto(includeStringerComments));
});

api.MapGet("/trackers/{id:guid}/history", async (Guid id, AppDbContext db, HttpRequest request) =>
{
    var tracker = await db.Trackers.FindAsync(id);
    if (tracker is null) return Results.NotFound();

    // Changes to stringer comments must not leak to players.
    var includeStringerComments = EditPassword.IsAuthorized(tracker, request);

    var history = await db.HistoryEntries
        .Where(h => h.TrackerId == id)
        .Where(h => includeStringerComments
            || h.Field != HistoryFactory.StringerCommentField)
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

    return Results.Created($"/api/trackers/{id}/entries/{entry.Id}", entry.ToDto(true));
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

    return Results.Ok(entry.ToDto(true));
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

const int MaxCommentLength = 2000;

api.MapPost("/trackers/{id:guid}/entries/{entryId:guid}/comments", async (
    Guid id, Guid entryId, CreateCommentDto dto, AppDbContext db, HttpRequest request) =>
{
    if (string.IsNullOrWhiteSpace(dto.Text))
        return Results.BadRequest("Comment text is required.");
    if (dto.Text.Length > MaxCommentLength)
        return Results.BadRequest($"Comment text must be at most {MaxCommentLength} characters.");

    var tracker = await db.Trackers.FindAsync(id);
    if (tracker is null) return Results.NotFound();

    // Players may comment on any tracker they have the link to; stringer notes
    // are internal and stay behind the edit password. The requested author only
    // ever restricts access here — creating a stringer note still requires the
    // password, so it cannot be used to gain privileges.
    var author = dto.Author ?? CommentAuthor.Player;
    if (author == CommentAuthor.Stringer && !EditPassword.IsAuthorized(tracker, request))
        return Results.Unauthorized();

    var entry = await db.StringEntries
        .FirstOrDefaultAsync(s => s.Id == entryId && s.TrackerId == id);
    if (entry is null) return Results.NotFound();

    var comment = new Comment
    {
        Id = Guid.NewGuid(),
        StringEntryId = entryId,
        Text = dto.Text.Trim(),
        Author = author,
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

// --- Stringers --------------------------------------------------------------

const int MaxUsernameLength = 64;
const int MaxBookmarkNameLength = 200;
const int MaxTagLength = 50;
const int MaxTags = 20;

static List<string> NormalizeTags(List<string>? tags) =>
    (tags ?? new List<string>())
        .Select(t => t.Trim())
        .Where(t => t.Length > 0)
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .Take(MaxTags)
        .ToList();

api.MapPost("/stringers/register", async (RegisterStringerDto dto, AppDbContext db) =>
{
    var username = dto.Username?.Trim().ToLowerInvariant() ?? "";
    if (username.Length is < 3 or > MaxUsernameLength)
        return Results.BadRequest($"Username must be between 3 and {MaxUsernameLength} characters.");
    if (string.IsNullOrEmpty(dto.Password) || dto.Password.Length < 6)
        return Results.BadRequest("Password must be at least 6 characters.");

    if (await db.Stringers.AnyAsync(s => s.Username == username))
        return Results.Conflict("Username is already taken.");

    var stringer = new Stringer
    {
        Id = Guid.NewGuid(),
        Username = username,
        PasswordHash = StringerAuth.Hash(dto.Password),
        CreatedAt = DateTime.UtcNow
    };
    db.Stringers.Add(stringer);
    await db.SaveChangesAsync();

    return Results.Created($"/api/stringers/{stringer.Id}",
        new StringerDto(stringer.Id, stringer.Username, stringer.CreatedAt));
});

api.MapPost("/stringers/login", async (AppDbContext db, HttpRequest request) =>
{
    var stringer = await StringerAuth.AuthenticateAsync(db, request);
    return stringer is null
        ? Results.Unauthorized()
        : Results.Ok(new StringerDto(stringer.Id, stringer.Username, stringer.CreatedAt));
});

api.MapGet("/stringers/bookmarks", async (AppDbContext db, HttpRequest request) =>
{
    var stringer = await StringerAuth.AuthenticateAsync(db, request);
    if (stringer is null) return Results.Unauthorized();

    var bookmarks = await db.TrackerBookmarks
        .Where(b => b.StringerId == stringer.Id)
        .OrderByDescending(b => b.CreatedAt)
        .ToListAsync();

    return Results.Ok(bookmarks.Select(b => b.ToDto()).ToList());
});

api.MapPost("/stringers/bookmarks", async (
    CreateBookmarkDto dto, AppDbContext db, HttpRequest request) =>
{
    var stringer = await StringerAuth.AuthenticateAsync(db, request);
    if (stringer is null) return Results.Unauthorized();

    if (dto.Name is { Length: > MaxBookmarkNameLength })
        return Results.BadRequest($"Name must be at most {MaxBookmarkNameLength} characters.");
    if (dto.Tags?.Any(t => t.Length > MaxTagLength) == true)
        return Results.BadRequest($"Tags must be at most {MaxTagLength} characters each.");

    var trackerExists = await db.Trackers.AnyAsync(t => t.Id == dto.TrackerId);
    if (!trackerExists) return Results.NotFound("Tracker not found.");

    var alreadyBookmarked = await db.TrackerBookmarks
        .AnyAsync(b => b.StringerId == stringer.Id && b.TrackerId == dto.TrackerId);
    if (alreadyBookmarked) return Results.Conflict("Tracker is already bookmarked.");

    var bookmark = new TrackerBookmark
    {
        Id = Guid.NewGuid(),
        StringerId = stringer.Id,
        TrackerId = dto.TrackerId,
        Name = string.IsNullOrWhiteSpace(dto.Name) ? null : dto.Name.Trim(),
        Tags = NormalizeTags(dto.Tags),
        CreatedAt = DateTime.UtcNow
    };

    db.TrackerBookmarks.Add(bookmark);
    await db.SaveChangesAsync();

    return Results.Created($"/api/stringers/bookmarks/{bookmark.Id}", bookmark.ToDto());
});

api.MapPut("/stringers/bookmarks/{bookmarkId:guid}", async (
    Guid bookmarkId, UpdateBookmarkDto dto, AppDbContext db, HttpRequest request) =>
{
    var stringer = await StringerAuth.AuthenticateAsync(db, request);
    if (stringer is null) return Results.Unauthorized();

    if (dto.Name is { Length: > MaxBookmarkNameLength })
        return Results.BadRequest($"Name must be at most {MaxBookmarkNameLength} characters.");
    if (dto.Tags?.Any(t => t.Length > MaxTagLength) == true)
        return Results.BadRequest($"Tags must be at most {MaxTagLength} characters each.");

    var bookmark = await db.TrackerBookmarks
        .FirstOrDefaultAsync(b => b.Id == bookmarkId && b.StringerId == stringer.Id);
    if (bookmark is null) return Results.NotFound();

    bookmark.Name = string.IsNullOrWhiteSpace(dto.Name) ? null : dto.Name.Trim();
    bookmark.Tags = NormalizeTags(dto.Tags);
    await db.SaveChangesAsync();

    return Results.Ok(bookmark.ToDto());
});

api.MapDelete("/stringers/bookmarks/{bookmarkId:guid}", async (
    Guid bookmarkId, AppDbContext db, HttpRequest request) =>
{
    var stringer = await StringerAuth.AuthenticateAsync(db, request);
    if (stringer is null) return Results.Unauthorized();

    var bookmark = await db.TrackerBookmarks
        .FirstOrDefaultAsync(b => b.Id == bookmarkId && b.StringerId == stringer.Id);
    if (bookmark is null) return Results.NotFound();

    db.TrackerBookmarks.Remove(bookmark);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.MapFallbackToFile("index.html");

app.Run();
