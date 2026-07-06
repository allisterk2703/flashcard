import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { HomeView } from "./home-view";
import { RootView } from "./root-view";
import { CollectionView } from "./collection-view";
import { ReviewView } from "./review-view";
import { QueryClient } from "@tanstack/react-query";
import { ErrorBoundaryView } from "../components/ui";

const rootRoute = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootView,
  errorComponent: ErrorBoundaryView,
  notFoundComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="drag-region pointer-events-none fixed top-0 left-0 right-0 h-13" />
        <p className="text-secondary">Route not found</p>
      </div>
    );
  },
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeView,
  staticData: {
    title: "Home",
  },
});

const collectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/collections/$collectionId",
  component: CollectionView,
  staticData: {
    title: "Collection",
  },
});

const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/collections/$collectionId/review",
  component: ReviewView,
  staticData: {
    title: "Révision",
  },
});

const routeTree = rootRoute.addChildren([homeRoute, collectionRoute, reviewRoute]);

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  history: createMemoryHistory(),
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  context: {
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface StaticDataRouteOption {
    title?: string;
    component?: any;
  }
}

export { router, queryClient };
