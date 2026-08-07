using Isopoh.Cryptography.Argon2;
using TennisStringTracker.Api.Models;

namespace TennisStringTracker.Api.Security;

/// <summary>
/// Helpers for hashing and verifying the optional per-tracker edit password
/// using Argon2id. Only the one-way hash is ever stored.
/// </summary>
public static class EditPassword
{
    public const string HeaderName = "X-Edit-Password";

    public static string Hash(string password) =>
        Argon2.Hash(password, type: Argon2Type.HybridAddressing);

    public static bool Verify(string hash, string password) =>
        Argon2.Verify(hash, password);

    /// <summary>
    /// Checks the edit password supplied via the request header against the
    /// tracker's stored hash. Returns true when the tracker is unprotected or
    /// the password matches.
    /// </summary>
    public static bool IsAuthorized(Tracker tracker, HttpRequest request)
    {
        if (tracker.EditPasswordHash is null) return true;

        var supplied = request.Headers[HeaderName].ToString();
        return !string.IsNullOrEmpty(supplied)
            && Verify(tracker.EditPasswordHash, supplied);
    }
}
