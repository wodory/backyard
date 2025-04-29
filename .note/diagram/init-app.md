```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextClient as Next.js Client
    participant RootLayout as app/layout.tsx
    participant RQueryProvider as app/ReactQueryProvider.tsx
    participant ClientLayout as components/layout/ClientLayout.tsx
    participant useAuth as hooks/useAuth.ts
    participant AuthStore as store/useAuthStore.ts
    participant SupabaseClient as lib/supabase/client.ts
    participant AppStore as store/useAppStore.ts (ProjectSlice Part)
    participant SettingsHook as hooks/useIdeaMapSettings.ts
    participant SettingsService as services/settingsService.ts
    participant SettingsAPI as app/api/settings/route.ts
    participant ProjectAPI as app/api/projects/route.ts
    participant HomePage as app/page.tsx
    participant DashboardLayout as components/layout/DashboardLayout.tsx
    participant IdeaMap as components/ideamap/components/IdeaMap.tsx
    participant IdeaMapDataHook as hooks/useIdeaMapData.ts
    participant CardsHook as hooks/useCards.ts
    participant EdgesHook as hooks/useEdges.ts
    participant LayoutsHook as hooks/useLayouts.ts (Not Implemented Yet)
    participant CardService as services/cardService.ts
    participant EdgeService as services/edgeService.ts
    participant LayoutService as services/layoutService.ts (Not Implemented Yet)
    participant CardAPI as app/api/cards/route.ts
    participant EdgeAPI as app/api/edges/route.ts
    participant LayoutAPI as app/api/layout/route.ts (Not Implemented Yet)
    participant IdeaMapStore as store/useIdeaMapStore.ts
    participant IdeaMapSyncHook as hooks/useIdeaMapSync.ts
    participant ReactFlow as @xyflow/react (UI)
    participant Prisma as lib/prisma.ts
    participant DB as Database (Supabase/PostgreSQL)

    User->>Browser: Access App URL
    Browser->>NextClient: Request Page

    %% --- Initial Page Load & Layout Rendering ---
    NextClient->>RootLayout: Render Tree
    RootLayout->>RQueryProvider: Wrap with QueryClient
    RQueryProvider->>ClientLayout: Render Client Layout

    %% --- ClientLayout Mount & Initial Fetches ---
    activate ClientLayout
    ClientLayout->>useAuth: Mount & Initialize Auth Check
    activate useAuth
    useAuth->>SupabaseClient: createClient()
    useAuth->>SupabaseClient: auth.getSession() / onAuthStateChange() subscribe
    SupabaseClient-->>useAuth: Session/User Info (or null)
    useAuth->>AuthStore: setProfile(), setLoading(false)
    deactivate useAuth
    ClientLayout->>AppStore: (Via useEffect) Check if projects loaded
    Note over ClientLayout, AppStore: projects.length === 0, trigger fetch
    ClientLayout->>AppStore: fetchProjects() action call
    activate AppStore
    AppStore->>ProjectAPI: fetch('/api/projects')
    activate ProjectAPI
    ProjectAPI-->>AppStore: Response (Projects[])
    deactivate ProjectAPI
    AppStore->>AppStore: set({ projects, activeProjectId = projects[0]?.id })
    deactivate AppStore
    ClientLayout->>SettingsHook: Mount & Initialize (with userId from AuthStore)
    activate SettingsHook
    SettingsHook->>SettingsService: fetchSettings(userId)
    activate SettingsService
    SettingsService->>SettingsAPI: GET /api/settings?userId=...
    activate SettingsAPI
    SettingsAPI->>Prisma: settings.findFirst(...)
    Prisma->>DB: Query settings table
    DB-->>Prisma: Settings or null
    Prisma-->>SettingsAPI: Return settings
    SettingsAPI-->>SettingsService: Response (settings)
    deactivate SettingsAPI
    SettingsService-->>SettingsHook: Return settings data
    deactivate SettingsService
    SettingsHook->>AppStore: updateIdeaMapSettings(settings)
    deactivate SettingsHook
    deactivate ClientLayout

    %% --- Render Authenticated Page (Home -> Dashboard -> IdeaMap) ---
    NextClient->>HomePage: Render (Server Component checks auth, renders DashboardLayout)
    HomePage->>DashboardLayout: Render
    DashboardLayout->>IdeaMap: Render
    activate IdeaMap

    %% --- IdeaMap Data Loading ---
    IdeaMap->>IdeaMapDataHook: Mount & Initialize
    activate IdeaMapDataHook
    Note over IdeaMapDataHook: Reads activeProjectId from AppStore
    IdeaMapDataHook->>CardsHook: useCards({ projectId: activeProjectId })
    activate CardsHook
    CardsHook->>CardService: fetchCards({ projectId })
    activate CardService
    CardService->>CardAPI: GET /api/cards?projectId=...
    activate CardAPI
    CardAPI->>Prisma: card.findMany(...)
    Prisma->>DB: Query cards table
    DB-->>Prisma: Card[]
    Prisma-->>CardAPI: Return Cards
    CardAPI-->>CardService: Response (Cards[])
    deactivate CardAPI
    CardService-->>CardsHook: Return Cards[]
    deactivate CardService
    Note over CardsHook: TanStack Query caches card data
    deactivate CardsHook

    IdeaMapDataHook->>EdgesHook: useEdges(userId, activeProjectId)
    activate EdgesHook
    EdgesHook->>EdgeService: fetchEdges(activeProjectId)
    activate EdgeService
    EdgeService->>EdgeAPI: GET /api/edges?projectId=...
    activate EdgeAPI
    EdgeAPI->>Prisma: edge.findMany(...)
    Prisma->>DB: Query edges table
    DB-->>Prisma: Edge[] (DB format)
    Prisma-->>EdgeAPI: Return DB Edges
    EdgeAPI-->>EdgeService: Response (ApiEdge[])
    deactivate EdgeAPI
    EdgeService-->>EdgesHook: Return ApiEdge[]
    deactivate EdgeService
    EdgesHook->>EdgesHook: transformApiEdgeToFlowEdge()
    Note over EdgesHook: TanStack Query caches transformed Edge[]
    deactivate EdgesHook

    Note over IdeaMapDataHook: LayoutsHook/Service/API call would happen here (Not Implemented Yet)
    IdeaMapDataHook->>IdeaMapDataHook: Set isLoading(false) after fetches

    %% --- Data Sync & State Update ---
    IdeaMap->>IdeaMapSyncHook: Mount & Subscribe to Query Cache
    activate IdeaMapSyncHook
    Note right of CardsHook: Cards query updates cache
    IdeaMapSyncHook->>IdeaMapStore: updateNodesSelectively(cardsData)
    activate IdeaMapStore
    Note over IdeaMapStore: Creates/Updates nodes based on cards and layout data (currently localStorage for layout)
    IdeaMapStore->>IdeaMapStore: setNodes(...)
    deactivate IdeaMapStore

    IdeaMapDataHook->>IdeaMapStore: (Via useEffect) setEdges(edgesData from EdgesHook)
    activate IdeaMapStore
    IdeaMapStore->>IdeaMapStore: setEdges(...)
    deactivate IdeaMapStore
    deactivate IdeaMapDataHook
    deactivate IdeaMapSyncHook

    %% --- UI Rendering ---
    IdeaMap->>ReactFlow: Pass nodes & edges from IdeaMapStore
    ReactFlow->>Browser: Render Nodes and Edges on Canvas
    deactivate IdeaMap
    ```