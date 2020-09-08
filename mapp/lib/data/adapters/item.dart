import 'package:json_annotation/json_annotation.dart';

part 'item.g.dart';

@JsonSerializable(nullable: true)
class Item {
  final String id;
  final String barcode;
  final String ourname;
  final String ourarticul;
  final String cnarticul;
  final String brand;
  final List<String> category;
  final List<String> images;
  final List<String> properties;
  final double priceoutuah;

  Item(
      {this.id,
      this.barcode,
      this.ourname,
      this.ourarticul,
      this.cnarticul,
      this.brand,
      this.category,
      this.images,
      this.properties,
      this.priceoutuah});
  factory Item.fromJson(Map<String, dynamic> json) => _$ItemFromJson(json);
  Map<String, dynamic> toJson() => _$ItemToJson(this);
}
