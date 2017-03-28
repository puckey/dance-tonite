export const getUrlParameter = (name) => {
  const regex = new RegExp(`[\\?&]${
    name
      .replace(/[[]/, '\\[')
      .replace(/[\]]/, '\\]')
  }=([^&#]*)`);
  const results = regex.exec(location.search);
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
