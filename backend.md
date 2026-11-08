# MASTER DEVELOPMENT PROMPT 2: CAREGUIDE FRONTEND

## 1. YOUR ROLE

Act as a senior frontend engineer, UI/UX designer, React architect and product designer.

Build a complete, premium, responsive web application called CareGuide.

The backend has been developed separately using Python FastAPI and MongoDB.

Your job is to create the complete frontend, integrate every available backend API, implement all user interactions and deliver a polished, working product.

Do not create a static landing page or a simple dashboard mockup.

Build a complete customer-facing application.

IMPORTANT:

1. Inspect the existing project before making changes.
2. Preserve working backend files.
3. Work inside the frontend directory.
4. Build reusable components.
5. Use proper TypeScript types.
6. Integrate APIs rather than hardcoding responses.
7. Every button must perform its intended action.
8. Every form must validate input.
9. Every page must have loading, error and empty states.
10. Make the entire application responsive.
11. Do not leave unfinished sections.
12. Do not use fake analytics.
13. Do not simulate Gemini answers in the UI.
14. Make the application usable without user authentication.
15. Test the complete application against the backend.

---

# 2. PRODUCT VISION

Application:

CareGuide

Brand:

Man Matters

Tagline:

"Your personal care journey, all in one place."

CareGuide is an AI-powered personal care management platform.

It allows customers to:

- Discover personal care products.
- Understand available product information.
- Compare products.
- Save products to their personal care list.
- Build daily and weekly routines.
- Track routine completion.
- Maintain a personal progress journal.
- Ask questions through Gemini-powered CareGuide AI.
- View demonstration order information.
- Create support requests.
- View personal care activity and insights.

Categories:

- Hair
- Beard
- Skin
- General Wellness
- Other

The product must not look like a hair-only tracker.

It must feel like a unified customer experience platform.

Do not claim official integration with Man Matters internal systems.

---

# 3. REQUIRED FRONTEND TECHNOLOGY

Use:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router DOM
- TanStack Query
- Axios
- React Hook Form
- Zod
- Recharts
- Lucide React
- date-fns

Use modern functional React components and hooks.

Avoid unnecessary dependencies.

Use strict TypeScript.

Avoid `any` unless absolutely necessary.

---

# 4. PROJECT STRUCTURE

Create:

frontend/
│
├── public/
│   ├── favicon.svg
│   └── images/
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MobileNavigation.tsx
│   │   │   └── PageContainer.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── WelcomeCard.tsx
│   │   │   ├── StatsGrid.tsx
│   │   │   ├── RoutineOverview.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   └── CareCategoryCards.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── ProductSearch.tsx
│   │   │   ├── ProductDetails.tsx
│   │   │   ├── ProductComparison.tsx
│   │   │   └── AddToCareButton.tsx
│   │   │
│   │   ├── routines/
│   │   │   ├── RoutineCard.tsx
│   │   │   ├── RoutineForm.tsx
│   │   │   ├── RoutineCalendar.tsx
│   │   │   └── RoutineProgress.tsx
│   │   │
│   │   ├── progress/
│   │   │   ├── ProgressForm.tsx
│   │   │   ├── ProgressCard.tsx
│   │   │   ├── ProgressTimeline.tsx
│   │   │   └── ProgressPhotoUpload.tsx
│   │   │
│   │   ├── ai/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── SuggestedPrompts.tsx
│   │   │   └── SourceReferences.tsx
│   │   │
│   │   ├── support/
│   │   │   ├── OrderLookup.tsx
│   │   │   ├── OrderDetails.tsx
│   │   │   ├── SupportForm.tsx
│   │   │   └── FAQAccordion.tsx
│   │   │
│   │   └── common/
│   │       ├── LoadingState.tsx
│   │       ├── ErrorState.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── StatCard.tsx
│   │       ├── SectionHeader.tsx
│   │       └── AppToast.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Discover.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── CompareProducts.tsx
│   │   ├── MyCare.tsx
│   │   ├── Routines.tsx
│   │   ├── ProgressJournal.tsx
│   │   ├── AIAssistant.tsx
│   │   ├── OrdersSupport.tsx
│   │   ├── NotFound.tsx
│   │   └── Settings.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── sessionService.ts
│   │   ├── productService.ts
│   │   ├── careService.ts
│   │   ├── routineService.ts
│   │   ├── progressService.ts
│   │   ├── aiService.ts
│   │   ├── uploadService.ts
│   │   ├── orderService.ts
│   │   ├── supportService.ts
│   │   └── dashboardService.ts
│   │
│   ├── hooks/
│   │   ├── useSession.ts
│   │   ├── useProducts.ts
│   │   ├── useMyCare.ts
│   │   ├── useRoutines.ts
│   │   ├── useProgress.ts
│   │   ├── useAIChat.ts
│   │   └── useDashboard.ts
│   │
│   ├── context/
│   │   └── SessionContext.tsx
│   │
│   ├── types/
│   │   ├── api.ts
│   │   ├── product.ts
│   │   ├── routine.ts
│   │   ├── progress.ts
│   │   ├── chat.ts
│   │   ├── order.ts
│   │   └── support.ts
│   │
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── formatCurrency.ts
│   │   ├── session.ts
│   │   └── constants.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

