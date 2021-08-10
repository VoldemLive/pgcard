var newHeader = function(message, type) {
  var
    html = '';
  if (message !== undefined && type !== undefined) {
    html += '' + '<div class="message ' + type + '">';
    // message type
    if (type == 'empty') {
      html += '' + '<div class="header">От халепа!</div class="header">' + '<div class="description">' + message + '</div class="description">';
    } else {
      html += ' <div class="description">' + message + '</div>';
    }
    html += '</div>';
  }
  return html;
};

$(document).ready(function() {
  $.ajaxSetup({
    headers: {
      'x-access-token': localStorage.getItem('access-token')
    }
  });
  $('#buttonSearch').click(function() {
    location.href = '../search?q=' + $("#inputSearch").val().split(" ");
  });
  $('#headerSearch')
    .search({
      type: 'category',
      minCharacters: 1,
      maxResults: 3,
      easing: 'easeInExpo',
      transition: 'fade down',
      duration: 250,
      fields: {
        action: 'action', // "view more" object name
        actionText: 'text', // "view more" text
        actionURL: 'url' // "view more" url
      },
      error: {
        source: [{
          title: 'О, ні ....',
          description: 'по Вашому запиту нічого не знайдено ('
        }],
        noResults: 'Нажаль нічого не знайдено...'
      },
      apiSettings: {
        url: '/api/v1/livesearch?q={query}',
        onResponse: function(itemsResponse) {
          let somecounter = 0;
          if (itemsResponse.data.length != 0) {
            somecounter = itemsResponse.data[0].count;
          }
          var
            response = {
              'results': {},
              'action': {
                "url": '../search?q=' + $("#inputSearch").val().split(" "),
                "text": "подивитись всі " + somecounter + " іграшки"
              }
            };
          //}

          if (!itemsResponse || !itemsResponse.data) {
            return;
          }
          // translate GitHub API response to work with search
          let lastIndex = 0;
          $.each(itemsResponse.data, function(index, item) {
            var
              category = getParentCategory(item) || 'Unknown';
            if (response.results[category] === undefined) {
              response.results[category] = {
                name: category,
                results: []
              };
            }
            // add result to category
            let firstImage = '../api/v1/images/thumb/empty.jpg';
            if (item.images != null && item.images.length > 0) {
              firstImage = '../api/v1/images/thumb/' + item.images[0];
            }
            response.results[category].results.push({
              title: item.ourarticul + " " + item.ourname,
              description: item.description,
              url: "../edititem/" + item.id,
              'image': firstImage,
              'price': item.priceoutuah,
            });
            lastIndex = index;
          });
          // if (itemsResponse.data.length > 0) {
          //   let lastinfo = '';
          //   if (lastIndex >= itemsResponse.data[0].count) {
          //     lastinfo = "це всі результати запиту";
          //   } else {
          //     lastinfo = "подивитись всі " + itemsResponse.data[0].count + " іграшки";
          //   }
          //   response.results['action'] = {
          //     'actionURL': '../search?q=' + $("#inputSearch").val().split(" "),
          //     'actionText': lastinfo
          //   }
          // }
          return response;
        }
      }
    });

  $.fn.api.settings.api = {
    'search': '/api/v1/livesearch?q={query}'
  };
  //
  $('#headerSearch').search.settings.templates.message = newHeader;
  $('#headerSearch').search.settings.templates.header = 'ohhhh';

  $("#inputSearch").keyup(function(e) {
    if (e.which === 13) {
      location.href = '../search?q=' + $("#inputSearch").val().split(" ");
    }
  });
})

function getParentCategory(item) {
  switch (item.ourarticul.substring(0, 3).toLowerCase()) {
    case 'нем':
      return 'Для немовлят'
      break;
    case 'збр':
      return 'Зброя'
      break;
    case 'зві':
      return 'Звірі'
      break;
    case 'дів':
      return 'Для дівчат'
      break;
    case 'хло':
      return 'Для хлопчиків'
      break;
    case 'кон':
      return 'Конструктори'
      break;
    case 'лял':
      return 'Ляльки'
      break;
    case 'мяк':
      return 'М`яка'
      break;
    case 'мяч':
      return 'М`ячі'
      break;
    case 'маш':
      return 'Машинки'
      break;
    case 'муз':
      return 'Музична'
      break;
    case 'нас':
      return 'Настільні'
      break;
    case 'укр':
      return 'Українська'
      break;
    case 'паз':
      return 'Пазли'
      break;
    case 'пол':
      return 'Польська'
      break;
    case 'різ':
      return 'Різні'
      break;
    case 'вел':
      return 'Ровери'
      break;
    case 'тех':
      return 'Технок'
      break;
    case 'дер':
      return 'Дерево'
      break;
    default:
      return 'Інші'
      break;
  }
}