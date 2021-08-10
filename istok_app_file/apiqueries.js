var promise = require('bluebird');
var jwt = require('jwt-simple');
var bcrypt = require('bcrypt');
var pgp = require('pg-promise')(options);
var pgsrv = require('pg');
var config = require('../config');
var connectionString = 'postgres://mtmroot:Proxym@25@database/mtmproducts';
var fs = require('fs');
var path = require('path');
var jimp = require('jimp');
var multer = require('multer');
var root = require('../root');

var db = pgp(connectionString);
var options = {
  // Initialization Options
  promiseLib: promise
};

var errorsText = function(errorCode) {
  switch (errorCode) {
    case 'badkey':
      return "access denied";
      break;
    default:
      return "error undefined";
      break;
  }
}

//image storage config
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    //cb(null, __dirname+'/uploads/images/temp')
    cb(null, root + "/uploads/images/temp/")
  },
  filename: function(req, file, cb) {
    let fileNameWOExt = file.originalname.split('.').slice(0, -1).join(
      '.');
    cb(null, fileNameWOExt + '_' + Date.now() + '_temp.jpg')
  }
})

const uploadImageMulter = multer({
  storage: storage
});
const singleFile = uploadImageMulter.single('md5me');

/////////////////////
// User Query Functions
/////////////////////
async function loginAssync(req, res, next) {
  if (!req.query.login || !req.query.password) {
    // если один или оба параметра запроса опущены,
    // возвращаем 400 - Bad Request
    return res.sendStatus(400)
  } else {
    var username = req.query.login.toLowerCase()
    var password = req.query.password

    db.one('SELECT * FROM users WHERE login = $1', username)
      .then(function(data) {
        bcrypt.compare(password, data.hash, function(err, valid) {
          if (err) {
            //console.log('here first ' + err);
            return res.sendStatus(500)
          }
          if (!valid) {
            return res.sendStatus(401)
          }
          var token = jwt.encode({
            username: username
          }, config.secretkey)
          res.send(token)
        })
      })
      .catch(function(err) {
        //console.log('here second ' + err);
        return res.sendStatus(401);
      });
  }
}

async function createUserAsync(req, res, next) {
  //запрет для удаленного создания пользователей
  //раскомментировать в финальной версии приложения
  //return res.sendStatus(401)
  var auth = jwt.decode(req.headers['x-access-token'], config.secretkey);
  if (auth.username != 'voldem') {
    return res.sendStatus(401);
  }
  let user = {
    "login": req.query.login.toLowerCase(),
    "password": req.query.password,
    "hash": "",
    "token": "",
    "created": 'now()',
    "description": "",
    "role": '2'
  }
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      //console.log('here first ' + err);
      res.status(500);
    } else {
      user.hash = hash;
      db.none(
          'INSERT INTO users(login, password, hash, token, created, description, role)' +
          'values(${login}, ${password}, ${hash}, ${token}, ${created}, ${description}, ${role})',
          user)
        .then(function() {
          return res.status(201)
        })
        .catch(function(err) {
          return res.status(500).json({
            error: err
          });
        });
    }
  })
};

async function checkUserAsync(req, res, next) {
  let finalData = '';
  if (!req.headers['x-access-token']) {
    //console.log('here first ' + err);
    return res.sendStatus(401)
  }
  try {
    var auth = jwt.decode(req.headers['x-access-token'], config.secretkey)
  } catch (err) {
    return res.sendStatus(401)
  }
  //try {
  await db.one('select * from users where LOWER(login) = LOWER($1)', auth.username)
    .then(function(data) {
      someUser = data.login;
      res.status(200).json({
        'user': finalData.login
      });
    })
    .catch(function(err) {
      return res.sendStatus(401).json({
        user: null
      });
    });
};

async function isTokenValid(curToken) {
  if (typeof(curToken) == 'undefined' || curToken == null) {
    curToken = '1111';
  }
  var auth = jwt.decode(curToken, config.secretkey);
  return await db.any('select * from users where LOWER(login) = LOWER($1)', auth.username);
}
/////////////////////
// Query Functions
/////////////////////
async function searchDBQuery(completeAsk, options) {
  if (options.livesearch == true) {
    completeQuery = "SELECT *, count(*) over() FROM catalog WHERE " +
      "make_tsvector(ourarticul,cnarticul,ourname,description,barcode) @@ to_tsquery('" + completeAsk + "') " +
      "ORDER by ourarticul DESC " +
      "LIMIT 10";
  } else {
    let whereFired = false;
    if (typeof completeAsk == 'undefined' || completeAsk == '') { //call all items
      completeQuery = "SELECT *, count(*) over() FROM catalog "
    } else { //call items with some parametr
      completeQuery = "SELECT *, count(*) over() FROM catalog ";
      completeQuery += "WHERE make_tsvector(ourarticul,cnarticul,ourname,description,barcode) @@ to_tsquery('" + completeAsk + "')";
      whereFired = true;
    }
    if (options.bygroup != false && typeof options.bygroup !== 'undefined') {
      if (whereFired) completeQuery += ' and ';
      else {
        completeQuery += 'WHERE '
        whereFired = true;
      };
      completeQuery += "LOWER(ourarticul) LIKE LOWER('" + options.bygroup + "%')";
    }
    if (options.wophotos === 'true' && typeof options.wophotos !== 'undefined') {
      if (whereFired) completeQuery += ' and ';
      else {
        completeQuery += 'WHERE '
        whereFired = true;
      };
      //completeQuery += "images is null";
      completeQuery += "cardinality(images) = 0";
    }
    if (options.wocat === 'true' && typeof options.wocat !== 'undefined') {
      if (whereFired) completeQuery += ' and ';
      else {
        completeQuery += 'WHERE '
        whereFired = true;
      };
      completeQuery += "cardinality(category) = 0";
      //completeQuery += " and category::text <> '{}'";
    }
    if (options.woprop === 'true' && typeof options.woprop !== 'undefined') {
      if (whereFired) completeQuery += ' and ';
      else {
        completeQuery += 'WHERE '
        whereFired = true;
      };
      //completeQuery += "properties is null";
      completeQuery += "cardinality(properties) = 0";
    }
    if (options.woqinbox === 'true' && typeof options.woqinbox !== 'undefined') {
      if (whereFired) completeQuery += ' and ';
      else {
        completeQuery += 'WHERE '
        whereFired = true;
      };
      completeQuery += "quantityinbox = 0";
    }
    if (options.wobarcode === 'true' && typeof options.wobarcode !== 'undefined') {
      if (whereFired) completeQuery += ' and ';
      else {
        completeQuery += 'WHERE '
        whereFired = true;
      };
      completeQuery += "barcode is null";
    }
    if (options.onlyOnStock === 'true' && typeof options.onlyOnStock !== 'undefined') {
      if (whereFired) completeQuery += ' and ';
      else {
        completeQuery += 'WHERE '
        whereFired = true;
      };
      completeQuery += "EXISTS( SELECT 1 FROM itemsbalance WHERE item=ourarticul and quantity > 0)";
    }
    completeQuery += " ORDER by ourarticul DESC " +
      "LIMIT " + options.limit + " " +
      "OFFSET " + ((options.page - 1) * options.limit);
  }
  return await db.any(completeQuery);
}

