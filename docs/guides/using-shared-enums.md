# Using Shared Enums in WayBinder

This guide explains how to use the shared enum values defined in `types/enums.ts` throughout the WayBinder application.

## Overview

The `types/enums.ts` file provides a centralized location for all enum values used in the application. This ensures consistency between the database schema, server-side validation, and client-side forms.

For each enum, the file exports:

1. A constant array of values (e.g., `USER_ROLES`)
2. A TypeScript type (e.g., `UserRole`)
3. A Zod schema (e.g., `userRoleSchema`)

It also provides helper functions for working with these enums:

- `createEnumSchema`: Creates a Zod schema with a required error message
- `createSelectOptions`: Creates an array of options for select components
- `_formatEnumValue`: Formats enum values for display

## Using Enums in Database Schema

The database schema in `server/db/schema/enum.ts` uses the shared enum values:

```typescript
import { pgEnum } from "drizzle-orm/pg-core";
import { USER_ROLES, GENDERS } from "@/types/enums";

export const userRoleEnum = pgEnum("user_role", USER_ROLES);
export const genderEnum = pgEnum("gender", GENDERS);
// ...
```

## Using Enums in Zod Schemas

You can use the shared enum values in Zod schemas in several ways:

### Option 1: Use the pre-defined Zod schemas

```typescript
import { genderSchema, experienceLevelSchema } from "@/types/enums";

const mySchema = z.object({
  gender: genderSchema,
  experienceLevel: experienceLevelSchema,
});
```

### Option 2: Use the helper function with a custom error message

```typescript
import { GENDERS, createEnumSchema } from "@/types/enums";

const mySchema = z.object({
  gender: createEnumSchema(GENDERS, "Please select a gender"),
});
```

### Option 3: Use z.enum directly with the shared values

```typescript
import { GENDERS } from "@/types/enums";

const mySchema = z.object({
  gender: z.enum(GENDERS, {
    required_error: "Please select a gender",
  }),
});
```

## Using Enums in React Hook Form

When using React Hook Form with Zod validation, you can use the shared enum values for both validation and type safety:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GENDERS, Gender } from "@/types/enums";

// Define the form schema
const formSchema = z.object({
  gender: z.enum(GENDERS, {
    required_error: "Please select a gender",
  }),
});

// Infer the form values type
type FormValues = z.infer<typeof formSchema>;

// Use in your component
function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: undefined,
    },
  });

  // ...
}
```

## Using Enums in UI Components

The `createSelectOptions` helper function makes it easy to create options for select components:

```typescript
import { GENDERS, createSelectOptions } from "@/types/enums";

function MyComponent() {
  // Create select options
  const genderOptions = createSelectOptions(GENDERS);

  return (
    <Select>
      {genderOptions.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
}
```

## Adding New Enum Values

To add a new enum:

1. Add the enum values to `types/enums.ts`:

```typescript
// New enum
export const PAYMENT_METHODS = ['credit_card', 'paypal', 'bank_transfer'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];
export const paymentMethodSchema = z.enum(PAYMENT_METHODS);
```

2. If needed, add the corresponding Drizzle pgEnum to `server/db/schema/enum.ts`:

```typescript
import { PAYMENT_METHODS } from "@/types/enums";

export const paymentMethodEnum = pgEnum("payment_method", PAYMENT_METHODS);
```

## Complete Example

See `docs/examples/enum-usage-example.tsx` for a complete example of using shared enum values with React Hook Form and shadcn UI components.
