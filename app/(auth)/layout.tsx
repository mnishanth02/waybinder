import { cn } from "@/lib/utils";

export const metadata = {
  title: {
    template: "%s | WayBinder",
    default: "Authentication | WayBinder",
  },
  description:
    "Wayfinder helps you track, organize, and share your outdoor journeys with day-by-day activities and interactive maps.",
};

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className={cn("flex min-h-screen items-center justify-center ")}>{children}</div>;
};

export default AuthLayout;
