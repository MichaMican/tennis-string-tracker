const tracker = {
  id: "11111111-1111-1111-1111-111111111111",
  createdAt: new Date().toISOString(),
  hasEditPassword: false,
  stringEntries: [
    {
      id: "22222222-2222-2222-2222-222222222222",
      horizontalWeight: 24,
      verticalWeight: 23,
      stringModel: "Luxilon",
      knotting: 4,
      dateOfStringing: "2026-01-01",
      createdAt: new Date().toISOString(),
      comments: [],
    },
  ],
};
const origFetch = window.fetch;
window.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input.url;
  const method = (init?.method ?? "GET").toUpperCase();
  console.log("MOCK FETCH", method, url, init?.body);
  if (url.includes("/comments") && method === "POST") {
    const body = JSON.parse(init.body);
    tracker.stringEntries[0].comments.push({
      id: crypto.randomUUID(),
      text: body.text,
      author: body.author,
      createdAt: new Date().toISOString(),
    });
    return new Response(JSON.stringify(tracker.stringEntries[0].comments.at(-1)), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify(tracker), { status: 200, headers: { "Content-Type": "application/json" } });
};
void origFetch;
