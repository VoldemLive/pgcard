var totalItems = 0;
var allPartners = [];

function getNextImage(curCaller) {
  var imgArray = $(curCaller).data('images').imagesArray;
  for (var i = 0; i < imgArray.length; i++) {
    let indx = -1;
    if (curCaller.src.includes(imgArray[i])) {
      indx = i;
      if (i == imgArray.length - 1) {
        $(curCaller).attr('src', "/api/v1/images/thumb/" + imgArray[0]);
      } else {
        $(curCaller).attr('src', "/api/v1/images/thumb/" + imgArray[i + 1]);
      }
      break;
    }
  }
}

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

function UpdateQueryString(key, value) {
  if ('URLSearchParams' in window) {
    var searchParams = new URLSearchParams(window.location.search)
    searchParams.set(key, value);
    var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);
  }
}

function GetQueryStringValueByKey(key) {
  if ('URLSearchParams' in window) {
    let searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(key);
  }
}

function DeleteQueryStringValueByKey(key) {
  if ('URLSearchParams' in window) {
    let searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(key);
    if (searchParams.toString() != '') {
      var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    } else {
      var newRelativePathQuery = window.location.pathname;
    }
    history.pushState(null, '', newRelativePathQuery);
  }
}

function getAllPropertiesWithPage(numberOfThePage) {
  if ('URLSearchParams' in window) {
    var searchParams = new URLSearchParams(window.location.search)
    searchParams.set('page', numberOfThePage);
    var completeQueryString = window.location.pathname + '?' + searchParams.toString();
    return completeQueryString;
  }
}


