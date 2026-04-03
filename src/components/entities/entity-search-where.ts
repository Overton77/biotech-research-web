import type {
  LabTestWhere,
  OrganizationWhere,
  PanelDefinitionWhere,
  PersonWhere,
  ProductWhere,
  StudyWhere,
} from "@/gql/graphql";

function trimQ(q: string): string | undefined {
  const t = q.trim();
  return t.length ? t : undefined;
}

export function organizationSearchWhere(q: string): OrganizationWhere | undefined {
  const t = trimQ(q);
  if (!t) return undefined;
  return {
    OR: [
      { name: { contains: t } },
      { description: { contains: t } },
      { searchText: { contains: t } },
    ],
  };
}

export function productSearchWhere(q: string): ProductWhere | undefined {
  const t = trimQ(q);
  if (!t) return undefined;
  return {
    OR: [
      { name: { contains: t } },
      { description: { contains: t } },
      { searchText: { contains: t } },
    ],
  };
}

export function labTestSearchWhere(q: string): LabTestWhere | undefined {
  const t = trimQ(q);
  if (!t) return undefined;
  return {
    OR: [
      { name: { contains: t } },
      { description: { contains: t } },
      { searchText: { contains: t } },
    ],
  };
}

export function panelDefinitionSearchWhere(
  q: string,
): PanelDefinitionWhere | undefined {
  const t = trimQ(q);
  if (!t) return undefined;
  return {
    OR: [{ name: { contains: t } }, { description: { contains: t } }],
  };
}

export function personSearchWhere(q: string): PersonWhere | undefined {
  const t = trimQ(q);
  if (!t) return undefined;
  return {
    OR: [
      { name: { contains: t } },
      { description: { contains: t } },
      { title: { contains: t } },
      { bio: { contains: t } },
      { searchText: { contains: t } },
    ],
  };
}

export function studySearchWhere(q: string): StudyWhere | undefined {
  const t = trimQ(q);
  if (!t) return undefined;
  return {
    OR: [
      { name: { contains: t } },
      { description: { contains: t } },
      { searchText: { contains: t } },
    ],
  };
}
