function formatDate(dateString, format = 'd/m/Y') {
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  switch (format) {
    case 'Y-m-d H:i:s':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case 'd/m/Y H:i:s':
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    case 'Y-m-d':
      return `${year}-${month}-${day}`;
    case 'd/m/Y':
      return `${day}/${month}/${year}`;
    case 'H:i:s':
      return `${hours}:${minutes}:${seconds}`;
    default:
      throw new Error(`Formato no válido: ${format}`);
  }
}

function arrayToObj(arr, key = '_id') {
  return arr.reduce((obj, item) => ({ ...obj, [item[key]]: item }), {});
}

function daysBetweenDates(auxExitDate, auxEntryDate) {
  const exitDate = new Date(auxExitDate);
  const entryDate = new Date(auxEntryDate);

  const diff = exitDate.getTime() - entryDate.getTime();
  return Math.floor(diff / 86400000);
}

module.exports = { formatDate, arrayToObj, daysBetweenDates };