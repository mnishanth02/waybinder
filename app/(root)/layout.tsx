import { cn } from "@/lib/utils";

export const metadata = {
  title: {
    template: "%s | WayBinder",
    default: "WayBinder",
  },
  description:
    "WayBinder is a platform for outdoor enthusiasts to share their adventures and connect with others. It's a place to find new trails, share your own, and get inspired by the beauty of nature.",
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn("flex min-h-screen flex-col bg-gradient-to-b from-background to-secondary/10")}
    >
      {children}
    </div>
  );
};

export default RootLayout;
