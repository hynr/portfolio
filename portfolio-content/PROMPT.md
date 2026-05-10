# CONTENT LANE PROMPT
**Branch:** feat/plain-mode  
**Role:** Standard portfolio website implementation

## YOUR MISSION
Build a polished, professional portfolio website in content mode. This is the "normal" portfolio that showcases skills, projects, and experience in a clean, accessible format.

## CRITICAL RULES
1. **READ CONTRACT.md FIRST** - Treat it as frozen law. Import types, don't modify them.
2. **FILE OWNERSHIP** - You ONLY write files in these paths:
   ```
   app/page.tsx              (mode toggle + mounting logic)
   app/content-mode/         (all content mode files)  
   lib/portfolio-data.ts     (portfolio data definitions)
   lib/mode-toggle.ts        (mode switching logic)
   styles/content.css        (content-specific styles)
   ```
3. **NO SCOPE EXPANSION** - If CONTRACT.md doesn't cover something, STOP and surface it. Don't improvise.
4. **COMMIT FREQUENTLY** - Every major component, every section, every milestone. Clear messages.
5. **BUILD BEFORE DONE** - Run `npm run build` and fix all errors before declaring complete.

## TECHNICAL REQUIREMENTS

### Framework & Setup
- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS for styling
- Framer Motion for animations (if needed)
- Import portfolio data from `lib/portfolio-data.ts`

### Content Sections Required
1. **Hero Section** - Name, title, bio, social links, call-to-action
2. **About Section** - Extended bio, highlights, education
3. **Experience Section** - Work history, roles, achievements  
4. **Projects Section** - Filterable project showcase with details
5. **Skills Section** - Categorized skills with proficiency levels
6. **Contact Section** - Email, social links, contact form (optional)

### Mode Toggle Integration
Implement the exact pattern from CONTRACT.md Section 4:
- Mode toggle button (fixed top-right)
- localStorage persistence via `lib/mode-toggle.ts`
- prefers-reduced-motion handling (disable game mode)
- Clean mounting of ContentMode component

### Design Requirements
- **Responsive**: Mobile-first, works on all screen sizes
- **Accessible**: ARIA labels, keyboard navigation, color contrast
- **Performance**: <100ms interaction delays, optimized images
- **Professional**: Clean, modern, showcases technical skill
- **Brand Consistent**: Uses colors/themes from existing portfolio

### Data Integration
- Import `PORTFOLIO_DATA` from `lib/portfolio-data.ts`
- Use the exact TypeScript interfaces from CONTRACT.md
- Display real project data, skills, bio info
- Handle optional fields gracefully

## IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [ ] Set up Next.js project structure in `app/content-mode/`
- [ ] Implement `lib/portfolio-data.ts` with CONTRACT.md types
- [ ] Create `lib/mode-toggle.ts` with localStorage helpers
- [ ] Build basic `app/page.tsx` with mode toggle

### Phase 2: Core Sections  
- [ ] Hero section with typewriter effect and social links
- [ ] About section with bio and highlights
- [ ] Experience timeline with company details
- [ ] Projects grid with filtering and modal details
- [ ] Skills categorization with progress bars
- [ ] Contact section with form validation

### Phase 3: Polish
- [ ] Responsive design and mobile optimization
- [ ] Loading states and error handling
- [ ] SEO meta tags and Open Graph
- [ ] Accessibility audit and fixes
- [ ] Performance optimization

### Phase 4: Integration
- [ ] Mode toggle works correctly
- [ ] localStorage persistence functions
- [ ] prefers-reduced-motion compliance
- [ ] Clean game mode mounting point
- [ ] Final build success: `npm run build`

## SUCCESS CRITERIA
- All content sections implemented and functional
- Mode toggle switches between content/game seamlessly  
- Mobile responsive, accessible, professional design
- Imports data correctly from contract-defined types
- Builds without errors, ready for production
- Only modified files in your ownership paths

## IF YOU GET STUCK
- Contract unclear? STOP and surface the ambiguity
- Need to modify sprite APIs? STOP - that's not your lane
- Game mode integration broken? Check your mounting in app/page.tsx
- Build failing? Fix all TypeScript/lint errors before proceeding

Remember: You're building the polished, professional face of this portfolio. Make it shine! 🚀