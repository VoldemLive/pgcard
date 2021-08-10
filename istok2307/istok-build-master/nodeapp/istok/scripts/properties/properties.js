var usedNodes = [];
$(document).ready(function() {
  $('.ui.accordion').accordion();
  getAllCategories();

  function getAllCategories() {
    $.ajax({
      url: '/api/v1/properties',
      type: "GET",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      beforeSend: function(xhr) {
        xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
      },
      success: function(data, textStatus, jqXHR) {
        console.log('completed');
        parserTreeView(data.data);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        //console.log('error');
      }
    })
  };

  function nodeIsUsed(curId) {
    let founded = null;
    founded = usedNodes.find(element => element === curId);
    if (founded) {
      return founded;
    } else {
      usedNodes.push(curId);
      return -1;
    }
  };

  function getAllChildsElements(somedata, parentId) {
    var childs = [];
    for (var element in somedata) {
      if (somedata[element].parentid == parentId) {
        if (nodeIsUsed(somedata[element].id) == -1) {
          childs.push({
            name: somedata[element].name,
            id: somedata[element].id,
            parentid: somedata[element].parentid,
          });
        }
      }
    }
    return childs;
  };

  function parseData(somedata) {
    var parentElements = [];
    usedNodes = [];

    for (let element in somedata) {
      if (nodeIsUsed(somedata[element].id) == -1) {
        let someChilds = getAllChildsElements(somedata, somedata[element].id);
        if (someChilds.length > 0) {
          let childNode = [];
          for (let i = 0; i < someChilds.length; i++) {
            childNode.push({
              name: someChilds[i].name,
              id: someChilds[i].id,
              parentid: someChilds[i].parentid,
            })
          }
          if (childNode.length > 0) {
            parentElements.push({
              name: somedata[element].name,
              id: somedata[element].id,
              parentid: somedata[element].parentid,
              children: childNode,
            });
          }
        } else {
          parentElements.push({
            name: somedata[element].name,
            id: somedata[element].id,
            parentid: somedata[element].parentid,
          });
        }
      }
      //if (somedata[element].parentid == null) {

      //}
    }
    return parentElements;
  };

  function parserTreeView(data) {
    var treeData = [];
    var allElements = parseData(data);
    var htmlText = "";
    for (var itemNum in allElements) {
      var curItem = allElements[itemNum];
      htmlText += '<div class="title">' +
        '<button class="ui icon button editcategory" data-node-name="' + curItem.name + '" data-node-id="' + curItem.id + '" data-node-parent-id="' + curItem.parentid + '">' +
        '<i class="icon edit" data-node-name="' + curItem.name + '" data-node-id="' + curItem.id + '" data-node-parent-id="' + curItem.parentid + '"></i>' +
        '</button>' +
        '<button class="ui icon button addchild" data-node-name="' + curItem.name + '" data-node-id="' + curItem.id + '" data-node-parent-id="' + curItem.parentid + '">' +
        '<i class="icon plus" data-node-name="' + curItem.name + '" data-node-id="' + curItem.id + '" data-node-parent-id="' + curItem.parentid + '"></i>' +
        '</button>'

        +
        '<i class="dropdown icon"></i>' +
        curItem.name +


        '</div><div class="content"><div class="ui list">';
      for (var childNum in curItem.children) {
        var curChild = curItem.children[childNum];
        htmlText += '<div class="item">' +
          '<button class="ui icon button editcategory" data-node-name="' + curChild.name + '" data-node-id="' + curChild.id + '" data-node-parent-id="' + curChild.parentid + '">' +
          '<i class="icon edit" data-node-name="' + curChild.name + '" data-node-id="' + curChild.id + '" data-node-parent-id="' + curChild.parentid + '"></i>' +
          '</button>' + curChild.name + '</div>';
      }
      htmlText += '</div></div>';
    }
    $('#propertiesHolder').append(htmlText);
  };

  $('body').on('click', 'button.editcategory', function(e) {
    dialogCategory(
      e.target.attributes["data-node-id"].nodeValue,
      e.target.attributes["data-node-name"].nodeValue,
      e.target.attributes["data-node-parent-id"].nodeValue,
      true,
    );
  });


  $('body').on('click', 'button.addchild', function(e) {
    dialogCategory(
      e.target.attributes["data-node-id"].nodeValue,
      e.target.attributes["data-node-name"].nodeValue,
      null,
      false);
  });

  function dialogCategory(id = null, name = null, parentId = null, update = false) {
    //window.location.href = '/brands/add';
    $('#editing').remove();
    $('.ui.dimmer.modals.page.transition').remove();
    $('#modalHolder').append(
      '<div class="ui tiny modal">' +
      '<div class="header">Нова властивість: </div>' +
      '<div class="scrolling content">' +
      '<p>Назва:</p>' +
      '<div class="ui input">' +
      '<input type="text" id="labelCategory" placeholder="Назва властивості">' +
      '</div>' +
      '<p>Код батьківської властивості:</p>' +
      '<div class="ui input">' +
      '<input type="text" id="labelParent" placeholder="Код">' +
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
        if (update) {
          updateCategory($('#labelCategory').val(), $('#labelParent').val(), id, name);
        } else {
          createCategory($('#labelCategory').val(), $('#labelParent').val());
        }
      }
    }).modal('show');
  };

  $('#createCategory').click(function() {
    dialogCategory();
  });

  function updateCategory(name, parentId, curId) {
    if (parentId == 'null') parentId = 'NULL';
    var data = {
      "categoryName": name,
      "parentId": parentId
    };
    $.ajax({
      url: '/api/v1/properties/update/' + curId,
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

  function createCategory(name, parentId, id) {
    var data = {
      "categoryName": name,
      "parentId": parentId
    };
    $.ajax({
      url: '/api/v1/properties/add',
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