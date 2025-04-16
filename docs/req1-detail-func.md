
**Waybinder: Final Refined Requirements**

**Core Concept:**

Waybinder is a specialized platform for outdoor enthusiasts ("Athletes") to meticulously document, organize, and share their multi-day journeys. It excels at presenting these adventures in a structured, day-by-day, activity-by-activity format enriched with detailed experiences, interactive maps (GPX-based), photos, videos, gear used, planning insights, and safety considerations. For the public ("Users"), it serves as an intuitive discovery platform to find reliable, detailed, and easy-to-understand information on multi-day outdoor trips, overcoming the limitations of traditional, linear blog posts.

**Refined Problem Statement Addressed:**

1.  **Structured Logging for Athletes:** Provides dedicated tools to log complex multi-day journeys with granular daily/activity breakdowns, map data, gear lists, planning details, and collaborative multi-perspective experiences, which is difficult with generic blogging or note-taking apps.
2.  **Intuitive Discovery for Users:** Presents multi-day trips in a clear, structured timeline and map-centric view, allowing users to quickly grasp itineraries, specific route sections, and practical details, unlike wading through lengthy, unstructured narratives.
3.  **Collaborative Storytelling & Reduced Redundancy:** Enables team members to contribute their perspectives (experiences, photos) to a *single* shared Journey entry, creating richer content while actively discouraging the creation of duplicate entries for the same trip.

**Roles:**

1.  **Public User (Anonymous):** Browse, search, view published Journeys (maps, structure, content). No login needed.
2.  **Registered User (Logged-in):** All Public permissions + Save/bookmark Journeys, follow Athletes, leave comments/questions (moderated), potentially rate Journeys, set preferences.
3.  **Athlete (Logged-in Content Creator):** All Registered User permissions + Create/edit/manage/publish Journeys, invite Collaborators, manage profile, create Collections/Guides.

**Refined & Expanded Functionalities:**

**I. Journey & Activity Management (Athlete Focus - Core Offering)**

1.  **Create/Edit Journey:**
    *   **Core Details:** Journey Name, Start/End Date, Location(s) (map-based selection/tags), Journey Type (Trek, Cycle Tour, Expedition, Road Trip, etc. - extensible tags).
    *   **Planning & Context:** Overall Description/Synopsis, Difficulty Level, Best Season(s), Required Permits/Permissions Summary, Overall Terrain Type(s), Estimated Cost (optional).
    *   **Team Management (Collaboration Core):** Invite registered Waybinder Athletes as Collaborators. Define roles (Owner vs. Collaborator - see section III).
    *   **Visibility:** Public, Unlisted (link only), Private (owner/collaborators).
    *   **Presentation:** Upload Cover Image/Video.

2.  **Add/Edit Activity within Journey (Granular Detail):**
    *   **Structure:** Link to a specific Day within the Journey's date range. Activity Title, Activity Type (Hike, Climb, Rest Day, etc.).
    *   **Mapping (Visual Core):**
        *   Upload GPX file(s) for the activity.
        *   Option to manually draw route/mark points.
        *   Automatic interactive map display with route, stats (distance, elevation profile - calculated from GPX).
        *   Mark specific Waypoints/POIs on the map with notes (Water Source, Viewpoint, Hazard, Camp).
    *   **Rich Content & Experience:**
        *   Detailed Description/Experience Log (Rich Text Editor).
        *   *Collaborative Experience Input:* Clearly attributed sections/inputs where collaborators can add their own perspectives/experiences for the *same* activity.
        *   Photo/Video Uploads (associated with activity/day, potentially geolocated).
        *   Embed external content (Instagram, YouTube).
    *   **Practical Details:**
        *   Weather Conditions Experienced (selectable tags).
        *   Terrain Encountered (selectable tags).
        *   **Gear Logging (Journey-Specific - Integrated):** Ability to list gear items used *specifically for this activity or day* directly within the activity form (e.g., text list, simple item entry: "Item Name", "Notes/Brand"). This data is stored *with the Journey*, not (yet) in a separate global library. Allows users to easily share what was necessary for that specific part of the trip.
        *   Effort Level/Perceived Exertion (optional).

3.  **Journey Structure & UI:**
    *   Automatic chronological organization of Activities by Day.
    *   Clear visual hierarchy: Journey -> Day -> Activity.
    *   Easy navigation between days/activities. Drag-and-drop reordering (within day/between days) if feasible.

**II. Collaboration & Redundancy Prevention**

1.  **Roles & Permissions:**
    *   **Journey Owner:** Full control (edit core details, manage team, visibility, delete).
    *   **Collaborator:** Can add/edit *their own* attributed content (experiences, photos, gear notes) to existing activities; add/edit Waypoints; potentially add *new* activities to the shared Journey. Cannot change core Journey settings or delete it.
2.  **Contribution Attribution:** All content (text, photos, potentially gear notes) clearly marked with the contributor's profile.
3.  **Duplicate Prevention:**
    *   System attempts to detect potential duplicate Journeys during creation based on overlapping dates, locations, and *especially* invited collaborators who are already part of a similar Journey.
    *   Prompts user about potential duplicates, encouraging joining/collaborating on the existing entry ("It looks like [User X] is already planning a trip to [Location] with [Collaborator Y] during these dates. Do you want to view their plan or request to collaborate?").

