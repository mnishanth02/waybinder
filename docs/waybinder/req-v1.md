# Waybinder Functionality & Enhancement Document (v2.0)

**Overall Vision:** A comprehensive platform for athletes and enthusiasts to document, share, discover, and relive outdoor journeys and activities, focusing on intuitive multi-day event presentation, rich content integration, and AI-powered features.

## 1. Roles & Permissions (Detailed)

### Anonymous User

- **Browse & Discover:**
  - Navigate the platform, view public Journeys, Athlete profiles, and public Activities within Journeys.
  - Search by Journey title, location, date range, athlete name, journey type, and keywords.
  - Filter and sort search results by duration, distance range, activity type, relevance, date created, start date, and popularity.
- **View Details:**
  - Access public Journey overviews, including title, description, dates, type, creator Athlete, linked Buddies, high-level map overview, and key stats.
  - View public Activities within Journeys, including text content, public photos/videos, embedded media, and map previews.
  - View public Athlete profiles and their public Journeys.
- **Restrictions:**
  - Cannot edit, download, comment, bookmark, follow, or access private Journeys/Activities/Planning details.
  - Download restrictions apply to resources like GPX tracks unless explicitly shared.

### Logged-in User (Registered User)

- **All Anonymous Access PLUS:**
  - Comment on public Journeys and Activities (with moderation).
  - Bookmark Journeys for personal lists.
  - Follow Athletes and receive configurable notifications for updates.
  - Download publicly shared resources (GPX files, checklists, etc.).
  - Access a personalized dashboard showing bookmarked trips and followed athletes' updates.

### Athlete

- **All Logged-in Access PLUS:**
  - Manage public profiles (bio, sports interests, profile picture, links to external sites).
  - Create, edit, update, and delete Journeys and Activities.
  - Manage privacy settings (Private, Public, Unlisted).
  - Invite/manage Buddies and Group Members for collaboration.
  - Use planning tools for checklists, permits, gear lists, travel details, contacts, to-dos, and budgets.
  - Save and reuse templates for planning items.
  - Share specific planning items publicly or via links.
  - Access an Athlete dashboard with stats, notifications, and Journey management.

## 2. Waybinder Workflow - Athlete (Detailed)

### Athlete On-boarding

- Triggered post-login via a clear CTA ("Become an Athlete").
- Collect basic profile information, sports focus, experience level, home location, and external links.
- Confirm Athlete privileges with a clear indication.

### Journey Creation

- Prominent "Create Journey" button.
- Collect core details: title, cover image/video, description, start/end dates, journey type, primary location(s), and privacy settings.
- Redirect users to the Journey management page after initial save.

### Collaboration

- **Buddy Invitation:**
  - Invite users by username/email.
  - Grant full CRUD access to Journey details, Planning, and Activities.
  - Handle simultaneous edits with warnings or locking mechanisms.
- **Group Member Invitation:**
  - Invite users to participate without granting edit access.
  - Enable mentions or linking for related Journey posts.

### Planning Phase

- Dedicated "Planning" tab with modules for checklists, permits, gear lists, travel details, contacts, to-dos, and budgets.
- Allow template saving/loading and sharing specific items publicly or via links.

### Activity Creation & Management

- Add Activities within the Journey management view.
- Collect core details: activity date, title, type, optional stats, and content.
- Support media uploads (photos, videos, documents, GPX files) and embeds (YouTube, Strava, etc.).
- Display GPX tracks on interactive maps with stats and editing/merging capabilities.

### Journey Timeline & Grouping

- Automatically group Activities by date.
- Present a clear UI with timeline views, map-centric views, and collapsible sections.

### Privacy & Publishing

- Manage privacy settings (Private, Unlisted, Public).
- Provide a pre-publish checklist for content review.

### Sharing & Embedding

- Enable social sharing with pre-populated text/URLs.
- Provide embeddable HTML snippets for external websites.
- Generate visually appealing preview images for social sharing.

## 3. Public User Functionality (Detailed)

### Direct Access

- Deep-link shared Waybinder links to public Journey pages.
- Handle deleted/private Journeys gracefully.

### Journey Presentation

- Provide structured navigation for multi-day trips with:
  - Header: Title, cover image, dates, type, creator(s), map overview, and key stats.
  - Timeline View: Expandable sections for each day.
  - Map-Centric View: Interactive map with highlights for activities.
  - Tabbed Interface: Overview, Timeline, Map, Photos/Videos, Gear List, Comments.
  - Collapsible Sections: Summaries for each day/activity.

### AI-Powered Search

- Natural language queries for logged-in users (e.g., "Show me summer hiking trips in the Alps over 5 days").
- Search across Journey titles, descriptions, locations, dates, types, athlete names, and indexed text content.
- Use embeddings and vector databases for semantic search.

## 4. Cross-Cutting Concerns

### Analytics & Tracking

- Track events like page views, Journey views, user registrations, Journey creations, shares, downloads, comments, follows, bookmarks, and search queries.
- Use tools like Google Analytics 4, Plausible, or Mixpanel.

### Notifications

- Provide in-app and email notifications for new followers, comments, invitations, and updates.
- Allow user-configurable notification settings.

### User Interface (UI) / User Experience (UX)

- Ensure consistent design, mobile responsiveness, accessibility (WCAG compliance), and performance optimization.

### Technical Architecture

- Use Next.js with hono.js backend, TypeScript, shadcn/ui components, and Drizzle ORM with Neon DB.
- Store files using Cloudinary R1 or Bunny.
- Integrate AI functionality using an AI SDK.
- Implement geospatial capabilities with PostGIS or Elasticsearch.

### Moderation

- Provide tools for flagging/reporting inappropriate content and admin review.

### Data Backup & Recovery

- Ensure standard operational requirements for data backup and recovery.