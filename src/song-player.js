/** Load Spotify's official player only after the visitor opens it. */
export function setupSongPlayer(song, button) {
  const panel = document.getElementById('song-panel');
  const embed = document.getElementById('song-embed');
  const close = document.getElementById('song-close');
  const play = document.getElementById('song-play');
  const playerStatus = document.getElementById('song-player-status');
  const trackId = song.spotifyTrackId;
  let loadingTimer;
  let spotifyIframeAPI;
  let apiRequested = false;
  let playerCreated = false;
  let controller;
  let pageLeaving = false;
  if (!/^[A-Za-z0-9]{22}$/.test(trackId)) return;

  document.getElementById('song-title').textContent = song.title;
  document.getElementById('song-artist').textContent = song.artist || '';
  document.getElementById('song-external').href = `https://open.spotify.com/track/${trackId}`;
  button.querySelector('span').textContent = 'Our song';
  button.removeAttribute('aria-pressed');
  button.setAttribute('aria-controls', 'song-panel');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', `Open music player: ${song.title}${song.artist ? ` by ${song.artist}` : ''}`);

  function setPlaybackState(playing) {
    play.textContent = playing ? 'Pause song' : 'Play song';
    play.setAttribute('aria-pressed', String(playing));
    playerStatus.textContent = playing ? 'Song playing.' : 'Song paused.';
  }

  function createPlayer() {
    if (playerCreated) return;
    playerCreated = true;
    window.clearTimeout(loadingTimer);
    const status = document.createElement('p');
    status.className = 'song-loading';
    status.setAttribute('role', 'status');
    status.textContent = 'Loading our song from Spotify…';
    const mount = document.createElement('div');
    embed.replaceChildren(status, mount);

    spotifyIframeAPI.createController(mount, {
      uri: `spotify:track:${trackId}`,
      width: '100%',
      height: '152',
    }, (createdController) => {
      if (pageLeaving) {
        createdController.destroy();
        return;
      }
      controller = createdController;
      controller.addListener('ready', () => {
        if (controller !== createdController) return;
        window.clearTimeout(loadingTimer);
        status.hidden = true;
        play.disabled = false;
        const frame = mount.querySelector('iframe');
        if (frame) frame.title = `${song.title} by ${song.artist || 'the artist'} — Spotify player`;
        setPlaybackState(false);
        playerStatus.textContent = 'Ready to play.';
      });
      controller.addListener('playback_update', (event) => {
        if (controller !== createdController) return;
        setPlaybackState(!event.data.isPaused);
      });
    });

    loadingTimer = window.setTimeout(() => {
      status.textContent = 'Spotify is taking a little longer. You can open the song in Spotify below.';
    }, 8000);
  }

  function hidePlayer(restoreFocus = false) {
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', `Open music player: ${song.title}${song.artist ? ` by ${song.artist}` : ''}`);
    if (restoreFocus) button.focus({ preventScroll: true });
  }

  function stopPlayer() {
    window.clearTimeout(loadingTimer);
    if (controller) controller.destroy();
    controller = undefined;
    embed.replaceChildren();
    playerCreated = false;
    play.disabled = true;
    setPlaybackState(false);
    hidePlayer();
  }

  button.addEventListener('click', () => {
    if (!panel.hidden) {
      hidePlayer(true);
      return;
    }

    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', `Close music player: ${song.title}${song.artist ? ` by ${song.artist}` : ''}`);
    close.focus({ preventScroll: true });

    if (spotifyIframeAPI) {
      createPlayer();
      return;
    }
    if (apiRequested) return;

    apiRequested = true;
    window.onSpotifyIframeApiReady = (api) => {
      spotifyIframeAPI = api;
      if (!panel.hidden) createPlayer();
    };
    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    script.addEventListener('error', () => {
      window.clearTimeout(loadingTimer);
      playerStatus.textContent = 'Spotify could not load. Use the link below to open the song.';
      apiRequested = false;
    });
    panel.querySelector('#song-embed').replaceChildren();
    playerStatus.textContent = 'Loading our song from Spotify…';
    loadingTimer = window.setTimeout(() => {
      playerStatus.textContent = 'Spotify is taking a little longer. You can open the song in Spotify below.';
    }, 8000);
    document.head.append(script);
  });

  play.addEventListener('click', () => {
    if (!controller) return;
    if (play.getAttribute('aria-pressed') === 'true') controller.pause();
    else controller.play();
  });
  close.addEventListener('click', () => hidePlayer(true));
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      hidePlayer(true);
    }
  });
  window.addEventListener('pagehide', () => {
    pageLeaving = true;
    stopPlayer();
  });
}
