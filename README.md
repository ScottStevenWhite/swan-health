# Swan Health

**A GraphQL-Driven Health & Nutrition Platform for Individuals and Families**

---

## 1. Vision & Problem Statement

Most health apps are:

- Built for **solo adults**, not families.
- Treat people as **static** (“30-year-old male, 80kg”) instead of dynamic (“30-year-old male, marathon prep, post-surgery, with three kids and a limited budget”).
- Obsess over calories while under-serving:
  - **Nutrients**
  - **Medications**
  - **Real life** (holidays, restaurants, picky kids)
  - **Money** (grocery budgets)
  - **Environmental impact** (waste, CO₂, packaging)
- Act as **logbooks**, not **coaches**.

**Swan Health** is a full-stack web application designed to fix this:

- Models **real physiology and life situations** (temporary states).
- Designs **family-scale meal plans** that hit nutrient goals.
- Respects **diet preferences and medical requirements**.
- Keeps users **within a budget** and helps find cheaper options.
- Gently helps users **reduce waste and eco footprint**, without guilt.
- Watches how you’re doing and offers **feedback and Autopilot adjustments**, so you don’t have to constantly micromanage.

Guiding principle:

> **Reduce cognitive load → Improve adherence → Achieve health goals.**

The long-term vision: A system that makes “eating well, for cheap, for the whole family, given your real constraints” **actually feasible**.

---

## 2. Core Product Concepts

Each concept below notes what it **feeds** (who consumes its data) and **depends on** (what it relies on). This is to keep interactions clear and avoid painting ourselves into a corner.

---

### 2.1 Body Profiles (Adults & Kids)

Each person in Swan has a **Body Profile**:

- **Demographics**
  - Age
  - Sex & gender
- **Anthropometrics**
  - Height
  - Weight
  - Body composition (e.g., body fat %, lean mass)
- **Vitals**
  - Blood pressure
  - (Future) Resting heart rate, HRV, etc.
- **Blood / basic markers**
  - Blood type
  - (Future) Key lab markers

Children are first-class citizens:

- Infants, toddlers, kids, teens.
- Age-appropriate reference ranges and targets.

**Feeds:**

- Energy and nutrient target calculations.
- Feedback Engine (risk patterns, e.g., hypertension).
- Family Scaling Engine (per-person needs).
- Future modules:
  - Exercise Planner
  - Medical Data, Longevity Engine
  - Sex-specific health modules

**Depends on:**

- Nothing except basic user/household identity.

---

### 2.2 Temporary States (Life Modes)

People move through phases. Swan explicitly models **Temporary States** that significantly shift needs:

Examples:

- Pregnancy (with trimester awareness)
- Lactation
- Cancer treatment phases
- Surgery prep
- Surgery recovery
- Marathon / endurance prep
- Cutting / bulking cycles
- Acute illness / recovery

Each state:

- Has **start/end dates**.
- Adds **modifiers** to:
  - Energy needs
  - Macro targets
  - Micronutrient targets
- Can layer with others (e.g., “marathon prep + low sodium requirement”).

The state system is designed so adding new states is additive, not a schema rewrite.

**Feeds:**

- GoalSet computation (modified targets).
- Feedback Engine (“given your state, X is off target”).
- Autopilot (state-aware adjustments).
- Future:
  - Exercise states
  - Medical states
  - Women’s/Men’s health states

**Depends on:**

- PersonProfile.

---

### 2.3 Goals & Targets

Users define what “better” looks like:

- **Body Goals**
  - Target weight
  - Target blood pressure
  - Target body composition
- **Energy & Macros**
  - Daily calorie target (auto-calculated → user can override)
  - Macro targets (g / day or % of calories)
- **Micronutrients**
  - Vitamins, minerals, omega-3s, etc.
  - Daily & weekly ranges, not just single numbers
- **Lifestyle Phases**
  - Cut, maintain, bulk
  - Therapeutic eating patterns for medical conditions

The system:

1. Computes a **baseline** using standard formulas (e.g., Mifflin-St Jeor).
2. Applies **Body Profile** and **Temporary States**.
3. Applies **Diet Requirements** (see below).
4. Produces a **GoalSet** that everything else uses:
   - Meal planner
   - Feedback engine
   - Autopilot
   - Future: Exercise, Medical, Longevity views

**Feeds:**

- Meal & MealPlan validation.
- Feedback & Autopilot rules.
- Research cohorts & longevity metrics.

**Depends on:**

- BodyProfile.
- TemporaryStates.
- (Optionally) Medical data in the future.

---

### 2.4 Nutrients, Supplements, Prescriptions & the “?” Layer

Swan tracks three related layers:

1. **Nutrients**
   - Macros: protein, carbs, fats, fiber.
   - Micros: vitamins, minerals, essential fats, etc.
   - Targets: daily and weekly.
   - Intake: derived from meals and supplements.

2. **Supplements**
   - Name, dose, schedule.
   - Links to nutrient targets or goals.
   - E.g., “Vitamin D3 2000 IU, daily with breakfast”.

3. **Prescriptions**
   - Medication name, dose, schedule.
   - Indication (optional).
   - Future: drug–nutrient interaction tracking.

Every nutrient/supplement/prescription exposes a **“?” info panel**:

- What it is.
- What systems it affects.
- Why someone might use it.
- Common deficiency signs (where relevant).
- Known upper tolerable limits.
- Contextual warnings (“ask your doctor if…”).
- Links to sources.

The app is not a doctor. It’s a **transparent scoreboard** plus explanation layer.

**Feeds:**

- Feedback Engine (deficiency/excess patterns).
- Autopilot (nutrient-focused adjustments).
- Future Medical & Longevity modules.

**Depends on:**

- Nutrient/Supplement/Prescription definitions.
- IntakeLogs from Meal Tracking.

---

### 2.5 Meal Tracking

Daily intake is tracked via:

- **Meals**
  - Named and time-stamped (e.g., “Breakfast”, “Dinner”, “Post-workout shake”).
- **Foods / Recipe Portions**
  - Ingredient-level breakdown where available.
  - Stored per 100g or per serving.

From this, Swan computes:

- Per-meal macros/micros.
- Daily and weekly coverage vs targets.
- Trends over time.

Meal logs also drive:

- **Feedback** (e.g., “3 days low on protein”).
- **Autopilot** (e.g., tighten macros if you’re drifting).
- **Cost estimates** (via aggregated shopping lists).
- **Future eco metrics** (estimated CO₂ and waste risk for what was cooked/unused).

**Feeds:**

- Goal adherence calculations.
- Cost Engine (actual vs planned costs).
- Eco Engine (actual vs planned waste/emissions).
- Research aggregates.

**Depends on:**

- Meal/Recipe/Ingredient definitions.
- PersonProfile & MealPlan (optional, for comparison).

---

### 2.6 Meal Planning (1–6+ Week Plans)

The Meal Planner is the core engine of Swan Health. Its job is to synthesize **all** relevant information — bodies, goals, budgets, preferences, meds, supplements, equipment, eco goals, family composition — and turn that into **one coherent plan** that real humans can actually follow.

The key outcome is simple:

> “Tell me what to cook and how much everyone should eat, so our health, budget, and values are all respected — with minimal thinking from me.”

---

#### 2.6.1 What a Plan Looks Like

- Plans typically span **1–6 weeks** (configurable, can go shorter/longer).
- Each day is composed of **meal slots**:
  - Breakfast, lunch, dinner, snacks, or custom slots.
- Each slot is filled by:
  - A **recipe** (e.g., “Chickpea Curry with Rice”)
  - Or a **pattern** (e.g., “Oats + fruit + protein” that can be instantiated with different ingredients).

Under the hood, each recipe and pattern carries:

- Nutrient profile (macros + micros).
- Ingredient list & quantities.
- Cost and price sensitivity (via Cost Engine).
- Eco attributes (waste risk, packaging, CO₂ — future).
- Equipment needs and prep complexity.

