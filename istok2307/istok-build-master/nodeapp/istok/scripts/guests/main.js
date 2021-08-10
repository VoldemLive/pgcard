$(document).ready(function() {
  var $resultEl = $("#resultholder");
  BarcodeReader.Init();
  BarcodeReader.SetImageCallback(function(result) {
    if (result.length === 0) {
      $("#resultholder").html("<ul> try again </ul>");
    } else {
      $("#resultholder").html("<ul>" + result[0].Value + "</ul>");
    }
  });
  $('#imageUploader').on("change", function(e) {
    let res = null;
    if (e.target.files && e.target.files.length) {
      BarcodeReader.DecodeImage(URL.createObjectURL(e.target.files[0]));
    }
  })
})