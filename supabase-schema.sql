create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique
    check (handle ~ '^[a-z0-9_]{3,20}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.player_garri (
  user_id uuid not null references auth.users(id) on delete cascade,
  garri_type text not null check (garri_type in ('white', 'yellow', 'ijebu')),
  balance numeric(20, 2) not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, garri_type)
);

create table if not exists public.player_game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  save_data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(save_data) = 'object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.garri_transfers (
  id bigint generated always as identity primary key,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  garri_type text not null check (garri_type in ('white', 'yellow', 'ijebu')),
  amount numeric(20, 2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

alter table public.player_profiles enable row level security;
alter table public.player_garri enable row level security;
alter table public.player_game_saves enable row level security;
alter table public.garri_transfers enable row level security;

drop policy if exists "Players can read their own profile" on public.player_profiles;
create policy "Players can read their own profile"
  on public.player_profiles for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Players can read their own Garri" on public.player_garri;
create policy "Players can read their own Garri"
  on public.player_garri for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Players can read their own game save" on public.player_game_saves;
create policy "Players can read their own game save"
  on public.player_game_saves for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Players can create their own game save" on public.player_game_saves;
create policy "Players can create their own game save"
  on public.player_game_saves for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Players can update their own game save" on public.player_game_saves;
create policy "Players can update their own game save"
  on public.player_game_saves for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Players can read transfers they sent or received" on public.garri_transfers;
create policy "Players can read transfers they sent or received"
  on public.garri_transfers for select
  to authenticated
  using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()));

revoke all on public.player_profiles, public.player_garri, public.player_game_saves, public.garri_transfers from anon, authenticated;
grant select on public.player_profiles, public.player_garri, public.player_game_saves to authenticated;
grant insert, update on public.player_game_saves to authenticated;
grant select on public.garri_transfers to authenticated;

create or replace function public.create_player_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_handle text;
begin
  new_handle := lower(new.raw_user_meta_data ->> 'handle');
  if new_handle is null or new_handle !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'Choose a player handle with 3–20 letters, numbers, or underscores.';
  end if;

  insert into public.player_profiles (user_id, handle)
  values (new.id, new_handle);

  insert into public.player_garri (user_id, garri_type, balance)
  values
    (new.id, 'white', 0),
    (new.id, 'yellow', 0),
    (new.id, 'ijebu', 0);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_tap_garri on auth.users;
create trigger on_auth_user_created_tap_garri
  after insert on auth.users
  for each row execute function public.create_player_account();

create or replace function public.claim_garri(p_garri_type text, p_amount numeric)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_player uuid := auth.uid();
  current_total numeric;
  new_balance numeric;
begin
  if current_player is null then
    raise exception 'Sign in before syncing Garri.';
  end if;
  if p_garri_type not in ('white', 'yellow', 'ijebu') then
    raise exception 'Unknown Garri variety.';
  end if;
  if p_amount is null or p_amount::text = 'NaN' or p_amount <= 0
    or p_amount != round(p_amount, 2) or p_amount > 9007199254740991 then
    raise exception 'Garri amount must be positive and have no more than two decimal places.';
  end if;

  perform 1
    from public.player_garri
    where user_id = current_player
    order by garri_type
    for update;
  select coalesce(sum(balance), 0) into current_total
    from public.player_garri
    where user_id = current_player;
  if current_total + p_amount > 9007199254740991 then
    raise exception 'Your total Garri stock has reached the game limit.';
  end if;

  insert into public.player_garri (user_id, garri_type, balance, updated_at)
  values (current_player, p_garri_type, p_amount, now())
  on conflict (user_id, garri_type) do update
    set balance = public.player_garri.balance + excluded.balance,
        updated_at = now()
  returning balance into new_balance;
  return new_balance;
end;
$$;

create or replace function public.transfer_garri(p_handle text, p_garri_type text, p_amount numeric)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  sender uuid := auth.uid();
  recipient uuid;
  recipient_handle text;
  sender_balance numeric;
  recipient_balance numeric;
  recipient_total numeric;
  normalized_handle text := lower(btrim(p_handle));
