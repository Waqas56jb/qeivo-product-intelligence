import type { ChatMessage, Conversation, Product } from "@/types";
import { requireProduct } from "../products";

/** Read a spec value from a product's spec groups. */
export function specValue(p: Product, key: string): string | number | boolean | undefined {
  for (const g of p.specs) {
    const item = g.items.find((i) => i.key === key);
    if (item) return item.value;
  }
  return undefined;
}

const src = (p: Product, k: string) => `${p.id}:${k}`;
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

type Block = NonNullable<ChatMessage["blocks"]>[number];

function user(id: string, content: string, createdAt: string): ChatMessage {
  return { id, role: "user", content, createdAt };
}

function assistant(id: string, createdAt: string, blocks: Block[], productIds: string[], followUps: string[]): ChatMessage {
  return {
    id,
    role: "assistant",
    content: blocks.map((b) => b.text).join(" "),
    blocks,
    sourceIds: Array.from(new Set(blocks.flatMap((b) => b.sourceIds))),
    productIds,
    followUps,
    createdAt,
  };
}

function ventText(p: Product) {
  const v = p.installation.ventilationMm;
  return v
    ? `The manual asks for ${v.sides} mm at each side, ${v.top} mm above and ${v.back} mm behind.`
    : `${p.name.split(" ")[0]} has not published ventilation clearances, so Qeivo treats them as unknown.`;
}

function fitVerdict(p: Product, w: number, h: number, d: number) {
  const v = p.installation.ventilationMm;
  const needW = p.dimensions.widthMm + (v ? v.sides * 2 : 0);
  const needH = p.dimensions.heightMm + (v ? v.top : 0);
  const needD = p.dimensions.depthMm + (v ? v.back : 0);
  const ok = needW <= w && needH <= h && needD <= d;
  return { ok, needW, needH, needD };
}

/* ---------------------------------------------------------------- 1 */
const fd600 = requireProduct("p-nordvik-frostline-fd600");
const fd540 = requireProduct("p-nordvik-frostline-fd540-cd");
const fit600 = fitVerdict(fd600, 920, 1800, 720);
const fit540 = fitVerdict(fd540, 920, 1800, 720);

const c1: Conversation = {
  id: "conv-1",
  title: "Will the Frostline FD600 fit my kitchen?",
  productIds: [fd600.id, fd540.id],
  createdAt: "2026-11-20T19:02:00Z",
  updatedAt: "2026-11-20T19:09:00Z",
  saved: true,
  messages: [
    user("conv-1-m1", "My fridge opening is 920 mm wide, 1800 mm high and 720 mm deep. Will the Nordvik Frostline FD600 fit?", "2026-11-20T19:02:00Z"),
    assistant("conv-1-m2", "2026-11-20T19:02:20Z", [
      { text: `Not cleanly. The ${fd600.model} measures ${fd600.dimensions.widthMm} × ${fd600.dimensions.heightMm} × ${fd600.dimensions.depthMm} mm, so its body alone is ${fd600.dimensions.depthMm - 720} mm deeper than your opening.`, claimType: "manufacturer", sourceIds: [src(fd600, "spec")] },
      { text: `${ventText(fd600)} Including those gaps it needs roughly ${fit600.needW} × ${fit600.needH} × ${fit600.needD} mm.`, claimType: "manufacturer", sourceIds: [src(fd600, "manual")] },
      { text: `It would protrude past the opening and the doors may catch on adjacent cabinets. A counter-depth model is the safer choice for this space.`, claimType: "ai", sourceIds: [src(fd600, "spec"), src(fd600, "manual")] },
    ], [fd600.id], ["Which counter-depth fridges fit 920 × 1800 × 720 mm?", "How much ventilation does a fridge really need?", "Show me the FD540 Counter-Depth"]),
    user("conv-1-m3", "What about the FD540 Counter-Depth?", "2026-11-20T19:05:00Z"),
    assistant("conv-1-m4", "2026-11-20T19:05:18Z", [
      { text: `The ${fd540.model} is ${fd540.dimensions.widthMm} × ${fd540.dimensions.heightMm} × ${fd540.dimensions.depthMm} mm — ${720 - fd540.dimensions.depthMm} mm shallower than your opening and ${1800 - fd540.dimensions.heightMm} mm under the height limit.`, claimType: "manufacturer", sourceIds: [src(fd540, "spec")] },
      { text: `${ventText(fd540)} ${fit540.ok ? "With those gaps it still fits." : `With those gaps it needs ${fit540.needW} mm of width, ${fit540.needW - 920} mm more than your opening. Depth and height are fine; ask Nordvik whether reduced side gaps are acceptable for a built-in fit before ordering.`}`, claimType: "manufacturer", sourceIds: [src(fd540, "manual")] },
      { text: `Owners rate it ${fd540.rating}/5 across ${fd540.reviewCount.toLocaleString("en-US")} reviews, and it runs at a rated ${specValue(fd540, "noise")} dB(A), which suits open-plan kitchens.`, claimType: "customer", sourceIds: [src(fd540, "customers"), src(fd540, "spec")] },
      { text: `The trade-off is capacity: ${fd540.capacity.value} L against ${fd600.capacity.value} L for the FD600, and it costs ${usd(fd540.price)} compared with ${usd(fd600.price)}.`, claimType: "ai", sourceIds: [src(fd540, "spec"), src(fd600, "spec")] },
    ], [fd540.id, fd600.id], ["Compare FD540 with the Maru SmartView CD540", "Does the FD540 need a water line?", "Track the FD540 price"]),
  ],
};

