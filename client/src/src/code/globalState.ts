import { createState } from "@hookstate/core";

export interface IRecipe {
    id?: number,
    name: string,
    description: string,
    rating: number,
    serves: number,
    ingredient_set: Array<IIngredient>
}

export interface IIngredient {
    id?: number,
    name: string,
    amount: number,
    amount_unit: string,
    recipe_id?: number
}

export interface IMenuItem {
    id?: number,
    recipe: number
}

export interface IGlobalState {
    initialLoadComplete: boolean,
    recipes: Array<IRecipe>,
    menuItems: Array<IMenuItem>
}

const gs = createState({
    initialLoadComplete: false as boolean,
    recipes: [] as Array<IRecipe>,
    menuItems: [] as Array<IMenuItem>
} as IGlobalState);
export default gs;

export const getIndexOfRecipeByID = (
    inID: number, inWhichArray: string): number => {
    if (inWhichArray === "recipes") {
        return gs.recipes.get().map(function (inItem) {
            return inItem.id;
        }).indexOf(inID);
    } else {
        return gs.menuItems.get().map(function (inItem) {
            return inItem.recipe;
        }).indexOf(inID);
    }
}