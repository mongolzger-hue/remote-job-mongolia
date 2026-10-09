# 3. Хуудас ба хэрэглэгчийн урсгал

## Ажил хайгч

`/?lang=mn` эсвэл `/?lang=en` → keyword/category/remote filter → job card → `/jobs/[id]` → eligibility, working hours, salary, source үзэх → external application link. Гаднын сайт дээр өргөдөл өгнө; манай сайт өргөдөл илгээгдсэн эсэхийг мэдэхгүй.

Хайлтад үр дүнгүй үед empty state, filter арилгах үйлдэл. Hidden job ID бол 404. Language switch нь URL-ыг хадгалж document language-ийг бүрэн page navigation-аар шинэчилнэ.

## Membership MVP

Homepage `#membership` → идэвхтэй зарын Хадгалах → Saved/Applied/Interview/Offer төлөв → Арилгах. Төлөв нь өөрөө тэмдэглэсэн мэдээлэл. Reload persistence, хоёр хэл, storage unavailable, stale IDs болон mobile UI-г browser дээр шалгах шаардлагатай хэвээр. Clear site data хийвэл мэдээлэл устна; төхөөрөмж хооронд sync байхгүй. Email alerts нь Coming soon, signup эсвэл илгээх үйлдэлгүй.

## Ажил олгогч

`/post` → required fields → validation → submit → pending confirmation. Хүчингүй URL/дутуу талбар => form error. Too-fast/honeypot/rate limit => server rejection. Pending зар approve хүртэл public board-д гарахгүй.

## Админ

`/admin` → username/password/TOTP → session → pending/approved list → approve/edit/delete. Delete confirmation-ын дараа mutation; logout session revoke. Invalid credentials/replayed code/rate limit нь rejected login. Production incomplete admin config нэвтрүүлэхгүй.

Import Remotive эсвэл WWR → protected endpoint → cache/feed/schema validation → screening/dedupe → published/review/excluded summary → list refresh. Source failure үед хуурамч амжилт харуулахгүй. Шинэ API хараахан холбогдоогүй.

## Нууцлал ба нөхцөл

Footer → `/privacy`, `/terms`. Operator contact тохируулсан үед харагдана. Нийтэд гаргахын өмнө бодит retention ба support contact-ийг шийднэ.
