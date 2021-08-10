$(document).ready(function() {
  $('#findImagesInArchive').click(function() {
    var curKey = localStorage.getItem('access-token');
    $('#findImagesInArchive').addClass('loading');
    $.ajax({
      url: '/api/v1/oldimages',
      type: "GET",
      beforeSend: function(xhr) {
        xhr.setRequestHeader('x-access-token', curKey);
      },
      success: function(dataString) {
        $('#findImagesInArchive').removeClass('loading');
      },
      error: function(error) {
        $('#findImagesInArchive').removeClass('orange');
        $('#findImagesInArchive').addClass('red');
      }
    });
  });
})