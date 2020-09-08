import 'package:json_annotation/json_annotation.dart';

part 'category.g.dart';

@JsonSerializable(nullable: true)
class Category {
  final String id;
  final String name;
  final String logo;
  final String parentid;

  Category({this.id, this.name, this.logo, this.parentid});
  factory Category.fromJson(Map<String, dynamic> json) =>
      _$CategoryFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryToJson(this);
}
