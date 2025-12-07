# Meal_Planning_Algorithm.md

## 1. Purpose

The Meal Planning Algorithm turns:

- Household members (1 to ~100)
- Their goals, constraints, and preferences
- A recipe pool of **parametric recipes**
- Time windows, equipment, and budgets

into a **multi-week MealPlan** that:

- Hits energy, macro, and critical micronutrient targets per person (within tolerances)
- Stays within **strict** budgets when configured
- Respects DietRequirements and Required diet patterns
- Minimizes waste and prep pain
- Produces **one set of cooking instructions** + portioning per person

This algorithm is used for:

- Initial plan creation
- User-driven plan edits
- Autopilot adjustments (with additional safety bounds)

It must:

- Degrade gracefully when data is missing (defaults)
- Scale to many people
- Be **explainable and deterministic** given a `randomSeed`

No black-box ML; this is constrained local search + domain rules.

---

## 2. Inputs & Defaults

### 2.1 Per Person

```ts
type PersonContext = {
  personId: string;

  age?: number;
  sex?: 'MALE' | 'FEMALE' | 'OTHER';
  weightKg?: number;
  heightCm?: number;

  temporaryStates: TemporaryState[];      // pregnancy, surgery recovery, training, etc.
  goalSet?: GoalSet;                      // energy, macros, key micros (versioned)

  dietProfile?: DietProfile;
  dietRequirements?: DietRequirement[];

  safeEnergyFloorKcal?: number;          // optional hard floor per day (from domain)
  safeEnergyCeilingKcal?: number;        // optional hard ceiling per day (rare)
};
```

**Missing data handling:**

* If `goalSet` missing:

  * Compute using:

    * If age/sex/weight present → Mifflin-St Jeor (or similar).
    * Else:

      * Assume “average adult”:

        * 2000 kcal, 90g protein, 250–275g carbs, 70–80g fat.
* If `dietProfile` missing:

  * Default to **OMNIVORE** with no preferences.
* If `dietRequirements` missing:

  * Assume none; planner still has global safety defaults (e.g., avoid ridiculous sodium, trans fats).
* If safe floors/ceilings missing:

  * Domain provides conservative defaults based on age & states:

    * E.g., no aggressive deficits for kids or pregnancy.
  * Planner treats floors as **hard constraints** when Autopilot is active.

This ensures we always have **some** target to plan against, with guardrails.

---

### 2.2 Household Context

```ts
type HouseholdContext = {
  householdId: string;
  members: PersonContext[];

  budget?: Budget;               // weekly/monthly, can be strict or flexible
  ecoProfile?: EcoProfile;       // optional, soft constraints only

  equipment: string[];           // oven, food_processor, instant_pot, ...

  calendar: CalendarConstraints; // busy days, eat-out days, holiday tags
  prepPrefs: PrepPreferences;    // from Meal_Prep_Model
};
```

If budget missing → no hard budget constraint; we still estimate cost and show it. EcoProfile never overrides medical or strict budget rules.

---

### 2.3 Planner Configuration

Both user-triggered planning and Autopilot runs use a `PlannerConfig`:

```ts
type PlanScoreWeights = {
  nutrition: number;
  budget: number;
  waste: number;
  variety: number;
  eco: number;
  simplicity: number;
};

type PlannerHardConstraints = {
  enforceStrictBudget: boolean;
  respectDietRequirements: boolean;
  respectRequiredPatterns: boolean;
  safeEnergyFloors: { [personId: string]: number | undefined };
  safeEnergyCeilings: { [personId: string]: number | undefined };
};

type PlannerConfig = {
  randomSeed: number;
  maxLocalSearchSteps: number;
  hardConstraints: PlannerHardConstraints;
  scoreWeights: PlanScoreWeights;

  maxRecipeSwapsPerWeek: number;
  maxPortionAdjustmentsPerWeek: number;
  maxTweakPercentPerRecipe: number;   // upper bound across tweaks
};
```

Autopilot sets:

* `enforceStrictBudget = budget.strict`
* `safeEnergyFloors`/`Ceilings` from domain + user states
* Bounds (`maxRecipeSwapsPerWeek`, etc.) from `AutopilotConfig`.

