import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { useWeekSchedule } from "@/lib/hooks/use-schedules";
import { useEmployees } from "@/lib/hooks/use-employees";
import { PrintableSchedule } from "@/components/schedules/PrintableSchedule";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  fromDateStr,
  getMondayOfWeek,
  getWeekDays,
  getWeekNumber,
  getWeekRangeLabel,
  toDateStr,
} from "@/lib/utils/dates";
import { downloadElementAsPdf } from "@/lib/utils/pdf-download";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Standalone PDF preview page. Rendered at /schedules/print?week=YYYY-MM-DD
 * — outside the AppLayout so the sidebar/topbar never appear on screen or
 * in the downloaded file.
 *
 * "Download PDF" rasterizes the visible sheet via html2canvas + jsPDF and
 * triggers a direct browser download (no OS print dialog). Filename is
 * built from restaurant slug + week for easy library storage.
 */
export default function PrintPreviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: restaurant } = useRestaurant();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const weekParam = searchParams.get("week");
  const monday = useMemo(
    () =>
      weekParam
        ? getMondayOfWeek(fromDateStr(weekParam))
        : getMondayOfWeek(new Date()),
    [weekParam],
  );
  const weekStart = toDateStr(monday);
  const weekDays = useMemo(() => getWeekDays(monday), [monday]);

  const { schedule, isLoading, error } = useWeekSchedule(
    restaurant?.id,
    weekStart,
  );
  const { data: employees = [] } = useEmployees(restaurant?.id);

  useEffect(() => {
    document.title = `PDF preview · ${getWeekRangeLabel(monday)} · Mise en place`;
    return () => {
      document.title = "Mise en Place — Restaurant staff & scheduling";
    };
  }, [monday]);

  const goBack = () => {
    navigate(`/schedules?week=${weekStart}`);
  };

  const weekLabel = getWeekRangeLabel(monday);
  const managerName = (user?.user_metadata?.full_name as string | undefined)
    ?.split(/\s+/)[0];

  // Descriptive filename: {restaurant-slug}_{YYYY-MM-DD}_week-{N}.pdf
  // Managers can drop these into a folder and eyeball them without opening.
  const filename = useMemo(() => {
    const slug =
      (restaurant?.name ?? "schedule")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "schedule";
    return `${slug}_${weekStart}_week-${getWeekNumber(monday)}`;
  }, [restaurant?.name, weekStart, monday]);

  const handleDownload = async () => {
    if (!sheetRef.current || !schedule) return;
    setDownloading(true);
    try {
      await downloadElementAsPdf({
        target: sheetRef.current,
        filename,
        landscape: true,
      });
      toast.success("PDF downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't generate the PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--surface-high)",
        overflowY: "auto",
        padding: "32px 24px 64px",
      }}
    >
      {/* Sticky toolbar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 10,
          maxWidth: 1000,
          margin: "0 auto 24px",
          padding: "10px 14px",
          background:
            "color-mix(in oklab, var(--surface-lowest) 85%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: 14,
          boxShadow: "var(--shadow-ambient)",
        }}
      >
        <button
          type="button"
          className="btn btn-ghost"
          onClick={goBack}
          disabled={downloading}
        >
          <ChevronLeft size={14} /> Back to schedule
        </button>
        <div style={{ flex: 1 }} />
        <div className="label-md" style={{ fontSize: 10 }}>
          PDF preview · US Letter, landscape
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleDownload}
          disabled={!schedule || downloading}
        >
          <Download size={14} />{" "}
          {downloading ? "Preparing…" : "Download PDF"}
        </button>
      </div>

      {isLoading && (
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            padding: "80px 0",
          }}
        >
          <LoadingSpinner size={28} />
        </div>
      )}

      {error && (
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <ErrorMessage message="Failed to load schedule" />
        </div>
      )}

      {schedule && (
        <div className="print-sheet-wrap">
          <div ref={sheetRef} className="print-sheet">
            <PrintableSchedule
              schedule={schedule}
              employees={employees}
              weekDays={weekDays}
              restaurantName={restaurant?.name ?? "Restaurant"}
              weekLabel={weekLabel}
              weekNumber={getWeekNumber(monday)}
              year={monday.getFullYear()}
              managerName={managerName}
            />
          </div>
        </div>
      )}
    </div>
  );
}
