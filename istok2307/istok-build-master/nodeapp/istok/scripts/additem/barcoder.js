function getCheckDigit(enterNumber) {
  let s = enterNumber;
  let result = 0;
  for (counter = s.length - 1; counter >= 0; counter--) {
    result += parseInt(s.charAt(counter)) * (1 + (2 * (counter % 2)));
  }
  return (10 - (result % 10)) % 10;
}

$(document).ready(function() {
  $('#generateBarcode').click(function() {
    let prefix = 20;
    let barcodebody = prefix.toString() + (String(Math.floor(Math.random() * 1000000000000000)).slice(0, 10));
    let checkDigitIs = getCheckDigit(barcodebody);
    $('#barcode').val(barcodebody + checkDigitIs);
  });

});