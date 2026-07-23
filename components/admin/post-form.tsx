"use client";

import { AxiosError } from "axios";
import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, type Path, useForm, useWatch } from "react-hook-form";

import { Checkbox } from "@/components/form/checkbox";
import { InfiniteSelect } from "@/components/form/infinite-select";
import Input from "@/components/form/input";
import { RichTextEditor } from "@/components/form/rich-text-editor";
import { Textarea } from "@/components/form/textarea";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { postSchema, type PostSchema } from "@/lib/form/post-schema";
import { formatPostDateInput } from "@/lib/post";
import { useGetInfiniteTags } from "@/lib/services/tags/get-infinite-tags";
import { normalizeSlug } from "@/lib/slug";
import type { ValidationErrorResponse } from "@/types/api";
import type { RelationOption } from "@/types/experience";
import type { PostWithRelations } from "@/types/post";

type Props = {
  mode: "create" | "edit";
  initialPost?: PostWithRelations;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (values: PostSchema, applyServerErrors: (error: unknown) => void) => void;
  onCancel: () => void;
};

export function PostForm({ mode, initialPost, isSubmitting, submitError, onSubmit, onCancel }: Props) {
  const [tags, setTags] = useState<RelationOption[]>(
    initialPost?.tags.map((tag) => ({ value: tag.slug, label: tag.name })) ?? [],
  );
  const [tagSearch, setTagSearch] = useState("");
  const [failedThumbnail, setFailedThumbnail] = useState<string | null>(null);
  const slugManuallyEdited = useRef(mode === "edit");
  const tagsQuery = useGetInfiniteTags(tagSearch);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PostSchema>({
    defaultValues: {
      title: initialPost?.title ?? "",
      slug: initialPost?.slug ?? "",
      date: formatPostDateInput(initialPost?.date ?? new Date()),
      thumbnail: initialPost?.thumbnail ?? "",
      excerpt: initialPost?.excerpt ?? "",
      published: initialPost?.published ?? false,
      tagSlugs: initialPost?.tags.map((tag) => tag.slug) ?? [],
      body: initialPost?.body ?? "",
    },
  });

  const title = useWatch({ control, name: "title" });
  const thumbnail = useWatch({ control, name: "thumbnail" });
  const slugRegistration = register("slug");

  useEffect(() => {
    if (!slugManuallyEdited.current) setValue("slug", normalizeSlug(title ?? ""), { shouldDirty: true });
  }, [setValue, title]);

  const applyServerErrors = (error: unknown) => {
    const response = (error as AxiosError<ValidationErrorResponse<keyof PostSchema>>).response?.data;
    if (!response?.errors) return;
    Object.entries(response.errors).forEach(([field, messages]) => {
      const message = messages?.[0];
      if (message) setError(field as Path<PostSchema>, { type: "server", message });
    });
  };

  const submit = (values: PostSchema) => {
    clearErrors();
    const result = postSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".") as Path<PostSchema>;
        if (path) setError(path, { type: "validate", message: issue.message });
      });
      return;
    }
    onSubmit(values, applyServerErrors);
  };

  const previewUnavailable = Boolean(thumbnail) && failedThumbnail === thumbnail;

  return (
    <form onSubmit={handleSubmit(submit)} className="border border-border bg-bg p-5 sm:p-7">
      {submitError && <Alert className="mb-6" color="error" message={submitError} />}
      <div className="grid gap-6 md:grid-cols-2">
        <Input
          id="title"
          label="Title"
          placeholder="Post title"
          required
          disabled={isSubmitting}
          errorMessage={errors.title?.message}
          {...register("title")}
        />
        <Input
          id="slug"
          label="Slug"
          placeholder="post-slug"
          required
          disabled={isSubmitting}
          errorMessage={errors.slug?.message}
          {...slugRegistration}
          onChange={(event) => {
            slugManuallyEdited.current = true;
            slugRegistration.onChange(event);
          }}
        />
        <Input
          id="date"
          label="Publication Date"
          type="date"
          required
          disabled={isSubmitting}
          errorMessage={errors.date?.message}
          {...register("date")}
        />
        <div>
          <Input
            id="thumbnail"
            label="Thumbnail URL / Path"
            placeholder="/images/post.webp"
            required
            disabled={isSubmitting}
            errorMessage={errors.thumbnail?.message}
            {...register("thumbnail")}
          />
          {thumbnail && (
            <div className="mt-3 aspect-video overflow-hidden border border-border bg-muted/10">
              {previewUnavailable ? (
                <div className="flex h-full items-center justify-center gap-2 text-sm text-muted">
                  <ImageOff size={16} />
                  Preview unavailable
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnail}
                  alt="Post thumbnail preview"
                  className="h-full w-full object-cover"
                  onError={() => setFailedThumbnail(thumbnail)}
                />
              )}
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <Textarea
            id="excerpt"
            label="Excerpt"
            placeholder="Short Post summary"
            required
            disabled={isSubmitting}
            errorMessage={errors.excerpt?.message}
            {...register("excerpt")}
          />
        </div>
        <div className="md:col-span-2">
          <Checkbox
            id="published"
            label="Published"
            description="Make this Post visible on the public Blog."
            disabled={isSubmitting}
            errorMessage={errors.published?.message}
            {...register("published")}
          />
        </div>
        <div className="md:col-span-2">
          <InfiniteSelect
            id="tagSlugs"
            label="Tags"
            placeholder="Select tags"
            searchPlaceholder="Search tags…"
            multiple
            value={tags}
            onChange={(options) => {
              setTags(options);
              setValue(
                "tagSlugs",
                options.map((option) => option.value),
                { shouldDirty: true, shouldValidate: true },
              );
            }}
            options={tagsQuery.data?.options ?? []}
            search={tagSearch}
            onSearchChange={setTagSearch}
            isLoading={tagsQuery.isLoading}
            isFetchingNextPage={tagsQuery.isFetchingNextPage}
            isError={tagsQuery.isError}
            hasNextPage={Boolean(tagsQuery.hasNextPage)}
            onLoadMore={() => void tagsQuery.fetchNextPage()}
            onRetry={() => void tagsQuery.refetch()}
            errorMessage={errors.tagSlugs?.message}
            disabled={isSubmitting}
          />
        </div>
        <div className="md:col-span-2">
          <Controller
            name="body"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                id="body"
                label="Body"
                placeholder="Write the article content…"
                required
                disabled={isSubmitting}
                value={field.value}
                onChange={field.onChange}
                errorMessage={errors.body?.message}
              />
            )}
          />
        </div>
      </div>
      <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          loadingText={mode === "create" ? "Creating…" : "Saving…"}
        >
          {mode === "create" ? "Create Post" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
