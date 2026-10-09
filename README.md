# Tap Garri

An endless Lagos-market clicker. Tap to pack market orders, collect white,
yellow, and Ijebu garri, recruit helpers, open city shops, and build an
Owambe-ready market empire.

## Play

Open `index.html` in a modern browser. Local gameplay and progress saving work
without an account. For local hosting, run a static server from this folder:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Game and Garri varieties

- Choose White Garri (classic fermented flakes), Yellow Garri (palm-oil
  toasted), or Ijebu Garri (fine and tangy). Each tap adds its displayed
  packing power to the selected variety's stock, counted in Congos.
- Finished market orders earn market coins and XP. Leveling up increases tap
  power and unlocks luxury bowl finishes such as Eko Silver, Lekki Gold, Ikoyi
  Diamond, and Lagos Royale.
- Hire continuously unlocking fictional Lagos helper crews. Helper names are
  composed from a broad role-and-crew name catalog; each new tier delivers more
  order power automatically, even while the game is closed (up to eight hours).
- Hire crews repeatedly, with prices increasing for each hire. Hire five members
  of a crew to unlock uncapped, coin-funded evolutions; every rank doubles that
  crew's packing power.
- Open an endless sequence of Lagos garri shops, boutiques, food halls, and
  luxury emporiums. Each new tier unlocks as orders advance and earns coins
  while you play or rest.
- Franchise each unlocked store repeatedly, with prices increasing per location.
  Evolve owned stores without a rank cap; every rank doubles that store's income.
- Collect an expanding Owambe menu, with hundreds of fictional luxury-style
  feast name combinations. Each collection entry boosts future order rewards.
- Keep buying repeatable scoop, team, and express delivery upgrades. Delivery
  network levels multiply all helper order power.
- Use **Smart Buy** for a value-based recommended purchase. Keyboard controls:
  **Space** taps the bowl, **B** buys the recommendation, and **P** starts an
  available prestige (keyboard shortcuts pause while a control or account form
  is focused).
- **Reset Save** clears this device's local progress after confirmation. It
  does not delete a signed-in player's cloud save.
- Join the shared **Market chat** as a guest or signed-in player. Send up to
  240 characters, use the quick emoji buttons, or send one of the curated
  stickers. The public room refreshes every five seconds; chat requires an
  internet connection and is separate from offline game saves.
- Progress is saved to this device every second and when the page is hidden or
  closed. Signed-in progress and unclaimed Garri sync to Supabase when online;
  offline play keeps saving locally and sync resumes after reconnecting. The
  game does not reload when the network changes. Idle progress is capped at
  eight hours.
- Orders and upgrade prices scale up to JavaScript's maximum safe integer, so
  displayed game counts do not silently claim precision beyond what the game
  can represent.
- The market changes between six Lagos-area scenes as orders advance, then
  loops through new market circuits. Your supplied mascot sprite sheets animate
  idle, walking, running, and jumping in the scene.
- After reaching order 10, prestige to start another market era with permanent
  power. The progression loop continues.

Garri is an in-game currency, not a cryptocurrency or a promise of cash value.
Player-to-player transfers move only the selected in-game Garri variety.

## Player accounts and transfers

Account sign-ups, cloud game saves, Garri balances, and player-to-player
transfers use Supabase. Until configured, the game remains playable and saves
locally, but account and transfer controls are unavailable.

1. Create a Supabase project and enable email/password authentication.
2. Run [`supabase-schema.sql`](./supabase-schema.sql) in the Supabase SQL
   Editor. It creates player handles, per-variety Garri balances, private
   per-player game saves, a public game-stats leaderboard, market chat, and
   atomic Garri transfer/chat functions with row-level security.
3. Put the project's URL and **publishable/anon** key in
   [`supabase-config.js`](./supabase-config.js). Never put a Supabase
   `service_role` or secret key in this browser game.
4. In Supabase **Authentication → URL Configuration**, allow your local game
   address and deployed game URL. Enable email/password sign-ups and decide
   whether to require email confirmation. With confirmation on, new players
   confirm the message they receive before signing in.

Players select **Create account**, enter an email, password, and unique
3–20-character handle, then sign in. On the first sign-in in a browser, their
current local progress is copied to the account. After that, the account's
cloud save is used on each device; local play remains available when offline.
Level, orders, upgrades, helpers, shops, and prestige autosave to
`player_game_saves`; balances remain separate in `player_garri`. Row-level
security limits each player to their own save and Garri balances.
Player handles are unique across accounts; if signup says a handle may already
be taken, choose a different handle and try again.

The Lagos leaderboard shows the top ten signed-in players by best order, with
tap level and Market Legacy. It publishes player handles and gameplay stats
only; account emails and Garri balances are not shown. If you already ran the
older setup script, run the full section beginning `Leaderboard migration` at
the bottom of `supabase-schema.sql` in the Supabase SQL Editor. This migration
installs the `publish_player_leaderboard` function used by the game to publish
the signed-in player's stats without direct client writes to the leaderboard.
Until the migration is applied, cloud game saves still sync, but leaderboard
publishing reports a separate setup warning.

If the account tables are already installed, run the `Market chat migration`
section at the bottom of `supabase-schema.sql` in the SQL Editor. Chat messages
are public, guest nicknames are pseudonymous, signed-in messages use the
player's public handle, and the database limits message size, supported
stickers, and send frequency. Chat is not end-to-end encrypted; do not share
private or identifying information.

The public handle is used to address a transfer. The database validates the
sender's balance and updates both players atomically. This is still a
client-played prototype: a player can edit their own game save, and the current
client-submitted Garri claim and leaderboard stats are not cheat-proof. Keep
Garri fictional, with no cash or real-world value, unless earned progress is
later verified by trusted server-side game logic.

## Player and site metrics

Open the [Netlify dashboard](https://app.netlify.com/), choose the
`endearing-taffy-0a96b1` site, then open **Observability** to review site visits
and traffic. These are website-level metrics, not a count of taps, orders, or
retention. Authenticated account handles, Garri balances, and completed
transfers are stored in Supabase. The public leaderboard shares only player
handles and game stats; this prototype does not send gameplay events to an
analytics service.

## Project files

- `index.html` — game interface and accessible controls.
- `styles.css` — responsive design and illustrated Garri Town market.
- `assets/market-crops.svg` — small decorative wheat, pepper, and onion garden for the market scene.
- `game.js` — clicker gameplay, Garri varieties, accounts, transfers, upgrades,
  continuous helper/store/feast tiers, public leaderboard, prestige, offline
  progress, and local saves.
- `assets/market-runner-*.png` — supplied character sprite sheets for idle,
  walk, run, and jump scene animations.
- `supabase-config.js` — public Supabase project URL and publishable/anon key.
- `supabase-schema.sql` — account, balance, row-level security, and transfer
  database setup.
- `service-worker.js` — offline caching for the static game shell.
