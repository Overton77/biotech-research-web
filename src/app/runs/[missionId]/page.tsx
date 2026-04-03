import { redirect } from "next/navigation";

export default async function LegacyRunRedirectPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  redirect(`/dashboard/missions/${missionId}`);
}
