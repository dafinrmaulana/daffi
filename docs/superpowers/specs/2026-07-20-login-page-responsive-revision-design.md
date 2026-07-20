# Login Page Responsive Revision Design

## Goal

Refine the existing `/login` UI so its desktop panels are balanced, its mobile layout focuses entirely on the form, and its form behavior remains ready for future application-specific validation.

## Layout

- At the Tailwind `lg` breakpoint and above, the login page uses two equal-width columns.
- Below `lg` (1024px), the editorial panel is hidden and occupies no layout space.
- Below `lg`, the form panel fills the viewport width and keeps its existing responsive horizontal padding.
- The form panel continues to fill at least the viewport height.

The editorial panel remains in the page markup and uses responsive CSS (`hidden lg:flex`). JavaScript viewport detection and duplicate mobile markup are not required.

## Form Behavior

React Hook Form remains responsible for field registration and submit handling.

The current validation rules and validation presentation are removed:

- No required-field rules
- No email-pattern rule
- No validation error messages
- No validation-specific `aria-invalid` or `aria-describedby` attributes

Email, password, remember-me state, and password visibility behavior remain unchanged. Submission remains presentational and does not call an API or navigate.

## Footer

The login footer uses this copy:

`© {current year} Dafi. Built with Passion.`

The year is calculated dynamically with `new Date().getFullYear()` in the server-rendered login page.

## Testing

Tests will verify:

- Empty and arbitrary form values can be submitted without validation feedback.
- Password visibility behavior still works.
- The root layout uses equal desktop columns.
- The editorial panel is hidden below `lg` and displayed from `lg` upward.
- The footer contains the current year and the exact “Built with Passion.” copy.

## Out of Scope

- Authentication and API submission
- Replacement validation rules
- A JavaScript viewport listener
- Changes to the desktop editorial content
