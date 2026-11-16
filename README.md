# Campus Connect

Campus Connect tells you what's on right now, what's coming up next, and where it is. It pings you before a class starts and drops pins on your campus map so you know where to walk.

GitHub: https://github.com/aryan1214u/VSCode-repo

## What it can do

- **Today view**: a big "Happening now / Up next" card with a live countdown. The day's entries are marked done, live or upcoming, and the page flips to the new day on its own at midnight.
- **Week view**: Monday to Sunday in one glance.
- **Free time button**: shows every gap of 30+ minutes left in your day (between 08:00 and 20:00), what comes before and after it, and tells you "right now" if you're free at this very moment.
- **Special notes**: add something like "bring calculator" to any class or event. It shows on the card and on the "Up next" card too.
- **Accounts**: sign up with a username and password, and you get your own private timetable.
- **Add, edit, delete**: classes, club meetings, anything.
- **Repeating or one-time**: "every Mon, Wed, Fri" or "only on 12 Nov" (for that random extra class).
- **CSV upload**: set your whole timetable in one go. A template is included.
- **Reminders**: pop-up, sound and browser notification 5, 10, 15 or 30 minutes before a class.
- **Campus map**: pins for whatever is left today. The next place pulses and a dashed line connects them in order.
- **Add places by clicking**: hit **Add place**, click a building on the map, type its name. That's it, no file to edit. Places are saved in MongoDB per account.

## Setting it up from scratch (Mac, everything local)

You only need to do this once on a new computer. If you already have Node 20.19+ and MongoDB running, jump to "Running it".

```bash
# 1. Homebrew (skip if `brew --version` already works).
#    Run the "Next steps" it prints, then reopen Terminal.
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node.js 20.19 or newer (check with `node -v`)
brew install node

# 3. MongoDB Community, running in the background
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
brew services list               # mongodb-community should say "started"
```

