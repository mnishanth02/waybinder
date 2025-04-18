"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  type LucideIcon,
  MapPin,
  Mountain,
  Users,
} from "lucide-react";
import { memo } from "react";

interface AthleteIntroductionProps {
  onNext: () => void;
}

// Card data type
interface IntroCard {
  title: string;
  description: string;
  Icon: LucideIcon;
}

const introCards: IntroCard[] = [
  {
    title: "Track Multi-Day Journeys",
    description: "Document detailed day-by-day activities, routes, and experiences.",
    Icon: MapPin,
  },
  {
    title: "Share Your Adventures",
    description: "Present your journeys with maps, photos, and detailed insights.",
    Icon: Calendar,
  },
  {
    title: "Connect with Others",
    description: "Join a community of like-minded outdoor enthusiasts.",
    Icon: Users,
  },
  {
    title: "Detailed Documentation",
    description: "Log routes, gear lists, planning notes, and more.",
    Icon: BookOpen,
  },
];

export const AthleteIntroduction = memo(function AthleteIntroduction({
  onNext,
}: AthleteIntroductionProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mountain className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-bold text-3xl">Welcome to Waybinder</h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          Join our community of outdoor enthusiasts and share your adventures with the world
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        {introCards.map(({ title, description, Icon }) => (
          <Card
            key={title}
            className="group overflow-hidden transition-colors hover:border-primary/50"
          >
            <div className="h-1 w-full bg-primary/80" />
            <CardContent className="pt-3">
              <div className="mb-4 flex items-center justify-center">
                <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <h4 className="mb-2 text-center font-semibold">{title}</h4>
              <p className="text-center text-muted-foreground text-sm">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative flex h-40 items-center overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute top-0 left-0 h-full w-full opacity-10" />
        <div className="relative z-10 flex w-full items-center justify-between gap-2 p-6 md:p-8">
          <div className="flex flex-col gap-2">
            <h3 className="mb-2 font-semibold text-xl">Create Your Athlete Profile</h3>
            <p className="mb-4 max-w-lg text-muted-foreground">
              In the following steps, we'll collect some information to create your personalized
              athlete profile.
            </p>
          </div>
          <Button onClick={onNext} className="group">
            <span>Get Started</span>
            <ArrowRight className="ml-2 flex h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
});