---

#### 2.6.2 What the Planner Answers

Given a prospective plan, the system can answer:

- **Nutrition**
  - “If we follow this plan, do we hit our energy & nutrient targets?”
  - “Which days or specific nutrients look weak or excessive?”
  - “How does this change if we swap out Wednesday dinner?”

- **Family**
  - “Does every family member meet their individual targets (calories, macros, key micros) using shared meals and portioning?”

- **Money**
  - “What will this plan cost at our preferred stores?”
  - “Which recipes drive most of the cost?”

- **Waste & Eco** (future)
  - “Which ingredients are at high risk of being wasted?”
  - “What’s the approximate CO₂ and packaging footprint of this plan?”

- **Lifestyle**
  - “Does this plan rely on equipment we actually own?”
  - “Are prep and cook times realistic for our schedule?”

The user can see the impact of **any tweak** (move, swap, delete, add) reflected across:

- Nutrition dashboards.
- Cost estimate & budget status.
- (Future) Eco metrics.
- Family portioning instructions.

---

#### 2.6.3 Inputs & Constraints to the Planner

The planner doesn’t work in isolation; it consumes nearly all the core configuration:

- **Per-Person Inputs**
  - BodyProfile (age, sex, height, weight, composition, vitals).
  - TemporaryStates (pregnancy, recovery, training phases, etc.).
  - Goals & Targets (weight, BP, energy, macros, key nutrients).
  - DietPreferences (patterns, liked/disliked ingredients).
  - DietRequirements (medical constraints: no gluten, low sodium, etc.).
  - Supplements & Prescriptions:
    - Must align with meals as needed (prenatal with breakfast, etc.).

- **Household Inputs**
  - Household members & their profiles.
  - Budget (weekly/monthly, per household, optional per person).
  - EcoProfile (future):
    - Priority for waste reduction, CO₂, packaging, within cost constraints.
  - Kitchen Equipment inventory:
    - Oven, stove, air fryer, Instant Pot, blender, etc.
  - Calendar context:
    - Days with very low time to cook.
    - Days designated for leftovers or eating out.

- **Recipe Pool**
  - A large catalog of recipes with:
    - Nutrient profiles.
    - Ingredient lists & units.
    - Equipment requirements.
    - Cost & eco metadata (once available).
    - Tags (kid-friendly, spicy, quick, batch-cookable, etc.).

The planner uses these as **constraints** and **preferences** when generating or evaluating plans.

---

#### 2.6.4 Core Capabilities of the Meal Planning Algorithm

The Meal Planning Algorithm is designed to:

1. **Keep you within budget**
   - Use ingredient prices (from Cost Engine) and ShoppingList to:
     - Estimate total plan cost.
     - Avoid plans that exceed your budget.
     - Suggest cheaper recipes when cost pressure is high.

2. **Generate delicious meals**
   - Respect DietPreferences:
     - Preferred patterns (e.g., Mediterranean, vegan-preferring).
     - Liked ingredients and cuisines.
   - Promote variety and avoid repetition:
     - Don’t repeat the same 2 dinners 5 nights in a row unless explicitly allowed.
   - Allow users to **anchor** favorite recipes and build around them.

3. **Generate a grocery list automatically**
   - Convert the plan into a **ShoppingList**:
     - Aggregate ingredients across weeks.
     - Convert to store-friendly units (e.g., “3 × 400g canned tomatoes”, not “1180g crushed tomato”).
   - Integrate with stores via Cost Engine to:
     - Show store-wise breakdown.
     - Surface deals and substitutions.

4. **Keep food waste down**
   - Design plans that:
     - Reuse perishable items across adjacent days.
     - Leverage “use-up” meals (soups, stir-fries, frittatas) for likely leftovers.
   - Use WasteLog (future) and ShoppingList deltas to:
     - Infer which ingredients often get wasted.
     - Bias future plans toward:
       - Frozen/shelf-stable alternatives.
       - Smaller batch sizes or different recipes.

5. **Ensure every family member hits their nutritional targets**
   - Use Family Scaling Engine:
     - Compute batch sizes and per-person portions from a single dish.
   - Ensure:
     - Per-person calorie target (± allowed margin).
     - Macro alignment.
     - Coverage of key micronutrients over the week.

6. **Account for supplements and prescriptions**
   - Integrate supplement/med schedules into the plan:
     - Ensure, e.g., “take prenatal with breakfast” is visible.
   - Check:
     - That nutrient targets consider both food and supplements.
   - Future: basic reminder/visibility for prescriptions (not replacing med adherence tools).

7. **Honor dietary preferences and requirements**
   - Hard filter:
     - No recipes violating DietRequirements (e.g., gluten-free, low sodium).
   - Soft influence:
     - Prefer recipes that match selected patterns and liked ingredients.
   - Never let eco or budget optimizations override **medical constraints**.

8. **Hit caloric & macro targets for each family member**
   - The algorithm treats each person as a separate **constraint set**:
     - Calories, macros (and later, key micros) must be satisfied per person, using shared meals and portioning rules.

9. **Use the kitchen equipment you actually own**
   - Recipes carry equipment tags.
   - Planner:
     - Filters out recipes requiring unavailable tools.
     - Can optionally target “low-equipment” plans for minimal setups.

10. **Produce one cooking flow with per-person serving instructions**
    - Each meal has:
      - One set of cooking instructions for the cook.
      - Portion guidance per family member, integrating:
        - Food portions (e.g., “Dad 600g curry + 1 toast + multivitamin”).
        - Supplements (e.g., “Mom 300g stew + 2 toast + prenatal with food”).
    - This is critical:
      - The cook doesn’t manage five micro-meal plans; they cook once and plate according to guidance.

11. **Make small tweaks to recipes when useful**
    - Planner (and later Autopilot) can propose micro-changes like:
      - “Use olive oil instead of butter for better fat profile.”
      - “Swap half the white rice for beans to boost fiber and protein.”
      - “Use reduced-sodium broth to respect low-sodium requirement.”
    - Each tweak is evaluated against:
      - Nutritional impact.
      - Cost delta.
      - Preference/requirement compliance.

---

#### 2.6.5 How the Planner Uses All This (High-Level Algorithm)

Conceptually, the planner treats meal planning as a **constrained optimization problem**:

- **Hard constraints**:
  - DietRequirements (no gluten, low sodium max, allergies).
  - Required diet patterns (e.g., vegan REQUIRED).
  - Budget ceilings (do not exceed X).
  - Equipment limitations.
  - Family membership & basic per-person calorie bounds.

- **Soft objectives** (weighted by user settings):
  - Nutrient coverage and distribution over the week.
  - Cost minimization (within budget).
  - Waste minimization (reusing ingredients, leftovers).
  - Preference alignment (patterns, liked ingredients).
  - Eco goals (future eco weight).
  - Simplicity (fewer distinct recipes, more batch-cooking).

The algorithm works in **phases**, roughly:

1. **Filter candidate recipes**
   - Remove any that violate hard constraints (requirements, equipment).
   - For each meal slot, assemble a candidate pool.

2. **Construct a baseline plan**
   - Start from:
     - User-anchored recipes (favorites the user insists on).
     - Simple heuristics (protein at each main meal, veg at lunch/dinner, etc.).
   - Fill remaining slots with candidates that:
     - Move the plan closer to per-person macro & kcal targets.
     - Respect budgets heuristically.

3. **Evaluate the plan**
   - Compute:
     - Per-person nutrition vs targets.
     - Total plan cost vs budget.
     - Ingredient reuse and likely waste.
     - Preference & pattern match score.
     - (Future) Eco metrics.

4. **Improve the plan (local search / tweaks)**
   - Identify weaknesses:
     - A nutrient under-served.
     - Over-budget ingredients.
     - High-waste-risk items.
   - Apply localized operations:
     - Swap a single recipe.
     - Adjust recipe servings.
     - Apply small ingredient tweaks.
   - Re-evaluate; keep changes if the overall score improves and no constraints are broken.