async function getSearhingPage(req, res, next) {
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }

  let rawSearchQuery = req.query.q;
  let limit = req.query.limit;
  let page = req.query.page;
  let wantedGroup = '';
  if (req.query.bygroup == 'Всі') {
    wantedGroup = false;
  } else {
    wantedGroup = req.query.bygroup;
  }

  let options = {
    'livesearch': false,
    'page': req.query.page,
    'limit': req.query.limit,
    'sort_by': req.query.sort_by,
    'filter': req.query.filter,
    'wophotos': req.query.wophotos,
    'wocat': req.query.wocat,
    'woprop': req.query.woprop,
    'woqinbox': req.query.woqinbox,
    'wobarcode': req.query.wobarcode,
    'onlyOnStock': req.query.onlyOnStock,
    'bygroup': wantedGroup,
  };

  let wordsArray = rawSearchQuery.split(",");
  let someSearchQuery = '';
  for (var i = 0; i < wordsArray.length; i++) {
    if (wordsArray[i].length > 0) {
      if (someSearchQuery.length > 1) {
        someSearchQuery += " & ";
      }
      someSearchQuery += wordsArray[i] + ":*"
    }
  }
  finalData = await searchDBQuery(someSearchQuery, options).then((result) => {
    res.status(200)
      .json({
        status: 'success',
        data: result,
        message: 'Retrieved all toys'
      });
  }).catch((err) => {
    res.status(500)
  })

}

async function getLiveSearhing(req, res, next) {
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }

  let rawSearchQuery = req.query.q.split(" ");

  let options = {
    'livesearch': true
  };
  let someSearchQuery = '';
  for (var i = 0; i < rawSearchQuery.length; i++) {
    if (rawSearchQuery[i].length > 0) {
      if (someSearchQuery.length > 1) {
        someSearchQuery += " & ";
      }
      someSearchQuery += rawSearchQuery[i] + ":*"
    }
  }
  finalData = await searchDBQuery(someSearchQuery, options).then((result) => {
    res.status(200)
      .json({
        status: 'success',
        success: true,
        data: result,
        message: 'Retrieved all searched toys'
      });
  }).catch((err) => {
    res.status(500)
  })
}

async function getAlltoysAsync(req, res, next) {
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  let reqCode = req.query.code;
  let limit = req.query.limit;
  let page = req.query.page;
  let sort_by = req.query.sort_by;
  let filter = req.query.filter;
  let edited_before = req.query.edited_before;
  let edited_after = req.query.edited_after;
  let just_count = req.query.just_count;
  let whereFired = false;
  let finalData = '';

  //construct new query with options from Request
  let nextQuery = 'SELECT *, COUNT(*) OVER() FROM catalog ';
  if (just_count == 1) {
    nextQuery = 'SELECT COUNT(*) OVER() FROM catalog ';
  }
  if (filter != null) {
    nextQuery += 'WHERE LOWER(ourarticul) LIKE LOWER(' + "'" + filter + "%" + "'" + ') ';
    whereFired = true;
  }

  if (reqCode != null) {
    if (whereFired) nextQuery += 'and ';
    else nextQuery += 'WHERE ';
    nextQuery += 'id = ' + reqCode + ' ';
    whereFired = true;
  }

  if (edited_after != null) {
    if (whereFired) nextQuery += 'and ';
    else nextQuery += 'WHERE ';
    nextQuery += 'edited >= ' + "'" + edited_after + "' ";
    whereFired = true;
  }
  if (edited_before != null) {
    if (whereFired) nextQuery += 'and ';
    else nextQuery += 'WHERE ';
    nextQuery += 'edited <= ' + "'" + edited_before + "' ";
    whereFired = true;
  }

  if (sort_by != null) {
    if (sort_by.substring(0, 1) === '-') {
      nextQuery += 'ORDER BY ' + sort_by.substring(1, sort_by.length) + ' DESC ';
    } else {
      nextQuery += 'ORDER BY ' + sort_by.substring(0, sort_by.length) + ' ';
    }
  }

  if (just_count == 1) {
    nextQuery += 'LIMIT ' + 1;
  } else {
    if (limit != null) {
      nextQuery += 'LIMIT ' + limit;
    }
  }

  if (page != null & limit != null) {
    curOffeset = (parseInt(page) - 1) * parseInt(limit);
    nextQuery += 'OFFSET ' + curOffeset + ' ';
  }
  finalData = await db.any(nextQuery).
  then((result) => {
    //console.log('items go out');
    if (result.length == 0) {
      res.status(200)
        .json({
          status: 'success',
          data: [{
            'count': '0'
          }],
          message: 'Retrieved all toys'
        });
    } else {
      res.status(200)
        .json({
          status: 'success',
          data: result,
          message: 'Retrieved all toys'
        });
    }
  }).catch((err) => {
    res.status(500)
  })
}

