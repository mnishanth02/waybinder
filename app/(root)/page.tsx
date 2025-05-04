"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FileUploadExample from "@/docs/examples/use-file-upload.example";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleOnboardingClick = () => {
    router.push("/onboarding");
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardContent className="pt-6">
          <h1 className="mb-4 font-bold text-2xl">WayBinder</h1>
          <p className="mb-6">Welcome to WayBinder, your ultimate outdoor activity companion.</p>
          <Button onClick={handleOnboardingClick}>Athlete Onboarding</Button>
        </CardContent>
      </Card>
      <div>
        <FileUploadExample />
      </div>
    </div>
  );
}
