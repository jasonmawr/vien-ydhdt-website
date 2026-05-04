import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Clock, ChevronLeft, User, Tag, Paperclip, Download } from "lucide-react";
import Link from "next/link";
import { getPostBySlug } from "@/services/api";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

async function getPost(slug: string) {
  try {
    const post = await getPostBySlug(slug);
    return post;
  } catch (error) {
    return null;
  }
}

// Generate metadata cho SEO
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: 'news' });
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: t('articleNotFound'),
    };
  }

  // Use explicit meta fields if they exist, fallback to content
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt;
  const keywordsStr = post.keywords || post.tags;
  const keywords = keywordsStr ? keywordsStr.split(",").map(t => t.trim()) : [post.category_name || ""];

  return {
    title: title,
    description: description,
    keywords: keywords,
    openGraph: {
      title: title,
      description: description,
      type: "article",
      authors: [post.author || t('author')],
      images: post.thumbnail ? [post.thumbnail] : undefined,
    },
  };
}

export default async function ArticleDetailPage(props: Props) {
  const t = await getTranslations({ locale: (await props.params).locale, namespace: 'news' });
  const params = await props.params;
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header Back */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-40">
        <div className="container-site px-4 py-4">
          <Link href="/tin-tuc">
            <Button variant="ghost" className="text-stone-500 hover:text-primary-700 -ml-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('backToNews')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="container-site px-4 mt-8 max-w-4xl">
        <article className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Cover Image/Gradient placeholder */}
          <div className="h-64 md:h-80 lg:h-96 w-full bg-gradient-to-br from-primary-600 to-teal-500 relative">
             {post.thumbnail ? (
               <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
             ) : (
               <div className="absolute inset-0 bg-black/20" />
             )}
          </div>

          <div className="p-8 md:p-12 -mt-20 relative bg-white rounded-t-3xl mx-4 md:mx-10 shadow-lg">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-primary-50 text-primary-700 text-sm font-bold px-4 py-1.5 rounded-full">
                {post.category_name || "Chưa phân loại"}
              </span>
              {post.tags && (
                <span className="bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> {post.tags}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight mb-6">
              {post.title}
            </h1>

            {/* Metadata Info */}
            <div className="flex flex-wrap items-center gap-6 text-stone-500 text-sm font-medium pb-8 border-b border-stone-100 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-500" />
                {new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary-500" />
                {post.view_count} {t('views', { count: post.view_count })}
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary-500" />
                {post.author || t('author')}
              </div>
            </div>

            {/* Content (Prose) */}
            <div
              className="prose prose-stone max-w-none prose-headings:text-stone-800 prose-a:text-primary-600 hover:prose-a:text-primary-700 prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Attachments Section */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mt-12 pt-8 border-t border-stone-200">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-primary-600" />
                  Tài liệu đính kèm
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
                        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border border-stone-200 flex-shrink-0 text-primary-600">
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

          </div>
        </article>
      </div>
    </div>
  );
}
