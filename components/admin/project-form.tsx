"use client";

import { AxiosError } from "axios";
import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, type Path, useForm, useWatch } from "react-hook-form";

import { ProjectMetricsFields } from "@/components/admin/project-metrics-fields";
import { Checkbox } from "@/components/form/checkbox";
import { InfiniteSelect } from "@/components/form/infinite-select";
import Input from "@/components/form/input";
import { RichTextEditor } from "@/components/form/rich-text-editor";
import { Textarea } from "@/components/form/textarea";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { projectSchema, type ProjectSchema } from "@/lib/form/project-schema";
import { useGetInfiniteCompanies } from "@/lib/services/companies/get-infinite-companies";
import { useGetInfiniteTags } from "@/lib/services/tags/get-infinite-tags";
import { normalizeSlug } from "@/lib/slug";
import type { ValidationErrorResponse } from "@/types/api";
import type { RelationOption } from "@/types/experience";
import type { ProjectWithRelations } from "@/types/project";

type Props = {
  mode: "create" | "edit";
  initialProject?: ProjectWithRelations;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (values: ProjectSchema, applyServerErrors: (error: unknown) => void) => void;
  onCancel: () => void;
};

export function ProjectForm({ mode, initialProject, isSubmitting, submitError, onSubmit, onCancel }: Props) {
  const [company, setCompany] = useState<RelationOption | null>(
    initialProject ? { value: initialProject.company.slug, label: initialProject.company.name } : null,
  );
  const [tags, setTags] = useState<RelationOption[]>(
    initialProject?.tags.map((tag) => ({ value: tag.slug, label: tag.name })) ?? [],
  );
  const [companySearch, setCompanySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [failedThumbnail, setFailedThumbnail] = useState<string | null>(null);
  const slugManuallyEdited = useRef(mode === "edit");
  const companiesQuery = useGetInfiniteCompanies(companySearch);
  const tagsQuery = useGetInfiniteTags(tagSearch);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProjectSchema>({
    defaultValues: {
      title: initialProject?.title ?? "",
      slug: initialProject?.slug ?? "",
      companySlug: initialProject?.company.slug ?? "",
      role: initialProject?.role ?? "",
      year: initialProject?.year ?? new Date().getFullYear(),
      demoUrl: initialProject?.demoUrl ?? "",
      thumbnail: initialProject?.thumbnail ?? "",
      metric: initialProject?.metric ?? "",
      excerpt: initialProject?.excerpt ?? "",
      featured: initialProject?.featured ?? false,
      tagSlugs: initialProject?.tags.map((tag) => tag.slug) ?? [],
      metrics: initialProject?.metrics ?? [],
      body: initialProject?.body ?? "",
    },
  });

  const title = useWatch({ control, name: "title" });
  const thumbnail = useWatch({ control, name: "thumbnail" });
  const slugRegistration = register("slug");

  useEffect(() => {
    if (!slugManuallyEdited.current) setValue("slug", normalizeSlug(title ?? ""), { shouldDirty: true });
  }, [setValue, title]);

  const applyServerErrors = (error: unknown) => {
    const response = (error as AxiosError<ValidationErrorResponse<keyof ProjectSchema>>).response?.data;
    if (!response?.errors) return;
    Object.entries(response.errors).forEach(([field, messages]) => {
      const message = messages?.[0];
      if (message) setError(field as Path<ProjectSchema>, { type: "server", message });
    });
  };

  const submit = (values: ProjectSchema) => {
    clearErrors();
    const result = projectSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".") as Path<ProjectSchema>;
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
        <Input id="title" label="Title" placeholder="Project title" required disabled={isSubmitting} errorMessage={errors.title?.message} {...register("title")} />
        <Input
          id="slug"
          label="Slug"
          placeholder="project-slug"
          required
          disabled={isSubmitting}
          errorMessage={errors.slug?.message}
          {...slugRegistration}
          onChange={(event) => {
            slugManuallyEdited.current = true;
            slugRegistration.onChange(event);
          }}
        />
        <InfiniteSelect
          id="companySlug"
          label="Company"
          placeholder="Select a company"
          searchPlaceholder="Search companies…"
          required
          value={company}
          onChange={(option) => {
            setCompany(option);
            setValue("companySlug", option?.value ?? "", { shouldDirty: true, shouldValidate: true });
          }}
          options={companiesQuery.data?.options ?? []}
          search={companySearch}
          onSearchChange={setCompanySearch}
          isLoading={companiesQuery.isLoading}
          isFetchingNextPage={companiesQuery.isFetchingNextPage}
          isError={companiesQuery.isError}
          hasNextPage={Boolean(companiesQuery.hasNextPage)}
          onLoadMore={() => void companiesQuery.fetchNextPage()}
          onRetry={() => void companiesQuery.refetch()}
          errorMessage={errors.companySlug?.message}
          disabled={isSubmitting}
        />
        <Input id="role" label="Role" placeholder="Frontend Developer" required disabled={isSubmitting} errorMessage={errors.role?.message} {...register("role")} />
        <Input id="year" label="Year" type="number" min={1900} max={new Date().getFullYear() + 1} required disabled={isSubmitting} errorMessage={errors.year?.message} {...register("year", { valueAsNumber: true })} />
        <Input id="demoUrl" label="Demo URL" type="url" placeholder="https://example.com" disabled={isSubmitting} errorMessage={errors.demoUrl?.message} {...register("demoUrl")} />
        <div>
          <Input id="thumbnail" label="Thumbnail URL / Path" placeholder="/images/project.webp" required disabled={isSubmitting} errorMessage={errors.thumbnail?.message} {...register("thumbnail")} />
          {thumbnail && (
            <div className="mt-3 aspect-video overflow-hidden border border-border bg-muted/10">
              {previewUnavailable ? (
                <div className="flex h-full items-center justify-center gap-2 text-sm text-muted"><ImageOff size={16} /> Preview unavailable</div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnail} alt="Project thumbnail preview" className="h-full w-full object-cover" onError={() => setFailedThumbnail(thumbnail)} />
              )}
            </div>
          )}
        </div>
        <Input id="metric" label="Headline Metric" placeholder="40% faster workflow" disabled={isSubmitting} errorMessage={errors.metric?.message} {...register("metric")} />
        <div className="md:col-span-2">
          <Textarea id="excerpt" label="Excerpt" placeholder="Short project summary" required disabled={isSubmitting} errorMessage={errors.excerpt?.message} {...register("excerpt")} />
        </div>
        <div className="md:col-span-2">
          <Checkbox id="featured" label="Featured Project" description="Feature this Project in prominent portfolio placements." disabled={isSubmitting} errorMessage={errors.featured?.message} {...register("featured")} />
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
              setValue("tagSlugs", options.map((option) => option.value), { shouldDirty: true, shouldValidate: true });
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
          <ProjectMetricsFields control={control} register={register} errors={errors.metrics} disabled={isSubmitting} />
        </div>
        <div className="md:col-span-2">
          <Controller
            name="body"
            control={control}
            render={({ field }) => <RichTextEditor id="body" label="Body" required disabled={isSubmitting} value={field.value} onChange={field.onChange} errorMessage={errors.body?.message} />}
          />
        </div>
      </div>
      <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" variant="primary" loading={isSubmitting} loadingText={mode === "create" ? "Creating…" : "Saving…"}>
          {mode === "create" ? "Create Project" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
