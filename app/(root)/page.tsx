import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardContent>
          <h1 className="font-bold text-2xl">WayBinder</h1>
        </CardContent>
      </Card>
    </div>
  );
}
