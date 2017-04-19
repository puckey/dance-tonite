const silentDataUrl = 'data:audio/mpeg;base64,/+MYxAAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const pool = [];

export default {
  fill: () => {
    for (let i = 0; i < 4; i++) {
      const audio = new Audio();
      audio.src = silentDataUrl;
      audio.play();
      pool.push(audio);
    }
  },
  get: () => pool.shift(),
  release: audio => {
    audio.src = silentDataUrl;
    pool.push(audio);
  },
};
