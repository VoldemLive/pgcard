var usedNodes = [];
var allChekboxes = [];

// function addCheckBoxInArray(curCheckBox) {
//   var founded = false;
//   for (var i = 0; i < allChekboxes.length; i++) {
//     if (allChekboxes[i].checkbox == curCheckBox[0]) {
//       founded = true;
//       break;
//     }
//   }
//   if (!founded) {
//     allChekboxes.push({
//       checkbox: curCheckBox[0],
//       id: curCheckBox[0].dataset.nodeId,
//       name: curCheckBox[0].dataset.nodeName,
//       parent: curCheckBox[0].dataset.nodeParentId,
//       checked: false,
//     });
//   }
// }

function checkPropertie(itemForCheck) {
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

function uncheckPropertie(itemForCheck) {
  console.log(itemForCheck);
  let curCheckBox = itemForCheck;
}

function openChoosePropertiesDialog(categoryList) {
  $('#editing').remove();
  $('.ui.dimmer.modals.page.transition').remove();
  $('#modalHolder').append(
    '<div class="ui tiny modal">' +
    '<div class="header">Вибір властивості: </div>' +
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
  $('.ui.tiny.modal').modal({
    onHide: function() {
      console.log('hidden');
    },
    onShow: function() {

    },
    onApprove: function() {
      propertiesParsing(allChekboxes);
    }
  }).modal('show');
  getAllProperties(categoryList);
}
//
// $(document).on('click', '.ui.toggle.checkbox', function(e) {
//   $('.ui.toggle.checkbox')
//     .checkbox({
//       //fireOnInit: true,
//       // check all children
//       onChecked: function() {
//         checkPropertie($(this).parent());
//       },
//       onUnchecked: function(e) {
//         checkPropertie($(this).parent());
//       },
//     })
// });

function checkSelectedPropertieFlags(categoryList) {
  //console.log(categoryList);
  for (var i = 0; i < allChekboxes.length; i++) {
    if (categoryList.includes(parseInt(allChekboxes[i].id))) {
      checkCategory(allChekboxes[i].checkbox);
    }
  }
}

function getAllProperties(categoryList) {
  $.ajax({
    url: '/api/v1/properties',
    type: "GET",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    beforeSend: function(xhr) {
      xhr.setRequestHeader('x-access-token', localStorage.getItem('access-token'));
    },
    success: function(data, textStatus, jqXHR) {
      //console.log('completed');
      parserTreeView(data.data);
      checkSelectedPropertieFlags(categoryList);
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

function parsePropertiesData(somedata) {
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
// $('#tree1').on(
//   'tree.dblclick',
//   function(event) {
//     // event.node is the clicked node
//     console.log(event.node);
//   }
// );
//
// function parserTreeView(data) {
//   var treeData = [];
//   var allElements = parseData(data);
//   var htmlText = "";
//   for (var itemNum in allElements) {
//     var curItem = allElements[itemNum];
//     htmlText += '<div class="title">' +
//       '<button class="ui icon button editcategory" data-node-name="' + curItem.name + '" data-node-id="' + curItem.id + '" data-node-parent-id="' + curItem.parentid + '">' +
//       '<i class="icon edit" data-node-name="' + curItem.name + '" data-node-id="' + curItem.id + '" data-node-parent-id="' + curItem.parentid + '"></i>' +
//       '</button>' +
//       '<button class="ui icon button addchild" data-node-name="' + curItem.name + '" data-node-id="' + curItem.id + '" data-node-parent-id="' + curItem.parentid + '">' +
//       '<i class="icon plus" data-node-name="' + curItem.name + '" data-node-id="' + curItem.id + '" data-node-parent-id="' + curItem.parentid + '"></i>' +
//       '</button>'
//
//       +
//       '<i class="dropdown icon"></i>' +
//       curItem.name +
//
//
//       '</div><div class="content"><div class="ui list">';
//     for (var childNum in curItem.children) {
//       var curChild = curItem.children[childNum];
//       htmlText += '<div class="item">' +
//         '<button class="ui icon button editcategory" data-node-name="' + curChild.name + '" data-node-id="' + curChild.id + '" data-node-parent-id="' + curChild.parentid + '">' +
//         '<i class="icon edit" data-node-name="' + curChild.name + '" data-node-id="' + curChild.id + '" data-node-parent-id="' + curChild.parentid + '"></i>' +
//         '</button>' + curChild.name + '</div>';
//     }
//     htmlText += '</div></div>';
//   }
//   $('#categoriesHolder').append(htmlText);
//   // $('#tree').tree({
//   //   data: allElements,
//   //   autoOpen: false,
//   //   // closedIcon: '+',
//   //   // openedIcon: '-',
//   //   onCreateLi: function(node, $li) {
//   //     if (node.parentid != null) {
//   //       $li.find('.jqtree-title').before(
//   //         '<div class="ui toggle checkbox" tag="selectorCheck" data-node-name="' + node.name + '" data-node-id="' + node.id + '" data-node-parent-id="' + node.parentid + '">' +
//   //         '<input type="checkbox" name="public">' +
//   //         '<label> </label>' +
//   //         '</div>'
//   //       );
//   //     }
//   //   }
//   // });
//   allChekboxes = [];
//   //$('#tree').tree('loadData', allElements);
//   $('.ui.toggle.checkbox').checkbox({
//     fireOnInit: true,
//     onChecked: function() {
//       checkPropertie($(this).parent());
//     },
//     onUnchecked: function() {
//       addCheckBoxInArray($(this).parent());
//     },
//     onDeterminate: function() {}
//   });
// };



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