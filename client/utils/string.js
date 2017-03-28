const capitalizeCache = {};

export function capitalizeFirstLetter(string) {
  let capitalized = capitalizeCache[string];
  if (capitalized) {
    return capitalizeCache[string];
  }
  capitalized = capitalizeCache[string] = string.charAt(0).toUpperCase() + string.slice(1);
  return capitalized;
}

export function isFile(string) {
  return /\.[0-9a-z]{1,5}$/.test(string);
}