/* ---------------------------------------------------------------- 2 */
const ovea = requireProduct("p-ovea-eco-fd520");
const bw = requireProduct("p-brightwater-family-fd560");
const oKwh = Number(specValue(ovea, "kwh-measured"));
const bKwh = Number(specValue(bw, "kwh-measured"));
const c2: Conversation = {
  id: "conv-2",
  title: "Running costs: Ovea Eco FD520 vs Brightwater FD560",
  productIds: [ovea.id, bw.id],
  createdAt: "2026-11-14T08:40:00Z",
  updatedAt: "2026-11-14T08:46:00Z",
  saved: true,
  messages: [
    user("conv-2-m1", "How much cheaper is the Ovea Eco FD520 to run than the Brightwater Family FD560 over 10 years?", "2026-11-14T08:40:00Z"),
    assistant("conv-2-m2", "2026-11-14T08:40:25Z", [
      { text: `On the energy label the Ovea is class ${ovea.energy.rating} at ${ovea.energy.annualKwh} kWh/yr and the Brightwater is class ${bw.energy.rating} at ${bw.energy.annualKwh} kWh/yr.`, claimType: "manufacturer", sourceIds: [src(ovea, "cert"), src(bw, "cert")] },
      { text: `Independent lab measurements came in at ${oKwh} kWh/yr for the Ovea and ${bKwh} kWh/yr for the Brightwater.`, claimType: "measured", sourceIds: [src(ovea, "lab"), src(bw, "lab")] },
      { text: `At $0.17/kWh that is about ${usd(Math.round(oKwh * 0.17))} versus ${usd(Math.round(bKwh * 0.17))} a year, or roughly ${usd(Math.round((bKwh - oKwh) * 0.17 * 10))} saved over 10 years — which offsets most of the ${usd(ovea.price - bw.price)} price difference.`, claimType: "ai", sourceIds: [src(ovea, "lab"), src(bw, "lab")] },
    ], [ovea.id, bw.id], ["What if my tariff is $0.30/kWh?", "Which one has more usable space?", "Compare warranties"]),
    user("conv-2-m3", "And the warranties?", "2026-11-14T08:44:00Z"),
    assistant("conv-2-m4", "2026-11-14T08:44:15Z", [
      { text: `Ovea includes ${ovea.warranty.years} years parts and labour${ovea.warranty.extended ? ` plus a ${ovea.warranty.extended} warranty` : ""}. Brightwater includes ${bw.warranty.years} years${bw.warranty.extended ? ` plus a ${bw.warranty.extended} warranty` : ""}.`, claimType: "manufacturer", sourceIds: [src(ovea, "spec"), src(bw, "spec")] },
      { text: "Both require registration within 90 days to activate extended compressor cover.", claimType: "manufacturer", sourceIds: [src(ovea, "spec"), src(bw, "spec")] },
    ], [ovea.id, bw.id], ["Is a plumbed ice maker worth the reliability risk?", "Save this comparison"]),
  ],
};

