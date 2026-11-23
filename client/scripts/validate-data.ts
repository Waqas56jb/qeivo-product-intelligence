/**
 * Validates the Qeivo seed data: cross-references, minimum counts and basic sanity.
 * Run: npx tsx scripts/validate-data.ts
 */
import * as D from "@/data";

const errors: string[] = [];
const warnings: string[] = [];
const fail = (msg: string) => errors.push(msg);
const check = (cond: boolean, msg: string) => {
  if (!cond) fail(msg);
};

const productIds = new Set(D.products.map((p) => p.id));
const productSlugs = new Set(D.products.map((p) => p.slug));
const sourceIds = new Set(D.sources.map((s) => s.id));
const creatorIds = new Set(D.creators.map((c) => c.id));
const videoSlugs = new Set(D.videos.map((v) => v.slug));
const guideSlugs = new Set(D.buyingGuides.map((g) => g.slug));
const questionSlugs = new Set(D.questions.map((q) => q.slug));
const questionIdSet = new Set(D.questions.map((q) => q.id));
const replyIds = new Set(D.replies.map((r) => r.id));
const reviewIds = new Set(D.reviews.map((r) => r.id));
const memberIds = new Set(D.workspaceMembers.map((m) => m.id));
const companyIds = new Set(D.companies.map((c) => c.id));
const brandNames = new Set(D.brands.map((b) => b.name));
const submissionIds = new Set(D.submissions.map((s) => s.id));

const registryImages = new Set<string>([
  ...Object.values(D.images).flatMap((list) => [...list]),
  ...D.avatars,
  ...D.products.flatMap((p) => p.images),
]);

const prod = (id: string, where: string) => check(productIds.has(id), `${where}: unknown productId ${id}`);
const src = (id: string, where: string) => check(sourceIds.has(id), `${where}: unknown sourceId ${id}`);
const img = (url: string, where: string) => check(registryImages.has(url), `${where}: image not in registry ${url}`);
const date = (iso: string, where: string, max = "2026-11-23T23:59:59Z") => {
  check(!Number.isNaN(Date.parse(iso)), `${where}: invalid date ${iso}`);
  if (iso > max) fail(`${where}: date ${iso} is after the demo date`);
};
const unique = (ids: string[], what: string) => {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) fail(`${what}: duplicate id ${id}`);
    seen.add(id);
  }
};
const noJunk = (label: string, value: unknown) => {
  const text = JSON.stringify(value);
  if (/\bundefined\b|\bNaN\b/.test(text) || /lorem ipsum|sample text/i.test(text)) fail(`${label}: contains undefined/NaN/placeholder text`);
};

/* ---------------------------------------------------------------- Products */
const byCat = (c: string) => D.products.filter((p) => p.category === c);
check(byCat("refrigerators").length >= 40, `≥40 refrigerators (have ${byCat("refrigerators").length})`);
for (const c of ["washing-machines", "televisions", "laptops"]) check(byCat(c).length >= 8, `≥8 ${c} (have ${byCat(c).length})`);
const fridgeBrands = new Set(byCat("refrigerators").map((p) => p.brandId));
check(fridgeBrands.size >= 8, `≥8 fridge brands (have ${fridgeBrands.size})`);
unique(D.products.map((p) => p.id), "products");
for (const p of D.products) for (const s of p.sourceIds) src(s, `product ${p.id}`);

/* ---------------------------------------------------------------- Sources */
unique(D.sources.map((s) => s.id), "sources");
for (const s of D.sources) for (const pid of s.productIds) prod(pid, `source ${s.id}`);