async function getCountAlltoysAsync(req, res, next) {
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  //construct new query with options from Request
  let nextQuery = 'SELECT COUNT(*) OVER() FROM catalog limit 1';
  finalData = await db.any(nextQuery).
  then((result) => {
    //console.log('items go out');
    res.status(200)
      .json({
        status: 'success',
        data: result,
        message: 'Retrieved all toys'
      });
  }).catch((err) => {
    res.status(500)
  })
}


async function getToyById(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  var id = parseInt(req.params.id);
  db.one('SELECT * FROM catalog WHERE id = $1', id)
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved one toy'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

async function getToyByCode(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  var code = req.params.code;
  db.one('SELECT * FROM catalog WHERE LOWER(ourarticul) = LOWER($1)', code)
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: [data],
          message: 'Retrieved one toy'
        });
    })
    .catch(function(err) {
      res.status(201)
        .json({
          message: 'item not founded',
          data: null,
          status: 'false'
        });
    })
}

async function getToyByBarCode(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  var barcode = req.params.barcode;
  db.one('SELECT * FROM catalog WHERE barcode = $1', barcode)
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: [data],
          message: 'Retrieved one toy'
        });
    })
    .catch(function(err) {
      res.status(200)
        .json({
          message: 'item not founded',
          data: null,
          status: 'false'
        });
    })
}

async function getToyByBarCodeAnonim(req, res, next) {
  //check user rights
  // let someUser = false;
  // await isTokenValid(req.headers['x-access-token']).then((answer) => {
  //   someUser = answer[0].login;
  // }).catch((err) => {
  //   res.status(401).send({
  //     error: errorsText('badkey')
  //   });
  // });
  // if (!someUser) {
  //   return;
  // }
  var barcode = req.params.barcode;
  if (barcode.length == 13) {
    db.any('select id, ourname, ourarticul, cnarticul, priceoutuah, quantityinbox, images FROM catalog WHERE barcode = $1', barcode)
      .then(function(data) {
        res.status(200)
          .json({
            status: 'success',
            data: data,
            message: 'Retrieved one toy'
          });
      })
      .catch(function(err) {
        res.status(200)
          .json({
            message: 'item not founded',
            data: null,
            status: 'false'
          });
      })
  } else {
    db.any('select id, ourname, ourarticul, cnarticul, priceoutuah, quantityinbox, images FROM catalog WHERE LOWER(cnarticul) LIKE LOWER(' + "'" + barcode + "%" + "'" + ')')
      .then(function(data) {
        res.status(200)
          .json({
            status: 'success',
            data: data,
            message: 'Retrieved one toy'
          });
      })
      .catch(function(err) {
        res.status(200)
          .json({
            message: 'item not founded',
            data: null,
            status: 'false'
          });
      })
  }

}

