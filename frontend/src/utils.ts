/** Returns today's date formatted as YYYY-MM-DD for date inputs. */
export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
