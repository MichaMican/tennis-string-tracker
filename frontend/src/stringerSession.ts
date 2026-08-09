import type { StringerCredentials } from "./api";

/**
 * In-memory holder for the stringer credentials. Keeping them out of
 * web storage means the password is never persisted in clear text; the
 * login survives in-app navigation but not a full page reload.
 */
let credentials: StringerCredentials | null = null;

export function getStringerCredentials(): StringerCredentials | null {
  return credentials;
}

export function setStringerCredentials(value: StringerCredentials | null) {
  credentials = value;
}
