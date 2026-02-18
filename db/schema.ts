import { sqliteTable, text, integer, real, primaryKey, index } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable(
  'categories',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull().unique(),
    icon: text(),
  },
  (table) => [index('idx_categories_name').on(table.name)]
);

export const foods = sqliteTable(
  'foods',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    original_id: text(),
    category_id: integer().references(() => categories.id),
    name: text().notNull(),
    scientific_name: text(),
    english_name: text(),
    url: text(),
    information: text(),
    edible_part_percentage: real(),
    portion_value: real(),
    portion_unit: text(),
    samples_count: integer(),
    scraped_at: text(),
    energy_kcal: real(),
    protein_g: real(),
    fat_g: real(),
    carbohydrates_g: real(),
    sugar_g: real(),
    fiber_g: real(),
    sodium_mg: real(),
  },
  (table) => [
    index('idx_foods_name').on(table.name),
    index('idx_foods_original_id').on(table.original_id),
  ]
);

export const nutrientDefinitions = sqliteTable(
  'nutrient_definitions',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    unit: text(),
  },
  (table) => [index('idx_nutrient_definitions_unique').on(table.name, table.unit)]
);

export const foodNutrients = sqliteTable(
  'food_nutrients',
  {
    food_id: integer()
      .notNull()
      .references(() => foods.id),
    nutrient_id: integer()
      .notNull()
      .references(() => nutrientDefinitions.id),
    value: real(),
    is_trace: integer({ mode: 'boolean' }).default(false),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.food_id, table.nutrient_id] }),
    foodIdIdx: index('idx_food_nutrients_food_id').on(table.food_id),
  })
);

export const userCategories = sqliteTable(
  'user_categories',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull().unique(),
    icon: text(),
  },
  (table) => [index('idx_user_categories_name').on(table.name)]
);

export const userFoods = sqliteTable(
  'user_foods',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    category_id: integer(),
    is_category_custom: integer({ mode: 'boolean' }).default(false),
    source_food_id: integer().references(() => foods.id),
    name: text().notNull(),
    scientific_name: text(),
    english_name: text(),
    information: text(),
    edible_part_percentage: real(),
    portion_value: real(),
    portion_unit: text(),
    energy_kcal: real(),
    protein_g: real(),
    fat_g: real(),
    carbohydrates_g: real(),
    sugar_g: real(),
    fiber_g: real(),
    sodium_mg: real(),
  },
  (table) => [index('idx_user_foods_name').on(table.name)]
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Food = typeof foods.$inferSelect;
export type NewFood = typeof foods.$inferInsert;
export type NutrientDefinition = typeof nutrientDefinitions.$inferSelect;
export type NewNutrientDefinition = typeof nutrientDefinitions.$inferInsert;
export type FoodNutrient = typeof foodNutrients.$inferSelect;
export type NewFoodNutrient = typeof foodNutrients.$inferInsert;
export type UserCategory = typeof userCategories.$inferSelect;
export type NewUserCategory = typeof userCategories.$inferInsert;
export type UserFood = typeof userFoods.$inferSelect;
export type NewUserFood = typeof userFoods.$inferInsert;
