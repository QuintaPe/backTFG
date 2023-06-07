function arrayToObj(arr, key = '_id') {
  return arr.reduce((obj, item) => ({ ...obj, [item[key]]: item }), {});
}

function daysBetweenDates(auxExitDate, auxEntryDate) {
  const exitDate = new Date(auxExitDate);
  const entryDate = new Date(auxEntryDate);

  const diff = exitDate.getTime() - entryDate.getTime();
  return Math.floor(diff / 86400000);
}

module.exports = {
  arrayToObj,
  daysBetweenDates,
}