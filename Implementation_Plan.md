# Implementation_Plan.md

Swan Health – Implementation Plan  
**Goal:** Build Swan Health in small, vertical slices that deliver real value early, while keeping the codebase clean, testable, and extensible. Each phase is split into **three parallel workstreams** so Scott, Claude, and Greg can work concurrently and recombine cleanly.

This plan:

- Reframes the old `RELEASE_PLAN.md` into **implementation phases**
- Maps phases to the **Core Product Concepts** in `README.md`
- Defines **three pieces per phase** (A/B/C) that:
  - Touch different layers (domain, API/DB, UI)
  - Minimize merge pain
  - Keep responsibilities sane
- Emphasizes **pseudocode & design review of file structure** before heavy implementation

---

## 0. Implementation Principles

### 0.1 Design & Ownership Principles

- **Vertical slices > horizontal layers** per phase:
  - Each workstream (A/B/C) should deliver a usable vertical slice (domain + API + UI) for its feature.
- **Domain-first, schema-first**:
  - Types & domain logic live in `packages/domain` and `packages/database` first.
  - GraphQL & frontend follow those contracts.
- **Small, composable modules**:
  - No “god files”:
    - Each file has a clear responsibility (e.g. `mealPlanScoring.ts`, `familyScaling.ts`, `prepGenerator.ts`).
  - Pseudocode structure first; code review on **file boundaries** before filling in implementation.
- **Determinism & explainability**:
  - Planner/Autopilot logic must be deterministic given a seed and fully testable.
- **Health/money safety rules get extra scrutiny**:
  - Nutrient math, scaling, budgets, and Autopilot changes require dedicated tests and documented assumptions.

### 0.2 Three Workstreams per Phase

For each phase, we’ll use the same pattern:

- **Workstream A – Domain & DB**
  - Types, pure functions, Prisma models.
- **Workstream B – API & Services**
  - GraphQL schema, resolvers, HTTP, jobs.
- **Workstream C – UI & UX**
  - Next.js pages, components, data hooks.

Any engineer can take any stream. The important part is the **shape** of each piece, not who does it.

### 0.3 Pseudocode-First Rule

For **every new module**:

1. Create the file with:
   - Type definitions.
   - Function signatures.
   - Pseudocode comments describing the algorithm.
2. PR for **structure** first (without full logic).
3. After review, fill in implementation and tests.

This is mandatory in **Phase 0 and Phase 1**, and strongly encouraged afterwards.

---

## 1. Concept → Phase Map (README → Implementation Phases)

This roughly maps `README.md` concepts to implementation phases.

| README Concept                                         | First Implementation Phase (Meaningful) |
|--------------------------------------------------------|-----------------------------------------|
| 2.1 Body Profiles                                      | **Phase 1**                             |
| 2.2 Temporary States                                   | **Phase 1** (schema), richer in **Phase 3+** |
| 2.3 Goals & Targets                                    | **Phase 1**                             |
| 2.4 Nutrients, Supplements, Prescriptions, “?” layer   | **Phase 3**                             |
| 2.5 Meal Tracking                                      | **Phase 1** (macros), richer in **Phase 3** |
| 2.6 Meal Planning (1–6+ week plans, algorithm)         | **Phase 2** (single + family energy), **Phase 3** (full planner v1) |
| 2.7 Family Mode & Scaling Engine                       | **Phase 2** (calories), refined in **Phase 3** |
| 2.8 Handling Real-Life Deviations                      | **Phase 3**                             |
| 2.9 Diet Preferences & Diet Requirements               | **Phase 3**                             |
| 2.10 Cost Controls & Budgeting                         | **Phase 4**                             |
| 2.11 Feedback Engine & Autopilot                       | **Phase 5**                             |
| 2.12 Exercise, Medical, Mental, Sex-specific, Research, Longevity | **Phase 6+** (future)      |
| 2.13 Eco Footprint & Waste Reduction                   | **Phase 4+** (Eco v1 in 4, v2+ later)   |