User-driven planning can use looser bounds but still respects diet/budget safety.

---

### 2.4 Parametric Recipes

Recipes are **templates** that support small, controlled tweaks.

```ts
type RecipeTemplate = {
  id: string;
  name: string;
  baseServings: number;

  ingredients: ParametricIngredient[];
  steps: RecipeStep[];        // shares type with Meal_Prep_Model
  tags: string[];             // patterns, kid-friendly, etc.
  dietCompatibility: DietTag[];  // vegan, vegetarian, glutenFree, etc.
  equipmentRequired: EquipmentRequirement[];

  tweakConfig: TweakConfig;   // what we’re allowed to change
};
```

#### ParametricIngredient

```ts
type ParametricIngredient = {
  ingredientId: string;
  baseQuantity: Quantity;      // 1 onion, 200g rice, etc.

  role:
    | 'FLAVOR_CORE'
    | 'STRUCTURAL'
    | 'BULK_CARB'
    | 'BULK_PROTEIN'
    | 'BULK_VEG'
    | 'GARNISH';

  tweakRange: {
    minFactor: number;         // e.g. 0.5 → can halve quantity
    maxFactor: number;         // e.g. 1.5 → can increase by 50%
    step: number;              // smallest tweak (e.g. 0.25 onion)
  };

  mustRemain: boolean;         // e.g. onion: true
  substitutionGroupId?: string;// e.g. "onions": [yellow, red, white]
};
```

This lets us:

* Change “1 onion” to 0.5 or 1.5 onions (subject to `minFactor`/`maxFactor`)
* Swap yellow ↔ red onion if in same `substitutionGroupId`
* Adjust bulk components (rice, beans, veg, etc.) more widely

#### TweakConfig

```ts
type TweakConfig = {
  maxTotalTweakPercent: number;       // overall closeness to original (e.g. 20%)
  coreFlavorLock: boolean;           // if true, FLAVOR_CORE cannot drop below e.g. 0.75

  allowedSubstitutions: {
    [substitutionGroupId: string]: {
      allowedTargets: string[];      // ingredientIds allowed
      maxSwapsPerRecipe: number;
    };
  };
};
```

Constraints:

* Tweaks **must not**:

  * Break DietRequirements (e.g., introduce gluten for celiac).
  * Break Required patterns (e.g., introduce animal products into a vegan-required plan).
* Planner enforces this by running tweaks through the same compatibility predicates used for recipe filtering.

---

## 3. Outputs

```ts
type PlannedMeal = {
  dayIndex: number;                  // offset in plan
  slot: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'CUSTOM';

  recipeInstance: RecipeInstance;    // resolved ingredients and quantities
  servingConfig: ServingConfig;      // from Family Scaling Engine
  supplementAssignments: SupplementAssignment[];

  isAnchored: boolean;               // user-locked, Autopilot can’t change
};

type MealPlan = {
  id: string;
  householdId: string;
  weeks: number;

  meals: PlannedMeal[];
  metrics: PlanMetrics;              // nutrition, cost, eco, variety, etc.
  score: PlanScore;                  // derived from metrics + weights

  version: number;                   // for optimistic locking
};
```

`RecipeInstance` = `RecipeTemplate` + chosen tweaks (quantities/substitutions).

`ServingConfig` & `SupplementAssignment` come from Family Scaling + supplement scheduling.

---

## 4. Plan Metrics & Score

