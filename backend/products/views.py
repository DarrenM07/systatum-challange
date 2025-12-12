from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response

from .models import Product
from .serializers import ProductSerializer


def product_index(request):
    return render(request, "products/index.html")


class ProductListCreateAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ProductRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        incoming_fields = serializer.validated_data.get("fields", {})
        merged_fields = dict(instance.fields or {})
        merged_fields.update(incoming_fields)

        instance.fields = merged_fields
        instance.save(update_fields=["fields", "updated_at"])

        response_serializer = self.get_serializer(instance)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
