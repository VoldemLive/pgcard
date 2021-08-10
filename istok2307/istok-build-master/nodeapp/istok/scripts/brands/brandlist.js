var someID = null;
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

          // '<div class="ui card">' +
          // '  <div class="content">' +
          // '    <i class="right floated like icon"></i>' +
          // '    <i class="right floated star icon"></i>' +
          // '    <div class="header">' + data.data[index].brandname + '</div>' +
          // '    <div class="description">' +
          // '     <div class="image">' +
          // '       <img draggable="false" src="/api/v1/images/thumb/' + data.data[index].logo + '">' +
          // '     </div>' +
          // '    </div>' +
          // '  </div>' +
          // '  <div class="extra content">' +
          // '    <span class="right floated star">' +
          // '      <i class="edit icon"></i>' +
          // '      Редагувати' +
          // '    </span>' +
          // '  </div>' +
          // '</div>'

          $('#brandsHolder').append(
            '<div class="card" id="' + data.data[index].id + '">' +
            '<div class="ui spaced image">' +
            '<img draggable="false" src="/api/v1/images/thumb/' + data.data[index].logo + '">' +
            '</div>' +
            '<div class="content">' +
            '<div class="header">' + data.data[index].brandname + '</div>' +
            '</div>' +
            '<div class="extra content">' +
            '<a class="right floated" onclick="editBrand(' + data.data[index].id + ')">' +
            '<i class="edit icon right"></i>' +
            'Редагувати ' +
            '</a>' +
            '</div>' +
            '</div>'
          );
          $('#' + data.data[index].id).data('item', data.data[index]);
          // $('#brandListTBody').append(
          //   '<tr>' +
          //   '<td>' + data.data[index].brandname + '</td>' +
          //   '<td>' +
          //   '<img class="ui small image" draggable="false" src="/api/v1/images/thumb/' +
          //   data.data[index].logo +
          //   '"></img></td></tr>');
        });
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        //console.log('error');
      }
    })
  }
  fillList();



  $('#createBrand').click(function() {
    //window.location.href = '/brands/add';
    $('#editing').remove();
    $('.ui.dimmer.modals.page.transition').remove();
    $('#modalHolder').append(
      '<div class="ui tiny modal">' +
      '<div class="header">Новий виробник: </div>' +
      '<div class="image content">' +
      '<div id="imageContainer" class="ui medium image">' +
      '</div>' +
      '<div class="description">' +
      '<p>Нова назва:</p>' +
      '<div class="ui input">' +
      '<input type="text" id="labelBrandName" placeholder="Назва бренду">' +
      '</div>' +

      '<p>Країна виробник:</p>' +
      '<div id="country" class="ui fluid search selection dropdown">' +
      '<input type="hidden" name="country">' +
      '<i class="dropdown icon"></i>' +
      '<div class="default text">Країна виробник</div>' +
      '<div class="menu">' +
      '<div class="item" data-value="au"><i class="au flag"></i>Австралія</div>' +
      '<div class="item" data-value="at"><i class="at flag"></i>Австрія</div>' +
      '<div class="item" data-value="gb"><i class="gb flag"></i>Англія</div>' +
      '<div class="item" data-value="by"><i class="by flag"></i>Білорусь</div>' +
      '<div class="item" data-value="be"><i class="be flag"></i>Бельгія</div>' +
      '<div class="item" data-value="bg"><i class="bg flag"></i>Болгарія</div>' +
      '<div class="item" data-value="br"><i class="br flag"></i>Бразилія</div>' +
      '<div class="item" data-value="am"><i class="am flag"></i>Вірменія</div>' +
      '<div class="item" data-value="hk"><i class="hk flag"></i>Гонконг</div>' +
      '<div class="item" data-value="gr"><i class="gr flag"></i>Греція</div>' +
      '<div class="item" data-value="ge"><i class="ge flag"></i>Грузія</div>' +
      '<div class="item" data-value="dk"><i class="dk flag"></i>Данія</div>' +
      '<div class="item" data-value="ee"><i class="ee flag"></i>Естонія</div>' +
      '<div class="item" data-value="in"><i class="in flag"></i>Індія</div>' +
      '<div class="item" data-value="ie"><i class="ie flag"></i>Ірландія</div>' +
      '<div class="item" data-value="es"><i class="es flag"></i>Іспанія</div>' +
      '<div class="item" data-value="it"><i class="it flag"></i>Італія</div>' +
      '<div class="item" data-value="kz"><i class="kz flag"></i>Казахстан</div>' +
      '<div class="item" data-value="ca"><i class="ca flag"></i>Канада</div>' +
      '<div class="item" data-value="cn"><i class="cn flag"></i>Китай</div>' +
      '<div class="item" data-value="co"><i class="co flag"></i>Колумбія</div>' +
      '<div class="item" data-value="cu"><i class="cu flag"></i>Куба</div>' +
      '<div class="item" data-value="lv"><i class="lv flag"></i>Латвія</div>' +
      '<div class="item" data-value="my"><i class="my flag"></i>Малайзія</div>' +
      '<div class="item" data-value="md"><i class="md flag"></i>Молдова</div>' +
      '<div class="item" data-value="nl"><i class="nl flag"></i>Нідерланди</div>' +
      '<div class="item" data-value="de"><i class="de flag"></i>Німеччина</div>' +
      '<div class="item" data-value="no"><i class="no flag"></i>Норвегія</div>' +
      '<div class="item" data-value="ae"><i class="ae flag"></i>Об`єднані Арабські Емірати</div>' +
      '<div class="item" data-value="kr"><i class="kr flag"></i>Південна Корея</div>' +
      '<div class="item" data-value="kp"><i class="kp flag"></i>Північна Корея</div>' +
      '<div class="item" data-value="pl"><i class="pl flag"></i>Польща</div>' +
      '<div class="item" data-value="pt"><i class="pt flag"></i>Португалія</div>' +
      '<div class="item" data-value="ru"><i class="ru flag"></i>Росія</div>' +
      '<div class="item" data-value="ro"><i class="ro flag"></i>Румунія</div>' +
      '<div class="item" data-value="sk"><i class="sk flag"></i>Словаччина</div>' +
      '<div class="item" data-value="si"><i class="si flag"></i>Словенія</div>' +
      '<div class="item" data-value="us"><i class="us flag"></i>Сполучені Штати</div>' +
      '<div class="item" data-value="tw"><i class="tw flag"></i>Тайвань</div>' +
      '<div class="item" data-value="th"><i class="th flag"></i>Таїланд</div>' +
      '<div class="item" data-value="tr"><i class="tr flag"></i>Туреччина</div>' +
      '<div class="item" data-value="hu"><i class="hu flag"></i>Угорщина</div>' +
      '<div class="item" data-value="ua"><i class="ua flag"></i>Україна</div>' +
      '<div class="item" data-value="fi"><i class="fi flag"></i>Фінляндія</div>' +
      '<div class="item" data-value="fr"><i class="fr flag"></i>Франція</div>' +
      '<div class="item" data-value="cz"><i class="cz flag"></i>Чехія</div>' +
      '<div class="item" data-value="se"><i class="se flag"></i>Швеція</div>' +
      '<div class="item" data-value="ch"><i class="ch flag"></i>Швейцарія</div>' +
      '<div class="item" data-value="lk"><i class="lk flag"></i>Шрі-Ланка</div>' +
      '<div class="item" data-value="jp"><i class="jp flag"></i>Японія</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="description">' +
      '<div class="ui fluid icon input">' +
      '<input type="text" placeholder="Search a very wide input...">' +
      '<i class="search icon"></i>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="actions">' +
      '<div class="ui black deny button">' +
      'Закрити' +
      '</div>' +
      '<div class="ui positive right labeled icon button">' +
      'Створити' +
      '<i class="checkmark icon"></i>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<input id="file-input" type="file" name="name" style="display: none;" />'
    );

    $('#country.dropdown').dropdown();
    $('.ui.tiny.modal').modal({
      onHide: function() {
        console.log('hidden');
      },
      onShow: function() {
        console.log('shown');
      },
      onApprove: function() {
        let imgArray = $('#imageContainer').find('img');
        if (imgArray.length == 0) return;
        let fileNameIndex = imgArray[0].src.lastIndexOf("/") + 1;
        let filename = imgArray[0].src.substr(fileNameIndex);
        let fileNameWOExt = filename.split('.').slice(0, -1).join('.');
        // if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
        //   filename = fileNameWOExt + ".jpg";
        // } else {
        //   filename = fileNameWOExt + "_temp.jpg";
        // }
        data = {
          name: $('#labelBrandName').val(),
          logopath: filename,
          country: $('#country.dropdown').dropdown('get value')
        }
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
              location.reload();
              //window.location.href = '/brands';
            },
            500: function() {
              console.log('error 0');
            }
          },
          success: function(data, textStatus, jqXHR) {},
          error: function(XMLHttpRequest, textStatus, errorThrown) {}
        })
      }
    }).modal('show');
  });
});

