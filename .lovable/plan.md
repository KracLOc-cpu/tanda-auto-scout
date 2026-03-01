

# Add Dark Mode Toggle to Header

## Changes

1. **Install & configure dark mode provider** using `next-themes` (already installed) — wrap App with `ThemeProvider`

2. **Add dark mode CSS variables** to `index.css` — the `.dark` class already exists with proper HSL values

3. **Create Dark Mode Toggle component** — a sun/moon icon button in the header that smoothly toggles between light and dark themes using Framer Motion for the icon transition

4. **Integrate into persistent header** — place the toggle button between the city selector and comparison counter

5. **Smooth transition** — add `transition-colors duration-300` to the `<html>` or `<body>` element so all color changes animate smoothly across the entire page