```ts
type PlanMetrics = {
  perPersonNutritionError: {
    [personId: string]: {
      avgDailyEnergyErrorPct: number;
      avgDailyProteinErrorPct: number;
      // etc
    };
  };

  budget: {
    estimatedTotal: Money;
    budgetScope: BudgetScope;
    budgetAmount?: Money;
    overUnderAbsolute?: Money;
    overUnderPercent?: number;
    hasStrictBudgetViolation: boolean;
  };

  waste: {
    wasteRiskScore: number;          // 0–100; higher = more risk
    highRiskIngredients: string[];   // ingredientIds
  };

  eco?: {
    estimatedCO2Kg?: number;
    packagingScore?: number;
  };

  variety: {
    uniqueRecipesCount: number;
    maxConsecutiveRepeats: number;
  };

  complexity: {
    avgCookTimeMinutes: number;
    maxDailyCookTimeMinutes: number;
  };
};

type PlanScore = {
  nutritionScore: number;      // 0–100
  budgetScore: number;         // 0–100
  wasteScore: number;          // 0–100 (lower waste → higher score)
  varietyScore: number;        // 0–100
  ecoScore: number;            // 0–100
  simplicityScore: number;     // 0–100

  overall: number;             // weighted combination using PlanScoreWeights
};
```

* `hasStrictBudgetViolation = true` is treated as a **hard constraint failure** when `enforceStrictBudget` is on; we do not accept such plans for Autopilot or “confident recommend” flows.

---

## 5. Algorithm Overview

We treat planning as **constrained local search** with clear hard constraints:

1. **Precompute per-person targets & safe bounds**
2. **Filter recipe pool** → candidate recipes per slot
3. **Seed a baseline plan** (simple heuristics)
4. **Run family scaling** to get per-person portions
5. **Evaluate plan**: nutrition, cost, constraints, eco, variety
6. **Iterate with local improvements**:

   * Swap recipes
   * Adjust portions
   * Apply recipe tweaks (within tolerance)
7. **Generate prep sessions** (using Meal_Prep_Model)
8. **Expose plan + controls to user / Autopilot**

Autopilot is just a caller that supplies:

* Stricter bounds
* Hard enforcement of budget and safe energy floors
* A `randomSeed` stored in `AutopilotChange` for determinism.

---

## 6. Step-by-Step Algorithm

### 6.1 Precompute Targets & Safe Bounds

For each `PersonContext`:

1. If `goalSet` present → use it (respecting version).
2. Else compute:

   * Energy target via BMR formula if possible.
   * Macros:

     * Protein: `0.8–1.2 g/kg` if weight known, else `90g`.
     * Carbs: `45–55%` of calories.
     * Fat: `25–35%` of calories.
3. Apply `TemporaryStates`:

   * Pregnancy, training, surgery recovery, etc. adjust energy/micros.
4. Derive **safe energy floors/ceilings** (domain side):

   * Floors are hard constraints for:

     * Children, pregnant/lactating, surgery recovery, underweight states.
   * Ceilings might exist in rare medical contexts (to avoid excessive surplus).

Store:

```ts
type PersonTargets = {
  personId: string;
  dailyEnergyTargetKcal: number;
  dailyProteinTargetG: number;
  // ...
  safeEnergyFloorKcal: number | null;
  safeEnergyCeilingKcal: number | null;
};
```

These feed the planner and the Family Scaling Engine.

---

### 6.2 Filter Recipe Pool

For each recipe:

1. **Hard filters:**

   * Must satisfy all applicable **HARD** DietRequirements across the household:

     * NO_GLUTEN, NO_NUTS, etc.
     * Medical sodium caps, etc. (via constraint checks).
   * Must respect **Required** diet patterns:

     * E.g., vegan-required households cannot get non-vegan recipes.
   * Must not require equipment that household lacks (unless `optional = true`).

2. **Soft filters / scoring:**

   * DietPreferences alignment:

     * Patterns (Vegan/Mediterranean/etc.).
     * Ingredient likes/dislikes.
   * Time & complexity:

     * Avoid 4 very complex dinners in a row on busy weekdays.
   * Eco & waste considerations (if EcoProfile active):

     * Favor recipes that reuse ingredients already in the plan.

Result: a `CandidateRecipeSet` with per-slot tags (Breakfast/Lunch/Dinner/Snack) and precomputed compatibility scores.

---

### 6.3 Seed Baseline Plan

We want something simple but not idiotic:

1. Decide plan length: e.g. 2–4 weeks.
2. For each day & slot:

   * Determine which persons **participate** (some may skip breakfast).
   * Choose a candidate recipe:

     * Prefer high-protein options for main meals.
     * Avoid excessive repetition:

       * By default: no more than N uses/week unless pattern explicitly allows.
