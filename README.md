# Campus Connect
personal college scheduling website
GITHUB LINK - https://github.com/aryan1214u/VSCode-repo
# 🎓 Campus Connect

A smart timetable for campus life. It tells you **what is on right now, what is next, and where it is**, reminds you before it starts, and pins the next locations on your campus map.

## Features

- **Today view**: a big "Happening now / Up next" card with a live countdown, and the day's entries marked done / live / upcoming. It switches to the new day by itself at midnight.
- **Week view**: Monday to Sunday at a glance.
- **Free time button**: shows the gaps of 30+ minutes left in your day (08:00 to 20:00), what comes before and after each gap, and "right now" if you are free at this moment.
- **Special note** on any class or event ("bring calculator"), shown on the card and on the "Up next" card.
- **Login and accounts**: create an account with a username and password; everyone gets their own private timetable.
- **Add / edit / delete** classes, club meetings or anything else.
- **Permanent or one-time**: "every Mon, Wed, Fri" or "only on 12 Nov" (an extra class).
- **Upload a CSV** to set your whole timetable in one go (a template is included).
- **Reminders**: pop-up, sound and browser notification before a class (5/10/15/30 min).
- **Campus map**: pins for what is left today; the next place pulses and a dashed line joins them in order.
- **Add places by clicking**: press **📍 Add place**, click a building on the map and type its name. No file to edit. Places are saved in MongoDB, per account.

## Setup from zero (Mac, everything local)

Do this part once on a new computer. If you already have Node 20.19+ and MongoDB running, skip to "Run it".

```bash
# 1. Homebrew (skip if `brew --version` works). Then run the "Next steps" it prints and reopen Terminal.
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node.js 20.19 or newer (check with `node -v`)
brew install node

# 3. MongoDB Community, running in the background
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
brew services list               # mongodb-community should say "started"
```

