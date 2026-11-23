import { apiScopes } from "@/data/api/keys";
import { errorDistribution } from "@/data/api/usage";
import { getProduct } from "@/data/products";
import type { Product } from "@/types";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { PreviewNotice } from "./api-bits";
import { CodeBlock } from "./code-block";
import { API_BASE } from "./dev-data";
import { DocSectionBlock, DocsLayout, EndpointCard, InlineCode, type DocSection } from "./docs-ui";
import { analysisResource, compareResource, json, productResource, requestExamples, sampleProduct } from "./examples";

const SECTIONS: DocSection[] = [
  { id: "introduction", label: "Introduction" },
  { id: "authentication", label: "Authentication" },
  { id: "products", label: "Products" },
  { id: "comparisons", label: "Comparisons" },
  { id: "analysis", label: "Analysis" },
  { id: "errors", label: "Errors" },
  { id: "rate-limits", label: "Rate limits" },
  { id: "sdks", label: "SDKs" },
];

const ERROR_HELP: Record<number, { code: string; fix: string }> = {
  400: { code: "invalid_parameter", fix: "Check parameter names and types against the reference." },
  401: { code: "invalid_api_key", fix: "Send a valid, unrevoked key in the Authorization header." },
  403: { code: "scope_not_granted", fix: "Create a key with the scope this endpoint lists." },
  404: { code: "resource_not_found", fix: "Confirm the id — product ids look like p-nordvik-frostline-fd600." },
  422: { code: "unprocessable_dimensions", fix: "Dimensions must be positive millimetre values within range." },
  429: { code: "rate_limited", fix: "Back off and retry after the Retry-After header." },
  500: { code: "internal_error", fix: "Retry with exponential backoff; contact support with the request id." },
  503: { code: "service_unavailable", fix: "Temporary. Retry with backoff and check the status page." },
};

function Callout({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "brand" }) {
  return <div className={tone === "brand" ? "rounded-[14px] border border-brand/25 bg-brand-soft/40 px-4 py-3 text-[14px] text-foreground" : "rounded-[14px] border border-border bg-surface-2/60 px-4 py-3 text-[14px] text-foreground"}>{children}</div>;
}