This Implementation Plan focuses on **Phases 0–5**, i.e., everything needed to get to the **v2.1 MVP + early coaching hooks**.

---

## 2. Phase 0 – Project Skeleton & Pseudocode Wireframes

**Goal:** Have a running monorepo skeleton, with agreed-upon module/file structure and pseudocode for the core spines. No real features yet; just enough to prove plumbing and avoid later refactors.

### Phase 0 Deliverables

- Monorepo with:
  - `apps/api`, `apps/web`
  - `packages/domain`, `packages/database`, `packages/graphql-schema`, `packages/ui`, `packages/config`
- Minimal GraphQL server + single query to prove end-to-end.
- Minimal Next.js app hitting that query.
- Pseudocode stubs for:
  - `PersonProfile`, `Household`, `Meal`, `MealPlan` domain modules
  - Planner / scaling / prep root modules (signatures + comments, no full logic)

### Workstream A – Repo & Infrastructure Skeleton

**Focus:** Repo layout, tooling, infra stubs.

**Tasks:**

- Create monorepo structure:
  - `apps/api`, `apps/web`
  - `packages/domain`, `packages/database`, `packages/graphql-schema`, `packages/ui`, `packages/config`
- Tooling setup:
  - `pnpm` workspaces
  - Turborepo config
  - Shared ESLint, Prettier, TSConfig in `packages/config`
- Infra:
  - `infra/docker/docker-compose.yml` for Postgres + Redis.
  - Basic `.env.example` + scripts for local setup.
- CI skeleton:
  - Lint, typecheck, unit test jobs.

**Pseudocode work:**

- Define top-level directory structure in a doc (`docs/architecture/file_layout.md`).
- Only stub minimal `index.ts` files for each package.

---

### Workstream B – API Skeleton & GraphQL Wiring

**Focus:** API app, Fastify + GraphQL, first query.

**Tasks:**

- `apps/api`:
  - Fastify server with GraphQL Yoga/Apollo.
  - Healthcheck route.
- `packages/graphql-schema`:
  - Basic `User` type and `me` query (hardcoded user).
  - GraphQL Codegen configuration.
- Wire `apps/api` → `packages/graphql-schema`.

**Pseudocode work:**

- Pseudocode file: `packages/graphql-schema/src/schema.ts`
  - Commented stub for types: `Household`, `PersonProfile`, `Meal`, `MealPlan`.
  - No resolvers yet, just intended shape.

---

### Workstream C – Web Skeleton & UI Baseline

**Focus:** Next.js app structure, UI primitives, GraphQL client wiring.

**Tasks:**

- `apps/web`:
  - Next.js App Router baseline.
  - Layout with header/sidebar stubs.
- GraphQL client:
  - Apollo or urql setup.
  - Single `useMeQuery` hook from Codegen.
  - Render “Hello, {user.email}” to prove end-to-end.
- `packages/ui`:
  - Shared button, card, layout components (simple Tailwind + Radix).

**Pseudocode work:**

- Pseudocode for key routes:
  - `/households/:id` (household dashboard)
  - `/people/:id` (person overview)
  - `/plans/:id` (plan editor)
  - Each page: comments describing main sections and data hooks, but minimal JSX.

---

## 3. Phase 1 – Core Entities, Goals, & Manual Tracking

**Goal:** Have a working app where households and people exist, body metrics and meals are logged, and users see macros vs goals.

### Phase 1 Deliverables

- `User`, `Household`, `PersonProfile`, `BodyMetricLog`, `Meal`, and `IntakeLog` implemented.
- GoalSet v1 (energy + macros).
- Daily/weekly macro dashboards for each person.

### Workstream A – Domain & DB for Profiles, Goals, Logging

**Tasks:**