/* ---------------------------------------------------------------- Reviews */
check(D.reviews.length >= 150, `≥150 reviews (have ${D.reviews.length})`);
unique(D.reviews.map((r) => r.id), "reviews");
for (const r of D.reviews) {
  prod(r.productId, `review ${r.id}`);
  date(r.date, `review ${r.id}`);
  r.photos.forEach((u) => img(u, `review ${r.id}`));
  if (r.videoThumbnail) img(r.videoThumbnail, `review ${r.id}`);
  img(r.authorAvatar, `review ${r.id} avatar`);
  check(r.rating >= 1 && r.rating <= 5, `review ${r.id}: rating out of range`);
}
for (const p of D.products) {
  const rs = D.reviewsForProduct(p.id);
  const min = p.category === "refrigerators" ? 3 : 2;
  check(rs.length >= min, `product ${p.id}: needs ≥${min} reviews (has ${rs.length})`);
  if (rs.length) {
    const avg = rs.reduce((s, r) => s + r.rating, 0) / rs.length;
    if (Math.abs(avg - p.rating) > 0.6) warnings.push(`product ${p.id}: displayed review average ${avg.toFixed(2)} vs rating ${p.rating}`);
  }
  const dist = D.ratingDistribution(p.id);
  check(dist.reduce((s, b) => s + b.count, 0) === p.reviewCount, `ratingDistribution ${p.id}: counts do not sum to reviewCount`);
  const sent = D.sentimentSummary(p.id);
  check(sent.positive + sent.mixed + sent.negative === 100, `sentimentSummary ${p.id}: percentages do not sum to 100`);
}

/* ---------------------------------------------------------------- Creators & submissions */
check(D.creators.length >= 12, `≥12 creators (have ${D.creators.length})`);
check(D.creators.some((c) => c.id === "cr-maya" && c.name === "Maya Okafor"), "creator cr-maya / Maya Okafor missing");
unique(D.creators.map((c) => c.id), "creators");
check(D.submissions.length >= 18, `≥18 submissions (have ${D.submissions.length})`);
check(D.submissions.filter((s) => s.creatorId === "cr-maya").length >= 8, "≥8 submissions for cr-maya");
unique(D.submissions.map((s) => s.id), "submissions");
for (const s of D.submissions) {
  check(creatorIds.has(s.creatorId), `submission ${s.id}: unknown creator ${s.creatorId}`);
  s.productIds.forEach((pid) => prod(pid, `submission ${s.id}`));
  img(s.thumbnail, `submission ${s.id}`);
  if (s.sponsored) check(!!s.sponsor, `submission ${s.id}: sponsored without sponsor`);
}

/* ---------------------------------------------------------------- Videos */
check(D.videos.length >= 30, `≥30 videos (have ${D.videos.length})`);
unique(D.videos.map((v) => v.id), "videos");
unique(D.videos.map((v) => v.slug), "video slugs");
for (const v of D.videos) {
  check(creatorIds.has(v.creatorId), `video ${v.slug}: unknown creator ${v.creatorId}`);
  v.productIds.forEach((pid) => prod(pid, `video ${v.slug}`));
  img(v.thumbnail, `video ${v.slug}`);
  date(v.publishedAt, `video ${v.slug}`);
  check(v.chapters.length >= 4 && v.chapters.length <= 7, `video ${v.slug}: 4–7 chapters`);
  check(v.transcript.length >= 8 && v.transcript.length <= 14, `video ${v.slug}: 8–14 transcript lines`);
  check(v.transcript.every((t) => t.seconds <= v.durationSeconds), `video ${v.slug}: transcript beyond duration`);
  if (v.sponsored) check(!!v.disclosure, `video ${v.slug}: sponsored without disclosure`);
}
check(!D.videos.some((v) => v.kind === "installation" && v.productIds.includes("p-nordvik-column-c400")), "C400 must have no installation video (content gap)");

