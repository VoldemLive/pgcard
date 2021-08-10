  $(document).ready(function() {
    function fillList() {
      $.ajax({
        url: '/api/v1/brands',
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function(xhr) {
          xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
        },
        statusCode: {
          201: function() {},
          500: function() {}
        },
        success: function(data, textStatus, jqXHR) {
          $.each(data.data, function(index, item) {
            //console.log(data.data[index].brandname);
            $('#brandListTBody').append(
              '<tr>' +
              '<td>' + data.data[index].brandname + '</td>' +
              '<td>' +
              '<img class="ui small image" draggable="false" src="/api/v1/uploads/thumb/' +
              data.data[index].logo +
              '"></img></td></tr>');
          });
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          //console.log('error');
        }
      })
    }
    fillList();

    $('#createBrand').click(function() {
      window.location.href = '/brands/add';
    });
  });