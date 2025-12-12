from django.urls import path

from .views import (
    ProductListCreateAPIView,
    ProductRetrieveUpdateDestroyAPIView,
    product_index,
)


urlpatterns = [
    path("", product_index, name="product-index"),
    path("api/products/", ProductListCreateAPIView.as_view(), name="product-list-create"),
    path("api/products/<int:pk>/", ProductRetrieveUpdateDestroyAPIView.as_view(), name="product-detail"),
    # Accept requests without trailing slash to avoid 404/redirect issues
    path("api/products", ProductListCreateAPIView.as_view()),
    path("api/products/<int:pk>", ProductRetrieveUpdateDestroyAPIView.as_view()),
]
