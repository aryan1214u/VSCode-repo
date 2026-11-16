# Git steps for Campus Connect

Follow these in order from inside the project folder. You get a clean history of small, meaningful commits, feature branches and merges, which looks good in a viva.

Commit message style: `type(area): short description`, where type is `feat` (new feature), `style`, `chore` (setup), `docs` or `fix`.

**Which path do I follow?**
- Starting Git for the first time? Do **Part A** (sections A1 to A8), then **Part C** to push.
- Already committed an older version? Do **one** of these:
  - **Part B1** if your history has the first version (no login, notes, free time or clickable map places).
  - **Part B2** if your history already has login, notes and free time, and only the clickable map places are new.

## 0. Before you start (once per person)

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
```

---

# Part A: fresh start

## A1. Create the repository and the first commits on `main`

```bash
git init
git branch -M main

git add .gitignore package.json package-lock.json
git commit -m "chore: initialise Node project with Express, Mongoose and dotenv"

git add .env.example
git commit -m "chore: add .env.example with PORT and MONGO_URI"
```

> Check with `git status` that `.env` and `node_modules/` are **not** listed. They are ignored on purpose.

## A2. Backend branch (database, login, API)

```bash
git checkout -b feature/backend

git add models/User.js
git commit -m "feat(db): add User model with username, password and login token"

git add models/Slot.js
git commit -m "feat(db): add Slot model with owner, optional note and weekly or one-time validation"

git add models/Place.js
git commit -m "feat(db): add Place model for named map spots stored as percentages"

git add middleware/auth.js
git commit -m "feat(auth): add middleware that finds the logged-in user from the x-token header"

git add routes/auth.js
git commit -m "feat(auth): add register, login and logout routes"

git add routes/slots.js
git commit -m "feat(api): add CRUD and bulk-upload routes limited to the logged-in user"

git add routes/places.js
git commit -m "feat(api): add routes to list, add or move, and delete map places"

git add server.js
git commit -m "feat(server): add Express server, route wiring, static hosting and error handler"

git checkout main
git merge --no-ff feature/backend -m "merge: backend with accounts, API and MongoDB"
```

## A3. Page layout and core display

```bash
git checkout -b feature/ui-core

git add public/index.html
git commit -m "feat(ui): add login screen, page layout, tabs, map card and dialogs markup"

git add public/style.css
git commit -m "style(ui): add glass theme, cards, notes, week view and map styles"

git add public/js/helpers.js
git commit -m "feat(ui): add helpers for time, API calls with login token, toast and beep"

git add public/js/timetable.js
git commit -m "feat(ui): show today with live/next status, notes, week view and free-time finder"

git checkout main
git merge --no-ff feature/ui-core -m "merge: core timetable display"
```

## A4. Campus map

```bash
git checkout -b feature/campus-map

git add public/js/map.js
git commit -m "feat(map): pin today's locations, draw route line and add places by clicking the map"

git checkout main
git merge --no-ff feature/campus-map -m "merge: campus map with clickable places"
```

## A5. Reminders

```bash
git checkout -b feature/reminders

git add public/js/reminders.js
git commit -m "feat(reminders): notify before class with pop-up, sound and notification"

git checkout main
git merge --no-ff feature/reminders -m "merge: class reminders"
```

## A6. Editing and CSV upload

```bash
git checkout -b feature/edit-and-upload

git add public/js/form.js
git commit -m "feat(ui): add create, edit and delete dialog with notes and CSV timetable upload"

git add public/sample-timetable.csv
git commit -m "docs: add sample timetable CSV template"

git checkout main
git merge --no-ff feature/edit-and-upload -m "merge: edit timetable and CSV upload"
```

## A7. Login screen and start-up

```bash
git checkout -b feature/login-screen

git add public/js/auth.js
git commit -m "feat(ui): add log in, create account and log out"

git add public/js/main.js
git commit -m "feat(ui): check login on start, load data and places, refresh every 30 seconds"

