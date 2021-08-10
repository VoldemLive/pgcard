var apidb = require('./apiqueries');
const b24 = require('b24');


const bitrix24 = new b24.Bitrix24({
  config: {
    mode: "webhook",
    host: "https://masyanya.bitrix24.ua",
    user_id: "1",
    code: "2h5ev6v3h7xxe2cv"
  }
})

//add some clients
async function btAddContact(req, res) {
  // let someFilter = {
  //   'fields[NAME]': 'Глеб',
  //   'fields[SECOND_NAME': 'Егорович',
  //   'fields[LAST_NAME]': 'AAAТитов',
  //   'fields[OPENED]': 'Y',
  //   'fields[ASSIGNED_BY_ID]': 1,
  //   'fields[TYPE_ID]': 'CLIENT',
  //   'fields[SOURCE_ID]': 'SELF',
  //   'fields[PHONE][0][VALUE]': '555888',
  //   'fields[PHONE][0][VALUE_TYPE]': 'WORK'
  // };
  let someFilter = {
    fields: {
      "NAME": "Глеб",
      "SECOND_NAME": "Егорович",
      "LAST_NAME": "Титов",
      "OPENED": "Y",
      "ASSIGNED_BY_ID": 1,
      "TYPE_ID": "CLIENT",
      "SOURCE_ID": "SELF",
      "PHONE": [{
        "VALUE": "555888",
        "VALUE_TYPE": "WORK"
      }]
    },
    params: {
      "REGISTER_SONET_EVENT": "Y"
    }
  };
  try {
    const result = await bitrix24.callMethod('crm.contact.add', someFilter);
    return res.json(result);
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal Server Error",
      error: err
    });
  }
}

//get all contacts
async function btGetAllContacts(req, res) {
  let offset = req.query.offset;
  let someFilter = {
    'start': offset
  };
  try {
    const result = await bitrix24.callMethod('crm.contact.list.json', someFilter);
    return res.json(result);
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}
//get contact by phone
async function btGetContactByPhone(req, res) {
  let someParam = req.params.phone;
  let someFilter = {
    'filter[PHONE][0]': someParam
  };
  try {
    const result = await bitrix24.callMethod('crm.contact.list.json', someFilter);
    return res.json(result);
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}
// Get all Bitrix24 Users
async function btGetUsers(req, res) {
  try {
    const result = await bitrix24.callMethod('user.get.json');
    return res.json(result);
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}
// Get User by id
async function btGetUserById(req, res) {
  let userId = req.params.id;
  let someFilter = {
    'id': userId
  };
  params = req.query.id;
  try {
    const result = await bitrix24.callMethod('user.get.json', someFilter);
    return res.json(result);
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

//get all items
async function btGetItems(req, res) {
  let someFilter = {};
  try {
    const result = await bitrix24.callMethod('crm.product.list.json', someFilter);
    return res.json(result);
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

//get item by id
async function btGetItemById(req, res) {
  let itemID = req.params.id;
  let someFilter = {
    'id': itemID
  };
  try {
    const result = await bitrix24.callMethod('crm.product.get.json', someFilter);
    return res.json(result);
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

async function btGetFieldsList(req, res) {
  let someFilter = {};
  try {
    const result = await bitrix24.callMethod('crm.product.property.list.json', someFilter);
    return res.json(result);
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

async function btExportContactsToBT(req, res) {
  let date = req.query.date_after;
  if (typeof(date) == "undefined") {
    date = '01.01.01';
  }

  apidb.mydb.any('SELECT * FROM catalog WHERE edited >= $1', date)
    .then(function(data) {
      for (let i = 0; i < data.length; i++) {
        let params = {
          fields: {
            "NAME": data[i].ourname,
            "CURRENCY_ID": "UAH",
            "PRICE": data[i].priceoutuah,
            "SORT": 500,
            "PROPERTY_174": {
              "valueId": "14",
              "value": data[i].ourarticul
            }
          }
        };
        btCreateItem(params);
      }
      return res.status(200).json({
        message: "Completed"
      });
    })
    .catch(function(err) {
      return next(err);
    });
}

//create item in catalog bitrix24
async function btCreateItem(params) {
  try {
    const result = await bitrix24.callMethod('crm.product.add.json', params);
    return res.json(result);
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

//create some test item
async function btCreateTestItem(req, res) {
  let params = {
    fields: {
      "NAME": "тестовий товар створений через зовнішній запит 2",
      "CURRENCY_ID": "UAH",
      "PRICE": 4900,
      "SORT": 500,
      "PROPERTY_174": {
        "valueId": "14",
        "value": "2525"
      }
    }
  };
  try {
    const result = await bitrix24.callMethod('crm.product.add.json', params);
    return res.json(result);
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

/////////////
// Exports
/////////////

module.exports = {
  btGetUserById: btGetUserById,
  btGetUsers: btGetUsers,
  btGetContactByPhone: btGetContactByPhone,
  btGetAllContacts: btGetAllContacts,
  btAddContact: btAddContact,
  btGetItems: btGetItems,
  btGetItemById: btGetItemById,
  btGetFieldsList: btGetFieldsList,
  btExportContactsToBT: btExportContactsToBT,
  btCreateTestItem: btCreateTestItem
};