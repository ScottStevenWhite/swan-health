import React, { useState, useEffect } from 'react';

// Swan Health Design System v2
// Full UX reflecting: Budget/Cost, Autopilot, Diet Preferences/Requirements, 
// Temporary States, Feedback Engine, Family Scaling

const SwanHealthApp = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activePerson, setActivePerson] = useState('marcus');
  const [showModal, setShowModal] = useState(null);
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // ============================================
  // DESIGN TOKENS
  // ============================================
  const tokens = {
    colors: {
      primary: '#1A7F7A',
      primaryLight: '#2A9D97',
      primaryDark: '#156661',
      primaryMuted: '#E8F5F4',
      secondary: '#E07A5F',
      secondaryLight: '#F4A08A',
      secondaryMuted: '#FDF0ED',
      accent: '#D4A84B',
      accentLight: '#F0D78C',
      accentMuted: '#FBF6E9',
      background: '#FDFCFA',
      surface: '#FFFFFF',
      border: '#E8E4DF',
      borderLight: '#F2EFEB',
      text: '#2D2926',
      textMuted: '#6B6560',
      textLight: '#9A948E',
      success: '#4A9D6E',
      successMuted: '#EDF7F1',
      warning: '#D4A84B',
      warningMuted: '#FBF6E9',
      error: '#C4604A',
      errorMuted: '#FBEFEC',
      info: '#5B8EC4',
      infoMuted: '#EDF3FA',
    },
    fonts: {
      display: "'Fraunces', Georgia, serif",
      body: "'Source Sans 3', -apple-system, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' },
    radius: { sm: '6px', md: '12px', lg: '20px', xl: '28px', full: '9999px' },
    shadows: {
      sm: '0 1px 2px rgba(45, 41, 38, 0.04)',
      md: '0 4px 12px rgba(45, 41, 38, 0.08)',
      lg: '0 12px 32px rgba(45, 41, 38, 0.12)',
    }
  };

  // ============================================
  // DATA MODELS
  // ============================================
  const household = {
    id: 'chen-family',
    name: 'Chen Family',
    weeklyBudget: 175,
    currentSpend: 142,
    projectedSpend: 168,
    savingsThisMonth: 47,
  };

  const people = {
    marcus: {
      name: 'Marcus',
      role: 'Dad',
      age: 38,
      calories: 2300,
      avatar: '👨',
      color: tokens.colors.primary,
      temporaryStates: ['MARATHON_PREP'],
      dietPreferences: { patterns: ['MEDITERRANEAN'], liked: ['salmon', 'olive oil'], disliked: ['cilantro'] },
      dietRequirements: [],
      macros: { protein: { current: 145, target: 175 }, carbs: { current: 280, target: 320 }, fat: { current: 72, target: 80 } },
    },
    sarah: {
      name: 'Sarah',
      role: 'Mom',
      age: 36,
      calories: 1900,
      avatar: '👩',
      color: tokens.colors.secondary,
      temporaryStates: ['PREGNANCY_TRIMESTER_2'],
      dietPreferences: { patterns: ['VEGETARIAN'], liked: ['tofu', 'lentils'], disliked: ['mushrooms'] },
      dietRequirements: ['NO_GLUTEN'],
      macros: { protein: { current: 78, target: 95 }, carbs: { current: 210, target: 240 }, fat: { current: 58, target: 65 } },
    },
    emma: {
      name: 'Emma',
      role: 'Teen',
      age: 15,
      calories: 1800,
      avatar: '👧',
      color: tokens.colors.accent,
      temporaryStates: [],
      dietPreferences: { patterns: [], liked: ['pasta', 'chicken'], disliked: ['broccoli', 'fish'] },
      dietRequirements: ['NO_NUTS'],
      macros: { protein: { current: 62, target: 70 }, carbs: { current: 195, target: 225 }, fat: { current: 55, target: 60 } },
    },
    lucas: {
      name: 'Lucas',
      role: 'Kid',
      age: 10,
      calories: 1600,
      avatar: '🧒',
      color: tokens.colors.info,
      temporaryStates: [],
      dietPreferences: { patterns: [], liked: ['pizza', 'tacos'], disliked: ['spinach'] },
      dietRequirements: [],
      macros: { protein: { current: 48, target: 55 }, carbs: { current: 175, target: 200 }, fat: { current: 45, target: 50 } },
    },
    lily: {
      name: 'Lily',
      role: 'Tot',
      age: 4,
      calories: 1300,
      avatar: '👶',
      color: tokens.colors.success,
      temporaryStates: [],
      dietPreferences: { patterns: [], liked: ['bananas', 'cheese'], disliked: [] },
      dietRequirements: [],
      macros: { protein: { current: 32, target: 40 }, carbs: { current: 145, target: 160 }, fat: { current: 38, target: 45 } },
    },
  };

  const temporaryStateLabels = {
    'MARATHON_PREP': { label: 'Marathon Prep', icon: '🏃', color: tokens.colors.primary, description: '+15% carbs, +10% calories on training days' },
    'PREGNANCY_TRIMESTER_2': { label: 'Pregnancy (T2)', icon: '🤰', color: tokens.colors.secondary, description: '+340 cal/day, increased iron & folate targets' },
    'SURGERY_RECOVERY': { label: 'Surgery Recovery', icon: '🏥', color: tokens.colors.info, description: '+25% protein for tissue repair' },
    'CUTTING': { label: 'Cutting Phase', icon: '📉', color: tokens.colors.warning, description: '-15% calories, high protein' },
  };

  const feedbackInsights = [
    { id: 1, type: 'warning', category: 'NUTRITION', person: 'sarah', title: 'Iron intake below target', message: 'Sarah has averaged 14mg iron over the past week. Her pregnancy target is 27mg. Consider adding more leafy greens or an iron supplement.', action: 'View iron-rich recipes', timestamp: '2 hours ago' },
    { id: 2, type: 'success', category: 'BUDGET', person: null, title: 'On track for savings', message: 'Your household is projected to save $32 this week compared to your baseline. Recipe swaps on Tuesday and Thursday contributed most.', action: 'See breakdown', timestamp: '5 hours ago' },
    { id: 3, type: 'info', category: 'ADHERENCE', person: 'marcus', title: 'Training day adjustment', message: 'Marcus has a long run scheduled Saturday. His carb target has been increased by 80g for Friday and Saturday.', action: 'Review plan', timestamp: '1 day ago' },
    { id: 4, type: 'warning', category: 'NUTRITION', person: 'emma', title: 'Protein consistently low', message: 'Emma has been 15-20% below protein target for 5 consecutive days. This may affect growth and energy levels.', action: 'Suggest high-protein snacks', timestamp: '1 day ago' },
  ];

  const autopilotChanges = [
    { id: 1, type: 'SWAP_RECIPE', status: 'APPLIED', description: 'Swapped beef stir-fry → chicken stir-fry', reason: 'Reduced weekly cost by $12 while maintaining protein targets', date: 'Yesterday' },
    { id: 2, type: 'ADJUST_PORTIONS', status: 'APPLIED', description: 'Increased Marcus portions on training days', reason: 'Marathon prep state requires additional calories', date: '3 days ago' },
    { id: 3, type: 'SWAP_RECIPE', status: 'PENDING', description: 'Swap salmon → sardines (2x this week)', reason: 'Save $18/week with similar omega-3 content', date: 'Pending approval' },
  ];

  const totalFamilyCalories = Object.values(people).reduce((sum, p) => sum + p.calories, 0);

  // ============================================
  // COMPONENTS
  // ============================================
  
  const Logo = ({ size = 'md' }) => {
    const sizes = { sm: 24, md: 32, lg: 48 };
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
        <svg width={sizes[size]} height={sizes[size]} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill={tokens.colors.primaryMuted} />
          <path d="M24 12C20 12 16 16 16 22C16 28 20 34 24 36C28 34 32 28 32 22C32 16 28 12 24 12Z" fill={tokens.colors.primary} />
          <ellipse cx="24" cy="20" rx="4" ry="3" fill={tokens.colors.background} />
        </svg>
        <span style={{ fontFamily: tokens.fonts.display, fontSize: size === 'lg' ? '28px' : '22px', fontWeight: 600, color: tokens.colors.text, letterSpacing: '-0.02em' }}>
          Swan<span style={{ color: tokens.colors.primary }}>Health</span>
        </span>
      </div>
    );
  };

  const Badge = ({ children, variant = 'default', size = 'md' }) => {
    const variants = {
      default: { bg: tokens.colors.borderLight, color: tokens.colors.textMuted },
      primary: { bg: tokens.colors.primaryMuted, color: tokens.colors.primary },
      success: { bg: tokens.colors.successMuted, color: tokens.colors.success },
      warning: { bg: tokens.colors.warningMuted, color: tokens.colors.warning },
      error: { bg: tokens.colors.errorMuted, color: tokens.colors.error },
      info: { bg: tokens.colors.infoMuted, color: tokens.colors.info },
    };
    const v = variants[variant];
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        background: v.bg, color: v.color,
        borderRadius: tokens.radius.full,
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600, fontFamily: tokens.fonts.body,
      }}>
        {children}
      </span>
    );
  };

  const Card = ({ children, padding = 'lg', style = {} }) => (
    <div style={{
      background: tokens.colors.surface,
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing[padding],
      boxShadow: tokens.shadows.sm,
      border: `1px solid ${tokens.colors.borderLight}`,
      ...style,
    }}>
      {children}
    </div>
  );

  const Button = ({ children, variant = 'primary', size = 'md', icon, style = {}, ...props }) => {
    const variants = {
      primary: { bg: tokens.colors.primary, color: '#fff', border: 'none' },
      secondary: { bg: 'transparent', color: tokens.colors.primary, border: `1.5px solid ${tokens.colors.primary}` },
      ghost: { bg: 'transparent', color: tokens.colors.textMuted, border: 'none' },
      success: { bg: tokens.colors.success, color: '#fff', border: 'none' },
      warning: { bg: tokens.colors.warning, color: '#fff', border: 'none' },
    };
    const sizes = {
      sm: { padding: '6px 12px', fontSize: '13px' },
      md: { padding: '10px 18px', fontSize: '14px' },
      lg: { padding: '14px 24px', fontSize: '15px' },
    };
    const v = variants[variant];
    const s = sizes[size];
    return (
      <button style={{
        ...s, background: v.bg, color: v.color, border: v.border,
        borderRadius: tokens.radius.md, fontFamily: tokens.fonts.body, fontWeight: 600,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: tokens.spacing.sm,
        transition: 'all 0.2s ease', ...style,
      }} {...props}>
        {icon && <span>{icon}</span>}
        {children}
      </button>
    );
  };

  const ProgressBar = ({ current, target, color, height = 8, showLabel = false }) => {
    const percent = Math.min((current / target) * 100, 100);
    return (
      <div>
        <div style={{ height, background: tokens.colors.borderLight, borderRadius: tokens.radius.full, overflow: 'hidden' }}>
          <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: tokens.radius.full, transition: 'width 0.6s ease' }} />
        </div>
        {showLabel && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontFamily: tokens.fonts.mono, fontSize: '11px', color: tokens.colors.textMuted }}>
            <span>{current}</span>
            <span>{target}</span>
          </div>
        )}
      </div>
    );
  };

  const ProgressRing = ({ current, target, size = 100, strokeWidth = 8, color, label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percent = Math.min((current / target) * 100, 100);
    const offset = circumference - (percent / 100) * circumference;
    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={tokens.colors.borderLight} strokeWidth={strokeWidth} />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontFamily: tokens.fonts.display, fontSize: size > 80 ? '24px' : '18px', fontWeight: 600, color: tokens.colors.text }}>{Math.round(percent)}%</div>
          {label && <div style={{ fontFamily: tokens.fonts.body, fontSize: '11px', color: tokens.colors.textMuted, marginTop: '2px' }}>{label}</div>}
        </div>
      </div>
    );
  };

  const PersonPill = ({ person, isActive, onClick, showState = false }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: tokens.spacing.sm,
      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
      background: isActive ? person.color : tokens.colors.surface,
      color: isActive ? '#fff' : tokens.colors.text,
      border: `2px solid ${isActive ? person.color : tokens.colors.border}`,
      borderRadius: tokens.radius.full, cursor: 'pointer',
      fontFamily: tokens.fonts.body, fontWeight: 600, fontSize: '14px',
      transition: 'all 0.2s ease',
    }}>
      <span style={{ fontSize: '18px' }}>{person.avatar}</span>
      <span>{person.name}</span>
      {showState && person.temporaryStates.length > 0 && (
        <span style={{ fontSize: '14px' }}>{temporaryStateLabels[person.temporaryStates[0]]?.icon}</span>
      )}
    </button>
  );

  const TemporaryStateBadge = ({ stateKey }) => {
    const state = temporaryStateLabels[stateKey];
    if (!state) return null;
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: tokens.spacing.sm,
        padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
        background: `${state.color}15`, border: `1px solid ${state.color}40`,
        borderRadius: tokens.radius.md,
      }}>
        <span style={{ fontSize: '16px' }}>{state.icon}</span>
        <div>
          <div style={{ fontFamily: tokens.fonts.body, fontWeight: 600, fontSize: '13px', color: state.color }}>{state.label}</div>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: '11px', color: tokens.colors.textMuted }}>{state.description}</div>
        </div>
      </div>
    );
  };

  const InsightCard = ({ insight }) => {
    const typeStyles = {
      warning: { icon: '⚠️', color: tokens.colors.warning, bg: tokens.colors.warningMuted },
      success: { icon: '✓', color: tokens.colors.success, bg: tokens.colors.successMuted },
      info: { icon: 'ℹ', color: tokens.colors.info, bg: tokens.colors.infoMuted },
      error: { icon: '!', color: tokens.colors.error, bg: tokens.colors.errorMuted },
    };
    const style = typeStyles[insight.type];
    const person = insight.person ? people[insight.person] : null;
    
    return (
      <div style={{
        display: 'flex', gap: tokens.spacing.md, padding: tokens.spacing.md,
        background: tokens.colors.surface, borderRadius: tokens.radius.md,
        border: `1px solid ${tokens.colors.borderLight}`,
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: tokens.radius.md,
          background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', flexShrink: 0,
        }}>
          {style.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, marginBottom: '4px' }}>
            <span style={{ fontFamily: tokens.fonts.body, fontWeight: 600, fontSize: '14px', color: tokens.colors.text }}>{insight.title}</span>
            {person && <Badge variant="default" size="sm">{person.avatar} {person.name}</Badge>}
          </div>
          <p style={{ fontFamily: tokens.fonts.body, fontSize: '13px', color: tokens.colors.textMuted, margin: 0, marginBottom: tokens.spacing.sm, lineHeight: 1.5 }}>
            {insight.message}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button variant="ghost" size="sm">{insight.action} →</Button>
            <span style={{ fontFamily: tokens.fonts.mono, fontSize: '11px', color: tokens.colors.textLight }}>{insight.timestamp}</span>
          </div>
        </div>
      </div>
    );
  };

  const AutopilotChangeCard = ({ change }) => {
    const statusStyles = {
      APPLIED: { badge: 'success', label: 'Applied' },
      PENDING: { badge: 'warning', label: 'Pending' },
      REVERTED: { badge: 'default', label: 'Reverted' },
    };
    const s = statusStyles[change.status];
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: tokens.spacing.md,
        padding: tokens.spacing.md, background: tokens.colors.surface,
        borderRadius: tokens.radius.md, border: `1px solid ${tokens.colors.borderLight}`,
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: tokens.radius.full,
          background: tokens.colors.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px',
        }}>
          🤖
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, marginBottom: '4px' }}>
            <span style={{ fontFamily: tokens.fonts.body, fontWeight: 600, fontSize: '14px', color: tokens.colors.text }}>{change.description}</span>
            <Badge variant={s.badge} size="sm">{s.label}</Badge>
          </div>
          <p style={{ fontFamily: tokens.fonts.body, fontSize: '13px', color: tokens.colors.textMuted, margin: 0 }}>{change.reason}</p>
          <span style={{ fontFamily: tokens.fonts.mono, fontSize: '11px', color: tokens.colors.textLight }}>{change.date}</span>
        </div>
        {change.status === 'PENDING' && (
          <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
            <Button variant="success" size="sm">Approve</Button>
            <Button variant="ghost" size="sm">Dismiss</Button>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // NAVIGATION
  // ============================================
  const Navigation = () => (
    <nav style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '260px',
      background: tokens.colors.surface, borderRight: `1px solid ${tokens.colors.border}`,
      padding: tokens.spacing.lg, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ marginBottom: tokens.spacing.xxl }}><Logo /></div>
      
      <div style={{ marginBottom: tokens.spacing.lg }}>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: '11px', fontWeight: 600, color: tokens.colors.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: tokens.spacing.sm, paddingLeft: tokens.spacing.md }}>
          Main
        </div>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'meals', label: 'Meal Plan', icon: '🍽️' },
          { id: 'shopping', label: 'Shopping & Budget', icon: '🛒' },
          { id: 'feedback', label: 'Insights & Autopilot', icon: '💡' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: tokens.spacing.md,
            padding: `${tokens.spacing.md} ${tokens.spacing.md}`,
            background: activeSection === item.id ? tokens.colors.primaryMuted : 'transparent',
            color: activeSection === item.id ? tokens.colors.primary : tokens.colors.textMuted,
            border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer',
            fontFamily: tokens.fonts.body, fontSize: '14px', fontWeight: activeSection === item.id ? 600 : 500,
            textAlign: 'left', marginBottom: '2px', transition: 'all 0.2s ease',
          }}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.label}
            {item.id === 'feedback' && autopilotChanges.filter(c => c.status === 'PENDING').length > 0 && (
              <span style={{
                marginLeft: 'auto', width: '20px', height: '20px', borderRadius: tokens.radius.full,
                background: tokens.colors.warning, color: '#fff', fontSize: '11px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {autopilotChanges.filter(c => c.status === 'PENDING').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: tokens.spacing.lg }}>
        <div style={{ fontFamily: tokens.fonts.body, fontSize: '11px', fontWeight: 600, color: tokens.colors.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: tokens.spacing.sm, paddingLeft: tokens.spacing.md }}>
          Settings
        </div>
        {[
          { id: 'family', label: 'Family Profiles', icon: '👨‍👩‍👧‍👦' },
          { id: 'diet', label: 'Diet & Requirements', icon: '🥗' },
          { id: 'goals', label: 'Goals & Targets', icon: '🎯' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: tokens.spacing.md,
            padding: `${tokens.spacing.md} ${tokens.spacing.md}`,
            background: activeSection === item.id ? tokens.colors.primaryMuted : 'transparent',
            color: activeSection === item.id ? tokens.colors.primary : tokens.colors.textMuted,
            border: 'none', borderRadius: tokens.radius.md, cursor: 'pointer',
            fontFamily: tokens.fonts.body, fontSize: '14px', fontWeight: activeSection === item.id ? 600 : 500,
            textAlign: 'left', marginBottom: '2px',
          }}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'auto', borderTop: `1px solid ${tokens.colors.border}`, paddingTop: tokens.spacing.lg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md, padding: tokens.spacing.sm }}>
          <div style={{ width: '40px', height: '40px', borderRadius: tokens.radius.full, background: tokens.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👨</div>
          <div>
            <div style={{ fontFamily: tokens.fonts.body, fontWeight: 600, fontSize: '14px', color: tokens.colors.text }}>Marcus Chen</div>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: '12px', color: tokens.colors.textMuted }}>Chen Family</div>
          </div>
        </div>
      </div>
    </nav>
  );

  // ============================================
  // DASHBOARD
  // ============================================
  const DashboardContent = () => {
    const person = people[activePerson];
    
    return (
      <div style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease' }}>
        {/* Header */}
        <div style={{ marginBottom: tokens.spacing.xl }}>
          <div style={{ fontFamily: tokens.fonts.body, fontSize: '14px', color: tokens.colors.textMuted, marginBottom: tokens.spacing.xs }}>
            Good morning, Marcus 👋
          </div>
          <h1 style={{ fontFamily: tokens.fonts.display, fontSize: '32px', fontWeight: 600, color: tokens.colors.text, margin: 0 }}>
            Today's Overview
          </h1>
        </div>

        {/* Person Selector */}
        <div style={{ display: 'flex', gap: tokens.spacing.sm, marginBottom: tokens.spacing.xl, flexWrap: 'wrap' }}>
          {Object.entries(people).map(([id, p]) => (
            <PersonPill key={id} person={p} isActive={activePerson === id} onClick={() => setActivePerson(id)} showState />
          ))}
        </div>

        {/* Active States Banner */}
        {person.temporaryStates.length > 0 && (
          <div style={{ marginBottom: tokens.spacing.xl }}>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: tokens.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing.sm }}>
              Active Life States
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
              {person.temporaryStates.map(state => <TemporaryStateBadge key={state} stateKey={state} />)}
            </div>
          </div>
        )}

        {/* Requirements Banner */}
        {person.dietRequirements.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: tokens.spacing.md,
            padding: tokens.spacing.md, background: tokens.colors.errorMuted,
            borderRadius: tokens.radius.md, marginBottom: tokens.spacing.xl,
            border: `1px solid ${tokens.colors.error}30`,
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <div style={{ fontFamily: tokens.fonts.body, fontWeight: 600, fontSize: '14px', color: tokens.colors.error }}>
                Medical Requirements Active
              </div>
              <div style={{ fontFamily: tokens.fonts.body, fontSize: '13px', color: tokens.colors.textMuted }}>
                {person.dietRequirements.map(r => r.replace('NO_', 'No ').replace('_', ' ')).join(', ')} — All meal suggestions comply with these constraints
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: tokens.spacing.lg, marginBottom: tokens.spacing.xl }}>
          {/* Calories */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: tokens.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing.sm }}>
                  Calories
                </div>
                <div style={{ fontFamily: tokens.fonts.display, fontSize: '36px', fontWeight: 600, color: tokens.colors.text }}>
                  {Math.round(person.calories * 0.78).toLocaleString()}
                </div>
                <div style={{ fontFamily: tokens.fonts.mono, fontSize: '13px', color: tokens.colors.textMuted }}>
                  of {person.calories.toLocaleString()} target
                </div>
              </div>
              <ProgressRing current={person.calories * 0.78} target={person.calories} size={80} strokeWidth={6} color={person.color} />
            </div>
          </Card>

          {/* Budget */}
          <Card>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: tokens.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing.sm }}>
              Weekly Budget
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing.sm }}>
              <span style={{ fontFamily: tokens.fonts.display, fontSize: '36px', fontWeight: 600, color: tokens.colors.text }}>${household.currentSpend}</span>
              <span style={{ fontFamily: tokens.fonts.mono, fontSize: '14px', color: tokens.colors.textMuted }}>/ ${household.weeklyBudget}</span>
            </div>
            <ProgressBar current={household.currentSpend} target={household.weeklyBudget} color={household.currentSpend > household.weeklyBudget * 0.9 ? tokens.colors.warning : tokens.colors.success} height={6} />
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.xs, marginTop: tokens.spacing.sm }}>
              <Badge variant="success" size="sm">↓ ${household.savingsThisMonth} saved this month</Badge>
            </div>
          </Card>

          {/* Family Total */}
          <Card style={{ background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, ${tokens.colors.primaryDark} 100%)` }}>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing.sm }}>
              Household Total
            </div>
            <div style={{ fontFamily: tokens.fonts.display, fontSize: '36px', fontWeight: 600, color: '#fff' }}>
              {totalFamilyCalories.toLocaleString()}
            </div>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: tokens.spacing.md }}>
              calories per day
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing.xs }}>
              {Object.values(people).map((p, i) => (
                <span key={i} style={{ fontSize: '20px' }}>{p.avatar}</span>
              ))}
            </div>
          </Card>
        </div>

        {/* Macros + Recent Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.lg }}>
          {/* Macros */}
          <Card>
            <div style={{ fontFamily: tokens.fonts.display, fontSize: '18px', fontWeight: 600, color: tokens.colors.text, marginBottom: tokens.spacing.lg }}>
              {person.name}'s Macros
            </div>
            {Object.entries(person.macros).map(([key, data]) => (
              <div key={key} style={{ marginBottom: tokens.spacing.md }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontFamily: tokens.fonts.body, fontWeight: 600, fontSize: '14px', color: tokens.colors.text, textTransform: 'capitalize' }}>{key}</span>
                  <span style={{ fontFamily: tokens.fonts.mono, fontSize: '13px', color: tokens.colors.textMuted }}>{data.current}g / {data.target}g</span>
                </div>
                <ProgressBar current={data.current} target={data.target} color={key === 'protein' ? tokens.colors.secondary : key === 'carbs' ? tokens.colors.accent : tokens.colors.primary} />
              </div>
            ))}
          </Card>

          {/* Recent Insights */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing.lg }}>
              <div style={{ fontFamily: tokens.fonts.display, fontSize: '18px', fontWeight: 600, color: tokens.colors.text }}>
                Recent Insights
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveSection('feedback')}>View all →</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
              {feedbackInsights.slice(0, 2).map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // ============================================
  // SHOPPING & BUDGET
  // ============================================
  const ShoppingContent = () => {
    const shoppingList = [
      { item: 'Chicken breast', qty: '2.5 kg', cost: 18.50, store: 'Costco', savings: 4.20 },
      { item: 'Brown rice', qty: '2 kg', cost: 5.99, store: 'Walmart', savings: 0 },
      { item: 'Broccoli', qty: '1.5 kg', cost: 4.49, store: 'Aldi', savings: 1.50 },
      { item: 'Olive oil', qty: '750ml', cost: 8.99, store: 'Costco', savings: 2.00 },
      { item: 'Greek yogurt', qty: '2 kg', cost: 7.99, store: 'Costco', savings: 3.00 },
      { item: 'Salmon fillets', qty: '800g', cost: 15.99, store: "Trader Joe's", savings: 0 },
      { item: 'Eggs (36 ct)', qty: '1 pack', cost: 6.49, store: 'Costco', savings: 1.80 },
      { item: 'Spinach', qty: '500g', cost: 3.99, store: 'Aldi', savings: 0.50 },
    ];
    const totalCost = shoppingList.reduce((sum, i) => sum + i.cost, 0);
    const totalSavings = shoppingList.reduce((sum, i) => sum + i.savings, 0);

    return (
      <div style={{ opacity: animateIn ? 1 : 0, transition: 'all 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing.xl }}>
          <div>
            <h1 style={{ fontFamily: tokens.fonts.display, fontSize: '32px', fontWeight: 600, color: tokens.colors.text, margin: 0 }}>
              Shopping & Budget
            </h1>
            <p style={{ fontFamily: tokens.fonts.body, fontSize: '15px', color: tokens.colors.textMuted, marginTop: tokens.spacing.xs }}>
              Week of Dec 2–8 • Chen Family
            </p>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing.md }}>
            <Button variant="secondary" icon="📋">Export List</Button>
            <Button icon="🔄">Find Deals</Button>
          </div>
        </div>

        {/* Budget Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: tokens.spacing.lg, marginBottom: tokens.spacing.xl }}>
          <Card>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: tokens.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing.sm }}>Weekly Budget</div>
            <div style={{ fontFamily: tokens.fonts.display, fontSize: '28px', fontWeight: 600, color: tokens.colors.text }}>${household.weeklyBudget}</div>
          </Card>
          <Card>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: tokens.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing.sm }}>This Week's Cost</div>
            <div style={{ fontFamily: tokens.fonts.display, fontSize: '28px', fontWeight: 600, color: totalCost < household.weeklyBudget ? tokens.colors.success : tokens.colors.warning }}>${totalCost.toFixed(2)}</div>
          </Card>
          <Card>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: tokens.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing.sm }}>Savings Found</div>
            <div style={{ fontFamily: tokens.fonts.display, fontSize: '28px', fontWeight: 600, color: tokens.colors.success }}>+${totalSavings.toFixed(2)}</div>
          </Card>
          <Card>
            <div style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: tokens.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing.sm }}>Under Budget</div>
            <div style={{ fontFamily: tokens.fonts.display, fontSize: '28px', fontWeight: 600, color: tokens.colors.primary }}>${(household.weeklyBudget - totalCost).toFixed(2)}</div>
          </Card>
        </div>

        {/* Shopping List */}
        <Card>
          <div style={{ fontFamily: tokens.fonts.display, fontSize: '18px', fontWeight: 600, color: tokens.colors.text, marginBottom: tokens.spacing.lg }}>
            Shopping List
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: tokens.spacing.md, padding: `${tokens.spacing.sm} 0`, borderBottom: `1px solid ${tokens.colors.border}`, marginBottom: tokens.spacing.md }}>
            <span style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: tokens.colors.textMuted, textTransform: 'uppercase' }}>Item</span>
            <span style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: tokens.colors.textMuted, textTransform: 'uppercase' }}>Quantity</span>
            <span style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: tokens.colors.textMuted, textTransform: 'uppercase' }}>Best Store</span>
            <span style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: tokens.colors.textMuted, textTransform: 'uppercase' }}>Cost</span>
            <span style={{ fontFamily: tokens.fonts.body, fontSize: '12px', fontWeight: 600, color: tokens.colors.textMuted, textTransform: 'uppercase' }}>Savings</span>
          </div>
          {shoppingList.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: tokens.spacing.md, padding: `${tokens.spacing.md} 0`, borderBottom: `1px solid ${tokens.colors.borderLight}`, alignItems: 'center' }}>
              <span style={{ fontFamily: tokens.fonts.body, fontWeight: 500, color: tokens.colors.text }}>{item.item}</span>
              <span style={{ fontFamily: tokens.fonts.mono, fontSize: '13px', color: tokens.colors.textMuted }}>{item.qty}</span>
              <Badge variant="default" size="sm">{item.store}</Badge>
              <span style={{ fontFamily: tokens.fonts.mono, fontWeight: 600, color: tokens.colors.text }}>${item.cost.toFixed(2)}</span>
              {item.savings > 0 ? (
                <Badge variant="success" size="sm">-${item.savings.toFixed(2)}</Badge>
              ) : (
                <span style={{ fontFamily: tokens.fonts.mono, fontSize: '13px', color: tokens.colors.textLight }}>—</span>
              )}
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: tokens.spacing.md, padding: `${tokens.spacing.lg} 0`, marginTop: tokens.spacing.md, borderTop: `2px solid ${tokens.colors.border}` }}>
            <span style={{ fontFamily: tokens.fonts.body, fontWeight: 700, color: tokens.colors.text }}>Total</span>
            <span></span>
            <span></span>
            <span style={{ fontFamily: tokens.fonts.mono, fontWeight: 700, fontSize: '16px', color: tokens.colors.text }}>${totalCost.toFixed(2)}</span>
            <Badge variant="success">-${totalSavings.toFixed(2)} saved</Badge>
          </div>
        </Card>

        {/* Cost Optimization Suggestions */}
        <Card style={{ marginTop: tokens.spacing.xl }}>
          <div style={{ fontFamily: tokens.fonts.display, fontSize: '18px', fontWeight: 600, color: tokens.colors.text, marginBottom: tokens.spacing.lg }}>
            💡 Cost Optimization Suggestions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
            {[
              { title: 'Swap salmon → canned sardines (2x/week)', savings: 18, impact: 'Similar omega-3 content, slightly lower protein', action: 'Apply swap' },
              { title: 'Buy chicken in bulk at Costco', savings: 8, impact: 'Requires freezer space, same quality', action: 'Add to list' },
              { title: 'Switch to frozen spinach', savings: 3, impact: 'Same nutrition, longer shelf life', action: 'Apply swap' },
            ].map((suggestion, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md, padding: tokens.spacing.md, background: tokens.colors.successMuted, borderRadius: tokens.radius.md }}>
                <div style={{ width: '48px', height: '48px', borderRadius: tokens.radius.md, background: tokens.colors.success, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: tokens.fonts.mono, fontWeight: 700 }}>
                  -${suggestion.savings}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: tokens.fonts.body, fontWeight: 600, color: tokens.colors.text }}>{suggestion.title}</div>
                  <div style={{ fontFamily: tokens.fonts.body, fontSize: '13px', color: tokens.colors.textMuted }}>{suggestion.impact}</div>
                </div>
                <Button variant="success" size="sm">{suggestion.action}</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // ============================================
  // FEEDBACK & AUTOPILOT
  // ============================================
  const FeedbackContent = () => (
    <div style={{ opacity: animateIn ? 1 : 0, transition: 'all 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing.xl }}>
        <div>
          <h1 style={{ fontFamily: tokens.fonts.display, fontSize: '32px', fontWeight: 600, color: tokens.colors.text, margin: 0 }}>
            Insights & Autopilot
          </h1>
          <p style={{ fontFamily: tokens.fonts.body, fontSize: '15px', color: tokens.colors.textMuted, marginTop: tokens.spacing.xs }}>
            Feedback engine analysis and automated adjustments
          </p>
        </div>
      </div>

      {/* Autopilot Status */}
      <Card style={{ marginBottom: tokens.spacing.xl, background: autopilotEnabled ? tokens.colors.primaryMuted : tokens.colors.borderLight }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.lg }}>
            <div style={{ width: '56px', height: '56px', borderRadius: tokens.radius.lg, background: autopilotEnabled ? tokens.colors.primary : tokens.colors.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              🤖
            </div>
            <div>
              <div style={{ fontFamily: tokens.fonts.display, fontSize: '20px', fontWeight: 600, color: tokens.colors.text }}>
                Autopilot Mode
              </div>
              <div style={{ fontFamily: tokens.fonts.body, fontSize: '14px', color: tokens.colors.textMuted }}>
                {autopilotEnabled ? 'Making safe, conservative adjustments within your bounds' : 'Manual mode — no automatic changes'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.lg }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: tokens.fonts.mono, fontSize: '12px', color: tokens.colors.textMuted }}>Bounds: ±10% calories</div>
              <div style={{ fontFamily: tokens.fonts.mono, fontSize: '12px', color: tokens.colors.textMuted }}>Approval: Required for swaps</div>
            </div>
            <button
              onClick={() => setAutopilotEnabled(!autopilotEnabled)}
              style={{
                width: '56px', height: '32px', borderRadius: tokens.radius.full,
                background: autopilotEnabled ? tokens.colors.primary : tokens.colors.border,
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease',
              }}
            >
              <div style={{
                width: '24px', height: '24px', borderRadius: tokens.radius.full,
                background: '#fff', position: 'absolute', top: '4px',
                left: autopilotEnabled ? '28px' : '4px', transition: 'all 0.3s ease',
                boxShadow: tokens.shadows.md,
              }} />
            </button>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.lg }}>
        {/* Autopilot Changes */}
        <Card>
          <div style={{ fontFamily: tokens.fonts.display, fontSize: '18px', fontWeight: 600, color: tokens.colors.text, marginBottom: tokens.spacing.lg }}>
            Autopilot Changes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
            {autopilotChanges.map(change => (
              <AutopilotChangeCard key={change.id} change={change} />
            ))}
          </div>
        </Card>

        {/* All Insights */}
        <Card>
          <div style={{ fontFamily: tokens.fonts.display, fontSize: '18px', fontWeight: 600, color: tokens.colors.text, marginBottom: tokens.spacing.lg }}>
            All Insights
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
            {feedbackInsights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // ============================================
  // DIET & REQUIREMENTS
  // ============================================
  const DietContent = () => {
    const person = people[activePerson];
    
    return (
      <div style={{ opacity: animateIn ? 1 : 0, transition: 'all 0.5s ease' }}>
        <div style={{ marginBottom: tokens.spacing.xl }}>
          <h1 style={{ fontFamily: tokens.fonts.display, fontSize: '32px', fontWeight: 600, color: tokens.colors.text, margin: 0 }}>
            Diet & Requirements
          </h1>
          <p style={{ fontFamily: tokens.fonts.body, fontSize: '15px', color: tokens.colors.textMuted, marginTop: tokens.spacing.xs }}>
            Preferences are flexible, requirements are enforced
          </p>
        </div>

        {/* Person Selector */}
        <div style={{ display: 'flex', gap: tokens.spacing.sm, marginBottom: tokens.spacing.xl, flexWrap: 'wrap' }}>
          {Object.entries(people).map(([id, p]) => (
            <PersonPill key={id} person={p} isActive={activePerson === id} onClick={() => setActivePerson(id)} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.lg }}>
          {/* Diet Preferences (Soft) */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, marginBottom: tokens.spacing.lg }}>
              <span style={{ fontSize: '20px' }}>💚</span>
              <div style={{ fontFamily: tokens.fonts.display, fontSize: '18px', fontWeight: 600, color: tokens.colors.text }}>
                Diet Preferences
              </div>
              <Badge variant="default" size="sm">Soft constraints</Badge>
            </div>
            
            <div style={{ marginBottom: tokens.spacing.lg }}>
              <div style={{ fontFamily: tokens.fonts.body, fontSize: '13px', fontWeight: 600, color: tokens.colors.textMuted, marginBottom: tokens.spacing.sm }}>Patterns</div>
              <div style={{ display: 'flex', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
                {['Vegan', 'Vegetarian', 'Pescatarian', 'Mediterranean', 'Paleo', 'Keto'].map(pattern => {
                  const isActive = person.dietPreferences.patterns.includes(pattern.toUpperCase());
                  return (
                    <button key={pattern} style={{
                      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                      borderRadius: tokens.radius.full,
                      border: `1.5px solid ${isActive ? tokens.colors.success : tokens.colors.border}`,
                      background: isActive ? tokens.colors.successMuted : tokens.colors.surface,
                      color: isActive ? tokens.colors.success : tokens.colors.textMuted,
                      fontFamily: tokens.fonts.body, fontSize: '13px', fontWeight: 500,
                      cursor: 'pointer',
                    }}>
                      {isActive && '✓ '}{pattern}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: tokens.spacing.lg }}>
              <div style={{ fontFamily: tokens.fonts.body, fontSize: '13px', fontWeight: 600, color: tokens.colors.textMuted, marginBottom: tokens.spacing.sm }}>Liked Ingredients</div>
              <div style={{ display: 'flex', gap: tokens.spacing.xs, flexWrap: 'wrap' }}>
                {person.dietPreferences.liked.map(item => (
                  <Badge key={item} variant="success" size="sm">👍 {item}</Badge>
                ))}
                <button style={{ padding: '4px 12px', borderRadius: tokens.radius.full, border: `1px dashed ${tokens.colors.border}`, background: 'transparent', color: tokens.colors.textMuted, fontSize: '12px', cursor: 'pointer' }}>+ Add</button>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: tokens.fonts.body, fontSize: '13px', fontWeight: 600, color: tokens.colors.textMuted, marginBottom: tokens.spacing.sm }}>Disliked Ingredients</div>
              <div style={{ display: 'flex', gap: tokens.spacing.xs, flexWrap: 'wrap' }}>
                {person.dietPreferences.disliked.map(item => (
                  <Badge key={item} variant="warning" size="sm">👎 {item}</Badge>
                ))}
                <button style={{ padding: '4px 12px', borderRadius: tokens.radius.full, border: `1px dashed ${tokens.colors.border}`, background: 'transparent', color: tokens.colors.textMuted, fontSize: '12px', cursor: 'pointer' }}>+ Add</button>
              </div>
            </div>
          </Card>

          {/* Diet Requirements (Hard) */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, marginBottom: tokens.spacing.lg }}>
              <span style={{ fontSize: '20px' }}>🚫</span>
              <div style={{ fontFamily: tokens.fonts.display, fontSize: '18px', fontWeight: 600, color: tokens.colors.text }}>
                Medical Requirements
              </div>
              <Badge variant="error" size="sm">Hard constraints</Badge>
            </div>
            
            <p style={{ fontFamily: tokens.fonts.body, fontSize: '13px', color: tokens.colors.textMuted, marginBottom: tokens.spacing.lg }}>
              These are non-negotiable. All meal suggestions and Autopilot changes will respect these constraints.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
              {['NO_GLUTEN', 'NO_LACTOSE', 'NO_NUTS', 'NO_SOY', 'NO_EGGS', 'LOW_SODIUM', 'LOW_FODMAP'].map(req => {
                const isActive = person.dietRequirements.includes(req);
                const label = req.replace('NO_', 'No ').replace('LOW_', 'Low ').replace('_', ' ');
                return (
                  <div key={req} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: tokens.spacing.md, borderRadius: tokens.radius.md,
                    background: isActive ? tokens.colors.errorMuted : tokens.colors.borderLight,
                    border: `1px solid ${isActive ? tokens.colors.error + '40' : 'transparent'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
                      <span style={{ fontSize: '18px' }}>{isActive ? '⛔' : '○'}</span>
                      <span style={{ fontFamily: tokens.fonts.body, fontWeight: isActive ? 600 : 400, color: isActive ? tokens.colors.error : tokens.colors.textMuted }}>{label}</span>
                    </div>
                    <button style={{
                      padding: '6px 12px', borderRadius: tokens.radius.md,
                      border: 'none', background: isActive ? tokens.colors.error : tokens.colors.primary,
                      color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    }}>
                      {isActive ? 'Remove' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div style={{ minHeight: '100vh', background: tokens.colors.background, fontFamily: tokens.fonts.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:hover { opacity: 0.9; }
        button:active { transform: scale(0.98); }
      `}</style>
      
      <Navigation />
      
      <main style={{ marginLeft: '260px', padding: tokens.spacing.xl, maxWidth: '1100px' }}>
        {activeSection === 'dashboard' && <DashboardContent />}
        {activeSection === 'shopping' && <ShoppingContent />}
        {activeSection === 'feedback' && <FeedbackContent />}
        {activeSection === 'diet' && <DietContent />}
        {['meals', 'family', 'goals'].includes(activeSection) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: tokens.radius.lg, background: tokens.colors.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: tokens.spacing.lg }}>
              {activeSection === 'meals' && '🍽️'}
              {activeSection === 'family' && '👨‍👩‍👧‍👦'}
              {activeSection === 'goals' && '🎯'}
            </div>
            <h2 style={{ fontFamily: tokens.fonts.display, fontSize: '24px', fontWeight: 600, color: tokens.colors.text, marginBottom: tokens.spacing.sm, textTransform: 'capitalize' }}>
              {activeSection.replace('-', ' ')}
            </h2>
            <p style={{ fontFamily: tokens.fonts.body, fontSize: '15px', color: tokens.colors.textMuted, maxWidth: '400px' }}>
              This section demonstrates the design system. Full implementation would include the complete {activeSection} functionality.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SwanHealthApp;