5. **Family scaling & serving instructions**
   - Once the plan is stable:
     - Run the Family Scaling Engine to determine per-person portions per meal.
     - Align supplement & prescription reminders with specific meals.

6. **Present to user for iteration**
   - User can:
     - Lock certain days or recipes.
     - Ask for suggestions:
       - “Cheaper plan.”
       - “More protein focus.”
       - “Less prep time.”
     - The planner re-runs optimization under new biases.

---

#### 2.6.6 Feeds & Dependencies (unchanged, but now richer)

**Feeds:**

- ShoppingList & Cost Engine.
- Family Scaling Engine.
- Feedback & Autopilot:
  - Planner outputs are the canvas Autopilot modifies.
- Eco Engine (future):
  - Projected waste, packaging, CO₂ from the plan.

**Depends on:**

- Recipes & Ingredients with:
  - Nutrition, cost, equipment, and (future) eco metadata.
- GoalSet (per person).
- DietPreferences & DietRequirements.
- Budget constraints.
- (Future) EcoProfile, WasteLog, etc.

---

### 2.7 Family Mode & Scaling Engine

Families are not an afterthought; they’re central.

Given a family:

- Adult A: 2300 kcal/day  
- Adult B: 1900 kcal/day  
- Child 1: 1800 kcal/day  
- Child 2: 1600 kcal/day  
- Child 3: 1300 kcal/day  

Total: **8,900 kcal/day**.

Swan:

1. Lets the household design a **single shared meal plan**.
2. Computes total household needs.
3. Scales recipes at the **batch level** to match the total needs.
4. Uses the **Family Scaling Engine** to determine per-person portions:
   - As percentages (“Dad: 25% of pan”)
   - As grams/ounces (“Dad: 420g, Mom: 350g, etc.”)

The engine tries to:

- Preserve each person’s macro ratio.
- Meet critical nutrient requirements, especially when resources are tight.
- Avoid silly results (e.g., toddler portion bigger than adult portion).

Outcome:

- Cook once.
- Eat together.
- Everyone’s numbers move closer to target.

**Feeds:**

- Per-person adherence data (even though cooking is shared).
- Future eco metrics (portion-based CO₂ / impact per person).

**Depends on:**

- PersonProfile & Goals.
- MealPlan recipes & totals.

---

### 2.8 Handling Real-Life Deviations (Restaurants, Holidays)

People eat out and break plans.

Swan explicitly models:

- **Restaurant Meals**
  - Freeform logging or selecting from a database.
  - Immediate effect on daily/weekly metrics.
  - Suggestions to rebalance:
    - Lighten later meals.
    - Add nutrient-dense meals in upcoming days.
    - (Future) Show cost & eco impact of restaurant choices.

- **Holiday Mode**
  - Tag certain days as “holiday”:
    - Expectations are relaxed.
    - Feedback engine uses more tolerant ranges.
  - Focus is on **weekly and monthly trends**, not punishing a few days.

- **Plan vs Actual**
  - The system compares actual intake vs planned.
  - Surfaces patterns:
    - “We routinely skip lunch on Sundays.”
    - “We always overshoot calories on Friday dinner.”
    - “We regularly throw out leftovers after events.”

This feeds directly into **Feedback** and **Autopilot** (and later, eco coaching).

**Feeds:**

- Feedback insights about adherence.
- Autopilot adjustments on future plans.
- Eco Engine (holiday/waste patterns).

**Depends on:**

- MealPlan + IntakeLogs.
- Holiday/Restaurant tags.

---

### 2.9 Diet Preferences & Diet Requirements

Food isn’t just macros; it’s culture, ethics, and medical reality.

Swan splits this into:

#### 2.9.1 Diet Preferences

These describe what you *want* your diet to look like:

- **High-level patterns**:
  - Vegan
  - Vegetarian
  - Pescetarian
  - Omnivore
  - Paleo
  - Mediterranean
  - Other custom tags

Each pattern can be tagged as:

- **Required** – Hard constraints (e.g., vegan for ethical reasons).
- **Preferred** – Soft constraints (e.g., generally prefer Mediterranean-style).

- **Ingredient-level preferences**:
  - Liked ingredients: “I enjoy salmon, broccoli, chickpeas, etc.”
  - Disliked ingredients: “I hate cilantro, mushrooms, olives, etc.”
  - Neutral / avoid-if-possible tags.

The planner:

- Avoids **disliked** ingredients where possible.
- Prioritizes recipes that match **preferred patterns**.
- Honors **required patterns** as hard constraints.

#### 2.9.2 Diet Requirements (Medical / Hard Constraints)

These are non-negotiable constraints, usually medical:

Examples:

- No gluten (celiac disease)
- Low sodium (hypertension)
- No lactose (intolerance)
- No nuts (allergy)
- Low FODMAP (IBS)
- Specific restrictions from a physician/dietitian

These are treated as **hard constraints**:

- Recipes and foods violating requirements:
  - Are excluded from recommendations.
  - Are flagged clearly if logged manually.

The planner, scaling engine, and Autopilot must all respect these.

**Feeds:**

- Recipe filtering & ranking.
- Feedback (“you’re frequently logging foods that violate your requirements”).
- Autopilot guardrails.
- Future eco suggestions (only suggest eco swaps that still respect these constraints).

**Depends on:**

- PersonProfile (for context).
- User input on patterns & requirements.

---

### 2.10 Cost Controls & Budgeting

Health is constrained by **money**. Swan treats cost as a first-class dimension.

Key ideas:

- **Budgets**
  - Per-household and optionally per-person.
  - Time window:
    - Weekly grocery budget.
    - Monthly food budget.
  - Currency and local context.

- **Cost Awareness**
  - Each ingredient (or product) has:
    - Price per unit (e.g., per kg or per package).
    - Store-specific variation.
  - Meal plans generate a **shopping list** with estimated total cost.

- **Local Price Lookups**
  - Integrations with:
    - Grocery store APIs OR
    - Price aggregator APIs.
  - Use user’s location (e.g. ZIP/postal code) and chosen stores.
  - Cache results and refresh periodically.

- **Deal Finder**
  - For each item in the shopping list:
    - Identify cheapest stores.
    - Suggest alternatives:
      - “Brand X is 10% cheaper than Brand Y.”
      - “Buying frozen spinach instead of fresh saves $N per week.”

- **Budget-Conscious Planning**
  - When building or adjusting a plan, the planner:
    - Shows estimated cost vs budget.
    - Highlights expensive recipes.
    - Suggests lower-cost swaps with similar nutrient coverage:
      - “Swap salmon for canned sardines 2x/week → save $20/month with similar omega-3.”

- **“App Pays for Itself”**
  - The system can track:
    - Estimated cost of the baseline plan vs cost of current plan.
    - Savings from specific optimizations.
  - Over time, it can report:
    - “Estimated $X saved this month compared to your original plan.”

This cost layer interacts tightly with **diet preferences**, **requirements**, **Autopilot**, and, eventually, the **eco module** (because waste reduction often saves money).

**Feeds:**

- Feedback (budget adherence).
- Autopilot (cost-aware recipe swaps).
- Eco Engine (waste vs cost tradeoffs).

**Depends on:**

- ShoppingLists derived from MealPlans.
- Ingredient price data (user input + external APIs).

---

### 2.11 Feedback Engine & Autopilot Mode

Swan should not just say “You logged 83 grams of protein.” It should say “Here’s what that means, and here’s what to change.”

#### 2.11.1 Feedback Engine

The Feedback Engine consumes:

- Body metrics and trends.
- Intake logs (meals, supplements, prescriptions).
- Plan adherence.
- Budget adherence.
- Temporary states and requirements.
- (Future) Eco metrics, exercise logs, mental health logs, labs.

