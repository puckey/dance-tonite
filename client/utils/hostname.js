export default function getHostName(url) {
  return url
    .split('/')[url.indexOf('://') > -1 ? 2 : 0]
    .replace(/(www\.)*/g, '');
}
