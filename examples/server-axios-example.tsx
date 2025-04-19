import { getUserWithAthleteServerSide } from "@/lib/server-api";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ServerAxiosExample() {
  // Get the session from the auth API
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect if not authenticated
  if (!session || !session.user) {
    redirect("/auth/sign-in");
  }

  try {
    // Fetch user with athlete profile using server-side function
    const userData = await getUserWithAthleteServerSide(session.user.id);

    return (
      <div>
        <h1>User Profile (Server-Side with Axios)</h1>
        <div>
          <h2>User Information</h2>
          <p>Name: {userData.name}</p>
          <p>Email: {userData.email}</p>
          <p>Role: {userData.role}</p>
        </div>

        {userData.athleteProfile && (
          <div>
            <h2>Athlete Profile</h2>
            <p>First Name: {userData.athleteProfile.firstName}</p>
            <p>Last Name: {userData.athleteProfile.lastName}</p>
            <p>Athlete ID: {userData.athleteProfile.athleteUniqueId}</p>
            {userData.athleteProfile.bio && <p>Bio: {userData.athleteProfile.bio}</p>}
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div>
        <h1>Error Loading User Profile</h1>
        <p>{error instanceof Error ? error.message : "An unknown error occurred"}</p>
      </div>
    );
  }
}
