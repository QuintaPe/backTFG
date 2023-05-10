function transformQuery(obj) {
  const transformedObj = {};
  const entries = Object.entries(obj);
  
  for (const [key, value] of entries) {
    if (isNaN(value)) {
      transformedObj[key] = value || '';
    } else {
      transformedObj[key] = parseInt(value);
    }
  }
  
  return transformedObj;
}

function arrayToObj(arr, key = '_id') {
  return arr.reduce((obj, item) => {
    obj[item[key]] = item;
    return obj;
  }, {});
}

function daysBetweenDates(auxEndDate, auxStartDate) {
  const endDate = new Date(auxEndDate);
  const startDate = new Date(auxStartDate);

  const diff = endDate.getTime() - startDate.getTime();
  return Math.floor(diff / 86400000);
}

module.exports = {
  transformQuery,
  arrayToObj,
  daysBetweenDates,
}