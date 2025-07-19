# 🌐 InfoScape  
**Unified OSINT Intelligence Toolkit — Smart, Powerful, Ethical**  
_Created by [Ivo Pereira](https://ivocreates.site) | GitHub: [@ivocreates](https://github.com/ivocreates)_

![License](https://img.shields.io/badge/license-MIT-brightgreen)
![Built with](https://img.shields.io/badge/Built_with-💙_React,_💻_Electron,_🐍_Python,_🧠_SQL-informational)
![Contributions](https://img.shields.io/badge/Contributions-Welcome-orange)

---

## 📌 Overview

**InfoScape** is an all-in-one OSINT (Open Source Intelligence) application that consolidates multiple powerful tools into a single, beautiful, desktop interface. It’s built for ethical hackers, cybersecurity pros, researchers, and investigators to search and correlate online data using smart filters, intuitive UI, and entity-matching logic.

Search for people or profiles using names, usernames, emails, and more — then let **InfoScape** intelligently classify, group, and correlate the right data with the right identities. 🔍🧠

---

## 🧠 Key Features

- 🔎 **Multi-Source Recon**  
  Input: name, username, email, phone, profile ID, location, IP, keywords — all supported!

- 🛠️ **Wrapped CLI Tool Integration** (via Python)  
  Seamlessly use:
  - Sherlock (socials)
  - Photon (web crawling)
  - Maigret (identity scanning)
  - theHarvester (emails, IPs)
  - Holehe (email → site accounts)
  - Recon-ng and more!

- 🧬 **Entity Correlation Engine**  
  Matches data to distinct individuals even if names/handles overlap. Uses:
  - NLP + heuristics
  - Confidence scoring
  - Smart grouping logic

- 📊 **Tabbed Results UI**  
  Visualize results in categorized tabs: Socials, Emails, Domains, Metadata, Tools Used, etc.

- 💾 **Save + Export**  
  Save sessions locally. Export full reports in PDF, CSV, or JSON.

- 🔐 **Private & Offline-First**  
  No data leaves your device. Optional VPN/proxy support for stealth recon.

- 🌈 **Built with ❤️ in Electron + React**  
  Clean, fast, dark-mode UI — hacker-core vibes with comfy UX.

---

## 🗂️ Project Structure

```
InfoScape/
├── electron-app/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   └── App.jsx
│   ├── main.js               # Electron entry point
│   └── package.json
├── backend/
│   ├── main.py               # FastAPI/Flask backend
│   ├── modules/              # Python wrappers for CLI tools
│   │   └── sherlock.py, photon.py, etc.
│   ├── utils/                # Correlation logic, parsers
│   └── db.sqlite             # SQLite DB (local storage)
├── shared/
│   └── types.js              # Shared types/interfaces
├── README.md
└── LICENSE
````

---

## 🎯 Use Cases

- 🔍 Ethical hackers tracing footprint trails
- 📡 Cybersecurity teams mapping digital exposure
- 📰 Journalists verifying digital identities
- 🧠 Students & hobbyists learning OSINT
- ❤️ Reconnecting with lost contacts (respectfully)

---

## 🛣️ Roadmap

- [x] Setup base UI + React + Electron
- [x] Add Sherlock tool wrapper
- [ ] Add Photon + theHarvester
- [ ] Results parser & formatter
- [ ] Entity resolution logic (NLP + clustering)
- [ ] Visual results dashboard
- [ ] Export PDF/CSV/JSON
- [ ] Session save/load system
- [ ] Plugin architecture
- [ ] Installer packaging for Windows/Linux/macOS

---

## 🧑‍💻 Local Setup (Dev Mode)

### Requirements

- Node.js 18+  
- Python 3.10+  
- Git  
- SQLite (built-in)  
- Bash / Terminal

### Instructions

```bash
# Clone repo
git clone https://github.com/ivocreates/InfoScape.git && cd InfoScape

# Set up Python backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py  # Start backend API

# Set up Electron frontend
cd ../electron-app
npm install
npm run dev  # Launch app in dev mode
````

---

## 🔐 Ethics & Legal Notice

**InfoScape** is built for **ethical**, **educational**, and **legal** use only.
❌ Do not use this tool to stalk, harass, dox, or intimidate others.
✅ Always obtain proper consent when using OSINT tools for real people.

> Respect privacy. Think before you search.

---

## 🌍 Contributions Welcome

Contributions are not just accepted — they’re encouraged!
Jump in if you love:

* 🐍 Writing Python wrappers
* 🧠 Entity disambiguation / NLP logic
* 🧪 Experimenting with open-source intelligence
* 🎨 UI/UX polish
* 🐞 Fixing bugs

> Open source, open minds.
> Fork it → build it → PR it 💖

---

## 📄 License

**MIT License**
Free to use, fork, build, remix — just credit the original.

```text
© 2025 Ivo Pereira  
Website: https://ivocreates.site  
GitHub: https://github.com/ivocreates  
```

---

## 💖 Built with caffeine, curiosity, and care by

**Ivo & Omi** 🧁💻
*“Because data deserves clarity — and hackers deserve love too.”* 🌟

```

