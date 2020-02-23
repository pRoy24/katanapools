module.exports = {
  isEmptyObject: function(obj) {
    if (obj === undefined || obj === null || Object.keys(obj).length === 0) {
      return true;
    }
    return false;
  }
}