You may add files when necessary, but maintain this modular architecture.

---

# 5. DESIGN SYSTEM

This is extremely important.

The UI must feel like a premium consumer wellness product.

Do not make it look like a generic admin panel, CRM, or developer dashboard.

## Visual direction

Use:

- Clean off-white background.
- White cards.
- Dark navy or charcoal typography.
- Muted green accent colour.
- Subtle borders.
- Soft shadows.
- Rounded corners.
- Large whitespace.
- Clear visual hierarchy.
- Premium typography.
- Beautiful product imagery.
- Smooth but restrained animations.

Suggested colour tokens:

Primary background: #F7F8F5

Surface: #FFFFFF

Primary text: #202820

Secondary text: #747D75

Primary accent: #537B60

Light accent: #E8F0E9

Border: #E8EBE6

Do not use excessive gradients.

Do not use too many colours.

Avoid oversized headings and crowded layouts.

## Typography

Use a modern sans-serif font such as Inter or Manrope.

Use:

- Strong page headings.
- Readable body text.
- Consistent font weights.
- Clear labels.
- Proper line spacing.

## Component styling

Cards:

- 16–24px border radius.
- Subtle borders.
- Light shadows.
- Consistent internal spacing.

Buttons:

- Consistent heights.
- Clear hover states.
- Clear disabled states.
- Loading indicators.

Forms:

- Clear labels.
- Helpful placeholders.
- Inline validation errors.

Navigation:

- Consistent icons.
- Active page indicator.
- Responsive behaviour.

Use Lucide React icons.

---

# 6. APPLICATION NAVIGATION

Create the following primary navigation:

1. Home
2. Discover Products
3. My Care
4. Routine
5. Progress Journal
6. AI Assistant
7. Orders & Support

Also provide:

- Settings
- Reset Demo Session

Desktop:

Use a clean left sidebar and top header.

Mobile:

Use a responsive drawer or bottom navigation.

The navigation must work on every page.

Use React Router.

Routes:

/

 /discover

 /products/:id

 /compare

 /my-care

 /routines

 /progress

 /assistant

 /orders-support

 /settings

Use a not-found page.

---

# 7. DEMO SESSION MANAGEMENT

There is no authentication.

On the first visit:

1. Check whether a session ID exists in localStorage.
2. If it does not exist, generate a UUID.
3. Store it in localStorage.
4. Call POST /api/v1/session.
5. Retrieve or create the backend session.
6. Store session information in React context.
7. Load the dashboard.

Use a reusable SessionContext.

The session must persist after:

- Page refresh.
- Browser navigation.
- Closing and reopening the browser.

Do not ask users to log in.

Provide a Reset Demo button.

When clicked:

1. Show a confirmation dialog.
2. Call the backend session reset endpoint.
3. Clear the previous session.
4. Generate a new session.
5. Reload the application state.

