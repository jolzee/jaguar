const { SyncRedactor } = require("redact-pii");
const redactor = new SyncRedactor({
  customRedactors: {
    before: [
      {
        regexpPattern: /\b[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][ABD-HJLNP-UW-Z]{2}\b/gi,
        replaceWith: "UK_POST_CODE"
      }
    ]
  }
});
const redactedText = redactor.redact(
  "Hi David Johnson, Please give me a call Peter Joles at 555-555-5555 thanks jolzee@gmail.com 98075 RG31 5NS Cat wow ok 5500 0000 0000 0004 and 3000 0000 0000 04"
);
// Hi NAME, Please give me a call at PHONE_NUMBER
console.log(redactedText);
