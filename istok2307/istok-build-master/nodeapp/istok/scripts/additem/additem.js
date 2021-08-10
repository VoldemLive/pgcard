let completed = false;
let completedBrands = false;

let storedData = {
  colorsData: null,
  brandsData: null,
  packingData: null,
  categoriesData: null,
  propertiesData: null,
};

function AutoKeyboardChanger(str) {
  startStr = str;
  replacer = {
    "~": "ґ",
    "q": "й",
    "w": "ц",
    "e": "у",
    "r": "к",
    "t": "е",
    "y": "н",
    "u": "г",
    "i": "ш",
    "o": "щ",
    "p": "з",
    "[": "х",
    "]": "ї",
    "a": "ф",
    "s": "і",
    "d": "в",
    "f": "а",
    "g": "п",
    "h": "р",
    "j": "о",
    "k": "л",
    "l": "д",
    ";": "ж",
    "'": "є",
    "z": "я",
    "x": "ч",
    "c": "с",
    "v": "м",
    "b": "и",
    "n": "т",
    "m": "ь",
    ",": "б",
    ".": "ю",
    "/": ".",
    //укр в лат
    "ґ": "~",
    "й": "q",
    "ц": "w",
    "у": "e",
    "к": "r",
    "е": "t",
    "н": "y",
    "г": "u",
    "ш": "i",
    "щ": "o",
    "з": "p",
    "х": "[",
    "ї": "]",
    "ъ": "]",
    "ф": "a",
    "і": "s",
    "в": "d",
    "а": "f",
    "п": "g",
    "р": "h",
    "о": "j",
    "л": "k",
    "д": "l",
    "ж": ";",
    "є": "'",
    "ы": "s",
    "я": "z",
    "ч": "x",
    "с": "c",
    "м": "v",
    "и": "b",
    "т": "n",
    "ь": "m",
    "б": ",",
    "ю": ".",
    ".": "/",

  };

  for (i = 0; i < str.length; i++) {
    if (replacer[str[i].toLowerCase()] != undefined) {

      if (str[i] == str[i].toLowerCase()) {
        replace = replacer[str[i].toLowerCase()];
      } else if (str[i] == str[i].toUpperCase()) {
        replace = replacer[str[i].toLowerCase()].toUpperCase();
      }

      str = str.replace(str[i], replace);
    }
  }
  if (startStr == str) {
    str = '';
  }
  return str;
}


$.ajaxSetup({
  headers: {
    'x-access-token': localStorage.getItem('access-token')
  }
});

// storedData.watch('colorsData', function(id, oldval, newval) {
//   fillColorsItem(newval);
// });

storedData.watch('brandsData', function(id, oldval, newval) {
  fillBrandItem(newval);
});

// storedData.watch('packingData', function(id, oldval, newval) {
//   fillPackingItem(newval);
// });

storedData.watch('categoriesData', function(id, oldval, newval) {
  fillCategoriesItem(newval);
});

storedData.watch('propertiesData', function(id, oldval, newval) {
  fillPropertiesItem(newval);
});

// function fillColorsItem(settings) {
//   $('#colors').dropdown('set selected', settings);
// }

function fillBrandItem(settings) {
  $('#brands').dropdown('set selected', settings);
}

// function fillPackingItem(settings) {
//   $('#packing').dropdown('set selected', settings);
// }

function fillCategoriesItem(settings) {
  $('#categoriesDropDown').dropdown('set selected', settings);
}

function fillPropertiesItem(settings) {
  $('#propertiesDropDown').dropdown('set selected', settings);
}


function categoriesParsing(catArray) {
  let resultIDs = [];
  for (var i = 0; i < catArray.length; i++) {
    if (catArray[i].checked == true) {
      resultIDs.push(catArray[i].id);
    }
  }
  $('#categoriesDropDown').dropdown('clear');
  fillCategoriesItem(resultIDs);
};