On Windows or Linux, install Node.js from nodejs.org and [MongoDB Community](https://www.mongodb.com/try/download/community), and make sure MongoDB is actually running.

## Running it

You need **Node.js 20.19 or newer** and **MongoDB** running on your machine. Open a terminal inside the project folder and run:

```bash
npm install                      # 1. download the libraries
cp .env.example .env             # 2. create your settings file (Windows: copy .env.example .env)
                                 #    the default MONGO_URI already points to local MongoDB, so no edit needed
npm start                        # 3. start the server (keep this terminal open)
```

Then:

4. Open **http://localhost:3000** and click **Create account** (any username and password).
5. Click **Upload CSV** and pick `public/sample-timetable.csv`, or just use **Add** to enter classes by hand.
6. Click **Enable alerts** once so the browser allows notifications.

> Used an older version of this project? The entries you saved back then have no owner, so they won't show up after login. Just upload the CSV again.

`npm run dev` restarts the server automatically whenever you edit backend files.

## How it works, the big picture

```
 Browser (public/)                Express server                 MongoDB
 HTML + CSS + JavaScript   --->   server.js + routes/   --->   "slots" collection
 shows the timetable       <---   (JSON over HTTP)      <---   (via Mongoose)
```

I kept the backend very small on purpose. All it does is handle accounts and save and return timetable entries (basic CRUD).

The "smart" stuff happens in the browser: figuring out today's entries, what's live or next, free time, reminders and map pins. That keeps the server simple, and the app feels instant because nothing waits on the network.

There are three MongoDB collections: a **user** is one account, a **slot** is one timetable entry, and a **place** is a named spot on the map. Slots and places both belong to a user.

```js
// users collection
{ username: "aryan", password: "pass1", token: "3f2b8c1e-..." }

// slots collection
{ user: ObjectId("..."),                 // which user owns it
  title: "CSL201 Data Structures", location: "LH105", type: "class",
  start: "08:30", end: "09:30",
  note: "bring calculator",              // optional
  days: [1, 3, 5],        // repeats every Mon, Wed, Fri (0 = Sunday ... 6 = Saturday)
  date: "" }              // OR days: [] and date: "2026-11-12" for a one-time entry

// places collection
{ user: ObjectId("..."),
  name: "LH",                            // building or room name, always stored in capitals
  x: 32.5, y: 54 }                       // position on the map picture in PERCENT (from left, from top)
```

### How login works (in 5 lines)

1. You type your username and password, and the browser sends them to `POST /api/auth/login`.
2. The server checks them, makes a **random token** (something like `3f2b8c1e-...`), saves it on your user document and sends it back.
3. The browser stores the token in `localStorage` and attaches it as an `x-token` header on **every** request (the `api()` function in `helpers.js` does this).
4. On each timetable request, `middleware/auth.js` looks up whose token it is. No match means a 401 and the page shows the login screen.
5. Every database query in `routes/slots.js` includes `{ user: req.user._id }`, so you can only see and change your own entries.

Logging out deletes the token from both the server and the browser.

## Folder tour

| File | What it does | Good to know for viva |
|---|---|---|
| `server.js` | Starts Express, connects to MongoDB, serves `public/` | middleware, `.env`, error handler |
| `models/User.js` | Shape and rules of an account | schema, unique username |
| `models/Slot.js` | Shape and rules of one entry | schema, validation, `days` vs `date`, `user` link |
| `models/Place.js` | Shape and rules of a map place (name, x %, y %) | min/max validation |
| `middleware/auth.js` | Checks the token and finds the logged-in user | middleware, 401 |
| `routes/auth.js` | Create account, log in, log out | tokens, `randomUUID` |
| `routes/slots.js` | The API: add, list, edit, delete, bulk upload (your entries only) | REST, HTTP verbs, async/await |
| `routes/places.js` | The API for map places: list, add or move, delete | "find or create" pattern |
| `public/index.html` | Page structure and the add/edit dialog | semantic HTML, `<dialog>` |
| `public/style.css` | The glassy look, animations, map pins | CSS variables, grid, `backdrop-filter` |
| `public/js/helpers.js` | Time maths, `api()` fetch wrapper, toast, beep | minutes-since-midnight trick, XSS escaping |
| `public/js/timetable.js` | Today's entries, live/next status, hero card, week view, free-time finder | the core logic |
| `public/js/map.js` | Pins on the map, "Add place" mode, saved places list | percentage coordinates, prefix match, click position maths |
| `public/js/reminders.js` | Notifications, sound, remembering what already fired today | Notification API, `setInterval` |
| `public/js/form.js` | Add/edit/delete dialog and CSV import | event delegation, CSV parsing |
| `public/js/auth.js` | Login screen: log in, create account, log out | `localStorage`, `location.reload()` |
| `public/js/main.js` | Start-up (checks login) and the 30-second refresh | how everything is wired together |
| `public/sample-timetable.csv` | Template for uploading a timetable | |

One thing to watch: the scripts in `index.html` load in a fixed order (helpers, timetable, map, reminders, form, auth, main). Later files use things defined in earlier ones, so don't shuffle them.

## API

**Accounts** (no token needed). Base URL: `http://localhost:3000/api/auth`

| Method | URL | Does |
|---|---|---|
| POST | `/api/auth/register` | create an account with `{ username, password }`, returns `{ token, username }` |
| POST | `/api/auth/login` | log in with `{ username, password }`, returns `{ token, username }` |
| POST | `/api/auth/logout` | forget the token (needs the `x-token` header) |

**Timetable**. Base URL: `http://localhost:3000/api/slots`. Every request needs the header `x-token: <your token>` and only touches your own entries.

| Method | URL | Does |
|---|---|---|
| GET | `/api/slots` | list all entries |
| POST | `/api/slots` | add one entry (JSON body) |
| POST | `/api/slots/bulk?replace=1` | add many (CSV upload); `replace=1` swaps out the weekly timetable |
| PUT | `/api/slots/:id` | edit one entry |
| DELETE | `/api/slots/:id` | delete one entry |

**Map places**. Base URL: `http://localhost:3000/api/places` (also needs the `x-token` header, and only touches your places)

| Method | URL | Does |
|---|---|---|
| GET | `/api/places` | list my places |
| GET | `/api/places/image` | my map photo as `{ image }` (empty text if none) |
| PUT | `/api/places/image` | save my map photo `{ image: "data:image/jpeg;base64,..." }` |
| DELETE | `/api/places/image` | remove my map photo |
| POST | `/api/places` | add a place `{ name, x, y }`; if the name already exists, its pin just moves |
| DELETE | `/api/places/:id` | remove one place |

Errors come back as `{ "error": "message" }` with status 400, 404, or 401 if you're not logged in. The page shows the message.

## The six ideas behind the code

1. **Weekly vs one-time.** An entry has either `days` (repeats) or `date` (once). The model rejects an entry that has neither.
2. **Today's list.** `slotsOn(date)` in `timetable.js` keeps the entries whose `days` contains today's weekday, or whose `date` is today, and sorts them by start time.
3. **Live, next, done.** Times get converted to minutes since midnight (`"08:30"` becomes `510`), so "is it over?" is simply `now >= end`.
4. **Reminders.** Every 30 seconds `remind()` checks if something starts within your chosen lead time. A `Set` remembers what's already been announced so each reminder fires only once.
5. **Free time.** `freeGaps()` in `timetable.js` walks through today's sorted entries with a "cursor" that starts at *now* (or 08:00 if that's earlier). If the next entry starts at least 30 minutes after the cursor, that stretch is a gap. Then the cursor jumps to the end of that entry. After the last entry, the time up to 20:00 gets checked the same way.
6. **Map pins.** Each place is saved as a position in **percent** (x from the left, y from the top). When you click the map in "Add place" mode, `map.js` converts the click like this: `(click position - left edge of map) / map width * 100`. Since `LH105` starts with `LH`, it uses the `LH` pin. Percentages work on any screen size.

