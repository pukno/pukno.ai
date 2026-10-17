# 🧠 PUKNO – Personalized Universal Knowledge

Welcome to the official landing page for **PUKNO**, your AI-powered memory assistant. This site introduces the PUKNO platform, outlines its features, vision, and offers early users a chance to join the waitlist.

## 🌐 Live Preview

> [pukno.ai](https://pukno.ai)

---

## 📁 Project Structure

```
pukno.ai/
├── assets/
│   ├── site.css          # Shared design and responsive styles
│   ├── site.js           # Shared interactions and language navigation
│   ├── theme-init.js     # Restores the theme before rendering
│   ├── screenshots/
│   │   ├── darkmode/
│   │   └── lightmode/
│   ├── audio/
│   ├── video/
│   └── pukno-logo.png
├── index.html            # English (default entry point)
├── index-el.html         # Greek
└── README.md
```

## Languages and deployment

Deploy both HTML files and the `assets/` folder together to the existing static host. No build step or server routing is required; `index.html` remains the main entry point.

Edit English copy in `index.html` and Greek copy in `index-el.html`. Keep section IDs aligned so the EN / ΕΛ switch can retain the current section. Both pages share styles and scripts; the `ui-text` JSON in each page contains translated dynamic labels. The saved light/dark preference applies across languages.

Screenshots, the walkthrough video, and the externally hosted Tally form retain their original language. To translate the form itself, configure a Greek version in Tally and update the Greek page's `data-tally-src`.

To preview locally:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html` or `http://localhost:8000/index-el.html`.


---

## 🧠 About PUKNO

PUKNO stands for **Personalized Universal Knowledge** — a system designed to store and retrieve your life's informational footprint. It acts as your second cognitive layer, helping you remember what matters across all contexts of your life. Whether it's professional insights, meaningful personal moments, or complex data relationships — PUKNO remembers it all, so you can stay focused on what’s next.
