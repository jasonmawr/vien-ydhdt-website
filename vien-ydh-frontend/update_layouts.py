import os

def rewrite_layout(filepath, title_key, title_prefix, desc_prefix):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}")
        return
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(f"""import type {{ Metadata }} from "next";
import {{ getTranslations }} from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {{
  const tTitle = await getTranslations('{title_prefix}');
  const tDesc = await getTranslations('{desc_prefix}');
  const tMeta = await getTranslations('metadata');
  
  return {{
    title: `${{tTitle('{title_key}')}} - ${{tMeta('siteName')}}`,
    description: tDesc('subtitle'),
  }};
}}

export default function Layout({{ children }}: {{ children: React.ReactNode }}) {{
  return children;
}}
""")

rewrite_layout(r'f:\HAILEO\My Project\vien-ydhdt-website\vien-ydh-frontend\src\app\tin-tuc\layout.tsx', 'news', 'nav', 'news')
rewrite_layout(r'f:\HAILEO\My Project\vien-ydhdt-website\vien-ydh-frontend\src\app\lien-he\layout.tsx', 'contact', 'nav', 'contact.hero')
rewrite_layout(r'f:\HAILEO\My Project\vien-ydhdt-website\vien-ydh-frontend\src\app\gioi-thieu\layout.tsx', 'about', 'nav', 'about.hero')
rewrite_layout(r'f:\HAILEO\My Project\vien-ydhdt-website\vien-ydh-frontend\src\app\tra-cuu\layout.tsx', 'title', 'search', 'search')
rewrite_layout(r'f:\HAILEO\My Project\vien-ydhdt-website\vien-ydh-frontend\src\app\bang-gia\layout.tsx', 'title', 'pricing', 'pricing')
