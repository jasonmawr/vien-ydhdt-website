import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Clock, ChevronLeft, ChevronRight, User, Tag, Paperclip, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { getPostBySlug } from "@/services/api";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { sanitizeCmsHtml } from "@/lib/sanitize";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

async function getPost(slug: string) {
  try {
    return await getPostBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: 'news' });
  const post = await getPost(params.slug);

  if (!post) return { title: t('articleNotFound') };

  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt;
  const keywordsStr = post.keywords || post.tags;
  const keywords = keywordsStr ? keywordsStr.split(",").map((k: string) => k.trim()) : [post.category_name || ""];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://vienydhdt.gov.vn/tin-tuc/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://vienydhdt.gov.vn/tin-tuc/${params.slug}`,
      authors: [post.author || t('author')],
      images: post.thumbnail
        ? [{ url: post.thumbnail, width: 1200, height: 630 }]
        : [{ url: "https://vienydhdt.gov.vn/images/og-default.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ArticleDetailPage(props: Props) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: 'news' });
  const post = await getPost(params.slug);

  if (!post) notFound();

  const publishedDate = new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Trang chủ", url: "/" },
        { name: "Tin tức", url: "/tin-tuc" },
        { name: post.title, url: `/tin-tuc/${params.slug}` },
      ]} />
      {/* JSON-LD Article structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.published_at || post.created_at,
            dateModified: post.updated_at,
            author: { "@type": "Organization", name: post.author || "Viện Y Dược Học Dân Tộc" },
            publisher: {
              "@type": "Organization",
              name: "Viện Y Dược Học Dân Tộc TP.HCM",
              logo: { "@type": "ImageObject", url: "https://vienydhdt.gov.vn/images/logo.png" },
            },
            image: post.thumbnail || "https://vienydhdt.gov.vn/images/hero_medicine.png",
            mainEntityOfPage: { "@type": "WebPage", "@id": `https://vienydhdt.gov.vn/tin-tuc/${post.slug}` },
          }),
        }}
      />

      <div className="min-h-screen bg-stone-50 pb-20">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-stone-200 sticky top-16 z-40">
          <div className="container-site px-4 py-3 flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-primary-700 transition-colors">Trang chủ</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/tin-tuc" className="hover:text-primary-700 transition-colors">{t('backToNews').replace('Quay lại ', '')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-stone-700 font-medium truncate max-w-xs">{post.title}</span>
          </div>
          <div className="container-site px-4 pb-3">
            <Link href="/tin-tuc">
              <Button variant="ghost" size="sm" className="text-stone-500 hover:text-primary-700 -ml-3 h-8">
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t('backToNews')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="container-site px-4 mt-8 max-w-4xl">
          <article className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            {/* Cover Image */}
            <div className="h-64 md:h-80 lg:h-96 w-full bg-gradient-to-br from-primary-600 to-teal-500 relative">
              {post.thumbnail ? (
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-black/20" />
              )}
            </div>

            <div className="p-8 md:p-12 -mt-20 relative bg-white rounded-t-3xl mx-4 md:mx-10 shadow-lg">
              {/* Category & Tags */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-primary-50 text-primary-700 text-sm font-bold px-4 py-1.5 rounded-full">
                  {post.category_name || t('uncategorized')}
                </span>
                {post.tags && (
                  <span className="bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> {post.tags}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight mb-6">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-stone-100 mb-8">
                <div className="flex flex-wrap items-center gap-5 text-stone-500 text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary-500" />
                    {publishedDate}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary-500" />
                    {post.view_count} {t('views', { count: post.view_count })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary-500" />
                    {post.author || t('author')}
                  </div>
                </div>

                {/* Social Share */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                    <Share2 className="h-3.5 w-3.5" /> Chia sẻ:
                  </span>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://vienydhdt.gov.vn/tin-tuc/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877f2] text-white hover:opacity-90 transition-opacity"
                    aria-label="Chia sẻ Facebook"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href={`https://zalo.me/share/url?url=${encodeURIComponent(`https://vienydhdt.gov.vn/tin-tuc/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0068ff] text-white hover:opacity-90 transition-opacity"
                    aria-label="Chia sẻ Zalo"
                  >
                    <span className="text-[10px] font-black leading-none">Z</span>
                  </a>
                </div>
              </div>

              {/* Content */}
              <div
                className="prose prose-stone max-w-none prose-headings:text-stone-800 prose-a:text-primary-600 hover:prose-a:text-primary-700 prose-img:rounded-2xl prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(post.content) }}
              />

              {/* Attachments */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="mt-12 pt-8 border-t border-stone-200">
                  <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <Paperclip className="h-5 w-5 text-primary-600" />
                    {t('attachments')}
                  </h3>
                  <div className="grid gap-3">
                    {post.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 bg-stone-50 hover:bg-primary-50 border border-stone-200 hover:border-primary-200 rounded-xl transition-colors group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-stone-200 shrink-0 text-primary-600">
                            <Download className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-stone-800 truncate group-hover:text-primary-700 transition-colors">
                              {file.file_name}
                            </p>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {Math.round((file.file_size || 0) / 1024)} KB {file.file_type ? `• ${file.file_type}` : ''}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to news CTA */}
              <div className="mt-12 pt-8 border-t border-stone-100 flex justify-center">
                <Link href="/tin-tuc">
                  <Button variant="outline" className="rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t('backToNews')}
                  </Button>
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
