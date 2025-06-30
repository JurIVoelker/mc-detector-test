import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SortingType = "name" | "status" | "createdAt" | "updatedAt";

type MainStore = {
  sortingType: SortingType;
  toggleSortingType: () => void;
  finishedHidden: boolean;
  setFinishedHidden: (hidden: boolean) => void;
};

export const useMainStore = create<MainStore>()(
  persist(
    (set) => ({
      sortingType: "name",
      toggleSortingType: () =>
        set((state) => ({
          sortingType:
            state.sortingType === "name"
              ? "status"
              : state.sortingType === "status"
              ? "createdAt"
              : state.sortingType === "createdAt"
              ? "updatedAt"
              : "name",
        })),
      finishedHidden: false,
      setFinishedHidden: (hidden) => set({ finishedHidden: hidden }),
    }),
    { name: "main-store" }
  )
);
