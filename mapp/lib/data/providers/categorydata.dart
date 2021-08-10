import 'dart:convert' as convert;
import 'package:http/http.dart' as http;
import 'package:IdToy/data/adapters/category.dart';
import 'package:IdToy/config/apiconnection.dart' as config;

Future<List<Category>> getCategories() async {
  var serverAdress = config.apiserver;
  var url = serverAdress + '/api/v1/categories';
  var response = await http.get(
    url,
  );
  if (response.statusCode == 200) {
    var jsonResponse = convert.jsonDecode(response.body);
    List<Category> items = (jsonResponse["data"] as List)
        .map((i) => Category.fromJson(i))
        .toList();
    return items;
  } else {
    return null;
  }
}

Future<List<Category>> getTopCategories() async {
  Future<List<Category>> allCategories = getCategories();
  return allCategories;
}
