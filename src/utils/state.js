export const deleteIn = (obj, deleteKey) => {
  const keys = Object.keys(obj);
  const result = keys
    .filter(k => k !== deleteKey)
    .reduce((memo, k) =>
      memo[k] = obj[k], {});
  return result;
};
