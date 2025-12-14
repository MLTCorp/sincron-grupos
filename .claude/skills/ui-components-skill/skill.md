---
name: ui-components-skill
description: Expert UI component integration with AI-powered suggestions. Creates beautiful, animated React components using shadcn, Tailwind CSS, and Framer Motion. Use when building modern UIs, integrating Aceternity-style components, or enhancing frontend aesthetics.
---

# UI Components Skill

## Core Principles

When integrating UI components:

1. **Always verify project setup** - Check for shadcn, Tailwind CSS, and TypeScript support before proceeding
2. **Use `/components/ui` folder** - All reusable components go in this standard location
3. **Install all dependencies** - Never leave missing packages; install before integration
4. **Replace placeholder assets** - Use Unsplash stock images and lucide-react icons
5. **Ensure responsive behavior** - All components must work on mobile, tablet, and desktop

## When to Use This Skill

Activate this skill when the user asks to:
- Add beautiful UI components to a React project
- Integrate Aceternity UI-style components
- Create animated sections (heroes, timelines, cards)
- Build modern landing pages
- Enhance existing UI with animations
- Add Framer Motion components

## Project Setup Verification

### Step 1: Check Project Requirements

Before any integration, verify:

```bash
# Check for package.json
ls package.json

# Check for Tailwind config
ls tailwind.config.*

# Check for TypeScript
ls tsconfig.json

# Check for shadcn components folder
ls components/ui/
```

### Step 2: Setup Instructions If Missing

#### If No Project Exists:

```bash
# Create Next.js project with TypeScript and Tailwind
npx create-next-app@latest my-app --typescript --tailwind --app --no-src-dir --import-alias "@/*"

cd my-app

# Initialize shadcn
npx shadcn@latest init

# Add base components
npx shadcn@latest add button card
```

#### If Missing shadcn:

```bash
npx shadcn@latest init
```

#### If Missing Tailwind:

Follow official Tailwind setup for your framework.

#### Why `/components/ui` Folder is Critical:

The `/components/ui` folder is the standard location for:
- shadcn components (button, card, input, etc.)
- Custom reusable UI components
- Animated Aceternity-style components

**Benefits:**
- Consistent import paths: `@/components/ui/component-name`
- Easy component discovery
- Separation from page-specific components
- Works with shadcn CLI additions

## Component Integration Process

### Step 1: Analyze Component Requirements

For each component, identify:
- Required NPM dependencies (framer-motion, lucide-react, etc.)
- shadcn component dependencies (button, card, etc.)
- Required assets (images, icons)
- Data/props structure

### Step 2: Install Dependencies

```bash
# Common dependencies for animated components
npm install framer-motion lucide-react

# For shadcn components
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge

# Add specific shadcn components
npx shadcn@latest add button card badge
```

### Step 3: Create Component File

Place in `/components/ui/component-name.tsx`:

```tsx
"use client";
// Component code here
```

### Step 4: Create Demo/Usage Example

Show how to use the component with real data:

```tsx
import { ComponentName } from "@/components/ui/component-name";

export function ComponentDemo() {
  return <ComponentName data={sampleData} />;
}
```

## Component Library Reference

### Available Components

The skill includes templates for:

#### Timelines
- **Timeline** - Scroll-animated vertical timeline with animated progress bar
  - Dependencies: `framer-motion`
  - Features: Scroll progress, sticky headers, responsive

#### Heroes
- **Animated Hero** - Hero section with rotating text animation
  - Dependencies: `framer-motion`, `lucide-react`
  - Features: Word cycling animation, CTA buttons, responsive

#### Cards & Grids
- **Bento Grid** - Modern grid layout with varied card sizes
- **Feature Cards** - Cards with icons and descriptions
- **3D Card Effect** - Cards with perspective on hover

#### Sections
- **Feature Section** - Layout for showcasing features
- **Testimonials** - Customer testimonial carousel
- **Pricing Tables** - Pricing comparison layouts

### Template: Timeline Component

```tsx
// File: components/ui/timeline.tsx
"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-white dark:bg-neutral-950 font-sans md:px-10"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-4xl mb-4 text-black dark:text-white max-w-4xl">
          Changelog from my journey
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-sm">
          I&apos;ve been working on Aceternity for the past 2 years. Here&apos;s
          a timeline of my journey.
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500 ">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
```

### Template: Animated Hero Component

