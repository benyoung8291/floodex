

## Problem

The app's default theme (`:root`) is a dark industrial theme (dark slate backgrounds, light text). The marketing site uses a separate `.marketing-theme` class with a clean light background. The dashboard and all other app pages still render with the old dark color scheme because they use the default `:root` variables.

## Plan

**Update `src/index.css`** to make the light theme the default for the entire app:

1. **Replace `:root` variables** with the marketing-site-aligned light theme values:
   - Background: light/white tones instead of dark slate
   - Card: white with dark text
   - Secondary/muted: light grays
   - Border/input: light gray borders
   - Keep the blue primary (`204 98% 37%`) already set
   - Keep success, warning, emergency colors as-is

2. **Update sidebar variables** in `:root` to use light sidebar styling (white/light background, dark text)

3. **Move the current dark theme** into a `.dark` class override (replacing the current `.light` class) so it's available if needed later but not the default

4. **Update comments** to reflect the new default light theme

This is a CSS-only change — no component files need updating. The dashboard, jobs, readings, and all app pages will immediately pick up the light theme since they use the default CSS variables.