function editBrand(curId) {
  onlyOneImage = true;
  var curObj = $('#' + curId).data('item');
  someID = curId;
  getPreImage(curObj.logo);
  $('#editing').remove();
  $('.ui.dimmer.modals.page.transition').remove();
  $('#modalHolder').append(
    // '<div id="editing" class="ui tiny modal">' +
    // '<i class="close icon"></i>' +
    // '<div class="header">' +
    // 'Profile Picture' + curObj.id + ' ' +
    // '</div>' +
    // '<div class="image content">' +
    // '<div class="ui small image">' +
    // '<img src="/api/v1/images/thumb/' + curObj.logo + '"' +
    // '</div>' +
    // '<div class="description">' +
    // '' +
    // '</div>' +
    // '<div class="actions">' +
    // '<div class="ui black deny button">' +
    // 'Закрити' +
    // '</div>' +
    // '<div class="ui positive right labeled icon button">' +
    // 'Змінити' +
    // '<i class="checkmark icon"></i>' +
    // '</div>' +
    // '</div>' +
    // '</div>'

    '<div class="ui tiny modal">' +
    '<div class="header">Виробник: ' + curObj.brandname + '</div>' +
    '<div class="image content">' +
    '<div id="imageContainer" class="ui tiny" style="margin:10px">' +
    //'<img id="logoBrandEditing" src="/api/v1/images/thumb/' + curObj.logo + '" class="ui medium bordered image">' +
    '</div>' +
    '<div class="description">' +
    '<p>Нова назва:</p>' +
    '<div class="ui input">' +
    '<input type="text" id="labelBrandName" placeholder="Назва бренду">' +
    '</div>' +


    '<p>Країна виробник:</p>' +
    '<div id="country" class="ui fluid search selection dropdown">' +
    '<input type="hidden" name="country">' +
    '<i class="dropdown icon"></i>' +
    '<div class="default text">Країна виробник</div>' +
    '<div class="menu">' +
    '<div class="item" data-value="au"><i class="au flag"></i>Австралія</div>' +
    '<div class="item" data-value="at"><i class="at flag"></i>Австрія</div>' +
    '<div class="item" data-value="gb"><i class="gb flag"></i>Англія</div>' +
    '<div class="item" data-value="by"><i class="by flag"></i>Білорусь</div>' +
    '<div class="item" data-value="be"><i class="be flag"></i>Бельгія</div>' +
    '<div class="item" data-value="bg"><i class="bg flag"></i>Болгарія</div>' +
    '<div class="item" data-value="br"><i class="br flag"></i>Бразилія</div>' +
    '<div class="item" data-value="am"><i class="am flag"></i>Вірменія</div>' +
    '<div class="item" data-value="hk"><i class="hk flag"></i>Гонконг</div>' +
    '<div class="item" data-value="gr"><i class="gr flag"></i>Греція</div>' +
    '<div class="item" data-value="ge"><i class="ge flag"></i>Грузія</div>' +
    '<div class="item" data-value="dk"><i class="dk flag"></i>Данія</div>' +
    '<div class="item" data-value="ee"><i class="ee flag"></i>Естонія</div>' +
    '<div class="item" data-value="in"><i class="in flag"></i>Індія</div>' +
    '<div class="item" data-value="ie"><i class="ie flag"></i>Ірландія</div>' +
    '<div class="item" data-value="es"><i class="es flag"></i>Іспанія</div>' +
    '<div class="item" data-value="it"><i class="it flag"></i>Італія</div>' +
    '<div class="item" data-value="kz"><i class="kz flag"></i>Казахстан</div>' +
    '<div class="item" data-value="ca"><i class="ca flag"></i>Канада</div>' +
    '<div class="item" data-value="cn"><i class="cn flag"></i>Китай</div>' +
    '<div class="item" data-value="co"><i class="co flag"></i>Колумбія</div>' +
    '<div class="item" data-value="cu"><i class="cu flag"></i>Куба</div>' +
    '<div class="item" data-value="lv"><i class="lv flag"></i>Латвія</div>' +
    '<div class="item" data-value="my"><i class="my flag"></i>Малайзія</div>' +
    '<div class="item" data-value="md"><i class="md flag"></i>Молдова</div>' +
    '<div class="item" data-value="nl"><i class="nl flag"></i>Нідерланди</div>' +
    '<div class="item" data-value="de"><i class="de flag"></i>Німеччина</div>' +
    '<div class="item" data-value="no"><i class="no flag"></i>Норвегія</div>' +
    '<div class="item" data-value="ae"><i class="ae flag"></i>Об`єднані Арабські Емірати</div>' +
    '<div class="item" data-value="kr"><i class="kr flag"></i>Південна Корея</div>' +
    '<div class="item" data-value="kp"><i class="kp flag"></i>Північна Корея</div>' +
    '<div class="item" data-value="pl"><i class="pl flag"></i>Польща</div>' +
    '<div class="item" data-value="pt"><i class="pt flag"></i>Португалія</div>' +
    '<div class="item" data-value="ru"><i class="ru flag"></i>Росія</div>' +
    '<div class="item" data-value="ro"><i class="ro flag"></i>Румунія</div>' +
    '<div class="item" data-value="sk"><i class="sk flag"></i>Словаччина</div>' +
    '<div class="item" data-value="si"><i class="si flag"></i>Словенія</div>' +
    '<div class="item" data-value="us"><i class="us flag"></i>Сполучені Штати</div>' +
    '<div class="item" data-value="tw"><i class="tw flag"></i>Тайвань</div>' +
    '<div class="item" data-value="th"><i class="th flag"></i>Таїланд</div>' +
    '<div class="item" data-value="tr"><i class="tr flag"></i>Туреччина</div>' +
    '<div class="item" data-value="hu"><i class="hu flag"></i>Угорщина</div>' +
    '<div class="item" data-value="ua"><i class="ua flag"></i>Україна</div>' +
    '<div class="item" data-value="fi"><i class="fi flag"></i>Фінляндія</div>' +
    '<div class="item" data-value="fr"><i class="fr flag"></i>Франція</div>' +
    '<div class="item" data-value="cz"><i class="cz flag"></i>Чехія</div>' +
    '<div class="item" data-value="se"><i class="se flag"></i>Швеція</div>' +
    '<div class="item" data-value="ch"><i class="ch flag"></i>Швейцарія</div>' +
    '<div class="item" data-value="lk"><i class="lk flag"></i>Шрі-Ланка</div>' +
    '<div class="item" data-value="jp"><i class="jp flag"></i>Японія</div>' +
    '</div>' +
    '</div>' +

    '</div>' +
    '</div>' +
    '<div class="actions">' +
    '<div class="ui black deny button">' +
    'Закрити' +
    '</div>' +
    '<div class="ui positive right labeled icon button">' +
    'Змінити' +
    '<i class="checkmark icon"></i>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<input id="file-input" type="file" name="name" style="display: none;" />'
  );
  $('#country.dropdown')
    .dropdown();
  $('#labelBrandName').val(curObj.brandname);
  $('#country.dropdown').dropdown('set selected', curObj.country);
  $('.ui.tiny.modal').modal({
    onHide: function() {
      console.log('hidden');
    },
    onShow: function() {
      console.log('shown');
    },
    onApprove: function() {
      let imgArray = $('#imageContainer').find('img');
      let fileNameIndex = imgArray[0].src.lastIndexOf("/") + 1;
      let filename = imgArray[0].src.substr(fileNameIndex);
      let fileNameWOExt = filename.split('.').slice(0, -1).join('.');
      if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
        filename = fileNameWOExt + ".jpg";
      } else {
        filename = fileNameWOExt + "_temp.jpg";
      }
      data = {
        id: someID,
        name: $('#labelBrandName').val(),
        logopath: filename,
        country: $('#country.dropdown').dropdown('get value')
      }
      $.ajax({
        url: '/api/v1/brands/update/:id',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function(xhr) {
          xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
        },
        statusCode: {
          201: function() {
            location.reload();
            //window.location.href = '/brands';
          },
          500: function() {
            console.log('error 0');
          }
        },
        success: function(data, textStatus, jqXHR) {},
        error: function(XMLHttpRequest, textStatus, errorThrown) {}
      })
    }
  }).modal('show');
}

$(document).on('click', '#imageContainer', function() {
  console.log('click click');
  //$('#file-input').trigger('click');
});