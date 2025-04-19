import { client } from "@/lib/hono-client";

export const getUserById = async (id: string) => {
  const response = await client.api.user[":id"].$get({
    param: { id },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData ? JSON.stringify(errorData) : "Failed to fetch user");
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error("Invalid response from server");
  }

  return data.data;
};

export const getUserWithAthlete = async (id: string) => {
  const response = await client.api.user[":id"].athlete.$get({
    param: { id },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData ? JSON.stringify(errorData) : "Failed to fetch user with athlete profile"
    );
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error("Invalid response from server");
  }

  // The response contains the user object with the athleteProfile property
  return data.data;
};
