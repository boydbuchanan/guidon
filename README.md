# Guidon

A minimalist React component library and toolkit built for Vite + React Server Components (RSC). It provides Shadcn-style inputs and buttons powered by Utopia's fluid typography and spacing steps.

## The Power of Flags (Why it's called Guidon)

The namesake of the library perfectly captures its core layout philosophy: using intuitive boolean **flags** instead of wrestling with the often confusing nature of CSS Flexbox. Rather than context-switching to remember if you need `justify-content`, `align-items`, or `flex-direction`, you just tell your layout components what they are:

```tsx
import { Col, Content, SheetPanel, Group } from 'guidon/index';

// Need a column instead of a row? Just add `col`. Want spacing? Add `gap`.
<Col gap top>
  {/* Need this content pushed to the right? Use `right`. */}
  <Content right>
    <Button>Settings</Button>
  </Content>

  {/* Specialized layout elements also react to the same flags seamlessly */}
  <SheetPanel left>Slide out from the left edge</SheetPanel>
  <SheetPanel bottom>Slide up from the bottom edge</SheetPanel>
</Col>
```
Flags drastically cut down CSS boilerplate and speed up UI creation.

## Features

- **Fluid Spacing and Typography:** Automatically scales with the viewport using Utopia's methodology.
- **Declarative Local State Management:** Manage UI states effortlessly using components like <LocalState>, <RadioState>, and <SelectionState>.
- **RSC Built-in:** Designed symmetrically between client elements (*.client.tsx) and standard React components (*.tsx).
- **Rich Elements & Layouts:** Everything from Modal, Sheet, and Rail to clustered Grouped inputs and buttons.
- **Theme Built-In:** First-class Dark/Light mode support with <ThemeInject /> and <ThemeToggle />.

## Installation



## Getting Started

### Theming and Setup
To quickly set up theming and global layout components, inject them at the root of your application (e.g. index.html or root component):

```typescript
import { ThemeInject, ThemeToggle } from 'guidon/index.client';
import { Container, Content } from 'guidon/index';

export function Root() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInject />
      </head>
      <body>
        <Container col>
          <Content>
            <h1>Guidon App</h1>
            <p>Welcome to proper fluid UI design.</p>
          </Content>
          <ThemeToggle />
        </Container>
      </body>
    </html>
  );
}
```

### Declarative State Management
Unlike complex custom hooks, Guidon uses declarative components that handle internal state via \id\s and grouping:

```typescript
import { Col, Content, Text, ChevronButton, LocalState } from 'guidon/index';

export function Example() {
  const tabProps = { id: 'tabs-group', initial: true };

  return (
    <Col gap>
      <LocalState items={[tabProps]}>
        <ChevronButton {...tabProps} gap={2}>
          <h6>Expand Details</h6>
        </ChevronButton>

        {/* Collapsible content driven cleanly by State Props */}
        <Content collapse {...tabProps}>
          <Text>Here is the extra information!</Text>
        </Content>
      </LocalState>
    </Col>
  );
}
```

### Form Elements & Layout

Guidon provides elegant layouts and grouping patterns, handling inputs alongside primary, secondary, or muted buttons:

```typescript
import { Group, Button } from 'guidon/index';
import { SearchIcon } from './SVGIcon';

export function SearchBar() {
  return (
    <Group id="search-input">
      <input type="text" placeholder="Search documentation..." />
      <Button primary><SearchIcon /></Button>
    </Group>
  );
}
```

## License
MIT
