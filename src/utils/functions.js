function transformQuery(obj) {
  const transformedObj = {};
  const entries = Object.entries(obj);

  for (const [key, value] of entries) {
    if (isNaN(value)) {
      transformedObj[key] = value ? JSON.parse(value) : '';
    } else {
      transformedObj[key] = parseInt(value);
    }
  }

  return transformedObj;
}

module.exports = {
  transformQuery,
}