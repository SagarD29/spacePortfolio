import ArchiveShell from "@/components/archive/ArchiveShell";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  return <ArchiveShell searchParams={sp} />;
}