It produces **Insights** like:

- “You’re consistently 15–20% below your protein target this week.”
- “Your average sodium intake exceeds your low-sodium target by ~30%.”
- “Your grocery cost is trending 25% above budget; these 3 recipes drive ~70% of the overspend.”
- “Since your surgery, you’ve hit your protein target 6/7 days. Great recovery support.”
- (Future) “You’ve reduced logged food waste by ~30% vs last month.”

Insights have:

- Severity (info, warning, critical).
- Type (nutrition, budget, adherence, medical-aligned, eco, etc.).
- Suggested actions.

#### 2.11.2 Autopilot Mode

Autopilot is the “just tell me what to do” mode.

User can opt into **Autopilot** per household/person:

- Configurable bounds:
  - Max % change in daily calories.
  - Whether to allow recipe substitutions automatically.
  - How aggressively to optimize for cost vs convenience.
  - (Future) How much to weight eco improvements vs cost.
- Autopilot can:
  - Automatically adjust future days in the meal plan when:
    - Weight deviates from target trend.
    - Nutrient deficiencies persist.
    - Budget is regularly exceeded.
    - (Future) Waste levels stay high or eco profile targets are not met.
  - E.g., “Next week, swap two red-meat dinners for cheaper, lower-saturated-fat options.”

Autopilot **never**:

- Violates **Diet Requirements** (medical constraints).
- Violates **Required** diet patterns (e.g., vegan).
- Makes unbounded changes; it always stays within user-defined limits.

Typical loop:

1. User enables Autopilot with constraints:
   - “You can adjust my calories ±10% and swap recipes, but don’t touch breakfast.”
2. System monitors metrics & intake.
3. When patterns emerge:
   - Autopilot proposes changes (or applies automatically, based on settings).
4. User receives:
   - “Here’s what changed and why” explanation.
   - Option to revert or adjust Autopilot aggressiveness.

This turns Swan from a **passive tracker** into a **semi-automated coach**.

---

### 2.12 Future: Exercise, Medical Data, Mental Health, Sex-Specific Health, Research, Longevity

These are **not** part of the MVP, but we want to design the current system so these can be added later without upheaval. The key is that they all build on the same foundations:

- **Profiles** (persons, households, dependents)
- **Temporary States** (life modes, phases)
- **Goals & Targets**
- **Costs & Budgets**
- **Feedback Engine**
- **Autopilot**

Below, each future lane is fleshed out with enough detail to influence today’s design decisions.

---

#### 2.12.1 Exercise Planner

**Purpose:**  
Close the loop between **energy expenditure** and **energy/nutrient intake**, and give users a structured way to get from current fitness to goal fitness.

**Key Concepts:**

- **WorkoutSession**
  - Date/time, duration.
  - Modality (run, walk, strength, cycling, etc.).
  - Intensity (heart rate zone, RPE, or simple tags).
  - Optional metrics: distance, reps, sets, loads.

- **WorkoutPlan**
  - Multi-week schedule of WorkoutSessions.
  - Structured phases (base, build, peak, deload).
  - Linked to a specific **GoalSet** (e.g., “run a marathon”, “increase squat by 20%”).

- **ExerciseStates** (a specialized TemporaryState)
  - e.g., `MARATHON_PREP`, `REBUILD_AFTER_INJURY`, `GENERAL_FITNESS`.
  - Each state:
    - Modifies energy needs (e.g., +X% calories on training days).
    - May bump certain nutrients (protein, carbohydrates, electrolytes).

**Integration with Existing Foundations:**

- **Profiles & States**
  - ExerciseStates are just another kind of TemporaryState.
  - They layer with medical states (e.g. “post-surgery” + “return-to-run”).

- **Goals & Targets**
  - WorkoutPlan has its own performance goals (distance/time/weight).
  - Energy and macro targets are adjusted based on planned training load.
  - Autopilot could modulate carbs around heavy sessions.

- **Costs**
  - Training may influence food cost via increased intake.
  - Later: optional tracking of gym memberships/equipment as budget categories.

- **Feedback**
  - Example insights:
    - “Your training volume increased 30% but your protein intake didn’t.”
    - “You are under-fueling long runs by ~400 kcal on average.”

- **Autopilot**
  - Could:
    - Add extra snacks on long training days.
    - Reduce calorie target on rest days (within bounds).
    - Suggest deload week if a user’s adherence and fatigue patterns look bad (very conservative).

**Design Requirements Now:**

- Keep **TemporaryState** generic enough to tag “exercise-related” states without schema changes.
- Make **GoalSet** flexible to add non-nutrition goals (distance/time/strength).
- Avoid baking in assumptions that “calories are purely intake-driven.”

---

#### 2.12.2 Medical Data Integration (Labs, Scans, Measurements)

**Purpose:**  
Use medical data to **inform targets and feedback**, not to diagnose or prescribe. Think “context-aware nutrition advice,” not “EMR replacement.”

**Key Concepts:**

- **LabResult**
  - Test name (e.g., “Vitamin D (25-OH)”, “LDL”, “HbA1c”).
  - Value, unit.
  - Reference range (if known).
  - Date of test.
  - Optional “source” (manual entry, uploaded PDF, etc.).

- **MedicalMeasurement**
  - Non-lab clinical values:
    - Waist circumference.
    - Blood pressure from clinic.
    - DEXA body comp.
  - Date + simple metadata.

- **MedicalState**
  - Another specialized TemporaryState:
    - e.g., `HYPERTENSION_MONITOR`, `DIABETES_MANAGEMENT`, `ANEMIA_TREATMENT`.
  - Provides:
    - Modified targets (e.g., lower sodium/potassium ranges, higher iron).
    - Additional caution rules (e.g., careful with certain supplements).

**Integration with Existing Foundations:**

- **Profiles & States**
  - MedicalStates are attached to PersonProfiles just like other states.
  - They can come with structured metadata (e.g. severity/stage).

- **Goals & Targets**
  - LabResults can adjust:
    - Specific nutrient targets (e.g., low vitamin D → increase vitamin D target).
    - Feedback thresholds (“borderline high LDL”).
  - MedicalStates may override default population-based ranges.

- **Costs**
  - Costs of specialized diets might be surfaced:
    - Trade-offs: “Your low-sodium plan is +$X vs baseline.”

- **Feedback**
  - Example insights:
    - “Your ferritin is low, yet your iron intake is often below recommended target.”
    - “Your HbA1c trend is worsening; your carbohydrate intake is consistently above your plan.”

  All phrased as **correlations and educational context**, never as diagnosis.

- **Autopilot**
  - Could:
    - Adjust nutrient targets (within safe ranges) when lab data indicates deficiency.
    - Bias planner towards relevant foods (iron-rich foods for anemia, etc.).
  - Always limited by:
    - Hard DietRequirements.
    - Physician guidance input (simple flags like “doctor says: avoid X”).

**Design Requirements Now:**

- Make GoalTargets **nutrient-centric and easily overrideable** by future modules.
- Use flexible structures for **LabResult** (test name, value, unit) to avoid per-test columns.
- Keep TemporaryState metadata extensible.

---

#### 2.12.3 Mental Health Tracking

**Purpose:**  
Capture basic **mood, stress, and sleep** signals and relate them to nutrition, adherence, and social patterns. Not therapy. Not diagnosis.

**Key Concepts:**

- **MoodLog**
  - Date/time.
  - Mood scale (e.g. -2 to +2 or 1–10).
  - Optional tags (anxious, energized, flat, etc.).
  - Optional notes.

- **StressLog**
  - Perceived stress level, time of day.
  - Optional triggers (work, family, money).

- **SleepLog**
  - Bedtime, wake time, total duration.
  - Subjective sleep quality.
  - Optional: wake-ups count, sleep interruptions.

- **SocialLog** (optional/phase-2)
  - Social time, perceived connection vs isolation.

