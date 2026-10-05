# Garri Town

A free, standalone browser idle game about growing a small cassava farm into a
busy garri-making town. The original farm illustration and game economy are
inspired by cosy farming and town-building simulations.

## Play

Open `index.html` in a modern browser. No package installation, account, server,
wallet, or token is required. For local hosting, run a static server from this
folder, for example:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## How it works

- Cassava plots grow roots automatically, and the garri house processes roots
  into finished bags while the farm is open.
- Deliver market orders for coins and experience. Level up to earn welcome
  coins and keep progressing through larger customer orders.
- Spend coins on better seedlings, faster processing, and up to five additional
  growing plots.
- Your farm, stock, upgrades, level, and market progress save in this browser.
  Production continues for up to eight hours while you are away.

The game uses pretend points only. **$GARRI is not connected**, and the game
does not request a wallet, handle tokens, or promise financial rewards.

## Project files

- `index.html` — game interface and accessible controls.
- `styles.css` — responsive visual design and illustrated farm.
- `game.js` — idle production, orders, upgrades, offline progress, and saves.
