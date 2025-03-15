from rest_framework import serializers
from restapi.models import Ingredient, MenuItem, Recipe

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ("id", "name", "amount", "amount_unit")


class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = "__all__"        
        
    ingredient_set = IngredientSerializer(many=True)

    def create(self, validated_data):
        ingredient_validated_data = validated_data.pop("ingredient_set")
        recipe = Recipe.objects.create(**validated_data)
        ingredient_set_serializer = self.fields["ingredient_set"]
        for each in ingredient_validated_data:
            each["recipe"] = recipe
        ingredient_set_serializer.create(ingredient_validated_data)
        return recipe
    
    def update(self, instance, validated_data):
        instance.name = validated_data["name"]
        instance.description = validated_data["description"]
        instance.rating = validated_data["rating"]
        instance.serves = validated_data["serves"]
        instance.save()
        for ingredient in instance.ingredient_set.all():
            ingredient.delete()
        ingredient_set_serializer = self.fields["ingredient_set"]
        ingredient_validated_data = validated_data.pop("ingredient_set")
        for each in ingredient_validated_data:
            each["recipe"] = instance
        ingredient_set_serializer.create(ingredient_validated_data)
        return instance
    
class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = "__all__"