begin
  if sender is null then
    raise exception 'Sign in before sending Garri.';
  end if;
  if p_garri_type not in ('white', 'yellow', 'ijebu') then
    raise exception 'Unknown Garri variety.';
  end if;
  if p_amount is null or p_amount::text = 'NaN' or p_amount <= 0
    or p_amount != round(p_amount, 2) or p_amount > 9007199254740991 then
    raise exception 'Garri amount must be positive and have no more than two decimal places.';
  end if;

  select user_id, handle into recipient, recipient_handle
    from public.player_profiles
    where handle = normalized_handle;
  if recipient is null then
    raise exception 'No player found with that handle.';
  end if;
  if recipient = sender then
    raise exception 'You cannot send Garri to yourself.';
  end if;

  perform user_id
    from public.player_garri
    where user_id in (sender, recipient)
    order by user_id, garri_type
    for update;

  select coalesce(sum(balance), 0) into recipient_total
    from public.player_garri
    where user_id = recipient;
  if recipient_total + p_amount > 9007199254740991 then
    raise exception 'The recipient has reached the game Garri limit.';
  end if;

  select balance into sender_balance
    from public.player_garri
    where user_id = sender and garri_type = p_garri_type;
  if sender_balance is null or sender_balance < p_amount then
    raise exception 'Not enough Garri for this transfer.';
  end if;

  update public.player_garri
    set balance = balance - p_amount, updated_at = now()
    where user_id = sender and garri_type = p_garri_type
    returning balance into sender_balance;
  update public.player_garri
    set balance = balance + p_amount, updated_at = now()
    where user_id = recipient and garri_type = p_garri_type
    returning balance into recipient_balance;

  insert into public.garri_transfers (sender_id, recipient_id, garri_type, amount)
  values (sender, recipient, p_garri_type, p_amount);

  return jsonb_build_object(
    'sender_balance', sender_balance,
    'recipient_handle', recipient_handle,
    'recipient_balance', recipient_balance,
    'amount', p_amount,
    'garri_type', p_garri_type
  );
end;
$$;

revoke all on function public.create_player_account() from public, anon, authenticated;
revoke all on function public.claim_garri(text, numeric) from public, anon;
revoke all on function public.transfer_garri(text, text, numeric) from public, anon;
grant execute on function public.claim_garri(text, numeric) to authenticated;
grant execute on function public.transfer_garri(text, text, numeric) to authenticated;

-- Leaderboard migration: run this section on projects that already installed
-- the account and save schema above.
create table if not exists public.player_leaderboard (
  user_id uuid primary key references public.player_profiles(user_id) on delete cascade,
  handle text not null,
  best_order bigint not null default 1 check (best_order >= 0),
  tap_level bigint not null default 1 check (tap_level >= 0),
  market_legacy bigint not null default 0 check (market_legacy >= 0),
  congos_packed bigint not null default 0 check (congos_packed >= 0),
  updated_at timestamptz not null default now()
);

alter table public.player_leaderboard enable row level security;

drop policy if exists "Anyone can read the player leaderboard" on public.player_leaderboard;
create policy "Anyone can read the player leaderboard"
  on public.player_leaderboard for select
  to anon, authenticated
  using (true);

revoke all on public.player_leaderboard from anon, authenticated;
grant select on public.player_leaderboard to anon, authenticated;

create or replace function public.set_player_leaderboard_handle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select handle into new.handle
    from public.player_profiles
    where user_id = new.user_id;
  if new.handle is null then
    raise exception 'Create a player account before publishing leaderboard stats.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_player_leaderboard_handle() from public, anon, authenticated;

drop trigger if exists set_player_leaderboard_handle on public.player_leaderboard;
create trigger set_player_leaderboard_handle
  before insert or update on public.player_leaderboard
  for each row execute function public.set_player_leaderboard_handle();

drop policy if exists "Players can publish their own leaderboard stats" on public.player_leaderboard;
drop policy if exists "Players can update their own leaderboard stats" on public.player_leaderboard;

