from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import Product
from .serializers import ProductSerializer


class ProductAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_product_returns_id_and_fields(self):
        payload = {"fields": {"name": "Ultramie Goreng", "price": 25000}}
        response = self.client.post(reverse("product-list-create"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertEqual(response.data["fields"], payload["fields"])
        self.assertTrue(Product.objects.filter(pk=response.data["id"]).exists())

    def test_put_merges_fields_without_overwriting_missing_keys(self):
        product = Product.objects.create(fields={"name": "Ultramie", "price": 25000, "stock": 10})
        update_payload = {"fields": {"price": 26000}}

        response = self.client.put(
            reverse("product-detail", args=[product.pk]),
            update_payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertEqual(product.fields["name"], "Ultramie")
        self.assertEqual(product.fields["price"], 26000)
        self.assertEqual(product.fields["stock"], 10)

    def test_fields_must_be_json_object(self):
        payload = {"fields": ["not", "a", "dict"]}
        response = self.client.post(reverse("product-list-create"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("fields", response.data)

        serializer = ProductSerializer(data={"fields": "string"})
        self.assertFalse(serializer.is_valid())
        self.assertIn("fields", serializer.errors)

    def test_str_uses_name_else_fallback(self):
        product_with_name = Product.objects.create(fields={"name": "Named Product"})
        self.assertEqual(str(product_with_name), "Named Product")

        unnamed = Product.objects.create(fields={"price": 100})
        self.assertEqual(str(unnamed), f"Product {unnamed.pk}")

    def test_index_page_renders(self):
        response = self.client.get(reverse("product-index"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(b"Products API", response.content)
