var usedNodes = [];
$(document).ready(function() {
  $('.ui.accordion').accordion();
  getAllCategories();

  function getAllCategories() {
    $.ajax({
      url: '/api/v1/categories',
      type: "GET",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      beforeSend: function(xhr) {
        xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
      },
      success: function(data, textStatus, jqXHR) {
        //console.log('completed');
        parserTreeView(data.data);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        //console.log('error');
      }
    })
  };

  function nodeIsUsed(curId) {
    let founded = null;

    for (let i = 0; i < usedNodes.length; i++) {
      if (usedNodes[i] == parseInt(curId)) {
        founded = true;
        break;
      }
    }
    if (founded) {
      return founded;
    } else {
      usedNodes.push(parseInt(curId));
      return -1;
    }
  };

  function getAllChildsElements(somedata, parentId) {
    var childs = [];
    for (var element in somedata) {
      if (parseInt(somedata[element].parentid) == parseInt(parentId)) {
        //if (nodeIsUsed(somedata[element].id) == -1) {
        childs.push({
          name: somedata[element].name,
          id: somedata[element].id,
          parentid: somedata[element].parentid,
          logo: somedata[element].logo,
        });
        //}
      }
    }
    return childs;
  };

  function parseData(somedata) {
    var parentElements = [];
    usedNodes = [];


    for (let element in somedata) {
      //fill all parents
      if (somedata[element].parentid == null) {
        parentElements.push({
          name: somedata[element].name,
          id: somedata[element].id,
          parentid: somedata[element].parentid,
          logo: somedata[element].logo,
        });
      }
    };

    for (let element in parentElements) {
      //fill all childs
      let someChilds = getAllChildsElements(somedata, parentElements[element].id);
      parentElements[element].children = someChilds;
    };
    parentElements.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });

    return parentElements;
  };

  function parserTreeView(data) {
    var treeData = [];
    var allElements = parseData(data);
    var htmlText = "";
    for (var itemNum in allElements) {
      var curItem = allElements[itemNum];
      htmlText += '<div class="title">' +
        '<button class="ui icon button editcategory" data-node-logo="' + curItem.logo + '" data-node-name="' + curItem.name + '" data-node-id="' + curItem.id + '" data-node-parent-id="' + curItem.parentid + '">' +
        '<i class="icon edit" data-node-logo="' + curItem.logo + '" data-node-name="' + curItem.name + '" data-node-id="' + curItem.id + '" data-node-parent-id="' + curItem.parentid + '"></i>' +
        '</button>' +
        '<button class="ui icon button addchild" data-node-logo="' + curItem.logo + '" data-node-name="' + curItem.name + '" data-node-id="' + curItem.id + '" data-node-parent-id="' + curItem.parentid + '">' +
        '<i class="icon plus" data-node-logo="' + curItem.logo + '" data-node-name="' + curItem.name + '" data-node-id="' + curItem.id + '" data-node-parent-id="' + curItem.parentid + '"></i>' +
        '</button>'

        +
        '<i class="dropdown icon"></i>' +
        curItem.name +


        '</div><div class="content"><div class="ui list">';
      for (var childNum in curItem.children) {
        var curChild = curItem.children[childNum];
        htmlText += '<div class="item">' +
          '<button class="ui icon button editcategory" data-node-logo="' + curChild.logo + '" data-node-name="' + curChild.name + '" data-node-id="' + curChild.id + '" data-node-parent-id="' + curChild.parentid + '">' +
          '<i class="icon edit" data-node-logo="' + curChild.logo + '" data-node-name="' + curChild.name + '" data-node-id="' + curChild.id + '" data-node-parent-id="' + curChild.parentid + '"></i>' +
          '</button>' + curChild.name + '</div>';
      }
      htmlText += '</div></div>';
    }
    $('#categoriesHolder').empty();
    $('#categoriesHolder').append(htmlText);
    // $('#tree').tree({
    //   data: allElements,
    //   autoOpen: false,
    //   closedIcon: '+',
    //   openedIcon: '-',
    //   onCreateLi: function(node, $li) {
    //     // Append a link to the jqtree-element div.
    //     // The link has an url '#node-[id]' and a data property 'node-id'.
    //
    //     $li.find('.jqtree-element').append(
    //       '<button class="ui icon button editcategory" data-node-name="' + node.name + '" data-node-id="' + node.id + '" data-node-parent-id="' + node.parentid + '">' +
    //       '<i class="icon edit" data-node-name="' + node.name + '" data-node-id="' + node.id + '" data-node-parent-id="' + node.parentid + '"></i>' +
    //       '</button>' +
    //       '<button class="ui icon button addchild" data-node-name="' + node.name + '" data-node-id="' + node.id + '" data-node-parent-id="' + node.parentid + '">' +
    //       '<i class="icon plus" data-node-name="' + node.name + '" data-node-id="' + node.id + '" data-node-parent-id="' + node.parentid + '"></i>' +
    //       '</button>'
    //     );
    //   }
    // });
    // $('#tree').tree('loadData', allElements);
  };

  $('body').on('click', 'button.editcategory', function(e) {
    dialogCategory(
      e.target.attributes["data-node-id"].nodeValue,
      e.target.attributes["data-node-name"].nodeValue,
      e.target.attributes["data-node-parent-id"].nodeValue,
      e.target.attributes["data-node-logo"].nodeValue,
      true,
    );
  });


  $('body').on('click', 'button.addchild', function(e) {
    dialogCategory(
      e.target.attributes["data-node-id"].nodeValue,
      e.target.attributes["data-node-name"].nodeValue,
      null,
      e.target.attributes["data-node-logo"].nodeValue,
      false);
  });

  function dialogCategory(id = null, name = null, parentId = null, logo = false, update = false) {
    //window.location.href = '/brands/add';
    $('#editing').remove();
    $('.ui.dimmer.modals.page.transition').remove();
    $('#modalHolder').append(
      '<div class="ui tiny modal">' +
      '<div class="header">Нова категорія: </div>' +
      '<div class="scrolling content">' +
      '<p>Назва:</p>' +
      '<div class="ui input">' +
      '<input type="text" id="labelCategory" placeholder="Назва категорії">' +
      '</div>' +
      '<p>Код батьківської категорії:</p>' +
      '<div class="ui input">' +
      '<input type="text" id="labelParent" placeholder="Код">' +
      '</div>' +
      '<p>Іконка категорії:</p>' +
      '<input id="imageUpload" type="file" accept="image/*" hidden onchange="fileValidation(this)"/>' +
      '<div class="imageContainerholder">' +
      '<div id="imageContainer" class="ui small">' +
      '<div id="imageContainer" class="ui label big unselectable imageHolderLabel">Перетягніть файли іконки категорії або двічи клікніть на цьому полі. Тільки один файл.' +
      '</div>' + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="actions">' +
      '<div class="ui black deny button">' +
      'Закрити' +
      '</div>' +
      '<div id="confirmButton" class="ui positive right labeled icon button">' +
      'Створити' +
      '<i class="checkmark icon"></i>' +
      '</div>' +
      '</div>' +
      '</div>'
    );
    $('.ui.tiny.modal').modal({
      onHide: function() {
        console.log('hidden');
      },
      onShow: function() {
        console.log('shown');
        if (update == false) {
          $('#labelParent').val(id);
          //$('#labelParent').prop("disabled", true);
        } else {
          if (logo.toString() != 'null') {
            getPreImage(logo);
          }
          $('#labelParent').val(parentId);
          $('#labelCategory').val(name);
          if ($('#labelParent').val() == 'null') {
            $('#labelParent').val('');
          }
          //$('#labelParent').prop("disabled", true);
        }
      },
      onApprove: function() {
        var data = {
          "categoryName": $('#labelCategory').val(),
          "parentId": $('#labelParent').val(),
        };
        let imgArray = $('#imageContainer').find('img');
        let completeFilename = '';
        if (imgArray.length > 0) {
          let fileNameIndex = imgArray[0].src.lastIndexOf("/") + 1;
          let filename = imgArray[0].src.substr(fileNameIndex);
          let fileNameWOExt = filename.split('.').slice(0, -1).join('.');
          completeFilename = fileNameWOExt + ".jpg";
          // if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
          //   completeFilename = fileNameWOExt + ".jpg";
          // } else {
          //   completeFilename = fileNameWOExt + "_temp.jpg";
          // }
        } else {
          completeFilename = 'null';
        }

        if (update) {
          updateCategory($('#labelCategory').val(), $('#labelParent').val(), id, completeFilename);
        } else {
          createCategory($('#labelCategory').val(), $('#labelParent').val(), completeFilename);
        }
      }
    }).modal('show');
  };

  $('#createCategory').click(function() {
    dialogCategory();
  });

  function updateCategory(name, parentId, curId, imgPath) {
    if (parentId == 'null') parentId = 'NULL';
    var data = {
      "categoryName": name,
      "parentId": parentId,
      "imagePath": imgPath,
    };
    $.ajax({
      url: '/api/v1/categories/update/' + curId,
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      beforeSend: function(xhr) {
        xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
      },
      success: function(data, textStatus, jqXHR) {
        getAllCategories();
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {}
    })
  }

  function createCategory(name, parentId, id, imgPath) {
    if (imgPath == '' || typeof(imgPath) == 'undefined') imagePath = 'NULL';
    else imagePath = imgPath;
    var data = {
      "categoryName": name,
      "parentId": parentId,
      "imagePath": imagePath,
    };
    $.ajax({
      url: '/api/v1/categories/add',
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      beforeSend: function(xhr) {
        xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
      },
      success: function(data, textStatus, jqXHR) {
        getAllCategories();
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {}
    })
  }
})