/* ---------------------------------------------------------------- Guides */
check(D.buyingGuides.length >= 20, `≥20 buying guides (have ${D.buyingGuides.length})`);
check(D.buyingGuides.filter((g) => g.category === "refrigerators").length >= 10, "≥10 refrigerator guides");
check(D.buyingGuides.filter((g) => g.featured).length === 4, "exactly 4 featured guides");
unique(D.buyingGuides.map((g) => g.slug), "guide slugs");
for (const g of D.buyingGuides) {
  g.relatedProductIds.forEach((pid) => prod(pid, `guide ${g.slug}`));
  g.relatedGuideSlugs.forEach((s) => check(guideSlugs.has(s), `guide ${g.slug}: unknown related guide ${s}`));
  g.sourceIds.forEach((s) => src(s, `guide ${g.slug}`));
  img(g.heroImage, `guide ${g.slug}`);
  check(g.sections.length >= 4 && g.sections.length <= 7, `guide ${g.slug}: 4–7 sections`);
}
check(D.diyGuides.length >= 16, `≥16 DIY guides (have ${D.diyGuides.length})`);
for (const cat of ["installation", "setup", "cleaning", "maintenance", "troubleshooting", "parts", "safety"]) {
  check(D.diyGuides.filter((g) => g.category === cat).length >= 2, `≥2 DIY guides in ${cat}`);
}
for (const g of D.diyGuides) {
  g.productIds.forEach((pid) => prod(pid, `diy ${g.slug}`));
  if (g.videoSlug) check(videoSlugs.has(g.videoSlug), `diy ${g.slug}: unknown video ${g.videoSlug}`);
  img(g.image, `diy ${g.slug}`);
  check(g.steps.length >= 5 && g.steps.length <= 9, `diy ${g.slug}: 5–9 steps`);
}

/* ---------------------------------------------------------------- Community */
check(D.questions.length >= 25, `≥25 questions (have ${D.questions.length})`);
unique(D.questions.map((q) => q.slug), "question slugs");
unique(D.replies.map((r) => r.id), "replies");
check(D.questions.filter((q) => q.replies.some((r) => r.role === "manufacturer")).length >= 8, "≥8 questions with manufacturer replies");
for (const q of D.questions) {
  q.productIds.forEach((pid) => prod(pid, `question ${q.slug}`));
  date(q.date, `question ${q.slug}`);
  check(q.replies.length >= 1 && q.replies.length <= 6, `question ${q.slug}: 1–6 replies`);
  check(q.hasOfficialReply === q.replies.some((r) => r.role === "manufacturer"), `question ${q.slug}: hasOfficialReply inconsistent`);
  for (const r of q.replies) {
    check(r.questionId === q.id, `reply ${r.id}: questionId mismatch`);
    if (r.role === "manufacturer") check(!!r.company && brandNames.has(r.company), `reply ${r.id}: manufacturer company must be a brand`);
    date(r.date, `reply ${r.id}`);
  }
}

/* ---------------------------------------------------------------- Users & companies */
check(D.currentUser.id === "u-alex", "currentUser must be u-alex");
check(D.customers.length >= 11, "≥10 other customers");
check(companyIds.has("co-nordvik") && companyIds.has("co-larder"), "co-nordvik and co-larder must exist");
check(D.teamMembers.length >= 14, "≥14 team members");
check(D.teamMembers.filter((m) => m.companyId === "co-nordvik").length >= 6, "≥6 Nordvik team members");
D.teamMembers.forEach((m) => check(companyIds.has(m.companyId), `team ${m.id}: unknown company ${m.companyId}`));
for (const r of D.retailers) if (r.supplierId) check(companyIds.has(r.supplierId), `retailer ${r.id}: unknown supplier ${r.supplierId}`);

