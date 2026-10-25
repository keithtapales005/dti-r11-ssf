import { useQuery } from "@tanstack/react-query";
import { lookupService } from "../services/lookup.service";

export const lookupKeys = {
  all: ["lookups"] as const,
  lists: ["lookups", "lists"] as const,
  values: (list: string, includeInactive: boolean) => ["lookups", list, includeInactive] as const,
};

export const useLookupLists = () =>
  useQuery({ queryKey: lookupKeys.lists, queryFn: lookupService.getLists });

// Values of one list (e.g. "concern_category"). Dropdowns use the default (active only);
// the Manage Lists page passes includeInactive = true.
export const useLookupValues = (list: string, includeInactive = false) =>
  useQuery({
    queryKey: lookupKeys.values(list, includeInactive),
    queryFn: () => lookupService.getValues(list, includeInactive),
    staleTime: 60_000,
  });
