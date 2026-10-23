# Changelog

## 1.1.0 — 2026-10-22

### New features

#### Scientific keys
A row of `√ x² xʸ π e mod` above the keypad.
```
√16 + 5²   = 29
2^10       = 1024
2π         = 6.28318530717959
17 mod 5   = 2
```
- A number next to π, e, √ or a bracket multiplies: `2π`, `3√4`, `2(5)`.
- `mod` is the remainder, worked out like × and ÷: `100 + 17 mod 5` = 102.
- `^` on the keyboard; paste turns `sqrt(16)`, `2*pi`, `2**10` and `17 mod 5` into the keys.

#### Edit anywhere in the line
A real caret: click in the line, or move with ← → Home End, and type there.
```
23 + 102 + 305|   ⌫⌫⌫ 500   →   23 + 102 + 500
```
- Backspace deletes before the caret, Delete after it.
- Each session remembers where its caret was.

#### Splash
The Orbit logo, with a gold ring sweeping around it, for a moment when Orbit opens.
- Any key or click skips it, and that key isn't typed.
- Settings → Splash on start turns it off.

### Improvements

#### Long lines fit
The line shrinks from 36 px to 20 px as it grows, then wraps, so a long sum stays readable.

#### Settings like Ubuntu's
Groups with rounded lists: a row per setting, its control on the right. The theme and indicator keep their pictures; decimals is a menu whose subtitle shows `1 ÷ 3` with your choice.

#### Built with ArcMoon 1.1

## 1.0.0 — 2026-10-17

The first release: sessions you slide between, live results, history, copy and paste, light and dark themes.