## CSV format

```
title,location,type,days,start,end,date,note
CSL201 Data Structures,LH105,class,Mon Wed Fri,08:30,09:30,,Bring laptop on Fridays
Guest Lecture,Auditorium,other,,15:00,16:00,2026-11-12,
```

- `type` is `class`, `club` or `other`.
- `note` is optional, so leave it empty if you don't need one.
- `days` are separated by spaces (`Mon Wed Fri`). Leave it empty for a one-time entry.
- `date` is `YYYY-MM-DD` and only for one-time entries.
- Don't put commas inside a title.
- Uploading **replaces your weekly timetable** (it asks you to confirm first), but your one-time entries stay. The new rows are saved before the old ones are removed, so a broken file can't wipe your data.

## Adding your campus map

1. Click **Map photo** above the map and choose any photo or screenshot of your campus (a top view, a Google Maps screenshot, even a hand-drawn plan). It gets shrunk in your browser, saved to your account, and becomes the map background. The map box takes the photo's own shape, so nothing is cropped. (The old way still works too: a file named `public/campus-map.jpg` is used as a fallback until you upload one.)
2. Click **Add place** above the map. The map gets a dashed outline.
3. **Click on a building.** A small window asks for a name. Use the start of your room codes: `LH` covers LH101, LH205 and every other room starting with LH. If one room needs its own pin, type the full name like `LH105`. The window also suggests locations from your classes that don't have a pin yet.
4. Click **Save**. Repeat for each building, then press **Done**.
5. Any class whose location starts with a saved name now gets a pin. If a pin is in the wrong spot, add the same name again at the right place and it moves. The **✕** next to a name under the map removes it.

There's no file to edit. Places live in MongoDB with your account, so they're still there next time you log in.

## What we want to add next

- Hash passwords with bcrypt (right now they're stored as plain text, which is fine for a college project but not for real use) and switch to JWT or sessions that expire.
- A "Directions" feature with step-by-step walking between two buildings.
- Shared accounts, so friends can share clubs and events.
- Make it an installable app (PWA) with real push reminders.