```tsx
// File: components/ui/animated-hero.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["amazing", "new", "wonderful", "beautiful", "smart"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              Read our launch article <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-spektr-cyan-50">This is something</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Managing a small business today is already tough. Avoid further
              complications by ditching outdated, tedious trade methods. Our
              goal is to streamline SMB trade, making it easier and faster than
              ever.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4" variant="outline">
              Jump on a call <PhoneCall className="w-4 h-4" />
            </Button>
            <Button size="lg" className="gap-4">
              Sign up here <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
```

## Asset Replacement Strategy

### Images

Replace placeholder images with Unsplash stock photos:

```tsx
// Instead of Aceternity assets
src="https://assets.aceternity.com/templates/startup-1.webp"

// Use Unsplash (known working URLs)
src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop"  // Tech/coding
src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=500&fit=crop"  // Business dashboard
src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=500&fit=crop"  // Team working
src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&h=500&fit=crop"  // Collaboration
```

### Icons

Use lucide-react for all icons:

```tsx
import {
  ArrowRight,
  Check,
  Star,
  Zap,
  Shield,
  Clock,
  Users,
  Settings,
  BarChart,
  Mail
} from "lucide-react";
```

## Common Dependencies Checklist

### Core Dependencies

```bash
npm install framer-motion lucide-react
```

### shadcn Dependencies

```bash
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

### Common shadcn Components

```bash
npx shadcn@latest add button card badge input label tabs dialog
```

## Integration Questions Checklist

Before integrating any component, ask:

1. **What data/props will be passed to this component?**
   - Define TypeScript interfaces
   - Identify required vs optional props

2. **Are there any specific state management requirements?**
   - Local state (useState)
   - Global state (context/store)
   - Server state (react-query/SWR)

3. **Are there any required assets (images, icons, etc.)?**
   - List all image placeholders to replace
   - Identify icon requirements

4. **What is the expected responsive behavior?**
   - Mobile-first approach
   - Breakpoints: sm, md, lg, xl

5. **What is the best place to use this component in the app?**
   - Page component
   - Layout component
   - Standalone section

## Utility Functions

### Required: cn() helper

```tsx
// File: lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Error Prevention

Common mistakes to avoid:

1. **Missing "use client"** - Client components need this directive
2. **Missing dependencies** - Always install before importing
3. **Wrong import paths** - Use `@/components/ui/` consistently
4. **Missing utility function** - Ensure `cn()` exists in `lib/utils.ts`
5. **Placeholder images** - Replace with real Unsplash URLs

## Output Format

When integrating components:

1. **Show project requirements** (what to check/install)
2. **Provide complete component code** (copy-paste ready)
3. **Show usage example** (demo component)
4. **List setup instructions** (dependencies, config)
5. **Explain customization options** (props, styling)

## Daily Workflow Patterns

### Pattern 1: User Wants New Component

**User Request**:
> "Add a beautiful animated timeline to my project"

**Skill Process**:
1. Verify project setup (shadcn, Tailwind, TypeScript)
2. Check for existing `/components/ui` folder
3. Install dependencies (`framer-motion`)
4. Create `components/ui/timeline.tsx`
5. Provide usage example with sample data
6. Replace placeholder images with Unsplash

### Pattern 2: User Wants Hero Section

**User Request**:
> "Create an animated hero section with rotating text"

**Skill Process**:
1. Check for Button component from shadcn
2. Install `framer-motion` and `lucide-react`
3. Create `components/ui/animated-hero.tsx`
4. Customize rotating words for user's use case
5. Provide page integration example

### Pattern 3: User Wants Full Landing Page

**User Request**:
> "Build a modern landing page with hero, features, and testimonials"

**Skill Process**:
1. Plan component hierarchy
2. Create TodoWrite for tracking each section
3. Install all required dependencies at once
4. Create components in order:
   - Hero section
   - Features grid
   - Testimonials carousel
   - CTA section
5. Create page component integrating all sections

## Validation

Before outputting, verify:

- All components have "use client" directive
- Dependencies are listed for installation
- Import paths use `@/components/ui/`
- Placeholder images are replaced
- TypeScript interfaces are defined
- Responsive classes are included
- Dark mode support is maintained

---

**Remember**: Beautiful UI is about attention to detail. Every component should work perfectly on all devices, support dark mode, and use smooth animations. When in doubt, follow Aceternity UI patterns for premium aesthetics.
