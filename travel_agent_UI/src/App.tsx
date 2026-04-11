import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";

const Destinations = lazy(() => import("./pages/Destinations"));
const ContinentPage = lazy(() => import("./pages/ContinentPage"));
const CountryPage = lazy(() => import("./pages/CountryPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const RoutesPage = lazy(() => import("./pages/Routes"));
const RouteDetailPage = lazy(() => import("./pages/RouteDetailPage"));
const ItineraryPage = lazy(() => import("./pages/ItineraryPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:continent" element={<ContinentPage />} />
            <Route path="/destinations/:continent/:country" element={<CountryPage />} />
            <Route path="/article/:articleId" element={<ArticlePage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/routes/:routeId" element={<RouteDetailPage />} />
            <Route path="/itinerary" element={<ItineraryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
