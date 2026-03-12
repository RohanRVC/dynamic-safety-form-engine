import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import Dashboard from "@/pages/Dashboard/Dashboard";
import FormBuilderPage from "@/pages/FormBuilderPage/FormBuilderPage";
import FormTemplatesPage from "@/pages/FormBuilderPage/FormTemplatesPage";
import FormRendererPage from "@/pages/FormRendererPage/FormRendererPage";
import SubmissionsPage from "@/pages/SubmissionsPage/SubmissionsPage";
import BranchMetadataPage from "@/pages/BranchMetadataPage/BranchMetadataPage";
import SettingsPage from "@/pages/SettingsPage/SettingsPage";
import HowToUsePage from "@/pages/GuidePage/HowToUsePage";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/form-builder" element={<FormBuilderPage />} />
            <Route path="/form-templates" element={<FormTemplatesPage />} />
            <Route path="/form-renderer" element={<FormRendererPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            <Route path="/branches" element={<BranchMetadataPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/guide" element={<HowToUsePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "!bg-card/95 !backdrop-blur-md !text-card-foreground !border !border-border/50 !shadow-2xl !shadow-black/10 !rounded-2xl !font-medium",
          duration: 4000,
        }}
      />
    </ErrorBoundary>
  );
}
