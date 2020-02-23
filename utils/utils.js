const wordsToNumbers = require("words-to-numbers").wordsToNumbers;
const dayMonthYearMatcher = /\b(0?[1-9]|[12][0-9]|3[01])[- \/.](0?[1-9]|1[012])[- \/.](19|20)?[0-9]{2}\b/;
const monthDayYearMatcher = /\b(0?[1-9]|1[012])[- \/.](0?[1-9]|[12][0-9]|3[01])[- \/.](19|20)?[0-9]{2}\b/;
const currencyMatcher = /\b[0-9]{1,3}(?:,?[0-9]{3})*\.[0-9]{2}\b/;
const allCreditCardsMatcher = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|62[0-9]{14})\b/;
const ccVisaPattern = /\b(?:4[0-9]{12}(?:[0-9]{3})?)\b/;
const ccMastPattern = /\b(?:5[1-5][0-9]{14})\b/;
const ccAmexPattern = /\b(?:3[47][0-9]{13})\b/;
const ccDiscPattern = /\b(?:6(?:011|5[0-9][0-9])[0-9]{12})\b/;
const emailAddressPattern = /[a-z0-9]+([-+._][a-z0-9]+){0,2}@.*?(\.(a(?:[cdefgilmnoqrstuwxz]|ero|(?:rp|si)a)|b(?:[abdefghijmnorstvwyz]iz)|c(?:[acdfghiklmnoruvxyz]|at|o(?:m|op))|d[ejkmoz]|e(?:[ceghrstu]|du)|f[ijkmor]|g(?:[abdefghilmnpqrstuwy]|ov)|h[kmnrtu]|i(?:[delmnoqrst]|n(?:fo|t))|j(?:[emop]|obs)|k[eghimnprwyz]|l[abcikrstuvy]|m(?:[acdeghklmnopqrstuvwxyz]|il|obi|useum)|n(?:[acefgilopruz]|ame|et)|o(?:m|rg)|p(?:[aefghklmnrstwy]|ro)|qa|r[eosuw]|s[abcdeghijklmnortuvyz]|t(?:[cdfghjklmnoprtvwz]|(?:rav)?el)|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw])\b){1,2}/;
const usZipCode = /\b[0-9]{5}(?:-[0-9]{4})?\b/;
const ukPostCode = /\b[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][ABD-HJLNP-UW-Z]{2}\b/i;

function findAll(regexPattern, sourceString) {
  let output = [];
  let match;
  // make sure the pattern has the global flag
  let regexPatternWithGlobal = RegExp(regexPattern, "g");
  while ((match = regexPatternWithGlobal.exec(sourceString))) {
    // get rid of the string copy
    delete match.input;
    // store the match data
    output.push(match[0]);
  }
  return output;
}

Array.max = function(array) {
  return Math.max.apply(Math, array);
};

const findAllEmails = function(text) {
  return findAll(emailAddressPattern, text);
};

const findDatesDayMonthYear = function(text) {
  return findAll(dayMonthYearMatcher, text);
};

const findDatesMonthDayYear = function(text) {
  return findAll(monthDayYearMatcher, text);
};

const findCurrencies = function(text) {
  let currencies = findAll(currencyMatcher, text);
  return currencies.map(Number);
};

const findMax = function(numberArray) {
  return Array.max(numberArray);
};

const findCreditCardNumbers = function(text) {
  return findAll(allCreditCardsMatcher, text);
};

const findVisa = function(text) {
  return findAll(ccVisaPattern, text);
};

const findMasterCard = function(text) {
  return findAll(ccMastPattern, text);
};

const findAmex = function(text) {
  return findAll(ccAmexPattern, text);
};

const findDiscovery = function(text) {
  return findAll(ccDiscPattern, text);
};

const findZipCodes = function(text) {
  return findAll(usZipCode, text);
};

const findPostCodes = function(text) {
  return findAll(ukPostCode, text);
};

const textToNumbers = function(text) {
  console.log(`Input Text ${text}`);
  let result = wordsToNumbers(text);
  console.log(`Result Text ${result}`);
  return result;
};

const extractAllData = function(text) {
  const currencies = findCurrencies(text);
  const extractionObj = {
    text: text,
    emailAddresses: findAllEmails(text),
    datesDayMonthYear: findDatesDayMonthYear(text),
    datesMonthDayYear: findDatesMonthDayYear(text),
    currencies: currencies,
    maxCurrency: findMax(currencies),
    creditCardNumbers: {
      all: findCreditCardNumbers(text),
      visa: findVisa(text),
      masterCard: findMasterCard(text),
      amex: findAmex(text),
      discovery: findDiscovery(text)
    },
    usZipCodes: findZipCodes(text),
    ukPostCodes: findPostCodes(text)
  };
  return extractionObj;
};

module.exports = {
  extractAllData,
  findAllEmails,
  findDatesDayMonthYear,
  findDatesMonthDayYear,
  findCurrencies,
  findMax,
  findCreditCardNumbers,
  findVisa,
  findMasterCard,
  findAmex,
  findDiscovery,
  findZipCodes,
  findPostCodes,
  wordsToNumbers: textToNumbers
};