$(document).ready(function() {
  var filterCodeisReady = false;
  var filterQuantityIsReady = false;

  //on load page set options of the controls
  if (GetQueryStringValueByKey('sort_by') == null) {
    UpdateQueryString('sort_by', '-edited');
  }

  if (GetQueryStringValueByKey('bygroup') == null) {
    UpdateQueryString('bygroup', 'Всі');
  }

  if (GetQueryStringValueByKey('wophotos') == 'true') {
    $('#fwophoto').checkbox('check');
  }
  if (GetQueryStringValueByKey('wocat') == 'true') {
    $('#fwocategory').checkbox('check');
  }
  if (GetQueryStringValueByKey('woprop') == 'true') {
    $('#fwoproperties').checkbox('check');
  }
  if (GetQueryStringValueByKey('woqinbox') == 'true') {
    $('#fwoquntityinbox').checkbox('check');
  }
  if (GetQueryStringValueByKey('wobarcode') == 'true') {
    $('#fwobarcode').checkbox('check');
  }
  if (GetQueryStringValueByKey('onlyOnStock') == 'true') {
    $('#fonlyOnStock').checkbox('check');
  }
  $('.filterCode').dropdown('set selected', GetQueryStringValueByKey('bygroup'));

  $('#makeSearch').click(function() {
    UpdateQueryString('wophotos', $('#fwophoto').find('input').is(':checked'));
    UpdateQueryString('wocat', $('#fwocategory').find('input').is(':checked'));
    UpdateQueryString('woprop', $('#fwoproperties').find('input').is(':checked'));
    UpdateQueryString('woqinbox', $('#fwoquntityinbox').find('input').is(':checked'));
    UpdateQueryString('wobarcode', $('#fwobarcode').find('input').is(':checked'));
    UpdateQueryString('onlyOnStock', $('#fonlyOnStock').find('input').is(':checked'));
    UpdateQueryString('bygroup', $('.filterCode').dropdown('get value'));
    location.reload();
  });

  $('.filterCode').dropdown({
    onChange: function(value, text, $selectedItem) {
      UpdateQueryString('page', '1');
      UpdateQueryString('bygroup', value);
      location.reload();
    }
  })

  $('.itemsQuantity').dropdown({
    onChange: function(value, text, $selectedItem) {
      if (filterQuantityIsReady == true) {
        UpdateQueryString('page', '1');
        UpdateQueryString('limit', value);
        location.reload();
      }
    }
  })

  let isQuantityOnPage = GetQueryStringValueByKey('limit');
  if (isQuantityOnPage != null) {
    $('.itemsQuantity').dropdown('set selected', isQuantityOnPage);
    filterQuantityIsReady = true;
  } else {
    $('.itemsQuantity').dropdown('set selected', '48');
    UpdateQueryString('page', '1');
    UpdateQueryString('limit', '48');
    filterQuantityIsReady = true;
  }

  function paginationConstrustor(allItemsQuantity) {
    let nibourQuantity = 2;
    let curPage = parseInt(GetQueryStringValueByKey('page'));
    let itemsOnPage = parseInt(GetQueryStringValueByKey('limit'));
    let allPages = Math.ceil(allItemsQuantity / itemsOnPage);
    let createFirstButton = false;
    let createLastButton = false;

    if (allPages <= 7) {
      for (let i = 1; i < allPages + 1; i++) {
        if (i == curPage) {
          $('.pagePagination').append(' <a class = "item active">' + i + '</a>');
        } else {
          $('.pagePagination').append(' <a class = "item"' +
            ' href = "' + getAllPropertiesWithPage(i) + '">' + i + '</a>');
        }
      }
    } else {
      if (curPage == 1) {
        $('.pagePagination').append('<a class = "active item"> 1 </a>');
      } else {
        $('.pagePagination').append('<a class = "item"' +
          'href = "' + getAllPropertiesWithPage(1) + '" > 1 </a>');
      }

      if (curPage < 5) {
        for (let i = 2; i < 6; i++) {
          if (i == curPage) {
            $('.pagePagination').append(' <a class = "item active">' + i + '</a>');
          } else {
            $('.pagePagination').append(' <a class = "item"' +
              ' href = "' + getAllPropertiesWithPage(i) + '">' + i + '</a>');
          }
        }
        $('.pagePagination').append(' <a class = "item disabled"> ... </a>');
      }
      if (curPage >= 5 && curPage < allPages - 3) {
        let prevPageNum = curPage - 1;
        let nextPageNum = curPage + 1;
        $('.pagePagination').append(' <a class = "item disabled"> ... </a>');
        $('.pagePagination').append(' <a class = "item"' +
          ' href = "' + getAllPropertiesWithPage(prevPageNum) + '">' + prevPageNum + '</a>');
        $('.pagePagination').append(' <a class = "item active">' + curPage + '</a>');
        $('.pagePagination').append(' <a class = "item"' +
          ' href = "' + getAllPropertiesWithPage(nextPageNum) + '">' + nextPageNum + '</a>');
        $('.pagePagination').append(' <a class = "item disabled"> ... </a>');
      }
      if (curPage >= allPages - 3) {
        let prevPageNum = allPages - 4;
        $('.pagePagination').append(' <a class = "item disabled"> ... </a>');
        for (let i = prevPageNum; i < prevPageNum + 4; i++) {
          if (i == curPage) {
            $('.pagePagination').append(' <a class = "item active">' + i + '</a>');
          } else {
            $('.pagePagination').append(' <a class = "item"' +
              ' href = "' + getAllPropertiesWithPage(i) + '">' + i + '</a>');
          }
        }
      }
      if (curPage == allPages) {
        $('.pagePagination').append('<a class = "active item"> ' + allPages + ' </a>');
      } else {
        $('.pagePagination').append('<a class = "item"' +
          'href = "' + getAllPropertiesWithPage(allPages) + '" > ' + allPages + ' </a>');
      }
    }
  }

  function fillList() {
    let backString = '';
    if (GetQueryStringValueByKey('q') != null) backString = GetQueryStringValueByKey('q').split(",");
    else {
      $('.messageholder').append(
        '<div class="ui warning message">' +
        '<div class="header">' +
        'Ви нічого не надали для пошуку' +
        '</div>' +
        'почніть вводити запит, що би ви хотіли знайти. Це може бути артикул, код, назва товару або навіть часткову інформацію' +
        '</div>')
      $('#pagePagination').hide();
    }
    let cleanString = '';
    for (var i = 0; i < backString.length; i++) {
      if (cleanString.length > 1) {
        cleanString += " ";
      }
      cleanString += backString[i];
    }
    $('#inputSearch').val(cleanString);
    $.ajax({
      url: '/api/v1/searching/' + window.location.search,
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
        //update var for pagination
        //totalItems = data.data[0].count;
        if (data.data.length < 1) {
          //console.log('data is empty');
          $('.messageholder').append(
            '<div class="ui warning message">' +
            '<div class="header">' +
            'Не знайдено товарів по вашому запиту!' +
            '</div>' +
            'змініть умови запиту та спробуйте ще раз' +
            '</div>')
        } else {
          paginationConstrustor(data.data[0].count);
          console.log('Всього обрано: ' + data.data[0].count);
          if (data.data.length > 0) {
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
                  '<div class="itemPriceHolder"><a class="ui orange right ribbon label">'+data.data[index].priceoutuah+' грн.</a></div>'+
                  '</div>' +
                  '<div class="content">' +
                  '<a class="right floated" href="/edititem/' + data.data[index].id + '"><i class="pencil alternate icon big"></i></a>' +
                  '<div class="header">' + data.data[index].ourarticul + '</div>' +
                  '<div class="meta">' + '<a class="group">' + data.data[index].cnarticul + '</a></div>' +
                  '<div class="description">' + data.data[index].ourname + '</div></div>' +
                  '<div class="extra content">' +
                  '<div class="item' + index + '">' +
                  '<div class="stockrow"></div></div></div>'
                );
              } else {
                $('#itemsCardHolder').append(
                  '<div class="ui card">' +
                  '<div class="itemrowimage image"><img class="ui medium image" draggable="false" src="/api/v1/images/thumb/empty.jpg">' +
                  '<div class="itemPriceHolder"><a class="ui orange right ribbon label">'+data.data[index].priceoutuah+' грн.</a></div>'+
                  '</div>' +
                  '<div class="content">' +
                  '<a class="right floated" href="/edititem/' + data.data[index].id + '"><i class="pencil alternate icon big"></i></a>' +
                  '<div class="header">' + data.data[index].ourarticul + '</div>' +
                  '<div class="meta">' + '<a class="group">' + data.data[index].cnarticul + '</a></div>' +
                  '<div class="description">' + data.data[index].ourname + '</div></div>' +
                  '<div class="extra content">' +
                  '<div class="item' + index + '">' +
                  '<div class="stockrow"></div></div></div>'
                );
              }
              let variationItem = 'item' + index;
              //console.log(variationItem);
              getQuantityOfItem(data.data[index].ourarticul, variationItem);
            });
          } else {
            $('#pagePagination').hide();
          }
          if (parseInt(GetQueryStringValueByKey('limit')) >= parseInt(data.data[0].count)) {
            $('#pagePagination').hide();
          }
        }
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        //console.log('error');
      }
    })
  }


  function replaceIdToName(curId) {
    for (var i = 0; i < allPartners.length; i++) {
      if (allPartners[i].id == curId) {
        return allPartners[i].name;
      }
    }
  }

  function getQuantityOfItem(itemArticul, placeHolder) {
    $.ajax({
      url: '/api/v1/stockbalance/item/' + itemArticul,
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
        if (data.data.length > 0) {
          for (var i = 0; i < data.data.length; i++) {
            $('.' + placeHolder).append('<div class="columnstock">' + replaceIdToName(data.data[i].partner) + ' : ' + data.data[i].quantity + '</div>');
          }
        } else {
          $('.' + placeHolder).append('немає на залишку');
        }
      },
      error: {

      }
    });
  }

  function getAllPartners() {
    $.ajax({
      url: '/api/v1/partners',
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
        for (var i = 0; i < data.data.length; i++) {
          allPartners.push({
            id: data.data[i].id,
            name: data.data[i].warehousename
          });
        }
        fillList();
      },
      error: {

      }
    });
  }

  getAllPartners();


  //get first image from array
  // function getFirstImage(imgArray) {
  //   let curImage = null;
  //   if (imgArray != null && typeof(imgArray[0]) != "undefined") {
  //     curImage = imgArray[0];
  //   } else {
  //     curImage = 'empty.jpg';
  //   }
  //   return curImage;
  // }

  $('.itemrow.ui.small.image img')
    .visibility({
      type: 'image',
      transition: 'horizontal flip',
      duration: 2000
    });
});