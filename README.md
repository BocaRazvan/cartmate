# CartMate

A collaborative shopping list app — create lists, share them with a group, and check items off together in real time as you shop.

Built as a self-directed practice project while learning React, to reinforce fundamentals (components, props, state, conditional rendering, controlled forms) alongside a real Firebase backend.

## Features

- **Authentication** — email/password sign up with email verification required before access, login, and password reset, all via Firebase Auth.
- **Shopping lists** — create a list with named items (quantity, optional photo reference, optional comments), edit or delete items inline, then save the list.
- **Private or public lists** — mark a list private (only you) or public (visible and editable by everyone in your group).
- **Groups** — search for another CartMate user by email and add them to your group; they'll see and can edit your public lists under "Shared with me."
- **Shopping mode** — open any saved list and check items off as you shop; state is saved to Firestore as you go.
- **Message board** — a shared space for all users to post short messages, each shown with the poster's nickname and avatar.
- **Profile** — pick from a set of generated avatars, view account stats (login history, lists created, items added, group size), change your email or password, or delete your account.
- **Dark mode** — a full dark theme, toggled from the side panel and remembered across visits.
- **Responsive design** — laid out mobile-first, with dedicated breakpoints from small phones up through ultra-wide desktop screens.

## Tech stack

- **[React 19](https://react.dev/)** + **[Vite](https://vite.dev/)**
- **[Firebase](https://firebase.google.com/)** — Authentication and Firestore (with Security Rules enforcing list ownership and group-based sharing)
- Plain CSS — no UI framework, hand-built component styles using CSS custom properties for theming

## About this project

CartMate was built independently, outside of any course curriculum, as hands-on practice while working through Jonas Schmedtmann's _The Ultimate React Course_. Every feature — the data model, the Firestore Security Rules, the styling system, the responsive layout — was designed and built from scratch rather than following a tutorial.
