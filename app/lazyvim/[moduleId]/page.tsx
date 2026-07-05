import { notFound } from "next/navigation";
import WorkspaceRunner from "@/components/WorkspaceRunner";
import { lvModuleById, lvModules } from "@/lib/lazyvim";

export function generateStaticParams() {
  return lvModules.map((m) => ({ moduleId: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const mod = lvModuleById(moduleId);
  return { title: mod ? `LazyVim: ${mod.title}` : "Not found" };
}

export default async function LazyVimPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const mod = lvModuleById(moduleId);
  if (!mod) notFound();
  return <WorkspaceRunner key={mod.id} mod={mod} />;
}
