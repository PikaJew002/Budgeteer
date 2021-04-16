import moment from 'moment';

function objectToArray(obj) {
  return Object.values(obj);
}

function numberToString(number) {
  if(Number(number).toFixed(2) !== "NaN" && number !== "" && number !== null) {
    return Number(number).toFixed(2);
  }
  return "";
}

function emptyStringToNull(string) {
  return string == "" ? null : string;
}

function otherIfNull(obj, attr, otherAttr) {
  return obj[attr] == null ? obj[otherAttr] : obj[attr];
}

function dateToString(year, month, day = null) {
  let returnString = "" + year + "-" + (month > 9 ? month : "0" + month);
  if(day == null) {
    return returnString;
  }
  return returnString + "-" + (day > 9 ? day : "0" + day);
}

function dateToFormatedString(date, format = "ddd, MMM D") {
  return moment(date).format(format);
}

function capitalize(word) {
  return word[0].toUpperCase() + word.substring(1);
}

function notZero(number) {
  return true;
}

export { emptyStringToNull, objectToArray, numberToString, otherIfNull, dateToString, dateToFormatedString, capitalize, notZero };