/* ---------------------------------------------------------------- Research */
const folderIds = new Set(D.researchFolders.map((f) => f.id));
check(D.researchFolders.length >= 4 && D.savedProducts.length >= 10 && D.productNotes.length >= 6, "research minimums");
D.savedProducts.forEach((s) => {
  prod(s.productId, "savedProduct");
  check(folderIds.has(s.folderId), `savedProduct ${s.productId}: unknown folder ${s.folderId}`);
});
D.productNotes.forEach((n) => prod(n.productId, `note ${n.id}`));
check(D.savedComparisons.length >= 4, "≥4 comparisons");
D.savedComparisons.forEach((c) => c.productIds.forEach((pid) => prod(pid, `comparison ${c.id}`)));
check(D.ownedProducts.length >= 4, "≥4 owned products");
for (const o of D.ownedProducts) {
  prod(o.productId, `owned ${o.id}`);
  const p = D.getProduct(o.productId);
  if (p) {
    const expected = `${Number(o.purchaseDate.slice(0, 4)) + p.warranty.years}${o.purchaseDate.slice(4)}`;
    check(o.warrantyExpires === expected, `owned ${o.id}: warranty ${o.warrantyExpires} ≠ ${expected}`);
  }
}
check(D.priceWatches.length >= 5, "≥5 price watches");
D.priceWatches.forEach((w) => prod(w.productId, "priceWatch"));

/* ---------------------------------------------------------------- Conversations */
check(D.conversations.length >= 6, "≥6 conversations");
for (const c of D.conversations) {
  c.productIds.forEach((pid) => prod(pid, `conversation ${c.id}`));
  check(c.messages.length >= 2 && c.messages.length <= 6, `conversation ${c.id}: 2–6 messages`);
  for (const m of c.messages) {
    if (m.role === "assistant") {
      check(!!m.blocks?.length, `message ${m.id}: assistant message needs blocks`);
      m.blocks?.forEach((b) => b.sourceIds.forEach((s) => src(s, `message ${m.id}`)));
      m.productIds?.forEach((pid) => prod(pid, `message ${m.id}`));
    }
  }
}

/* ---------------------------------------------------------------- Documents */
check(D.documents.length >= 10, "≥10 documents");
check(D.documents.flatMap((d) => d.extractions).filter((e) => e.status === "contradiction").length >= 3, "≥3 contradiction extractions");
for (const d of D.documents) {
  prod(d.productId, `document ${d.id}`);
  check(d.extractions.length >= 6 && d.extractions.length <= 10, `document ${d.id}: 6–10 extractions`);
  check(d.previewPages.length >= 3 && d.previewPages.length <= 4, `document ${d.id}: 3–4 preview pages`);
}

/* ---------------------------------------------------------------- Billing */
check(D.plans.length === 4, "4 plans");
check(D.invoices.length >= 10 && D.orgInvoices.length >= 6, "invoice minimums");
check(!!D.getInvoice("inv-2026-011"), "inv-2026-011 must exist");

/* ---------------------------------------------------------------- Workspace */
check(D.workspaceMembers.length >= 8, "≥8 workspace members");
check(D.projects.length >= 6, "≥6 projects");
for (const p of D.projects) {
  check(memberIds.has(p.owner), `project ${p.id}: unknown owner ${p.owner}`);
  p.memberIds.forEach((m) => check(memberIds.has(m), `project ${p.id}: unknown member ${m}`));
  p.productIds.forEach((pid) => prod(pid, `project ${p.id}`));
  [...p.comments, ...p.approvals, ...p.activity].forEach((x) => check(memberIds.has(x.memberId), `project ${p.id}: unknown member ${x.memberId}`));
}

/* ---------------------------------------------------------------- API */
check(D.apiKeys.length >= 6, "≥6 API keys");
check(D.apiKeys.every((k) => k.prefix.endsWith("…") && k.prefix.length <= 14), "API keys must be masked prefixes");
check(D.apiUsage.length === 90 && D.apiUsage[89].date === "2026-11-23", "90 usage days ending 2026-11-23");

/* ---------------------------------------------------------------- Notifications */
check(D.notifications.length >= 20, "≥20 notifications");
check(new Set(D.notifications.map((n) => n.kind)).size === 6, "all notification kinds");
for (const n of D.notifications) {
  if (n.productId) prod(n.productId, `notification ${n.id}`);
  const prodMatch = n.href.match(/^\/app\/products\/(.+)$/);
  if (prodMatch) check(productSlugs.has(prodMatch[1]), `notification ${n.id}: unknown product slug ${prodMatch[1]}`);
  const qMatch = n.href.match(/^\/app\/community\/(.+)$/);
  if (qMatch) check(questionSlugs.has(qMatch[1]), `notification ${n.id}: unknown question slug ${qMatch[1]}`);
  check(n.href.startsWith("/app"), `notification ${n.id}: href must be an app route`);
}

