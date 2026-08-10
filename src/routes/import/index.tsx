import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { usePageMeta } from "@/components/layout/page-meta";
import { TemplateImportFlow } from "@/components/shift-templates/TemplateImportFlow";

/**
 * Thin route wrapper — the full-page /templates/import route. The
 * multi-step flow itself lives in TemplateImportFlow so it can be
 * reused inside the /setup onboarding modal.
 */
export default function ImportTemplatesPage() {
  const navigate = useNavigate();

  usePageMeta({
    title: "Import templates",
    breadcrumbs: ["Templates", "Import"],
    actions: (
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => navigate("/templates")}
      >
        <X size={14} /> Cancel import
      </button>
    ),
  });

  return (
    <div className="fade-in">
      <TemplateImportFlow
        onDone={() => navigate("/templates")}
        onCancel={() => navigate("/templates")}
      />
    </div>
  );
}