async function createToy(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  newImagesArray = [];
  for (var i = 0; i < req.body.images.length; i++) {
    let fileNameWOExt = req.body.images[i].split('.').slice(0, -1).join('.');
    if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
      filename = fileNameWOExt.substring(0, fileNameWOExt.length - 5) + ".jpg";
      newImagesArray.push(filename);
    }
  }
  req.body.newImagesArray = newImagesArray;
  req.body.realAuthor = someUser;
  req.body.ourarticul = req.body.ourarticul.charAt(0).toUpperCase() + req.body.ourarticul.slice(1)
  db.none(
      'INSERT INTO catalog(ourarticul,' +
      ' cnarticul,' +
      ' ourname,' +
      ' description,' +
      ' brand,' +
      ' images,' +
      ' width,' +
      ' height,' +
      ' length,' +
      ' barcode,' +
      ' created,' +
      ' edited,' +
      ' author,' +
      ' priceinuah,' +
      ' pricemiddleuah,' +
      ' priceoutuah,' +
      ' pricechinausd,' +
      ' priceinusd,' +
      ' priceoutusd,' +
      ' quantityinbox,' +
      ' cbm,' +
      ' videolink,' +
      ' category,' +
      ' opentags,' +
      ' hiddentags,' +
      ' properties)' +
      ' values (${ourarticul},' +
      ' ${cnarticul},' +
      ' ${ourname},' +
      ' ${description},' +
      ' ${brand},' +
      ' ${newImagesArray},' +
      ' ${width},' +
      ' ${height},' +
      ' ${length},' +
      ' ${barcode},' +
      ' ${created},' +
      ' ${edited},' +
      ' ${realAuthor},' +
      ' ${priceinuah},' +
      ' ${pricemiddleuah},' +
      ' ${priceoutuah},' +
      ' ${pricechinausd},' +
      ' ${priceinusd},' +
      ' ${priceoutusd},' +
      ' ${quantityinbox},' +
      ' ${cbm},' +
      ' ${videoLink},' +
      ' ${category},' +
      ' ${opentags},' +
      ' ${hiddentags},' +
      ' ${properties},',+
      ' ${rank},',+
      ' ${minshipment})',
      req.body)
    .then(function() {
      let imagesPath = req.body.images;
      for (let i = 0; i < imagesPath.length; i++) {
        storeCompletedImages(imagesPath[i]);
      }
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one toy'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

async function updateToy(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  curID = parseInt(req.params.id);
  newImagesArray = [];
  for (var i = 0; i < req.body.images.length; i++) {
    let fileNameWOExt = req.body.images[i].split('.').slice(0, -1).join('.');
    if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
      filename = fileNameWOExt.substring(0, fileNameWOExt.length - 5) + ".jpg";
      newImagesArray.push(filename);
    }
  }
  req.body.newImagesArray = newImagesArray;
  req.body.realAuthor = someUser;
  db.one('SELECT * FROM catalog WHERE id = $1', curID)
    .then(function(data) {
      db.none(
          'UPDATE catalog SET' +
          ' cnarticul=${cnarticul},' +
          ' ourname=${ourname},' +
          ' brand=${brand},' +
          ' description=${description},' +
          ' images=${newImagesArray},' +
          ' width=${width},' +
          ' height=${height},' +
          ' length=${length},' +
          ' barcode=${barcode},' +
          ' edited=NOW(),' +
          ' author=${realAuthor},' +
          ' quantityinbox=${quantityinbox},' +
          ' priceinuah=${priceinuah},' +
          ' pricemiddleuah=${pricemiddleuah},' +
          ' priceoutuah=${priceoutuah},' +
          ' pricechinausd=${pricechinausd},' +
          ' priceinusd=${priceinusd},' +
          ' priceoutusd=${priceoutusd},' +
          ' cbm=${cbm},' +
          ' videolink=${videoLink},' +
          ' category=${category},' +
          ' opentags=${opentags},' +
          ' hiddentags=${hiddentags},' +
          ' properties=${properties},' +
          ' rank=${rank},' +
          ' minshipment=${minshipment}' +
          ' WHERE id =' + parseInt(req.params.id),
          req.body
        )
        .then(function() {
          moveImagesToTemp(data.images);
          let imagesPath = req.body.images;
          for (let i = 0; i < imagesPath.length; i++) {
            storeCompletedImages(imagesPath[i]);
          }
          res.status(200)
            .json({
              status: 'success',
              message: 'Updated toy'
            });
        })
        .catch(function(err) {
          return next(err);
        });
    })
    .catch(function(err) {})
}

async function removeToy(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  var id = parseInt(req.params.id);
  db.result('DELETE FROM starships WHERE id = $1', id)
    .then(function(result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: 'Removed ${result.rowCount} toy'
        });
      /* jshint ignore:end */
    })
    .catch(function(err) {
      return next(err);
    });
}
/////////////
// brands
/////////////
async function getBrandsAsync(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  // console.log("color api call");
  db.any('SELECT * FROM brands')
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all brands'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}
async function getBrandsByIdAsync(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  // console.log("color api call");
  let curId = parseInt(req.params.id);
  db.one('SELECT * FROM brands WHERE id=$1', curId)
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved brand'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

async function updateBrandAsync(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  let brand = {
    "id": parseInt(req.body.id),
    "brandname": req.body.name,
    "logo": req.body.logopath,
    "country": req.body.country
  }
  if (brand.logo == null) {
    return res.sendStatus(500);
  }
  let newLogo = '';
  let fileNameWOExt = brand.logo.split('.').slice(0, -1).join('.');
  if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
    filename = fileNameWOExt.substring(0, fileNameWOExt.length - 5) + ".jpg";
    newLogo = filename;
  }
  //storeCompletedImages(brand.logopath);
  db.one('SELECT * FROM brands WHERE id = $1', brand.id).then(function(data) {
    if (data.logo != newLogo) moveImagesToTemp(data.logo);
    db.none(
      'UPDATE brands SET ' +
      ' brandname = $1,' +
      ' logo = $2,' +
      ' country = $3' +
      ' WHERE id = $4', [
        brand.brandname,
        newLogo,
        brand.country,
        brand.id
      ]).then(function() {
      if (data.logo != newLogo) storeCompletedImages(brand.logo);
      return res.sendStatus(201)
    }).catch(function(err) {
      console.log(err);
      return res.sendStatus(501)
    })
  });
};

async function addBrandAsync(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  newImagesArray = [];
  let fileNameWOExt = req.body.logopath.split('.').slice(0, -1).join('.');
  if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
    filename = fileNameWOExt.substring(0, fileNameWOExt.length - 5) + ".jpg";
  }
  let brand = {
    "brandname": req.body.name,
    "logopath": filename,
    "country": req.body.country
  }
  if (brand.logopath == null) {
    return res.sendStatus(500);
  }
  storeCompletedImages(req.body.logopath);
  db.none(
      'INSERT INTO brands(brandname, logo, country)' +
      'values(${brandname}, ${logopath}, ${country})',
      brand)
    .then(function() {
      return res.sendStatus(201)
    })
    .catch(function(err) {
      return res.sendStatus(500);
    });
};
/////////////
// colors
/////////////
async function addPacking(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  packingName = req.query.name;
  if (typeof packingName == 'undefined') {
    return;
  }
  let pack = {
    "packingName": packingName
  }
  db.none(
      'INSERT INTO packing(name)' +
      'values(${packingName})',
      pack)
    .then(function() {
      return res.sendStatus(201).json({
        status: 'success',
        data: data,
        message: 'Packing added'
      });
    })
    .catch(function(err) {
      return res.sendStatus(500);
    });
};

