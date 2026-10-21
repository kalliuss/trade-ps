// Supabase Edge Function: search-games
// Uygulama -> bu fonksiyon -> RAWG API. RAWG anahtarı telefonda hiç görünmez.
// Gerekli secret: RAWG_API_KEY

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// RAWG platform id'leri: 18 = PlayStation 4, 187 = PlayStation 5
const PS_PLATFORM_IDS = "18,187";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1) Sadece giriş yapmış kullanıcılar arama yapabilsin
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    // 2) Girdiyi doğrula
    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (query.length < 2 || query.length > 60) {
      return json({ error: "query must be 2-60 characters" }, 400);
    }

    // 3) RAWG'da ara (sadece PS4 / PS5 oyunları)
    const apiKey = Deno.env.get("RAWG_API_KEY");
    if (!apiKey) return json({ error: "server not configured" }, 500);

    const url = new URL("https://api.rawg.io/api/games");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("search", query);
    url.searchParams.set("platforms", PS_PLATFORM_IDS);
    url.searchParams.set("page_size", "10");

    const res = await fetch(url);
    if (!res.ok) return json({ error: "game search failed" }, 502);
    const data = await res.json();

    // 4) Uygulamanın ihtiyacı olan alanları döndür
    const results = (data.results ?? []).map((g: any) => {
      const names: string[] = (g.platforms ?? []).map((p: any) => p.platform?.name);
      const platforms: string[] = [];
      if (names.includes("PlayStation 4")) platforms.push("PS4");
      if (names.includes("PlayStation 5")) platforms.push("PS5");
      return {
        id: g.id,
        name: g.name,
        slug: g.slug,
        cover_url: g.background_image ?? null,
        released: g.released ?? null,
        platforms,
      };
    });

    return json({ results });
  } catch (_err) {
    return json({ error: "unexpected error" }, 500);
  }
});
