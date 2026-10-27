import { createCelebration } from './effects.js';

/** Keep both answers reachable: grow the actual layout, never cover No. */
export function setupProposal(proposal) {
  const find = (id) => document.getElementById(id);
  const yes = find('proposal-yes');
  const no = find('proposal-no');
  const choices = find('proposal-choices');
  const hint = find('proposal-hint');
  const answer = find('proposal-answer');
  const title = find('proposal-answer-title');
  const celebration = createCelebration(find('proposal-confetti'));
  const autoYesAfterNoClicks = 15;
  let noClicks = 0;

  find('proposal-title').textContent = proposal.question;
  find('proposal-message').textContent = proposal.message;
  title.textContent = proposal.acceptedTitle;
  find('proposal-answer-message').textContent = proposal.acceptedMessage;

  const whatsappNumber = String(proposal.whatsappNumber || '').replace(/\D/g, '');
  if (/^[1-9]\d{9,14}$/.test(whatsappNumber)) {
    const message = proposal.whatsappMessage || 'Yes, I love you! ❤️';
    find('proposal-whatsapp-link').href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    find('proposal-whatsapp').hidden = false;
  }

  function acceptYes() {
    if (!answer.hidden) return;
    choices.hidden = true;
    hint.hidden = true;
    answer.hidden = false;
    title.focus({ preventScroll: true });
    celebration.celebrate();
  }

  no.addEventListener('click', () => {
    noClicks += 1;
    if (noClicks >= autoYesAfterNoClicks) {
      acceptYes();
      return;
    }
    // Width stays within the screen; height keeps increasing on every click.
    yes.style.width = `${120 + noClicks * 32}px`;
    yes.style.minHeight = `${58 + noClicks * 12}px`;
    yes.style.fontSize = `${Math.min(24 + noClicks * 4, 64)}px`;
    // Shrink on every click, approaching a readable 44px touch target.
    no.style.setProperty('--no-size', String(1 / (1 + noClicks * 1.5)));
    hint.textContent = `A little more room for love. ${noClicks} ${noClicks === 1 ? 'little nudge' : 'little nudges'}.`;
  });

  yes.addEventListener('click', acceptYes);

  find('proposal-reset').addEventListener('click', () => {
    celebration.clear();
    noClicks = 0;
    yes.style.removeProperty('width');
    yes.style.removeProperty('min-height');
    yes.style.removeProperty('font-size');
    no.style.removeProperty('--no-size');
    answer.hidden = true;
    choices.hidden = false;
    hint.hidden = false;
    hint.textContent = 'A little question. A whole lot of love.';
    yes.focus({ preventScroll: true });
  });
}
