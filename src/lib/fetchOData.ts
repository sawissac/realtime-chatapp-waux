import buildQuery from "odata-query";
import api from "./axios";

export const fetchOData = async (entity: string, queryOptions = {}) => {
  const query = buildQuery(queryOptions); // converts to $filter, $top, etc.
  const url = `${entity}${query}`;
  const { data } = await api.get(url);
  return data.value;
};