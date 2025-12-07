```markdown
# RELEASE_PLAN.md

Swan Health – Release & Evolution Plan  
**Goal:** Ship value early, avoid painting ourselves into a corner, and deliberately build the foundations for the long-term vision.

This document describes:

- How Swan Health will evolve from **v1.0 → v4.x**  
- Which features land when  
- Which **foundational work** must be done early to avoid tech debt  
- Constraints on **backward compatibility** and data model evolution

---

## 0. Versioning Philosophy

### 0.1 Version Scheme

We’ll use a **product-oriented semantic-ish** scheme:

- **Major (1.x, 2.x, 3.x, 4.x)**  
  - Represents a **product era** or major capability shift.
  - Each major line has a clear theme.

- **Minor (1.0, 1.1, 1.2, …)**  
  - Represents a **coherent, shippable milestone** with defined scope.

- **Patch (1.0.1, 1.0.2, …)**  
  - Bugfixes, performance improvements, small non-breaking UX tweaks.
  - Not planned here; handled as needed.

### 0.2 Thematic Arcs

- **1.x – Foundations & Core Tracking**
  - Bodies, goals, meal logging, basic family support, basic dashboards.

- **2.x – Constraints, Cost & Smart Planning**
  - Diet preferences & requirements fully integrated.
  - Cost controls, budgets, and local pricing.
  - Meal planner matures.

- **3.x – Coaching & Autopilot**
  - Feedback engine.
  - Autopilot mode with safe, constrained adjustments.
  - Early “coach-like” behavior without full AI black boxes.

- **4.x – Holistic Health & Research**
  - Mental and sex-specific health modules.
  - Medical data integration.
  - Research / citizen science.
  - Longevity context.

### 0.3 Cross-Cutting Rules

These apply to **every** release:

1. **Schema-First Thinking**
   - GraphQL schema and Prisma schema are the contracts.
   - All breaking changes require a deprecation path or versioned fields.

2. **End-to-End Typing**
   - No `any` in core domain logic.
   - Shared types between backend and frontend via GraphQL Codegen.

3. **Reversible Autopilot / Planner Behavior**
   - Any automatic adjustment is auditable and reversible.
   - History tables or event logs for key decisions.

4. **Migration Discipline**
   - Every schema change has:
     - Prisma migration
     - Data backfill strategy (if needed)
     - Rollback thought through.

5. **User Trust: Health & Money**
   - Nutritional calculations & budgets must be correct and tested.
   - Every release that changes math or money behavior includes tests and short design note.

---

## 1. Release Overview

High-level map; details follow.

| Version | Theme                                      | Primary Deliverables                                              |
|---------|--------------------------------------------|-------------------------------------------------------------------|
| 1.0     | Core Entities & Manual Tracking            | Auth, households, person profiles, manual meal logging, macros   |
| 1.1     | Goals & Dashboards                         | Goals/targets, macro dashboards, basic nutrient support          |
| 1.2     | Single-User Meal Planning                  | 1–2 week plans, basic nutrient-aware planning                    |
| 1.3     | Households & Family Scaling (calories)     | Household model, calorie-based family scaling                    |
| 1.4     | Hardening & Observability                  | Perf, tests, logging/metrics, UX polish                          |
| 2.0     | Diet Preferences & Requirements            | Diet profiles integrated into planner & logging                  |
| 2.1     | Budget & Cost Engine (v1)                  | Budgets, internal cost model, plan cost estimates                |
| 2.2     | Local Pricing & Deal Suggestions (v2)      | Store integrations, deal suggestions                             |
| 2.3     | Nutrient-Aware Family Planning (full)      | Family scaling for nutrients, not just calories                  |
| 3.0     | Feedback Engine (Insights)                 | Insight system & notifications; no Autopilot yet                 |
| 3.1     | Autopilot (constrained)                    | Configurable Autopilot, user-approved changes                    |
| 3.2     | Autopilot (budget & state-aware)           | Integrate cost, temporary states, diet constraints into Autopilot|
| 4.0     | Mental & Sex-Specific Health Modules       | Mood, stress, sleep; women’s & men’s health basics               |
| 4.1     | Medical Data Integration (labs, etc.)      | Attach labs/scans, use them in targets & feedback (read-only)    |
| 4.2     | Research & Citizen Science                 | Opt-in data sharing, cohorts, simple researcher tools            |
| 4.3     | Longevity Context                          | Basic aging/longevity metrics + framing in dashboards            |

You can always add small 1.x.y patch releases for bugfixes.

---

## 2. Major Line 1.x – Foundations & Core Tracking

**Goal:** Have a working app where a person (and then a family) can log their intake, see where they stand vs simple goals, and start using a basic meal plan. All later features will sit on top of this.

### 2.1 v1.0 – Core Entities & Manual Tracking

**Theme:** Get the domain backbone and basic tracking into place.

#### Scope

- **Auth & User Management**
  - Minimal login (email/password or OAuth).
  - Session management (tokens, refresh).

- **Households**
  - Create household.
  - Invite members via email.
  - Roles: owner, adult member (children as PersonProfiles only).

- **Person Profiles**
  - Age, sex, gender.
  - Height, weight.
  - Basic vitals: blood pressure.
  - Very simple UI to create/edit.

- **Body Metric Logs**
  - Log weight & blood pressure.
  - Basic history display (table or simple chart).

- **Nutrient Definitions (Phase 1)**
  - Minimal: calories, protein, carbs, fats, fiber.
  - Configured in a static seed in DB.

- **Meal Logging**
  - Define simple “foods” with macros.
  - Log meals per day per person.
  - Aggregate macros by day.

#### Non-Goals

- No meal plans yet.
- No diet preferences.
- No budgets/cost.
- No Autopilot.

#### Tech Foundations (must do here)

- Monorepo structure (`apps/api`, `apps/web`, `packages/domain`, `packages/database`, `packages/graphql-schema`).
- GraphQL API with basic authentication & `me` query.
- Prisma + migrations pipeline set up.
- Type-safe client via GraphQL Codegen.
- Minimal CI: lint, typecheck, unit tests.

---

### 2.2 v1.1 – Goals & Dashboards

**Theme:** Turn raw logs into meaningful comparisons.

#### Scope

- **GoalSet & GoalTargets**
  - Core schema for goals per person:
    - Calorie target.
    - Macro targets (g/day).
  - UI to set/edit goals per person.

- **Daily & Weekly Dashboards**
  - Per-person views:
    - Calories vs target.
    - Protein vs target.
    - Carbs/fats vs target.
  - Simple time-series charts (e.g. last 14 days).

- **Temporary States (Phase 1 – Schema Only)**
  - Introduce `TemporaryState` entity:
    - Type (PREGNANCY, MARATHON_PREP, etc.)
    - Start/end date.
  - No complex adjustments yet; just store them.

#### Non-Goals

- No automatic target adjustment based on states (just stub).
- No nutrient details beyond macros (micros left for later).

#### Tech Foundations

- Start separating:
  - Domain logic (energy & macro calculations) into `packages/domain`.
  - Presentational UI from logic.
- Add more robust unit tests around goal calculations.

---

### 2.3 v1.2 – Single-User Meal Planning

**Theme:** Introduce 1–2 week meal plans for a single person.

#### Scope

- **MealPlan & MealPlanDay**
  - Schema for:
    - Plan: name, owner, duration (7–14 days).
    - Days with meal slots.
  - UI:
    - Calendar / grid to assign meals/recipes.

- **Recipes & Ingredients (Phase 1)**
  - Store simple recipes:
    - Name, description.
    - Ingredients with macro-level nutrient summaries.

- **Plan-Level Dashboards**
  - For a given plan and person:
    - Estimated average daily calories.
    - Estimated average macros vs goals.
  - Simple UI: “This plan is ~90% aligned with your macro targets.”

#### Non-Goals

- No family scaling yet (single-person focus).
- No diet preferences/requirements.
- No budgets.

#### Tech Foundations

- Set up basic GraphQL subscriptions (e.g. meal plan updates) to test real-time pipe.
- Lay groundwork for `ShoppingList` schema (but can be stubbed).

---

### 2.4 v1.3 – Households & Family Scaling (Calories Only)

**Theme:** Turn the single-person planning into a family-aware system, but focus on energy (calories) first.

#### Scope

- **Households Fully Integrated**
  - PersonProfiles are explicitly linked to Households.
  - Household dashboard:
    - See all members & their calorie targets.

- **Family Scaling Engine (Phase 1 – Calories Only)**
  - Given:
    - A meal with total calories.
    - Target calories per person.
  - Compute recommended portions per person.
  - UI:
    - For each meal, show per-person portion guidance.

- **Multi-Person Plans**
  - A MealPlan belongs to a Household.
  - Each Recipe can be scaled to the total household energy needs.

#### Non-Goals

- Still no diet preferences or medical requirements beyond manual user awareness.
- No nutrient-focused family scaling yet (that comes later).

#### Tech Foundations

- Design `FamilyScalingConfig` schema:
  - E.g., allow weighting (kids get slightly more of certain foods, etc.) – but even a basic version is fine.
- Unit tests for scaling math.

---

### 2.5 v1.4 – Hardening & Observability

**Theme:** Make 1.x actually robust and pleasant to use.

#### Scope

- **Performance pass**
  - Optimize common queries (indexes, DataLoader patterns).
- **Logging & Metrics**
  - Structured logging with Pino.
  - Basic metrics:
    - Request latency.
    - Query performance.
- **UX Polish**
  - Form validation.
  - Error messaging.
  - Onboarding flow improvements.

#### Non-Goals

- No new domain features.
- Just stabilization before moving into 2.x complexity.

---

## 3. Major Line 2.x – Constraints, Cost & Smart Planning

**Goal:** Respect diet preferences & requirements, bring cost into the picture, and upgrade planning to be truly “smart” (not just calorie calculators).

### 3.1 v2.0 – Diet Preferences & Requirements

**Theme:** Let users declare what they want to eat vs what they must avoid, and make the planner aware.

#### Scope

- **DietProfile Schema & UI**
  - Diet patterns:
    - Vegan, Vegetarian, Pescetarian, Omnivore, Paleo, Mediterranean, Custom tags.
    - Marked as `REQUIRED` or `PREFERRED`.
  - Ingredient preferences:
    - Liked / disliked ingredients.
    - Simple rating (like/hate), no complex scoring yet.

- **DietRequirement Schema & UI**
  - Requirements like:
    - NO_GLUTEN, LOW_SODIUM, NO_NUTS, NO_LACTOSE, etc.
  - Marked as `HARD` (medical) or `SOFT`.

- **Planner Integration (Phase 1)**
  - Filter out recipes that violate **HARD** requirements.
  - Boost ranking of recipes matching REQUIRED patterns.
  - De-prioritize recipes with disliked ingredients.

- **UI Feedback**
  - Badges on recipes: “Vegan, Low Sodium, Gluten Free”.
  - Warnings when a user tries to add a violating recipe to a plan:
    - “This recipe contains gluten but you have NO_GLUTEN requirement.”

#### Non-Goals

- No dynamic nutrient target changes based on requirements yet (e.g., low sodium = new numeric targets) – that can be phase 2.
- No Autopilot adjustments yet.

#### Tech Considerations

- Move diet logic into `packages/domain` so planner and Autopilot can share it later.
- Build recipe tag system with enough flexibility for future constraints.

---

### 3.2 v2.1 – Budget & Cost Engine (v1)

**Theme:** Let households set budgets and see how expensive their plan is, without yet pulling real-time store data.

#### Scope

- **Budget Schema & UI**
  - Budget at household level:
    - Weekly and/or monthly.
    - Currency.
  - Basic UI to set/edit.

- **Ingredient Cost Model (User-Specified)**
  - Each ingredient has an optional `estimatedPricePerUnit` (user-entered or seed data).
  - No external APIs yet.

- **ShoppingList (Phase 1)**
  - Generate aggregated shopping list for a plan:
    - Ingredient → quantity.
  - Estimate total cost using internal price data.

- **Plan vs Budget Comparison**
  - Show:
    - “This plan is estimated at $160/week vs your $150/week budget.”
  - Highlight expensive recipes (sort by cost contribution).

#### Non-Goals

- No grocery store integrations yet.
- No deal suggestions yet.

#### Tech Considerations

- Design `ShoppingList` and `Budget` API carefully; it will be reused heavily later.
- Start `cost-engine` package with pure functions for cost estimation.

---

### 3.3 v2.2 – Local Pricing & Deal Suggestions (v2)

**Theme:** Bring in real prices and basic deal suggestions.

#### Scope

- **Store & PriceQuote Schemas**
  - `Store`:
    - Name, location, any external ID.
  - `PriceQuote`:
    - Store, ingredient, price, unit, timestamp.

- **External API Integration**
  - First integration with one or two grocery or price aggregator APIs.
  - Adapter layer inside `cost-engine`:
    - Example: `getPriceQuotes(storeId, ingredientIds[])`.

- **Deal Finder (Phase 1)**
  - For each ShoppingList:
    - Show which store is cheapest overall.
    - Show alternatives:
      - “Canned beans at Store B are cheaper than Store A.”

- **Budget & Cost UI Enhancements**
  - Let users:
    - Choose preferred stores.
    - See cost breakdown by store and by recipe.

#### Non-Goals

- No super complex optimization like solving integer linear programming; keep it understandable.
- No Autopilot integration with cost yet (that’s 3.x).

#### Tech Considerations

- Cache PriceQuotes in Redis to avoid hitting APIs repeatedly.
- Extract integration details into config to make store addition easier.

---

### 3.4 v2.3 – Nutrient-Aware Family Planning (Full)

**Theme:** Upgrade family scaling from “calories only” to full nutrient awareness.

#### Scope

- **Family Scaling Engine v2**
  - Include nutrient coverage:
    - Try to ensure that each person reaches critical nutrient minimums.
  - E.g., allocate more iron-dense foods to those with higher iron needs.

- **Planner Enhancements**
  - When evaluating a plan:
    - Show nutrient coverage per person across the plan, with family scaling.

- **Edge Case Handling**
  - When total plan nutrients can’t satisfy everyone fully:
    - UI communicates that clearly.
    - Suggests which recipes to add to improve the situation.

#### Non-Goals

- Autopilot still off.
- Feedback logic still minimal (just dashboards).

#### Tech Considerations

- This version should solidify domain representations for:
  - Person-specific nutrient needs.
  - How scaling is computed.
- Must write heavy tests for scaling math; later Autopilot will rely on it.

---

## 4. Major Line 3.x – Coaching & Autopilot

**Goal:** Transform Swan from a tracker/planner into a semi-automated coach that suggests and can apply changes, given strict safety constraints.

### 4.1 v3.0 – Feedback Engine (Insights Only)

**Theme:** Generate actionable insights based on actual usage, but do not change anything automatically yet.

#### Scope

- **FeedbackInsight Schema**
  - Category: NUTRITION, BUDGET, ADHERENCE, STATE_MISMATCH, etc.
  - Severity.
  - Message & recommended action.
  - Date range and linked entities.

- **Feedback Engine v1**
  - Batch jobs (BullMQ) that:
    - Analyze last N days/weeks.
    - Generate insights such as:
      - “You’re averaging 20% below protein target.”
      - “You exceeded budget 3 of the last 4 weeks.”
      - “Low sodium requirement not met on 5 of 7 days.”

- **Feedback UI**
  - Insight feed with filters (by category, severity, person).
  - Links from insights to relevant pages (plans, settings).

#### Non-Goals

- No Autopilot yet.
- No automatic plan adjustments.

#### Tech Considerations

- Keep rules declarative in `feedback-engine` package.
- Build tests around each rule.

---

### 4.2 v3.1 – Autopilot (Constrained, User-Approved)

**Theme:** Allow Autopilot to suggest specific adjustments that users can apply or reject.

#### Scope

- **AutopilotConfig**
  - Per person and/or per household:
    - `enabled` (bool).
    - Calorie adjustment bounds (e.g. -10% to +10%).
    - Allowed recipe swaps (none, breakfast only, all except dinner, etc.).
    - Cost sensitivity (0–1).
    - `requireUserApproval` flag.

- **Autopilot Engine v1**
  - Uses:
    - Goals & actuals.
    - FeedbackInsights.
  - Proposes:
    - Adjusting daily calorie target within bounds.
    - Swapping out a few recipes for better alignment.
  - Writes `AutopilotChange` records with:
    - Proposed changes.
    - Before/after snapshots.

- **Autopilot UI**
  - Screen to review proposed changes:
    - Accept / reject per change.
  - After acceptance:
    - Apply change to MealPlan / Goals.
    - Mark change as APPLIED.

#### Non-Goals

- No fully automatic mode yet (`requireUserApproval` must be true in 3.1).
- No integration with budget and temporary states beyond basic logic.

#### Tech Considerations

- Changes must be **idempotent** and **reversible**:
  - Keep enough history to revert or reconstruct.

---

### 4.3 v3.2 – Autopilot (Budget & State-Aware, Optional Auto-Apply)

**Theme:** Make Autopilot smarter and optionally hands-off.

#### Scope

- **Autopilot Engine v2**
  - Incorporate:
    - Budget overshoots.
    - DietRequirements (hard constraints).
    - TemporaryStates (e.g., pregnancy, recovery).
  - Propose changes that:
    - Bring user closer to goals.
    - Reduce budget excess.
    - Always honor requirements.

- **Auto-Apply Mode**
  - If `requireUserApproval = false`:
    - Autopilot can apply changes automatically.
    - Users get a daily/weekly summary of:
      - What changed.
      - Why it changed.

- **Safety Constraints**
  - Hard rules:
    - Never violate DietRequirements.
    - Never change more than X% of a plan in one go (configurable).
    - Never exceed configured bounds on calorie changes.

#### Non-Goals

- No AI chat or LLM-based free-form coaching yet.
- No integration with medical lab results yet.

#### Tech Considerations

- Log all Autopilot changes as events with reasons (link to FeedbackInsight).
- Possibly implement a “dry run” mode for debugging during development.

---

## 5. Major Line 4.x – Holistic Health & Research

**Goal:** Extend Swan beyond food and money into mental health, sex-specific needs, medical data, research participation, and longevity orientation.

### 5.1 v4.0 – Mental & Sex-Specific Health (Phase 1)

**Theme:** Add logging and basic feedback for mental health and sex-specific topics.

#### Scope

- **Mental Health Logs**
  - Mood, stress level, sleep quality, social interaction quality.
  - Simple inputs (scales, tags).

- **Women’s Health Module**
  - Cycle tracking (basic).
  - Pregnancy and postpartum nuance (align temporary states).

- **Men’s Health Module**
  - Simple flags & fields for age-related concerns (e.g., general hormone-related contexts without going into diagnosis).

- **Dashboards & Feedback**
  - Correlate mood/stress/sleep with:
    - Diet adherence.
    - Budget stress.
  - Very conservative feedback:
    - “On days you sleep less than 6h, your snack calories increase by ~X%.”

#### Non-Goals

- No therapeutic features.
- No AI-based psychological coaching.

---

### 5.2 v4.1 – Medical Data Integration (Labs & Scans)

**Theme:** Allow users to link lab-like data and see how it informs nutritional and lifestyle decisions.

#### Scope

- **LabResult Schema**
  - Test type, value, unit, reference ranges.
  - Test date.

- **Medical Measurements**
  - Option to store things like:
    - Waist circumference.
    - Body composition results from DEXA or similar.

- **Read-Only Integration**
  - No direct ordering or retrieval from EMR/EHR – user manually enters or uploads values.
  - Feedback:
    - “Your Vitamin D level is X; your intake plan is Y; current evidence suggests…”

#### Non-Goals

- No diagnostic or treatment recommendations.
- No EHR integration; keep it user-provided.

---

### 5.3 v4.2 – Research & Citizen Science

**Theme:** Enable users to consent to data use and provide simple tools for researchers.

#### Scope

- **Consent Management**
  - Opt-in to anonymous data participation.
  - Clear explanation of what’s shared and what is not.

- **Cohort Definitions (Simple)**
  - Allow internal “studies” with simple segment definitions:
    - Age ranges, conditions, behavior patterns.

- **Researcher Interaction (Phase 1)**
  - Allow one-way Q&A:
    - Researchers can define an optional short survey.
    - Opted-in users may see them and answer.

- **Data Export**
  - Provide aggregated, anonymized exports for cohorts:
    - E.g., average nutrient intake patterns.

#### Non-Goals

- No complex external researcher console; start small.
- No personally identifiable data in research exports.

---

### 5.4 v4.3 – Longevity Context

**Theme:** Add a longevity lens on existing data.

#### Scope

- **Longevity Metrics (Conservative)**
  - Track:
    - Weight/BMI trend.
    - Activity level (if/when exercise module exists).
    - Basic metabolic markers (from labs).
  - Provide:
    - A simple “trajectory” view:
      - “Based on markers available, your trend seems more/less aligned with longevity-supporting patterns.”

- **Educational Content**
  - Contextual info about:
    - Sleep.
    - Nutrition.
    - Movement.
    - Recovery.
  - Again, no diagnostic, just high-level orientation.

---

## 6. Practical Notes: Avoiding Tech Debt

### 6.1 Prepare Early For:

- **Temporary States & Requirements**
  - Introduce them in schema by 1.1/1.2 even if unused to avoid re-plumbing later.

- **Households & PersonProfiles**
  - Separate User and PersonProfile early so children/dependents can exist without accounts.

- **Domain Packages**
  - Put calculations (energy, scaling, cost, feedback) into `packages/domain` and subpackages from day one, never in React components or resolvers directly.

- **Event Logs**
  - For Autopilot and feedback, design an `events` table or at least stable `AutopilotChange` + `FeedbackInsight` tables early.
  - This makes debugging and future analysis possible.

### 6.2 Breaking Changes Policy

- GraphQL:
  - Never remove fields without a deprecation window.
  - Add new fields instead of overloading existing fields with new semantics.

- Database:
  - Use migrations with clear up/down scripts.
  - Data migrations must be idempotent or carefully gated.

### 6.3 Release Discipline

For each **minor** release (1.0, 1.1, 2.0, …):

- Write:
  - A short design note in `docs/releases/vX.Y.md`.
  - A migration plan.
  - A test plan.
- Tag:
  - Git tag `vX.Y.0` at release.
- Optionally deploy:
  - A feature flagged version for pilot users before full rollout.

---

End of `RELEASE_PLAN.md`.
```
