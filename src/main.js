import { content } from './content.js';
import { createMusicPlayer } from './music.js';
import { setupSongPlayer } from './song-player.js';
import { setupGallery } from './gallery.js';
import { setupProposal } from './proposal.js';
import { setupReveals, createCelebration, motionPreference } from './effects.js';

const $ = (selector) => document.querySelector(selector);
const setText = (selector, value) => { $(selector).textContent = value; };
const recipient = content.recipient.trim() || 'My love';
const sender = content.sender.trim() || 'Your person';

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  svg.classList.add('icon');
  svg.setAttribute('aria-hidden', 'true');
  use.setAttribute('href', `#icon-${name}`);
  svg.append(use);
  return svg;
}

// Personal text is always inserted as text, never interpreted as markup.
setText('#hero-message', content.heroMessage.replace('you. For all', 'you.\nFor all'));
setText('#letter-greeting', `${recipient},`);
setText('#sender-name', sender);
setText('#welcome-recipient', `For you, ${recipient === 'My love' ? 'my love' : recipient}.`);
setText('#surprise-recipient', `${recipient},`);
setText('#surprise-title', content.surprise.title);
setText('#surprise-message', content.surprise.message);
setText('#surprise-signature', `Forever, ${sender === 'Your person' ? 'your person' : sender}`);
const finalButton = $('#final-surprise');
finalButton.replaceChildren(icon('sparkle'), document.createTextNode(content.surprise.buttonLabel));
if (recipient !== 'My love') document.title = `For ${recipient} — yours, always`;

for (const paragraph of content.letter) {
  const p = document.createElement('p');
  p.textContent = paragraph;
  $('#letter-body').append(p);
}

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
const formatDate = (date) => new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);

for (const [index, milestone] of content.timeline.entries()) {
  const item = document.createElement('li');
  item.className = 'reveal';
  item.style.transitionDelay = `${Math.min(index, 2) * 120}ms`;
  const heading = document.createElement('h3');
  heading.textContent = milestone.title;
  const parsed = parseDate(milestone.date);
  const date = document.createElement(parsed ? 'time' : 'p');
  date.className = 'timeline-date';
  date.textContent = parsed ? formatDate(parsed) : (milestone.date || 'Your date');
  if (parsed) date.dateTime = milestone.date;
  item.append(heading, date);
  if (milestone.description) {
    const description = document.createElement('p');
    description.className = 'timeline-description';
    description.textContent = milestone.description;
    item.append(description);
  }
  $('#timeline').append(item);
}

const specialDate = parseDate(content.specialDate);
if (specialDate) {
  const today = new Date();
  const calendarDay = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor((calendarDay(today) - calendarDay(specialDate)) / 86400000);
  setText('#special-date', days >= 0
    ? `${days.toLocaleString()} ${days === 1 ? 'day' : 'days'} of us · ${formatDate(specialDate)}`
    : `Our next special day · ${formatDate(specialDate)}`);
  $('#special-date').hidden = false;
}

// Native dialogs provide focus trapping, Escape, and return focus to the opener.
function openDialog(dialog) {
  if (dialog.open) return;
  dialog.showModal();
  document.body.classList.add('dialog-open');
}
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')]
      .filter((element) => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  dialog.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('dialog-open');
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
}
$('#open-surprise').addEventListener('click', () => openDialog($('#welcome-dialog')));
$('#start-story').addEventListener('click', () => {
  $('#welcome-dialog').close();
  $('#memories-title').setAttribute('tabindex', '-1');
  $('#memories-title').focus({ preventScroll: true });
  $('#memories').scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth' });
});

setupGallery(content.photos, openDialog);

const discovered = new Set();
const reasonCount = content.reasons.length;
setText('#reason-progress', reasonCount === 3 ? 'Three little notes. All for you.' : `${reasonCount} little notes. All for you.`);
for (const [index, reason] of content.reasons.entries()) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'reason-card reveal';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', `Reveal love note ${index + 1}`);
  const inner = document.createElement('span');
  inner.className = 'reason-inner';
  const front = document.createElement('span');
  front.className = 'reason-face reason-front';
  const number = document.createElement('span');
  number.className = 'reason-number';
  number.textContent = String(index + 1).padStart(2, '0');
  const hint = document.createElement('span');
  hint.className = 'reason-hint';
  hint.textContent = 'Tap to uncover a little love.';
  front.append(number, icon('heart'), hint);
  const back = document.createElement('span');
  back.className = 'reason-face reason-back';
  back.id = `reason-${index}`;
  back.setAttribute('aria-hidden', 'true');
  const heading = document.createElement('strong');
  heading.textContent = reason.title;
  const text = document.createElement('span');
  text.textContent = reason.text;
  back.append(icon('heart'), heading, text);
  inner.append(front, back);
  button.append(inner);
  button.setAttribute('aria-controls', back.id);
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    front.setAttribute('aria-hidden', String(expanded));
    back.setAttribute('aria-hidden', String(!expanded));
    button.setAttribute('aria-label', expanded ? `${reason.title}. ${reason.text} Close love note ${index + 1}.` : `Reveal love note ${index + 1}`);
    if (expanded) discovered.add(index);
    setText('#reason-progress', discovered.size === reasonCount
      ? 'And those are only the beginning.'
      : `${discovered.size} of ${reasonCount} little notes uncovered.`);
  });
  $('#reason-grid').append(button);
}

const celebration = createCelebration($('#confetti-layer'));
$('#final-surprise').addEventListener('click', () => {
  openDialog($('#final-dialog'));
  celebration.celebrate();
});
$('#final-dialog').addEventListener('close', celebration.clear);
let loveCount = 0;
$('#more-love').addEventListener('click', () => {
  celebration.celebrate();
  loveCount += 1;
  setText('#status-message', `A little more love, just for you. ${loveCount === 1 ? 'Always.' : 'And always.'}`);
  $('#more-love').replaceChildren(document.createTextNode(loveCount % 2 ? 'And a little more…' : 'Always, a little more'), icon('heart'));
});

let toastTimer;
const musicButton = $('#music-toggle');
musicButton.title = content.song.title;
if (content.song.spotifyTrackId && !content.song.src) {
  setupSongPlayer(content.song, musicButton);
} else {
const player = createMusicPlayer({
  src: content.song.src,
  onState({ playing, error }) {
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} background music: ${content.song.title}`);
    musicButton.querySelector('span').textContent = playing ? 'Music on' : 'Music off';
    if (error) {
      window.clearTimeout(toastTimer);
      setText('#status-message', error);
      $('#status-message').className = 'toast';
      toastTimer = window.setTimeout(() => { $('#status-message').className = 'sr-only'; }, 6500);
    }
  },
});
musicButton.addEventListener('click', () => { void player.toggle(); });
}

setupProposal(content.proposal);
setupReveals();
