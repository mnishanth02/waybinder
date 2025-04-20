import type React from "react";

// Placeholder for journeys; replace with real data fetching later
const mockJourneys = [
  { id: 1, title: "Journey to State Championship", date: "2024-01-20" },
  { id: 2, title: "Summer Training Camp", date: "2024-06-15" },
];

const JourneyList: React.FC = () => {
  return (
    <div className="grid gap-4">
      {mockJourneys.length === 0 ? (
        <div className="text-muted-foreground">No journeys yet.</div>
      ) : (
        mockJourneys.map((journey) => (
          <div key={journey.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="font-semibold">{journey.title}</div>
            <div className="text-muted-foreground text-xs">{journey.date}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default JourneyList;
