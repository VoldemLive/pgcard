import 'dart:async';
import 'dart:convert' as convert;
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:IdToy/data/adapters/item.dart';
import 'package:IdToy/config/apiconnection.dart' as config;

Future<List<Item>> getItems() async {
  var serverAdress = config.apiserver;
  var url = serverAdress + '/api/v1/toys?limit=150';
  var response = await http.get(
    url,
  );
  if (response.statusCode == 200) {
    var jsonResponse = convert.jsonDecode(response.body);
    List<Item> items =
        (jsonResponse["data"] as List).map((i) => Item.fromJson(i)).toList();
    return items;
  } else {
    return null;
  }
}

Future<ItemResponse> getItemByBarcode(currentBarcode) async {
  //status code: 0 - good, 1 - not found, 2 - server error, 3 - server not avaliable
  var serverAdress = config.apiserver;
  var url = serverAdress + '/api/v1/itemsByBarcode/$currentBarcode';
  var client = http.Client();
  try {
    var response = await client.get(url).timeout(const Duration(seconds: 5));
    var jsonResponse = convert.jsonDecode(response.body);
    Item items = Item.fromJson(jsonResponse['data']['data'][0]);
    if (items != null) {
      ItemResponse itemResponse =
          new ItemResponse(item: items, barcode: currentBarcode, status: '0');
      return itemResponse;
    } else {
      ItemResponse itemResponse =
          new ItemResponse(item: null, barcode: currentBarcode, status: '1');
      return itemResponse;
    }
  } on TimeoutException catch (_) {
    client.close();
    ItemResponse itemResponse =
        new ItemResponse(item: null, barcode: currentBarcode, status: '3');
    return itemResponse;
  } on SocketException catch (_) {
    client.close();
    ItemResponse itemResponse =
        new ItemResponse(item: null, barcode: currentBarcode, status: '3');
    return itemResponse;
  } catch (e) {
    client.close();
    ItemResponse itemResponse =
        new ItemResponse(item: null, barcode: currentBarcode, status: '1');
    return itemResponse;
  }
}