**Integration with Existing Foundations:**

- **Profiles & States**
  - TemporaryStates like `BURNOUT_RECOVERY`, `POSTPARTUM_ADJUSTMENT`, `INSOMNIA_SUPPORT` can influence context.

- **Goals & Targets**
  - Mental health targets are mostly **qualitative**:
    - E.g., “average sleep ≥ 7h”.
    - “Reduce high-stress days per week.”

- **Costs**
  - Feedback might link financial stress to poor mental/logging patterns.

- **Feedback**
  - Example insights:
    - “On days you sleep < 6h, your snack calories increase by ~30%.”
    - “High stress days correlate with lower fruit/vegetable intake.”

- **Autopilot**
  - Very constrained here:
    - Might suggest:
      - Simplified meal plans during high-stress periods.
      - Less cognitively demanding recipes (fewer steps).
      - More batch cooking on low-stress days.

**Design Requirements Now:**

- Keep logging design **generic**: every log type has:
  - Person, timestamp, value(s), optional tags.
- Preserve ability to add new log types without schema explosion.
- Ensure FeedbackEngine can reason over **non-nutritional logs** too.

---

#### 2.12.4 Women’s & Men’s Health Modules

**Purpose:**  
Model sex-specific patterns and needs that affect nutrition, training, and recovery. Provide **phase-aware** guidance.

**Key Concepts (Women’s Health):**

- **CyclePhase**
  - Phase: menstruation, follicular, ovulation, luteal.
  - Either user-logged or estimated from simple cycle data.

- **LifeStage**
  - Pre-pregnancy, pregnancy (by trimester), postpartum, lactation, perimenopause, menopause.

- **WomenHealthState**
  - Encodes states like:
    - `PREGNANCY_TRIMESTER_2`
    - `LACTATING`
    - `PERIMENOPAUSE`.
  - Each state:
    - Adjusts specific nutrient targets (iron, calcium, folate, etc.).
    - May affect energy needs.

**Key Concepts (Men’s Health):**

- **MenHealthState**
  - States like:
    - `MIDDLE_AGE_RISK_FOCUS`
    - `LOW_TESTOSTERONE_MANAGEMENT` (only as user-labeled context, not diagnosis).
  - Adjusts:
    - Focus nutrients (e.g., Vitamin D, zinc, etc.).
    - Risk awareness (e.g., cardiometabolic focus).

**Integration with Existing Foundations:**

- **Profiles & States**
  - WomenHealthState and MenHealthState are TemporaryStates with more structured metadata.
  - Directly tied to PersonProfile’s sex/gender info.

- **Goals & Targets**
  - Phase- and state-specific:
    - E.g. cycle-based micro-adjustments are possible later.
    - Pregnancy & lactation heavily influence nutrient/energy targets.

- **Costs**
  - May surface how specific patterns (e.g., high-quality protein, more produce) impact cost for these needs.

- **Feedback**
  - Example insights:
    - “During your late luteal phase, your cravings and snack calories increase; consider planning more structured snacks instead of ad-hoc snacks.”
    - “Your iron intake is often below recommended levels given your life stage.”

- **Autopilot**
  - Could:
    - Pre-bias the meal planner around known phases (e.g., higher iron around menstruation).
    - Suggest more simple, comforting meals during times flagged as high-symptom (user-defined, not algorithmic guesswork).

**Design Requirements Now:**

- Don’t hardcode “male/female” assumptions into nutrition logic; use **states** and **metadata**, not just binary sex fields.
- Ensure GoalTargets can vary over **phases/time windows**, not just static per-person values.

---

#### 2.12.5 Research & Citizen Science

**Purpose:**  
Enable users to **opt-in** to anonymized data sharing and allow researchers to explore population patterns and run simple studies.

**Key Concepts:**

- **ResearchConsent**
  - Person-level:
    - Opt-in/opt-out flag.
    - Scope of sharing (e.g., “aggregate only”, “aggregate + deidentified time series”).
  - Timestamp and version of consent agreement.

- **ResearchCohort**
  - Criteria definition:
    - Age ranges.
    - States (e.g., `HYPERTENSION_MONITOR`).
    - Behavioral patterns (e.g., average protein intake below target).
  - Computed membership set (derived, not materialized).

- **ResearchQuestionnaire**
  - Short surveys:
    - Questions with choices or text answers.
  - Linked to cohorts and date windows.

- **ResearchResponse**
  - Deidentified link between cohort, question, and aggregated responses.

**Integration with Existing Foundations:**

- **Profiles & States**
  - Cohorts often defined based on TemporaryStates, Goals, adherence patterns.

- **Goals & Targets**
  - Research may focus on how certain targets vs actual outcomes differ by behavior.

- **Costs**
  - Some studies may specifically look at:
    - “Impact of budget constraints on nutrient adequacy.”

- **Feedback**
  - For participants:
    - Could optionally show “You’re part of a study investigating X, here’s aggregated context.”

- **Autopilot**
  - Not directly involved; must **never** change behavior for research purposes without explicit, separate consent.

**Design Requirements Now:**

- Keep database schema and logging structured enough so:
  - Deidentified aggregates are easy to compute.
- Keep a clear boundary between:
  - **Operational data** vs **research views** (for privacy and performance).
- Make sure everything can be **filtered by consent flag**.

---

#### 2.12.6 Longevity Engine

**Purpose:**  
Provide a **longevity-oriented view** of the same data: how current habits and trends might support or work against long-term healthspan.

**Key Concepts:**

- **LongevityMetric**
  - Synthetic indicators derived from:
    - Body metrics (weight/BMI trend, waist circumference).
    - Labs (e.g., lipids, HbA1c, if provided).
    - Behavior logs (consistency of movement, sleep, diet adherence).
  - Examples:
    - “Metabolic health score” (very coarse).
    - “Consistency score” for adherence over months.

- **LongevityProfile**
  - Person-level view that:
    - Summarizes key risk/benefit areas:
      - e.g., diet quality, movement, sleep regularity.
    - Tracks change over time.

**Integration with Existing Foundations:**

- **Profiles & States**
  - Some States (e.g., `LONG_TERM_WEIGHT_REDUCTION`, `CARDIOMETABOLIC_RISK_FOCUS`) may tune the lens.

- **Goals & Targets**
  - LongevityGoalSet:
    - More about long-term patterns than short-term numbers:
      - e.g., “≥ 4 days/week with > 25g fiber”, “maintain weight within healthy range”.

- **Costs**
  - Can highlight when “cheap but low-quality” patterns undermine longevity-oriented goals.

- **Feedback**
  - Example insights:
    - “Your fiber intake is consistently below levels associated with reduced long-term risk; consider increasing whole plant foods.”
    - “Your weight has increased gradually over the last 18 months; your energy intake pattern suggests a small but persistent surplus.”

- **Autopilot**
  - Could:
    - Nudge meal plans toward more longevity-supportive patterns within user’s constraints:
      - More whole foods, fewer ultra-processed items.
      - Increased diversity of plants.

**Design Requirements Now:**

- Store enough **history** (not just latest values) to compute trends over months/years.
- Keep domain concepts generic enough so adding a “longevity lens” is mostly a matter of:
  - Adding derived metrics.
  - Adding new types of FeedbackInsights.
  - Possibly a LongevityGoalSet layered on top of existing targets.

---

### 2.13 Future: Eco Footprint & Waste Reduction

**Purpose:**  
Help households gradually **reduce food waste, trash, and CO₂ footprint** in a way that:

- Feels **supportive**, not preachy.
- Often **saves money**.
- Works within **health, budget, and preference constraints**.

This is another consumer of the same spine: Profiles, States, Goals, MealPlans, ShoppingLists, Budgets, Feedback, Autopilot.

#### 2.13.1 Key Concepts

**EcoProfile (Household-Level)**

