import { useQuery } from "@tanstack/react-query";
import { fetchOData } from "../lib/fetchOData";

export const useOData = (
  entity: string,
  queryOptions: any,
  reactQueryOptions = {}
) => {
  return useQuery({
    queryKey: [entity, queryOptions],
    queryFn: () => fetchOData(entity, queryOptions),
    ...reactQueryOptions,
  });
};
