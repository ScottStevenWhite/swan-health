# Swan Health — UX Design System

**Version 2.0** | Last Updated: December 2024

---

## 1. Design Philosophy

### 1.1 Core Principle

> **Warm Science**: Clinical precision meets human warmth.

Swan Health deals with sensitive, personal data—body metrics, medical requirements, family nutrition. The interface must feel trustworthy enough for health decisions but approachable enough for daily family use. We avoid both sterile medical aesthetics and playful fitness-app energy.

### 1.2 Design Pillars

| Pillar | Description | How It Manifests |
|--------|-------------|------------------|
| **Clarity** | Complex nutritional data made scannable | Progress rings over data tables, color-coded macros, clear hierarchy |
| **Trust** | Users must trust the system with health decisions | Transparent reasoning, visible constraints, no black-box magic |
| **Family-First** | Designed for households, not individuals | Person switcher always visible, family totals prominent, shared context |
| **Constraint-Aware** | Respects medical requirements absolutely | Hard requirements visually distinct, warnings before violations |
| **Actionable** | Every insight leads somewhere | No dead-end data; always a next step or recommendation |

### 1.3 Emotional Targets

- **Morning check-in**: "I know exactly what to make today"
- **Weekly planning**: "My family is covered, and we're under budget"
- **Seeing an insight**: "That's useful—I'll fix that"
- **Autopilot change**: "I understand why, and I trust it"

---

## 2. Design Tokens

### 2.1 Color System

#### Primary Palette

```
Primary (Teal)        — Health, growth, balance
├── primary:          #1A7F7A
├── primaryLight:     #2A9D97
├── primaryDark:      #156661
└── primaryMuted:     #E8F5F4

Secondary (Coral)     — Energy, vitality, protein
├── secondary:        #E07A5F
├── secondaryLight:   #F4A08A
├── secondaryDark:    #C4604A
└── secondaryMuted:   #FDF0ED

Accent (Golden)       — Achievement, goals, carbohydrates
├── accent:           #D4A84B
├── accentLight:      #F0D78C
└── accentMuted:      #FBF6E9
```

#### Neutral Palette

```
background:           #FDFCFA    — Page background (warm off-white)
surface:              #FFFFFF    — Card backgrounds
border:               #E8E4DF    — Dividers, card borders
borderLight:          #F2EFEB    — Subtle separators
text:                 #2D2926    — Primary text
textMuted:            #6B6560    — Secondary text
textLight:            #9A948E    — Tertiary text, timestamps
```

#### Semantic Colors

```
success:              #4A9D6E    — Positive outcomes, savings, on-track
successMuted:         #EDF7F1
warning:              #D4A84B    — Attention needed, pending items
warningMuted:         #FBF6E9
error:                #C4604A    — Violations, critical issues
errorMuted:           #FBEFEC
info:                 #5B8EC4    — Informational, neutral updates
infoMuted:            #EDF3FA
```

#### Color Usage Rules

