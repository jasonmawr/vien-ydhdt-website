import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Clock, ChevronLeft, User, Tag } from "lucide-react";
import Link from "next/link";
import { getPostBySlug } from "@/services/api";
import { Button } from "@/components/ui/button";

interface Props {
  params: {
    slug: string;
  };
}

// Lấy dữ liệu bài viết
async function getPost(slug: string) {
  try {
    const post = await getPostBySlug(slug);
    return post;
  } catch (error) {
    return null;
  }
}

// Generate metadata cho SEO (Phase 17)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  
  if (!post) {
    return {
      title: "Bài viết không tồn tại",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags ? post.tags.split(",").map(t => t.trim()) : [post.category],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      authors: [post.author || "Viện Y Dược Học Dân Tộc"],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
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
              Quay lại tin tức
            </Button>
          </Link>
        </div>
      </div>

      <div className="container-site px-4 mt-8 max-w-4xl">
        <article className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Cover Image/Gradient placeholder */}
          <div className="h-64 md:h-80 lg:h-96 w-full bg-gradient-to-br from-primary-600 to-teal-500 relative">
             <div className="absolute inset-0 bg-black/20" />
             {/* Thumbnail img could be placed here if post.thumbnail existed as valid URL */}
          </div>

          <div className="p-8 md:p-12 -mt-20 relative bg-white rounded-t-3xl mx-4 md:mx-10 shadow-lg">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-primary-50 text-primary-700 text-sm font-bold px-4 py-1.5 rounded-full">
                {post.category}
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
                {new Date(post.created_at).toLocaleDateString('vi-VN')}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary-500" />
                {post.view_count} lượt xem
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary-500" />
                {post.author || "Viện Y Dược"}
              </div>
            </div>

            {/* Content (Prose) */}
            <div 
              className="prose prose-stone max-w-none prose-headings:text-stone-800 prose-a:text-primary-600 hover:prose-a:text-primary-700 prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
