/**
 * An opt-in music player. With no file configured, it plays an original,
 * synthesized piano-like melody. No sound or AudioContext starts on page load.
 * onState receives { playing: boolean, error: string }.
 */
export function createMusicPlayer({ src = '', onState = () => {} } = {}) {
  let audio;
  let context;
  let master;
  let timer;
  let desiredPlaying = false;
  let playing = false;
  let destroyed = false;
  let revision = 0;
  let eventIndex = 0;
  let phraseOrigin = 0;
  let pausedOffset = 0;
  const voices = new Set();
  const customSource = src.trim();
  const beatSeconds = 0.68;
  const phraseSeconds = 32 * beatSeconds;

  // Original eight-bar composition, in D major. MIDI note numbers keep the
  // score compact; accompaniment and melody are scheduled on the audio clock.
  const melody = [
    [0, 69, 1.5], [2, 74, 1], [3, 73, 0.8],
    [4, 71, 1.5], [6, 69, 1.6],
    [8, 66, 1.5], [10, 69, 1], [11, 71, 0.8],
    [12, 73, 2.6],
    [16, 74, 1.5], [18, 78, 1], [19, 76, 0.8],
    [20, 74, 1.5], [22, 73, 1.5],
    [24, 71, 1.5], [26, 69, 1], [27, 66, 0.8],
    [28, 69, 1.5], [30, 74, 1.7],
  ].map(([beat, note, duration]) => ({ beat, note, duration, velocity: 0.17 }));
  const chords = [
    [50, 57, 66], [47, 54, 62], [43, 50, 59], [45, 52, 61],
    [50, 57, 66], [47, 54, 62], [43, 50, 59], [45, 57, 61],
  ];
  const score = [
    ...melody,
    ...chords.flatMap((notes, bar) => notes.map((note, index) => ({
      beat: bar * 4 + index * 0.17,
      note,
      duration: 3.7 - index * 0.17,
      velocity: index === 0 ? 0.085 : 0.055,
    }))),
  ].sort((a, b) => a.beat - b.beat);

  function report(error = '') {
    onState({ playing, error });
  }

  function releaseVoice(voice) {
    for (const oscillator of voice.oscillators) oscillator.disconnect();
    voice.filter.disconnect();
    voice.envelope.disconnect();
    voices.delete(voice);
  }

  function playNote(note, start, duration, velocity) {
    const frequency = 440 * 2 ** ((note - 69) / 12);
    const envelope = context.createGain();
    const filter = context.createBiquadFilter();
    const fundamental = context.createOscillator();
    const overtone = context.createOscillator();
    const finish = start + duration + 0.08;
    fundamental.type = 'triangle';
    fundamental.frequency.value = frequency;
    overtone.type = 'sine';
    overtone.frequency.value = frequency * 2;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1900, start);
    filter.frequency.exponentialRampToValueAtTime(550, finish);
    filter.Q.value = 0.3;
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(velocity, start + 0.012);
    envelope.gain.exponentialRampToValueAtTime(velocity * 0.36, start + 0.18);
    envelope.gain.exponentialRampToValueAtTime(0.0001, finish);
    fundamental.connect(filter);
    overtone.connect(filter);
    filter.connect(envelope);
    envelope.connect(master);
    const voice = { oscillators: [fundamental, overtone], envelope, filter };
    voices.add(voice);
    fundamental.onended = () => releaseVoice(voice);
    for (const oscillator of voice.oscillators) {
      oscillator.start(start);
      oscillator.stop(finish + 0.02);
    }
  }

  function schedule() {
    if (!desiredPlaying || destroyed) return;
    const horizon = context.currentTime + 0.55;
    while (phraseOrigin + score[eventIndex].beat * beatSeconds < horizon) {
      const event = score[eventIndex];
      const start = phraseOrigin + event.beat * beatSeconds;
      // Skip stale notes if the browser delayed a timer while busy.
      if (start >= context.currentTime) {
        playNote(event.note, start, event.duration * beatSeconds, event.velocity);
      }
      eventIndex += 1;
      if (eventIndex === score.length) {
        eventIndex = 0;
        phraseOrigin += phraseSeconds;
      }
    }
    timer = window.setTimeout(schedule, 180);
  }

  function stopSound() {
    window.clearTimeout(timer);
    timer = undefined;
    if (audio) audio.pause();
    if (context && context.state !== 'closed') {
      if (playing) {
        pausedOffset = ((context.currentTime - phraseOrigin) % phraseSeconds + phraseSeconds) % phraseSeconds;
      }
      for (const voice of voices) {
        for (const oscillator of voice.oscillators) {
          try { oscillator.stop(); } catch { /* A scheduled voice may have ended. */ }
        }
        releaseVoice(voice);
      }
      void context.suspend().catch(() => {});
    }
    playing = false;
  }

  function pause() {
    if (destroyed) return;
    revision += 1;
    desiredPlaying = false;
    stopSound();
    report();
  }

  function handleFileError() {
    if (destroyed) return;
    revision += 1;
    desiredPlaying = false;
    stopSound();
    report('This song could not be loaded. Check the audio file path.');
  }

  async function toggle() {
    if (destroyed) return false;
    if (desiredPlaying) {
      pause();
      return false;
    }
    desiredPlaying = true;
    const attempt = ++revision;
    try {
      if (customSource) {
        if (!audio) {
          audio = new Audio(customSource);
          audio.loop = true;
          audio.preload = 'none';
          audio.volume = 0.55;
          audio.addEventListener('error', handleFileError);
        }
        await audio.play();
      } else {
        if (!context) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) throw new Error('Audio synthesis unavailable');
          context = new AudioContextClass();
          master = context.createGain();
          master.gain.value = 0.52;
          master.connect(context.destination);
        }
        await context.resume();
      }

      // A second click or tab change can cancel a pending play/resume promise.
      if (destroyed || attempt !== revision || !desiredPlaying) return playing;
      if (!customSource) {
        if (context.state !== 'running') throw new Error('Audio could not start');
        phraseOrigin = context.currentTime + 0.06 - pausedOffset;
        eventIndex = score.findIndex((event) => event.beat * beatSeconds >= pausedOffset);
        if (eventIndex === -1) {
          eventIndex = 0;
          phraseOrigin += phraseSeconds;
        }
        schedule();
      }
      playing = true;
      report();
    } catch {
      if (!destroyed && attempt === revision) {
        desiredPlaying = false;
        stopSound();
        report(customSource
          ? 'The song could not play. Check the audio file and try again.'
          : 'Music could not start in this browser. Please try again.');
      }
    }
    return playing;
  }

  function handleVisibility() {
    if (document.hidden && desiredPlaying) pause();
  }

  function destroy() {
    if (destroyed) return;
    pause();
    destroyed = true;
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('pagehide', pause);
    if (audio) {
      audio.removeEventListener('error', handleFileError);
      audio.removeAttribute('src');
      audio.load();
    }
    if (context && context.state !== 'closed') void context.close().catch(() => {});
  }

  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('pagehide', pause);

  return { toggle, pause, destroy, get playing() { return playing; } };
}