1. **Primary** for navigation, CTAs, and positive health indicators
2. **Secondary** for protein-related data and vitality metrics
3. **Accent** for carbohydrate data and achievement highlights
4. **Error** exclusively for medical requirement violations and critical warnings
5. **Muted variants** for backgrounds, never for text
6. **Never use pure black** (#000000) — always use `text` token

### 2.2 Typography

#### Font Stack

```css
--font-display: 'Fraunces', Georgia, serif;
--font-body: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
```

#### Type Scale

| Name | Font | Size | Weight | Use Case |
|------|------|------|--------|----------|
| **Display XL** | Fraunces | 36px | 600 | Page titles |
| **Display L** | Fraunces | 28px | 600 | Section headers |
| **Display M** | Fraunces | 22px | 600 | Card titles |
| **Display S** | Fraunces | 18px | 600 | Subsection headers |
| **Body L** | Source Sans 3 | 16px | 400 | Long-form content |
| **Body M** | Source Sans 3 | 14px | 400/600 | Default UI text |
| **Body S** | Source Sans 3 | 13px | 400 | Secondary text |
| **Caption** | Source Sans 3 | 12px | 600 | Labels, uppercase |
| **Mono M** | JetBrains Mono | 14px | 400 | Numbers, data |
| **Mono S** | JetBrains Mono | 13px | 400 | Timestamps, units |
| **Mono XS** | JetBrains Mono | 11px | 400 | Fine print data |

#### Typography Rules

1. **Fraunces** (display) for headlines and large numbers only
2. **Source Sans 3** (body) for all UI text and paragraphs
3. **JetBrains Mono** for nutritional data, prices, timestamps, and targets
4. Numbers in context (calories, grams, dollars) always use mono
5. Letter-spacing: `-0.02em` for display type, `0.05em` for uppercase labels

### 2.3 Spacing

```
xs:    4px     — Inline spacing, icon gaps
sm:    8px     — Tight component padding
md:    16px    — Default component padding
lg:    24px    — Card padding, section gaps
xl:    32px    — Page section spacing
xxl:   48px    — Major section breaks
```

### 2.4 Border Radius

```
sm:    6px     — Buttons, badges, small elements
md:    12px    — Cards, inputs, dropdowns
lg:    20px    — Large cards, modals
xl:    28px    — Feature cards, hero elements
full:  9999px  — Pills, avatars, toggles
```

### 2.5 Shadows

```css
--shadow-sm: 0 1px 2px rgba(45, 41, 38, 0.04);    /* Subtle lift */
--shadow-md: 0 4px 12px rgba(45, 41, 38, 0.08);   /* Cards, dropdowns */
--shadow-lg: 0 12px 32px rgba(45, 41, 38, 0.12);  /* Modals, popovers */
```

---

## 3. Component Library

### 3.1 Navigation

#### Sidebar Navigation

- Fixed position, 260px width
- Logo at top with consistent spacing
- Grouped sections with uppercase labels
- Active state: `primaryMuted` background + `primary` text
- Notification badges for pending items (Autopilot approvals)
- User profile at bottom with avatar and household name

```
┌─────────────────────────┐
│  🦢 SwanHealth          │
│                         │
│  MAIN                   │
│  ● Dashboard            │
│  ○ Meal Plan            │
│  ○ Shopping & Budget    │
│  ○ Insights & Autopilot │ (1)
│                         │
│  SETTINGS               │
│  ○ Family Profiles      │
│  ○ Diet & Requirements  │
│  ○ Goals & Targets      │
│                         │
│  ─────────────────────  │
│  👨 Marcus Chen         │
│     Chen Family         │
└─────────────────────────┘
```

### 3.2 Person Selector

The person selector is omnipresent—it appears on Dashboard, Diet Settings, Goals, and contextually in Meal Planning.

#### PersonPill Component

```
┌────────────────────────┐
│ 👨 Marcus  🏃  2300cal │  ← Active (filled background)
└────────────────────────┘

┌────────────────────────┐
│ 👩 Sarah   🤰          │  ← Inactive (outlined)
└────────────────────────┘
```

**States:**
- Default: White background, border matches `border` token
- Active: Background and border match person's assigned color, white text
- Hover (inactive): Light tint of person's color

**Optional elements:**
- Temporary state icon (🏃🤰🏥📉)
- Calorie target (shown contextually)

### 3.3 Cards

#### Base Card

```css
background: var(--surface);
border-radius: var(--radius-lg);      /* 20px */
padding: var(--spacing-lg);           /* 24px */
border: 1px solid var(--borderLight);
box-shadow: var(--shadow-sm);
```

#### Elevated Card

Same as base, but with `shadow-md` for emphasis.

#### Gradient Card

Used for household totals and key metrics:

```css
background: linear-gradient(135deg, var(--primary) 0%, var(--primaryDark) 100%);
color: white;
```

### 3.4 Progress Indicators

#### Progress Ring

Used for at-a-glance percentage completion (calories, macros).

```
    ╭───────╮
   ╱    78%  ╲
  │   ────    │    ← Percentage in center (Fraunces)
   ╲  label  ╱     ← Optional label below (Source Sans)
    ╰───────╯
```

**Sizes:**
- Small: 70px (macro indicators)
- Medium: 100px (dashboard cards)
- Large: 120px (featured metrics)

#### Progress Bar

Used for linear progress (nutrients, budget).

```
Label                    145g / 175g
████████████░░░░░░░░░░░░░░░░░░░░░░░
```

**Heights:**
- Compact: 6px (inline)
- Default: 8px (cards)
- Large: 12px (featured)

### 3.5 Badges

#### Variants

| Variant | Background | Text | Use Case |
|---------|------------|------|----------|
| default | `borderLight` | `textMuted` | Neutral labels |
| primary | `primaryMuted` | `primary` | Feature highlights |
| success | `successMuted` | `success` | Positive outcomes, savings |
| warning | `warningMuted` | `warning` | Attention needed |
| error | `errorMuted` | `error` | Violations, critical |
| info | `infoMuted` | `info` | Informational |

#### Sizes

- **Small**: 2px 8px padding, 11px font
- **Medium**: 4px 12px padding, 12px font

### 3.6 Buttons

#### Variants

| Variant | Background | Border | Text | Use Case |
|---------|------------|--------|------|----------|
| primary | `primary` | none | white | Main CTAs |
| secondary | transparent | `primary` | `primary` | Secondary actions |
| ghost | transparent | none | `textMuted` | Tertiary actions |
| success | `success` | none | white | Approve, confirm |
| warning | `warning` | none | white | Caution actions |

#### Sizes

| Size | Padding | Font Size |
|------|---------|-----------|
| sm | 6px 12px | 13px |
| md | 10px 18px | 14px |
| lg | 14px 24px | 15px |

#### States

- Hover: Slight opacity reduction (0.9)
- Active: Scale down (0.98)
- Disabled: 50% opacity, no pointer events

### 3.7 Temporary State Badge

Displays active life states with context.

```
┌─────────────────────────────────────────────────┐
│ 🏃  Marathon Prep                               │
│     +15% carbs, +10% calories on training days  │
└─────────────────────────────────────────────────┘
```

**Styling:**
- Background: State color at 15% opacity
- Border: State color at 40% opacity
- Icon: 16px emoji
- Title: 13px semibold in state color
- Description: 11px regular in `textMuted`

### 3.8 Insight Card

Displays feedback engine insights with severity and actions.

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  │ Iron intake below target           👩 Sarah           │
│     │ Sarah has averaged 14mg iron over the past week.      │
│     │ Her pregnancy target is 27mg. Consider adding more    │
│     │ leafy greens or an iron supplement.                   │
│     │                                                       │
│     │ View iron-rich recipes →                  2 hours ago │
└─────────────────────────────────────────────────────────────┘
```

**Structure:**
- Left: 36px icon container with severity-colored background
- Center: Title + message + action button
- Right: Timestamp in mono
- Person badge: Optional, shows affected family member

### 3.9 Autopilot Change Card

Displays automated or pending changes.

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖  │ Swapped beef stir-fry → chicken stir-fry   Applied   │
│     │ Reduced weekly cost by $12 while maintaining          │
│     │ protein targets                                       │
│     │                                              Yesterday │
└─────────────────────────────────────────────────────────────┘
```

**Pending state** includes Approve/Dismiss buttons.

### 3.10 Shopping List Item

```
┌──────────────────────────────────────────────────────────────────────┐
│ Chicken breast    │ 2.5 kg │ Costco │ $18.50 │ -$4.20 saved        │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.11 Toggles

Used for Autopilot enable/disable.

```
ON:   ██████████●    (primary background)
OFF:  ●░░░░░░░░░░    (border background)
```

- Track: 56px × 32px, full radius
- Knob: 24px circle, white with shadow

---

## 4. Layout Patterns

### 4.1 Page Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (260px fixed)  │  MAIN CONTENT (flex, max-width 1100px)    │
│                        │                                            │
│  Logo                  │  Page Title                                │
│                        │  Subtitle / breadcrumb                     │
│  Navigation            │                                            │
│                        │  [Action Buttons]                          │
│                        │                                            │
│                        │  ┌─────────────────────────────────────┐  │
│                        │  │  Primary Content Area               │  │
│                        │  │  (Cards, grids, lists)              │  │
│                        │  └─────────────────────────────────────┘  │
│  User Profile          │                                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Dashboard Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Good morning, Marcus 👋                                        │
│ TODAY'S OVERVIEW                                    [Actions]  │
├────────────────────────────────────────────────────────────────┤
│ [Person Pills: 👨 Marcus | 👩 Sarah | 👧 Emma | 🧒 Lucas | 👶 Lily] │
├────────────────────────────────────────────────────────────────┤
│ [Active States Banner - if applicable]                         │
│ [Requirements Banner - if applicable]                          │
├────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│ │   Calories   │ │    Budget    │ │   Household  │            │
│ │     Ring     │ │    Status    │ │    Total     │            │
│ └──────────────┘ └──────────────┘ └──────────────┘            │
├────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐       │
│ │    Macro Progress       │ │   Recent Insights       │       │
│ │    (Protein/Carbs/Fat)  │ │   (Top 2-3 items)       │       │
│ └─────────────────────────┘ └─────────────────────────┘       │
└────────────────────────────────────────────────────────────────┘
```

### 4.3 Settings Layout (Diet & Requirements)

```
┌────────────────────────────────────────────────────────────────┐
│ DIET & REQUIREMENTS                                            │
│ Preferences are flexible, requirements are enforced            │
├────────────────────────────────────────────────────────────────┤
│ [Person Pills]                                                 │
├────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐       │
│ │ 💚 Diet Preferences     │ │ 🚫 Medical Requirements │       │
│ │    [Soft constraints]   │ │    [Hard constraints]   │       │
│ │                         │ │                         │       │
│ │ Patterns:               │ │ ⛔ No Gluten  [Remove]  │       │
│ │ [Vegan] [Vegetarian]... │ │ ○  No Lactose [Add]     │       │
│ │                         │ │ ○  No Nuts    [Add]     │       │
│ │ Liked: 👍 salmon, tofu  │ │ ...                     │       │
│ │ Disliked: 👎 cilantro   │ │                         │       │
│ └─────────────────────────┘ └─────────────────────────┘       │
└────────────────────────────────────────────────────────────────┘
```

### 4.4 Grid Systems

| Use Case | Columns | Gap |
|----------|---------|-----|
| Stat cards | 3 or 4 | 24px |
| Content + sidebar | 1fr 1fr | 24px |
| Shopping list | 5 columns (defined) | 16px |
| Family portions | 5 equal | 24px |

---

## 5. Interaction Patterns

### 5.1 Person Context Switching

When a user clicks a different PersonPill:

1. Pill animates to active state (200ms ease)
2. All person-specific data updates:
   - Calorie targets
   - Macro progress
   - Temporary states
   - Diet requirements
   - Insights (filtered)
3. Content fades and slides subtly (300ms)

### 5.2 Autopilot Approval Flow

1. Pending change appears in Insights section with warning badge
2. Card shows full reasoning and impact
3. Two actions: **Approve** (success button) or **Dismiss** (ghost button)
4. On approve:
   - Badge changes to "Applied"
   - Success toast appears
   - Affected metrics update
5. On dismiss:
   - Card fades out
   - Change is logged as "Dismissed"

### 5.3 Requirement Violation Warning

When a user attempts to add a recipe that violates a hard requirement:

1. Modal appears with error styling
2. Shows specific violation: "This recipe contains gluten, which violates Sarah's NO_GLUTEN requirement"
3. Options:
   - Cancel (return to selection)
   - Add Anyway (with explicit override logging)

### 5.4 Cost Optimization Suggestions

1. Suggestion cards appear in Shopping section
2. Each shows: savings amount, description, impact
3. Click "Apply swap" → confirmation modal
4. On confirm:
   - Meal plan updates
   - Shopping list recalculates
   - Savings badge updates

---

## 6. Information Hierarchy

### 6.1 Visual Weight (Highest to Lowest)

1. **Page title** — What screen am I on?
2. **Active person** — Whose data am I seeing?
3. **Primary metric** — Calories, budget, key number
4. **Warnings/Requirements** — What must I address?
5. **Progress indicators** — How am I doing?
6. **Secondary content** — Details, lists, history
7. **Actions** — What can I do?
8. **Metadata** — Timestamps, sources

### 6.2 Data Display Rules

| Data Type | Font | Format | Example |
|-----------|------|--------|---------|
| Calories | Mono | Localized number | 2,300 |
| Grams | Mono | Number + unit | 145g |
| Percentage | Mono | Number + % | 78% |
| Currency | Mono | Symbol + decimal | $18.50 |
| Savings | Mono + Badge | Negative + "saved" | -$4.20 saved |
| Date/Time | Mono | Relative or short | 2 hours ago |
| Person reference | Badge | Avatar + name | 👩 Sarah |

---

## 7. Responsive Considerations

### 7.1 Breakpoints

| Name | Width | Sidebar | Grid Columns |
|------|-------|---------|--------------|
| Desktop | ≥1200px | 260px fixed | 3-4 |
| Laptop | 1024-1199px | 260px fixed | 2-3 |
| Tablet | 768-1023px | Collapsible | 2 |
| Mobile | <768px | Bottom nav | 1 |

### 7.2 Mobile Adaptations

- Sidebar becomes bottom tab bar
- Person pills become horizontal scroll
- Cards stack vertically
- Shopping list becomes expandable rows
- Progress rings shrink to 60px

---

## 8. Accessibility

### 8.1 Color Contrast

All text meets WCAG AA:
- `text` on `background`: 12.5:1
- `textMuted` on `background`: 5.2:1
- White on `primary`: 4.8:1
- `error` on `errorMuted`: 4.6:1

### 8.2 Interactive Elements

- All buttons have minimum 44px touch target
- Focus states use 2px primary outline with 2px offset
- Hover states are visually distinct
- No information conveyed by color alone (icons + text)

### 8.3 Screen Reader Support

- Semantic HTML structure
- ARIA labels for icon-only buttons
- Role attributes for custom components
- Meaningful alt text for visual elements

---

## 9. Motion & Animation

### 9.1 Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro (hover, focus) | 150ms | ease |
| Component (toggle, expand) | 200ms | ease |
| Page transition | 300ms | ease-out |
| Progress animation | 600-800ms | ease |

### 9.2 Principles

1. **Purpose**: Animation should clarify, not decorate
2. **Subtlety**: Prefer opacity and transform over color shifts
3. **Performance**: Use `transform` and `opacity` only
4. **Respect preferences**: Honor `prefers-reduced-motion`

---

## 10. Empty & Error States

### 10.1 Empty States

```
┌─────────────────────────────────────────┐
│                                         │
│              [Icon: 80px]               │
│                                         │
│          No insights yet                │
│                                         │
│   Start logging meals to receive        │
│   personalized feedback and             │
│   recommendations.                      │
│                                         │
│          [Log a Meal →]                 │
│                                         │
└─────────────────────────────────────────┘
```

### 10.2 Error States

- Inline errors: Red text below field
- Card errors: Error banner at top of card
- Page errors: Full-width error card with retry action

---

## 11. Implementation Notes

### 11.1 CSS Custom Properties

All tokens should be defined as CSS custom properties at `:root` for runtime theming capability.

### 11.2 Component Architecture

- Use composition over configuration
- Props for variants, not style overrides
- Consistent prop naming: `variant`, `size`, `disabled`

### 11.3 Icon Strategy

- Primary: Emoji for personality and universality (👨🏃💚)
- Secondary: Lucide icons for UI chrome
- Avoid mixing icon libraries within a component

---

## Appendix: Design Rationale

### Why Warm Teal?

Traditional health apps use cold blues (clinical) or bright greens (fitness). Teal sits between them—it's calming like blue but has green's association with growth and wellness. The warm undertone prevents sterility.

### Why Fraunces?

Most health apps use geometric sans-serifs (Inter, SF Pro). Fraunces is a variable serif with optical sizing—it feels premium and editorial, not clinical. It makes numbers feel less like data and more like information.

### Why Person Pills?

Family health is the differentiator. The person context must be always visible and instantly switchable. Pills are more compact than tabs and scale to 5+ family members without overwhelming.

### Why Explicit Requirement Separation?

Conflating preferences with requirements is dangerous. A "I don't like mushrooms" is not the same as "I will have an allergic reaction to nuts." The UI must make this distinction impossible to miss.

---

**Swan Health Design System** — *Clarity. Trust. Family-first.*