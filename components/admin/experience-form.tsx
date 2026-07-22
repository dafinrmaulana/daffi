"use client";

import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { InfiniteSelect } from "@/components/form/infinite-select";
import Input from "@/components/form/input";
import { RichTextEditor } from "@/components/form/rich-text-editor";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { experienceSchema, type ExperienceSchema } from "@/lib/form/experience-schema";
import { useGetInfiniteCompanies } from "@/lib/services/companies/get-infinite-companies";
import { useGetInfiniteProjectHighlights } from "@/lib/services/project-highlights/get-infinite-project-highlights";
import { useGetInfiniteSkills } from "@/lib/services/skills/get-infinite-skills";
import { normalizeSlug } from "@/lib/slug";
import type { ValidationErrorResponse } from "@/types/api";
import type { ExperienceWithRelations, RelationOption } from "@/types/experience";

type Props = {
  mode: "create" | "edit";
  initialExperience?: ExperienceWithRelations;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (values: ExperienceSchema, applyServerErrors: (error: unknown) => void) => void;
  onCancel: () => void;
};

function formatDate(value: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function ExperienceForm({ mode, initialExperience, isSubmitting, submitError, onSubmit, onCancel }: Props) {
  const initialCompany = initialExperience
    ? { value: initialExperience.company.slug, label: initialExperience.company.name }
    : null;
  const initialHighlight = initialExperience?.projectHighlight
    ? { value: initialExperience.projectHighlight.slug, label: initialExperience.projectHighlight.name }
    : null;
  const [company, setCompany] = useState<RelationOption | null>(initialCompany);
  const [highlight, setHighlight] = useState<RelationOption | null>(initialHighlight);
  const [skills, setSkills] = useState<RelationOption[]>(
    initialExperience?.skills.map((skill) => ({ value: skill.slug, label: skill.name })) ?? [],
  );
  const [companySearch, setCompanySearch] = useState("");
  const [highlightSearch, setHighlightSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const slugManuallyEdited = useRef(mode === "edit");

  const companiesQuery = useGetInfiniteCompanies(companySearch);
  const highlightsQuery = useGetInfiniteProjectHighlights(highlightSearch);
  const skillsQuery = useGetInfiniteSkills(skillSearch);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ExperienceSchema>({
    defaultValues: {
      companySlug: initialExperience?.company.slug ?? "",
      role: initialExperience?.role ?? "",
      slug: initialExperience?.slug ?? "",
      startDate: formatDate(initialExperience?.startDate ?? null),
      endDate: formatDate(initialExperience?.endDate ?? null),
      location: initialExperience?.location ?? "",
      projectHighlightSlug: initialExperience?.projectHighlight?.slug ?? "",
      skillSlugs: initialExperience?.skills.map((skill) => skill.slug) ?? [],
      description: initialExperience?.description ?? "",
    },
  });

  const role = useWatch({ control, name: "role" });
  const slugRegistration = register("slug");

  useEffect(() => {
    if (!slugManuallyEdited.current) {
      setValue("slug", normalizeSlug(`${company?.label ?? ""}-${role ?? ""}`), { shouldDirty: true });
    }
  }, [company, role, setValue]);

  const applyServerErrors = (error: unknown) => {
    const response = (error as AxiosError<ValidationErrorResponse<keyof ExperienceSchema>>).response?.data;
    if (!response?.errors) return;
    Object.entries(response.errors).forEach(([field, messages]) => {
      const message = messages?.[0];
      if (message) setError(field as keyof ExperienceSchema, { type: "server", message });
    });
  };

  const submit = (values: ExperienceSchema) => {
    clearErrors();
    const result = experienceSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ExperienceSchema | undefined;
        if (field) setError(field, { type: "validate", message: issue.message });
      });
      return;
    }
    onSubmit(values, applyServerErrors);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="border border-border bg-bg p-5 sm:p-7">
      {submitError && <Alert className="mb-6" color="error" message={submitError} />}
      <div className="grid gap-6 md:grid-cols-2">
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
        <Input
          id="slug"
          label="Slug"
          placeholder="company-role"
          required
          disabled={isSubmitting}
          errorMessage={errors.slug?.message}
          {...slugRegistration}
          onChange={(event) => {
            slugManuallyEdited.current = true;
            slugRegistration.onChange(event);
          }}
        />
        <Input id="location" label="Location" placeholder="Jakarta, Indonesia" required disabled={isSubmitting} errorMessage={errors.location?.message} {...register("location")} />
        <Input id="startDate" label="Start Date" type="date" required disabled={isSubmitting} errorMessage={errors.startDate?.message} {...register("startDate")} />
        <Input id="endDate" label="End Date" type="date" disabled={isSubmitting} errorMessage={errors.endDate?.message} {...register("endDate")} />
        <InfiniteSelect
          id="projectHighlightSlug"
          label="Project Highlight"
          placeholder="No project highlight"
          searchPlaceholder="Search project highlights…"
          clearable
          value={highlight}
          onChange={(option) => {
            setHighlight(option);
            setValue("projectHighlightSlug", option?.value ?? "", { shouldDirty: true, shouldValidate: true });
          }}
          options={highlightsQuery.data?.options ?? []}
          search={highlightSearch}
          onSearchChange={setHighlightSearch}
          isLoading={highlightsQuery.isLoading}
          isFetchingNextPage={highlightsQuery.isFetchingNextPage}
          isError={highlightsQuery.isError}
          hasNextPage={Boolean(highlightsQuery.hasNextPage)}
          onLoadMore={() => void highlightsQuery.fetchNextPage()}
          onRetry={() => void highlightsQuery.refetch()}
          errorMessage={errors.projectHighlightSlug?.message}
          disabled={isSubmitting}
        />
        <InfiniteSelect
          id="skillSlugs"
          label="Skills"
          placeholder="Select skills"
          searchPlaceholder="Search skills…"
          multiple
          value={skills}
          onChange={(options) => {
            setSkills(options);
            setValue("skillSlugs", options.map((option) => option.value), { shouldDirty: true, shouldValidate: true });
          }}
          options={skillsQuery.data?.options ?? []}
          search={skillSearch}
          onSearchChange={setSkillSearch}
          isLoading={skillsQuery.isLoading}
          isFetchingNextPage={skillsQuery.isFetchingNextPage}
          isError={skillsQuery.isError}
          hasNextPage={Boolean(skillsQuery.hasNextPage)}
          onLoadMore={() => void skillsQuery.fetchNextPage()}
          onRetry={() => void skillsQuery.refetch()}
          errorMessage={errors.skillSlugs?.message}
          disabled={isSubmitting}
        />
        <div className="md:col-span-2">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor id="description" label="Description" required disabled={isSubmitting} value={field.value} onChange={field.onChange} errorMessage={errors.description?.message} />
            )}
          />
        </div>
      </div>
      <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-border pt-5">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" variant="primary" loading={isSubmitting} loadingText={mode === "create" ? "Creating…" : "Saving…"}>
          {mode === "create" ? "Create Experience" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
