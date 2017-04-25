export default (url, callback) => {
  const xhr = new XMLHttpRequest();
  let pos = 0;

  const processChunk = (chunk) => {
    callback(null, chunk);
  };

  xhr.onprogress = () => {
    xhr
      .response
      .slice(pos)
      .split('\n')
      .slice(0, -1)
      .forEach((part) => {
        processChunk(part);
        pos += part.length + 1;
      });
  };

  xhr.onload = () => {
    const chunk = xhr.response.slice(pos);
    if (chunk) processChunk(chunk);
    callback();
  };

  xhr.onerror = () => {
    callback(Error('Connection failed'));
  };

  xhr.responseType = 'text';
  xhr.open('GET', url);
  xhr.send();
};

