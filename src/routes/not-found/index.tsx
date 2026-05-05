import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <p className="mono font-bold text-[64px] leading-none text-on-surface-faint mb-4">
          404
        </p>
        <h1 className="headline-md mb-2">Page not found</h1>
        <p className="body-sm text-on-surface-muted mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-secondary py-2.5 text-sm mr-2"
        >
          Go back
        </button>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="btn btn-primary py-2.5 text-sm"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
