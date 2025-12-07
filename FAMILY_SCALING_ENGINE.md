# Family_Scaling_Engine.md

## 1. Purpose

The Family Scaling Engine takes:

- A set of people (1–100+)
- Their calorie, macro, and critical micronutrient targets
- A meal (recipe + base serving size)

and outputs:

- How big the batch should be (total quantity)
- How much each person should eat
- A **plate-level instruction** object:

> “Cook once, everyone plates differently, and numbers still make sense.”

It must:

- Respect DietRequirements (no cross-contamination for allergies).
- Respect meal- and day-level energy bounds (when provided).
- Work with missing data via sane defaults.
- Avoid “silly” results (toddler portion > adult portion for same dish).
- Be simple, deterministic, and stateless.

Scaling logic lives entirely in `core-domain` as pure functions.

---

## 2. Inputs & Outputs

### 2.1 Inputs

For a given meal:

```ts
type ScalingInput = {
  recipeInstance: RecipeInstance;        // with full nutrient profile per base serving

  participants: PersonContext[];         // subset of household eating this meal
  personTargets: PersonTargetsMap;       // energy & macro (and key micro) targets per day

  mealRole: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  mealImportance: 'PRIMARY' | 'SECONDARY'; // e.g. dinner vs snack

  mealShares: MealShareConfig;           // percentages per meal type (per person or default)

  safetyConfig: ScalingSafetyConfig;     // age/role-specific min/max bounds
};

type MealShareConfig = {
  [mealRole: string]: number;            // e.g. { BREAKFAST: 0.25, LUNCH: 0.3, ... }
};

type ScalingSafetyConfig = {
  minServingsPerPersonByAgeGroup: {
    toddler: number;   // e.g. 0.25
    kid: number;       // e.g. 0.4
    teen: number;      // e.g. 0.5
    adult: number;     // e.g. 0.5
  };
  maxServingsPerPersonByAgeGroup: {
    toddler: number;   // e.g. 0.75
    kid: number;       // e.g. 1.0
    teen: number;      // e.g. 1.5
    adult: number;     // e.g. 2.5
  };
};
```

`RecipeInstance` contains:

* Nutrients per base serving (kcal, macros, key micros).
* Ingredients & quantities (for cost, waste, prep).

`PersonContext` includes age/sex, temporary states, DietRequirements; `PersonTargets` include daily energy targets and safe floors (see Meal Planning Algorithm).

### 2.2 Outputs

```ts
type ScalingOutput = {
  totalServings: number;          // recipe scaled to this many base servings
  perPersonServings: { [personId: string]: number };  // 0..N

  perPersonPlate: PlateInstruction[];
  mealNutritionSummary: { [personId: string]: NutritionSummary };
};

type PlateInstruction = {
  personId: string;
  amountGrams: number;            // amount of main dish

  amountServings: number;         // same as perPersonServings[personId], for display

  sideAdditions: SideAddition[];  // toast, fruit, etc. from other recipes/patterns
  supplements: SupplementAssignment[];
};

type NutritionSummary = {
  energyKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  keyMicros: { [nutrientId: string]: number };
};
```

Scaling Engine does **not** decide which sides or supplements exist; that’s planner-level. It just integrates them into per-person plates when given.

---

## 3. Targets & Defaults

For each person and day, from `PersonTargets` we know:

* `dailyEnergyTargetKcal`
* `dailyMacrosTarget` (protein, carbs, fats)
* Possibly thresholds for micros (iron, fiber, etc.).

We also have **meal-level shares**:

* e.g., `BREAKFAST: 25%`, `LUNCH: 30%`, `DINNER: 35%`, `SNACK: 10%`.

If missing:

* **Daily energy target**:

  * Default 2000 kcal.
* **Meal shares**:

  * Default: breakfast 25, lunch 30, dinner 35, snacks 10 (per person).
* **Micros**:

  * Used only for **soft** optimization; planning stage handles weekly micro coverage.

We compute per-person **meal targets**:

```text
mealEnergyTarget_i = dailyEnergyTargetKcal_i * mealShare[mealRole]
mealProteinTarget_i = dailyProteinTargetG_i * mealShare[mealRole] (if available)
...
```

Scaling Engine uses these targets, but the planner is responsible for day/week-level balancing.

---

## 4. Algorithm

### Step 1: Compute Person-Level Meal Targets

For each participant:

* Compute `mealEnergyTarget` and macro targets.
* If daily targets missing, use defaults.

Also derive:

* `ageGroup` from age:

  * toddler / kid / teen / adult.
