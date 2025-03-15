from django.shortcuts import render

from django.http import HttpResponse
from rest_framework import status
from rest_framework.response import Response
import rest_framework.generics
import json
from restapi.models import Ingredient, MenuItem, Recipe
from restapi.serializers import MenuItemSerializer, RecipeSerializer

# Create your views here.

class RecipeListCreateAPIView(rest_framework.generics.ListCreateAPIView):
    """This endpoint allows for listing all recipes in the database (GET),
    or creating one (POST)"""
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            recipe = serializer.save()
            serializer = RecipeSerializer(recipe)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class RecipeUpdateDeleteAPIView(rest_framework.generics.RetrieveUpdateDestroyAPIView):
    """This endpoint allows for updating a recipe by passing in the ID to update"""
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

class MenuItemListCreateAPIView(rest_framework.generics.ListCreateAPIView):
    """This endpoint lists all menu items in the database"""
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer    

class MenuItemDeleteAPIView(rest_framework.generics.DestroyAPIView):
    """This endpoint allows for deleting a menu item from the database by
    passing the ID to delete"""    
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

def make_shopping_list(request):
    menuitems = MenuItem.objects.all()    
    dict_shopping_list = {}
    for menuitem in menuitems:
        print(menuitem)
        ingredients = Ingredient.objects.filter(recipe_id=menuitem.recipe_id)
        print(ingredients)
        for ingredient in ingredients:
            print(ingredient)
            key = ingredient.name.lower() + ingredient.amount_unit.lower()
            if key in dict_shopping_list:
                print(dict_shopping_list[key])
                dict_shopping_list[key]["amount"] = dict_shopping_list[key]["amount"] + ingredient.amount
            else:
                dict_shopping_list[key] = {
                    "name": ingredient.name, 
                    "amount_unit": ingredient.amount_unit, 
                    "amount": ingredient.amount
                }        
        
        print("dict_shopping_list", dict_shopping_list)
        
    arr_shopping_list = []
    for ingredient in dict_shopping_list:
        arr_shopping_list.append(dict_shopping_list[ingredient])
    print("arr_shopping_list", arr_shopping_list)    

    return HttpResponse(json.dumps(arr_shopping_list, indent=4))    