import { notFound, redirect } from "next/navigation";
import { getProductBySlug, products } from "@/lib/products";

type LegacyBikePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function LegacyBikeDetailPage({ params }: LegacyBikePageProps) {
  const { slug } = await params;
  if (!getProductBySlug(slug)) notFound();
  redirect(`/products/${slug}`);
}
