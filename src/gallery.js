/** A keyboard-accessible keepsake gallery with honest, local photo fallbacks. */
const illustrations = [
  { src: '/assets/memory-sunset.jpg', alt: 'Illustration: a rose-coloured sunset over the sea' },
  { src: '/assets/memory-coffee.jpg', alt: 'Illustration: two cups of coffee in a sunlit café' },
  { src: '/assets/memory-flowers.jpg', alt: 'Illustration: blush flowers in warm window light' },
];

export function setupGallery(photos, openDialog) {
  const gallery = document.querySelector('#memory-gallery');
  const dialog = document.querySelector('#photo-dialog');
  const fullImage = document.querySelector('#photo-full');
  const caption = document.querySelector('#photo-caption');
  const note = document.querySelector('#photo-note');
  const count = document.querySelector('#photo-count');
  const galleryNote = document.querySelector('#gallery-note');
  const items = photos.map((photo, index) => ({
    ...photo,
    fallback: illustrations[index % illustrations.length],
    placeholder: !photo.src,
  }));
  let selectedIndex = 0;

  function updateGalleryNote() {
    galleryNote.hidden = !items.some((item) => item.placeholder);
  }

  function showPhoto(index) {
    selectedIndex = (index + items.length) % items.length;
    const photo = items[selectedIndex];
    fullImage.src = photo.placeholder ? photo.fallback.src : photo.src;
    fullImage.alt = photo.placeholder ? photo.fallback.alt : (photo.alt || photo.caption);
    caption.textContent = photo.caption;
    note.textContent = photo.placeholder
      ? 'An illustration for now. A place for a memory of our own.'
      : (photo.note || 'A little moment, kept forever.');
    count.textContent = `${selectedIndex + 1} / ${items.length}`;
  }

  for (const [index, photo] of items.entries()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-card reveal';
    button.setAttribute('aria-label', `View ${photo.caption}`);
    button.style.transitionDelay = `${Math.min(index, 2) * 100}ms`;
    const tape = document.createElement('span');
    tape.className = 'paper-tape';
    tape.setAttribute('aria-hidden', 'true');
    const image = document.createElement('img');
    image.className = 'memory-image';
    image.width = 600;
    image.height = 600;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = photo.placeholder ? photo.fallback.src : photo.src;
    image.alt = photo.placeholder ? photo.fallback.alt : (photo.alt || photo.caption);
    const label = document.createElement('span');
    label.className = 'memory-caption';
    label.textContent = photo.caption;
    const type = document.createElement('span');
    type.className = 'memory-type';
    type.textContent = photo.placeholder ? 'Your photo here' : 'A moment, forever';
    image.addEventListener('error', () => {
      if (photo.placeholder) return;
      photo.placeholder = true;
      image.src = photo.fallback.src;
      image.alt = photo.fallback.alt;
      type.textContent = 'Your photo here';
      updateGalleryNote();
      if (dialog.open && selectedIndex === index) showPhoto(index);
    });
    button.append(tape, image, label, type);
    button.addEventListener('click', () => {
      showPhoto(index);
      openDialog(dialog);
    });
    gallery.append(button);
  }

  fullImage.addEventListener('error', () => {
    const photo = items[selectedIndex];
    if (!photo || photo.placeholder) return;
    photo.placeholder = true;
    showPhoto(selectedIndex);
    updateGalleryNote();
  });
  dialog.querySelector('.photo-prev').addEventListener('click', () => showPhoto(selectedIndex - 1));
  dialog.querySelector('.photo-next').addEventListener('click', () => showPhoto(selectedIndex + 1));
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(selectedIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.querySelectorAll('.photo-prev,.photo-next').forEach((button) => { button.hidden = items.length < 2; });
  updateGalleryNote();
}
