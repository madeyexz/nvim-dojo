import { notFound } from "next/navigation";
import ChallengeRunner from "@/components/ChallengeRunner";
import { moduleById, modules } from "@/lib/lessons";

export function generateStaticParams() {
  return modules.map((m) => ({ moduleId: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const mod = moduleById(moduleId);
  return { title: mod ? mod.title : "Not found" };
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const mod = moduleById(moduleId);
  if (!mod) notFound();
  return <ChallengeRunner key={mod.id} mod={mod} />;
}
