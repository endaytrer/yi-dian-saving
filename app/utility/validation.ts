/**
 * validateInteger: check if the string contains integer
 * @param str the string to be checked
 * @param allowNegative default <pre>false</pre>
 * @param allowZero default <pre>false</pre>
 * @return {boolean} true if the string contains integer
 */
function validateInteger(
  str: string,
  allowNegative = false,
  allowZero = false
) {
  return (
    /^-?\d*$/.test(str) &&
    (allowNegative ? true : Number.parseInt(str) >= 0) &&
    (allowZero ? true : Number.parseInt(str) !== 0)
  );
}

function validateDouble(str: string, allowNegative = false, allowZero = false) {
  return (
    /^-?\d*\.?\d*$/.test(str) &&
    (allowNegative ? true : Number.parseFloat(str)) &&
    (allowZero ? true : Number.parseFloat(str) !== 0)
  );
}
function validateEmail(str: string) {
  return /^.+@.+\..+$/.test(str);
}
export { validateInteger, validateDouble, validateEmail };