export function ApiDocs() {
  const product = sampleProduct();
  const second = getProduct("p-halden-precision-fd590") as Product;
  const list = {
    object: "list",
    data: [product, second].map((p) => {
      const r = productResource(p);
      return { id: r.id, object: r.object, name: r.name, category: r.category, price: r.price, suitability: { score: r.suitability.score, scale: 10 }, evidence: { coverage: r.evidence.coverage, freshness: r.evidence.freshness } };
    }),
    has_more: true,
    next_cursor: "cur_2f9a",
  };
  const compareIds = [product.id, second.id, "p-ovea-eco-fd520"];
  const errorExample = { error: { type: "invalid_request", code: "resource_not_found", message: "No product with id 'p-nordvik-frostline-fd700'.", status: 404, request_id: "req_7k2m9x" } };

  return (
    <PageContainer size="wide">
      <PageHeader eyebrow="Developer" title="API documentation" description="REST endpoints for product records, comparisons and evidence-backed analysis. JSON over HTTPS." />
      <PreviewNotice className="mb-8" />
      <DocsLayout sections={SECTIONS}>
        <div className="space-y-12">
          <DocSectionBlock id="introduction" title="Introduction" eyebrow="Getting started">
            <p>
              The Qeivo API gives your systems the same product intelligence the app shows: normalised specifications, prices, a <strong>suitability score</strong> and an <strong>evidence coverage</strong> figure — always as two separate fields — plus the sources behind every claim.
            </p>
            <CodeBlock code={`${API_BASE}`} language="http" title="Base URL" />
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Separate metrics", "suitability.score (0–10) and evidence.coverage (0–1) are never combined or averaged."],
                ["Typed claims", "Every analysis claim carries a claim_type: manufacturer, measured, expert, customer or ai."],
                ["Unknown stays unknown", "Missing data is returned as null with a warning — never guessed."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-[14px] border border-border bg-card p-4">
                  <p className="text-[14px] font-semibold text-foreground">{t}</p>
                  <p className="mt-1 text-[13px] leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
            <p>
              Requests are versioned by date. Send <InlineCode>Qeivo-Version: 2026-11-01</InlineCode> to pin behaviour; without it your key’s default version is used.
            </p>
          </DocSectionBlock>

          <DocSectionBlock id="authentication" title="Authentication" eyebrow="Security">
            <p>
              Authenticate with a bearer token. Live keys start with <InlineCode>qv_live_</InlineCode> and test keys with <InlineCode>qv_test_</InlineCode>. Create and rotate keys on the API keys page; a key is shown in full only once.
            </p>
            <CodeBlock code={`Authorization: Bearer $QEIVO_API_KEY\nQeivo-Version: 2026-11-01`} language="http" title="Request headers" />
            <Callout>Keep keys on the server. Never embed a live key in a web page or mobile app — anyone could read it.</Callout>
            <div className="min-w-0">
              <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-subtle-foreground">Scopes</h3>
              <ul className="divide-y divide-border rounded-[12px] border border-border bg-card">
                {apiScopes.map((s) => (
                  <li key={s.scope} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                    <code className="w-40 shrink-0 font-mono text-[13px] font-semibold text-foreground">{s.scope}</code>
                    <span className="text-[13px]">{s.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </DocSectionBlock>

          <DocSectionBlock id="products" title="Products" eyebrow="Reference">
            <p>Product records include specifications, current price, the suitability score with its top factors, evidence coverage, data warnings and a sources array.</p>
            <EndpointCard
              method="GET"
              path="/v1/products"
              scope="products:read"
              title="List products"
              description="Returns a paginated list of products, newest data first. Use filters to narrow by category or search text."
              params={[
                { name: "category", in: "query", type: "string", description: "One of refrigerators, washing-machines, televisions, laptops." },
                { name: "q", in: "query", type: "string", description: "Free-text search over brand, model and model number." },
                { name: "region", in: "query", type: "string", description: "Price region: US, UK, EU, AU or CA. Defaults to US." },
                { name: "limit", in: "query", type: "integer", description: "Results per page, 1–100. Defaults to 20." },
                { name: "cursor", in: "query", type: "string", description: "Pass next_cursor from the previous page." },
              ]}
              examples={requestExamples("GET", "/products?category=refrigerators&limit=2")}
              response={json(list)}
            />
            <EndpointCard
              method="GET"
              path="/v1/products/{id}"
              scope="products:read"
              title="Retrieve a product"
              description={
                <>
                  Returns the full record. The example below is the live seed record for <strong>{product.name}</strong>.
                </>
              }
              params={[
                { name: "id", in: "path", type: "string", required: true, description: "Product id, e.g. p-nordvik-frostline-fd600." },
                { name: "region", in: "query", type: "string", description: "Price region. Defaults to US." },
              ]}
              examples={requestExamples("GET", `/products/${product.id}`)}
              response={json(productResource(product))}
            />
          </DocSectionBlock>

          <DocSectionBlock id="comparisons" title="Comparisons" eyebrow="Reference">
            <p>Compare two to four products. The response lists each product’s scores and the fields where they differ meaningfully. It never picks a winner on sponsored status.</p>
            <EndpointCard
              method="POST"
              path="/v1/compare"
              scope="compare:write"
              title="Create a comparison"
              description="Normalises specs across the products and highlights real differences."
              params={[
                { name: "product_ids", in: "body", type: "string[]", required: true, description: "Two to four product ids from the same category." },
                { name: "region", in: "body", type: "string", description: "Price region. Defaults to US." },
              ]}
              examples={requestExamples("POST", "/compare", { product_ids: compareIds, region: "US" })}
              response={json(compareResource(compareIds))}
              responseStatus="201 Created"
            />
          </DocSectionBlock>

          <DocSectionBlock id="analysis" title="Analysis" eyebrow="Reference">
            <p>
              Analysis returns the classified claims behind a product’s strengths and limitations. Each claim has a <InlineCode>claim_type</InlineCode> and <InlineCode>source_ids</InlineCode> that resolve against the <InlineCode>sources</InlineCode> array. Manufacturer claims are labelled as such, never as verified fact.
            </p>
            <EndpointCard
              method="GET"
              path="/v1/products/{id}/analysis"
              scope="products:read"
              title="Retrieve product analysis"
              description="Strengths, limitations and summary claims with their evidence."
              params={[{ name: "id", in: "path", type: "string", required: true, description: "Product id." }]}
              examples={requestExamples("GET", `/products/${product.id}/analysis`)}
              response={json(analysisResource(product))}
            />
          </DocSectionBlock>

          <DocSectionBlock id="errors" title="Errors" eyebrow="Handling failures">
            <p>Errors use conventional HTTP status codes and a consistent JSON body. Always log the <InlineCode>request_id</InlineCode> — support can trace it.</p>
            <CodeBlock code={json(errorExample)} language="json" title="404 response body" />
            <div className="scrollbar-thin overflow-x-auto rounded-[12px] border border-border bg-card">
              <table className="w-full min-w-[620px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/50 text-[11px] uppercase tracking-wider text-subtle-foreground">
                    <th scope="col" className="px-4 py-2.5 text-left font-medium">Status</th>
                    <th scope="col" className="px-4 py-2.5 text-left font-medium">Code</th>
                    <th scope="col" className="px-4 py-2.5 text-left font-medium">Meaning</th>
                    <th scope="col" className="px-4 py-2.5 text-left font-medium">What to do</th>
                  </tr>
                </thead>
                <tbody>
                  {errorDistribution.map((e) => (
                    <tr key={e.code} className="border-b border-border align-top last:border-0">
                      <td className="px-4 py-3">
                        <span className={e.code >= 500 ? "rounded-[6px] bg-danger-soft px-1.5 py-0.5 font-mono text-[12px] font-semibold text-danger-foreground" : "rounded-[6px] bg-warning-soft px-1.5 py-0.5 font-mono text-[12px] font-semibold text-warning-foreground"}>{e.code}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-foreground">{ERROR_HELP[e.code]?.code}</td>
                      <td className="px-4 py-3 text-foreground">{e.label.split(" — ")[1] ?? e.label.replace(/ \(.*\)$/, "")}</td>
                      <td className="px-4 py-3 text-muted-foreground">{ERROR_HELP[e.code]?.fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DocSectionBlock>

          <DocSectionBlock id="rate-limits" title="Rate limits" eyebrow="Fair use">
            <p>
              Each key may make <strong>20 requests per second</strong> with bursts up to 40. Monthly volume is pooled across live keys (50,000 on the Team plan). Every response includes the current budget:
            </p>
            <CodeBlock code={`X-RateLimit-Limit: 20\nX-RateLimit-Remaining: 17\nX-RateLimit-Reset: 1795429801\nX-Quota-Remaining: 16574`} language="http" title="Response headers" />
            <p>When you exceed the limit the API returns <InlineCode>429</InlineCode> with a <InlineCode>Retry-After</InlineCode> header in seconds. Retry with exponential backoff:</p>
            <CodeBlock
              language="javascript"
              title="retry.js"
              showLineNumbers
              code={`async function withRetry(request, attempts = 4) {\n  for (let i = 0; i < attempts; i++) {\n    const res = await request();\n    if (res.status !== 429) return res;\n    const wait = Number(res.headers.get("Retry-After") ?? 2 ** i);\n    await new Promise((r) => setTimeout(r, wait * 1000));\n  }\n  throw new Error("Rate limit retries exhausted");\n}`}
            />
          </DocSectionBlock>

          <DocSectionBlock id="sdks" title="SDKs" eyebrow="Libraries">
            <p>Official client libraries are in preview alongside the API and are not yet published to public registries. Until then, the REST examples above work with any HTTP client.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: "JavaScript / TypeScript", pkg: "@qeivo/sdk", code: `import { Qeivo } from "@qeivo/sdk";\n\nconst qeivo = new Qeivo({ apiKey: process.env.QEIVO_API_KEY });\nconst product = await qeivo.products.retrieve("${product.id}");\n\nconsole.log(product.suitability.score, product.evidence.coverage);`, lang: "javascript" as const },
                { name: "Python", pkg: "qeivo", code: `from qeivo import Qeivo\n\nqeivo = Qeivo()  # reads QEIVO_API_KEY\nproduct = qeivo.products.retrieve("${product.id}")\n\nprint(product.suitability.score, product.evidence.coverage)`, lang: "python" as const },
              ].map((s) => (
                <div key={s.name} className="min-w-0 space-y-3 rounded-[16px] border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-semibold text-foreground">{s.name}</p>
                    <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning-foreground">Preview · unpublished</span>
                  </div>
                  <CodeBlock code={s.code} language={s.lang} title={s.pkg} />
                </div>
              ))}
            </div>
          </DocSectionBlock>
        </div>
      </DocsLayout>
    </PageContainer>
  );
}