1. **Database & Prisma models**
   - Tables:
     - `User`, `Household`, `PersonProfile`
     - `BodyMetricLog`
     - `Food`, `Meal`, `IntakeLog`
     - `GoalSet`, `GoalTarget`
   - Migrations + seed data for a few sample foods.

2. **Domain modules (pseudocode → implementation)**
   - `packages/domain/src/profiles/personProfile.ts`
     - Create/update profile.
     - Compute age groups.
   - `packages/domain/src/goals/goalSet.ts`
     - Derive default GoalSet from PersonProfile.
     - Functions:
       - `computeBaselineTargets(profile, temporaryStates)`
       - `applyOverrideTargets(goalOverrides)`
   - `packages/domain/src/nutrition/intakeAggregation.ts`
     - Aggregate IntakeLogs → daily macros.

3. **Tests**
   - Unit tests for:
     - Goal calculation (baseline).
     - Macro aggregation per day.

---

### Workstream B – API & GraphQL for Profiles, Goals, Logging

**Tasks:**

1. **GraphQL types & inputs**
   - Types:
     - `Household`, `PersonProfile`, `BodyMetricLog`, `Food`, `Meal`, `IntakeLog`, `GoalSet`.
   - Inputs:
     - `CreateHouseholdInput`, `UpsertPersonProfileInput`, `LogMealInput`, `UpsertGoalSetInput`.

2. **Resolvers**
   - Household queries & mutations:
     - `myHouseholds`, `createHousehold`.
   - Person profile:
     - `personProfile(id)`, `upsertPersonProfile`.
   - Goals:
     - `goalSet(personId)`, `upsertGoalSet`.
   - Logging:
     - `logMeal`, `logBodyMetric`.

3. **Auth plumbing**
   - Basic user context on GraphQL requests (userId).
   - Simple “user owns household” checks.

4. **Tests**
   - Integration tests (GraphQL) for:
     - Create household → create person → set goals → log meals.

---

### Workstream C – UI for Profiles, Goals, & Macro Dashboards

**Tasks:**

1. **Household & person flows**
   - `/`: list households.
   - `/households/:id`:
     - List members.
     - Button to add person.
   - `/people/:id`:
     - Profile form.
     - Goal form (calories + macros).

2. **Meal logging UI**
   - Simple meal logging page:
     - Select person.
     - Add foods (autocomplete from seed list).
     - Show daily macros vs goals.

3. **Dashboards**
   - Person dashboard showing:
     - Last 7 days calories vs target (simple chart).
     - Protein vs target.

4. **UX tests**
   - Manual flows:
     - Create household, add person, set goals, log meals and see dashboard.

---

## 4. Phase 2 – Meal Planning & Family Scaling (Energy-First)

**Goal:** Move from pure tracking to simple multi-week meal planning and family portioning based on energy.

### Phase 2 Deliverables

- Recipes + ingredients v1.
- MealPlan + MealPlanDay + MealPlanSlot.
- Family Scaling Engine v1 (calories-only).
- UI to create a 1–2 week plan and see per-person portions.

### Workstream A – Domain: Recipes, Meal Plans, Family Scaling v1

**Tasks:**

1. **Database**
   - Tables:
     - `Ingredient`, `Recipe`, `RecipeIngredient`, `MealPlan`, `MealPlanDay`, `MealPlanSlot`.

2. **Domain modules**
   - `recipes/recipeDefinition.ts`
     - Functions for computing macro summaries per recipe.
   - `mealPlans/mealPlan.ts`
     - Create/edit MealPlans.
     - Add/remove recipes in slots.
   - `scaling/familyScalingV1.ts`
     - Pseudocode already in `Family_Scaling_Engine.md`:
       - Implement calories-only version:
         - Compute household energy target for each meal.
         - Compute `totalServings` and per-person servings.

3. **Tests**
   - Family scaling unit tests:
     - Single adult.
     - Two adults + kids.
     - Edge cases (small kcal-per-serving).

---

