import {cn} from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
};

const sizeClasses: Record<string, string> = {
  default: "size-6",
  sm: "size-4",
  lg: "size-8",
  icon: "size-9",
};

function Spinner({className, size = "default"}: SpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", sizeClasses[size], className)}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export {Spinner};