- `householdId`
- Priority weights:
  - `weightWasteReduction` (0–1)
  - `weightPackagingReduction` (0–1)
  - `weightCO2Reduction` (0–1)
  - `weightEthicalSourcing` (0–1)
- Aggressiveness:
  - `ecoIntensity`: OFF / GENTLE / MODERATE / STRONG
- Constraints:
  - `maxCostDeltaPercent` (e.g., ≤ 5% extra vs baseline).
  - `allowMorePrepTime` (scale or boolean).

**EcoImpactDefinition (per Ingredient/Recipe)**

- `co2PerKg` (approximate).
- `packagingType`: {LOOSE/BULK, PAPER, GLASS, METAL, PLASTIC, MIXED}.
- `packagingScore` (0–1; 1 = very wasteful).
- (Optional) `waterLPerKg`, `landUseScore`.
- (Optional) ethical flags:
  - `animalProduct`
  - `higherWelfareOptionsAvailable`
  - `fairTradeAvailable`
  - `localSeasonality` (by month).

**WasteLog**

- Records actual waste events, not just theoretical:
  - `householdId` / `personId`
  - `date`
  - `wasteType`: FOOD or PACKAGING
- For FOOD:
  - `ingredientId` or `recipeId`
  - `quantity`
  - `reason`: {EXPIRED, LEFTOVER_NOT_EATEN, COOKED_TOO_MUCH, SPOILED, OTHER}
- For PACKAGING:
  - `packagingType`
  - `count` or `weight`
  - Optional `recycled` vs `trash`.

**EcoMetricSnapshot**

- Precomputed metrics per period (week/month):
  - `estimatedCO2Kg`
  - `estimatedWasteFoodKg`
  - `estimatedPackagingUnits` by type
  - `ethicalHeuristicScore` (optional/advanced).

#### 2.13.2 Metrics & Calculations

- **Food Waste**
  - From WasteLogs and ShoppingList vs ingredient usage:
    - `wasteRateFood = wastedFoodMass / purchasedFoodMass`.
  - Track waste by category (meat, dairy, produce).

- **Packaging / Trash**
  - From ShoppingList items and packaging metadata:
    - `packagingUnitsPerWeek` by type.
    - `packagingScoreAggregate` (packagingScore × quantity).

- **CO₂ Footprint**
  - Approximate:
    - `totalCO2 = Σ (consumedMassIngredient × co2PerKgIngredient)`.

- **Ethical Impact (Optional, Opt-In)**
  - Based on:
    - % calories from red meat vs plant.
    - Use of “higher welfare” or “Fair Trade” items.
    - Seasonality of produce.

#### 2.13.3 Integration with Existing Foundations

- **Profiles & States**
  - EcoProfile is rooted in Household.
  - TemporaryStates like `CANCER_TREATMENT` or `TIGHT_BUDGET` can shift eco priorities:
    - During difficult phases, prioritize health & convenience first.

- **Goals & Targets**
  - Possible EcoTargets:
    - “Reduce food waste by 20% over 6 months.”
    - “Reduce CO₂ intensity by 10% compared to baseline.”
  - Always soft goals compared to medical nutrition and budget constraints.

- **Costs & Budgets**
  - Waste reduction typically **saves money**.
  - Some eco choices may cost more:
    - EcoProfile + `maxCostDeltaPercent` defines acceptable trade-offs.
  - Planner & Autopilot can show:
    - “This swap reduces CO₂ by 30% and saves $4/week.”
    - “This swap reduces CO₂ by 50% but adds $10/week; above your cost tolerance.”

- **Feedback Engine**
  - New category: `ECO`.
  - Example insights:
    - “You’ve logged ~15% of purchased produce as wasted; try one ‘leftovers’ meal per week.”
    - “Replacing 2 beef dinners with chicken/legumes would cut your plan’s CO₂ by ~18%.”

- **Autopilot**
  - Respects:
    - DietRequirements.
    - Budget.
    - EcoProfile intensity & cost bounds.
  - Possible changes:
    - Suggest/use “use-up” recipes to consume at-risk ingredients.
    - Swap high-waste or high-CO₂ ingredients for better ones when:
      - Health and budget still look good.

#### 2.13.4 Phased Implementation (Eco Roadmap)

- **Eco v1 (Waste Awareness)**
  - Add WasteLog & simple waste metrics.
  - No CO₂ yet; just show “wasted kg” and trend.

- **Eco v2 (Use-Up Planning)**
  - Integrate at-risk ingredient detection with MealPlan.
  - Suggest leftover-heavy recipes on certain days.

- **Eco v3 (CO₂ & Packaging)**
  - Add CO₂ & packaging metadata to ingredients.
  - Show approximated CO₂ & plastic usage per plan.

- **Eco v4 (Ethical / Advanced)**
  - Opt-in ethical metrics & suggestions.
  - Always soft, never overriding health/budget constraints.

---

## 3. Technical Architecture

### 3.1 Overview

Swan Health is a **TypeScript monorepo**:

- **GraphQL API backend** for all application logic.
- **React/Next.js frontend** for the UI.
- **PostgreSQL** for relational persistence.
- **Redis** for caching, pub/sub (subscriptions), job queues.

Core subsystems:

- **Diet Preference & Requirement Engine**
- **Cost Engine** (Budgets, Price lookups, Deal finder)
- **Feedback Engine & Autopilot Engine**
- **(Future) Eco Engine** (Waste/CO₂/Packaging)

---

### 3.2 Tech Stack Summary

| Layer          | Technology (Proposed)                               | Notes |
|----------------|------------------------------------------------------|-------|
| Language       | TypeScript                                          | Shared frontend & backend. |
| Monorepo       | pnpm workspaces + Turborepo                         | Caching, task orchestration. |
| Backend HTTP   | Node.js 20 + Fastify                                | Fast, good TS support. |
| API            | GraphQL (Pothos or Nexus) + GraphQL Yoga/Apollo     | Schema is the contract. |
| DB             | PostgreSQL                                          | Strong relational base. |
| ORM            | Prisma                                              | Type-safe DB access. |
| Cache / PubSub | Redis                                               | Subscriptions, caching, job queue. |
| Jobs           | BullMQ                                              | Feedback/autopilot jobs, price & eco metric refresh. |
| Frontend       | Next.js (App Router) + React + TypeScript           | SSR + SPA UX. |
| GraphQL Client | Apollo Client or urql + GraphQL Code Generator      | Typed hooks, normalized cache. |
| UI / Styling   | Tailwind CSS + Radix UI / Headless UI               | Rapid, accessible UI. |
| Forms          | React Hook Form + Zod                               | Typed validation. |
| Validation     | Zod                                                 | Shared schemas backend/frontend. |
| HTTP Clients   | node-fetch / Axios                                  | For price/eco APIs, external data. |
| Testing        | Vitest/Jest + RTL + Playwright/Cypress              | Unit/integ/E2E. |
| Observability  | Pino + Prometheus + Grafana                         | Logs & metrics. |

---

### 3.3 Monorepo Structure

```text
swan-health/
├── apps/
│   ├── api/                     # GraphQL API (Node + Fastify)
│   └── web/                     # Web app (Next.js + React)
├── packages/
│   ├── shared-types/            # Shared TS interfaces, enums
│   ├── domain/                  # Core domain logic (calculations, rules)
│   ├── database/                # Prisma schema, migrations, seeders
│   ├── graphql-schema/          # Schema builders, resolvers, codegen
│   ├── ui/                      # Shared UI components, design system
│   ├── cost-engine/             # Budgeting & price estimation logic
│   ├── feedback-engine/         # Feedback & Autopilot rules
│   ├── eco-engine/              # (Future) Waste/CO₂/packaging logic
│   └── config/                  # ESLint, TSConfig, Prettier, etc.
├── infra/
│   ├── docker/                  # Dockerfiles, docker-compose.yml
│   ├── k8s/                     # (Future) Kubernetes manifests
│   └── scripts/                 # Setup/maintenance scripts
└── docs/                        # Design docs, ADRs, spec notes
```