**III. Discovery, Viewing & Interaction (User Focus - Intuitive Access)**

1.  **Search & Filtering:**
    *   Keyword Search (Journey name, location, athlete, content).
    *   **Advanced Filters:** Journey Type, Location (map search?), Duration, Date/Season, Difficulty, Terrain, Specific Activities, Gear Keywords (e.g., "journeys using ice axes"), Tags, Collections/Guides.
    *   **Natural Language Search (AI Potential):** Queries like "Easy 3-day coastal hikes in California in Spring".

2.  **Intuitive Journey Presentation (Visual & Structured Core):**
    *   **Overview Page:** Map overview (full route), key stats, synopsis, athlete(s), rating, link to associated Guide/Collection.
    *   **Timeline View:** Default view showing chronological flow of Days, expandable to show Activities within each day. Provides clear structure.
    *   **Day/Activity Detail View:** Focuses on a single day/activity - interactive map for *that segment*, collaborator descriptions (clearly separated/tabbed), photos, practical details (weather, terrain, gear listed for that activity).
    *   **Map-Centric View:** Option for full-screen interactive map showing the *entire* Journey route. Clicking map segments/waypoints highlights the corresponding Day/Activity details. Map layer options (Topo, Satellite).
    *   **Clean UI:** Focus on readability, strong visuals (maps/photos), easy navigation through the multi-day structure.

3.  **Interaction:**
    *   Commenting/Q&A on Journeys/Activities (Registered Users, moderated by Athlete).
    *   Saving/Bookmarking Journeys.
    *   Following Athletes.

**IV. Tools & Integrations**

1.  **GPX Toolkit (Standalone Utility):**
    *   **Merge:** Upload multiple GPX -> Preview on map -> Combine -> Export single file.
    *   **View/Analyze:** Basic stats (distance, elevation, profile) for uploaded GPX.
    *   **Basic Edit:** View track points, potentially delete sections, edit metadata.

2.  **AI Integration (Helper Functions):**
    *   **Content Enhancement:** User-initiated AI assist within text editor (rewrite, grammar check, elaborate, adjust tone).
    *   **Summarization:** AI draft of Journey synopsis based on activity details.
    *   **Blog Post Draft:** AI compiles structured Waybinder content into a *narrative draft* for export/use elsewhere. Emphasize this is an *aid*, not the primary view.
    *   **Tag Suggestion:** AI suggests relevant tags based on content/location/GPX.

3.  **Sharing & Embedding:**
    *   Social media sharing links (generating preview cards).
    *   Embeddable HTML widget for Athletes to showcase Journeys on external sites.

**V. Community & Content Curation**

1.  **Athlete Profile:** Bio, expertise, social links, gallery of their published Journeys & Guides.
2.  **Collections / Guides (NEW):**
    *   Athletes (or Platform Admins) can create curated Collections or Guides.
    *   A Guide could group multiple related Journeys (e.g., "Complete Tour du Mont Blanc Guide" linking to several individual multi-day trek Journeys covering different sections or variations).
    *   A Collection might be thematic (e.g., "Best Dog-Friendly Weekend Treks", "Top Cycling Routes in Tuscany").
    *   These appear in a dedicated section and/or are searchable, helping users discover related content.

**VI. Safety Features (NEW)**

1.  **Emergency Contact Information:** Option for Athletes to store emergency contact details associated with a Journey (securely stored, access controlled - e.g., only visible to collaborators or based on user privacy setting).
2.  **External Live Tracking Link:** A dedicated field within the Journey details where Athletes can optionally paste a *publicly shareable link* from their *external* satellite tracking device (e.g., Garmin MapShare, Spot Share Page). *Disclaimer needed:* Waybinder only displays the link provided by the user and is not responsible for the tracking service's availability or accuracy.
3.  **Safety Notes & Considerations:** Dedicated section within Journey/Activity details for Athletes to add specific safety advice, required skills, known hazards, water source reliability, or essential safety gear reminders relevant to that specific trip or activity.

**Summary of Enhancements based on Review:**

*   **Integrated Gear:** Clarified the approach for MVP – logging gear *within* the Journey/Activity context, not a separate global library initially, but still addressing the need to share what was used.
*   **Strengthened Collaboration:** Emphasized attributed contributions and the duplicate detection/suggestion mechanism to actively promote single, rich journey entries.
*   **Added Curation:** Incorporated Collections/Guides to improve content discovery and organization.
*   **Added Safety:** Included practical safety features (contact info, external tracking link field, specific safety notes) while being mindful of scope and responsibility.
*   **Refined AI Role:** Kept AI as assistive, user-initiated tools, reinforcing the core value proposition is the *structured data* and *presentation*.
*   **Clarity on Views:** Reinforced the importance of Timeline, Map-Centric, and Day/Activity detail views for intuitive understanding.
