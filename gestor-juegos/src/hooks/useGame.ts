import useSWR from "swr";
import { api } from "../services/api";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useGames() {
  const { data, error } = useSWR("/games", fetcher);

  return {
    games: data,
    isLoading: !error && !data,
    isError: !!error,
  };
}
