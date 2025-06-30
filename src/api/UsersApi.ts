const BASE_URL = "http://localhost:3000/users";

import type { Filters } from "../store/userStore";
import type { User } from "../store/userStore";

export const fetchPaginatedUsers = async (
  page: number,
  per_page: number,
  filters: Filters
) => {
  const params = new URLSearchParams({
    _page: page.toString(),
    _per_page: per_page.toString(),
    ...(filters.search ? { q: filters.search } : {}),
    ...(filters.role ? { role: filters.role } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.sortBy
      ? {
          _sort:
            filters.sortOrder === "desc"
              ? `-${filters.sortBy}`
              : filters.sortBy,
        }
      : {}),
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  const resJson = await response.json();
  //const users = resJson.data;
  const totalCount = response.headers.get("x-total-count");

  //console.log("API response:", resJson);
  console.log("users:", resJson);
  console.log("Total count:", totalCount);

  return {
    resJson,
    totalCount: totalCount ? parseInt(totalCount, 10) : resJson.length,
  };
};

export const fetchUserById = async (id: string | number) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) throw new Error("User not found");
  return await response.json();
};

export const fetchAllUsers = async () => {
  const response = await fetch(BASE_URL);
  const resJson = await response.json();
  console.log("API response:", resJson);
  console.log("users:", resJson.data);
  return resJson;
};

export const updateUser = async (id: number, user: User): Promise<User> => {
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
};


export const deleteUser = async (id: number) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete user");
};



export async function addUser(user: User): Promise<User> {
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
}
