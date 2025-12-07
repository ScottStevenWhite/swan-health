# Meal_Prep_Model.md

## 1. Purpose

Meal prep is **not** a separate feature; it’s a **projection** of the meal plan into:

- Cross-recipe prep tasks (chopping, batch cooking, marinating, etc.)
- Grouped by time windows the household actually has (weekend, evenings)
- Optimized around **equipment**, **storage**, **food safety**, and **waste reduction**

Key ideas:

- Meal prep **never changes**:
  - The nutrient semantics of the MealPlan
  - Who eats what
  - Budget constraints or DietRequirements
- It only changes **when** and **how** work is done:
  - Shift knife work into the weekend
  - Batch-cook beans or grains
  - Pre-chop vegetables within safe windows

The model must:

- Aggregate prep tasks across recipes (“dice 3 sweet potatoes for 2 recipes”)
- Respect equipment constraints (no food processor steps if they don’t have one)
- Respect **food safety constraints** (per ingredient and per step)
- Allow both:
  - “Cook everything from scratch at mealtime”
  - “Do 60–90 min weekend prep + quick assembly during the week”

Meal prep logic lives inside `core-domain` as pure functions:

- Input: `MealPlan` + `HouseholdContext` + `PrepPreferences`
- Output: `PrepSessions`, `PrepTasks`, `PrepIngredientBatches`
- No side effects, no network calls; orchestration happens in the API layer.

---

## 2. Core Concepts

### 2.1 PrepIngredientBatch

A **PrepIngredientBatch** is “prepare X of ingredient Y in form Z within a safe time window.”

```ts
type PrepIngredientBatch = {
  id: string;
  ingredientId: string;        // e.g. "sweet_potato"
  form:
    | 'raw_whole'
    | 'washed'
    | 'peeled'
    | 'medium_dice'
    | 'small_dice'
    | 'slices'
    | 'julienne'
    | 'puree'
    | 'cooked'
    | 'par_cooked'
    | 'marinated'
    | 'portion_packed'
    | 'other';

  quantity: Quantity;          // normalized (g / ml / units)

  uses: PrepUseRef[];          // references back to recipes/steps that consume this batch

  storage: {
    method: 'fridge' | 'freezer' | 'pantry';
    shelfLifeDays: number;     // how long this prep is safe/optimal
  };

  timeWindow: {
    earliestPrepDate: Date;    // derived from first usage - preppableWindow
    latestSafePrepDate: Date;  // min(over all uses, food safety cap)
  };

  foodSafety: {
    riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
    // HIGH: raw meat, poultry, fish, eggs, etc.
    requiresSameDayIfHighRisk: boolean; // true for things we will not prep days in advance
  };
};

type PrepUseRef = {
  recipeId: string;
  recipeStepId: string;
  mealPlanDayId: string;       // or (dayIndex + slotId)
  requiredByDate: Date;        // when this batch must be ready
};
```

Notes:

* `PrepIngredientBatch` exists **across recipes**.

  * e.g., one batch for all medium-diced sweet potatoes used Mon–Wed.
* `timeWindow` is the intersection of:

  * Each step’s `preppableWindow` and
  * Ingredient-level food safety rules.

If food safety and plan windows conflict, we **shrink** the window and potentially drop prep for that ingredient.

---

### 2.2 PrepTask

A **PrepTask** is the user-visible unit of work in a prep session:

```ts
type PrepTask = {
  id: string;
  prepIngredientBatchId: string | null;

  description: string;            // e.g. "Medium dice 3 sweet potatoes"
  instructions: string[];         // step-by-step, optional

  estimatedActiveMinutes: number;
  estimatedTotalMinutes: number;  // includes wait time if relevant

  equipment: EquipmentRequirement[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  canBeParallelized: boolean;

  foodSafetyNotes?: string;       // e.g. "Keep chicken below 4°C, cook within 24h"
};
```

Some tasks map 1:1 to a batch; others are “meta tasks”:

