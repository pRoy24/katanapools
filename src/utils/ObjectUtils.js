module.exports = {
  isEmptyObject: function(obj) {
    if (obj === undefined || obj === null || Object.keys(obj).length === 0) {
      return true;
    }
    return false;
  },
  isNonEmptyObject: function(obj) {
    if (obj === undefined || obj === null || Object.keys(obj).length === 0) {
      return false;
    }
    return true;    
  },
  isEmptyArray: function(arr) {
    if (arr === undefined || arr === null || arr.length === 0) {
      return true;
    }
    return false;
  },
  isNonEmptyArray: function(arr) {
    if (arr === undefined || arr === null || arr.length === 0) {
      return false;
    }
    return true;    
  },
  isEmptyString(str) {
    if (str === undefined || str === null || str.length === 0) {
      return true;
    } 
    return false;
  }
  
  
  
}