async function getPackings(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  // console.log("packings api call");
  db.any('SELECT * FROM packing')
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all packing'
        });
    })
    .catch(function(err) {
      return next(err);
    });
};
/////////////
// colors
/////////////
async function getColorsAssync(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  // console.log("color api call");
  db.any('SELECT * FROM colors')
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all colors'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

async function getColorByIdAsync(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  var id = parseInt(req.params.id);
  db.one('SELECT * FROM color WHERE id = $1', id)
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved one color'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

/////////////
// items balance on stock
/////////////
async function uploadBalanceData(req, res) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  let randomname = 'items_balance_' + (Math.ceil(Math.random() * 99999999999)) + '.csv';
  let partnerId = req.body.partnerId;
  let completeFilename = path.join(__dirname, '..', 'uploads', 'data', randomname);
  fs.writeFile(completeFilename, req.body.value, function(err) {
    if (err) {
      //console.log(err);
    } else {
      db.none("UPDATE itemsbalance SET quantity = 0 WHERE partner = $1;", [partnerId])
        .then(function() {
          db.none(
              "CREATE TEMP TABLE tmp_table(item VARCHAR, partner INT, quantity INT) ON COMMIT DROP;" +
              "COPY tmp_table FROM $2 WITH CSV DELIMITER '|' HEADER;" +
              "INSERT INTO itemsbalance(item, partner, quantity) SELECT * FROM tmp_table WHERE EXISTS (SELECT 1 FROM catalog WHERE ourarticul = item) " +
              "ON CONFLICT (item, partner) DO UPDATE SET quantity = EXCLUDED.quantity;", [partnerId, completeFilename])
            .then(function() {
              res.status(200).send('quantity on stock updated');
              fs.unlinkSync(completeFilename);
            })
            .catch(function(err) {
              console.log(err);
              //console.log('insert error ' + err);
            });
        }).catch(function(err) {
          res.status(501).send('broken on update to zero');
        });
    }
  });
};
async function uploadSalesData(req, res) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  let randomname = 'items_sales_' + (Math.ceil(Math.random() * 99999999999)) + '.csv';
  let partnerId = parseInt(req.body.partnerId);
  let completeFilename = path.join(__dirname, '..', 'uploads', 'data', randomname);
  fs.writeFile(completeFilename, req.body.value, function(err) {
    if (err) {
      //console.log(err);
    } else {
      db.none(
          "CREATE TEMP TABLE tmp_table(item VARCHAR, partner INT, quantity INT) ON COMMIT DROP;" +
          "COPY tmp_table FROM $2 WITH CSV DELIMITER '|' HEADER;" +
          "INSERT INTO itemsbalance(item, partner, quantity) SELECT * FROM tmp_table WHERE EXISTS (SELECT 1 FROM catalog WHERE ourarticul = item) " +
          "ON CONFLICT (item, partner) DO UPDATE SET quantity = EXCLUDED.quantity;", [partnerId, completeFilename])
        .then(function() {
          res.status(200).send('sales updated');
          fs.unlinkSync(completeFilename);
        })
        .catch(function(err) {
          res.status(500).send('error on update sales');
          console.log('insert error ' + err);
        });
    }
  });
}
/////////////
// contacts
/////////////
async function uploadContacts(req, res) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  let randomname = 'contacts_' + (Math.ceil(Math.random() * 99999999999)) + '.csv';
  let partnerId = parseInt(req.body.partnerId);
  let completeFilename = path.join(__dirname, '..', 'uploads', 'data', randomname);
  fs.writeFile(completeFilename, req.body.value, function(err) {
    if (err) {
      //console.log(err);
    } else {
      db.none(
          "CREATE TEMP TABLE tmp_table(name VARCHAR, firstname VARCHAR, lastname VARCHAR, address VARCHAR, telephone VARCHAR, email VARCHAR," +
          " comment TEXT, id1c INT, edited TIMESTAMP, partner INT) ON COMMIT DROP; " +
          "COPY tmp_table FROM $2 WITH CSV DELIMITER '|' HEADER; " +
          "INSERT INTO contacts(name, firstname, lastname, address, telephone, email, comment, id1c, edited, partner) SELECT * FROM tmp_table" +
          " ON CONFLICT (id1c, partner) DO UPDATE SET name = excluded.name, firstname = excluded.firstname, lastname = excluded.lastname," +
          " address = excluded.address, telephone = excluded.telephone, email = excluded.email," +
          " comment = excluded.comment, id1c = excluded.id1c, edited = NOW(), partner = excluded.partner;", [partnerId, completeFilename])
        .then(function() {
          res.status(200).send('contacts updated');
          fs.unlinkSync(completeFilename);
        })
        .catch(function(err) {
          res.status(500).send('error on upload contacts');
          console.log('insert error ' + err);
        });
    }
  });
}
/////////////
// Image worker
/////////////
function uploadImages(req, res) {
  singleFile(req, res, async (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(413).send('Request Entity Too Large');
      } else {
        //console.log('we here');
        res.status(500).send('Server Error');
      }
      return;
    }
    res.json({
      name: req.file.filename
    });
  });
};

