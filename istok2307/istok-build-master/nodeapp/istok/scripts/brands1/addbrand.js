$(document).ready(function() {
  $("#submitBrand").click(function(e) {
    let someParams = [];
    let somePict = null;
    let pathToFile = null;
    let somePictPath = null;
    $(".someItemImage").each(function(index, element) {
      $.each(this.attributes, function() {
        if (this.specified && this.name == 'src') {
          pathToFile = this.value;
        }
      });
      somePictPath = pathToFile.split("/")[pathToFile.split("/").length -
        1];
      ////console.log(somePictPath);
    });
    // someParams.push({
    //   'name': $('.brandName').val(),
    //   'logopath': somePictPath
    // });

    var data = {
      "name": $('.brandName').val(),
      "logopath": somePictPath
    };
    $.ajax({
      url: '/api/v1/brands/add',
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      beforeSend: function(xhr) {
        xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
      },
      statusCode: {
        201: function() {
          //console.log('completed 0');
          window.location.href = '/brands';
        },
        500: function() {
          //console.log('error 0');
        }
      },
      success: function(data, textStatus, jqXHR) {
        //console.log('completed');
        window.location.href = '/';
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        //console.log('error');
      }
    })
    //createBrand(someParams);
  })
})