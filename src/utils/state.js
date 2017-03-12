export const deleteIn = (obj, deleteKey) => {
  const keys = Object.keys(obj);
  const result = keys
    .filter(k => k !== deleteKey)
    .reduce((memo, k) => memo[k] = obj[k], {});
  return result;
};

export const setMinus = (S, item) => {
  const S_ = new Set();
  for (const s of S) {
    if (s !== item) {
      S_.add(s);
    }
  }
  return S_;
};

export const setPlus = (S, item) => {
  const S_ = new Set();
  for (const s of S) {
    S_.add(s);
  }
  S_.add(item);
  return S_;
};
