import type { Company, Experience, ProjectHighlight, Skill } from "@/prisma/generated/prisma/client";

export type ExperienceWithRelations = Experience & {
  company: Company;
  projectHighlight: ProjectHighlight | null;
  skills: Skill[];
};

export type ExperienceListItem = ExperienceWithRelations & {
  descriptionText: string;
};

export type RelationOption = {
  value: string;
  label: string;
};

export type ExperienceRelationInput = {
  companySlug: string;
  projectHighlightSlug?: string | null;
  skillSlugs: string[];
};

type InfiniteSelectBaseProps = {
  id: string;
  label: string;
  placeholder: string;
  searchPlaceholder?: string;
  options: RelationOption[];
  search: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
};

export type InfiniteSelectProps = InfiniteSelectBaseProps &
  (
    | {
        multiple?: false;
        value: RelationOption | null;
        onChange: (value: RelationOption | null) => void;
      }
    | {
        multiple: true;
        value: RelationOption[];
        onChange: (value: RelationOption[]) => void;
      }
  );
