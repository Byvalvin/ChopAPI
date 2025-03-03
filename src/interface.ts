// interfaces.ts
export interface Nation{
    id: number,
    name: string
}
export interface Region{
    id: number,
    name: string,
    nations: string[]
}
export interface Category {
    id: number;
    name: string;
}

export interface Subcategory {
    id: number;
    name: string;
}

export interface Image {
    id: number;
    url: string;
    type: string;
    caption: string;
}

// Ingredient (for the database)
export interface Ingredient {
    id: number;
    name: string;
}

// RecipeIngredient (for the recipe, includes quantity and unit)
export interface RecipeIngredient extends Ingredient {
    quantity: number;
    unit: string;
}

export interface Recipe {
    id: number;
    name: string;
    description: string;
    nation: string;
    region?: string; // Optional
    instructions: string[];
    categories?: Category[]; // Optional
    subcategories?: Subcategory[]; // Optional
    aliases?: string[]; // Optional
    images?: Image[]; // Optional
    time: number;
    cost?: number; // Optional
    ingredients: RecipeIngredient[];
    tips?: string; // Optional
}