function getTempImage(req, res) {
  file = req.params.file;
  var img = fs.readFileSync(root + "/uploads/images/temp/" + file);
  res.writeHead(200, {
    'Content-Type': 'image/jpg'
  });
  res.end(img, 'binary');
}

function deleteTempImage(req, res) {
  file = req.params.file;
  var tmpPath = root + "/uploads/images/temp/" + file;
  fs.unlinkSync(tmpPath);
}

function getFullImage(req, res) {
  file = req.params.file;
  if (fs.existsSync(root + "/uploads/images/fullsize/" + file)) {
    var img = fs.readFileSync(root + "/uploads/images/fullsize/" + file);
  } else {
    var img = fs.readFileSync(root + "/uploads/images/fullsize/empty.jpg");
  }
  res.writeHead(200, {
    'Content-Type': 'image/jpg'
  });
  res.end(img, 'binary');
};

function getThumbImage(req, res) {
  file = req.params.file;
  if (fs.existsSync(root + "/uploads/images/fullsize/" + file)) {
    var img = fs.readFileSync(root + "/uploads/images/thumbs/" + file);
  } else {
    var img = fs.readFileSync(root + "/uploads/images/thumbs/empty.jpg");
  }
  res.writeHead(200, {
    'Content-Type': 'image/jpg'
  });
  res.end(img, 'binary');
};

function moveImagesToTemp(images) {
  if (images == null) {
    return;
  }
  for (let i = 0; i < images.length; i++) {
    isTempImage = false;
    let fileNameWOExt = images[i].split('.').slice(0, -1).join(
      '.');
    if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
      isTempImage = true;
    }
    if (isTempImage) {
      //do nothing
    } else {
      //if this is old image we need move
      //images to temp mark as temp and delete thumb
      let pathToFullSize = root + "/uploads/images/fullsize/" + fileNameWOExt + ".jpg";
      let pathToSmallSize = root + "/uploads/images/thumbs/" + fileNameWOExt + ".jpg";
      if (fs.existsSync(pathToSmallSize)) fs.unlinkSync(pathToSmallSize);
      if (fs.existsSync(pathToFullSize)) {
        let tmpPath = root + "/uploads/images/temp/" + fileNameWOExt + "_temp.jpg";
        fs.renameSync(pathToFullSize, tmpPath, function(err) {
          if (err) throw err;
          //console.log('Move complete.');
        });
      }
    }
  }
}

function storeCompletedImages(imageName) {
  var tmpPath = root + "/uploads/images/temp/" + imageName;
  let fileNameWOExt = imageName.split('.').slice(0, -1).join(
    '.');
  if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
    imageName = fileNameWOExt.substring(0, fileNameWOExt.length - 5) + ".jpg";
  }
  var newPath = root + "/uploads/images/fullsize/" + imageName;
  var thumbPath = root + "/uploads/images/thumbs/" + imageName;
  //var thumbPath = "./uploads/images/thumbs/" + imageName;
  fs.renameSync(tmpPath, newPath, function(err) {
    if (err) throw err;
    console.log('Move complete.');

  });

  //console.log('Try to resize.');
  jimp.read(newPath, (err, lenna) => {
    if (err) throw err;
    if(lenna.bitmap.width != 800){
      lenna
      .resize(800, jimp.AUTO) // resize
      .quality(100) // set JPEG quality
      .write(newPath); // save
    }    
    lenna
    .resize(256, jimp.AUTO) // resize
    .quality(90) // set JPEG quality
    .write(thumbPath); // save
    //fs.unlinkSync(tmpPath);
  });
}

/////////////
// uploading start images
/////////////
function getCodeInEng(cyrCode) {
  switch (cyrCode.toUpperCase()) {
    case 'НЕМ':
      return 'BAB';
      break;
    case 'ЗБР':
      return 'GUN';
      break;
    case 'ЗВІ':
      return 'ZOO';
      break;
    case 'ДІВ':
      return 'GIR';
      break;
    case 'ХЛО':
      return 'BOY';
      break;
    case 'КОН':
      return 'CON';
      break;
    case 'ЛЯЛ':
      return 'DOL';
      break;
    case 'МЯК':
      return 'SOF';
      break;
    case 'МЯЧ':
      return 'BAL';
      break;
    case 'МАШ':
      return 'CAR';
      break;
    case 'МУЗ':
      return 'MUZ';
      break;
    case 'НАС':
      return 'TAB';
      break;
    case 'УКР':
      return 'UKR';
      break;
    case 'ПАЗ':
      return 'PUZ';
      break;
    case 'ПОЛ':
      return 'POL';
      break;
    case 'РІЗ':
      return 'OTH';
      break;
    case 'ВЕЛ':
      return 'BIK';
      break;
    case 'ТЕХ':
      return 'TEH';
      break;
    case 'ДЕР':
      return 'WOO';
      break;
    default:
      return null;
      break;
  }
}

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
async function attachImagesToItem(req, res) {
  var allItemsArray = [];
  let nextQuery = 'SELECT ourarticul,images FROM catalog';
  let testFolder = root + "/uploads/oldImages/";
  let tmpPath = root + "/uploads/images/temp/"

  finalData = await db.any(nextQuery).
  then((result) => {
    //console.log('items go out');
    for (var i = 0; i < result.length; i++) {
      if (result[i].images == null || isEmpty(result[i].images) == true) {
        allItemsArray.push(result[i].ourarticul);
      }
    }
    let completedQuantity = 0;
    asyncForEach(allItemsArray, async (item) => {
      await waitFor(35);
      completedQuantity++;
      let startCyrCode = getCodeInEng(item.substr(0, 3));
      if (startCyrCode != null) {
        let fileName = startCyrCode + item.substr(3, 7) + '.jpg';
        let fileNameTemp = startCyrCode + item.substr(3, 7) + '_temp.jpg';
        try {
          if (fs.existsSync(testFolder + fileName)) {
            //console.log('founded: ' + fileName);
            let copyStream = fs.createReadStream(testFolder + fileName).pipe(fs.createWriteStream(tmpPath + fileNameTemp));
            copyStream.on('close', function() {
              let completeImgArray = [];
              completeImgArray.push(fileName);
              storeCompletedImages(fileNameTemp);
              db.none('UPDATE catalog SET images=$1 WHERE LOWER(ourarticul) = LOWER($2)', [completeImgArray, item]);
            });
          }
        } catch (err) {
          console.error(err)
        }
        if (completedQuantity + 1 >= allItemsArray.length) {
          res.status(200)
            .json({
              status: 'success',
              message: 'images attached to items'
            });
        }
      } else {
        console.log('cant get image for ' + item);
      }
    });
  }).catch((err) => {
    res.status(500)
  })
}

