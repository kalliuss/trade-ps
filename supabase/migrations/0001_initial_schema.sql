-- Bu migration Supabase SQL Editor'den zaten uygulandı, tekrar çalıştırma.

-- =====================================================================
-- PS OYUN TAKAS UYGULAMASI - Supabase şeması (v1)
-- Supabase paneli > SQL Editor'e yapıştırıp tek seferde çalıştır.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. EKLENTİLER
-- ---------------------------------------------------------------------
create extension if not exists postgis with schema extensions;

-- ---------------------------------------------------------------------
-- 1. TABLOLAR
-- ---------------------------------------------------------------------

-- Herkese açık profil bilgisi (konum burada YOK, ayrı tabloda)
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  display_name  text,
  avatar_url    text,
  bio           text check (char_length(bio) <= 300),
  rating_avg    numeric(3,2) not null default 0,
  rating_count  int not null default 0,
  created_at    timestamptz not null default now()
);

-- Konum özeldir: sadece sahibi görür. Koordinatlar ~1 km'ye yuvarlanır.
create table public.profile_locations (
  user_id          uuid primary key references public.profiles(id) on delete cascade,
  location         extensions.geography(point, 4326),
  city             text,
  use_location     boolean not null default false,
  max_distance_km  int not null default 25 check (max_distance_km between 1 and 200),
  updated_at       timestamptz not null default now()
);

-- RAWG'dan gelen oyun kataloğu (önbellek)
create table public.games (
  id         bigint primary key,            -- RAWG oyun id'si
  name       text not null,
  slug       text,
  cover_url  text,
  created_at timestamptz not null default now()
);

-- Kullanıcının envanterindeki oyunlar
create table public.listings (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  game_id     bigint not null references public.games(id),
  platform    text not null check (platform in ('PS4','PS5')),
  condition   text not null check (condition in ('new','like_new','good','fair')),
  description text check (char_length(description) <= 500),
  photo_urls  text[] not null check (array_length(photo_urls, 1) between 1 and 5),
  status      text not null default 'open'
              check (status in ('open','reserved','swapped','removed')),
  created_at  timestamptz not null default now()
);
create index listings_owner_idx  on public.listings(owner_id);
create index listings_status_idx on public.listings(status);

-- Kaydırma geçmişi (aynı ilan tekrar karşına çıkmasın)
create table public.swipes (
  swiper_id  uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  direction  text not null check (direction in ('left','right')),
  created_at timestamptz not null default now(),
  primary key (swiper_id, listing_id)
);

-- Takas istekleri
create table public.swap_requests (
  id                  uuid primary key default gen_random_uuid(),
  requester_id        uuid not null references public.profiles(id) on delete cascade,
  owner_id            uuid not null references public.profiles(id) on delete cascade,
  target_listing_id   uuid not null references public.listings(id) on delete cascade,
  offered_listing_id  uuid not null references public.listings(id) on delete cascade,
  status              text not null default 'pending'
                      check (status in ('pending','accepted','declined','cancelled','completed')),
  requester_confirmed boolean not null default false,
  owner_confirmed     boolean not null default false,
  created_at          timestamptz not null default now(),
  responded_at        timestamptz,
  check (requester_id <> owner_id)
);
create unique index swap_requests_no_duplicate
  on public.swap_requests(requester_id, target_listing_id)
  where status in ('pending','accepted');
create index swap_requests_owner_idx     on public.swap_requests(owner_id, status);
create index swap_requests_requester_idx on public.swap_requests(requester_id, status);

-- Sohbet (istek kabul edilince açılır)
create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  swap_request_id uuid not null unique references public.swap_requests(id) on delete cascade,
  user_a          uuid not null references public.profiles(id) on delete cascade,
  user_b          uuid not null references public.profiles(id) on delete cascade,
  created_at      timestamptz not null default now()
);

create table public.messages (
  id              bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 2000),
  created_at      timestamptz not null default now()
);
create index messages_conv_idx on public.messages(conversation_id, created_at);

-- Karşılıklı puanlama (sadece tamamlanan takaslar için)
create table public.ratings (
  id              uuid primary key default gen_random_uuid(),
  swap_request_id uuid not null references public.swap_requests(id) on delete cascade,
  rater_id        uuid not null references public.profiles(id) on delete cascade,
  ratee_id        uuid not null references public.profiles(id) on delete cascade,
  score           smallint not null check (score between 1 and 5),
  comment         text check (char_length(comment) <= 300),
  created_at      timestamptz not null default now(),
  unique (swap_request_id, rater_id),
  check (rater_id <> ratee_id)
);