git checkout main
git merge --no-ff feature/login-screen -m "merge: login screen and start-up"
```

## A8. Documentation

```bash
git add README.md GIT_STEPS.md
git commit -m "docs: add README with architecture, login flow, API and viva notes"
```

Check the result:

```bash
git status                       # should say "nothing to commit, working tree clean"
git log --oneline --graph --all  # your history, with branches and merges
```

---

# Part B1: already committed the FIRST version

Use this only if your history has the first version (without accounts, notes, free time and clickable places). Copy the new project files over your old ones and delete the old `public/places.json` (it is no longer used). `git status` then lists the changes. Commit them in these pieces:

```bash
git checkout main
git checkout -b feature/accounts-notes-free-time

git add models/User.js middleware/auth.js routes/auth.js
git commit -m "feat(auth): add User model, token middleware and register/login/logout routes"

git add models/Slot.js routes/slots.js
git commit -m "feat(api): make timetable entries private to the logged-in user and add a note field"

git add models/Place.js routes/places.js server.js
git commit -m "feat(api): add map places routes and wire all routes in server.js"

git add public/index.html public/style.css public/js/helpers.js public/js/auth.js public/js/main.js
git commit -m "feat(ui): add login screen, map place dialog and send the login token with every request"

git add public/js/timetable.js public/js/form.js public/sample-timetable.csv
git commit -m "feat(ui): add special notes on classes and the free-time finder"

git add public/js/map.js public/places.json
git commit -m "feat(map): add places by clicking the map and remove places.json"

git add README.md GIT_STEPS.md
git commit -m "docs: document accounts, notes, free time and map places"

git checkout main
git merge --no-ff feature/accounts-notes-free-time -m "merge: accounts, class notes, free-time finder and map places"
```

---

# Part B2: already have login, notes and free time committed

Use this if your history already has the version with login, notes and free time, and you only need the clickable map places. Copy the new project files over your old ones and delete the old `public/places.json`. Then:

```bash
git checkout main
git checkout -b feature/map-places

git add models/Place.js routes/places.js server.js
git commit -m "feat(api): add Place model and routes to list, add or move, and delete map places"

git add public/index.html public/style.css public/js/main.js public/js/map.js public/places.json
git commit -m "feat(map): add places by clicking the map and remove places.json"

git add README.md GIT_STEPS.md
git commit -m "docs: document clickable map places"

git checkout main
git merge --no-ff feature/map-places -m "merge: clickable map places"
```

---

# Part C: push, teamwork and everyday workflow

## Push to GitHub

Create an empty repository on GitHub (no README), then:

```bash
git remote add origin https://github.com/<your-username>/campus-connect.git
git push -u origin main
git push origin --all            # also pushes the feature branches
```

Optional release tag:

```bash
git tag -a v1.2.0 -m "Campus Connect v1.2.0: accounts, notes, free time, clickable map places"
git push origin v1.2.0
```

## Crediting teammates

If different people worked on different parts, credit them on their own commits by adding `--author`, for example:

```bash
git commit --author="Teammate Name <teammate@example.com>" -m "feat(map): pin today's locations, draw route line and add places by clicking the map"
```

Only credit the people who really wrote or took ownership of that part. The history should match the truth.

Alternatively, each member clones the repository after step A1, creates their own branch, adds their files, and opens a Pull Request on GitHub for the others to review.

## Everyday workflow for new changes

```bash
git checkout main && git pull          # start from the latest code
git checkout -b feature/short-name     # one branch per feature or fix
# ...edit files, test with npm start...
git add <files>
git commit -m "feat(area): what you changed"
git push -u origin feature/short-name  # then open a Pull Request on GitHub
```

Example commits for the next steps:

```bash
git commit -m "feat(map): add campus map photo"
git commit -m "fix(reminders): avoid duplicate alert when tab is reopened"
git commit -m "feat(auth): hash passwords with bcrypt"
```
