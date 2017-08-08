const streamJsonXHR = (url, callback) => {
  let destroyed = false;
  const xhr = new XMLHttpRequest();
  let pos = 0;

  const processPiece = (chunk) => {
    callback(null, chunk);
  };

  xhr.onprogress = () => {
    if (destroyed) return;
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
    if (!destroyed && xhr.readyState === 4 && xhr.status === 403) {
      return callback(Error('Not found'));
    }
    const piece = xhr.response.slice(pos);
    if (piece) processPiece(piece);
    callback();
  };

  xhr.onerror = () => {
    if (!destroyed) {
      callback(Error('Connection failed'));
    }
  };

  xhr.responseType = 'text';
  xhr.open('GET', url, true);
  xhr.send();

  return {
    cancel: () => {
      xhr.abort();
      destroyed = true;
    },
  };
};

// NOTE: Not including Fetch version, because performance:
export default streamJsonXHR;
