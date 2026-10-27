/** Load the official player only after the visitor asks to open it. */
export function setupSongPlayer(song, button) {
  const panel = document.getElementById('song-panel');
  const embed = document.getElementById('song-embed');
  const close = document.getElementById('song-close');
  const trackId = song.spotifyTrackId;
  let loadingTimer;
  if (!/^[A-Za-z0-9]{22}$/.test(trackId)) return;

  document.getElementById('song-title').textContent = song.title;
  document.getElementById('song-artist').textContent = song.artist || '';
  document.getElementById('song-external').href = `https://open.spotify.com/track/${trackId}`;
  button.querySelector('span').textContent = 'Our song';
  button.removeAttribute('aria-pressed');
  button.setAttribute('aria-controls', 'song-panel');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', `Open music player: ${song.title}${song.artist ? ` by ${song.artist}` : ''}`);

  function closePlayer(restoreFocus = false) {
    window.clearTimeout(loadingTimer);
    // Removing the player stops sound, including playback inside its iframe.
    embed.replaceChildren();
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (restoreFocus) button.focus({ preventScroll: true });
  }

  button.addEventListener('click', () => {
    if (!panel.hidden) {
      closePlayer(true);
      return;
    }
    const frame = document.createElement('iframe');
    const status = document.createElement('p');
    status.className = 'song-loading';
    status.setAttribute('role', 'status');
    status.textContent = 'Loading our song from Spotify…';
    frame.tabIndex = -1;
    frame.addEventListener('load', () => {
      window.clearTimeout(loadingTimer);
      frame.classList.add('is-loaded');
      frame.tabIndex = 0;
      status.hidden = true;
    });
    frame.addEventListener('error', () => {
      window.clearTimeout(loadingTimer);
      status.textContent = 'The player could not load. Open the song in Spotify using the link below.';
    });
    frame.title = `${song.title} by ${song.artist || 'the artist'} — Spotify player`;
    frame.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
    frame.width = '100%';
    frame.height = '152';
    frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    frame.allowFullscreen = true;
    // No autoplay parameter: playback requires the visitor's Play action.
    embed.replaceChildren(status, frame);
    loadingTimer = window.setTimeout(() => {
      status.textContent = 'Spotify is taking a little longer. You can open the song in Spotify below.';
    }, 8000);
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    close.focus({ preventScroll: true });
  });
  close.addEventListener('click', () => closePlayer(true));
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePlayer(true);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) closePlayer();
  });
  window.addEventListener('pagehide', () => closePlayer());
}