/////////////
// Categories
/////////////
async function getCategories(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  // console.log("categories api call");
  db.any('SELECT * FROM categories')
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all brands'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

async function addCategorie(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }

  let parId = null;

  if (req.body.parentId != "") {
    parId = req.body.parentId;
  }

  let curObj = {
    'categoryName': req.body.categoryName,
    'parentid': parId,
    'logo': req.body.imagePath,
  };

  let newLogo = '';
  let fileNameWOExt = '';
  let fileNameWOExtTemp = '';
  if (curObj.logo.toUpperCase() != 'NULL') {
    fileNameWOExt = curObj.logo.split('.').slice(0, -1).join('.');
    fileNameWOExtTemp = fileNameWOExt + '.jpg';
    if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
      curObj.logo = fileNameWOExt.substring(0, fileNameWOExt.length - 5) + ".jpg";
    }
  }

  let queryTemplate = 'INSERT INTO categories(name, parentid, logo) values (';
  queryTemplate += '${categoryName},';
  if (isNaN(parseInt(curObj.parentid)) == true) {
    queryTemplate += ' NULL,';
  } else {
    queryTemplate += ' ${parentid},';
  }
  if (curObj.logo.toUpperCase() == 'NULL') {
    queryTemplate += ' NULL)';
  } else {
    storeCompletedImages(fileNameWOExtTemp);
    queryTemplate += ' ${logo})';
  }

  db.none(queryTemplate, curObj)
    .then(function() {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one toy'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

async function updateCategory(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }

  if (isNaN(parseInt(req.body.parentId)) == false) {
    parId = req.body.parentId;
  } else {
    parId = null;
  }

  let curObj = {
    'categoryName': req.body.categoryName,
    'parentid': parId,
    'curId': req.params.id,
    'logo': req.body.imagePath
  };

  let newLogo = '';
  let fileNameWOExt = '';
  let fileNameWOExtTemp = '';
  if (curObj.logo.toUpperCase() != 'NULL' && curObj.logo != '') {
    fileNameWOExt = curObj.logo.split('.').slice(0, -1).join('.');
    fileNameWOExtTemp = fileNameWOExt + '.jpg';
    if (fileNameWOExt.substring(fileNameWOExt.length - 5, fileNameWOExt.length) == "_temp") {
      curObj.logo = fileNameWOExt.substring(0, fileNameWOExt.length - 5) + ".jpg";
    }
  }

  let queryTemplate = 'UPDATE categories SET name = ${categoryName},';
  if (isNaN(parseInt(req.body.parentId)) == true) {
    queryTemplate += ' parentid = NULL,';
  } else {
    queryTemplate += ' parentid = ${parentid},';
  }
  if (curObj.logo.toUpperCase() == 'NULL') {
    queryTemplate += ' logo = NULL';
  } else {
    storeCompletedImages(fileNameWOExtTemp);  
    queryTemplate += ' logo = ${logo}';
  }
  queryTemplate += ' WHERE id = ${curId}';

  db.none(queryTemplate, curObj)
    .then(function() {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one toy'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

/////////////
// properties
/////////////

async function getProperties(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  // console.log("categories api call");
  db.any('SELECT * FROM itemsproperties')
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all brands'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

async function addPropertie(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }

  let parId = null;

  if (req.body.parentId != "") {
    parId = req.body.parentId;
  }

  let curObj = {
    'categoryName': req.body.categoryName,
    'parentid': parId,
  };

  db.none(
      'INSERT INTO itemsproperties(name,' +
      ' parentid)' +
      ' values (${categoryName},' +
      ' ${parentid})', curObj)
    .then(function() {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one toy'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

async function updatePropertie(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }

  if (isNaN(parseInt(req.body.parentId)) == false) {
    parId = req.body.parentId;
  } else {
    parId = null;
  }

  let curObj = {
    'categoryName': req.body.categoryName,
    'parentid': parId,
    'curId': req.params.id,
  };

  if (isNaN(parseInt(req.body.parentId)) == true) {
    db.none(
        'UPDATE itemsproperties SET' +
        ' name = $1,' +
        ' parentid = NULL' +
        ' WHERE id = $3', [
          curObj.categoryName,
          curObj.parentid,
          curObj.curId
        ])
      .then(function() {
        res.status(200)
          .json({
            status: 'success',
            message: 'updated'
          });
      })
      .catch(function(err) {
        return next(err);
      });
  } else {
    db.none(
        'UPDATE itemsproperties SET' +
        ' name = $1,' +
        ' parentid = $2' +
        ' WHERE id = $3', [
          curObj.categoryName,
          curObj.parentid,
          curObj.curId
        ])
      .then(function() {
        res.status(200)
          .json({
            status: 'success',
            message: 'updated'
          });
      })
      .catch(function(err) {
        return next(err);
      });
  }

}

async function stockbalance(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  db.any('SELECT * FROM itemsbalance')
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'stock balance all company'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

async function stockbalanceByStockId(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  db.any('SELECT * FROM itemsbalance where partner = ' + parseInt(req.params.id))
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'stock balance by warehouse'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

async function stockbalanceByItemarticul(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  db.any("SELECT * FROM itemsbalance where LOWER(item) = LOWER('" + req.params.articul + "')")
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'stock balance for ' + req.params.articul + ' articul'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}

async function partnerslist(req, res, next) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  db.any('SELECT * FROM partners')
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'list of partners'
        });
    })
    .catch(function(err) {
      return next(err);
    });
}


/////////////
// items incoming
/////////////
async function uploadIncoming(req, res) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  let randomname = 'items_income_' + (Math.ceil(Math.random() * 99999999999)) + '.csv';
  let partnerId = req.body.partnerId;
  let completeFilename = path.join(__dirname, '..', 'uploads', 'data', randomname);
  fs.writeFile(completeFilename, req.body.value, function(err) {
    if (err) {
      //console.log(err);
    } else {
      db.none(
          "CREATE TEMP TABLE tmp_table(item VARCHAR, partner INT, dateincome DATE) ON COMMIT DROP;" +
          "COPY tmp_table FROM $2 WITH CSV DELIMITER '|' HEADER;" +
          "INSERT INTO itemsincoming(item, partner, dateincome) SELECT * FROM tmp_table WHERE EXISTS (SELECT 1 FROM catalog WHERE ourarticul = item) " +
          "ON CONFLICT (item, partner) DO UPDATE SET dateincome = EXCLUDED.dateincome;", [partnerId, completeFilename])
        .then(function() {
          res.status(200).send('incoming to stock updated');
          fs.unlinkSync(completeFilename);
        })
        .catch(function(err) {
          console.log(err);
          //console.log('insert error ' + err);
        });
    }
  });
}

async function getIncomingByDate(req, res) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  let curDate = req.params.date;
  db.any('select item, partner FROM itemsincoming WHERE dateincome = $1', [curDate])
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all incomings by date ' + curDate
        });
    })
    .catch(function(err) {
      res.status(200)
        .json({
          message: 'items incoming not found',
          data: null,
          status: 'false'
        });
    })
}

