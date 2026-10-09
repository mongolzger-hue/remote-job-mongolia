# Ажлын зарын нэмэлт эх сурвалжууд

Шалгасан: 2026-10-09, Asia/Ulaanbaatar. Энэ бол эх сурвалжийн судалгаа; доорх сайтуудыг бүгдийг импортод холбосон гэсэн үг биш. Нээлттэй endpoint нь бүх агуулгыг дахин нийтлэх зөвшөөрөлтэй адил биш. Зар бүрийн улс, цагийн бүс, ажиллах эрх, хүчинтэй хугацааг тусад нь шалгана.

## Нэн түрүүнд ашиглах эх сурвалж

| Эх сурвалж | Хандалт ба нөхцөл | Монголд хэрэглэх шийдвэр |
|---|---|---|
| [Himalayas](https://himalayas.app/docs/remote-jobs-api) | Түлхүүргүй JSON, pagination, country/worldwide/timezone filters; эх сурвалжийг нэрлэж холбоос өгнө. Өгөгдөл 24 цагийн cache-тай тул өдөрт нэг sync хангалттай. | Хамгийн өндөр ач холбогдол. `locationRestrictions`, UTC+8, expiry, тайлбарын зөрчлийг шалгана. |
| [Jobicy](https://jobicy.com/jobs-rss-feed) | Түлхүүргүй API/RSS, сүүлийн 7 хоногийн зар, cursor pagination. Одоогийн Fair Use нь job discovery бүтээгдэхүүн зөвшөөрсөн. Source/canonical URL хадгалж, нэг цагаас ойр sync хийхгүй. | `geo=anywhere` болон Монголыг илт зөвшөөрсөн зарууд. Хуучин third-party тайлбараас бус одоогийн албан ёсны нөхцөлийг баримтална. |
| [Remote OK](https://remoteok.com/faq) | Нээлттэй JSON/RSS. Remote OK нэр, эх зарын direct follow link шаарддаг; logo ашиглахгүй. | Өмнө feed шалгасан, importer холбогдоогүй. Хоосон location эсвэл Remote гэдэг нь Worldwide биш. |
| [We Work Remotely](https://weworkremotely.com/remote-job-rss-feed) | RSS reuse нь attribution-тай зөвшөөрөгдсөн. | Холбогдсон. Worldwide RSS label нь тайлбартай зөрөх боломжтой тул бие даасан evidence шаардана. |
| [Remotive](https://github.com/remotive-com/remote-jobs-api) | Нээлттэй API, source attribution, source link болон polling/syndication нөхцөлтэй. | Холбогдсон. Одоогийн Mongolia screening хэвээр. |

### Энэ удаагийн бодит API шалгалт

- Himalayas `GET https://himalayas.app/jobs/api/search?worldwide=true&page=1`: HTTP 200; `totalCount=3046`, эхний хуудсанд 20 зар. 20/20 нь хоосон locationRestrictions, 17/20 нь UTC+8-ыг зөвшөөрсөн эсвэл timezone restriction байхгүй. 3,046 нь employer-confirmed Mongolia vacancies гэсэн үг биш. Бүх хуудас болон тайлбар/expiry шалгаагүй.
- Jobicy `GET https://jobicy.com/api/v2/remote-jobs?count=200&geo=anywhere`: HTTP 200; 18 зар, `hasMore=false`, applied filter нь anywhere. Эдгээр нь ур чадвар, хэл болон ажиллах цагийн нэмэлт шаардлагатай байж болно.
- Arbeitnow `GET https://www.arbeitnow.com/api/job-board-api`: HTTP 200; эхний response-д 325 зар. Монголд тохирох тоог гаргаагүй.
- JSON response-ууд ignored `.data/*-discovery.json` дотор хадгалагдсан. Энэ шалгалт live job store-д зар нэмээгүй.

## Бүртгэл, түлхүүр эсвэл эрхийн нэмэлт шалгалттай эх сурвалж

| Эх сурвалж | Батлагдсан боломж | Ашиглахын өмнөх нөхцөл |
|---|---|---|
| [Startup Jobs](https://startup.jobs/api) | Read-only API, remote filter; account/API key. Public feeds мөн тайлбарласан. | Feed/API reuse terms, quota болон улс бүрийг шалгах. |
| [Arbeitnow](https://www.arbeitnow.com/blog/free-job-posting-integrations) | Албан ёсны developer job board API; түлхүүргүй endpoint live. | [Нөхцөл](https://www.arbeitnow.com/terms) ба reuse scope шалгах; Germany/Europe ажлыг Монголд тохирно гэж үзэхгүй. |
| [The Muse](https://www.themuse.com/developers/api/v2) | Jobs/company API. | Testing-ээс цааш app registration шаардлагатай; [API terms](https://www.themuse.com/developers/api/v2/terms). |
| [Adzuna](https://developer.adzuna.com/overview) | Өөрийн сайт дээр jobs харуулах API, app_id/app_key. | Account/key, country coverage, quota, attribution болон commercial conditions. |
| [Jooble](https://jooblehelpcenter.freshdesk.com/en/support/solutions/articles/60001448238-rest-api-documentation) | REST API, улс тус бүрийн key. | Албан ёсны docs-д free key нь lifetime 500 requests; тогтмол sync-д тохиромжийг шалгах. |
| [Careerjet](https://www.careerjet.com/partners/publishers) | Publisher API/XML feeds. | Publisher account/key, гэрээ болон улс/remote filter шалгах. |
| [Reed](https://www.reed.co.uk/developers/jobseeker) | Jobseeker API, jobs search/detail. | Key, UK-oriented eligibility, usage terms. |
| [Findwork](https://www.findwork.dev/developers/) | Developer portal байна, login руу шилжсэн. | Account, үнэ/quota/republication нөхцөл одоогоор баталгаажаагүй. Давхардсан aggregator jobs их байж болно. |
| [Web3.career](https://web3.career/web3-jobs-api) | Албан ёсны Jobs API баримтжуулалт. | Key/plan/usage terms, region болон source attribution шалгах. |
| [jobdataapi](https://jobdataapi.com/docs/) | Jobs data API баримтжуулалт. | Auth/plan, redistribution license, cost шалгах; одоогийн MVP-д төлбөр нээхгүй. |
| [Techmap / Job Data Feeds](https://jobdatafeeds.com/job-api-overview) | Job API болон RSS бүтээгдэхүүн. | Free-tier хэмжээ ба commercial license шалгах; төлбөртэй subscription үүсгээгүй. |

## Компани бүрээс авах сувгууд

Эдгээр нь тус бүр нэг global job feed биш. Employer board token/slug болон employer-specific reuse нөхцөл хэрэгтэй. Нэг adapter-аар олон компанийн зар унших боломжтой ч API нээлттэй байх нь бүх employer агуулгад blanket republication license олгохгүй.

| Суваг | Баримтжуулалт | Шийдвэр |
|---|---|---|
| Greenhouse | [Job Board API](https://docs.greenhouse.io/job-board.html) | Published jobs GET нь auth шаардахгүй; board token бүрээр. |
| Lever | [Official Postings API](https://github.com/lever/postings-api) | Published employer jobs, remote/location/country fields; site slug бүрээр. |
| Ashby | [Public Job Postings API](https://developers.ashbyhq.com/docs/public-job-posting-api) | Employer public board API; listed jobs, workplace/country/compensation fields шалгах. Private `jobPosting.list` API-тай андуурахгүй. |
| Recruitee | [Careers Site API](https://docs.recruitee.com/reference/offers) | Employer subdomain дахь published offers; terms/reuse шалгах. |
| SmartRecruiters | [Posting API](https://developers.smartrecruiters.com/docs/posting-api) | Company-scoped posting API ба partner job-board feed ялгаатай. Auth/partner access-ийг баталгаажуулсны дараа. |
| Teamtailor | [Partner / Job Board API](https://partner.teamtailor.com/) | [Public API](https://docs.teamtailor.com/) мөн бий. Employer/partner key болон эрхийн scope шаардлагыг шалгах. |

## Шууд компанийн зар хайх боломжууд

Доорх хуудсууд албан ёсны боловч бүх ажлыг Монголоос хийж болно гэсэн баталгаа биш. Компани бүрийн current opening-ийг шалгаж, employer source URL-ыг хадгална.

1. [Canonical](https://canonical.com/careers/all) — `Home based - Worldwide` ажлууд байдаг; APAC/EMEA/US гэсэн тусдаа заруудыг ялгана. Greenhouse board мөн бий.
2. [Automattic](https://automattic.com/work-with-us/jobs/) — work-from-anywhere зарчимтай; бодит нээлттэй role болон travel/region conditions шалгана, talent community-г job vacancy гэж тоолохгүй.
3. [Buffer](https://buffer.com/journey) — fully remote team; тухайн зарын цаг/улсын нөхцөл шалгана.
4. [Zapier](https://zapier.com/jobs) — remote careers; role-specific country eligibility шалгана.
5. [Todoist / Doist](https://www.todoist.com/careers) — remote employer careers; opening/region/timezone шалгана.
6. [Toggl](https://toggl.com/jobs) — remote careers; зар бүрийн location restriction шалгана.

## Нэмэлт discovery; feed reuse баталгаажаагүй

- [Real Work From Anywhere](https://www.realworkfromanywhere.com/) — worldwide-focused jobs; API/RSS/republication agreement олж баталгаажуулаагүй. Employer original links-ийн discovery-д ашиглаж болно.
- [Working Nomads](https://www.workingnomads.com/jobs) — remote listings; одоогийн official reusable API/feed/license баталгаажаагүй.
- [Python.org Jobs](https://www.python.org/jobs/) — tech employer postings; remote/location/source rights тусад нь шалгах.
- [Remote jobs board](https://remote.com/jobs) — discovery боломжтой; HR/payroll Remote API нь public vacancy feed-тэй адил биш.
- [Dynamite Jobs](https://dynamitejobs.com/developers/) — official company API нь зөвхөн тухайн компанийн jobs/applicants; public board ingestion API гэж ашиглахгүй.
- Career Nest-ийн өмнө сурталчилсан API docs URL одоо parked domain болж харагдсан; эх сурвалжид нэмэхгүй.

## Хэрэгжүүлэх дараалал

1. Himalayas adapter: explicit country/worldwide + UTC+8 + expiry + description screening; 24h cache, pagination completeness, visible source links.
2. Jobicy adapter: anywhere/Mongolia + full description contradictions; >=1h cache, cursor pagination, source link.
3. Remote OK adapter: explicit worldwide evidence only, follow attribution, missing location => review.
4. Canonical зэрэг employer feeds: source permissions болон hiring conditions баталгаажуулаад board-by-board нэмэх.
5. Cross-source company/title/application URL deduplication, expiry болон partial-feed safety. Хэсэгчилсэн page таталтаар бусад идэвхтэй зарыг inactive болгохгүй.

100 идэвхтэй, давхардалгүй Монголд тохирох зарын зорилт биелсэн эсэхийг импорт ба бүрэн screening дууссаны дараа тоолно. Source-level total-ыг public eligible count гэж харуулахгүй. Энэ судалгаагаар шинэ importer нэмээгүй, төлбөр/бүртгэл үүсгээгүй, хүн рүү хүсэлт илгээгээгүй.
