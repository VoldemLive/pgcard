import 'package:animated_splash_screen/animated_splash_screen.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:page_transition/page_transition.dart';
import 'package:IdToy/pages/scannerpage/index.dart';

void main() => runApp(IdToy());

class IdToy extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    Future.wait([
      FirebaseAnalytics().logAppOpen(),
      precachePicture(
        ExactAssetPicture(
            SvgPicture.svgStringDecoder, 'lib/media/tutor/01.svg'),
        null,
      ),
      precachePicture(
        ExactAssetPicture(
            SvgPicture.svgStringDecoder, 'lib/media/tutor/02.svg'),
        null,
      ),
      precachePicture(
        ExactAssetPicture(
            SvgPicture.svgStringDecoder, 'lib/media/tutor/03.svg'),
        null,
      ),
      precachePicture(
        ExactAssetPicture(
            SvgPicture.svgStringDecoder, 'lib/media/tutor/01.svg'),
        null,
      ),
    ]);

    Widget startup() {
      return AnimatedSplashScreen(
          splash: Image(image: AssetImage('lib/media/id_toy.png')),
          splashIconSize: 300,
          nextScreen: MainScreen(),
          splashTransition: SplashTransition.fadeTransition,
          pageTransitionType: PageTransitionType.fade,
          backgroundColor: Colors.white);
    }

    SystemChrome.setEnabledSystemUIOverlays([SystemUiOverlay.bottom]);
    return MaterialApp(
      theme: ThemeData(
        brightness: Brightness.light,
        //Change your color here
        accentColor: Colors.grey[300],
        accentColorBrightness: Brightness.light,
      ),
      title: 'IdToy - сканер',
      home: startup(),
    );
  }
}
