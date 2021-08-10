// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Item _$ItemFromJson(Map<String, dynamic> json) {
  return Item(
    id: json['id'] as String,
    barcode: json['barcode'] as String,
    ourname: json['ourname'] as String,
    ourarticul: json['ourarticul'] as String,
    cnarticul: json['cnarticul'] as String,
    brand: json['brand'] as int,
    category: (json['category'] as List)?.map((e) => e as String)?.toList(),
    images: (json['images'] as List)?.map((e) => e as String)?.toList(),
    properties: (json['properties'] as List)?.map((e) => e as String)?.toList(),
    priceoutuah: (json['priceoutuah'] as num)?.toDouble(),
  );
}

Map<String, dynamic> _$ItemToJson(Item instance) => <String, dynamic>{
      'id': instance.id,
      'barcode': instance.barcode,
      'ourname': instance.ourname,
      'ourarticul': instance.ourarticul,
      'cnarticul': instance.cnarticul,
      'brand': instance.brand,
      'category': instance.category,
      'images': instance.images,
      'properties': instance.properties,
      'priceoutuah': instance.priceoutuah,
    };