* Age-specific min and max serving bounds from `ScalingSafetyConfig`.

---

### Step 2: Compute Base Nutrient Per Serving

From `recipeInstance`:

* `kcalPerServing`
* `proteinPerServing`, `carbsPerServing`, `fatPerServing`
* `microsPerServing` (subset of nutrient space)

Define:

```text
nutritionVector = (kcal, protein, carbs, fat, keyMicros[])
```

Assumption:

* Nutrients scale linearly with servings (`N` base servings → `N × nutritionVector`).

---

### Step 3: Compute Household Batch Size

We want a reasonable `totalServings` that:

* Produces enough for all participants.
* Doesn’t overshoot wildly.
* Respects age/role-specific min/max ranges when possible.

Procedure:

1. Compute sum meal targets:

   ```text
   totalMealEnergyTarget = Σ_i mealEnergyTarget_i
   ```

2. Estimate total servings:

   ```text
   totalServingsEstimate = totalMealEnergyTarget / kcalPerServing
   ```

3. Compute naive bounds:

   ```text
   minServingsFromBounds = Σ_i minServingsByAgeGroup[ageGroup_i]
   maxServingsFromBounds = Σ_i maxServingsByAgeGroup[ageGroup_i]
   ```

4. Calculate initial `totalServings`:

   ```text
   totalServings = clamp(
     round(totalServingsEstimate),
     minServingsFromBounds,
     maxServingsFromBounds
   )
   ```

If `kcalPerServing` is very small or very large, domain can cap `totalServings` for safety and practicality.

---

### Step 4: Allocate Portions per Person (Energy-First)

We treat portion allocation as a constrained allocation problem.

Goals:

* `Σ s_i = totalServings`
* Each `s_i` in `[min_i, max_i]` (age-specific bounds)
* Higher `mealEnergyTarget_i` → larger `s_i`
* Adults > teens > kids > toddlers if there is scarcity

#### 4.1 Compute Ideal Fractions

For each person:

```text
weight_i = mealEnergyTarget_i      // more target energy → more weight
if weight_i is missing → weight_i = 1.0

fraction_i = weight_i / Σ_j weight_j
s_i_ideal = totalServings * fraction_i
```

#### 4.2 Discretize with Constraints

We don’t want “1.137 servings”; we want increments:

* Use global increment, e.g. `0.25` servings.

Procedure:

1. Round all `s_i_ideal` to nearest increment:

   ```text
   s_i_round = roundToIncrement(s_i_ideal, 0.25)
   ```

2. Clamp to age-specific bounds:

   ```text
   s_i_clamped = clamp(s_i_round, min_i, max_i)
   ```

3. Compute `sumClamped = Σ_i s_i_clamped`.

4. Adjust to match `totalServings`:

   * If `sumClamped > totalServings`:

     * Reduce from those:

       * With largest positive error `(s_i_clamped - s_i_ideal)`
       * And/or least constrained (adult before toddler).
       * Never go below `min_i`.
   * If `sumClamped < totalServings`:

     * Increase for those:

       * With largest deficit `(s_i_ideal - s_i_clamped)`
       * Highest priority group (adults, teens) when appropriate.
       * Never exceed `max_i`.

Invariants enforced:

* `s_i >= min_i` and `s_i <= max_i` for all i.
* For the same dish, toddlers never get more servings than adults unless planner explicitly configured otherwise.
* If even `maxServingsPerPersonByAgeGroup` cannot absorb `totalServings`, leftovers are treated as intentional leftovers (for lunch next day) and assigned to the household, not to a specific person.

---

### Step 5: Macro & Micro Fine-Tuning (Optional)

If macros are badly off for some person:

* Example: teen consistently low on protein vs target; adults closer.

For this meal:

1. Check if we can adjust `s_i` within `[min_i, max_i]` to reduce macro error:

   * Increase teen’s portion slightly; decrease adults’ slightly.
2. If serving bounds make that impossible:

   * Planner-level logic can attach **side additions**:

     * Extra beans, yogurt, fruit, toast, etc.
   * Scaling Engine will then:

     * Allocate side additions alongside main dish, with known nutrients.

Micros (iron, calcium, etc.) are **planner-level**; scaling engine doesn’t try to fix chronic micro deficits per meal. It just refrains from doing anything obviously harmful.

---

### Step 6: Generate Plate Instructions

For each person:

1. Compute grams of main dish:

   ```text
   gramsPerServing = recipeInstance.totalCookedWeight / totalServings
   gramsForPerson = s_i * gramsPerServing
   ```

