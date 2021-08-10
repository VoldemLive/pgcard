var usedNodes = [];
var allChekboxes = [];

// EventTarget.prototype['addEventListenerBase'] = EventTarget.prototype.addEventListener;
// EventTarget.prototype.addEventListener = function(type, listener) {
//   if (this !== document.querySelector('body') || type !== 'touchmove') {
//     this.addEventListenerBase(type, listener);
//   }
// };

function addCheckBoxInArray(curCheckBox) {
  var founded = false;
  for (var i = 0; i < allChekboxes.length; i++) {
    if (allChekboxes[i].checkbox == curCheckBox[0]) {
      founded = true;
      break;
    }
  }
  if (!founded) {
    allChekboxes.push({
      checkbox: curCheckBox[0],
      id: curCheckBox[0].dataset.nodeId,
      name: curCheckBox[0].dataset.nodeName,
      parent: curCheckBox[0].dataset.nodeParentId,
      checked: false,
    });
  }
}

function checkCategory(itemForCheck) {
  for (var i = 0; i < allChekboxes.length; i++) {
    if (allChekboxes[i].checkbox == itemForCheck[0] || allChekboxes[i].checkbox == itemForCheck) {
      allChekboxes[i].checked = !allChekboxes[i].checked;
      if (allChekboxes[i].checked) {
        $(allChekboxes[i].checkbox).checkbox('set checked');
      } else {
        $(allChekboxes[i].checkbox).checkbox('set unchecked');
      }
      break;
    }
  }
}

function uncheckCategory(itemForCheck) {
  console.log(itemForCheck);
  let curCheckBox = itemForCheck;
}

function openChooseCategoriesDialog(categoryList) {
  $('#editing').remove();
  $('.ui.dimmer.modals.page.transition').remove();
  $('#modalHolder').append(
    '<div class="ui longer modal">' +
    '<div class="header">Вибір категорії: </div>' +
    '<div class="scrolling content">' +
    '<div id="categoriesHolder" class="ui styled fluid accordion"/>' +
    '</div>' +
    '<div class="actions">' +
    '<div class="ui black deny button">' +
    'Закрити' +
    '</div>' +
    '<div id="confirmButton" class="ui positive right labeled icon button">' +
    'Обрати' +
    '<i class="checkmark icon"></i>' +
    '</div>' +
    '</div>'
  );
  $('.ui.accordion').accordion();
  $('.ui.longer.modal').modal({
    onHide: function() {
      console.log('hidden');
    },
    onShow: function() {

    },
    onApprove: function() {
      categoriesParsing(allChekboxes);
    }
  }).modal('show');
  getAllCategories(categoryList);
}

$(document).on('click', '.ui.slider.checkbox', function(e) {
  $('.ui.slider.checkbox')
    .checkbox({
      //fireOnInit: true,
      // check all children
      onChecked: function() {
        checkCategory($(this).parent());
      },
      onUnchecked: function(e) {
        checkCategory($(this).parent());
      },
    })
});

function checkSelectedFlags(categoryList) {
  //console.log(categoryList);
  for (var i = 0; i < allChekboxes.length; i++) {
    if (categoryList.includes(parseInt(allChekboxes[i].id))) {
      checkCategory(allChekboxes[i].checkbox);
    }
  }
}

function getAllCategories(categoryList) {
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
      checkSelectedFlags(categoryList);
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
      childs.push({
        name: somedata[element].name,
        id: somedata[element].id,
        parentid: somedata[element].parentid,
        logo: somedata[element].logo,
      });
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
      '<i class="dropdown icon"></i>' +
      curItem.name +


      '</div><div class="content"><div class="ui form"><div class="grouped fields">';
    for (var childNum in curItem.children) {
      var curChild = curItem.children[childNum];
      htmlText += '<div class="field"><div class="ui slider checkbox" data-node-name="' + curChild.name + '" data-node-id="' + curChild.id + '" data-node-parent-id="' + curChild.parentid + '"><input type="checkbox"><label>' + curChild.name + '</label></input></div></div>';
    }
    htmlText += '</div></div></div>';
  }
  $('#categoriesHolder').append(htmlText);
  // $('#tree').tree({
  //   data: allElements,
  //   autoOpen: false,
  //   // closedIcon: '+',
  //   // openedIcon: '-',
  //   onCreateLi: function(node, $li) {
  //     if (node.parentid != null) {
  //       $li.find('.jqtree-title').before(
  //         '<div class="ui toggle checkbox" tag="selectorCheck" data-node-name="' + node.name + '" data-node-id="' + node.id + '" data-node-parent-id="' + node.parentid + '">' +
  //         '<input type="checkbox" name="public">' +
  //         '<label> </label>' +
  //         '</div>'
  //       );
  //     }
  //   }
  // });
  allChekboxes = [];
  //$('#tree').tree('loadData', allElements);
  $('.ui.slider.checkbox').checkbox({
    fireOnInit: true,
    onChecked: function() {
      checkCategory($(this).parent());
    },
    onUnchecked: function() {
      addCheckBoxInArray($(this).parent());
    },
    onDeterminate: function() {}
  });
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

function createCategory(name, parentId, id) {
  var data = {
    "categoryName": name,
    "parentId": parentId
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