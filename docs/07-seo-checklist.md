# Бичлэгийн SEO checklist

2026-10-09. [Хэрэглэгчийн илгээсэн бичлэг](https://www.facebook.com/reel/1096331262861128)-ийн дэлгэц дээрх зургаан зөвлөмжийг төслийн ажиллагаатай тулгав. Дууг бүрэн сонссон гэж батлаагүй.

| Зөвлөмж | Remote Job Mongolia |
|---|---|
| Public page noindex байхгүй эсэх | Homepage, approved active job details, post/privacy/terms index зөвшөөрнө. Admin/API болон filtered search зориуд noindex. |
| Meta title | Server-generated bilingual болон job-specific titles. |
| Meta description | Server-generated bilingual descriptions. |
| sitemap.xml | Public routes болон approved active jobs, bilingual URLs/alternates. |
| Canonical tags | Language-specific canonical; filters үндсэн хуудсанд canonical заана. |
| Нэг үндсэн H1 | Public page template-үүдийг smoke script шалгана. |
| robots.txt | Public crawl allow, admin/API disallow, configured origin-тай sitemap reference. |

`node scripts/seo-smoke.mjs` нь ажиллаж байгаа local server-ийн response HTML дээр metadata/H1/robots болон sitemap-ийг шалгана. `SMOKE_BASE_URL` тохируулж staging дээр ажиллуулж болно. Энэ нь Google indexing, rich results эсвэл ranking-ийг баталдаг тест биш.

Noindex-ийг бүх хуудсаас бөөнөөр арилгахгүй. [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing)-ийн дагуу robots.txt нь crawl control бөгөөд noindex-ийг орлохгүй. Админы бодит хамгаалалт нь authentication; robots rules нууцлалын хамгаалалт биш.

Нийтэд гарахад actual HTTPS SITE_URL, Supabase, support contact, Search Console ownership болон sitemap submission шаардлагатай. Localhost-ыг Google public indexing хийлгэх боломжгүй. Imported jobs дээр source permission шалгалгүй JobPosting syndication нэмэхгүй.
