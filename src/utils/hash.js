// Matches 'hash' from http://server.net/prefix-hash.js

const dateHash = () => {
  // Submissions are told to check at 22:30 UTC. Make sure the cache is refreshed
  // at this point by using a hash of the UTC month/day 1.55 hours in the future:
  // (The added .05 is for people who check too early)
  const date = new Date();
  date.setTime(date.getTime() + (1.55 * 60 * 60 * 1000));
  return `${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
};

export default `${__webpack_hash__}-${dateHash()}`;