### Workstream B – API: MealPlan & Scaling GraphQL

**Tasks:**

1. **GraphQL types**
   - `Ingredient`, `Recipe`, `RecipeIngredient`.
   - `MealPlan`, `MealPlanDay`, `MealPlanSlot`.
   - `ScalingOutput`, `PlateInstruction`.

2. **Mutations**
   - `createRecipe`, `updateRecipe`.
   - `createMealPlan`, `updateMealPlan`.
   - `addRecipeToSlot`, `removeRecipeFromSlot`.

3. **Computed fields & resolvers**
   - On `MealPlan`:
     - `nutritionSummary` (simple macro sums).
     - `familyScaling(mealPlanDayId, slot)` → uses domain scaling.

4. **Tests**
   - GraphQL integration for:
     - Create plan → add recipes → read scaling recommendations.

---

### Workstream C – UI: Plan Editor & Portion Guidance

**Tasks:**

1. **Plan list & editor**
   - `/plans`:
     - List MealPlans per household.
   - `/plans/:id`:
     - Calendar-like layout.
     - Ability to set recipes in each slot.

2. **Per-meal portion guidance**
   - On each meal:
     - Show per-person suggested portions in servings/grams.
     - Highlight if plan’s average calories/day is far from target.

3. **Basic UX**
   - Pre-built recipe library page:
     - Search by name, tags.

---

## 5. Phase 3 – Diet Constraints, Full Planner v1, Deviations, Micros & “?” Layer

**Goal:** Upgrade planner to be constraints-aware, add diet preferences/requirements, real-life deviations, micros, and basic “?” info layer.

### Phase 3 Deliverables

- DietProfile & DietRequirement implemented and integrated into planner.
- Planner v1: multi-week, constraint-aware plan generation.
- Real-life deviations (restaurants, holidays, plan vs actual).
- Nutrient micro support + supplement/prescription logging with basic “?” panels.

### Workstream A – Domain: Diet, Micros, Planner v1

**Tasks:**

1. **Diet domain types**
   - `diet/dietProfile.ts`:
     - Patterns (REQUIRED/PREFERRED).
     - Ingredient likes/dislikes.
   - `diet/dietRequirement.ts`:
     - HARD vs SOFT constraints.
     - Helpers:
       - `recipeSatisfiesRequirements(recipe, requirements[])`.

2. **Nutrient & intake upgrades**
   - Extend nutrient definitions to key micros.
   - Upgrade `intakeAggregation.ts` to track micros.
   - Supplement & prescription domain:
     - `supplements/supplementSchedule.ts`.
     - `prescriptions/prescriptionSchedule.ts`.

3. **Planner v1 domain**
   - `planner/mealPlanningAlgorithm.ts`:
     - Implement the algorithm from `Meal_Planning_Algorithm.md`:
       - Precompute targets.
       - Filter recipe pool by DietRequirements & equipment.
       - Seed baseline plan.
       - Local search to refine (no Autopilot yet, just manual call).
   - `planner/planScoring.ts`:
     - PlanMetrics & PlanScore.

4. **Tests**
   - Unit tests for:
     - DietRequirement filters.
     - Plan scoring.
     - Local search on small synthetic examples.

---

### Workstream B – API: Constraints, Planner Run, Deviations

**Tasks:**

1. **GraphQL types**
   - `DietProfile`, `DietPattern`, `DietRequirement`.
   - `Supplement`, `Prescription`, `SupplementLog`, `PrescriptionLog`.
   - `PlanMetrics`, `PlanScore`.

2. **Mutations**
   - `upsertDietProfile`, `upsertDietRequirement`.
   - `upsertSupplementSchedule`, `logSupplementIntake`.
   - `planMealPlan(householdId, input)`:
     - Calls `mealPlanningAlgorithm`.
     - Returns `MealPlan` with PlanMetrics/Score.