3. Maintain rough per-day energy alignment:

   * Track household total energy vs sum of targets.
   * If too low → pick more calorie-dense recipes or add a snack.
   * If too high → pick lighter options or skip a snack.

At this stage, we **ignore** fine-grained micros and perfect cost alignment; we avoid obviously bad solutions.

---

### 6.4 First-Pass Family Scaling

Call the **Family Scaling Engine** (see `Family_Scaling_Engine.md`) with:

* Seed plan (chosen recipes per day/slot)
* PersonTargets
* Participation info

Get back:

* For each meal:

  * `totalServings`
  * `perPersonServings`
  * Initial plate instructions (which we can refine later)

Now we have initial per-person calorie/macro estimates from the plan.

---

### 6.5 Evaluate Plan

Compute **PlanMetrics**:

1. **Per Person Nutrition**

   * Daily/weekly energy and macro errors vs targets.
   * Coverage of key micros (iron, calcium, vitamin D, fiber, etc.) over the plan window.

2. **Household Budget**

   * Generate ShoppingList from:

     * RecipeInstance ingredients × Family Scaling.
   * Estimate cost (using cost logic).
   * Compare to budget:

     * If `budget.strict = true` and estimated cost > budgetAmount × tolerance:

       * Mark `hasStrictBudgetViolation = true`.

3. **Waste Risk**

   * Identify ingredients:

     * Used once in small quantity.
     * Known high-waste historically (via WasteLog).
   * Compute `wasteRiskScore`.

4. **Eco (if EcoProfile active)**

   * Approximate CO₂ and packaging for the plan (when data is available).

5. **Variety & Complexity**

   * Count unique recipes.
   * Max consecutive repeats of the same recipe or pattern.
   * Cook time per day and per week.

Compute **PlanScore** using `PlanScoreWeights` with the rule:

* If `enforceStrictBudget` and `hasStrictBudgetViolation` → budgetScore forced low and flagged.
* DietRequirement violations are treated as **invalid** (plan is rejected, not just scored).

---

### 6.6 Local Search & Improvement

We run a bounded local search (deterministic under `randomSeed`):

#### 6.6.1 Operations

1. **Recipe Swap**

   * Pick one day/slot, swap recipe to another candidate.
   * Re-run Family Scaling for that meal/day.
   * Recompute only local metrics & global score delta.

2. **Portion Adjustment**

   * For a given meal, adjust `totalServings` by small increments (e.g., ±1 base serving).
   * Re-run scaling for that meal only.
   * Check effect on:

     * Per-person energy/macros vs targets.
     * Cost & waste.

3. **Recipe Tweaks (Parametric)**

   * Adjust ingredient quantities within `tweakRange` and `maxTotalTweakPercent`.
   * Swap within substitution groups (yellow ↔ red onion).
   * Recompute local:

     * Nutrients.
     * Cost.
     * Waste risk.

   Tweaks must **always** pass DietRequirement and Required-pattern filters.

4. **Meal Pattern Tweaks**

   * Use “pattern meals” (e.g., oats + fruit + protein) to cheaply fix macro imbalances without adding complexity.
   * Patterns are also subject to diet & budget rules.

#### 6.6.2 Search Strategy

* Initialize PRNG with `randomSeed`.
* For `step = 1..maxLocalSearchSteps`:

  1. Pick an operation using heuristics + pseudo-randomness:

     * Nutrient deficits → nutrition-focused changes.
     * Over-budget → cost-focused changes.
     * High waste → reuse-oriented changes.
  2. Apply operation, recompute **local** metrics.
  3. Check constraints:

     * No DietRequirement violation.
     * No Required-pattern violation.
     * If `enforceStrictBudget` → no new strict budget violation.
     * No person’s **expected average** energy falls below `safeEnergyFloorKcal` across the plan window (approximation).
  4. If constraints hold and PlanScore improves by a threshold:

     * Accept change.
     * Update plan & metrics.
  5. Otherwise:

     * Revert and continue.

