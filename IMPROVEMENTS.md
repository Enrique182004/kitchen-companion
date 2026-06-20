# Kitchen Companion — Improvements & Features

Each item is planned, then marked ✅ when complete.

---

## Bug Fixes

- [x] **Favorite toggle broken** — LibraryCard has `onToggleFavorite` prop defined but (a) no button in UI calls it, and (b) the JSX rendering `LibraryCard` never passes the prop; also favorites don't pin to top in LibraryPage sort

---

## Features

- [x] **Trip budget** — set a budget for the current trip on the dashboard/grocery page; TotalsBar shows budget vs. estimated cost with over/under indicator
- [x] **Favorites filter tab** — a "Favorites" tab/chip on LibraryPage that filters to starred items only
- [x] **Undo clear purchased** — when "Clear N purchased" is pressed, show a timed toast with an Undo button that restores the removed items
- [x] **Grocery list localStorage persistence** — in demo mode, grocery items are in-memory only and lost on refresh; persist with Zustand `persist` middleware the same way the library does
- [x] **Quick-add bar** — single text input at top of grocery list: type a name and press Enter to add the item instantly (name only, all other fields default); for speed shopping

---

## Round 2

- [x] **Quick-add keeps focus** — after pressing Enter to add, input loses focus; keep cursor there for rapid multi-item entry
- [x] **Sort by store** — "Store" is missing from grocery list sort options; useful for grouping items by where to buy them
- [x] **Inline quantity stepper** — +/- buttons on `GroceryItemRow` to adjust quantity without opening the full edit dialog
- [x] **Empty search → add suggestion** — when grocery list search returns nothing, show "Add '[query]' to list?" action so the user doesn't have to retype
- [x] **Actual price on purchase** — a small inline input appears when an item is checked off, letting the user record what they actually paid (feeds the "Spent" total accurately)

---

## Done

<!-- Move items here as they complete -->