Clearly label the application as a demonstration prototype where appropriate.

---

# 8. HOME / DASHBOARD PAGE

Route: /

Create a premium customer-facing dashboard.

## Hero section

Headline:

"Your personal care journey, all in one place."

Description:

"Discover products, build better routines and understand your care journey with your personal AI assistant."

Primary CTA:

Explore Products

Secondary CTA:

Ask CareGuide AI

## Dashboard statistics

Display real data from:

GET /api/v1/dashboard?sessionId=...

Cards:

- My Products
- Active Products
- Today's Routines
- Completed Routines
- Journal Entries

All numbers must come from the backend.

If there is no data, show zero.

Never use hardcoded sample statistics.

## Care categories

Show:

- Hair Care
- Beard Care
- Skin Care
- General Wellness

Each card should contain:

- Category icon or illustration.
- Short explanation.
- Explore CTA.

Clicking a category should navigate to Discover with the correct filter.

## Routine overview

Show today's routines.

Each routine should include:

- Activity name.
- Scheduled time if available.
- Category.
- Status.
- Complete action.
- Skip action.

## Recent activity

Display actual activity from available backend records.

Examples:

- Product added.
- Routine completed.
- Journal entry created.

If there is no activity, display a useful empty state.

## AI assistant promotion

Create a visually attractive section:

"Have a question about your care routine?"

"Ask CareGuide AI for help understanding products, routines and available product information."

CTA:

Chat with CareGuide AI

---

# 9. PRODUCT DISCOVERY PAGE

Route: /discover

Create a complete product catalogue.

Features:

- Product grid.
- Search bar.
- Category filters.
- Price filters where data is available.
- Sort options.
- Product comparison selection.
- Responsive layout.

Call:

GET /api/v1/products

Support query parameters:

- category
- search
- minPrice
- maxPrice
- sortBy
- page
- limit

Product cards should show:

- Product image.
- Product name.
- Category.
- Short description.
- Price if verified and available.
- View Details.
- Add to My Care.
- Compare checkbox.

Do not display fabricated product ratings or review counts.

If official images are unavailable, use attractive neutral category imagery or clearly labelled demonstration assets.

## Product details

Route:

/products/:id

Display:

- Product image.
- Product name.
- Category.
- Description.
- Detailed description.
- Ingredients.
- Benefits.
- Usage instructions.
- Precautions.
- FAQs.
- Price when available.

Do not display unverified information as fact.

Add to My Care button must call the backend.

Provide an appropriate success or error message.

## Product comparison

Allow users to select 2–4 products.

Call:

GET /api/v1/products/compare?ids=...

Show a comparison table.

Rows:

- Product name.
- Category.
- Description.
- Ingredients.
- Benefits.
- Usage instructions.
- Price.
- Precautions.

Clearly indicate unavailable information.

Do not rank products using invented performance scores.

---

# 10. MY CARE PAGE

Route: /my-care

This page manages the user's selected personal care products.

Fetch:

GET /api/v1/my-products?sessionId=...

Display:

- Product image.
- Product name.
- Category.
- Start date.
- Status.
- Personal notes.

Allow:

- Add product.
- Change status.
- Edit notes.
- Remove product.
- View product details.

Statuses:

- Active
- Paused
- Discontinued

Provide filters:

- All
- Active
- Paused
- Discontinued

Provide a useful empty state:

"You haven't added any products yet."

CTA:

Explore Products

Every action must be connected to the backend.

---

# 11. ROUTINE MANAGEMENT PAGE

Route: /routines

Create a complete routine management experience.

Fetch:

GET /api/v1/routines?sessionId=...

Provide two views:

- Daily
- Weekly

Features:

- Create routine.
- Edit routine.
- Delete routine.
- Mark completed.
- Mark skipped.
- View pending activities.
- Filter by category.
- View completion summary.

Routine creation form:

Fields:

- Activity name.
- Category.
- Optional associated product.
- Instructions.
- Date.
- Optional time.
- Recurrence.
- Notes.

Recurrence:

- Once
- Daily
- Weekly

