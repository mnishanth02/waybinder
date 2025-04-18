"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, Calendar, MapPin, Mountain, Users } from "lucide-react";
import { memo } from "react";

interface AthleteIntroductionProps {
  onNext: () => void;
}

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
        <Card className="group overflow-hidden transition-colors hover:border-primary/50">
          <div className="h-1 w-full bg-primary/80" />
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
            <h4 className="mb-2 text-center font-semibold">Track Multi-Day Journeys</h4>
            <p className="text-center text-muted-foreground text-sm">
              Document detailed day-by-day activities, routes, and experiences.
            </p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden transition-colors hover:border-primary/50">
          <div className="h-1 w-full bg-primary/80" />
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <h4 className="mb-2 text-center font-semibold">Share Your Adventures</h4>
            <p className="text-center text-muted-foreground text-sm">
              Present your journeys with maps, photos, and detailed insights.
            </p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden transition-colors hover:border-primary/50">
          <div className="h-1 w-full bg-primary/80" />
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <h4 className="mb-2 text-center font-semibold">Connect with Others</h4>
            <p className="text-center text-muted-foreground text-sm">
              Join a community of like-minded outdoor enthusiasts.
            </p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden transition-colors hover:border-primary/50">
          <div className="h-1 w-full bg-primary/80" />
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <h4 className="mb-2 text-center font-semibold">Detailed Documentation</h4>
            <p className="text-center text-muted-foreground text-sm">
              Log routes, gear lists, planning notes, and more.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative flex h-48 items-center overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute top-0 left-0 h-full w-full opacity-10" />
        <div className="relative z-10 max-w-lg p-6 md:p-8">
          <h3 className="mb-2 font-semibold text-xl">Create Your Athlete Profile</h3>
          <p className="mb-4 text-muted-foreground">
            In the following steps, we'll collect some information to create your personalized
            athlete profile.
          </p>
          <Button onClick={onNext} className="group">
            <span>Get Started</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
});
