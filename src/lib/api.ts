// Remove the server-side auth import that was causing issues
// This file should only contain client-side functions

export async function registerUser(username: string, clerkUserId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        clerk_user_id: clerkUserId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Registration failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function validateUser(token: string) {
  try {
    // Instead of using server-side auth, we'll make a request to the backend
    // which will validate the user through the Clerk token in the request
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protected`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Authentication failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}

export async function createApplication(token: string, name: string, description: string = "") {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        description
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Application creation failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Application creation error:", error);
    throw error;
  }
}

export async function deleteApplication(token: string, applicationId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Application deletion failed");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Application deletion error:", error);
    throw error;
  }
}

export async function getApplications(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch applications");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    throw error;
  }
}