Use React Hook Form and Zod validation.

Do not generate medical dosage or usage frequency.

Use only verified instructions from product data or user-entered routine descriptions.

## Routine cards

Each card should show:

- Activity.
- Category.
- Date/time.
- Associated product.
- Status.
- Complete button.
- Skip button.
- Edit button.
- Delete action.

Use clear status styling.

## Completion statistics

Fetch:

GET /api/v1/routines/summary?sessionId=...

Show:

- Completed.
- Pending.
- Skipped.
- Completion percentage.

Use actual API data.

---

# 12. PROGRESS JOURNAL

Route: /progress

Create a personal care journal.

The journal must support:

- Hair observations.
- Beard observations.
- Skin observations.
- General care observations.

Fetch:

GET /api/v1/progress?sessionId=...

Create entry form:

Fields:

- Care category.
- Date.
- Condition or observation category.
- Written observations.
- Optional rating.
- Optional photograph.

Support:

- Create entry.
- Edit entry.
- Delete entry.
- View chronological history.
- Filter by category.
- Filter by date.

Use Cloudinary integration through the backend upload endpoints.

Never expose Cloudinary secret keys in frontend code.

## Photo support

Allow users to upload optional progress photographs.

Display:

- Preview.
- Upload progress.
- Upload failure.
- Remove image.

Only display photos that were successfully uploaded.

## Timeline

Display journal entries chronologically.

Each entry should show:

- Date.
- Category.
- Observation.
- Photograph thumbnails.
- Edit and delete actions.

The application must not diagnose conditions or claim that photographs establish medical improvement.

Use language such as:

"Your recorded observations"

Instead of:

"Your medical results"

---

# 13. CAREGUIDE AI ASSISTANT

Route: /assistant

This is a central feature.

Build a polished, functional AI chat interface powered by the backend Gemini integration.

The React frontend must NEVER call Gemini directly.

All AI requests must go through FastAPI.

Endpoint:

POST /api/v1/ai/chat

Request:

{
  "sessionId": "uuid",
  "message": "What verified information is available about this product?"
}

Response:

{
  "success": true,
  "data": {
    "message": "AI-generated response",
    "sources": [],
    "suggestions": []
  }
}

## Interface design

Create a modern chat experience.

Layout:

- Header with CareGuide AI icon and status.
- Welcome message.
- Suggested question cards.
- Chat message history.
- Message input.
- Send button.
- Loading indicator.
- Error state.

Suggested questions:

1. "Help me understand the products available for hair care."
2. "Compare two products from the catalogue."
3. "Summarise my current routines."
4. "How can I manage my personal care products?"
5. "What information is available about product ingredients?"
6. "Summarise my recent journal entries."

## Chat functionality

Implement:

- Send message.
- Receive Gemini response.
- Display user messages.
- Display assistant messages.
- Show loading indicator.
- Handle API errors.
- Scroll to latest message.
- Preserve history after refresh.
- Clear conversation.
- Display suggested follow-up prompts.

Fetch history:

GET /api/v1/ai/history?sessionId=...

Clear history:

DELETE /api/v1/ai/history?sessionId=...

## Chat design

User messages:

Right-aligned.

AI messages:

Left-aligned.

Use distinct but subtle backgrounds.

Render formatted text and bullet lists correctly.

Preserve readable spacing.

## AI response sources

If backend returns source information, display a small section:

"Information used"

Show the relevant product or FAQ names.

Do not invent citations.

## Important AI behaviour

The frontend must not:

- Generate fake AI responses.
- Display hardcoded Gemini answers.
- Claim Gemini is online if it is unavailable.
- Send Gemini API keys to the browser.
- Bypass the backend.

If the API returns an error, show:

"CareGuide AI is temporarily unavailable. Please try again shortly."

The user must still be able to use the rest of the application.

---

# 14. ORDERS AND CUSTOMER SUPPORT PAGE

Route: /orders-support

Create two main sections.

## A. Order lookup

Provide an order ID input.

Call:

GET /api/v1/orders/{order_id}

Display:

