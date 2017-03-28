const available = (function localStorageIsAvailable() {
  try {
    const x = '__storage_test__';
    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}());

const get = (key) => {
  if (!available) return null;
  const value = localStorage.getItem(key);
  return value
    ? JSON.parse(value)
    : null;
};

const set = (key, value) => {
  if (!available) return;

  localStorage.setItem(
    key,
    JSON.stringify(value),
  );
};

export default {
  get, set, available,
};
