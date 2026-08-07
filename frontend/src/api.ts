export type KnottingTechnique = 2 | 4;

export interface Comment {
  id: string;
  text: string;
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

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const EDIT_PASSWORD_HEADER = "X-Edit-Password";

function editPasswordHeaders(editPassword?: string): Record<string, string> {
  return editPassword ? { [EDIT_PASSWORD_HEADER]: editPassword } : {};
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

  getTracker: (id: string) => request<Tracker>(`/trackers/${id}`),

  getHistory: (id: string) => request<HistoryEntry[]>(`/trackers/${id}/history`),

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
    editPassword?: string
  ) =>
    request<Comment>(`/trackers/${trackerId}/entries/${entryId}/comments`, {
      method: "POST",
      headers: editPasswordHeaders(editPassword),
      body: JSON.stringify({ text }),
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
};
