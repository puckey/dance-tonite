export default function createURL({ themeId, placeId, channelId }) {
  const dirs = [themeId];
  if (placeId) {
    dirs.push(placeId);
    if (channelId) {
      dirs.push(channelId);
    }
  }
  return `/${dirs.join('/')}`;
}
