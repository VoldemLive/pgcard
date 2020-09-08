import 'package:json_annotation/json_annotation.dart';

part 'property.g.dart';

@JsonSerializable(nullable: true)
class Property {
  final String id;
  final String name;
  final String parentid;

  Property({this.id, this.name, this.parentid});
  factory Property.fromJson(Map<String, dynamic> json) =>
      _$PropertyFromJson(json);
  Map<String, dynamic> toJson() => _$PropertyToJson(this);
}
