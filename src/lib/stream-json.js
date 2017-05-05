const fetchSupported = window.fetch !== undefined;

const streamJsonFetch = (url, callback) => {
  fetch(url).then((response) => {
    const reader = response.body.getReader();
    let partial = '';
    const decoder = new TextDecoder();
    const parseResult = (result) => {
      partial += decoder.decode(result.value || new Uint8Array(), {
        stream: !result.done,
      });
      const pieces = partial.split('\n');
      const count = pieces.length;
      if (!result.done) {
        partial = pieces[count - 1];
      } else {
        callback();
      }
      for (let i = 0; i < count - 1; i++) {
        callback(null, pieces[i]);
      }
      if (!result.done) {
        return readFromResponse();
      }
    };
    const readFromResponse = () => (
      reader
        .read()
        .then(parseResult)
        .catch(callback)
    );
    readFromResponse();
  });
};

const streamJsonXHR = (url, callback) => {
  const xhr = new XMLHttpRequest();
  let pos = 0;

  const processPiece = (chunk) => {
    callback(null, chunk);
  };

  xhr.onprogress = () => {
    const pieces = xhr
      .response
      .slice(pos)
      .split('\n');
    for (let i = 0; i < pieces.length - 1; i++) {
      const piece = pieces[i];
      processPiece(piece);
      pos += piece.length + 1;
    }
  };

  xhr.onload = () => {
    const piece = xhr.response.slice(pos);
    if (piece) processPiece(piece);
    callback();
  };

  xhr.onerror = () => {
    callback(Error('Connection failed'));
  };

  xhr.responseType = 'text';
  xhr.open('GET', url);
  xhr.send();
};

export default (url, callback) => {
  return fetchSupported
    ? streamJsonFetch(url, callback)
    : streamJsonXHR(url, callback);
}