---

## 4. Domain & Data Model (High-Level)

### 4.1 Core Entities

Existing (high-level):

* **User**
* **Household**
* **PersonProfile**
* **BodyMetricLog**
* **TemporaryState**
* **GoalSet** / **GoalTarget**
* **NutrientDefinition**, **SupplementDefinition**, **PrescriptionDefinition**
* **IntakeLog**
* **Meal**, **Recipe**, **Ingredient**
* **MealPlan** (+ days & slots)
* **FamilyScalingConfig**

New / extended for preferences, cost, coaching, and eco:

#### Diet & Constraints

* **DietProfile**

  * `personId`
  * List of **DietPattern** entries:

    * `pattern` (e.g., VEGAN, VEGETARIAN, PALEO)
    * `mode`: `REQUIRED` or `PREFERRED`
  * Ingredient preferences:

    * `likedIngredients[]`
    * `dislikedIngredients[]`
    * (Optional) ratings.

* **DietRequirement**

  * `personId`
  * `requirementType` (e.g., NO_GLUTEN, LOW_SODIUM, NO_NUTS)
  * `strictness`: `HARD` (medical) or `SOFT` (strong preference)
  * Metadata (e.g., `maxSodiumMgPerDay`).

These feed the **recipe filters**, planner ranking, and Autopilot safety rules.

#### Cost & Budgets

* **Budget**

  * `householdId`
  * `scope`: `WEEKLY` or `MONTHLY`
  * `amount`, `currency`
  * Optional person-level overrides.

* **Store**

  * `name`, `location`, external ID (from grocery API).

* **PriceQuote**

  * `storeId`, `ingredientId`, `unitPrice`, `unit`, `timestamp`.

* **ShoppingList**

  * Generated per meal plan (and/or time window).
  * Collection of **ShoppingListItem**:

    * `ingredientId`
    * `quantity`
    * `recipes[]` that require it.

Cost Engine uses these to compute plan cost and optimizations.

#### Feedback & Autopilot

* **FeedbackInsight**

  * `targetType` (person/household)
  * `category` (NUTRITION, BUDGET, ADHERENCE, ECO, etc.)
  * `severity`
  * `message`
  * `recommendedAction`
  * `dateRange`.

* **AutopilotConfig**

  * `enabled` (boolean)
  * `scope`: person / household
  * `calorieAdjustmentBounds` (`minPercent`, `maxPercent`)
  * `allowedRecipeSwaps` (e.g., `BREAKFAST_ONLY`, `ALL_EXCEPT_DINNER`)
  * `costSensitivity` (0–1)
  * (Future) `ecoSensitivity` (0–1)
  * `requireUserApproval`: `true/false`.

* **AutopilotChange**

  * Type (ADJUST_TARGETS, SWAP_RECIPE, CHANGE_PORTIONS, ECO_SWAP, etc.)
  * Before/after snapshot.
  * Linked `FeedbackInsight`.
  * Status (APPLIED, PENDING_APPROVAL, REVERTED).

#### Eco (Future)

* **EcoProfile**

  * `householdId`
  * Priority weights, intensity, cost bounds.

* **EcoImpactDefinition**

  * Linked to `ingredientId` or `recipeId`.
  * CO₂ per kg, packaging, optional water/land & ethical flags.

* **WasteLog**

  * Food and packaging waste events.

* **EcoMetricSnapshot**

  * Aggregated metrics per period.

---

### 4.2 Example Flows

#### 4.2.1 Diet Preferences and Requirements in Planning

1. User sets their DietProfile and DietRequirements.
2. When building a MealPlan:

   * Candidate recipes are:

     * **Filtered** to remove any that violate HARD requirements.
     * **Ranked** higher if they match REQUIRED/PREFERRED patterns.
     * De-prioritized if they include disliked ingredients.
3. The planner computes suggested recipes that:

   * Respect hard constraints.
   * Align with preferences where possible.
4. If a user manually adds a conflicting recipe:

   * UI clearly warns:

     * “This recipe contains gluten, which violates your NO_GLUTEN requirement.”

#### 4.2.2 Cost Controls for a Meal Plan

1. Household sets a weekly budget: `$150/week`.
2. They design a 2-week MealPlan.
3. Swan generates a **ShoppingList**.
4. Cost Engine:

   * Uses stored or fetched PriceQuotes.
   * Computes estimated total cost.
   * Compares to budget:

     * If over-budget:

       * Identifies high-cost recipes/ingredients.
       * Suggests cheaper swaps:

         * “Replace steak dinner on Friday with chicken stir-fry → save ~$18/week.”
5. User can:

   * Accept swaps.
   * Adjust budget.
   * Choose different stores.

#### 4.2.3 Feedback and Autopilot Adjustments

1. Autopilot enabled for a person with:

   * `calorieAdjustmentBounds`: `-10%` to `+10%`.
   * `costSensitivity`: `0.7`.
2. Over a 3-week window:

   * Weight is drifting up instead of down.
   * Grocery spend is 20% over budget.
3. Feedback Engine generates insights:

   * “You have averaged 12% over your calorie target.”
   * “Spending exceeds budget by $30/week; these 3 recipes account for most overspend.”
4. Autopilot proposes:

   * Reduce daily calorie target by 5%.
   * Swap 2 expensive dinners for cheaper, nutrient-equivalent ones.
5. If `requireUserApproval = true`:

   * User reviews and accepts/rejects.
6. If `requireUserApproval = false`:

   * Changes are applied automatically.
   * AutopilotChange records are created.
   * User sees a summary of changes and reasons.

#### 4.2.4 Eco Awareness and Adjustments (Future)

1. Household enables EcoProfile with:

   * `ecoIntensity = GENTLE`
   * `weightWasteReduction = 0.8`
   * `maxCostDeltaPercent = 3`.
2. Over a month:

   * WasteLog + ShoppingList show ~15% of fresh herbs and greens being thrown away.
3. Feedback Engine (ECO category) creates insight:

   * “You often discard herbs and greens; a mid-week ‘use-up’ meal could reduce waste.”
4. Eco-aware Autopilot (if enabled) suggests:

   * Add a “use-up pasta” recipe to Wednesdays using likely leftover vegetables.
   * Swap one high-waste ingredient (e.g., bagged salad) for a more stable alternative (e.g., frozen mixed veg).
5. User approves changes, seeing:

   * Estimated savings in waste and cost.

---

## 5. Backend Design

### 5.1 GraphQL Schema (High-Level)

Core types (existing):

* `User`, `Household`, `PersonProfile`
* `BodyMetricLog`, `TemporaryState`
* `GoalSet`, `GoalTarget`
* `Nutrient`, `Supplement`, `Prescription`
* `Meal`, `Recipe`, `Ingredient`
* `MealPlan`, `MealPlanDay`, `MealPlanSlot`
* `IntakeLog`
* `FamilyScalingConfig`

New types:

* `DietProfile`, `DietPattern`, `DietRequirement`
* `Budget`, `Store`, `PriceQuote`, `ShoppingList`, `ShoppingListItem`
* `FeedbackInsight`, `AutopilotConfig`, `AutopilotChange`
* (Future) `EcoProfile`, `EcoImpactDefinition`, `WasteLog`, `EcoMetricSnapshot`

Key operations (examples):

* **Diet Preferences**

  * `query dietProfile(personId)`
  * `mutation upsertDietProfile(input)`
  * `mutation upsertDietRequirement(input)`

* **Budget & Cost**

  * `query budget(householdId)`
  * `mutation upsertBudget(input)`
  * `query estimatedPlanCost(mealPlanId, storeIds)`
  * `query shoppingList(mealPlanId)`
  * `query costOptimizationSuggestions(mealPlanId, budgetId)`