3. **Real-life deviations**
   - Extend `Meal`/`IntakeLog`:
     - Fields: `type` (HOME, RESTAURANT, HOLIDAY).
   - New queries:
     - `planVsActual(personId, dateRange)`.

4. **Tests**
   - GraphQL integration:
     - Setting diet constraints and generating a plan.
     - Logging restaurant meals and seeing plan vs actual.

---

### Workstream C – UI: Constraints, Planner UX, “?” Info Layer

**Tasks:**

1. **Diet settings UI**
   - `/settings/diet`:
     - Pattern toggles, required/preferred.
     - Ingredient like/dislike management.
     - Medical requirements form.

2. **Planner UX**
   - On `/plans`:
     - “Generate plan” button.
     - Show PlanScore & PlanMetrics.
   - Plan vs Actual view:
     - Visual differences per day.

3. **Micros & “?” layer**
   - Nutrient info panels:
     - Small modal with explanation pulled from static or docs-backed content (no medical advice).
   - Supplement/prescription schedule:
     - Per-person view showing upcoming doses anchored to meals.

---

## 6. Phase 4 – Cost Engine, Budgets, ShoppingList, Eco v1 (Waste)

**Goal:** Bring money and waste into the planner: budgets, estimated costs, shopping lists, and basic waste awareness.

### Phase 4 Deliverables

- Budget entity + cost estimation.
- ShoppingList generated from MealPlans.
- WasteLog & EcoProfile v1 (waste focus).
- Planner aware of budget constraints (soft at first, then strict for MVP).

### Workstream A – Domain: Budget, Cost, Waste, Eco v1

**Tasks:**

1. **Cost & budget domain**
   - `budget/budget.ts`:
     - Household budgets (weekly/monthly).
   - `cost/ingredientCostModel.ts`:
     - `estimatedPricePerUnit` per ingredient.
   - `cost/planCostEstimator.ts`:
     - Functions:
       - `buildShoppingList(mealPlan)`
       - `estimatePlanCost(shoppingList, priceTable)`

2. **Waste & eco v1**
   - `eco/ecoProfile.ts`:
     - Waste-focused EcoProfile.
   - `eco/wasteLog.ts`:
     - Log wasted ingredients/recipes.
   - `eco/wasteMetrics.ts`:
     - Per-period waste rate metrics.

3. **Tests**
   - Cost estimation unit tests with synthetic price tables.
   - Waste metric calculations.

---

### Workstream B – API: Budgets, ShoppingList, Waste

**Tasks:**

1. **GraphQL**
   - Types:
     - `Budget`, `ShoppingList`, `ShoppingListItem`.
     - `WasteLogEntry`, `EcoProfile`.
   - Queries:
     - `budget(householdId)`, `shoppingList(mealPlanId)`, `estimatedPlanCost(mealPlanId)`.
   - Mutations:
     - `upsertBudget`, `logWaste`, `upsertEcoProfile`.

2. **Planner integration**
   - The planner endpoint from Phase 3:
     - Extended to:
       - Attach estimated cost & budget info to PlanMetrics.
       - Optionally reject plans that exceed a strict budget.

3. **Tests**
   - GraphQL tests for budget and cost endpoints.
   - Planner-integration tests with small plans.

---

### Workstream C – UI: Budget, Shopping & Waste Awareness

**Tasks:**

1. **Budget UI**
   - `/settings/budget`:
     - Set weekly/monthly budgets.
   - Display budget vs estimated cost on plan pages.

2. **Shopping list UI**
   - `/shopping/:planId`:
     - Show aggregated shopping list.
     - Group by ingredient category.

3. **Waste UI**
   - Simple waste logging:
     - Quick entry form for wasted food / reason.
   - Waste trend view:
     - “Waste %” over time.

---

## 7. Phase 5 – Feedback Engine v1 & Autopilot v1 (User-Approved Only)

**Goal:** Add feedback insights and a constrained, user-approved Autopilot that proposes changes but does not auto-apply.

