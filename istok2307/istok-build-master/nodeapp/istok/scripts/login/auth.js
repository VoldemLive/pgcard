$(document).ready(function() {

  $('#authCall').click(function() {
    appendAuthModal();
    $('#authModal').modal({
      closable: false,
      inverted: true,
      blurring: true
    }).modal('show');
  });

  function appendAuthModal() {
    $('body').append(
      '<div id="authModal" class="tiny modal"><div class="content"><div class="ui container"><h2>Привіт, вкажи свій ключ</h2><div class="ui left fluid icon input"><input id="userKey" type="text" placeholder="ключ доступу введи тут..."><i class="key icon"></i></div><div class="ui divider"></div><button id="authCheck" class="ui green huge button">Авторизація</button></div></div></div>'
    );

    $(document).on('click', '#authCheck', function() {
      let curKey = $('#userKey').val();
      $('#authCheck').addClass('loading');
      $.ajax({
        url: '/api/v1/user',
        type: "GET",
        beforeSend: function(xhr) {
          xhr.setRequestHeader('x-access-token', curKey);
        },
        success: function(dataString) {
          $('#authCheck').removeClass('loading');
          $('#authModal').removeClass('active');
          localStorage.setItem('access-token', curKey);
          $('#userKey').val('');
          $('#authModal').modal('hideDimmer');
          $('#authCall').children().removeClass('red');
          $('#authCall').children().addClass('green');
          location.reload();
        },
        error: function(error) {
          localStorage.setItem('access-token', null);
          $('#userKey').val('');
          $('#authCheck').removeClass('loading');
          $('#authCheck').transition('shake');
        }
      });
    });

    $('#authModal').modal({
      closable: false,
      inverted: true,
      blurring: true
    }).modal('show');

  }

  function showAuthModal() {
    $('#authModal').modal({
      closable: false,
      inverted: true,
      blurring: true
    }).modal('show');
  }

  function removeAuthModal() {
    $("#authModal").remove();
  }

  function checkUser() {
    var curKey = localStorage.getItem('access-token');
    if (localStorage.getItem('access-token').replace(/\s/g, "") == "") {
      appendAuthModal();
      showAuthModal();
    } else {
      $.ajax({
        url: '/api/v1/user',
        type: "GET",
        beforeSend: function(xhr) {
          xhr.setRequestHeader('x-access-token', curKey);
        },
        success: function(dataString) {
          isValid = true;
          $('#authCall').children().removeClass('red');
          $('#authCall').children().addClass('green');
          removeAuthModal();
        },
        error: function(error) {
          localStorage.setItem('access-token', "");
          checkUser();
        }
      });
    }
  }

  checkUser();
});