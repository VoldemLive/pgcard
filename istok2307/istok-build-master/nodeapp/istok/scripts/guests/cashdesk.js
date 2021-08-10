function openLightBox(pathToImage) {
  var imgArray = $(pathToImage).data('images').imagesArray;
  let fancyboxItems = [];
  for (var i = 0; i < imgArray.length; i++) {
    let someItem = {
      src: '/api/v1/images/' + imgArray[i],
      opts: {
        caption: imgArray[i],
        thumb: '/api/v1/images/thumb/' + imgArray[i]
      }
    };
    fancyboxItems.push(someItem);
  }
  $.fancybox.open(fancyboxItems, {
    loop: true
  });
}

$(document).ready(function() {
  $('#itemsHolder').append('<div id="messageHolder" class="ui label large unselectable"> <p>За допомогою цього додатку ви можете знайти іграшки по штрихкоду або за артикулом.</p> </br> <p>Натисніть кнопку ' + "'" + 'Ідентифікувати' + "'" + ' для вибору опцій пошуку іграшки</p></br> <p>Вдалих покупок та торгівлі</p></br> <p>З повагою, Масяня ТМ</p></div>');
  showInfoPanel();
  hideLoading();
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    window.document.addEventListener('touchmove', e => {
      if (e.scale !== 1) {
        e.preventDefault();
      }
    }, {
      passive: false
    });
  }

  $('.ui.sidebar').sidebar({
    defaultTransition: {
      computer: {
        left: 'uncover',
        right: 'uncover',
        top: 'uncover',
        bottom: 'uncover'
      },
      mobile: {
        left: 'uncover',
        right: 'uncover',
        top: 'overlay',
        bottom: 'overlay'
      },
    },
    useLegacy: 'auto',
    mobileTransition: 'overlay',
  });

  $('#getItemByData').bind('click', (e) => {
    showInfoPanel();
    $('.ui.sidebar').sidebar('toggle');
  });
  $('#buttonSearchByPhoto').bind('click', (e) => {
    $("#barcodeImage").trigger("click");
  });
  $('#buttonSearchByArt').bind('click', (e) => {
    showLoading();
    $('.ui.sidebar').sidebar('toggle');
    $.ajax({
      url: '/api/v1/toys/bybarcodeAnonim/' + $('#articulOrBarcode').val(),
      type: "get",
      contentType: "application/json; charset=utf-8",
      beforeSend: function(xhr) {
        xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
      },
      success: function(data, textStatus, jqXHR) {
        hideLoading();
        if (data.data.length == 0) {
          $('#problemHeade').html('Не знайдено');
          if ($('#articulOrBarcode').val().length == 13) {
            $('#problemDescription').html('По штрихкоду ' + $('#articulOrBarcode').val() + ' іграшки в базі не знайдено. Спробуйте знайти по артикулу.');
          } else {
            $('#problemDescription').html('По артикулу ' + $('#articulOrBarcode').val() + ' іграшки в базі не знайдено. Спробуйте знайти по фото штрихкоду.');
          }
          $('.ui.modal').modal('show');
          showInfoPanel();
        } else {
          addItem(data);
        }
      }
    });
  });

  function showInfoPanel() {
    $('#itemsCardHolder').html('');
    $('#messageHolder').animate({
      opacity: 0.3
    }, 1000);
  }

  function hideInfoPanel() {
    $('#messageHolder').animate({
      opacity: 0
    }, 1000);
  }


  function showLoading() {
    $('#loadingDim').attr("active");
    $('#loadingDim').transition({
      duration: '0.3s',
      onComplete: function() {}
    });
  }

  function hideLoading() {
    $('#loadingDim').attr("active");
    $('#loadingDim').transition({
      duration: '0.3s',
      onComplete: function() {
        $('#loadingDim').removeAttr("active");
      }
    });
  }

  function addItem(data) {
    hideInfoPanel();
    $.each(data.data, function(index, item) {
      if (data.data[index].images != null && data.data[index].images.length > 0) {
        let imagesInJson = {
          "imagesArray": data.data[index].images
        };
        $('#itemsCardHolder').append(
          '<div class="ui card">' +
          '<div class="itemrowimage image"><img class="ui medium image" data-images=' +
          JSON.stringify(imagesInJson) +
          ' onclick="getNextImage(this)" draggable="false" src="/api/v1/images/thumb/' +
          data.data[index].images[0] +
          '"></img><i data-images=' + JSON.stringify(imagesInJson) + ' onclick="openLightBox(this)" class="zoom-in huge icon zoompanel"></i>' +
          '</div>' +
          '<div class="content">' +
          '<div class="header">' + data.data[index].ourarticul + '</div>' +
          '<div class="meta">' + '<a class="group">' + data.data[index].cnarticul + '</a></div>' +
          '<div class="description">' + data.data[index].ourname + '</div></div>' +
          '<div class="extra content">' +
          '<div class="item' + index + '">' +
          '<div class="stockrow"><div class="columnprice">Ціна: ' + data.data[index].priceoutuah + '</div></div></div></div>'
        );
      } else {
        $('#itemsCardHolder').append(
          '<div class="ui card">' +
          '<div class="itemrowimage image"><img class="ui medium image" draggable="false" src="/api/v1/images/thumb/empty.jpg">' +
          '</div>' +
          '<div class="content">' +
          '<div class="header">' + data.data[index].ourarticul + '</div>' +
          '<div class="meta">' + '<a class="group">' + data.data[index].cnarticul + '</a></div>' +
          '<div class="description">' + data.data[index].ourname + '</div></div>' +
          '<div class="extra content">' +
          '<div class="item' + index + '">' +
          '<div class="stockrow"><div class="columnprice">Ціна: ' + data.data[index].priceoutuah + '</div></div></div></div>'
        );
      }
    });
    if (data.data.length > 0) {
      $('#itemsCardHolder').append(
        '<br/><br/><br/><br/>'
      );
    }
  }

  BarcodeReader.Init();
  BarcodeReader.SetImageCallback(function(result) {
    hideLoading();
    if (result.length === 0) {
      $('#problemHeade').html('Фото не розпізнано');
      $('#problemDescription').html('Нажаль штрихкод не розпізнано, спробуй зробити чітке фото штрихкоду або пошукати за артикулом');
      $('.ui.modal').modal('show');
    } else {
      $.ajax({
        url: '/api/v1/toys/bybarcodeAnonim/' + result[0].Value,
        type: "get",
        contentType: "application/json; charset=utf-8",
        beforeSend: function(xhr) {
          xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
        },
        success: function(data, textStatus, jqXHR) {
          if (data.data.length == 0) {
            $('#problemHeade').html('Не знайдено');
            $('#problemDescription').html('Товару з штрихкодом ' + result[0].Value + ' в базі не знайдено. Спробуйте знайти за артикулом');
            $('.ui.modal').modal('show');
            showInfoPanel();
          } else {
            addItem(data);
          }
        }
      });
    };
  });
  $("#barcodeImage").on("change", function(e) {
    if (e.target.files && e.target.files.length) {
      showLoading();
      BarcodeReader.DecodeImage(URL.createObjectURL(e.target.files[0]));
    }
  });
});