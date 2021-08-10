$(document).ready(function() {
  $.ajaxSetup({
    headers: {
      'x-access-token': localStorage.getItem('access-token')
    }
  });

  function showBrandModal(curID) {
    $('.brand.ui.modal')
      .modal('show');
  }
})