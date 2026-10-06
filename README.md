# Tap Garri

A free, standalone browser idle clicker set in a lively Lagos-inspired garri
market. Tap to pack orders, hire a crew to work automatically, and keep growing
your market run.

## Play

Open `index.html` in a modern browser. No package installation, account, server,
wallet, or token is required. For local hosting, run a static server from this
folder:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## How it works

- Tap the garri bowl to pack the current market order and earn game coins.
- Hire Market Aunties, the Danfo Crew, and the Garri Guild to pack orders
  automatically, even while the game is closed (up to eight hours).
- Upgrade your tap strength and helper crew to tackle larger, endlessly scaling
  orders. Upgrade and helper prices rise as you buy more.
- After reaching order 10, prestige to begin a new market era. This resets the
  current run's coins, helpers, upgrades, and order progress in exchange for
  permanent Market Legacy power.
- Your progress saves in this browser.

The game uses pretend points only. **$GARRI is not connected**, and the game
does not request a wallet, handle tokens, or promise financial rewards.

## Project files

- `index.html` — game interface and accessible controls.
- `styles.css` — responsive design and illustrated Garri Town market.
- `game.js` — clicker gameplay, helpers, upgrades, prestige, offline progress,
  and local saves.
