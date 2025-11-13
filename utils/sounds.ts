export const playSound = (sound: 'click' | 'success' | 'error' | 'swoosh') => {
  try {
    const audioElement = document.getElementById(`${sound}-sound`) as HTMLAudioElement;
    if (audioElement) {
      // Rewind to the start to allow for rapid playback
      audioElement.currentTime = 0; 
      audioElement.play().catch(error => {
        // Autoplay can be blocked by the browser, log error if it happens
        console.error(`Audio play failed for '${sound}':`, error);
      });
    } else {
      console.warn(`Audio element for '${sound}' not found.`);
    }
  } catch (e) {
    console.error("Could not play sound", e);
  }
};
