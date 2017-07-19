export default (country) => {
  return country.split('').map(function (d) {
    const value = d.charCodeAt(0) + 127397 - 0x10000;
    return String.fromCharCode(value >>> 10 & 0x3FF | 0xD800) + String.fromCharCode(0xDC00 | value & 0x3FF);
  }).join('');
}