- Order ID.
- Order date.
- Items.
- Total amount.
- Order status.
- Estimated delivery.

Show a clear demonstration-data disclaimer.

Do not imply that real Man Matters orders are connected.

Handle invalid order IDs.

## B. Support centre

Create a support ticket form.

Fields:

- Name.
- Email.
- Category.
- Subject.
- Message.

Categories:

- Product information.
- Order-related question.
- Technical issue.
- Routine-related question.
- Other.

Call:

POST /api/v1/support/tickets

Display the generated ticket ID after successful submission.

Clearly state that this is a demonstration support request and is not sent to the actual Man Matters support team.

## C. FAQs

Fetch:

GET /api/v1/faqs

Display an accordion.

Support search/filter where appropriate.

Only display verified FAQ answers as official product information.

---

# 15. SETTINGS PAGE

Route: /settings

Include:

- Current demo session information.
- Application information.
- Reset demo session.
- Clear AI conversation.
- Data demonstration disclaimer.

Do not create account management or password settings.

There is no login system.

---

# 16. API INTEGRATION

Create a central Axios instance.

File:

src/services/api.ts

Read API URL from:

VITE_API_BASE_URL

Example:

VITE_API_BASE_URL=http://localhost:8000/api/v1

Create reusable API services.

All API requests must use the shared Axios instance.

Implement:

- Request configuration.
- Error handling.
- Response typing.
- Timeout.
- Consistent API error handling.

Do not scatter raw Axios calls throughout components.

Create TanStack Query hooks for:

- Products.
- My Care.
- Routines.
- Progress.
- Dashboard.
- AI history.

Use proper query keys.

Invalidate relevant queries after mutations.

For example:

When a user adds a product:

1. Call backend.
2. Display success toast.
3. Invalidate My Care query.
4. Refresh dashboard statistics.

When a routine is completed:

1. Call backend.
2. Update UI.
3. Invalidate routines.
4. Refresh completion summary.
5. Refresh dashboard.

Ensure the UI always reflects backend state.

---

# 17. TYPESCRIPT TYPES

Create reusable TypeScript interfaces matching backend Pydantic schemas.

Examples:

Product

CareSession

SessionProduct

Routine

ProgressEntry

ChatMessage

ChatResponse

Order

SupportTicket

DashboardData

APIResponse

Use correct nullable types.

Do not assume that optional backend fields always exist.

Use consistent date handling.

Do not use `any` to avoid defining types.

---

# 18. FORM VALIDATION

Use React Hook Form and Zod.

Validate:

Product search.

Routine creation.

Routine editing.

Progress entry creation.

Support ticket submission.

Chat messages.

Order lookup.

Show clear inline errors.

Disable submission while requests are processing.

Prevent duplicate form submissions.

Show success and failure notifications.

---

# 19. LOADING, ERROR AND EMPTY STATES

Every page must support:

Loading state.

Error state.

Empty state.

Success state.

Examples:

Product loading:

Show skeleton product cards.

Routine empty state:

"You haven't created a routine yet."

Progress empty state:

"Your personal care journal starts here."

My Care empty state:

"Add products to start managing your care journey."

AI empty state:

"Ask CareGuide AI anything about available product information and your personal care routines."

Do not show a blank screen when an API fails.

Provide Retry buttons where appropriate.

---

# 20. RESPONSIVE DESIGN

Support:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

Desktop:

- Sidebar navigation.
- Main content area.
- Consistent maximum content width.

Tablet:

- Collapsible sidebar.

Mobile:

- Mobile-friendly navigation.
- Stacked cards.
- Full-width forms.
- Responsive chat.
- Responsive comparison table.
- No horizontal overflow.

Test the interface at:

- 1440px
- 1024px
- 768px
- 390px

All interactive elements must be usable on touch devices.

---

# 21. ACCESSIBILITY

Implement:

- Semantic HTML.
- Proper labels.
- Keyboard navigation.
- Visible focus indicators.
- Accessible dialogs.
- Appropriate button labels.
- Image alt text.
- Sufficient contrast.

