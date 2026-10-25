# Motor Vehicle Mechanic: study app

An installable, offline-first study app for the Motor Vehicle Mechanic trade, including auto electrical and car air conditioning.
Vanilla JavaScript, no framework, no runtime dependencies, no accounts. Progress stays on the device.

**Content:** 21 modules in three semesters, 224 lessons (about 153,000 words, 19 hours of reading), 21 practical task sheets with instructor sign-off, 1,216 quiz questions with explanations, 930 flashcards, 68 drawn diagrams, a fault finder with 70 faults (causes, diagnosis, repair), 9 workshop calculators, and a 40-question timed exam (60 min, pass mark 70%).

**Simulation studio:** 13 interactive simulations, including a whole-vehicle workshop where you drag parts onto and off a full car frame to build or strip it, and a disassemble and assemble studio (thirteen jobs: disc brake, drum brake, brake caliper overhaul, cylinder head, clutch, alternator, starter, water pump and thermostat, wheel bearing, driveshaft, tie-rod end and gaiter, fuel pump and filter, timing belt kit: safety prep, tools, bolt sequences, inspection against limits, new parts, torque and a score), 10 diagnosis cases, a circuit lab, a scan-tool trainer with a hidden-fault mystery mode, an oscilloscope trainer, an animated four-stroke engine, cooling, starting and charging, brake, gearbox and wheel alignment simulators, and an A/C gauge simulator, plus 9 calculators.

**Study tools:** full-course search, bookmarks and personal notes per lesson, a 15-week study plan per semester, a practical logbook (printable), and spaced-repetition flashcards.

**Syllabus basis:** the module structure follows the Red Seal Automotive Service Technician occupational standard (blocks A to H), cross-checked against the Australian AUR30620 and UK City & Guilds 4290-13 qualification outlines. All text is original. Local practice, units and regulations in Ghana are not the Red Seal's, so ask your trainer where they differ.

## Run it

Service workers need http(s), so serve the folder rather than opening the file:

    node scripts/serve.js 8080      # then open http://localhost:8080

Deploy by copying the folder to any static host (HTTPS). No build is needed to run it.

### GitHub Pages

The app is fully static: all paths are relative and routing uses `#/hash` URLs, so it works from a project subpath like `https://user.github.io/repo/`. `.github/workflows/pages.yml` tests, builds and publishes it on every push to `main`. One-time setup: in the repo, go to Settings > Pages and set Source to "GitHub Actions".

## After editing content or code

    node scripts/build.js           # regenerates data/index.js and sw.js
    npm test                        # content validation + engine unit tests

`build.js` stamps a new cache version into `sw.js`, so installed copies show an "Update ready" prompt.

## Layout

    index.html, manifest.webmanifest, sw.js (generated)
    css/app.css          design tokens, light/dark, print styles, diagram styles
    js/                  ES modules: app (router), store (IndexedDB), srs, engine, render, views/, diagrams/
    data/course.js       outline, semesters, diagram map, sources
    data/modules/        one file per module: lessons, practical sheet, quiz, cards
    data/faults/         fault finder entries by semester (s1, s2, s3)
    scripts/modtool.js   authoring helper for adding lessons, questions and cards to a module
    docs/COURSE-SPEC.md  writing rules and module outlines
    tests/               validate.js (content rules), engine.test.js, diagram preview

## How it works

- **Mastery** per module: 25% lessons done, 50% quiz boxes, 25% flashcard boxes.
- **Spaced repetition:** Leitner boxes 1 to 5, reviewed after 1, 3, 7, 14 and 30 days. A miss returns an item to box 1.
- **Exam:** drawn evenly across modules, options shuffled, resumable, timer based on a stored end time.
- **Storage:** IndexedDB, with export and import of a JSON backup in Settings.

## Notes

- **Not yet reviewed by an experienced mechanic.** All lessons, questions, faults and calculators are written to the course standard in `docs/COURSE-SPEC.md` but no qualified technician has checked the figures yet. Have a qualified instructor check the safety-critical content (jacking, brakes, airbags, high voltage, refrigerant) before students rely on it.
- This is a study aid. It does not replace the manufacturer's workshop manual, local regulations or an awarding body's exam.
- Fonts: Archivo and Atkinson Hyperlegible (SIL Open Font License).