### Phase 5 Deliverables

- FeedbackEngine v1 (insights only).
- AutopilotConfig + AutopilotChange schema.
- Autopilot proposals based on FeedbackInsights, with user approval flow.
- No auto-apply yet; this is conservative.

### Workstream A – Domain: Feedback & Autopilot Logic v1

**Tasks:**

1. **Feedback domain**
   - `feedback/feedbackInsight.ts`:
     - Types and helpers.
   - `feedback/feedbackEngine.ts`:
     - Batch functions that:
       - Given logs & plans, produce insights (nutrition, budget, waste).

2. **Autopilot domain**
   - `autopilot/autopilotConfig.ts`:
     - Config constraints.
   - `autopilot/autopilotEngine.ts`:
     - Given:
       - FeedbackInsights, current MealPlan/GoalSet, constraints.
     - Produce `AutopilotChange` objects:
       - Adjustment proposals without applying them.

3. **Tests**
   - Pure function tests for:
     - Insight generation (synthetic data).
     - Autopilot proposals, verifying they respect bounds and constraints.

---

### Workstream B – API: Feedback & Autopilot GraphQL

**Tasks:**

1. **GraphQL**
   - Types:
     - `FeedbackInsight`, `AutopilotConfig`, `AutopilotChange`.
   - Queries:
     - `feedbackInsights(targetId, dateRange)`.
   - Mutations:
     - `configureAutopilot(input)`.
     - `runAutopilot(householdId)`:
       - Produces changes in PENDING status.
     - `applyAutopilotChange(changeId)`, `rejectAutopilotChange(changeId)`.

2. **Jobs**
   - BullMQ jobs for:
     - Periodic feedback recalculation.
     - Optional scheduled Autopilot runs (still user-approved).

3. **Tests**
   - GraphQL workflow tests:
     - Configure Autopilot, run, view changes, apply/reject.

---

### Workstream C – UI: Feedback Feed & Autopilot Review

**Tasks:**

1. **Feedback feed**
   - `/feedback`:
     - List insights by category (Nutrition/Budget/Eco).
     - Filter by severity.
     - Link to relevant pages (plan, budget, etc.).

2. **Autopilot review**
   - `/settings/autopilot`:
     - Config form (bounds, allowed recipes/slots).
   - “Review changes” panel:
     - List of pending AutopilotChanges.
     - Show diff (e.g., old vs new recipe, or target change).
     - Accept/reject actions.

3. **UX checks**
   - Ensure all automatic proposals are clearly explained and reversible.

---

## 8. Phase 6+ – Future Lanes (High-Level Only)

Beyond Phase 5, the pattern continues:

- **Phase 6 – Exercise Planner**: domain → API → UI.
- **Phase 7 – Mental Health & Sleep Logs**.
- **Phase 8 – Sex-Specific Health States**.
- **Phase 9 – Medical Data Integration**.
- **Phase 10 – Research/Cohorts**.
- **Phase 11 – Longevity Lens**.

Each would again be split into three workstreams (Domain, API, UI) with pseudocode-first for any complex logic.

---

## 9. Cross-Phase Definition of Done

For **any feature touching**:

- Nutrient math
- Scaling math
- Budget/cost calculations
- Autopilot logic
- Eco/Waste metrics

**Done means:**

1. Pseudocode reviewed and approved (file structure, boundaries).
2. Domain implementation with unit tests.
3. GraphQL wiring with integration tests.
4. UI flows exercised end-to-end (manual + basic E2E where appropriate).
5. Documentation updated:
   - Short design note in `docs/` describing assumptions.

---

If you want to pressure-test this, pick **Phase 1** and walk through:

- How you’d split work between Scott/Claude/Greg for a week,
- Which pseudocode modules you’d want to see **before** anyone touches real logic.

If you can do that without hand-waving, the plan is solid. If you can’t, that’s the phase to refine first.
