# Solar Storm: Moon Base Survival

**Team Lychee · NASA Space Apps Challenge 2026 · Build a Junior Astronaut Mission Trainer**

A browser game where you run a Moon base during a **real solar storm recorded by NASA**. Grab supplies against the clock, build a shield wall, budget your power, and decide whether to continue the mission. Every choice costs something.

## Play it

Open [Solar-Storm](www.solar-scramble.earth) in any web browser. No download, install or account needed.

## Two age modes

| | Junior Astronaut (7–12) | Flight Director (13+) |
|---|---|---|
| Scramble | Grab up to 6 items | Load a 60 kg airlock cart, shorter timer |
| Shield wall | 3 choices | Slider with live dose and food projections |
| Power | Pick one system to switch off | Full power budget with blackout prediction |
| Dose | Simple points with color bands | % of mission limit and a dose history chart |
| Look | Bright and playful | Mission-control style |

## Space Academy

8 lessons in 4 units (the Sun's storms, radiation protection, habitat systems, forecasting and data). Each lesson has an article, an interactive tool and practice questions, in a separate version for each age group. Progress is saved in the browser.

## Real NASA data

Each mission uses a real storm:

- **The Glancing Blow** (Sep 14, 2023): CME at 915 km/s, NASA DONKI record 2023-09-14T07:24:00-CME-001
- **The Bullseye Storm** (Oct 9, 2024): X1.8 flare, CME at about 1,509 km/s, solar particle event, Kp 8.67
- **The May 2024 Superstorm** (May 10–11, 2024): X5.8 flare, CME at about 1,500 km/s, G5 (Kp 9)

How data becomes gameplay:

| Measurement | Game effect |
|---|---|
| CME speed | Scramble timer (faster = less warning) |
| Flare class | Radiation per day in the shelter |
| Solar particle event | Days in the shelter and a dose multiplier |
| Kp index | Earth-side events (busy Mission Control, auroras at home) |
| CME half-angle | Chance of a glancing blow |

All sources are listed in the game under **Data & sources** and inside each lesson. Dose in the game is shown as game points (Junior) or % of a mission budget (Flight Director), not real units.

## Live mode (optional)

"Today's Sun" loads the last 30 days of data from NASA's DONKI API. It needs internet and works when the page is hosted online (for example GitHub Pages). For more requests, get a free key at https://api.nasa.gov and paste it into `NASA_API_KEY` near the top of the script in `index.html`. If live data can't load, the game says so and sends players to the saved storms.

## Put it online with GitHub Pages

1. Create a new public repository on GitHub.
2. Upload `index.html` and `README.md`.
3. Go to **Settings → Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
4. After a minute your game is live at `https://<your-username>.github.io/<repo-name>/`.