create or replace function public.publish_player_leaderboard(
  p_best_order bigint,
  p_tap_level bigint,
  p_market_legacy bigint,
  p_congos_packed bigint
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_player uuid := auth.uid();
begin
  if current_player is null then
    raise exception 'Sign in before publishing leaderboard stats.';
  end if;
  if p_best_order is null or p_best_order < 0
    or p_tap_level is null or p_tap_level < 0
    or p_market_legacy is null or p_market_legacy < 0
    or p_congos_packed is null or p_congos_packed < 0 then
    raise exception 'Leaderboard stats must be non-negative integers.';
  end if;

  insert into public.player_leaderboard (
    user_id, handle, best_order, tap_level, market_legacy, congos_packed, updated_at
  )
  values (
    current_player, '', p_best_order, p_tap_level, p_market_legacy, p_congos_packed, now()
  )
  on conflict (user_id) do update
    set best_order = excluded.best_order,
        tap_level = excluded.tap_level,
        market_legacy = excluded.market_legacy,
        congos_packed = excluded.congos_packed,
        updated_at = now();
end;
$$;

revoke all on function public.publish_player_leaderboard(bigint, bigint, bigint, bigint)
  from public, anon, authenticated;
grant execute on function public.publish_player_leaderboard(bigint, bigint, bigint, bigint)
  to authenticated;

-- Market chat migration: run this section on projects with the game schema
-- already installed. Guests use a browser-generated ID; account names always
-- come from their existing player profile.
create table if not exists public.market_chat_messages (
  id bigint generated always as identity primary key,
  sender_id uuid references auth.users(id) on delete set null,
  sender_key uuid not null,
  display_name text not null,
  content text not null default '',
  sticker_id text,
  created_at timestamptz not null default now(),
  check (
    (sender_id is null or sender_id = sender_key)
    and char_length(display_name) between 3 and 24
    and (
      (sticker_id is null and char_length(btrim(content)) between 1 and 240)
      or (sticker_id in ('garri-bowl', 'owambe', 'danfo', 'lagos-love') and content = '')
    )
  )
);

create index if not exists market_chat_messages_recent_idx
  on public.market_chat_messages (created_at desc);
create index if not exists market_chat_messages_sender_recent_idx
  on public.market_chat_messages (sender_key, created_at desc);

create table if not exists public.market_chat_send_limits (
  sender_key uuid primary key,
  last_sent_at timestamptz not null
);

alter table public.market_chat_messages enable row level security;
alter table public.market_chat_send_limits enable row level security;

drop policy if exists "Anyone can read market chat" on public.market_chat_messages;
create policy "Anyone can read market chat"
  on public.market_chat_messages for select
  to anon, authenticated
  using (true);

revoke all on public.market_chat_messages, public.market_chat_send_limits from public, anon, authenticated;
grant select on public.market_chat_messages to anon, authenticated;

create or replace function public.send_market_chat(
  p_content text,
  p_sticker_id text,
  p_guest_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_player uuid := auth.uid();
  current_sender uuid;
  current_name text;
  clean_content text := btrim(coalesce(p_content, ''));
  recent_count integer;
begin
  if current_player is null then
    if p_guest_id is null then
      raise exception 'A guest chat identity is required.';
    end if;
    current_sender := p_guest_id;
    current_name := 'Guest-' || upper(left(replace(p_guest_id::text, '-', ''), 6));
  else
    current_sender := current_player;
    select handle into current_name
      from public.player_profiles
      where user_id = current_player;
    if current_name is null then
      raise exception 'Create a player profile before chatting.';
    end if;
  end if;

  if p_sticker_id is null then
    if char_length(clean_content) < 1 or char_length(clean_content) > 240 then
      raise exception 'Messages must be between 1 and 240 characters.';
    end if;
  elsif p_sticker_id not in ('garri-bowl', 'owambe', 'danfo', 'lagos-love')
    or clean_content <> '' then
    raise exception 'Choose a valid sticker or send a text message.';
  end if;

  insert into public.market_chat_send_limits (sender_key, last_sent_at)
  values (current_sender, now())
  on conflict (sender_key) do update
    set last_sent_at = excluded.last_sent_at
    where public.market_chat_send_limits.last_sent_at <= now() - interval '2 seconds';
  if not found then
    raise exception 'Please wait a couple seconds before sending another message.';
  end if;

  select count(*) into recent_count
    from public.market_chat_messages
    where sender_key = current_sender
      and created_at > now() - interval '1 minute';
  if recent_count >= 10 then
    raise exception 'Market chat is limited to 10 messages per minute.';
  end if;

  insert into public.market_chat_messages (
    sender_id, sender_key, display_name, content, sticker_id
  )
  values (
    current_player, current_sender, current_name, clean_content, p_sticker_id
  );
end;
$$;

revoke all on function public.send_market_chat(text, text, uuid) from public, anon, authenticated;
grant execute on function public.send_market_chat(text, text, uuid) to anon, authenticated;