/* ---------------------------------------------------------------- Data ops & admin */
check(D.importHistory.length >= 10, "≥10 imports");
check(D.revisions.length >= 30, `≥30 revisions (have ${D.revisions.length})`);
for (const r of D.revisions) {
  prod(r.productId, `revision ${r.id}`);
  src(r.sourceId, `revision ${r.id}`);
}
check(D.auditLog.length >= 15, "≥15 audit entries");
for (const r of D.contentReports) {
  if (r.productId) prod(r.productId, `report ${r.id}`);
  const ok =
    (r.targetKind === "review" && reviewIds.has(r.targetId)) ||
    (r.targetKind === "question" && questionIdSet.has(r.targetId)) ||
    (r.targetKind === "reply" && replyIds.has(r.targetId)) ||
    (r.targetKind === "video" && videoSlugs.has(r.targetId));
  check(ok, `report ${r.id}: unknown ${r.targetKind} ${r.targetId}`);
}

/* ---------------------------------------------------------------- Analytics */
check(D.manufacturerWeekly.length === 26, "26 manufacturer weeks");
D.productPerformance.forEach((r) => {
  prod(r.productId, "productPerformance");
  prod(r.topCompetitorId, "productPerformance competitor");
});
D.contentGaps.forEach((g) => prod(g.productId, `gap ${g.id}`));
check(D.supplierDaily.length === 30, "30 supplier days");
D.offerPerformance.forEach((o) => prod(o.productId, `offer ${o.offerId}`));
check(D.creatorWeekly.length === 26, "26 creator weeks");
D.contentPerformance.forEach((c) => check(submissionIds.has(c.submissionId), `contentPerformance: unknown submission ${c.submissionId}`));

/* ---------------------------------------------------------------- Junk scan */
const scan: [string, unknown][] = [
  ["reviews", D.reviews], ["videos", D.videos], ["guides", D.buyingGuides], ["diy", D.diyGuides], ["questions", D.questions],
  ["conversations", D.conversations], ["documents", D.documents], ["projects", D.projects], ["notifications", D.notifications],
  ["revisions", D.revisions], ["submissions", D.submissions], ["creators", D.creators],
];
scan.forEach(([label, value]) => noJunk(label, value));

/* ---------------------------------------------------------------- Summary */
const summary: [string, number][] = [
  ["products", D.products.length], ["refrigerators", byCat("refrigerators").length], ["fridge brands", fridgeBrands.size],
  ["sources", D.sources.length], ["reviews", D.reviews.length], ["creators", D.creators.length], ["submissions", D.submissions.length],
  ["videos", D.videos.length], ["buying guides", D.buyingGuides.length], ["DIY guides", D.diyGuides.length], ["questions", D.questions.length],
  ["replies", D.replies.length], ["customers", D.customers.length], ["companies", D.companies.length], ["team members", D.teamMembers.length],
  ["saved products", D.savedProducts.length], ["comparisons", D.savedComparisons.length], ["owned products", D.ownedProducts.length],
  ["conversations", D.conversations.length], ["documents", D.documents.length], ["invoices (user/org)", D.invoices.length + D.orgInvoices.length],
  ["projects", D.projects.length], ["API keys", D.apiKeys.length], ["notifications", D.notifications.length], ["imports", D.importHistory.length],
  ["revisions", D.revisions.length], ["audit entries", D.auditLog.length], ["content reports", D.contentReports.length],
];
console.log("Qeivo data summary");
for (const [k, v] of summary) console.log(`  ${k.padEnd(22)} ${v}`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log(`  ! ${w}`));
}
if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s):`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log("\n✓ All data checks passed");
