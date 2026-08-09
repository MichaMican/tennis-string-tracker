using Isopoh.Cryptography.Argon2;
using Microsoft.EntityFrameworkCore;
using TennisStringTracker.Api.Data;
using TennisStringTracker.Api.Models;

namespace TennisStringTracker.Api.Security;

/// <summary>
/// Helpers for stringer account passwords. Uses the same one-way Argon2id
/// hashing as the tracker edit password — only the hash is ever stored.
/// Credentials are supplied per request via headers, mirroring the
/// edit-password pattern used elsewhere in the API.
/// </summary>
public static class StringerAuth
{
    public const string UsernameHeader = "X-Stringer-Username";
    public const string PasswordHeader = "X-Stringer-Password";

    public static string Hash(string password) =>
        Argon2.Hash(password, type: Argon2Type.HybridAddressing);

    public static bool Verify(string hash, string password) =>
        Argon2.Verify(hash, password);

    /// <summary>
    /// Resolves the authenticated stringer from the request headers, or null
    /// when the credentials are missing or invalid.
    /// </summary>
    public static async Task<Stringer?> AuthenticateAsync(AppDbContext db, HttpRequest request)
    {
        var username = request.Headers[UsernameHeader].ToString().Trim();
        var password = request.Headers[PasswordHeader].ToString();
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            return null;

        var normalized = username.ToLowerInvariant();
        var stringer = await db.Stringers
            .FirstOrDefaultAsync(s => s.Username == normalized);
        if (stringer is null) return null;

        return Verify(stringer.PasswordHash, password) ? stringer : null;
    }
}