* “Pressure cook 3 cans worth of dried black beans”
* “Blend marinade for 3 recipes”
* “Cook 2 × base recipe of brown rice and freeze 3 portions”

Meta tasks may have `prepIngredientBatchId = null` but still produce or depend on batches.

---

### 2.3 PrepSession

A **PrepSession** is an anchored block of time where tasks are grouped:

```ts
type PrepSession = {
  id: string;
  householdId: string;
  date: Date;                 // concrete date; recurring patterns resolved by planner

  timeWindow: {
    start: string;            // "09:00"
    end: string;              // "11:00"
  };

  tasks: PrepTask[];

  totalActiveMinutes: number;
  totalElapsedMinutes: number;  // after equipment serialization

  equipmentTimeline?: EquipmentTimeline[];
};

type EquipmentTimeline = {
  equipmentId: string;
  blocks: {
    taskId: string;
    startOffsetMinutes: number;
    endOffsetMinutes: number;
  }[];
};
```

Users can configure:

* `preferredPrepDays: DayOfWeek[]` (e.g. Saturday, Sunday)
* `maxPrepMinutesPerSession`
* `maxPrepSessionsPerWeek`
* `prepIntensity`:

  * `NONE` | `LIGHT` | `MODERATE` | `HEAVY`
* `allowWeeknightPrep: boolean`

Planner and Autopilot must **respect these bounds**; prep is not allowed to silently blow up the user’s calendar.

---

### 2.4 Recipe Integration: Preppable Steps

Recipes define **steps**, some of which are “preppable”:

```ts
type RecipeStep = {
  id: string;
  order: number;
  description: string;

  ingredientUsages: RecipeIngredientUsage[]; // references + quantities

  isPreppable: boolean;                      // true if can be done >= minLeadTimeHours ahead
  preppableWindowDays?: number;              // max days before usage (soft cap)
  requiresEquipment?: EquipmentRequirement[];

  foodSafety: {
    riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
    // upper bound on how far in advance, even if preppableWindowDays is large
    maxLeadTimeHours?: number;               // e.g. 24h for raw poultry marinade
    mustStayChilled?: boolean;               // e.g. "keep below 4°C"
  };
};
```

Examples:

* `isPreppable = true`:

  * “Medium dice sweet potatoes”
  * “Cook a big pot of black beans”
  * “Blend sauce and store in fridge 3–4 days”
* `isPreppable = false`:

  * “Sear steak”
  * “Toast bread”
  * “Add avocado slices”

Safety:

* For `HIGH`-risk tasks (raw meat, eggs, fish), we apply stricter caps via `maxLeadTimeHours` even if `preppableWindowDays` is large.
* If recipe data is missing `foodSafety` for a step with risky ingredients, we **default to conservative behavior**:

  * Treat as **not preppable**, or
  * Restrict to very short lead times (same day).

---

### 2.5 EquipmentRequirement

```ts
type EquipmentRequirement = {
  equipmentId: string;           // "food_processor", "instant_pot", "sheet_pan", ...
  optional: boolean;             // true if can be done manually (slower)
  speedMultiplierIfAvailable: number; // e.g. 0.4 = 60% time reduction
};
```

Planner and prep generator will:

* Exclude tasks requiring **non-optional** equipment the household doesn’t have.
* Degrade to slower variants when `optional = true` and equipment is missing:

  * Increase `estimatedActiveMinutes` using `1 / speedMultiplierIfAvailable`.
* Avoid planning overlapping usage of a single piece of equipment inside a session, via `equipmentTimeline`.

---

## 3. Generating Prep from a Meal Plan

### 3.1 Inputs

* `MealPlan` for 1–6 weeks (with recipes, days, slots, serving sizes)

* `RecipeSteps` and `RecipeIngredientUsage`

* Household equipment inventory