-- Engelleme ve şikayet
create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id       uuid references public.listings(id) on delete set null,
  reason           text not null check (reason in ('scam','fake_listing','harassment','inappropriate','no_show','other')),
  details          text check (char_length(details) <= 1000),
  status           text not null default 'open' check (status in ('open','reviewed','dismissed')),
  created_at       timestamptz not null default now(),
  check (reporter_id <> reported_user_id)
);
create index reports_reported_idx on public.reports(reported_user_id, created_at);

-- ---------------------------------------------------------------------
-- 2. YARDIMCI FONKSİYON VE TRIGGER'LAR
-- ---------------------------------------------------------------------

-- İki kullanıcıdan biri diğerini engellediyse true
create or replace function public.is_blocked(a uuid, b uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  );
$$;

-- Yeni kullanıcı kaydolunca profil oluştur
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'display_name'
  );
  insert into public.profile_locations (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Puan eklenince profildeki ortalamayı güncelle
create or replace function public.update_rating_aggregate()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles p
  set rating_avg   = coalesce((select round(avg(score)::numeric, 2) from public.ratings where ratee_id = new.ratee_id), 0),
      rating_count = (select count(*) from public.ratings where ratee_id = new.ratee_id)
  where p.id = new.ratee_id;
  return new;
end;
$$;

create trigger on_rating_created
  after insert on public.ratings
  for each row execute function public.update_rating_aggregate();

-- ---------------------------------------------------------------------
-- 3. UYGULAMA FONKSİYONLARI (tüm kritik işlemler sunucu tarafında)
-- ---------------------------------------------------------------------

-- Konum ayarla. Koordinat ~1 km'ye yuvarlanır (kesin adres saklanmaz).
create or replace function public.set_my_location(
  p_lat double precision,
  p_lng double precision,
  p_city text,
  p_use_location boolean,
  p_max_distance_km int default 25
) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  update public.profile_locations
  set location = case
        when p_lat is null or p_lng is null then null
        else st_setsrid(st_makepoint(round(p_lng::numeric, 2)::float8, round(p_lat::numeric, 2)::float8), 4326)::geography
      end,
      city = p_city,
      use_location = p_use_location,
      max_distance_km = greatest(1, least(coalesce(p_max_distance_km, 25), 200)),
      updated_at = now()
  where user_id = auth.uid();
end;
$$;

-- İlan oluştur (oyunu katalogda yoksa ekler)
create or replace function public.create_listing(
  p_rawg_id bigint,
  p_name text,
  p_slug text,
  p_cover_url text,
  p_platform text,
  p_condition text,
  p_description text,
  p_photo_urls text[]
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  insert into public.games (id, name, slug, cover_url)
  values (p_rawg_id, p_name, p_slug, p_cover_url)
  on conflict (id) do nothing;

  insert into public.listings (owner_id, game_id, platform, condition, description, photo_urls)
  values (auth.uid(), p_rawg_id, p_platform, p_condition, p_description, p_photo_urls)
  returning id into v_id;

  return v_id;
end;
$$;

-- İlanı kaldır (sadece 'open' durumdaysa)
create or replace function public.remove_listing(p_listing_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.listings
  set status = 'removed'
  where id = p_listing_id and owner_id = auth.uid() and status = 'open';
  if not found then
    raise exception 'listing cannot be removed (not yours or not open)';
  end if;
  -- bekleyen istekleri iptal et
  update public.swap_requests
  set status = 'cancelled', responded_at = now()
  where status = 'pending'
    and (target_listing_id = p_listing_id or offered_listing_id = p_listing_id);
end;
$$;

-- Kart akışı: engel, konum, görünürlük kuralları burada uygulanır
create or replace function public.get_feed(p_limit int default 20)
returns table (
  listing_id    uuid,
  game_id       bigint,
  game_name     text,
  cover_url     text,
  platform      text,
  condition     text,
  description   text,
  photo_urls    text[],
  owner_id      uuid,
  owner_username text,
  owner_rating_avg numeric,
  owner_rating_count int,
  distance_km   numeric
)
language sql stable security definer set search_path = public, extensions as $$
  select
    l.id, l.game_id, g.name, g.cover_url, l.platform, l.condition, l.description, l.photo_urls,
    l.owner_id, p.username, p.rating_avg, p.rating_count,
    case
      when coalesce(me.use_location, false) and me.location is not null and ol.location is not null
      then round((st_distance(me.location, ol.location) / 1000)::numeric, 1)
    end
  from public.listings l
  join public.games g    on g.id = l.game_id
  join public.profiles p on p.id = l.owner_id
  left join public.profile_locations me on me.user_id = auth.uid()
  left join public.profile_locations ol on ol.user_id = l.owner_id
  where auth.uid() is not null
    and l.status = 'open'
    and l.owner_id <> auth.uid()
    -- daha önce kaydırılmış ilanlar gelmesin
    and not exists (select 1 from public.swipes s where s.swiper_id = auth.uid() and s.listing_id = l.id)
    -- engellenenler / engelleyenler gelmesin
    and not public.is_blocked(auth.uid(), l.owner_id)
    -- konum filtresi (kullanıcı açtıysa)
    and (
      not coalesce(me.use_location, false)
      or me.location is null
      or (ol.location is not null and st_dwithin(me.location, ol.location, me.max_distance_km * 1000))
    )
    -- GÖRÜNÜRLÜK: en az 3 puanı olup ortalaması 2.5 altındaysa gizle
    and not (p.rating_count >= 3 and p.rating_avg < 2.5)
    -- GÖRÜNÜRLÜK: son 90 günde 3 farklı kişiden şikayet aldıysa gizle
    and (
      select count(distinct r.reporter_id) from public.reports r
      where r.reported_user_id = l.owner_id and r.created_at > now() - interval '90 days'
    ) < 3
  order by
    -- düşük puanlılar listenin sonuna iner (ama gizlenmez)
    (case when p.rating_count >= 3 and p.rating_avg < 3.5 then 1 else 0 end),
    random()
  limit least(greatest(p_limit, 1), 50);
$$;

-- Sola kaydır = istemiyorum
create or replace function public.record_swipe_left(p_listing_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public.swipes (swiper_id, listing_id, direction)
  values (auth.uid(), p_listing_id, 'left')
  on conflict (swiper_id, listing_id) do nothing;
end;
$$;

-- Sağa kaydır = kendi oyunumu teklif ederek istek gönder
create or replace function public.send_swap_request(p_target_listing_id uuid, p_offered_listing_id uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_id uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  -- spam koruması: 24 saatte en fazla 50 istek
  if (select count(*) from public.swap_requests
      where requester_id = v_uid and created_at > now() - interval '24 hours') >= 50 then
    raise exception 'daily request limit reached';
  end if;

  select owner_id into v_owner
  from public.listings where id = p_target_listing_id and status = 'open';
  if v_owner is null then raise exception 'target listing not available'; end if;
  if v_owner = v_uid then raise exception 'cannot request your own listing'; end if;
  if public.is_blocked(v_uid, v_owner) then raise exception 'not allowed'; end if;

  if not exists (select 1 from public.listings
                 where id = p_offered_listing_id and owner_id = v_uid and status = 'open') then
    raise exception 'offered listing must be your own open listing';
  end if;

  insert into public.swipes (swiper_id, listing_id, direction)
  values (v_uid, p_target_listing_id, 'right')
  on conflict (swiper_id, listing_id) do update set direction = 'right';

  insert into public.swap_requests (requester_id, owner_id, target_listing_id, offered_listing_id)
  values (v_uid, v_owner, p_target_listing_id, p_offered_listing_id)
  returning id into v_id;

  return v_id;
end;
$$;

-- Gelen isteği kabul et / reddet. Kabulde sohbet açılır.
create or replace function public.respond_swap_request(p_request_id uuid, p_accept boolean)
returns uuid  -- kabulde conversation id, redde null
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_req public.swap_requests%rowtype;
  v_conv uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  select * into v_req from public.swap_requests
  where id = p_request_id for update;

  if not found or v_req.owner_id <> v_uid or v_req.status <> 'pending' then
    raise exception 'request not found or not pending';
  end if;

  if not p_accept then
    update public.swap_requests set status = 'declined', responded_at = now() where id = v_req.id;
    return null;
  end if;

  if public.is_blocked(v_req.requester_id, v_req.owner_id) then
    update public.swap_requests set status = 'cancelled', responded_at = now() where id = v_req.id;
    raise exception 'not allowed';
  end if;

  -- iki ilan da hâlâ müsait mi?
  if (select count(*) from public.listings
      where id in (v_req.target_listing_id, v_req.offered_listing_id) and status = 'open') < 2 then
    update public.swap_requests set status = 'cancelled', responded_at = now() where id = v_req.id;
    raise exception 'one of the listings is no longer available';
  end if;

  update public.swap_requests set status = 'accepted', responded_at = now() where id = v_req.id;

  -- iki ilanı da rezerve et (akıştan düşer)
  update public.listings set status = 'reserved'
  where id in (v_req.target_listing_id, v_req.offered_listing_id);

  -- bu ilanlara ait diğer bekleyen istekleri iptal et
  update public.swap_requests set status = 'cancelled', responded_at = now()
  where status = 'pending' and id <> v_req.id
    and (target_listing_id  in (v_req.target_listing_id, v_req.offered_listing_id)
      or offered_listing_id in (v_req.target_listing_id, v_req.offered_listing_id));

  insert into public.conversations (swap_request_id, user_a, user_b)
  values (v_req.id, v_req.requester_id, v_req.owner_id)
  returning id into v_conv;

  return v_conv;
end;
$$;

-- Yüz yüze takas gerçekleşti: iki taraf da onaylayınca tamamlanır
create or replace function public.confirm_swap(p_request_id uuid)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_req public.swap_requests%rowtype;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  select * into v_req from public.swap_requests where id = p_request_id for update;
  if not found or v_req.status <> 'accepted' or v_uid not in (v_req.requester_id, v_req.owner_id) then
    raise exception 'request not found or not accepted';
  end if;

  if v_uid = v_req.requester_id then
    update public.swap_requests set requester_confirmed = true where id = v_req.id;
    v_req.requester_confirmed := true;
  else
    update public.swap_requests set owner_confirmed = true where id = v_req.id;
    v_req.owner_confirmed := true;
  end if;

  if v_req.requester_confirmed and v_req.owner_confirmed then
    update public.swap_requests set status = 'completed' where id = v_req.id;
    update public.listings set status = 'swapped'
    where id in (v_req.target_listing_id, v_req.offered_listing_id);
    return 'completed';
  end if;
  return 'waiting_other_side';
end;
$$;

-- İptal: bekleyen isteği gönderen geri çekebilir; kabul edilmiş takası iki taraf da iptal edebilir
create or replace function public.cancel_swap(p_request_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_req public.swap_requests%rowtype;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  select * into v_req from public.swap_requests where id = p_request_id for update;
  if not found then raise exception 'request not found'; end if;

  if v_req.status = 'pending' and v_uid = v_req.requester_id then
    update public.swap_requests set status = 'cancelled', responded_at = now() where id = v_req.id;
  elsif v_req.status = 'accepted' and v_uid in (v_req.requester_id, v_req.owner_id) then
    update public.swap_requests set status = 'cancelled', responded_at = now() where id = v_req.id;
    update public.listings set status = 'open'
    where id in (v_req.target_listing_id, v_req.offered_listing_id) and status = 'reserved';
  else
    raise exception 'cannot cancel this request';
  end if;
end;
$$;

-- Tamamlanan takas sonrası karşı tarafı puanla
create or replace function public.submit_rating(p_request_id uuid, p_score int, p_comment text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_req public.swap_requests%rowtype;
  v_ratee uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  select * into v_req from public.swap_requests where id = p_request_id;
  if not found or v_req.status <> 'completed' or v_uid not in (v_req.requester_id, v_req.owner_id) then
    raise exception 'you can only rate completed swaps you took part in';
  end if;

  v_ratee := case when v_uid = v_req.requester_id then v_req.owner_id else v_req.requester_id end;

  insert into public.ratings (swap_request_id, rater_id, ratee_id, score, comment)
  values (p_request_id, v_uid, v_ratee, p_score, p_comment);
end;
$$;

-- Fonksiyon yetkileri: sadece giriş yapmış kullanıcılar çağırabilsin
revoke all on function
  public.set_my_location(double precision, double precision, text, boolean, int),
  public.create_listing(bigint, text, text, text, text, text, text, text[]),
  public.remove_listing(uuid),
  public.get_feed(int),
  public.record_swipe_left(uuid),
  public.send_swap_request(uuid, uuid),
  public.respond_swap_request(uuid, boolean),
  public.confirm_swap(uuid),
  public.cancel_swap(uuid),
  public.submit_rating(uuid, int, text),
  public.is_blocked(uuid, uuid)
from public, anon;

grant execute on function
  public.set_my_location(double precision, double precision, text, boolean, int),
  public.create_listing(bigint, text, text, text, text, text, text, text[]),
  public.remove_listing(uuid),
  public.get_feed(int),
  public.record_swipe_left(uuid),
  public.send_swap_request(uuid, uuid),
  public.respond_swap_request(uuid, boolean),
  public.confirm_swap(uuid),
  public.cancel_swap(uuid),
  public.submit_rating(uuid, int, text),
  public.is_blocked(uuid, uuid)
to authenticated;

-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.profile_locations enable row level security;
alter table public.games             enable row level security;
alter table public.listings          enable row level security;
alter table public.swipes            enable row level security;
alter table public.swap_requests     enable row level security;
alter table public.conversations     enable row level security;
alter table public.messages          enable row level security;
alter table public.ratings           enable row level security;
alter table public.blocks            enable row level security;
alter table public.reports           enable row level security;

-- Doğrudan yazma yolunu kapat: bu tablolara sadece fonksiyonlar yazar
revoke insert, update, delete on
  public.games, public.swipes, public.swap_requests,
  public.conversations, public.ratings
from authenticated, anon;

revoke insert, delete on public.listings, public.profiles from authenticated, anon;

-- Profil: sadece belirli sütunlar güncellenebilir (puan alanları korunur)
revoke update on public.profiles from authenticated, anon;
grant update (username, display_name, avatar_url, bio) on public.profiles to authenticated;

-- İlan: sadece açıklama, durum bilgisi hariç alanlar güncellenebilir
revoke update on public.listings from authenticated, anon;
grant update (description, condition, photo_urls) on public.listings to authenticated;

-- profiles
create policy "profiles_select" on public.profiles for select to authenticated
  using (not public.is_blocked(auth.uid(), id));
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- profile_locations (tamamen özel)
create policy "locations_own" on public.profile_locations for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- games
create policy "games_select" on public.games for select to authenticated using (true);

-- listings
create policy "listings_select" on public.listings for select to authenticated
  using (owner_id = auth.uid()
         or (status <> 'removed' and not public.is_blocked(auth.uid(), owner_id)));
create policy "listings_update_own" on public.listings for update to authenticated
  using (owner_id = auth.uid() and status = 'open')
  with check (owner_id = auth.uid());

-- swipes
create policy "swipes_select_own" on public.swipes for select to authenticated
  using (swiper_id = auth.uid());

-- swap_requests
create policy "swaps_select_participant" on public.swap_requests for select to authenticated
  using (auth.uid() in (requester_id, owner_id));

-- conversations
create policy "conv_select_participant" on public.conversations for select to authenticated
  using (auth.uid() in (user_a, user_b));

-- messages
create policy "messages_select_participant" on public.messages for select to authenticated
  using (exists (select 1 from public.conversations c
                 where c.id = conversation_id and auth.uid() in (c.user_a, c.user_b)));
create policy "messages_insert_participant" on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and auth.uid() in (c.user_a, c.user_b)
        and not public.is_blocked(c.user_a, c.user_b)
    )
  );

-- ratings
create policy "ratings_select_involved" on public.ratings for select to authenticated
  using (auth.uid() in (rater_id, ratee_id));

-- blocks
create policy "blocks_select_own" on public.blocks for select to authenticated
  using (blocker_id = auth.uid());
create policy "blocks_insert_own" on public.blocks for insert to authenticated
  with check (blocker_id = auth.uid());
create policy "blocks_delete_own" on public.blocks for delete to authenticated
  using (blocker_id = auth.uid());

-- reports
create policy "reports_insert_own" on public.reports for insert to authenticated
  with check (reporter_id = auth.uid());
create policy "reports_select_own" on public.reports for select to authenticated
  using (reporter_id = auth.uid());

-- ---------------------------------------------------------------------
-- 5. REALTIME (RLS'e uyar: kullanıcı sadece kendi satırlarını dinler)
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.messages, public.swap_requests;

-- ---------------------------------------------------------------------
-- 6. STORAGE (fotoğraflar)
-- Dosya yolu formatı: <kullanici_id>/<dosya_adi>
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('listing-photos', 'listing-photos', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('avatars',        'avatars',        true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "storage_insert_own_folder" on storage.objects for insert to authenticated
  with check (bucket_id in ('listing-photos','avatars')
              and (storage.foldername(name))[1] = auth.uid()::text);
create policy "storage_update_own_folder" on storage.objects for update to authenticated
  using (bucket_id in ('listing-photos','avatars')
         and (storage.foldername(name))[1] = auth.uid()::text);
create policy "storage_delete_own_folder" on storage.objects for delete to authenticated
  using (bucket_id in ('listing-photos','avatars')
         and (storage.foldername(name))[1] = auth.uid()::text);
