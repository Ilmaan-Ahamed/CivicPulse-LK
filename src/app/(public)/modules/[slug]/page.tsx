import { notFound } from "next/navigation";
import { ModuleLanding } from "@/components/modules/module-landing";
import {
  getPlatformModule,
  PLATFORM_MODULE_LIST,
} from "@/lib/platform-modules";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PLATFORM_MODULE_LIST.map((mod) => ({ slug: mod.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const mod = getPlatformModule(slug);
  if (!mod) {
    return { title: "Module not found | CivicPulse LK" };
  }
  return {
    title: `${mod.title} | CivicPulse LK`,
    description: mod.shortDescription,
  };
}

export default async function PlatformModulePage({ params }: PageProps) {
  const { slug } = await params;
  const mod = getPlatformModule(slug);
  if (!mod) {
    notFound();
  }

  return <ModuleLanding module={mod} />;
}
