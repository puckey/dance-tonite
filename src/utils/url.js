const defaults = {
};

const ignore = {
};

const URL_ELEMENT = document.createElement('a');

const urlToQueryData = (url) => {
  URL_ELEMENT.href = url;
  const query = URL_ELEMENT.search;
  const data = {};
  if (query.length > 0) {
    query
      .substring(1)
      .split('&')
      .forEach(keyValue => {
        const pair = keyValue.split('=');
        let value = pair[1];
        if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        }
        data[pair[0]] = value;
      });
  }
  return Object.assign({}, defaults, data);
};

export const queryData = urlToQueryData(window.location);

export const toQueryString = obj => Object.keys(obj)
  .filter(key => !(
    obj[key] === null
    || defaults[key] === obj[key]
    || ignore[key])
  )
  .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
  .join('&');
