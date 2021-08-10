import 'package:flutter/material.dart';
import 'package:pgbankcard/widgets/bookmarks.dart';
import 'package:pgbankcard/widgets/labels.dart';
import 'package:pgbankcard/widgets/menulist.dart';
import 'package:pgbankcard/widgets/serchline.dart';

void main() => runApp(MyApp());

/// This is the main application widget.
class MyApp extends StatelessWidget {
  static const String _title = 'Cakes';

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: _title,
      theme: ThemeData(fontFamily: 'Diodrum'),
      home: Scaffold(
        body: MainScreen(),
      ),
    );
  }
}

class MainScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Color(0xfff8f8ff),
      child: Column(
        children: [
          HeaderMenu(),
          LabelsPart(),
          BookmarksPart(),
          MenuList(),
        ],
      ),
    );
  }
}

class HeaderMenu extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Color(0xff6c60e0),
        borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(35), bottomRight: Radius.circular(35)),
      ),
      height: 230,
      alignment: Alignment.center,
      padding: EdgeInsets.fromLTRB(15, 0, 15, 25),
      //constraints: BoxConstraints.expand(),
      child: SafeArea(
        child: Container(
          child: Column(
            children: [
              Expanded(
                flex: 1,
                child: Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: Container(
                        alignment: Alignment.centerLeft,
                        child: Icon(
                          Icons.chevron_left_rounded,
                          color: Colors.white,
                          size: 45,
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 6,
                      child: Container(
                        alignment: Alignment.center,
                        child: Text(
                          'Cooking',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 30,
                              fontFamily: 'Diodrum',
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: Container(
                        alignment: Alignment.centerRight,
                        child: Icon(
                          Icons.notifications_none_rounded,
                          color: Colors.white,
                          size: 35,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                flex: 1,
                child: Container(
                  alignment: Alignment.bottomCenter,
                  child: SearchingString(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
