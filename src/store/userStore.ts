import { create } from 'zustand';

export interface User {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
    salary?: number;
}

export interface Filters {
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
}
interface UserStore {
    users: User[];
    setUsers: (users: User[]) => void;
    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;
    filters: Filters;
    setFilters: (filters: Filters) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    users: [],
    setUsers: (users) => set({ users }),
    selectedUser: null,
    setSelectedUser: (user) => set({ selectedUser: user }),
    filters: {},
    setFilters: (filters) => set({filters}),
}));