function propertiesParsing(catArray) {
  let resultIDs = [];
  for (var i = 0; i < catArray.length; i++) {
    if (catArray[i].checked == true) {
      resultIDs.push(catArray[i].id);
    }
  }
  $('#propertiesDropDown').dropdown('clear');
  fillPropertiesItem(resultIDs);
};

$(document).ready(function() {
  $("#selectCategory").click(function(e) {
    let allCategories = JSON.parse("[" + $('#categoriesDropDown').dropdown(
      'get value') + "]");
    openChooseCategoriesDialog(allCategories);
    e.preventDefault();
  });

  $("#selectProperties").click(function(e) {
    let allCategories = JSON.parse("[" + $('#propertiesDropDown').dropdown(
      'get value') + "]");
    openChoosePropertiesDialog(allCategories);
    e.preventDefault();
  });

  $('#dropToHidden').on('click', function(e) {
    $('#hiddentags')[0].value = AutoKeyboardChanger($('#opentags')[0].value);
    e.preventDefault();
  });

  $('#convertToCbm').on('click', function(e) {
    let curCBM = (parseFloat($('#itemlength').val()) * parseFloat($('#itemwidth').val()) * parseFloat($('#itemheight').val())) / 1000000;
    $('#itemcbm').val(curCBM);
    e.preventDefault();
  });

  // $.ajax({
  //   url: "/api/v1/colors",
  //   beforeSend: function(xhr) {
  //     xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
  //   },
  // }).done(function(response) {
  //   dropDownValues = [];
  //   $.each(response.data, function(index, item) {
  //     dropDownValues.push({
  //       name: response.data[index].colorhex,
  //       text: response.data[index].colorname,
  //       value: response.data[index].id,
  //     });
  //   });
  //   $('#colors').dropdown({
  //     values: dropDownValues
  //   });
  //   $('#colors').children('.menu').children('.item').each(function(a, b) {
  //     let someColor = $(this).text();
  //     ////console.log(someColor);
  //     $(this).text($(this).attr("data-text"));
  //     $(this).prepend(
  //       "<i class='circle icon' style='color: " +
  //       someColor +
  //       ";'></i>");
  //     $(this).removeAttr("data-text");
  //   });
  //   $("#colors").children('.default.text').text('Вкажіть колір');
  // });

  $.ajax({
    url: "/api/v1/brands",
    beforeSend: function(xhr) {
      xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
    },
  }).done(function(response) {
    dropDownValues = [];
    dropDownValues.push({
      name: '',
      text: 'Бренд не вказаний',
      value: null,
    });
    $.each(response.data, function(index, item) {
      dropDownValues.push({
        name: response.data[index].logo,
        text: response.data[index].brandname,
        value: response.data[index].id,
      });
    });
    $('#brands').dropdown({
      values: dropDownValues
    });
    $("#brands").children('.menu').children('.item').each(function(
      a,
      b) {
      let curElem = $(this);
      let fileName = $(this).text();
      curElem.text($(this).attr("data-text"));
      curElem.prepend(
        "<img class='ui avatar image' draggable='false' src='/api/v1/images/thumb/" +
        fileName +
        "'></img>");
      curElem.removeAttr("data-text");
    });
    $("#brands").children('.default.text').text('Вкажіть виробника');
  });

  // $.ajax({
  //   url: "/api/v1/packings",
  //   beforeSend: function(xhr) {
  //     xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
  //   },
  // }).done(function(response) {
  //   dropDownValues = [];
  //   $.each(response.data, function(index, item) {
  //     dropDownValues.push({
  //       text: response.data[index].name,
  //       value: response.data[index].id,
  //     });
  //   });
  //   $('#packing').dropdown({
  //     values: dropDownValues
  //   });
  //   $("#packing").children('.menu').children('.item').each(function(
  //     a,
  //     b) {
  //     let curElem = $(this);
  //     let fileName = $(this).text();
  //     curElem.text($(this).attr("data-text"));
  //     curElem.removeAttr("data-text");
  //   });
  //   $("#packing").children('.default.text').text('Вкажіть пакування');
  // });
  $.ajax({
    url: "/api/v1/categories",
    beforeSend: function(xhr) {
      xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
    },
  }).done(function(response) {
    dropDownValues = [];
    $.each(response.data, function(index, item) {
      if (response.data[index].parentid) {
        dropDownValues.push({
          text: response.data[index].name,
          value: response.data[index].id,
          name: response.data[index].parentid,
        });
      }
    });
    $('#categoriesDropDown').dropdown({
      values: dropDownValues
    });
    $('#categoriesDropDown').children('.menu').children('.item').each(function(a, b) {
      let curElem = $(this);
      curElem.text($(this).attr("data-text"));
      curElem.removeAttr("data-text");
    });
    $("#categoriesDropDown").children('.default.text').text('Вкажіть категорію');
  });

  $.ajax({
    url: "/api/v1/properties",
    beforeSend: function(xhr) {
      xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
    },
  }).done(function(response) {
    dropDownValues = [];
    $.each(response.data, function(index, item) {
      if (response.data[index].parentid) {
        dropDownValues.push({
          text: response.data[index].name,
          value: response.data[index].id,
          name: response.data[index].parentid,
        });
      }
    });
    $('#propertiesDropDown').dropdown({
      values: dropDownValues
    });
    $('#propertiesDropDown').children('.menu').children('.item').each(function(a, b) {
      let curElem = $(this);
      curElem.text($(this).attr("data-text"));
      curElem.removeAttr("data-text");
    });
    $("#propertiesDropDown").children('.default.text').text('Вкажіть властивость');
  });


  if (window.location.pathname.includes("/edititem/") == false) {
    //console.log('creation form');
    //on uploaded
    $('#precode').dropdown();
    $('#precode').dropdown('set selected', 'нем');

    //validation
    var codeIsFree = false;

    function checkCode() {
      var value = $("#codenumber").val();
      if (value.length > 3) {
        let codeInbase = '' + $('#precode').dropdown('get value') + '' +
          $('#codenumber').val();
        var jqxhr = $.get("/api/v1/toys/bycode/" + codeInbase, function() {
          //alert( "success" );
        }).done(function(data) {
          if (data.data == null) codeIsFree = true;
          else codeIsFree = false;
        });
      }
    }
    $("#codenumber").keyup(function(e) {
      checkCode();
    })

    $('#precode').dropdown({
      onChange: function() {
        checkCode();
        $('#codenumber').focus();
      }
    });

    $.fn.form.settings.rules["isCodeFree"] = function() {
      // Your validation condition goes here
      if (codeIsFree == true) return true;
      else return false;
    }

    let barcodeIsFree = false;

    function checkBarCode() {
      if ($("#barcode").val().length == 12) { //spell check number
        let checkNumber = getCheckDigit($("#barcode").val());
        //console.log('check number is ' + checkNumber);
        //$('#bcholder').attr('data-content', 'check number is ' + checkNumber)
        $('#barcode').popup({
          on: 'focus',
          target: '#barcode',
          position: 'top center',
          content: 'контрольний номер: ' + checkNumber
        });
        $('#barcode').popup('toggle');
      } else {
        $('#barcode').popup('hide');
      }

      if ($("#barcode").val().length > 12) {
        var jqxhr = $.get("/api/v1/toys/bybarcode/" + $("#barcode").val(), function() {}).done(function(data) {
          if (data.status == 'false') barcodeIsFree = true;
          else barcodeIsFree = false;
        })
      }
    }
    $("#barcode").keyup(function(e) {
      checkBarCode();
    })
    $.fn.form.settings.rules["isBarcodeFree"] = function() {
      // Your validation condition goes here
      if (barcodeIsFree == true) return true;
      else return false;
    }

    $('.input').keydown(function(e) {
      if (e.which === 13) {
        e.preventDefault();
        $(this).next('.input').focus();
      }
    });

    $('#additemform')
      .form({
        on: 'blur',
        inline: true,
        fields: {
          itemcodeempty: {
            identifier: 'codenumber',
            rules: [{
                type: 'exactLength[4]',
                prompt: 'Виберіть групу товару та вкажіть 4-х значний номер'
              },
              {
                type: 'integer',
                prompt: 'Вкажіть код тільки числом'
              },
              {
                type: 'isCodeFree',
                prompt: 'Код вже зайнятий'
              }
            ]
          },
          articul: {
            identifier: 'articul',
            optional: true,
            rules: [{
              type: 'empty',
              prompt: 'Вкажіть артикул виробника'
            }]
          },
          barcode: {
            identifier: 'barcode',
            optional: true,
            rules: [{
                type: 'exactLength[13]',
                prompt: 'Вкажіть повний шрих код позиції, 13 символів'
              },
              {
                type: 'integer',
                prompt: 'Вкажіть шрих код тільки числом'
              },
              {
                type: 'isBarcodeFree',
                prompt: 'цей штрих код вже використовується'
              },
            ]
          },
          nameempty: {
            identifier: 'itemname',
            rules: [{
              type: 'empty',
              prompt: 'Вкажіть назву позиції'
            }]
          },
          itemlength: {
            identifier: 'itemlength',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть довжину у числовому виді'
            }]
          },
          itemwidth: {
            identifier: 'itemwidth',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ширину у числовому виді'
            }]
          },
          itemheight: {
            identifier: 'itemheight',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть висоту у числовому виді'
            }]
          },
          itemquantityinbox: {
            identifier: 'itemquantityinbox',
            optional: true,
            rules: [{
              type: 'integer',
              prompt: 'Вкажіть кількість в ящику цілим числом'
            }]
          },
          itempricechinausd: {
            identifier: 'itempricechinausd',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ціну числом'
            }]
          },
          itempriceinusd: {
            identifier: 'itempriceinusd',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ціну числом'
            }]
          },
          itempriceoutusd: {
            identifier: 'itempriceoutusd',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ціну числом'
            }]
          },
          itempriceinuah: {
            identifier: 'itempriceinuah',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ціну числом'
            }]
          },
          itempricemiddleuah: {
            identifier: 'itempricemiddleuah',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ціну числом'
            }]
          },
          itempriceoutuah: {
            identifier: 'itempriceoutuah',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ціну числом'
            }]
          },
        },
        onSuccess: function() {
          console.log("Passed");
        },
        onFailure: function() {
          console.log("Failed");
        }
      });

    //submit event
    $("#additemform").submit(function() {
      var valid = $("#additemform").form('is valid');
      if (valid) {
        let codeInbase = '' + $('#precode').dropdown('get value') + '' +
          $('#codenumber').val();
        //console.log('new code of item is ' + codeInbase);
        let allCategories = JSON.parse("[" + $('#categoriesDropDown').dropdown(
          'get value') + "]");
        let allProperties = JSON.parse("[" + $('#propertiesDropDown').dropdown(
          'get value') + "]");
        let allImages = [];
        let imagesPairs = [];
        let imgArray = $('#imageContainer').find('img');
        for (let i = 0; i < imgArray.length; i++) {
          let fileNameIndex = imgArray[i].src.lastIndexOf("/") + 1;
          let filename = imgArray[i].src.substr(fileNameIndex);
          var mainKey = false;
          if($(imgArray[i].parentElement).hasClass('imageselected'))mainKey = true;
          imagesPairs.push({imageName:filename, main:mainKey});
        }
        function compare( a, b ) {
          if ( a.main == true ){
            return -1;
          }
          if ( a.main != true ){
            return 1;
          }
          return 0;
        }

        imagesPairs.sort(compare);

        for(let iter=0; iter < imagesPairs.length; iter++){
          allImages.push(imagesPairs[iter].imageName);
        }

        hiddentagsData = '';

        let newItem = {
          ourarticul: codeInbase,
          cnarticul: $('#articul').val(),
          ourname: $('#itemname').val(),
          description: $('#description').val(),
          brand: parseInt($('#brands').dropdown('get value')),
          images: allImages,
          width: parseFloat($('#itemwidth').val()),
          height: parseFloat($('#itemheight').val()),
          length: parseFloat($('#itemlength').val()),
          barcode: parseInt($('#barcode').val()),
          created: 'now()',
          edited: 'now()',
          author: 'author',
          priceinuah: parseFloat($('#itempriceinuah').val()),
          pricemiddleuah: parseFloat($('#itempricemiddleuah').val()),
          priceoutuah: parseFloat($('#itempriceoutuah').val()),
          pricechinausd: parseFloat($('#itempricechinausd').val()),
          priceinusd: parseFloat($('#itempriceinusd').val()),
          priceoutusd: parseFloat($('#itempriceoutusd').val()),
          quantityinbox: parseInt($('#itemquantityinbox').val()),
          cbm: parseInt($('#itemcbm').val()),
          videoLink: $('#youtubelink').val(),
          category: allCategories,
          properties: allProperties,
          opentags: $('#opentags').val(),
          hiddentags: hiddentagsData,
        };
        $.ajax({
          url: '/api/v1/toys/add',
          type: "POST",
          data: JSON.stringify(newItem),
          contentType: "application/json; charset=utf-8",
          beforeSend: function(xhr) {
            xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
          },
          success: function(data, textStatus, jqXHR) {
            //console.log('form submitted completed');
            window.location.href = '/items';
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) {
            //console.log('error on submition');
          }
        })
        return false;
      } else {
        //console.log('form is not valid');
        return false;
      }
    });
  } else { ///editing form
    $('#precode').addClass("disabled");
    //dropdown control
    // async function getPreImage(imageName) {
    //   const optns = {
    //     method: 'GET',
    //     contentType: "image/jpeg",
    //     dataType: "binary",
    //   }
    //   const response = await fetch('/api/v1/uploads/temp/' + imageName);
    //   if (response.ok) {
    //     const img = await response.img;
    //     ////console.log('image received');
    //     var filename = response.url.replace(/^.*[\\\/]/, '');
    //     $('#imageContainer').append(
    //       "<div class='ui small image bordered rounded' onmousedown='return false'>" +
    //       "<i class='fitted trash alternate link icon' id='removeThisImage' onclick='deletePreImage(this)'></i>" +
    //       "<img class='someItemImage' item-dada=" + filename + " src=" +
    //       response.url + "></img>" +
    //       "</div>");
    //   } else {
    //     ////console.log('hmmm');
    //   }
    // }

    function showItemsImages(imageArray) {
      if (imageArray != null) {
        for (let i = 0; i < imageArray.length; i++) {
          tryToGetImage(imageArray[i]);
        }
      }
    }

    function fillEditForm() {
      $.ajax({
        url: '/api/v1/toys/' + window.location.pathname.split('/')[window.location.pathname.split('/').length - 1],
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function(xhr) {
          xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
        },
        statusCode: {
          201: function() {
            //console.log('completed 0');
            //window.location.href = '/';
          },
          500: function() {
            //console.log('error 0');
          }
        },
        success: function(curresp, textStatus, jqXHR) {
          ////console.log(curresp);
          $('#codenumber').val(curresp.data.ourarticul.substring(3, curresp.data.ourarticul.length));
          $('#precode').dropdown('set selected', curresp.data.ourarticul.substring(0, 3));
          $('#allCodeHolder').addClass("disabled");
          $('#articul').val(curresp.data.cnarticul);
          $('#barcode').val(curresp.data.barcode);
          $('#itemname').val(curresp.data.ourname);
          $('#description').val(curresp.data.description);
          $('#itemquantityinbox').val(curresp.data.quantityinbox);
          $('#itemwidth').val(curresp.data.width);
          $('#itemheight').val(curresp.data.height);
          $('#itemlength').val(curresp.data.length);
          $('#itempriceinuah').val(curresp.data.priceinuah);
          $('#itempricemiddleuah').val(curresp.data.pricemiddleuah);
          $('#itempriceoutuah').val(curresp.data.priceoutuah);
          $('#itempricechinausd').val(curresp.data.pricechinausd);
          $('#itempriceinusd').val(curresp.data.priceinusd);
          $('#itempriceoutusd').val(curresp.data.priceoutusd);
          storedData.colorsData = curresp.data.color;
          storedData.brandsData = curresp.data.brand;
          storedData.packingData = curresp.data.packing;
          storedData.categoriesData = curresp.data.category;
          storedData.propertiesData = curresp.data.properties;
          $('#itemcbm').val(curresp.data.cbm);
          $('#youtubelink').val(curresp.data.videolink);
          $('#category').val(curresp.data.category);
          $('#opentags').val(curresp.data.opentags);
          showItemsImages(curresp.data.images);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          //console.log('error on submition');
        }
      })
    }

    fillEditForm();
    // fill first data


    //validation
    let barcodeIsFree = true;

    function checkBarCodeUpdate() {
      if ($("#barcode").val().length == 12) { //spell check number
        let checkNumber = getCheckDigit($("#barcode").val());
        //console.log('check number is ' + checkNumber);
        //$('#bcholder').attr('data-content', 'check number is ' + checkNumber)
        $('#barcode').popup({
          on: 'focus',
          target: '#barcode',
          position: 'top center',
          content: 'контрольний номер: ' + checkNumber
        });
        $('#barcode').popup('toggle');
      } else {
        $('#barcode').popup('hide');
      }

      if ($("#barcode").val().length > 12) {
        var jqxhr = $.get("/api/v1/toys/bybarcode/" + $("#barcode").val(), function() {}).done(function(data) {
          let codeInbase = '' + $('#precode').dropdown('get value') + '' +
            $('#codenumber').val();
          if (data.status == 'false') barcodeIsFree = true;
          else if (data.data.ourarticul.toLowerCase() == codeInbase.toLowerCase()) barcodeIsFree = true;
          else barcodeIsFree = false;
        })
      }
    }
    $("#barcode").keyup(function(e) {
      checkBarCodeUpdate();
    })
    $.fn.form.settings.rules["isBarcodeUpdateFree"] = function() {
      // Your validation condition goes here
      if (barcodeIsFree == true) return true;
      else return false;
    }
    $('.input').keydown(function(e) {
      if (e.which === 13) {
        $(this).next('.input').focus();
        e.preventDefault();
      }
    });
    $('#updateItemForm')
      .form({
        on: 'blur',
        inline: true,
        fields: {
          articul: {
            identifier: 'articul',
            optional: true,
            rules: [{
              type: 'empty',
              prompt: 'Вкажіть артикул виробника'
            }]
          },
          barcode: {
            identifier: 'barcode',
            optional: true,
            rules: [{
                type: 'exactLength[13]',
                prompt: 'Вкажіть повний шрих код позиції, 13 символів'
              },
              {
                type: 'integer',
                prompt: 'Вкажіть шрих код тільки числом'
              },
              {
                type: 'isBarcodeUpdateFree',
                prompt: 'цей штрих код вже використовується'
              },
            ]
          },
          nameempty: {
            identifier: 'itemname',
            rules: [{
              type: 'empty',
              prompt: 'Вкажіть назву позиції'
            }]
          },
          itemlength: {
            identifier: 'itemlength',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть довжину у числовому виді'
            }]
          },
          itemwidth: {
            identifier: 'itemwidth',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ширину у числовому виді'
            }]
          },
          itemheight: {
            identifier: 'itemheight',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть висоту у числовому виді'
            }]
          },
          itemquantityinbox: {
            identifier: 'itemquantityinbox',
            optional: true,
            rules: [{
              type: 'integer',
              prompt: 'Вкажіть кількість в ящику цілим числом'
            }]
          },
          itempricechinausd: {
            identifier: 'itempricechinausd',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ціну числом'
            }]
          },
          itempriceinusd: {
            identifier: 'itempriceinusd',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ціну числом'
            }]
          },
          itempriceoutusd: {
            identifier: 'itempriceoutusd',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ціну числом'
            }]
          },
          itempriceinuah: {
            identifier: 'itempriceinuah',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ціну числом'
            }]
          },
          itempricemiddleuah: {
            identifier: 'itempricemiddleuah',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ціну числом'
            }]
          },
          itempriceoutuah: {
            identifier: 'itempriceoutuah',
            optional: true,
            rules: [{
              type: 'decimal',
              prompt: 'Вкажіть ціну числом'
            }]
          },
        }
      });
    //submit event
    $("#updateItemForm").submit(function() {
      var valid = $("#updateItemForm").form('is valid');
      if (valid) {
        let allCategories = JSON.parse("[" + $('#categoriesDropDown').dropdown(
          'get value') + "]");
        let allproperties = JSON.parse("[" + $('#propertiesDropDown').dropdown(
          'get value') + "]");
        let allImages = [];
        let imgArray = $('#imageContainer').find('img');
        let imagesPairs = [];
        for (let i = 0; i < imgArray.length; i++) {
          let fileNameIndex = imgArray[i].src.lastIndexOf("/") + 1;
          let filename = imgArray[i].src.substr(fileNameIndex);
          let fileNameWOExt = filename.split('.').slice(0, -1).join('.');
          if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
            filename = fileNameWOExt + ".jpg";
          } else {
            filename = fileNameWOExt + "_temp.jpg";
          }
          var mainKey = false;
          if($(imgArray[i].parentElement).hasClass('imageselected'))mainKey = true;
          imagesPairs.push({imageName:filename, main:mainKey});
        }

        function compare( a, b ) {
          if ( a.main == true ){
            return -1;
          }
          if ( a.main != true ){
            return 1;
          }
          return 0;
        }

        imagesPairs.sort(compare);
        
        for(let iter=0; iter < imagesPairs.length; iter++){
          allImages.push(imagesPairs[iter].imageName);
        }

        hiddentagsData = '';

        let newItem = {
          cnarticul: $('#articul').val(),
          ourname: $('#itemname').val(),
          description: $('#description').val(),
          brand: parseInt($('#brands').dropdown('get value')),
          images: allImages,
          width: parseFloat($('#itemwidth').val()),
          height: parseFloat($('#itemheight').val()),
          length: parseFloat($('#itemlength').val()),
          barcode: parseInt($('#barcode').val()),
          //created: 'now()',
          edited: 'now()',
          author: 'author',
          priceinuah: parseFloat($('#itempriceinuah').val()),
          pricemiddleuah: parseFloat($('#itempricemiddleuah').val()),
          priceoutuah: parseFloat($('#itempriceoutuah').val()),
          pricechinausd: parseFloat($('#itempricechinausd').val()),
          priceinusd: parseFloat($('#itempriceinusd').val()),
          priceoutusd: parseFloat($('#itempriceoutusd').val()),
          quantityinbox: parseInt($('#itemquantityinbox').val()),
          cbm: parseFloat($('#itemcbm').val()),
          videoLink: $('#youtubelink').val(),
          category: allCategories,
          properties: allproperties,
          opentags: $('#opentags').val(),
          hiddentags: hiddentagsData,
        };
        $.ajax({
          url: '/api/v1/toys/update/' + window.location.pathname.split('/')[window.location.pathname.split('/').length - 1],
          type: "POST",
          data: JSON.stringify(newItem),
          contentType: "application/json; charset=utf-8",
          //dataType: "json",
          beforeSend: function(xhr) {
            xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
          },
          success: function(data, textStatus, jqXHR) {
            window.location.href = '/items';
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) {
            //console.log('error on submition');
          }
        })
        return false;
      } else {
        //console.log('form is not valid');
        return false;
      }
    });
    //console.log('edit form');
  }

});