/* ---------------------------------------------------------------- 3 */
const halden = requireProduct("p-halden-pureclean-w9");
const greenc = requireProduct("p-ovea-greencycle-w8");
const c3: Conversation = {
  id: "conv-3",
  title: "Best front loader for a family of four",
  productIds: [halden.id, greenc.id],
  createdAt: "2026-11-02T20:10:00Z",
  updatedAt: "2026-11-02T20:16:00Z",
  saved: true,
  messages: [
    user("conv-3-m1", "We're a family of four doing about 6 loads a week. Halden PureClean W9 or Ovea GreenCycle W8?", "2026-11-02T20:10:00Z"),
    assistant("conv-3-m2", "2026-11-02T20:10:30Z", [
      { text: `The PureClean W9 holds ${halden.capacity.value} kg against ${greenc.capacity.value} kg — the extra kilogram matters for duvets and bulky towel loads in a four-person household.`, claimType: "manufacturer", sourceIds: [src(halden, "spec"), src(greenc, "spec")] },
      { text: `In lab testing the Halden used ${specValue(halden, "water")} L per standard cycle and the Ovea ${specValue(greenc, "water")} L; measured energy was ${specValue(halden, "kwh-measured")} and ${specValue(greenc, "kwh-measured")} kWh/yr respectively.`, claimType: "measured", sourceIds: [src(halden, "lab"), src(greenc, "lab")] },
      { text: `Owners rate the Halden ${halden.rating}/5 and the Ovea ${greenc.rating}/5. Halden owners most often praise the auto-dosing; Ovea owners highlight its ${specValue(greenc, "rpm")} rpm spin leaving clothes drier.`, claimType: "customer", sourceIds: [src(halden, "customers"), src(greenc, "customers")] },
      { text: `For six loads a week, the Halden is the better fit. The Ovea makes sense if you value its ${greenc.warranty.years}-year warranty and lower price (${usd(greenc.price)} vs ${usd(halden.price)}).`, claimType: "ai", sourceIds: [src(halden, "spec"), src(greenc, "spec")] },
    ], [halden.id, greenc.id], ["How loud is the spin cycle?", "Does auto-dosing work with pods?", "Show stacking options"]),
  ],
};

/* ---------------------------------------------------------------- 4 */
const bf400 = requireProduct("p-halden-precision-bf400");
const bf370 = requireProduct("p-ovea-eco-bf370");
const c4: Conversation = {
  id: "conv-4",
  title: "Quietest fridge for an open-plan kitchen",
  productIds: [bf400.id, bf370.id],
  createdAt: "2026-10-27T21:31:00Z",
  updatedAt: "2026-10-27T21:35:00Z",
  saved: false,
  messages: [
    user("conv-4-m1", "Our kitchen opens onto the living room. Which fridge is quietest?", "2026-10-27T21:31:00Z"),
    assistant("conv-4-m2", "2026-10-27T21:31:22Z", [
      { text: `The quietest full-size models in our catalogue are the Ovea Eco BF370 at a rated ${specValue(bf370, "noise")} dB(A) and the Halden Precision BF400 at ${specValue(bf400, "noise")} dB(A).`, claimType: "manufacturer", sourceIds: [src(bf370, "spec"), src(bf400, "spec")] },
      { text: `Both use inverter compressors, which ramp up gradually instead of switching on with an audible clunk. The Halden held temperature within ${specValue(bf400, "temp-variance")} °C in lab door-opening tests.`, claimType: "measured", sourceIds: [src(bf400, "lab"), src(bf370, "lab")] },
      { text: "Reviewers describe both as effectively silent from a sofa three metres away.", claimType: "expert", sourceIds: [src(bf400, "review"), src(bf370, "review")] },
    ], [bf370.id, bf400.id], ["Are there quiet French door options?", "What does 32 dB actually sound like?"]),
  ],
};

/* ---------------------------------------------------------------- 5 */
const oled = requireProduct("p-lumora-vivid-oled65");
const mini = requireProduct("p-vireo-lumen-miniled65");
const c5: Conversation = {
  id: "conv-5",
  title: "OLED or Mini-LED for a bright living room?",
  productIds: [oled.id, mini.id],
  createdAt: "2026-11-18T21:02:00Z",
  updatedAt: "2026-11-18T21:07:00Z",
  saved: true,
  messages: [
    user("conv-5-m1", "Our den gets a lot of afternoon sun. Lumora Vivid OLED 65 or Vireo Lumen Mini-LED 65?", "2026-11-18T21:02:00Z"),
    assistant("conv-5-m2", "2026-11-18T21:02:30Z", [
      { text: `The Vireo Lumen reaches a measured ${specValue(mini, "nits")} nits peak brightness against ${specValue(oled, "nits")} nits for the Lumora, so it holds up better in direct sunlight.`, claimType: "measured", sourceIds: [src(mini, "lab"), src(oled, "lab")] },
      { text: "The OLED still wins on contrast and viewing angles; in the evening or with blinds drawn it is the better picture.", claimType: "expert", sourceIds: [src(oled, "review")] },
      { text: `The Vireo is ${usd(oled.price - mini.price)} cheaper at ${usd(mini.price)}. For a sunny room used mostly in the daytime, it is the more practical choice.`, claimType: "ai", sourceIds: [src(mini, "spec"), src(oled, "spec")] },
    ], [mini.id, oled.id], ["Is burn-in still a concern on OLED?", "Which has better gaming features?"]),
    user("conv-5-m3", "Is burn-in a real risk if we watch a lot of news?", "2026-11-18T21:05:00Z"),
    assistant("conv-5-m4", "2026-11-18T21:05:20Z", [
      { text: "Owners who leave news channels with static tickers on for several hours a day are the group that most often report temporary image retention.", claimType: "customer", sourceIds: [src(oled, "customers")] },
      { text: `Lumora covers the panel for ${oled.warranty.years} years and runs a pixel-refresh routine in standby.`, claimType: "manufacturer", sourceIds: [src(oled, "manual"), src(oled, "spec")] },
    ], [oled.id], ["How long is the Lumora warranty on burn-in specifically?"]),
  ],
};

