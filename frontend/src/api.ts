export type KnottingTechnique = 2 | 4;

export type CommentAuthor = "Player" | "Stringer";

export interface Comment {
  id: string;
  text: string;
  author: CommentAuthor;
  createdAt: string;
}

export interface StringEntry {
  id: string;
  horizontalWeight: number | null;
  verticalWeight: number | null;
  stringModel: string | null;
  knotting: KnottingTechnique | null;
  dateOfStringing: string;
  createdAt: string;
  comments: Comment[];
}

export interface Tracker {
  id: string;
  createdAt: string;
  hasEditPassword: boolean;
  stringEntries: StringEntry[];
}

export type HistoryAction = "Create" | "Update" | "Delete";

export interface HistoryEntry {
  id: string;
  entityType: string;
  entityId: string;
  entityLabel: string | null;
  action: HistoryAction;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
}

export interface StringEntryInput {
  horizontalWeight: number | null;
  verticalWeight: number | null;
  stringModel: string | null;
  knotting: KnottingTechnique | null;
  dateOfStringing: string;
}

export interface Stringer {
  id: string;
  username: string;
  createdAt: string;
}

export interface TrackerBookmark {
  id: string;
  trackerId: string;
  name: string | null;
  tags: string[];
  createdAt: string;
  /** Weights of the tracker's most recent string entry, if any. */
  latestHorizontalWeight: number | null;
  latestVerticalWeight: number | null;
  latestDateOfStringing: string | null;
}

export interface StringerCredentials {
  username: string;
  password: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const EDIT_PASSWORD_HEADER = "X-Edit-Password";

function editPasswordHeaders(editPassword?: string): Record<string, string> {
  return editPassword ? { [EDIT_PASSWORD_HEADER]: editPassword } : {};
}

const STRINGER_USERNAME_HEADER = "X-Stringer-Username";
const STRINGER_PASSWORD_HEADER = "X-Stringer-Password";

function stringerHeaders(creds: StringerCredentials): Record<string, string> {
  return {
    [STRINGER_USERNAME_HEADER]: creds.username,
    [STRINGER_PASSWORD_HEADER]: creds.password,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  // Only advertise a JSON body when we actually send one.
  if (init?.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.text();
      if (body) message = body;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  createTracker: (editPassword?: string) =>
    request<Tracker>("/trackers", {
      method: "POST",
      body: JSON.stringify({
        editPassword: editPassword?.trim() ? editPassword : null,
      }),
    }),

  getTracker: (id: string, editPassword?: string) =>
    request<Tracker>(`/trackers/${id}`, {
      headers: editPasswordHeaders(editPassword),
    }),

  getHistory: (id: string, editPassword?: string) =>
    request<HistoryEntry[]>(`/trackers/${id}/history`, {
      headers: editPasswordHeaders(editPassword),
    }),

  verifyEditPassword: (trackerId: string, password: string) =>
    request<void>(`/trackers/${trackerId}/verify-edit-password`, {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  createEntry: (trackerId: string, input: StringEntryInput, editPassword?: string) =>
    request<StringEntry>(`/trackers/${trackerId}/entries`, {
      method: "POST",
      headers: editPasswordHeaders(editPassword),
      body: JSON.stringify(input),
    }),

  updateEntry: (
    trackerId: string,
    entryId: string,
    input: StringEntryInput,
    editPassword?: string
  ) =>
    request<StringEntry>(`/trackers/${trackerId}/entries/${entryId}`, {
      method: "PUT",
      headers: editPasswordHeaders(editPassword),
      body: JSON.stringify(input),
    }),

  deleteEntry: (trackerId: string, entryId: string, editPassword?: string) =>
    request<void>(`/trackers/${trackerId}/entries/${entryId}`, {
      method: "DELETE",
      headers: editPasswordHeaders(editPassword),
    }),

  addComment: (
    trackerId: string,
    entryId: string,
    text: string,
    author: CommentAuthor = "Player",
    editPassword?: string
  ) =>
    request<Comment>(`/trackers/${trackerId}/entries/${entryId}/comments`, {
      method: "POST",
      headers: editPasswordHeaders(editPassword),
      body: JSON.stringify({ text, author }),
    }),

  deleteComment: (
    trackerId: string,
    entryId: string,
    commentId: string,
    editPassword?: string
  ) =>
    request<void>(
      `/trackers/${trackerId}/entries/${entryId}/comments/${commentId}`,
      { method: "DELETE", headers: editPasswordHeaders(editPassword) }
    ),

  registerStringer: (username: string, password: string) =>
    request<Stringer>("/stringers/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  loginStringer: (creds: StringerCredentials) =>
    request<Stringer>("/stringers/login", {
      method: "POST",
      headers: stringerHeaders(creds),
    }),

  getBookmarks: (creds: StringerCredentials) =>
    request<TrackerBookmark[]>("/stringers/bookmarks", {
      headers: stringerHeaders(creds),
    }),

  createBookmark: (
    creds: StringerCredentials,
    trackerId: string,
    name?: string | null,
    tags?: string[]
  ) =>
    request<TrackerBookmark>("/stringers/bookmarks", {
      method: "POST",
      headers: stringerHeaders(creds),
      body: JSON.stringify({ trackerId, name: name ?? null, tags: tags ?? [] }),
    }),

  updateBookmark: (
    creds: StringerCredentials,
    bookmarkId: string,
    name: string | null,
    tags: string[]
  ) =>
    request<TrackerBookmark>(`/stringers/bookmarks/${bookmarkId}`, {
      method: "PUT",
      headers: stringerHeaders(creds),
      body: JSON.stringify({ name, tags }),
    }),

  deleteBookmark: (creds: StringerCredentials, bookmarkId: string) =>
    request<void>(`/stringers/bookmarks/${bookmarkId}`, {
      method: "DELETE",
      headers: stringerHeaders(creds),
    }),
};