* Household prep preferences:

  ```ts
  type PrepPreferences = {
    enableMealPrep: boolean;
    preferredPrepDays: DayOfWeek[];
    maxPrepMinutesPerSession: number;
    maxPrepSessionsPerWeek: number;
    allowWeeknightPrep: boolean;
    prepIntensity: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY';
  };
  ```

* Food safety metadata for ingredients (e.g., risk categories, safe storage durations)

The generator **never modifies** the MealPlan; it only derives PrepSessions. If something can’t be prepped safely (or within user prep limits), it stays as a regular cooking step at mealtime.

---

### 3.2 Algorithm (High-Level)

1. **Collect Preppable Usages**

   For each `MealPlanDay` and `slot`:

   * For each recipe:

     * For each `RecipeStep` where:

       * `isPreppable = true`, and
       * `preppableWindowDays` and `foodSafety.maxLeadTimeHours` allow prep before that meal:

         * For each `ingredientUsage` in that step:

           * Compute **scaled quantity** (after Family Scaling).
           * Create a candidate `PrepIngredientUsageInstance`:

             ```ts
             type PrepIngredientUsageInstance = {
               ingredientId: string;
               form: string;              // representation mapping from step
               quantity: Quantity;
               targetMealDayId: string;
               recipeId: string;
               stepId: string;
               earliestPrepDate: Date;
               latestSafePrepDate: Date;
               riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
             };
             ```

2. **Cluster into PrepIngredientBatches**

   * Group usage instances by:

     * `(ingredientId, form, storage.method, riskCategory, timeWindowBucket)`
   * For each cluster:

     * Intersect all `[earliestPrepDate, latestSafePrepDate]` windows.
     * If the intersection is empty:

       * Do **not** create a batch; all usages fall back to day-of cooking.
     * Otherwise:

       * Sum quantities.
       * Create one `PrepIngredientBatch` with that combined time window.

3. **Create PrepTasks**

   * For each `PrepIngredientBatch`:

     * Create a `PrepTask` with:

       * Human-readable description (“Medium dice 3 sweet potatoes”).
       * Time estimates (from ingredient/time tables + equipment multipliers).
       * Equipment requirements (from associated steps).
       * `foodSafetyNotes` when relevant.

   * Additional meta tasks (optional):

     * Batch-cook beans or grains.
     * Prepare large pots of soup/chili to be portioned and frozen.

4. **Assign to PrepSessions**

   * For each week of the plan:

     * Identify eligible prep days from `preferredPrepDays`.
     * Respect `allowWeeknightPrep` for non-weekend days.

   * Create sessions as needed:

     * Start with one session per preferred day.
     * Each session has:

       * `maxPrepMinutesPerSession` active time cap.
     * Sort tasks by:

       * `latestSafePrepDate` (tasks with tighter windows first).
       * “Criticality” (ingredients used early in the week first).
       * Risk category (HIGH-risk tasks placed nearer to usage).

   * Greedy assignment:

     * Place tasks into sessions within `[earliestPrepDate, latestSafePrepDate]`.
     * Ensure cumulative **active** time ≤ `maxPrepMinutesPerSession`.
     * Inside each session, compute `equipmentTimeline` and adjust `estimatedTotalMinutes`.

   * Overflow tasks:

     * Move to another valid session within their safe window.
     * If there is no valid session (due to time/frequency constraints):

       * Mark them as **day-of tasks** (prep at mealtime).
       * Flag them for UI so user isn’t surprised.

5. **Resolve Equipment Conflicts**

   * Within a session:

     * Build `EquipmentTimeline` per equipment item.
     * If overlapping:

       * Serialize conflicting tasks.
       * Recompute `totalElapsedMinutes`.
     * If `totalElapsedMinutes` significantly exceeds session window:

       * Suggest:

         * “Move task X to Tuesday evening prep”
         * Or “Disable prep for recipe Y”
       * Mark these suggestions for UI and/or Autopilot (if allowed to adjust).

---

## 4. Waste, Cost & Eco Hooks

