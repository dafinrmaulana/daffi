# Login Page Design

## Goal

Create a responsive, presentation-only login page at `/login`. The layout should follow the split-screen composition of the Meridian login reference while using the portfolio's existing editorial, monochrome design language.

Authentication and backend integration are outside this scope.

## Visual Direction

The page uses an editorial split-screen layout:

- On desktop, the form panel occupies approximately 45% of the viewport and the editorial panel occupies 55%.
- The form panel contains a home/back link, theme toggle, introductory copy, email field, password field, remember-me checkbox, and submit button.
- The editorial panel uses a contrasting background, oversized serif typography, restrained mono labels, and portfolio identity copy such as “Dafi — Frontend Developer.”
- Existing design tokens provide the background, foreground, muted, border, and accent colors.
- Existing serif, sans-serif, and monospace font families are reused.
- Square borders, strong spacing, and restrained transitions match the landing page.

On mobile, the layout becomes a single column. The editorial panel is reduced to a compact introductory header above the form so that the form remains the primary content and all controls remain comfortably usable.

## Page Chrome

`/login` is a fullscreen authentication page. The global header, social rail, and footer are not rendered on this route. The existing theme provider remains active so the page continues to support light and dark modes.

A small route-aware site chrome component will own the decision to render the global header, social rail, and footer. This avoids duplicating the theme provider or restructuring all existing routes.

## Components

### Login Page

`app/login/page.tsx` remains a server component. It defines the page metadata and composes the fullscreen layout, form panel, and editorial panel.

### Login Form

A focused client component owns the form behavior. It uses React Hook Form for field registration, submission handling, field state, and basic client-side validation.

The fields are:

- Email: required and validated as an email address.
- Password: required.
- Remember me: optional boolean UI state.

The submit handler is intentionally presentational. A valid submission does not call an API, authenticate a user, or navigate away.

### Site Chrome

A small client component uses the current pathname to omit the portfolio header, social rail, and footer on `/login`. It renders the existing chrome unchanged on all other routes.

## Interaction and Accessibility

- The password visibility control switches the input between `password` and `text`.
- The control updates `aria-label` and `aria-pressed` to match its current state.
- Every field has a persistent, associated label.
- Email and password inputs use appropriate autocomplete attributes.
- Validation messages are associated with their inputs and become visible after submission or field interaction.
- Keyboard focus is clearly visible using the portfolio's existing focus-ring pattern.
- The theme toggle continues to use the project's existing theme system.
- The submit button is a real form submit control but has no authentication side effect.

## Responsive Behavior

- Desktop and large tablet widths use the two-column split.
- Smaller widths use a single-column layout with a compact editorial header.
- The page fills at least the viewport height while remaining scrollable on short screens.
- Form controls use touch-friendly heights and do not overflow narrow viewports.

## Dependencies

React Hook Form will be added to the project because it is not currently installed. No validation schema library or other UI dependency is required; the small set of validation rules will use React Hook Form directly.

## Testing

Tests will verify:

- The login form renders its labeled controls.
- Invalid email and empty required fields show validation feedback.
- The password visibility control changes the input type and accessible state.
- A valid presentational submission does not navigate or call an authentication API.
- Global site chrome is omitted on `/login` and remains available on normal portfolio routes.

The implementation will also be checked with the repository's lint and production build commands.

## Out of Scope

- Authentication providers, sessions, cookies, or database access
- API calls and loading or server-error states
- Forgot-password and registration flows
- Social login
- Post-login navigation
