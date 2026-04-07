# PostHog A/B Testing & Analytics Setup - BETRADARMUS

## Übersicht

Diese Dokumentation beschreibt die PostHog-Integration für A/B-Testing, Event-Tracking und Conversion-Analyse auf der BETRADARMUS-Plattform.

## Voraussetzungen

1. **PostHog Account erstellen**: https://app.posthog.com/signup
2. **Project API Key** aus den Project Settings kopieren
3. **Host-Region** wählen (EU oder US)

## Installation

Die PostHog-Pakete sind bereits installiert:
- `posthog-js` - Core JavaScript SDK
- `@posthog/react` - React Hooks & Provider

## Konfiguration

### Schritt 1: Environment Variables setzen

Füge diese Werte in `/app/frontend/.env` ein:

```env
REACT_APP_POSTHOG_API_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_POSTHOG_HOST=https://eu.i.posthog.com
```

### Schritt 2: Frontend neu starten

```bash
sudo supervisorctl restart frontend
```

---

## Was wird getrackt?

### 1. Automatische Events

| Event | Beschreibung |
|-------|--------------|
| `$pageview` | Jeder Seitenaufruf |
| `$pageleave` | Wenn Nutzer die Seite verlässt |
| `$autocapture` | Klicks auf Buttons, Links, Inputs |

### 2. Custom Events

| Event | Beschreibung |
|-------|--------------|
| `cta_clicked` | CTA-Button Klicks |
| `button_clicked` | Alle Button-Klicks |
| `telegram_link_clicked` | Telegram-Link Klicks |
| `faq_question_opened` | FAQ-Frage geöffnet |
| `faq_question_closed` | FAQ-Frage geschlossen |
| `scroll_depth_tracked` | Scroll-Tiefe beim Verlassen |
| `section_viewed` | Section sichtbar im Viewport |
| `time_on_page_tracked` | Verweildauer auf Seite |
| `auth_modal_opened` | Auth Modal geöffnet |
| `registration_started` | Registrierung gestartet |
| `registration_completed` | Registrierung abgeschlossen |
| `pricing_plan_viewed` | Pricing-Plan angesehen |
| `pricing_plan_selected` | Pricing-Plan ausgewählt |

### 3. Section Tracking

Alle Landing Page Sections werden automatisch getrackt, wenn sie zu >50% im Viewport sichtbar sind:

- `hero-section`
- `value-framing-section`
- `why-different-section`
- `four-pillars-section`
- `signal-comparison-table-section`
- `faq-section`
- `trust-section`
- `final-cta-section`
- ... und alle anderen Sections

---

## A/B Testing einrichten

### Schritt 1: Feature Flag in PostHog erstellen

1. Gehe zu **Feature Flags** im PostHog Dashboard
2. Klicke **New feature flag**
3. Wähle einen Key (z.B. `trust_section_variant`)
4. Setze **Rollout percentage** auf 50%
5. Für Multivariate Tests: Füge Varianten hinzu (z.B. `control`, `variant_a`, `variant_b`)

### Schritt 2: Experiment erstellen

1. Gehe zu **Experiments**
2. Klicke **New experiment**
3. Wähle deinen Feature Flag
4. Definiere:
   - **Primary Metric**: z.B. "registration_completed" (Conversion)
   - **Secondary Metrics**: z.B. "cta_clicked", "time_on_page"
5. Starte das Experiment

### Schritt 3: Code-Implementierung

Verwende die PostHog React Hooks:

```jsx
import { useFeatureFlagEnabled, useFeatureFlagVariantKey } from '@posthog/react';

export const TrustSection = () => {
  // Boolean Flag
  const showNewVersion = useFeatureFlagEnabled('trust_section_variant');
  
  // Multivariate Flag
  const variant = useFeatureFlagVariantKey('trust_section_variant');
  
  if (variant === 'variant_a') {
    return <TrustSectionVariantA />;
  }
  
  return <TrustSectionControl />;
};
```

---

## Feature Flags (vorbereitet)