/* ---------------------------------------------------------------- 6 */
const air = requireProduct("p-tervo-air-14");
const aero = requireProduct("p-vireo-aero-13");
const c6: Conversation = {
  id: "conv-6",
  title: "Laptop for a first-year college student",
  productIds: [air.id, aero.id],
  createdAt: "2026-11-12T22:48:00Z",
  updatedAt: "2026-11-12T22:55:00Z",
  saved: true,
  messages: [
    user("conv-6-m1", "Daughter starts college next year, mostly writing and research. Is 8 GB enough or should I get the Tervo Air 14?", "2026-11-12T22:48:00Z"),
    assistant("conv-6-m2", "2026-11-12T22:48:28Z", [
      { text: `The Vireo Aero 13 ships with ${specValue(aero, "ram")} GB of RAM and the Tervo Air 14 with ${specValue(air, "ram")} GB; only the Tervo's memory is upgradeable.`, claimType: "manufacturer", sourceIds: [src(aero, "spec"), src(air, "spec")] },
      { text: `In our battery loop the Tervo lasted ${specValue(air, "measured")} h and the Aero ${specValue(aero, "measured")} h — both short of their claimed ${specValue(air, "claimed")} h and ${specValue(aero, "claimed")} h.`, claimType: "measured", sourceIds: [src(air, "lab"), src(aero, "lab")] },
      { text: "8 GB handles writing and browsing today, but with dozens of research tabs and video calls it will feel slow within a couple of years. For a four-year degree, 16 GB is the safer buy.", claimType: "ai", sourceIds: [src(air, "spec"), src(aero, "spec")] },
    ], [air.id, aero.id], ["Which is lighter to carry around campus?", "Watch the Tervo Air 14 price"]),
  ],
};

/* ---------------------------------------------------------------- 7 */
const sbs = requireProduct("p-kestrel-homebase-sbs650");
const c7: Conversation = {
  id: "conv-7",
  title: "Kestrel SBS650 energy figure looks off",
  productIds: [sbs.id],
  createdAt: "2026-10-08T12:20:00Z",
  updatedAt: "2026-10-08T12:23:00Z",
  saved: false,
  messages: [
    user("conv-7-m1", "Why does the Kestrel HomeBase SBS650 show two different energy numbers?", "2026-10-08T12:20:00Z"),
    assistant("conv-7-m2", "2026-10-08T12:20:16Z", [
      { text: `The energy label registers ${sbs.energy.annualKwh} kWh/yr (class ${sbs.energy.rating}).`, claimType: "manufacturer", sourceIds: [src(sbs, "cert")] },
      { text: `Independent testing measured ${specValue(sbs, "kwh-measured")} kWh/yr under a door-opening routine closer to real family use.`, claimType: "measured", sourceIds: [src(sbs, "lab")] },
      { text: "Qeivo scores use the measured figure whenever an independent measurement exists, and flags any gap above 8% as a conflict.", claimType: "ai", sourceIds: [src(sbs, "lab"), src(sbs, "cert")] },
    ], [sbs.id], ["How is the energy label test performed?", "Show more efficient side-by-sides"]),
  ],
};

export const conversations: Conversation[] = [c1, c2, c3, c4, c5, c6, c7].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

export function getConversation(id: string): Conversation | undefined {
  return conversations.find((c) => c.id === id);
}

/** Starter prompts for an empty Ask Qeivo session. */
export const suggestedPrompts: string[] = [
  "Which French door fridges fit a 920 × 1800 × 720 mm opening?",
  "Compare running costs of the three most efficient fridges",
  "What's the quietest washing machine under $1,000?",
  "Is a plumbed ice maker worth the extra maintenance?",
  "OLED or Mini-LED for a bright room?",
  "Which laptops have upgradeable RAM?",
];
