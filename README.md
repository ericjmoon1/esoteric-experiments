# Esoteric Programming Languages

An interactive collection of small projects built around esoteric programming languages (esolangs): languages created to explore unusual syntax, constraints, visual systems, puzzles, or jokes.

Each section pairs a themed browser experiment with a live source view. Changing the controls updates the source/source-sketch beside the project so visitors can see how their choices alter the program. MOON, the final section, includes a full editable in-browser interpreter.

## Included languages

COW, Whitespace, Piet, Hexagony, ArnoldC, Beatnik, Chef, Shakespeare Programming Language, LOLCODE, Rockstar, INTERCAL, Ook!, Chicken, Malbolge, JSFuck, Befunge-93, Brainfuck, AHHH, HQ9+, and MOON.

## MOON

MOON is a small celestial emoji-based esoteric programming language designed by Eric Moon. It uses a tape of integer memory cells ("planets") and a pointer (the "astronaut"), with loops represented as "orbits." The site includes Run, Step, Reset, input, output, and memory visualization.

## Live Site

https://ericjmoon1.github.io/esoteric-experiments/

## Project Structure

- `index.html` — main page and project markup
- `style.css` — layout and visual design
- `app.js` — interactions, live source generation, and MOON interpreter
- `programs/` — reference source experiments for the featured esolangs
- `moon/` — MOON specification and example programs
