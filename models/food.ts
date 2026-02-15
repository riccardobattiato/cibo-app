export interface FoodCategory {
  id: number;
  name: string;
}

export interface Food {
  id: number;
  original_id: string | null;
  category_id: number | null;
  name: string;
  scientific_name: string | null;
  english_name: string | null;
  url: string | null;
  information: string | null;
  edible_part_percentage: number | null;
  portion_value: number | null;
  portion_unit: string | null;
  samples_count: number | null;
  scraped_at: string | null;

  // Denormalized core nutrients
  energy_kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbohydrates_g: number | null;
  sugar_g: number | null;
  fiber_g: number | null;
  sodium_mg: number | null;
}

export interface FoodWithCategory extends Food {
  category_name: string | null;
}

export interface FoodNutrientDefinition {
  id: number;
  name: string;
  unit: string | null;
}

export interface FoodNutrient {
  food_id: number;
  nutrient_id: number;
  value: number | null;
  is_trace: boolean;
}

export interface FoodNutrientWithDefinition extends FoodNutrient {
  name: string;
  unit: string | null;
}
