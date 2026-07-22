import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export type DeleteTagResponse = {
  message: string;
};

async function deleteTag(slug: string) {
  const response = await axios.delete<DeleteTagResponse>(`/api/tags/${encodeURIComponent(slug)}`);

  return response.data;
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tags"],
      });
    },
  });
}