* **Feedback & Autopilot**

  * `query feedbackInsights(targetId, dateRange)`
  * `mutation configureAutopilot(input)`
  * `mutation applyAutopilotChange(changeId)`
  * `subscription autopilotChanges(targetId)`
  * `subscription feedbackUpdated(targetId)`

* **(Future Eco)**

  * `query ecoProfile(householdId)`
  * `mutation upsertEcoProfile(input)`
  * `mutation logWaste(input)`
  * `query ecoMetrics(householdId, dateRange)`

Backend runs scheduled jobs to:

* Recompute FeedbackInsights periodically.
* Refresh store PriceQuotes.
* Trigger Autopilot runs.
* (Future) Aggregate EcoMetricSnapshots.

### 5.2 Implementation Details

* **Fastify** HTTP server.
* **GraphQL Yoga** or **Apollo Server**:

  * WebSocket support for subscriptions.
* **Prisma**:

  * All entities mapped to tables.
  * Migrations for schema changes.
* **Redis**:

  * Pub/sub for GraphQL subscriptions.
  * Caching for:

    * Nutrient definitions.
    * Store price data.
    * (Future) eco factor tables.
* **External APIs**:

  * Price data via cost-engine adapters.
  * (Future) optional eco data (e.g., CO₂ factors, seasonality) via eco-engine adapters.

---

## 6. Frontend Design

### 6.1 Framework & Routing

* **Next.js App Router**:

  * Server Components for heavy data pages.
  * Client Components for editors and interactive flows.

High-level routes:

* `/` – Household dashboard
* `/households/:id` – Family overview
* `/people/:id` – Person overview (Body, Goals, Diet, Feedback)
* `/plans` – Meal plans list
* `/plans/:id` – Meal plan editor
* `/shopping/:planId` – Shopping list & cost breakdown
* `/settings/diet` – Diet Preferences & Requirements
* `/settings/budget` – Budget configuration
* `/settings/autopilot` – Autopilot config
* `/feedback` – Feedback & insights feed
* `/settings/eco` – (Future) EcoProfile and waste tracking

### 6.2 GraphQL Client & State

* **Apollo Client** or **urql**:

  * GraphQL Codegen for typed hooks.
* Usage pattern:

  * Queries: data loading.
  * Mutations: updates.
  * Subscriptions: real-time updates (plans, feedback, autopilot changes).

UI-level state:

* **Zustand** (or similar) for:

  * Currently edited plan.
  * Filters, UI preferences.
  * Non-critical local state.

### 6.3 UI / UX

Key views:

* **Diet Settings View**

  * Pattern toggles (Vegan, Vegetarian, Paleo, etc.) with mode: Required/Preferred.
  * Liked/disliked ingredients.
  * Medical requirements (No Gluten, Low Sodium, etc.).
  * Warnings when active plans conflict.

* **Budget & Cost View**

  * Configure weekly/monthly budgets.
  * Select stores.
  * Show:

    * Plan cost vs budget.
    * Top cost drivers.
  * Suggest cost-saving swaps.

* **Meal Plan Editor**

  * Calendar/grid for meals.
  * Side panel:

    * Nutrient coverage vs goals.
    * Cost estimate vs budget.
    * Diet requirement compliance.
    * (Future) Eco summary: estimated waste risk, CO₂.

* **Feedback & Autopilot View**

  * Insight feed with filters (Nutrition, Budget, ECO, etc.).
  * Autopilot status and recent changes.
  * Ability to revert changes or adjust Autopilot settings.

* **Eco View (Future)**

  * Simple graphs:

    * Food waste trend.
    * Approximate CO₂ per week relative to user’s own baseline.
    * Packaging breakdown.
  * “Practical tips” and small, low-friction actions.

### 6.4 Forms & Validation

* **React Hook Form** + **Zod** schemas:

  * Body Profiles
  * Diet Preferences & Requirements
  * Budget
  * AutopilotConfig
  * (Future) EcoProfile, WasteLog

Shared types:

* Generated from GraphQL schema: `XYZInput` types reused across client & server.

---

## 7. Testing & Quality

### 7.1 What Must Be Tested Hard

* **Scaling Engine Math**

  * Portion sizing for mixed-needs families.

* **Nutrient Coverage Calculations**

* **Budget and Cost Estimation**

  * Stability under price changes.

* **Constraint Handling**

  * DietRequirements never violated by:

    * Planner suggestions.
    * Autopilot changes.

* **Autopilot Adjustments**

  * Respect bounds, preferences, budgets.

* **(Future) Eco Calculations**

  * Waste rate & CO₂ calculations are consistent & explainable (even if approximate).

### 7.2 Tooling

* Unit tests: **Vitest** or **Jest**.
* Integration tests: GraphQL API + Prisma test DB.
* E2E tests: **Playwright** or **Cypress**:

  * Core flows:

    * Create household, set preferences, build plan, see budget & feedback, enable Autopilot, observe changes.

---

## 8. Getting Started (Developer)

### 8.1 Prerequisites

* Node.js 20+
* pnpm
* Docker (Postgres + Redis)
* Git

### 8.2 Setup

```bash
# Clone
git clone https://github.com/your-org/swan-health.git
cd swan-health

# Install deps
pnpm install

# Start infra
docker compose up -d

# Env
cp .env.example .env
# fill in DB, Redis, any API keys for price providers (optional in dev)

# DB
pnpm db:migrate
pnpm db:seed   # optional

# Dev servers
pnpm dev
```

* Web: `http://localhost:3000`
* API: `http://localhost:4000/graphql`

### 8.3 Useful Commands

```bash
pnpm dev           # run web + api
pnpm dev:api       # api only
pnpm dev:web       # web only

pnpm test          # all tests
pnpm lint          # ESLint
pnpm typecheck     # tsc

pnpm db:studio     # Prisma Studio
pnpm db:migrate    # apply migrations
```

---

## 9. Project Goals & Non-Goals

### 9.1 Goals

1. **Make eating well dramatically easier for families.**
2. **Respect real-world constraints**: physiology, preferences, medical requirements, money, and (optionally) eco impact.
3. **Make nutritional adequacy visible and actionable.**
4. **Provide a semi-automated “Autopilot” that makes safe, conservative adjustments.**
5. **Lay a clean foundation for future exercise, medical, mental health, eco, and longevity features.**

### 9.2 Non-Goals (for initial versions)

* Fully conversational, human-like “AI therapist/coach” chat interface.
* Social networking features (feeds, follows, likes).
* Wearable integrations (smartwatches, CGMs) in early versions.
* Organ-level simulation.
* Moralizing climate/ethics scoring. Eco features are **optional** and framed around:

  * Saving money,
  * Reducing waste,
  * Simple feel-good improvements.

Autopilot is **rule-based and data-driven**, not a black-box “magic AI brain.”

---

## 10. Contributing

* Strict TypeScript.
* No `any` in core domains (`domain`, `cost-engine`, `feedback-engine`, `eco-engine`).
* Changes to:

  * Nutrient math
  * Scaling math
  * Budget calculation
  * Autopilot logic
  * Eco impact calculations
    **must include tests and documented assumptions**.

Process:

1. Open an issue or proposal for substantial changes.
2. Collaborate on design in `docs/`.
3. Implement with tests + type safety.
4. Submit PR, pass CI, review, merge.

---

## 11. Architecture Checkpoint

If you’ve actually internalized Swan Health at this point, you should be able to explain:

1. **How DietPreferences and DietRequirements differ, and how the planner uses each.**
2. **How the Cost Engine plugs into Meal Plans and Budget to suggest cheaper alternatives.**
3. **How Feedback + Autopilot work together without violating hard constraints.**
4. **How an EcoProfile could influence meal planning without ever overriding health or budget safety.**

If you can’t explain those, you don’t really understand the system yet.

---

**Swan Health** — *Designed for real people, real families, real constraints.*


