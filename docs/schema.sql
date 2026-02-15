-- SQL Schema for CalorieItaliane Food Database
-- This schema is designed for a SQLite database.

-- 1. categories Table
-- Stores the high-level food categories (e.g., "Cereali e derivati", "Carni fresche").
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    icon TEXT -- Icon name from Lucide library
);

-- 2. foods Table
-- Stores the main information for each food item.
-- Core nutrients are included as columns for performance in tracking applications.
CREATE TABLE foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_id TEXT, -- The original "id" or "Codice Alimento" from the source
    category_id INTEGER,
    name TEXT NOT NULL,
    scientific_name TEXT,
    english_name TEXT,
    url TEXT, -- Source URL for verification
    information TEXT, -- Additional notes or descriptions
    edible_part_percentage REAL, -- e.g., 94.0 for "94 %"
    portion_value REAL, -- e.g., 150.0 for "150 g"
    portion_unit TEXT, -- e.g., "g" or "ml"
    samples_count INTEGER, -- Number of samples used for analysis
    scraped_at DATETIME,
    
    -- Denormalized "Core" nutrients (per 100g of edible part)
    -- These are the most frequently used values in tracking apps.
    energy_kcal REAL,
    protein_g REAL,
    fat_g REAL,
    carbohydrates_g REAL,
    sugar_g REAL,
    fiber_g REAL,
    sodium_mg REAL,
    
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 3. nutrient_definitions Table
-- Defines all possible nutrients found in the dataset.
-- This handles the "unstructured" nature of the source data by allowing 
-- any number of specific nutrients (vitamins, minerals, amino acids).
CREATE TABLE nutrient_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- e.g., "Magnesio", "Vitamina C"
    unit TEXT, -- e.g., "mg", "μg", "g"
    UNIQUE(name, unit)
);

-- 4. food_nutrients Table
-- Many-to-Many relationship between foods and nutrients.
-- Stores the values per 100g of edible part.
CREATE TABLE food_nutrients (
    food_id INTEGER,
    nutrient_id INTEGER,
    value REAL, -- Numeric value
    is_trace BOOLEAN DEFAULT 0, -- True if the source value was "tr" (tracce)
    PRIMARY KEY (food_id, nutrient_id),
    FOREIGN KEY (food_id) REFERENCES foods(id),
    FOREIGN KEY (nutrient_id) REFERENCES nutrient_definitions(id)
);

-- Indexes for common queries
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_original_id ON foods(original_id);
CREATE INDEX idx_food_nutrients_food_id ON food_nutrients(food_id);
