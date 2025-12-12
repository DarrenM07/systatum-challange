from django.db import models


class Product(models.Model):
    fields = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        name = self.fields.get("name")
        if isinstance(name, str) and name:
            return name
        return f"Product {self.pk}"
