const BASE_URL = import.meta.env.VITE_BASE_URL;

import type { Filters } from "../store/userStore";
import type { User } from "../store/userStore";

export const fetchPaginatedUsers = async (
  page: number,
  per_page: number,
  filters: Filters
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: per_page.toString(),
    ...(filters.search ? { q: filters.search } : {}),
    ...(filters.role ? { role: filters.role } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.sortBy ? { sortBy: filters.sortBy} : {}),
    ...(filters.sortOrder ? { sortOrder: filters.sortOrder} : {})
  });

  try {
    const response = await fetch(`${BASE_URL}?${params}`);
    if (!response.ok) throw new Error("Failed to fetch users");

    const resJson = await response.json();
    console.log('Response body', resJson);
    const totalCount = resJson.total;

    console.log("Total count:", totalCount);
    
    return {
      resJson,
      totalCount: totalCount ? parseInt(totalCount, 10) : resJson.length,
    };
  } catch (err) {
    console.error("Error fetching paginated users:", err);
    throw err;
  }
};

export const fetchUserById = async (id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) throw new Error("User not found");
    const resJson = await response.json();
    console.log("User by ID:", resJson)
    return resJson;
  } catch (err) {
    console.error("Error fetching user by ID: ", err);
    throw err;
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/allUsers`);
    if (!response.ok) throw new Error("Failed to fetch all users");

    const resJson = await response.json();
    console.log("ALl users:", resJson);
    return resJson;
  } catch (err) {
    console.error("Error fetching all users: ", err);
    throw err;
  }
};

export const updateUser = async (id: number, user: User): Promise<User> => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    console.log("Response received. Status:", res.status);

    const text = await res.text();

    try {
      const json = JSON.parse(text);
      console.log("Parsed JSON response:", json);
      return json;
    } catch (err) {
      console.warn("Response is not valid JSON:");
      console.log(text);
      throw new Error("Failed to parse response as JSON");
    }
  } catch (err) {
    console.error("Error updating user: ", err);
    throw err;
  }
};

export const deleteUser = async (id: number) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete user");
    const result = await res.json();
    console.log("Delete response", result);
  } catch (err) {
    console.error("Error deleting user: ", err);
    throw err;
  }
};

export async function addUser(user: User): Promise<User> {
  try {
    const response = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    return await response.json();
  } catch (err) {
    console.error("Error adding user: ", err);
    throw err;
  }
}
