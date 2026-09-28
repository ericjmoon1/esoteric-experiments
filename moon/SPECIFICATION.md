# MOON 1.0 — Machine-Oriented Orbital Notation

MOON is a small tape-based esoteric programming language using only celestial emoji and whitespace.

## Machine model

- Memory is an unbounded-right tape of 8-bit cells called **planets**.
- Every planet starts at 0.
- The pointer, called the **astronaut**, starts at Planet 0.
- Cell arithmetic wraps modulo 256.
- Whitespace is ignored.
- Any non-whitespace character outside the instruction set is an error.

## Instructions

| Symbol | Name | Effect |
|---|---|---|
| 🌒 | WAX | increment current planet |
| 🌘 | WANE | decrement current planet |
| 🌑 | NEW MOON | set current planet to 0 |
| 🚀 | LAUNCH | move astronaut right |
| 🛸 | RETURN | move astronaut left |
| 🌕 | TRANSMIT | output current value as a Unicode character |
| ⭐ | BEACON | output current value as a decimal number |
| 📡 | RECEIVE | read the next integer input (0–255) |
| 🪐 | ORBIT | if current planet is 0, jump past matching ☄️ |
| ☄️ | DEORBIT | if current planet is nonzero, jump back to matching 🪐 |

Nested orbits are permitted.
