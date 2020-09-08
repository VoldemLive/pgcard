import 'dart:convert' as convert;
import 'package:http/http.dart' as http;
import 'package:mapp/data/adapters/item.dart';
import 'package:mapp/config/apiconnection.dart' as config;

Future<List<Item>> getItems() async {
  var serverAdress = config.apiserver;
  var url = serverAdress + '/api/v1/toys?limit=150';
  var response =
      await http.get(url, headers: {'x-access-token': config.apikey});
  if (response.statusCode == 200) {
    var jsonResponse = convert.jsonDecode(response.body);
    List<Item> items =
        (jsonResponse["data"] as List).map((i) => Item.fromJson(i)).toList();
    return items;
  } else {
    return null;
  }
}

Future<Item> getItemByBarcode(currentBarcode) async {
  var serverAdress = config.apiserver;
  var url = serverAdress + '/api/v1/toys/bybarcode/$currentBarcode';
  var response =
      await http.get(url, headers: {'x-access-token': config.apikey});
  if (response.statusCode == 200) {
    var jsonResponse = convert.jsonDecode(response.body);
    if (jsonResponse["data"] != null) {
      Item items = Item.fromJson(jsonResponse["data"]);
      return items;
    } else {
      return null;
    }
  } else {
    return null;
  }
}