async function getIncomingPartnerByDate(req, res) {
  //check user rights
  let someUser = false;
  await isTokenValid(req.headers['x-access-token']).then((answer) => {
    someUser = answer[0].login;
  }).catch((err) => {
    res.status(401).send({
      error: errorsText('badkey')
    });
  });
  if (!someUser) {
    return;
  }
  let curDate = req.params.date;
  let curPartner = parseInt(req.params.partner);
  db.any('select item, partner FROM itemsincoming WHERE dateincome = $1 AND partner = $2', [curDate, curPartner])
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved all incomings ' + curPartner + '  by date ' + curDate
        });
    })
    .catch(function(err) {
      res.status(200)
        .json({
          message: 'items incoming by partner ' + curPartner + ' not found',
          data: null,
          status: 'false'
        });
    })
}


/////////////
// Exports
/////////////

module.exports = {
  createUser: createUserAsync,
  checkUser: checkUserAsync,
  login: loginAssync,
  getAlltoys: getAlltoysAsync,
  getCountAlltoys: getCountAlltoysAsync,
  getToyById: getToyById,
  getToyByCode: getToyByCode,
  getToyByBarCode: getToyByBarCode,
  getToyByBarCodeAnonim: getToyByBarCodeAnonim,
  createToy: createToy,
  updateToy: updateToy,
  removeToy: removeToy,
  getColors: getColorsAssync,
  getColorById: getColorByIdAsync,
  addPacking: addPacking,
  getPackings: getPackings,
  getBrands: getBrandsAsync,
  updateBrand: updateBrandAsync,
  getBrandsById: getBrandsByIdAsync,
  createBrand: addBrandAsync,
  upload: uploadImages,
  uploadBalance: uploadBalanceData,
  uploadSales: uploadSalesData,
  deleteTempImage: deleteTempImage,
  getTempImage: getTempImage,
  getFullImage: getFullImage,
  getThumbImage: getThumbImage,
  getLiveSearhing: getLiveSearhing,
  getSearhing: getSearhingPage,
  uploadContacts: uploadContacts,
  //categories
  getCategories: getCategories,
  addCategorie: addCategorie,
  updateCategory: updateCategory,
  //properties
  getProperties: getProperties,
  addPropertie: addPropertie,
  updatePropertie: updatePropertie,
  //stock balance
  stockbalance: stockbalance,
  stockbalanceByStockId: stockbalanceByStockId,
  stockbalanceByItemarticul: stockbalanceByItemarticul,
  //stock balance
  stockIncoming: uploadIncoming,
  stockIncomingByDate: getIncomingByDate,
  stockIncomingPartnerByDate: getIncomingPartnerByDate,
  //partners list
  partnerslist: partnerslist,
  // images
  attachImagesToItem: attachImagesToItem,
  // db access
  mydb: db
};
