from django.db import models

# Create your models here.


class Recipe(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    rating = models.IntegerField(default=1)
    serves = models.IntegerField(default=1)

    def __str__(self):
        return (
            f"Recipe: "
            + f"name={self.name}, description={self.description}, rating={self.rating}, serves={self.serves}"
        )


class Ingredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    amount = models.IntegerField(default=0)
    amount_unit = models.CharField(max_length=50)

    def __str__(self):
        return (
            f"Ingredient: "
            + f"name={self.name}, amount={self.amount}, amount_unit={self.amount_unit}, recipe_id={self.recipe_id}"
        )


class MenuItem(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)

    def __str__(self):
        return f"MenuItem: " + f"recipe_id={self.recipe_id}, recipe={self.recipe}"
