<p align="center">
  <img src="orbit-logo.svg" alt="Orbit logo" width="120">
</p>

<h1 align="center">Orbit</h1>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-f2a93b" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/state-stable-6ee7c8" alt="Stable">
  <a href="https://github.com/Adam-Elmi/ArcMoon"><img src="https://img.shields.io/badge/built%20with-ArcMoon-b8bdf5" alt="Built with ArcMoon"></a>
  <a href="https://tauri.app"><img src="https://img.shields.io/badge/Tauri-2-24c8db?logo=tauri&logoColor=white" alt="Tauri 2"></a>
  <a href="https://github.com/Adam-Elmi/Orbit/releases/latest"><img src="https://img.shields.io/badge/Linux-AppImage%20%7C%20.deb-1b1d4a?logo=linux&logoColor=white" alt="Download for Linux"></a>
  <a href="https://github.com/Adam-Elmi/Orbit/releases/latest"><img src="https://img.shields.io/badge/Windows-.exe-1b1d4a?logo=windows&logoColor=white" alt="Download for Windows"></a>
  <a href="https://github.com/Adam-Elmi/Orbit/releases/latest"><img src="https://img.shields.io/badge/macOS-.dmg-1b1d4a?logo=apple&logoColor=white" alt="Download for macOS"></a>
</p>

## What is Orbit?

Orbit is a desktop calculator with sessions you slide between. Its purpose: calculate without losing your previous calculations.

**The problem:** Most calculators show one calculation at a time. When you start a new one, the old answer is gone, so you have to write it down or work it out again.

**How Orbit helps:** Orbit keeps several calculations open at once, each in its own session (like pages). For example, session 1 for your shopping total and session 2 for splitting a bill. Swipe, or press Ctrl+1 and Ctrl+2, to move between them. Every session keeps its numbers and history, even after you close Orbit.

## See it in action

<table>
  <tr>
    <td align="center"><img src="assets/demo/calculate.gif" alt="Typing 120 + 15%, the live result, Enter, then × 2" width="270"><br><b>Calculate</b><br>The result shows as you type</td>
    <td align="center"><img src="assets/demo/sessions.gif" alt="Ctrl+T opens a new session, Ctrl+1 and Ctrl+2 slide between them" width="270"><br><b>Sessions</b><br>Ctrl+T for a new one, Ctrl+1–9 to switch</td>
  </tr>
  <tr>
    <td align="center"><img src="assets/demo/history.gif" alt="Opening history, bringing back 25 ÷ 5, adding 1 and copying the result" width="270"><br><b>History and copy</b><br>Bring back a calculation, copy the result</td>
    <td align="center"><img src="assets/demo/settings.gif" alt="Settings: switching to the light theme and numbered sessions" width="270"><br><b>Settings</b><br>Theme, decimals, dots or numbers</td>
  </tr>
</table>

https://github.com/user-attachments/assets/cadc3f83-1f6b-4b0a-ae49-05adb91112fa

## Limitations

- **Basic math only:** `+ − × ÷ %` and brackets. No powers, roots, sin/cos/log, constants like π, or memory keys yet.
- **Up to 9 sessions**, one per Ctrl+1…9. Each keeps its newest 200 calculations in history.
- **Results show up to 15 digits.** With fixed decimals (Settings), results are rounded, and the rounded value is what you go on with: `1 ÷ 3` with 4 decimals, times 3, gives `0.9999`.
- **Saved on this computer only:** sessions and settings stay in the app, with no sync between devices.
- **x64 builds for Linux and Windows:** no ARM versions yet (macOS covers Apple Silicon and Intel).
- **Not signed yet:** Windows shows "More info → Run anyway", and on macOS right-click Orbit → Open the first time.