Prep is an obvious lever for **waste reduction**, **cost**, and later **eco** improvements, but it must respect health and budget constraints.

* **Waste Reduction**

  * When forming batches, the model can:

    * Round up quantities to use entire units (e.g., whole onion) **if**:

      * Those extra amounts are used in other recipes, or
      * Can be allocated to “use-up” recipes later in the week.
    * Detect leftover prepped ingredients:

      * Create “use-up” tasks (“Make frittata with leftover roasted veg”).
      * Expose these to the planner & eco module.

* **Cost Awareness**

  * Prep can bias towards:

    * Batch cooking ingredients that are cheaper in bulk (beans, grains).
    * Freezing leftovers to reduce waste (instead of tossing).
  * When Autopilot or planner propose plan changes for cost:

    * Prep sessions are regenerated from the new MealPlan.
    * Prep never independently tries to change recipes for cost reasons.

* **Eco (Future)**

  * EcoProfile can influence:

    * Preference for frozen vs fresh produce for low-waste households.
    * Encouraging freezer use for leftovers.
  * All eco improvements must **stay within**:

    * DietRequirements,
    * Strict budgets,
    * Food safety constraints.

---

## 5. Food Safety Invariants

We do **not** let prep logic improvise around food safety. Hard rules:

1. **Risk-aware windows**

   * For `HIGH`-risk items, we enforce a maximum lead time based on ingredient and step metadata (e.g., raw poultry marinade ≤ 24–36h).
   * If metadata is missing, default to conservative assumption:

     * Same-day or very short lead time.

2. **No prep outside safe window**

   * If a batch’s intersected `[earliestPrepDate, latestSafePrepDate]` is empty:

     * We do **not** schedule a prep task.
     * Steps remain day-of cooking steps.

3. **No unsafe storage suggestions**

   * Storage method (`fridge`/`freezer`/`pantry`) + `shelfLifeDays` are derived from ingredient safety data.
   * Prep never suggests:

     * Leaving cooked food at room temp as storage.
     * Keeping high-risk prepped foods beyond safe durations.

4. **Explainability**

   * For every task we **don’t** prep (because of safety), we can explain:

     * “Cannot be prepped in advance: high-risk ingredient with max 12h lead time.”

These constraints are non-negotiable and are treated like DietRequirements: Autopilot and planner are not allowed to override them for cost, eco, or convenience.

---

## 6. Handling Missing Data

* If **family scaling data** is missing:

  * Assume **default per-person portions** proportional to age group:

    ```text
    Adult:   1.0
    Teen:    0.9
    Kid:     0.7
    Toddler: 0.5
    ```

* If we don’t know ages:

  * Treat all as “generic adult” (1.0).

* If ingredient food safety metadata is missing:

  * Default to **conservative**:

    * `riskCategory = 'MEDIUM'`
    * Shorter `shelfLifeDays`
    * Smaller `maxLeadTimeHours`
  * Prefer keeping steps as day-of cooking rather than shifting them to prep.

Prep quantities and schedules are then derived from these defaults; results are deterministic and biased toward safety rather than over-optimization.

---

## 7. Relationship to Planner & Autopilot

* The Meal Planner decides **what** to cook and **who** eats it.
* The Family Scaling Engine decides **how much** each person gets.
* The Meal Prep model decides **when** prep work happens and **how** to group it, subject to:

  * MealPlan,
  * DietRequirements,
  * Budget strictness,
  * EcoProfile,
  * Food safety constraints,
  * User prep preferences.

Autopilot can:

* Ask the planner to alter future MealPlans under strict constraints.
* Then re-run prep generation.

Autopilot **cannot**:

* Bypass food safety rules.
* Force prep to exceed `maxPrepMinutesPerSession` or prep intensity settings.
* Change the meaning of meals (nutrient composition, DietRequirements) via prep.

We keep prep as an **explainable projection** on top of the plan, not a hidden second planner.