Do not use clickable divs when buttons or links are appropriate.

---

# 22. FRONTEND ENVIRONMENT

Create:

.env.example

VITE_API_BASE_URL=http://localhost:8000/api/v1

Never place:

GEMINI_API_KEY

CLOUDINARY_API_SECRET

MONGODB_URI

inside frontend environment variables.

These secrets belong only on the backend.

---

# 23. PERFORMANCE AND CODE QUALITY

Requirements:

- Lazy-load route components where useful.
- Avoid unnecessary API requests.
- Use TanStack Query caching.
- Use reusable UI components.
- Avoid massive component files.
- Avoid duplicated logic.
- Use memoisation only where justified.
- Optimise image rendering.
- Add appropriate error boundaries.
- Keep TypeScript strict.
- Maintain clean code.

---

# 24. FRONTEND ACCEPTANCE TESTS

Verify the following complete user journeys.

JOURNEY 1: NEW VISITOR

1. Open application.
2. Generate demo session.
3. Create backend session.
4. Load dashboard.
5. Refresh browser.
6. Confirm session persists.

JOURNEY 2: PRODUCT DISCOVERY

1. Open Discover.
2. Load product catalogue.
3. Search for a product.
4. Filter by category.
5. Open product details.
6. Add product to My Care.
7. Confirm product appears in My Care.

JOURNEY 3: PRODUCT COMPARISON

1. Select two products.
2. Open comparison.
3. Fetch comparison API.
4. Display available comparison fields.

JOURNEY 4: ROUTINE MANAGEMENT

1. Create routine.
2. Edit routine.
3. Mark completed.
4. Refresh page.
5. Confirm completion persists.
6. Check dashboard statistics.

JOURNEY 5: PROGRESS JOURNAL

1. Create journal entry.
2. Upload optional photograph.
3. Save entry.
4. Edit entry.
5. Delete entry.
6. Confirm changes persist.

JOURNEY 6: GEMINI AI

1. Open AI assistant.
2. Ask a product question.
3. Send request to FastAPI.
4. Confirm MongoDB retrieval happens on backend.
5. Receive Gemini response.
6. Display response.
7. Refresh page.
8. Confirm chat history persists.

Also test Gemini unavailable state.

JOURNEY 7: ORDER AND SUPPORT

1. Enter demo order ID.
2. Display order information.
3. Submit support ticket.
4. Display generated ticket ID.

JOURNEY 8: DASHBOARD

1. Add a product.
2. Create routines.
3. Complete routines.
4. Create journal entries.
5. Return to dashboard.
6. Confirm all displayed statistics reflect actual backend data.

JOURNEY 9: RESET

1. Click Reset Demo.
2. Confirm action.
3. Reset backend session.
4. Generate new session.
5. Confirm previous demo data is no longer shown.

---

# 25. RUNNING THE FRONTEND

Install:

npm install

Run:

npm run dev

Expected:

http://localhost:5173

Backend should run separately at:

http://localhost:8000

---

# 26. FINAL DELIVERY REQUIREMENTS

Before declaring completion:

- All routes must work.
- All navigation must work.
- All forms must work.
- All API integrations must be implemented.
- All major buttons must perform their actions.
- All loading and error states must work.
- Session persistence must work.
- Gemini chat must use the real backend endpoint.
- Product catalogue must load from MongoDB through FastAPI.
- Routines must persist.
- Journal entries must persist.
- Order lookup must work with demo data.
- Support tickets must be created.
- Dashboard values must be real.
- No authentication must be required.
- Mobile layout must work.
- TypeScript errors must be resolved.
- Production build must succeed.

Run:

npm run build

Fix every build error.

At completion, provide:

1. Files created.
2. Pages implemented.
3. Components implemented.
4. API integrations.
5. Gemini chat integration details.
6. Environment variables required.
7. Commands to start the application.
8. Any remaining external setup.
9. Build and testing results.

BUILD THE COMPLETE FRONTEND. DO NOT STOP AFTER CREATING A LANDING PAGE OR A STATIC DASHBOARD.