Diese Feature Flags sind im Code vorbereitet:

| Flag Key | Beschreibung |
|----------|--------------|
| `trust_section_variant` | Trust Section Varianten testen |
| `final_cta_variant` | Final CTA Varianten testen |
| `value_framing_variant` | Value Framing Varianten testen |
| `section_order_test` | Section-Reihenfolge testen |
| `cta_button_text` | CTA Button-Texte testen |
| `pricing_display_variant` | Pricing-Darstellung testen |

---

## Analytics Hooks verwenden

### FAQ Tracking

```jsx
import { useFAQTracking } from '../utils/analyticsHooks';

export const FAQSection = () => {
  const { trackFAQOpen, trackFAQClose } = useFAQTracking();
  
  const handleAccordionChange = (value) => {
    if (value) {
      trackFAQOpen(0, 'Ist Betradarmus ein Tippdienst?');
    }
  };
};
```

### CTA Tracking

```jsx
import { useCTATracking } from '../utils/analyticsHooks';

export const MyComponent = () => {
  const { trackCTAClick, trackTelegramClick } = useCTATracking();
  
  return (
    <button onClick={() => trackCTAClick('hero_start_btn', { plan: 'free' })}>
      Jetzt starten
    </button>
  );
};
```

### Auth Tracking

```jsx
import { useAuthTracking } from '../utils/analyticsHooks';

export const AuthModal = () => {
  const { trackAuthModalOpened, trackRegistrationCompleted } = useAuthTracking();
  
  useEffect(() => {
    trackAuthModalOpened('hero_cta', 'free');
  }, []);
  
  const handleSuccess = (user) => {
    trackRegistrationCompleted(user.id, user.plan);
  };
};
```

---

## Session Recording

Session Recording ist automatisch aktiviert. Sensible Daten (Passwörter) werden automatisch maskiert.

Um zusätzliche Elemente zu maskieren:

```jsx
<div className="ph-no-capture">
  Dieser Inhalt wird nicht aufgezeichnet
</div>
```

---

## Auswertung im Dashboard

### Funnels erstellen

1. **Registrierungs-Funnel**:
   - Schritt 1: `$pageview` (Landing Page)
   - Schritt 2: `auth_modal_opened`
   - Schritt 3: `registration_started`
   - Schritt 4: `registration_completed`

2. **FAQ-Engagement**:
   - Analysiere welche Fragen am meisten geöffnet werden
   - Korreliere mit Conversions

3. **Section-Engagement**:
   - Welche Sections werden am meisten gesehen?
   - Scroll-Tiefe Analyse

### Insights erstellen

1. **Conversion Rate**: `registration_completed` / `$pageview`
2. **CTA Click Rate**: `cta_clicked` / `section_viewed`
3. **Avg Time on Page**: Aggregation von `time_on_page_tracked`

---

## Troubleshooting

### Events erscheinen nicht

1. Prüfe ob `REACT_APP_POSTHOG_API_KEY` gesetzt ist
2. Öffne Browser Console und suche nach "PostHog"
3. Im Development Mode wird `posthog.debug()` aktiviert

### Feature Flags funktionieren nicht

1. Prüfe ob der Flag Key korrekt ist
2. Warte 30 Sekunden nach Erstellung (Caching)
3. Verwende `posthog.reloadFeatureFlags()` zum manuellen Refresh

---

## Dateien

- `/app/frontend/src/utils/analytics.js` - Event Constants & Utilities
- `/app/frontend/src/utils/analyticsHooks.js` - React Hooks
- `/app/frontend/src/utils/PostHogProvider.jsx` - Provider Component
- `/app/frontend/src/components/AnalyticsTracker.jsx` - Scroll & Time Tracker

---

## Nächste Schritte

1. ✅ PostHog API Key in `.env` eintragen
2. ⬜ Erstes Experiment erstellen (z.B. Trust Section)
3. ⬜ Funnels im Dashboard einrichten
4. ⬜ Wöchentliche Analytics-Review einplanen
