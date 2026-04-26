import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { supabase } from "@/lib/supabase";

const TEAM_SIZES = ["1–5", "6–20", "21–50", "50+"] as const;

export default function SetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: restaurant } = useRestaurant();

  const [restaurantName, setRestaurantName] = useState("");
  const [teamSize, setTeamSize] = useState<string>("6–20");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim()) {
      toast.error("Restaurant name is required");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({
          name: restaurantName.trim(),
          team_size: teamSize,
          onboarding_completed: true,
        })
        .eq("id", restaurant!.id);

      if (error) throw error;
      // Invalidate the cached restaurant so AppLayout fetches the updated
      // onboarding_completed = true before deciding where to route.
      await queryClient.invalidateQueries({ queryKey: ['restaurant'] });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="brand-logo-mark">S</div>
          <span className="font-display font-bold text-base tracking-[-0.01em]">
            Shiftcraft
          </span>
        </div>

        <span className="label-md">Almost there</span>
        <h1 className="display-md mt-1.5 mb-2">Tell us about your café.</h1>
        <p className="body-md text-on-surface-muted mb-8">
          Set up your workspace in under a minute.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="restaurantName" className="field-label">
              Café or restaurant name
            </label>
            <input
              id="restaurantName"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="input-field"
              placeholder="Meridian Coffee"
              autoFocus
            />
          </div>

          <div>
            <span className="field-label">Team size</span>
            <div className="grid grid-cols-4 gap-1.5 mt-1.5">
              {TEAM_SIZES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setTeamSize(s)}
                  className={`mono py-2.5 rounded-[10px] text-[12.5px] font-semibold border-none cursor-pointer transition-all ${
                    teamSize === s
                      ? "bg-surface-lowest text-on-surface shadow-[inset_0_0_0_2px_var(--color-primary-fixed)]"
                      : "bg-surface-highest text-on-surface-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary justify-center py-3 text-sm mt-2"
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Continue to Shiftcraft"}
            {!submitting && <Sparkles size={15} />}
          </button>
        </form>
      </div>
    </div>
  );
}
