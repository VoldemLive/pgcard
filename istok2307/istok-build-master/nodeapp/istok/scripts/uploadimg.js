var onlyOneImage = false;

isUploadSupported();

if ($("#additemform").length)
  var isEditForm = false;
else {
  var isEditForm = true;

}

if (isEditForm) {
  //console.log('this is edition form');
} else {
  //console.log('this is creation new item form');
}

async function upload(files) {
  let count = 0;
  for (const file of files) {
    count++;
    const opts = {
      method: 'POST',
      body: new FormData()
    };
    filename = Math.floor(Math.random() * 10);
    opts.body.append(`md5me`, file, file.name);

    const response = await fetch('/api/v1/uploads', opts);
    if (response.ok) {
      const obj = await response.json();
      reportSuccess(obj);
    } else {
      //const obj = await response.json();
      reportError(response);
    }
    if (onlyOneImage && count > 0) break;
  }
}

function tryToGetImage(imageName) {
  getPreImage(imageName);
}

async function getPreImage(imageName) {
  const optns = {
    method: 'GET',
    contentType: "image/jpeg",
    dataType: "binary",
  }
  let fileNameWOExt = imageName.split('.').slice(0, -1).join(
    '.');
  if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
    response = await fetch('/api/v1/uploads/temp/' + imageName);
  } else {
    response = await fetch('/api/v1/uploads/fullsize/' + imageName);
  }
  if (response.ok) {
    const img = await response.img;
    ////console.log('image received');
    var filename = response.url.replace(/^.*[\\\/]/, '');
    $('#imageContainer').append(
      "<div class='ui small image bordered rounded imageholder preimage' onclick='markImageMain(this)'>" +
      "<i class='fitted big trash alternate link icon trashicon' id='removeThisImage' onclick='deletePreImage(this)'></i>" +
      "<img class='someItemImage' item-dada=" + filename + " src=" +
      response.url + "></img>" +
      "</div>");
    markFirstImage();
  } else {
    ////console.log('hmmm');
  }
}

function markImageMain(curElement){
  let imgArray = $('#imageContainer').find('div');
  $.each(imgArray, function(index, value) {
    if(value == curElement)$(value).addClass("imageselected");
    else $(value).removeClass("imageselected");
  });
}

function markFirstImage(){
  let imgArray = $('#imageContainer').find('div');
  $.each(imgArray, function(index, value) {
    if(index == 0)$(value).addClass("imageselected");
  });
}

function reportSuccess(obj) {
  getPreImage(obj.name);
}

function reportError(response) {
  if (response.status === 413) {
    prepTemplate(__error__, '.message',
      'The uploaded file was too large for the server to process.');
  }
}

$(document).bind('dragover', '#imageContainer', (e) => {
  $('#imageContainer').dimmer('show');
  e.preventDefault(); // this makes a drop possible
  ////console.log('dragged');
});
$(document).bind('dragleave', '#imageContainer', (e) => {
  $('#imageContainer').dimmer('hide');
  ////console.log('leave');
});
$(document).bind('drop', '#imageContainer', (e) => {
  $('#imageContainer').dimmer('hide');
  e.preventDefault();
  let someFiles = e.originalEvent.dataTransfer.files;
  if (someFiles) upload(someFiles);
});
// $(document).ready(function() {
//   $('.imageContainerholder').bind('dblclick', (e) => {
//
//   });
// });

$(document).on('dblclick', '.imageContainerholder', function() {
  $("#imageUpload").trigger("click");
});

function fileValidation(e) {
  var file = e.files[0];
  if (file) {
    if (/^image\//i.test(file.type)) {
      //e.preventDefault();
      let someFiles = e.files;
      if (someFiles) upload(someFiles);
    } else {
      alert('Not a valid image!');
    }
  }
}

function readFile(file) {
  var reader = new FileReader();

  reader.onloadend = function() {
    processFile(reader.result, file.type);
  }

  reader.onerror = function() {
    alert('There was an error reading the file!');
  }

  reader.readAsDataURL(file);
}

function isUploadSupported() {
  if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
    return false;
  }
  var elem = document.createElement('input');
  elem.type = 'file';
  return !elem.disabled;
};


function deletePreImage(elem) {
  $(elem).parent().slideUp("slow", function() {
    $(elem).parent().remove();
  });
}