2. Build `PlateInstruction`:

   ```ts
   {
     personId,
     amountGrams: gramsForPerson,
     amountServings: s_i,
     sideAdditions: [...],
     supplements: [...],
   }
   ```

3. Supplements:

   * If this meal is the scheduled anchor for any supplements:

     * Add them to `supplements[]`.

PlateInstructions are what the UI shows the cook; they’re purely derived and explainable.

---

## 5. Multiple Meals Per Day & Weekly Balance

Scaling Engine runs **per meal** and is stateless, but it accepts hints from planner:

* Planner can adjust `mealShare[mealRole]` per person for that day based on:

  * What happened earlier in the day.
  * Expected snacks.
* Example:

  * If someone under-ate at lunch, planner can increase dinner meal share for them.

Scaling Engine constraints:

* It will never allocate **0** servings to a participant unless:

  * `mealShare[mealRole]` is explicitly 0 for that person **and**
  * Planner handles nutrition via other meals.
* It will not try to “fix” weekly trends; that’s planner + FeedbackEngine work.

---

## 6. Allergies & Diet Requirements

DietRequirements must **never** be violated.

Responsibilities:

1. Planner:

   * Should not include a person in `participants` for a recipe they cannot eat.
   * If recipe has nuts and person has NO_NUTS:

     * Either:

       * Provide an alternative meal for them, or
       * Exclude them from that meal and cover energy elsewhere.

2. Scaling Engine:

   * Assumes `participants` already passed diet compatibility filters.
   * Still allowed to:

     * Enforcement sanity checks:

       * If any participant has a conflicting DietRequirement for this recipe → error / refusal.
   * Does **not** handle cross-contamination modelling in v1, but:

     * Future versions can mark recipes with “high allergy risk” flags that planner respects.

Bottom line: scaling never introduces a forbidden ingredient; it only shapes quantities.

---

## 7. Safe Energy Floors & Interaction with Planner

Safe energy floors are defined in `PersonTargets` and enforced at the **planner** level over days/weeks.

Scaling Engine:

* Has **per-meal** context only.
* Must avoid obviously unreasonable allocations:

  * E.g., giving toddlers the absolute minimal portion every primary meal while adults get the maximum.

Planner:

* Computes daily expected energy from all meals using ScalingOutput.
* Enforces:

  * `expectedDailyEnergy_i >= safeEnergyFloorKcal_i` over the plan window.
  * Any violation triggers planner-level changes (more food, different recipes), not just scaling changes.

Scaling Engine doesn’t override floors directly, but it must:

* Respect age-specific min portions.
* Avoid giving “zero dinner” to participants unless explicitly directed by planner.

---

## 8. Handling Missing Data

If we know nothing about a person except they exist:

* Assume:

  ```text
  dailyEnergyTargetKcal = 2000
  proteinTarget = 90g
  meal shares: 25/30/35/10
  ageGroup = adult
  ```

If age known but no weight:

* Use age-group defaults:

  * 0–3 years: ~1000–1200 kcal.
  * 4–8 years: ~1400 kcal.
  * 9–13: ~1800–2000.
  * 14+ adult.

If age is missing:

* Treat as adult.

In all cases:

* Scaling Engine produces **reasonable** portions.
* Planner can show:

  * “Using default needs for X; add more info to improve accuracy.”

---

## 9. Scaling to 100+ People

For each meal:

* Complexity: O(P) where P is number of participants (≤ 100 in typical cases).
* Steps:

  * Compute targets: O(P)
  * Compute fractions & rounding: O(P)
  * Adjust for constraints: O(P log P) at worst (sorting by error).

Across a day (3–5 meals):

* O(P × meals) — trivial at this scale.

The heavy lifting for optimization is in the **Meal Planning Algorithm**; scaling is lightweight and deterministic.

---

## 10. Invariants & Safeguards Summary

The Family Scaling Engine guarantees:

1. **No negative servings**:

   * `perPersonServings[personId] >= 0` always.

2. **Age-appropriate bounds**:

   * Toddler portions never exceed adult portions for the same dish unless explicitly configured.
   * Per-person servings remain within `[min_i, max_i]`.

3. **Total servings consistency**:

   * `Σ_i perPersonServings[i] <= totalServings`.
   * Any extra is leftover, not silently assigned.

4. **No DietRequirement violations**:

   * If a conflicting DietRequirement is detected for any participant, scaling refuses to proceed and signals planner.

5. **Explainability**:

   * Given inputs, outputs are deterministic and reproducible.
   * We can always explain:

     * Why person A gets 2 servings and person B gets 0.5.