Windows or Linux: install Node.js from nodejs.org and [MongoDB Community](https://www.mongodb.com/try/download/community), and make sure MongoDB is running.

## Run it

You need **Node.js 20.19 or newer** and **MongoDB** running on your computer (see above). Run these inside the project folder:

```bash
npm install                      # 1. download the libraries
cp .env.example .env             # 2. create your settings file (Windows: copy .env.example .env)
#    the default MONGO_URI already points to your local MongoDB, so no edit is needed
npm start                        # 3. start the server (keep this terminal open)
```

4. Open **http://localhost:3000**, click **Create account** (pick any username and a password), then click **⬆ Upload CSV** and choose `public/sample-timetable.csv` (or use **＋ Add**). Click **🔔 Enable alerts** once to allow notifications.

> If you used an earlier version of this project, the entries you saved then have no owner and will not show up after you log in. Just upload the CSV again.

`npm run dev` restarts the server automatically when you edit backend files.

## How it works (the big picture)

```
 Browser (public/)                Express server                 MongoDB
 HTML + CSS + JavaScript   --->   server.js + routes/   --->   "slots" collection
 shows the timetable       <---   (JSON over HTTP)      <---   (via Mongoose)
```

- The **backend is deliberately tiny**: it handles accounts and saves and returns timetable entries (CRUD).
- The **"smart" part runs in the browser**: working out today's entries, live/next status, free time, reminders and map pins. This keeps the server simple and makes the app feel instant.
- There are three MongoDB collections. A **user** is one account, a **slot** is one timetable entry, and a **place** is a named spot on the map. Slots and places both belong to a user:

```js
// users collection
{ username: "aryan", password: "pass1", token: "3f2b8c1e-..." }

// slots collection
{ user: ObjectId("..."),                 // which user owns it
  title: "CSL201 Data Structures", location: "LH105", type: "class",
  start: "08:30", end: "09:30",
  note: "bring calculator",              // optional special note
  days: [1, 3, 5],        // repeats every Mon, Wed, Fri   (0 = Sunday ... 6 = Saturday)
  date: "" }              // OR  days: [] and date: "2026-11-12" for a one-time entry

// places collection
{ user: ObjectId("..."),
  name: "LH",                            // building or room name, always stored in capitals
  x: 32.5, y: 54 }                       // position on the map picture in PERCENT (from left, from top)
```

### How login works (the whole idea in 5 lines)

1. You type a username and password and the browser sends them to `POST /api/auth/login`.
2. The server checks them and creates a **random token** (like `3f2b8c1e-...`), saves it on your user document and sends it back.
3. The browser keeps the token in `localStorage` and sends it in an `x-token` header with **every** request (`api()` in `helpers.js` does this).
4. On every timetable request, `middleware/auth.js` looks up the user who owns that token. No match means status 401 and the page shows the login screen.
5. Every database query in `routes/slots.js` includes `{ user: req.user._id }`, so you can only see and change **your own** entries.

Log out removes the token from the server and the browser.

## Folder tour

| File | What it does | Good to know for viva |
|---|---|---|
| `server.js` | Starts Express, connects to MongoDB, serves `public/` | middleware, `.env`, error handler |
| `models/User.js` | Shape and rules of an account | schema, unique username |
| `models/Slot.js` | Shape and rules of one entry (Mongoose schema) | schema, validation, `days` vs `date`, `user` link |
| `models/Place.js` | Shape and rules of a map place (name, x %, y %) | min/max validation |
| `middleware/auth.js` | Checks the token and finds the logged-in user | middleware, 401 |
| `routes/auth.js` | Create account, log in, log out | tokens, `randomUUID` |
| `routes/slots.js` | The API: add, list, edit, delete, bulk upload (my entries only) | REST, HTTP verbs, async/await |
| `routes/places.js` | The API for map places: list, add or move, delete | "find or create" pattern |
| `public/index.html` | Page structure and the add/edit dialog | semantic HTML, `<dialog>` |
| `public/style.css` | The glass look, animations, map pins | CSS variables, grid, `backdrop-filter` |
| `public/js/helpers.js` | Time maths, `api()` fetch wrapper, toast, beep | minutes-since-midnight trick, XSS escaping |
| `public/js/timetable.js` | Today's entries, live/next status, hero card, week view, **free-time finder** | the core logic |
| `public/js/map.js` | Pins on the map, "Add place" mode, saved-places list | percentage coordinates, prefix match, click position maths |
| `public/js/reminders.js` | Notifications, sound, once-per-day memory | Notification API, `setInterval` |
| `public/js/form.js` | Add/edit/delete dialog and CSV import | event delegation, CSV parsing |
| `public/js/auth.js` | Login screen: log in, create account, log out | `localStorage`, `location.reload()` |
| `public/js/main.js` | Start-up (checks login) and the 30-second refresh | how everything is wired together |
| `public/sample-timetable.csv` | Template for uploading a timetable | |

The scripts in `index.html` load in a fixed order (helpers → timetable → map → reminders → form → auth → main) because later files use things defined in earlier ones.

## API

**Accounts** (no token needed), base URL `http://localhost:3000/api/auth`

| Method | URL | Does |
|---|---|---|
| POST | `/api/auth/register` | create an account `{ username, password }`, returns `{ token, username }` |
| POST | `/api/auth/login` | log in `{ username, password }`, returns `{ token, username }` |
| POST | `/api/auth/logout` | forget the token (needs the `x-token` header) |

**Timetable**, base URL `http://localhost:3000/api/slots`. Every request needs the header `x-token: <your token>` and only touches **your** entries.


| Method | URL | Does |
|---|---|---|
| GET | `/api/slots` | list all entries |
| POST | `/api/slots` | add one entry (JSON body) |
| POST | `/api/slots/bulk?replace=1` | add many (CSV upload); `replace=1` swaps the weekly timetable |
| PUT | `/api/slots/:id` | edit one entry |
| DELETE | `/api/slots/:id` | delete one entry |

**Map places**, base URL `http://localhost:3000/api/places` (also needs the `x-token` header, and only touches your places)

| Method | URL | Does |
|---|---|---|
| GET | `/api/places` | list my places |
| GET | `/api/places/image` | my map photo as `{ image }` (empty text if none) |
| PUT | `/api/places/image` | save my map photo `{ image: "data:image/jpeg;base64,..." }` |
| DELETE | `/api/places/image` | remove my map photo |
| POST | `/api/places` | add a place `{ name, x, y }`; if the name already exists, its pin is moved |
| DELETE | `/api/places/:id` | remove one place |

Errors come back as `{ "error": "message" }` with status 400 (or 404, or 401 when you are not logged in), and the page shows the message.

## The six ideas behind the code

1. **Weekly vs one-time.** An entry has either `days` (repeats) or `date` (once). The model refuses an entry that has neither.
2. **Today's list.** `slotsOn(date)` in `timetable.js` keeps entries whose `days` contains today's weekday **or** whose `date` equals today, sorted by start time.
3. **Live / next / done.** Times are turned into minutes since midnight (`"08:30"` → `510`), so "is it over?" is just `now >= end`.
4. **Reminders.** Every 30 seconds `remind()` checks whether something starts within your chosen lead time. A `Set` remembers what was already announced so it fires once.
5. **Free time.** `freeGaps()` in `timetable.js` walks through today's sorted entries with a "cursor" that starts at *now* (or 08:00 if it is earlier). If the next entry starts at least 30 minutes after the cursor, that stretch is a gap. Then the cursor jumps to the end of that entry. After the last entry, the time up to 20:00 is checked the same way.
6. **Map pins.** Every place is saved with a position in **percent** (x from the left, y from the top). When you click the map in "Add place" mode, `map.js` turns the click into percent: `(click position - left edge of the map) / map width * 100`. `LH105` starts with `LH`, so it uses the `LH` pin. Percent positions fit any screen size.

## CSV format

```
title,location,type,days,start,end,date,note
CSL201 Data Structures,LH105,class,Mon Wed Fri,08:30,09:30,,Bring laptop on Fridays
Guest Lecture,Auditorium,other,,15:00,16:00,2026-11-12,
```

- `type` is `class`, `club` or `other`.
- `note` is optional (leave it empty if you don't need one).
- `days` are written with spaces between them (`Mon Wed Fri`). Leave empty for a one-time entry.
- `date` is `YYYY-MM-DD` and is only for one-time entries.
- Do not put commas inside a title. Uploading **replaces your weekly timetable** (after asking you to confirm); one-time entries are kept. The new rows are saved first, so a faulty file cannot wipe your data.

## Adding your campus map

1. Click Map photo above the map and choose any photo or screenshot of your campus (top view, Google Maps screenshot, a drawn plan). It is shrunk in your browser, saved to your account, and becomes the map background. The map box takes the photo's own shape, so nothing is cropped. (Old way still works: a file named `public/campus-map.jpg` is the fallback until you upload one.)
2. Click ** Add place** above the map. The map gets a dashed outline.
3. **Click on a building** on the map. A small window asks for a name. Use the start of your room codes: `LH` covers LH101, LH205 and every other room starting with LH. Type a full name like `LH105` if one room needs its own pin. The window also suggests the locations of your classes that have no pin yet.
4. Click **Save**. Repeat for every building, then press **✔ Done**.
5. Any class whose location starts with a saved name now gets a pin. If a pin is in the wrong spot, add the same name again at the right spot and it moves. The **✕** on a name under the map removes it.

There is no file to edit: places are saved in MongoDB with your account, so they stay when you log in again.


## Ideas for next steps

- Hash passwords with bcrypt and use JWT or sessions with an expiry.
- A "Directions" step-by-step walk between two buildings.
- User accounts so friends can share clubs and events.
- Installable app (PWA) with real push reminders.


