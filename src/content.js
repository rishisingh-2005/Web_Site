/**
 * Make this gift yours: edit the values in this file.
 * Blank photo paths and dates are intentional placeholders, not real memories.
 * Put your files in public/photos or public/music and use paths like
 * '/photos/our-photo.jpg' or '/music/our-song.mp3'.
 */
export const content = {
  sender: 'Your person', // Replace with your name.
  recipient: 'My love', // Replace with her name or your favourite nickname.
  specialDate: '2023-08-09', // 9 August 2023 (interpreting 9/8/23 as day/month/year).

  heroMessage:
    'A little corner of the universe, made just for you. For all that we are, and all we have yet to be.',

  // Add your own photos. Empty paths display decorative illustrations.
  photos: [
    { src: '', alt: '', caption: 'A moment to keep', note: '' },
    { src: '', alt: '', caption: 'The everyday magic', note: '' },
    { src: '', alt: '', caption: 'More memories to make', note: '' },
  ],

  // Replace the titles and add your dates and memories when you are ready.
  timeline: [
    { title: 'Where it began', date: '2023-08-09', description: '' },
    { title: 'The little moments', date: '2024-02-20', description: '' },
    { title: 'All that comes next', date: 'STILL WRITING', description: '' },
  ],

  // A starting love letter. Each item becomes its own paragraph.
  letter: [
    'You make the ordinary feel extraordinary. Thank you for being you, and for making room for me in your world. Of all the places I could be, my favourite will always be beside you.',
  ],

  // Edit these cards to say what you love most about her.
  reasons: [
    {
      title: 'The way you are',
      text: 'You never have to be anyone else. The person you are is the person I adore.',
    },
    {
      title: 'Your beautiful heart',
      text: 'Your kindness, your warmth, and the love you give make my world a softer place.',
    },
    {
      title: 'Simply, you',
      text: 'There is no perfect list of reasons. I love the little things, the big things, and everything that makes you you.',
    },
  ],

  // The playful proposal: every No makes the Yes button bigger.
  proposal: {
    question: 'Do you love me?',
    message: 'Because my answer will always be you.',
    acceptedTitle: 'My favourite answer.',
    acceptedMessage: 'You just made my heart a little happier. I love you, today and in all the little tomorrows to come.',
    // International number including country code. No + or spaces needed.
    whatsappNumber: '916386720388',
    whatsappMessage: 'Yes, I love you! ❤️ I opened your little surprise, and my answer is YES! 🥰',
  },

  surprise: {
    title: 'My favourite place is with you.',
    message:
      'Here is to more laughter, more little adventures, and more ordinary days made wonderful together. Wherever life takes us, I hope you always know how deeply you are loved.',
    buttonLabel: 'One last little surprise',
  },

  // Official Spotify player. A local src takes priority for direct playback.
  // Clear spotifyTrackId and leave src blank to use the original piano loop.
  song: {
    src: '',
    title: 'Summertime Sadness',
    artist: 'Lana Del Rey',
    spotifyTrackId: '3BJe4B8zGnqEdQPMvfVjuS',
  },
};
