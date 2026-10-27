# Yours, always

A complete, intimate romantic website: a sealed-letter welcome, photo keepsakes with a keyboard-accessible viewer, an editable story timeline, a love letter, reversible love-note cards, opt-in music, and a final heart-confetti surprise.

The supplied YouTube Short could not be retrieved. The original fallback design uses ivory stationery, burgundy wax seals, blush ribbon, and handwritten typography. The generated scenes are explicitly labeled illustrations until you add your photographs; no personal memories or dates are invented.

## Run locally

Install Node.js 20 or newer, open a terminal in this folder, and run:

```sh
npm run dev
```

Open **http://127.0.0.1:5173**. No `npm install` is needed: the app and local server have no package dependencies. In Windows PowerShell, use `npm.cmd run dev` if the execution policy blocks `npm.ps1`. Stop the server with Ctrl+C.

To use a different port:

```sh
npm run dev -- --port 5174
```

To preview on a phone on your local network, use `npm run dev -- --host 0.0.0.0` and open your computer's local IP address on port 5173. Your firewall must allow the connection.

## Make it yours

All personal content lives in **`src/content.js`**. Edit the existing values and keep the JavaScript quotes, commas, and brackets intact.

| Setting | What to change |
| --- | --- |
| `sender` / `recipient` | Your names or favourite nicknames. |
| `specialDate` | Optional `YYYY-MM-DD`; a valid past date shows a calendar-day count. Blank hides it. |
| `heroMessage` | The opening message. |
| `photos` | Each photo's `src`, descriptive `alt`, handwritten `caption`, and optional `note`. |
| `timeline` | Your milestone titles, dates, and descriptions. Dates accept `YYYY-MM-DD` or a short custom label. |
| `letter` | Your message, one paragraph per array item. |
| `reasons` | The titles and messages revealed by the love-note cards. Add or remove entries as desired. |
| `surprise` | The final message, heading, and reveal button label. |
| `proposal` | The proposal question, subtitle, and message revealed by Yes. The first 14 No clicks grow Yes and shrink No; the 15th opens the Yes reveal. Ask me again resets both buttons and the count. |
| `proposal.whatsappNumber` | The WhatsApp destination, including country code (for example `91` for India). Leave blank to hide the WhatsApp button. |
| `proposal.whatsappMessage` | The prefilled answer she can review and send in WhatsApp after choosing Yes. |
| `song` | Song title, artist, Spotify track ID, and optional local audio file path. A local `src` takes priority over Spotify. |

For example, create `public/photos/`, put `together.jpg` inside, and update a photo entry:

```js
{ src: '/photos/together.jpg', alt: 'Us smiling together by the sea', caption: 'My favourite day', note: 'Your own memory goes here.' }
```

Photo paths are relative to `public/`, so **do not** put `/public/` in the URL. Empty or unavailable photo paths fall back to the decorative illustrations. JPEG or WebP photos under 1 MB are recommended. Add as many entries as you like; the layout wraps automatically.

After she chooses **Yes**, **Send my answer on WhatsApp** opens a chat with the configured number. She must press **Send** in WhatsApp herself. The website does not automatically send, store, or verify delivery of her answer.

For your song, create `public/music/`, add a browser-compatible file, and set:

```js
song: { src: '/music/our-song.mp3', title: 'Our favourite song' }
```

The default **Our song** button opens the official Spotify player for **Summertime Sadness — Lana Del Rey**. Press Play inside the player; Spotify determines the available playback experience. An **Open in Spotify** link is also provided. Closing the player or hiding the tab stops it. The Spotify embed loads only after the listener opens the music control, with no automatic playback. Clear both `src` and `spotifyTrackId` to restore the original synthesized piano melody. A local audio `src` uses the site's direct play/pause control instead.

The letter, names, and reasons are starter text. Replace them with your own words before gifting the site. Fonts and images are local. Spotify makes its own network requests when the listener opens its player.

## Build and share

```sh
npm run check
npm run build
```

The production website is written to `dist/`. Upload **the contents** of that folder to a static web host configured at the domain root. Open the site over HTTP(S); double-clicking `index.html` will not load ES modules correctly. There is no backend, account system, or database. Anyone who can access your hosting URL can view the personal content, so choose the host's privacy settings to suit your gift.

## Deploy to GitHub Pages

This repository includes a GitHub Actions workflow that builds and publishes the site whenever you push to `main` or `master`.

1. Push this project to `https://github.com/rishisingh-2005/Web_Site`.
2. In the repository on GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
3. Open the **Actions** tab and wait for **Deploy to GitHub Pages** to finish.
4. Visit `https://rishisingh-2005.github.io/Web_Site/`.

The build automatically adds the repository subpath to asset URLs, so the project works from GitHub Pages even though it is published under `/Web_Site/`. To publish an update, push the changes to `main` or `master`; the workflow will redeploy it.

Before publishing, review `src/content.js` and remove or replace any personal details you do not want publicly accessible. GitHub Pages sites are public.

## Source guide

- `index.html` — semantic sections, navigation, and native accessible dialogs.
- `src/content.js` — all personalization.
- `src/styles.css` — design tokens, layout, typography, responsive styles, reduced-motion rules.
- `src/main.js` — content rendering, timeline, love notes, dialogs, and music control.
- `src/gallery.js` — photo viewer and image fallbacks.
- `src/effects.js` — once-only scroll reveals and bounded confetti.
- `src/music.js` — audio file playback and original synthesized music.
- `src/song-player.js` — opt-in official Spotify player and playback cleanup.
- `public/assets/` — optimized generated decorative images and local fonts.
- `scripts/` — dependency-free preview server and production build.

Keyboard controls: Tab to move, Enter/Space to activate buttons, Escape to close dialogs, and Left/Right arrows to navigate photos. Reduced-motion preferences disable floating hearts, confetti, smooth scrolling, and long transitions.

Font license and source files are included in `public/assets/fonts/`. Decorative imagery was generated for this project: cream wax-sealed envelope and blush ribbon; rose sea sunset; two sunlit café coffees; blush flowers by a window. The JPEGs preserve the generated compositions while reducing download size.
