import 'package:flutter/material.dart';
import 'package:mapp/data/providers/categorydata.dart' as categoryprovider;

class CatalogPage extends StatefulWidget {
  _CatalogPageState createState() => _CatalogPageState();
}

class _CatalogPageState extends State<CatalogPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      body: SafeArea(
        child: FutureBuilder(
            future: categoryprovider.getTopCategories(),
            builder: (BuildContext context, AsyncSnapshot snapshot) {
              return ListView.builder(
                itemCount: snapshot.data.length,
                itemBuilder: (BuildContext context, int index) {
                  return ListTile(
                    leading: Text(snapshot.data[index].id),
                    title: Text(snapshot.data[index].name),
                  );
                },
              );
            }),
      ),
    );
  }
}
