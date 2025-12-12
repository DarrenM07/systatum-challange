from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    fields = serializers.JSONField()

    class Meta:
        model = Product
        fields = ["id", "fields"]
        read_only_fields = ["id"]

    def validate_fields(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("fields must be a JSON object (dictionary).")
        return value