We also enforce bounds from `PlannerConfig`:

* `maxRecipeSwapsPerWeek`
* `maxPortionAdjustmentsPerWeek`
* `maxTweakPercentPerRecipe`

Autopilot calls this algorithm with conservative bounds; user-driven planning can relax them.

Hard constraints that **cannot** be violated:

* DietRequirements (allergies, celiac, etc.).
* Required diet patterns.
* Strict budgets (when configured).
* Safe energy floors for vulnerable populations (kids, pregnancy, severe illness).
* Equipment availability.

---

### 6.7 Integration with Meal Prep & Serving Instructions

Once plan is “good enough”:

1. Call **Family Scaling Engine** final pass:

   * Refine per-person portions and plate instructions.
2. Annotate each `PlannedMeal` with:

   * Plate-level instructions (“Dad: 600g chili + 1 toast + multivitamin”).
   * Per-person nutrient summaries.
3. Generate **PrepSessions** using Meal_Prep_Model:

   * Optionally bias some plan decisions (e.g., between equally good recipes) toward those that:

     * Reuse ingredients.
     * Work well with existing equipment and prep preferences.

Prep is a projection; it does **not** change who eats what or the underlying nutrition/cost semantics.

---

## 7. Autopilot Integration

Autopilot uses the Meal Planning Algorithm, but with extra invariants:

* Supplies a `PlannerConfig` derived from `AutopilotConfig`:

  * `maxRecipeSwapsPerWeek`, `maxPortionAdjustmentsPerWeek`, etc.
* Sets `enforceStrictBudget = budget.strict`.
* Supplies `safeEnergyFloors` (and ceilings where needed).

Each Autopilot run:

* Logs:

  * `plannerRandomSeed` (the `randomSeed` used)
  * Input plan version
  * PersonTargets version
  * AutopilotConfig version
* Produces 0..N plan modifications:

  * Each captured as `AutopilotChange` with a `PlanChangeExplanation`.

If:

* The plan version changed before apply → change marked `SKIPPED` with `STALE_VERSION`.
* Constraints conflict → change marked `SKIPPED` with `CONSTRAINT_CONFLICT` and surfaced to user.

Autopilot never:

* Violates DietRequirements or Required patterns.
* Intentionally exceeds strict budgets.
* Pushes expected daily energy below safe floors for children, pregnant/lactating people, or other flagged states.

---

## 8. Scaling to Many People (1–100+)

Complexity:

* Per-person targets: O(P).
* Per-day evaluation: O(P × mealsPerDay).
* Local operations:

  * Work on 1 or a small number of meals at a time.
  * Re-evaluate only local slices.

For P up to ~100 and plan length up to 6 weeks:

* `maxLocalSearchSteps` is bounded (e.g. <= 500).
* The algorithm remains tractable, especially with incremental recomputation.

We intentionally avoid global combinatorial search. The point is **good and explainable**, not “perfect but opaque”.

---

## 9. Failure & Degradation Modes

If:

1. **Too few recipes** satisfy constraints:

   * Planner surfaces:

     * “We only have 3 recipes that fit your requirements; add more or relax constraints.”
   * Returns a partial or low-score plan, clearly marked.

2. **Budget is impossible** with constraints:

   * With strict budget:

     * Return best effort plan +:

       * “Strict budget cannot be met with current constraints; you are at +$X/week.”
   * Planner doesn’t silently ignore strict budget; it surfaces infeasibility.

3. **Safe energy floors conflict with constraints** (e.g., strict budget + high needs):

   * Planner explains:

     * “Safe minimum energy requirements for these members cannot be met under the current budget and constraints.”

4. **Missing data**:

   * We fall back to conservative defaults:

     * “Average adult” targets.
     * Omnivore diet.
     * Strict application of DietRequirements.
   * UI shows:

     * “Using defaults until you provide more details.”

The algorithm **fails loudly** on constraint conflicts; it does not silently break invariants.

---

If you actually grok this, you should be able to explain back:

* How strict budgets and safe energy floors show up as hard constraints in the search,
* And why Autopilot can’t “cheat” around them.
