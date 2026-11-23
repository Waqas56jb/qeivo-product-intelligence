import { images } from "@/data/images";
import { P, dims, kwh, usd, type GuideInput } from "./guide-helpers";

const fd600 = P("nordvik-frostline-fd600");
const fd540 = P("nordvik-frostline-fd540-cd");
const bf380 = P("nordvik-ellipse-bf380");
const c400 = P("nordvik-column-c400");
const sbs630 = P("nordvik-frostline-sbs630");
const hBf400 = P("halden-precision-bf400");
const hFd590 = P("halden-precision-fd590");
const hBi270 = P("halden-integra-bi270");
const kSbs650 = P("kestrel-homebase-sbs650");
const kFd580 = P("kestrel-everyday-fd580");
const kCd510 = P("kestrel-everyday-cd510");
const kTf450 = P("kestrel-homebase-tf450");
const kC90 = P("kestrel-dorm-c90");
const mCd540 = P("maru-smartview-cd540");
const mFd620 = P("maru-smartview-fd620");
const mSbs660 = P("maru-flex-sbs660");
const mCube = P("maru-cube-c120");
const mPanel = P("maru-panel-bf360");
const bwFd560 = P("brightwater-family-fd560");
const bwBf440 = P("brightwater-family-bf440");
const bwSbs600 = P("brightwater-family-sbs600");
const bwC385 = P("brightwater-larder-c385");
const cvR480 = P("corvane-pro-column-r480");
const cvFd650 = P("corvane-pro-fd650");
const oBf370 = P("ovea-eco-bf370");
const oFd520 = P("ovea-eco-fd520");
const oC160 = P("ovea-eco-c160");
const aU130 = P("aurelle-petite-u130");
const sU140 = P("solenne-capri-u140");
const aFd610 = P("aurelle-maison-fd610");

export const refrigeratorGuides: GuideInput[] = [
  {
    slug: "how-to-measure-for-a-new-refrigerator",
    title: "How to measure for a new refrigerator",
    excerpt: "Width, height and depth are only half the story. Here is the five-measurement routine our installers use, including the door swing and delivery path most buyers forget.",
    category: "refrigerators",
    topic: "Installation & fit",
    heroImage: images.kitchens[0],
    author: "hannah",
    publishedAt: "2025-03-04",
    updatedAt: "2026-10-02",
    featured: true,
    sections: [
      {
        heading: "Start with the opening, not the old fridge",
        paragraphs: [
          "The most common mistake we see is measuring the fridge you are replacing. Older appliances were often installed with generous gaps, or squeezed in with none at all, and neither tells you what the space can actually take. Measure the opening itself: the clear distance between cabinets or walls, from the floor to the underside of any overhead cabinet, and from the back wall to the front edge of the worktop.",
          "Take each measurement in three places — left, centre and right for height; top, middle and bottom for width. Floors slope and cabinets rack over time, and a 10 mm difference between the left and right side of an opening is normal in kitchens more than a decade old. Always plan against the smallest figure you record.",
        ],
        bullets: [
          "Width: measure at worktop height, mid-height and just above the skirting",
          "Height: floor to underside of overhead cabinet, front and back",
          "Depth: back wall (or water pipe) to the front face of the adjacent cabinet doors",
          "Note any skirting boards, pipes or sockets that intrude into the space",
        ],
      },
      {
        heading: "Add ventilation clearances",
        paragraphs: [
          "Refrigerators shed heat through their sides, top and rear. Squeeze one into an opening without the manufacturer's clearances and the compressor runs longer, energy use climbs and the cabinet may struggle to hold temperature on hot days. Every model page on Qeivo lists published clearances, and flags the models where the manufacturer has not published them.",
          `As an example, the ${fd600.name} measures ${dims(fd600)}. Its manual asks for ${fd600.installation.ventilationMm ? `${fd600.installation.ventilationMm.sides} mm at each side, ${fd600.installation.ventilationMm.top} mm above and ${fd600.installation.ventilationMm.back} mm behind` : "clearances that are not yet published"}, so the opening it needs is noticeably larger than the cabinet itself.`,
          "If you are fitting a freestanding model between tall cabinets, err on the generous side. Integrated (built-in) models are designed to vent through the plinth and are the exception to this rule.",
        ],
        callout: { tone: "warning", text: "Do not rely on the 'fits a 36-inch opening' marketing line. That figure usually assumes zero side clearance and handles removed." },
      },
      {
        heading: "Plan the door swing",
        paragraphs: [
          "A fridge that fits the opening can still be unusable if the doors cannot open far enough to pull out the crisper drawers. Most French door and side-by-side models need the doors to swing past 90° before drawers clear the door liners. If the fridge sits against a side wall, you may need an extra 50–100 mm of space on the hinge side.",
          "Check the door swing clearance listed under Dimensions on each product page. For single-door and bottom-freezer models, also confirm whether the hinges are reversible — it can turn an awkward corner position into a comfortable one.",
        ],
        bullets: [
          "French door: each door needs roughly half the cabinet width plus 40 mm to swing",
          "Side-by-side: narrow doors swing less, but the freezer side is often tight for large trays",
          "Against a wall: add the depth of the handle to your clearance",
        ],
      },
      {
        heading: "Measure the delivery path",
        paragraphs: [
          "Roughly one in ten large-appliance deliveries needs a second visit, and doorway width is the leading cause. Measure every doorway, hallway and stair turn between the kerb and the kitchen. The figure that matters is the depth of the fridge with doors removed, which is usually 30–50 mm less than the quoted depth.",
          "Tight turns are harder to judge than straight doorways. A useful rule of thumb: if a hallway is narrower than the fridge's height-diagonal allows, the installers will need to tilt and pivot it — ask the retailer whether that is included in the delivery service.",
        ],
        callout: { tone: "tip", text: "Photograph your opening with a tape measure visible and save it to your Qeivo research folder. Installers and retailers can then confirm fit before delivery day." },
      },
      {
        heading: "Use the Qeivo fit checker",
        paragraphs: [
          "Once you have your measurements, enter them in your profile under Space. Every refrigerator page will then show a fit verdict that combines the published dimensions, ventilation clearances and door swing. Where the manufacturer has not published clearances, the checker says so rather than guessing.",
          `For an opening of 920 mm wide and 720 mm deep, for instance, the ${fd540.name} (${dims(fd540)}) fits comfortably and sits almost flush with the worktop, while the ${kFd580.name} at ${kFd580.dimensions.depthMm} mm deep would protrude well beyond the cabinets.`,
        ],
      },
    ],
    relatedProductIds: [fd600.id, fd540.id, kFd580.id, bf380.id],
    relatedGuideSlugs: ["counter-depth-explained", "french-door-vs-side-by-side", "column-refrigerators-explained"],
    sourceIds: ["src-kitchen-planning-clearances", "src-doorway-delivery-survey", `${fd600.id}:manual`, `${fd540.id}:spec`, `${kFd580.id}:spec`],
  },
  {
    slug: "french-door-vs-side-by-side",
    title: "French door vs side-by-side: which layout suits your kitchen?",
    excerpt: "Both offer around 600 litres in a 910 mm wide cabinet, but they store food very differently. We compare usable space, energy use and the everyday ergonomics.",
    category: "refrigerators",
    topic: "Refrigerator types",
    heroImage: images.fridgeInSitu[0],
    author: "priya",
    publishedAt: "2025-01-21",
    updatedAt: "2026-09-18",
    featured: true,
    sections: [
      {
        heading: "The short answer",
        paragraphs: [
          "If you buy a lot of fresh food and cook from scratch, a French door model usually suits you better: the full-width fridge section takes party platters and sheet trays, and the fresh-food shelves sit at eye level. If you rely on frozen food, or the fridge sits in a narrow galley where full-width doors would block the walkway, side-by-side is the more practical choice.",
          "The two layouts are close in headline capacity but not in how usable that capacity is. In our lab measurements, French door models typically delivered 86–91% of their quoted volume as usable space, while side-by-side models lost more to the narrow freezer column and dispenser housing.",
        ],
      },
      {
        heading: "Capacity: quoted versus usable",
        paragraphs: [
          `Take two Nordvik models of similar width. The ${fd600.name} is quoted at ${fd600.capacity.value} L and the ${sbs630.name} at ${sbs630.capacity.value} L. On paper the side-by-side is larger, but its freezer compartment is a tall column roughly 300 mm wide — large frozen pizzas and baking trays simply do not fit flat.`,
          "French door freezers are wide drawers instead, which are easier to pack but harder to keep organised. Look for models with a divider or a second sliding tray; without one, small items migrate to the bottom and are forgotten.",
        ],
        bullets: [
          "French door: best for wide items, platters, fresh produce at eye level",
          "Side-by-side: best for frozen food access and narrow walkways",
          "Both: a through-door dispenser costs roughly one door shelf's worth of space",
        ],
      },
      {
        heading: "Energy use and running costs",
        paragraphs: [
          `Side-by-side models are, on average, slightly less efficient because the long vertical freezer door loses more cold air each time it is opened. The ${kSbs650.name} is rated at ${kwh(kSbs650)} (class ${kSbs650.energy.rating}), whereas the similarly sized ${fd600.name} is rated at ${kwh(fd600)}.`,
          "The difference is not dramatic — typically $10 to $25 a year at average tariffs — but over a fifteen-year lifespan it adds up to more than the price gap between many comparable models.",
        ],
        callout: { tone: "info", text: "Qeivo's running-cost estimates use independently measured consumption where available, not the label figure." },
      },
      {
        heading: "Everyday ergonomics",
        paragraphs: [
          "Think about who uses the fridge most. French door models put fresh food at adult eye level and frozen food at floor level, which is a lot of bending for anyone with back problems. Side-by-side models put both at comfortable heights, and children can reach snacks without opening a wide door.",
          "In narrow kitchens, the smaller door swing of a side-by-side is a genuine advantage. Each French door still needs around 500 mm of clearance to open fully, which can block a galley walkway or clash with an island.",
        ],
      },
      {
        heading: "Our picks",
        paragraphs: [
          `For most families we recommend the ${bwFd560.name} (${usd(bwFd560.price)}) as a strong all-rounder, or the ${fd600.name} if quiet running and the 10-year compressor warranty matter. If you prefer a side-by-side, the ${sbs630.name} balances capacity and efficiency better than the cheaper alternatives in our tests.`,
        ],
      },
    ],
    relatedProductIds: [fd600.id, sbs630.id, kSbs650.id, bwFd560.id, mSbs660.id],
    relatedGuideSlugs: ["how-to-measure-for-a-new-refrigerator", "best-refrigerators-for-a-family-of-four", "is-a-plumbed-ice-maker-worth-it"],
    sourceIds: [`${fd600.id}:lab`, `${sbs630.id}:spec`, `${kSbs650.id}:cert`, `${fd600.id}:cert`, "src-appliance-reliability-survey-2026"],
  },
  {
    slug: "understanding-energy-labels",
    title: "Understanding energy labels: what the letters really mean",
    excerpt: "Since the A–G rescale, a class C fridge can be one of the most efficient on sale. Here is how to read the label, and why lab measurements sometimes disagree with it.",
    category: "refrigerators",
    topic: "Energy & running costs",
    heroImage: images.kitchens[4],
    author: "tomas",
    publishedAt: "2024-11-12",
    updatedAt: "2026-08-27",
    featured: true,
    sections: [
      {
        heading: "The rescale changed everything",
        paragraphs: [
          "Energy labels were rescaled so that the top classes would be left almost empty at launch, giving manufacturers room to improve. That means the letters on a new refrigerator are not comparable with labels you may remember: a class C model today typically uses less electricity than an 'A+' model from the old scheme.",
          `Only a handful of refrigerators in our catalogue currently reach class A. The ${hBf400.name}, rated at ${kwh(hBf400)}, and the ${oBf370.name}, rated at ${kwh(oBf370)}, are two of them — both bottom-freezer designs about 600 mm wide.`,
        ],
        callout: { tone: "info", text: "Classes compare efficiency relative to size, not absolute consumption. A large class D fridge can use more electricity than a small class E one." },
      },
      {
        heading: "What the kWh figure measures",
        paragraphs: [
          "The annual consumption figure comes from a standardised 24-hour test at controlled room temperature with the doors closed. It does not include door openings, warm food being loaded, or the ice maker running. That is deliberate: the test needs to be repeatable across laboratories.",
          "The consequence is that real-world consumption is usually somewhat higher than the label. In our lab, which adds scheduled door openings and a food load, most refrigerators landed within 10% of their declared figure. When the gap is larger, Qeivo shows a 'Conflicting energy figures' warning on the product page and uses the measured figure for scoring.",
        ],
        bullets: [
          "Declared figure: standard test, doors closed, no ice production",
          "Measured figure: our lab test with door openings and food load",
          "Running cost: measured kWh × your tariff (set in your profile)",
        ],
      },
      {
        heading: "Turning kWh into money",
        paragraphs: [
          `Multiply annual consumption by your electricity tariff. At $0.17 per kWh, the difference between the ${kSbs650.name} (${kwh(kSbs650)}) and the ${oBf370.name} (${kwh(oBf370)}) is about ${usd(Math.round((kSbs650.energy.annualKwh - oBf370.energy.annualKwh) * 0.17))} a year. Over a typical 12–15 year life, that gap can exceed ${usd(Math.round((kSbs650.energy.annualKwh - oBf370.energy.annualKwh) * 0.17 * 12 / 10) * 10)}.`,
          "Of course, those two fridges are very different in size and layout. Use the cost-per-litre view in Compare to put efficiency in context with the capacity you actually need.",
        ],
      },
      {
        heading: "Other things on the label",
        paragraphs: [
          "The label also lists total fridge and freezer volume and the airborne noise class. Noise is shown both as a dB(A) value and a class from A to D. We find the dB(A) figure more useful; a 3 dB difference is roughly a doubling of sound energy, though the perceived loudness difference is smaller.",
          "A QR code on newer labels links to the product's registry entry, which is one of the sources Qeivo cross-checks against manufacturer spec sheets.",
        ],
        callout: { tone: "tip", text: "If a retailer's listing shows an old-style 'A++' label, the listing is out of date. Check the product page on Qeivo for the current registered class." },
      },
    ],
    relatedProductIds: [hBf400.id, oBf370.id, kSbs650.id, bf380.id, c400.id],
    relatedGuideSlugs: ["refrigerator-reliability-what-the-data-says", "why-bottom-freezer-fridges-keep-winning", "washing-machine-energy-and-water-use"],
    sourceIds: ["src-energy-label-methodology", "src-energy-label-rescale", `${hBf400.id}:cert`, `${oBf370.id}:cert`, `${kSbs650.id}:lab`],
  },
  {
    slug: "is-a-plumbed-ice-maker-worth-it",
    title: "Is a plumbed ice maker worth it?",
    excerpt: "Filtered water and endless ice are genuinely convenient — but ice makers are also the single biggest source of refrigerator service calls. Here is how to decide.",
    category: "refrigerators",
    topic: "Features",
    heroImage: images.fridgeInSitu[2],
    author: "tomas",
    publishedAt: "2025-05-08",
    updatedAt: "2026-07-30",
    sections: [
      {
        heading: "What you are actually buying",
        paragraphs: [
          "A plumbed ice maker connects your refrigerator to the household water supply through a small-bore line and an inline or internal filter. In exchange you get a steady supply of ice, and on dispenser models, chilled filtered water at the door.",
          "There are three common configurations: an in-freezer ice maker with no dispenser, a through-the-door water and ice dispenser, and a water-only dispenser fed from a refillable tank that needs no plumbing at all. They differ a lot in reliability and in how much storage space they take.",
        ],
        bullets: [
          "In-freezer ice maker: least space lost, fewest moving parts",
          "Through-door dispenser: most convenient, costs a door shelf and some freezer depth",
          "Non-plumbed water tank: no installation, but must be refilled by hand",
        ],
      },
      {
        heading: "The reliability trade-off",
        paragraphs: [
          "Independent service data is blunt: ice makers and dispensers account for nearly a third of refrigerator service calls in the first five years. The usual culprits are frozen fill tubes, failing inlet valves and jammed ejector arms — mostly cheap parts, but each repair still costs a call-out fee.",
          "That is why Qeivo's reliability factor deducts a little from models with plumbed ice makers. It is not a judgement about any one brand; it reflects the extra parts that can fail.",
        ],
        callout: { tone: "warning", text: "If the ice maker slows down after you change the filter, the most likely cause is trapped air or a filter that is not fully seated — not a fault. Run two litres through the dispenser before calling for service." },
      },
      {
        heading: "Installation requirements",
        paragraphs: [
          "You will need a cold water supply within about two metres, an accessible isolation valve, and ideally a braided stainless hose rather than plastic tubing. Some local codes also require a non-return valve. If there is no supply behind the fridge, budget for a plumber — it often costs as much as the price difference between models.",
          "Remember that the fridge has to be pulled out for future servicing, so leave enough slack in the line to move it at least 500 mm without stressing the connection.",
        ],
      },
      {
        heading: "Running costs",
        paragraphs: [
          "Filters typically need replacing every six months, or sooner in hard-water areas. Independent testing shows flow rates dropping by up to 40% past the rated life, which slows ice production noticeably. Factor in two filters a year when you compare total cost of ownership.",
          "Ice production itself adds a small amount to energy consumption that is not included in the label figure.",
        ],
      },
      {
        heading: "Our verdict",
        paragraphs: [
          `If you use a lot of ice — large households, frequent entertaining, hot climates — an ice maker earns its keep. The ${fd600.name} and ${hFd590.name} both performed well in our ice-production tests. If you mainly want cold water, a model with a non-plumbed filter tank such as the ${kSbs650.name} avoids the plumbing altogether.`,
          `And if you rarely use ice, skip it: models like the ${bf380.name} put that money and space into better shelving and a quieter compressor.`,
        ],
      },
    ],
    relatedProductIds: [fd600.id, hFd590.id, kSbs650.id, bf380.id, cvFd650.id],
    relatedGuideSlugs: ["french-door-vs-side-by-side", "refrigerator-reliability-what-the-data-says", "smart-fridge-features-worth-paying-for"],
    sourceIds: ["src-ice-maker-reliability", "src-water-filter-study", "src-plumbing-connection-code", `${fd600.id}:manual`, `${hFd590.id}:lab`],
  },
  {
    slug: "counter-depth-explained",
    title: "Counter-depth refrigerators explained",
    excerpt: "A counter-depth fridge sits nearly flush with your worktops for a built-in look. You give up some capacity — here is exactly how much, and when it is worth it.",
    category: "refrigerators",
    topic: "Refrigerator types",
    heroImage: images.kitchens[3],
    author: "hannah",
    publishedAt: "2025-02-17",
    updatedAt: "2026-09-04",
    sections: [
      {
        heading: "What 'counter-depth' means",
        paragraphs: [
          "Standard kitchen worktops are about 600–650 mm deep including the door fronts. A standard-depth French door fridge is typically 720–770 mm deep without handles, so it protrudes 100 mm or more into the room. A counter-depth model is designed to stop within a few centimetres of the worktop edge.",
          "It is not the same as built-in or integrated. Counter-depth fridges are still freestanding; the doors and a small part of the cabinet usually stand proud of the cabinets, and they still need side and top ventilation.",
        ],
      },
      {
        heading: "How much capacity you give up",
        paragraphs: [
          `Compare Nordvik's two French door siblings. The ${fd600.name} is ${fd600.dimensions.depthMm} mm deep with ${fd600.capacity.value} L of capacity; the ${fd540.name} is ${fd540.dimensions.depthMm} mm deep with ${fd540.capacity.value} L. That is about ${Math.round((1 - fd540.capacity.value / fd600.capacity.value) * 100)}% less volume for ${fd600.dimensions.depthMm - fd540.dimensions.depthMm} mm less depth — and a slightly higher price, ${usd(fd540.price)} against ${usd(fd600.price)}.`,
          "The shallower shelves are often easier to use, though. Fewer items get lost at the back, and in our usability panel testers found things faster in counter-depth models.",
        ],
        bullets: [
          `${fd540.name}: ${dims(fd540)}`,
          `${mCd540.name}: ${dims(mCd540)}`,
          `${kCd510.name}: ${dims(kCd510)}`,
        ],
      },
      {
        heading: "When it is worth paying for",
        paragraphs: [
          "Counter-depth makes most sense in open-plan kitchens, galley layouts where a protruding fridge narrows the walkway, and anywhere the fridge sits beside a run of tall cabinets. In a separate utility room or pantry, the extra capacity of a standard-depth model is usually the better use of money.",
          "Pay attention to the handles. Some counter-depth models quote depth without handles, which can add 50–70 mm. Check the 'Depth (excl. handles)' line in the specs and add the handle depth from the manual.",
        ],
        callout: { tone: "tip", text: "Ask whether the cabinet can be recessed slightly into the wall. Many installers can gain 20–30 mm by moving the outlet or water valve to an adjacent cabinet." },
      },
      {
        heading: "Models we rate",
        paragraphs: [
          `The ${fd540.name} is the quietest counter-depth model we have tested at ${fd540.specs.find((g) => g.id === "energy")?.items.find((i) => i.key === "noise")?.value} dB(A). The ${mCd540.name} is the shallowest at ${mCd540.dimensions.depthMm} mm and adds app control, while the ${kCd510.name} costs less but is louder and less efficient at ${kwh(kCd510)}.`,
        ],
      },
    ],
    relatedProductIds: [fd540.id, mCd540.id, kCd510.id, fd600.id],
    relatedGuideSlugs: ["how-to-measure-for-a-new-refrigerator", "french-door-vs-side-by-side", "column-refrigerators-explained"],
    sourceIds: [`${fd540.id}:spec`, `${fd600.id}:spec`, `${mCd540.id}:spec`, `${kCd510.id}:cert`, "src-kitchen-planning-clearances"],
  },
  {
    slug: "how-quiet-should-a-fridge-be",
    title: "How quiet should a fridge be?",
    excerpt: "In an open-plan home, refrigerator noise matters more than most spec sheets admit. We explain decibels, compressor types, and the models that disappeared into the background in our tests.",
    category: "refrigerators",
    topic: "Noise",
    heroImage: images.interiors[1],
    author: "tomas",
    publishedAt: "2025-06-02",
    updatedAt: "2026-10-11",
    sections: [
      {
        heading: "Decibels in plain English",
        paragraphs: [
          "Refrigerator noise is quoted in dB(A), a scale weighted toward the frequencies people hear most easily. A 3 dB increase doubles the sound energy, and roughly every 10 dB sounds twice as loud. In practice, anything under 36 dB(A) is hard to notice in a lived-in room; above 40 dB(A), most people notice the compressor starting.",
          "The figure on the energy label is measured at one metre in a quiet chamber. Your kitchen will have hard surfaces that reflect sound, so the fridge may seem a little louder at home.",
        ],
        bullets: [
          "32–35 dB(A): effectively silent in a living space",
          "36–38 dB(A): audible at night in a quiet room",
          "39–42 dB(A): noticeable during quiet conversation",
        ],
      },
      {
        heading: "Why the start-up click matters most",
        paragraphs: [
          "Listening studies show that people are more bothered by changes in sound than by a steady hum. Conventional single-speed compressors switch fully on and off, producing a click and a surge in noise several times an hour. Inverter compressors ramp up and down gently and spend most of their time running slowly.",
          "That is why two fridges with the same label figure can feel very different. In our panel, inverter models were rated less intrusive than single-speed models that measured 2–3 dB quieter at steady state.",
        ],
        callout: { tone: "info", text: "Look for 'Inverter compressor' in the features list. Qeivo flags single-speed compressors as a limitation for open-plan buyers." },
      },
      {
        heading: "The quietest models we have tested",
        paragraphs: [
          `The ${oBf370.name} is rated at just 32 dB(A) and was inaudible during conversation in our test kitchen. The ${hBf400.name} and ${c400.name} follow at 33 dB(A), and both use inverter compressors. For a large French door model, the ${oFd520.name} at 34 dB(A) is the quiet pick.`,
          `At the other end, the ${kSbs650.name} measured 42 dB(A) — fine in a separate kitchen, but worth thinking twice about in a studio apartment.`,
        ],
      },
      {
        heading: "Installation affects noise too",
        paragraphs: [
          "Level the fridge properly; a cabinet that rocks will transmit vibration into the floor. Leave the recommended ventilation gaps, because a compressor starved of airflow runs longer and harder. And avoid placing the fridge in a recess with hard walls on three sides if you can, as it acts like a sound box.",
        ],
      },
    ],
    relatedProductIds: [oBf370.id, hBf400.id, c400.id, oFd520.id, kSbs650.id],
    relatedGuideSlugs: ["why-bottom-freezer-fridges-keep-winning", "understanding-energy-labels", "column-refrigerators-explained"],
    sourceIds: ["src-fridge-noise-study", `${oBf370.id}:lab`, `${hBf400.id}:lab`, `${c400.id}:spec`, `${kSbs650.id}:lab`],
  },
  {
    slug: "best-refrigerators-for-a-family-of-four",
    title: "The best refrigerators for a family of four",
    excerpt: "Four people need roughly 450–600 litres, a sensible freezer and shelves that survive the school-lunch rush. Our shortlist balances capacity, running costs and reliability.",
    category: "refrigerators",
    topic: "Buying advice",
    heroImage: images.cooking[1],
    author: "priya",
    publishedAt: "2025-08-19",
    updatedAt: "2026-11-02",
    sections: [
      {
        heading: "How much capacity a family needs",
        paragraphs: [
          "A common rule of thumb is 100–120 litres of fridge space per person plus 50–70 litres of freezer per person if you batch-cook or buy frozen in bulk. For four people that points to roughly 450–600 litres of total capacity.",
          "Quoted capacity overstates what you can use. In our measurements, usable space ranged from 84% to 93% of the quoted figure, with dispensers and ice makers taking the biggest bite. Qeivo shows the measured usable figure on every product page.",
        ],
      },
      {
        heading: "Our shortlist",
        paragraphs: [
          `Best overall: the ${bwFd560.name}. At ${usd(bwFd560.price)} it offers ${bwFd560.capacity.value} L, a water and ice dispenser and dual cooling, and owners rate it ${bwFd560.rating}/5 across ${bwFd560.reviewCount.toLocaleString("en-US")} reviews.`,
          `Best for quiet, efficient running: the ${fd600.name}. It is more expensive at ${usd(fd600.price)}, but runs at 36 dB(A) and carries a 10-year compressor warranty.`,
          `Best value: the ${bwBf440.name}. Only ${fd600.dimensions.widthMm > bwBf440.dimensions.widthMm ? `${bwBf440.dimensions.widthMm} mm wide` : "compact"}, it suits narrower openings, costs ${usd(bwBf440.price)} and has one of the highest owner ratings in the catalogue at ${bwBf440.rating}/5.`,
        ],
        bullets: [
          `${bwFd560.name} — ${bwFd560.capacity.value} L, ${usd(bwFd560.price)}`,
          `${fd600.name} — ${fd600.capacity.value} L, ${usd(fd600.price)}`,
          `${bwBf440.name} — ${bwBf440.capacity.value} L, ${usd(bwBf440.price)}`,
          `${oFd520.name} — ${oFd520.capacity.value} L, ${usd(oFd520.price)}`,
        ],
      },
      {
        heading: "Features that matter for families",
        paragraphs: [
          "Spill-proof glass shelves with raised edges save a lot of cleaning. Humidity-controlled crispers make a real difference if you buy fruit and vegetables weekly. A fast-freeze or 'holiday' mode helps when you bring home a big shop.",
          "Through-door water dispensers are popular with children, but they reduce door storage and add a filter to replace. If your family drinks a lot of chilled water, it is worth it; otherwise a jug in the fridge does the same job.",
        ],
        callout: { tone: "tip", text: "Set your household size in your Qeivo profile and the capacity factor will be weighted for four people automatically." },
      },
      {
        heading: "Budget for the long run",
        paragraphs: [
          `A family fridge runs 24 hours a day for well over a decade. The ${oFd520.name} costs more up front than the ${kFd580.name}, but it is rated at ${kwh(oFd520)} against ${kwh(kFd580)} — a gap that pays back a good part of the price difference over its life.`,
        ],
      },
    ],
    relatedProductIds: [bwFd560.id, fd600.id, bwBf440.id, oFd520.id, kFd580.id],
    relatedGuideSlugs: ["french-door-vs-side-by-side", "understanding-energy-labels", "how-to-measure-for-a-new-refrigerator"],
    sourceIds: [`${bwFd560.id}:customers`, `${fd600.id}:spec`, `${bwBf440.id}:customers`, `${oFd520.id}:cert`, `${kFd580.id}:cert`, "src-cold-chain-food-safety"],
  },
  {
    slug: "compact-fridges-for-small-spaces",
    title: "Compact fridges for studios, offices and small kitchens",
    excerpt: "Under-counter and compact refrigerators vary hugely in noise, efficiency and build quality. What to look for when every centimetre counts.",
    category: "refrigerators",
    topic: "Buying advice",
    heroImage: images.interiors[8],
    author: "hannah",
    publishedAt: "2025-04-14",
    updatedAt: "2026-06-21",
    sections: [
      {
        heading: "Decide what the fridge is for",
        paragraphs: [
          "A compact fridge can be a main fridge in a studio, a drinks fridge in a home office, or a second fridge in a garage. Those jobs need different things. A main fridge needs a usable freezer compartment and stable temperatures; an office fridge mostly needs to be quiet; a garage fridge must cope with low ambient temperatures.",
          "Check the climate class in the manual if the fridge will live in an unheated space. Many compact models are not designed to run below 10 °C.",
        ],
      },
      {
        heading: "Noise is the hidden problem",
        paragraphs: [
          `Compact fridges often sit close to where people sleep or work. The ${oC160.name} is rated at just 33 dB(A) and uses an inverter compressor, which makes it the one we recommend for studio living. The ${kC90.name}, at ${usd(kC90.price)}, is excellent value but runs at 41 dB(A), which is noticeable in a bedroom.`,
          "Most compact fridges use static cooling and need manual defrosting. Budget ten minutes every few months to defrost and wipe down the freezer box.",
        ],
        callout: { tone: "warning", text: "Do not box a compact fridge into a tight cupboard unless it is designed for integration. Many need 20 mm of space at each side." },
      },
      {
        heading: "Our shortlist",
        paragraphs: [
          `The ${oC160.name} (${dims(oC160)}) is the best all-rounder. The ${mCube.name} is the pick for tight budgets that still want an inverter compressor. If you want a fridge-only model for drinks and fresh food, the ${sU140.name} has no freezer box and a stylish stainless finish, while the ${aU130.name} adds a retro sage-green look.`,
        ],
        bullets: [
          `${oC160.name}: ${oC160.capacity.value} L, class ${oC160.energy.rating}, ${usd(oC160.price)}`,
          `${mCube.name}: ${mCube.capacity.value} L, class ${mCube.energy.rating}, ${usd(mCube.price)}`,
          `${aU130.name}: ${aU130.capacity.value} L, class ${aU130.energy.rating}, ${usd(aU130.price)}`,
          `${kC90.name}: ${kC90.capacity.value} L, class ${kC90.energy.rating}, ${usd(kC90.price)}`,
        ],
      },
      {
        heading: "Efficiency at small sizes",
        paragraphs: [
          `Small fridges are less efficient per litre because their surface area is large relative to volume. Even so, the ${oC160.name} uses ${kwh(oC160)} — less than half the ${kC90.name}'s ${kwh(kC90)} despite being bigger. Over five years in a home office that difference covers a meaningful share of the price gap.`,
        ],
      },
    ],
    relatedProductIds: [oC160.id, mCube.id, aU130.id, kC90.id, sU140.id],
    relatedGuideSlugs: ["how-quiet-should-a-fridge-be", "understanding-energy-labels", "how-to-measure-for-a-new-refrigerator"],
    sourceIds: [`${oC160.id}:lab`, `${kC90.id}:lab`, `${mCube.id}:spec`, `${aU130.id}:spec`, "src-energy-label-methodology"],
  },
  {
    slug: "column-refrigerators-explained",
    title: "Column refrigerators: the flexible built-in alternative",
    excerpt: "Column fridges are full-height, fridge-only cabinets you pair with a matching freezer — or not. We explain the trade-offs and the price ranges.",
    category: "refrigerators",
    topic: "Refrigerator types",
    heroImage: images.kitchens[9],
    author: "hannah",
    publishedAt: "2025-09-09",
    updatedAt: "2026-08-14",
    sections: [
      {
        heading: "What a column fridge is",
        paragraphs: [
          "A column refrigerator is a tall, fridge-only cabinet — no freezer compartment at all. Designers like them because they let you put fresh food exactly where you want it, pair a fridge column with a separate freezer column, or skip the freezer entirely if you have one in a utility room.",
          `Widths vary from 600 mm to 760 mm or more. The ${c400.name} is ${c400.dimensions.widthMm} mm wide, the ${bwC385.name} is ${bwC385.dimensions.widthMm} mm, and the ${cvR480.name} stretches to ${cvR480.dimensions.widthMm} mm and ${cvR480.dimensions.heightMm} mm tall.`,
        ],
      },
      {
        heading: "Why they are so efficient",
        paragraphs: [
          `Without a freezer, a fridge only has to hold around 4 °C, which takes far less energy. The ${c400.name} is rated at ${kwh(c400)} (class ${c400.energy.rating}) for ${c400.capacity.value} L — a fraction of what a French door model of similar volume uses.`,
          "If you add a matching freezer column, of course, the combined consumption will be similar to a conventional fridge-freezer. The efficiency gain is real only if you would otherwise be running a freezer you do not fill.",
        ],
      },
      {
        heading: "Price spread",
        paragraphs: [
          `The category spans an enormous range. The ${bwC385.name} costs ${usd(bwC385.price)}; the ${c400.name} is ${usd(c400.price)}; the professional-style ${cvR480.name} is ${usd(cvR480.price)}. The extra money buys better door seals, stainless interiors, finer temperature control and — in the Corvane's case — a 12-year sealed-system warranty.`,
        ],
        callout: { tone: "info", text: `The ${cvR480.name} has comparatively few owner reviews so far. Qeivo marks its reliability score as moderate confidence until more data is in.` },
      },
      {
        heading: "Is a column fridge right for you?",
        paragraphs: [
          "Consider one if you are renovating and want a built-in look, if you already own a chest or upright freezer, or if you cook mostly from fresh ingredients. Skip it if you are replacing a single fridge-freezer in an existing kitchen: you will pay more for less flexibility.",
        ],
        bullets: [
          "Pair with a freezer column for a two-door built-in look",
          "Fit side-by-side with a 10–20 mm filler strip between cabinets",
          "Check that both columns use compatible handles and door alignment",
        ],
      },
    ],
    relatedProductIds: [c400.id, bwC385.id, cvR480.id],
    relatedGuideSlugs: ["counter-depth-explained", "understanding-energy-labels", "how-quiet-should-a-fridge-be"],
    sourceIds: [`${c400.id}:cert`, `${bwC385.id}:spec`, `${cvR480.id}:spec`, `${cvR480.id}:customers`, "src-kitchen-planning-clearances"],
  },
  {
    slug: "smart-fridge-features-worth-paying-for",
    title: "Smart fridge features worth paying for (and the ones that aren't)",
    excerpt: "App control, door alarms, convertible zones, cameras: which connected features owners keep using after the first month, and what to check about updates and privacy.",
    category: "refrigerators",
    topic: "Features",
    heroImage: images.fridgeInSitu[1],
    author: "priya",
    publishedAt: "2025-10-06",
    updatedAt: "2026-10-28",
    sections: [
      {
        heading: "What owners actually use",
        paragraphs: [
          "Connected-appliance research consistently finds that a small number of features account for nearly all ongoing use. Door-left-open alerts, temperature monitoring while away, and remote diagnostics for service engineers are the clear winners. Recipe suggestions, shopping lists and on-door entertainment are typically abandoned within weeks.",
          "That pattern matches the themes in Qeivo's review analysis. Owners mention the door alarm and holiday mode far more often than any screen-based feature.",
        ],
        bullets: [
          "Worth it: door alerts, power-cut notifications, remote temperature control",
          "Nice to have: convertible zone scheduling, energy reports",
          "Rarely used: recipe apps, calendars, music streaming",
        ],
      },
      {
        heading: "Convertible zones are the sleeper hit",
        paragraphs: [
          `A convertible zone switches between fridge, soft-freeze and freezer temperatures. It is useful for parties, holiday food and bulk buying. The ${mFd620.name} and ${hFd590.name} both include one; owners frequently describe it as the feature they did not expect to use so much.`,
        ],
      },
      {
        heading: "Treat energy-saving claims with caution",
        paragraphs: [
          "Several manufacturers claim their app can cut energy use by up to 15%. We have not seen independent evidence for those figures, and Qeivo marks them as unverified manufacturer claims on product pages. Most of the saving comes from features like holiday mode, which you can use without an app.",
        ],
        callout: { tone: "warning", text: "Manufacturer marketing is shown in Qeivo with a 'Manufacturer claim' badge and never presented as verified fact." },
      },
      {
        heading: "Updates and privacy",
        paragraphs: [
          "A fridge lasts twelve years or more; app support may not. Before paying extra for smart features, check whether the brand publishes a minimum security-update period. Only a minority of appliance makers do. Also check whether the fridge works fully offline — all of the models in our catalogue do, but some hide settings in the app.",
          "Owners of several connected models report the app losing connection after a router change. Re-pairing is usually simple, but it is a recurring theme worth knowing about.",
        ],
      },
    ],
    relatedProductIds: [mFd620.id, hFd590.id, fd600.id, aFd610.id],
    relatedGuideSlugs: ["is-a-plumbed-ice-maker-worth-it", "refrigerator-reliability-what-the-data-says", "french-door-vs-side-by-side"],
    sourceIds: ["src-smart-appliance-security", `${mFd620.id}:maker`, `${mFd620.id}:customers`, `${hFd590.id}:manual`, `${aFd610.id}:customers`],
  },
  {
    slug: "refrigerator-reliability-what-the-data-says",
    title: "Refrigerator reliability: what the data actually says",
    excerpt: "Which layouts and features break most often, how to read warranty terms, and why a 10-year compressor warranty is not the whole story.",
    category: "refrigerators",
    topic: "Reliability",
    heroImage: images.diy[0],
    author: "tomas",
    publishedAt: "2025-11-25",
    updatedAt: "2026-11-10",
    sections: [
      {
        heading: "Simple designs last longest",
        paragraphs: [
          "Owner surveys keep reaching the same conclusion: the fewer moving parts, the fewer repairs. Bottom-freezer and top-freezer models reported the lowest fault rates over five years, while models with through-door dispensers were around 1.6 times more likely to need a repair.",
          "That does not mean feature-rich fridges are bad buys, but it does mean you should weigh each convenience feature against its likely maintenance cost.",
        ],
      },
      {
        heading: "Reading the warranty",
        paragraphs: [
          "Most refrigerators come with one or two years of parts and labour cover, plus a longer warranty on the compressor or sealed system. Be careful: compressor-only cover usually pays for the part but not the labour or refrigerant re-gas, which can be most of the bill.",
          `Halden and Ovea stand out. The ${hBf400.name} combines ${hBf400.warranty.years} years of full cover with a 10-year compressor warranty, and Ovea models include ${oBf370.warranty.years} years parts and labour as standard.`,
        ],
        callout: { tone: "tip", text: "Register the appliance within 90 days. Several brands require registration to activate extended compressor cover." },
      },
      {
        heading: "How Qeivo scores reliability",
        paragraphs: [
          "Our reliability factor starts from each brand's reliability index, built from owner-reported faults, then adjusts for known failure points such as ice makers, dispensers and door-in-door mechanisms. For models launched recently, confidence is marked as moderate or low until enough long-term data is available.",
          `The top reliability scores in our catalogue currently belong to Halden models; the ${hBf400.name} has a ${hBf400.rating}/5 owner rating across ${hBf400.reviewCount.toLocaleString("en-US")} reviews.`,
        ],
      },
      {
        heading: "Signs a fridge is on its way out",
        paragraphs: [
          "Frost building up on the back wall of a frost-free fridge, a compressor that runs constantly, or water pooling under the crisper drawers are all early warnings. Many are cheap to fix — a blocked defrost drain or a worn door seal — if you catch them early.",
        ],
        bullets: [
          "Check door seals twice a year with a sheet of paper",
          "Vacuum the condenser coils annually",
          "Clear the defrost drain if water collects under the crispers",
        ],
      },
    ],
    relatedProductIds: [hBf400.id, oBf370.id, bf380.id, kSbs650.id],
    relatedGuideSlugs: ["is-a-plumbed-ice-maker-worth-it", "why-bottom-freezer-fridges-keep-winning", "smart-fridge-features-worth-paying-for"],
    sourceIds: ["src-appliance-reliability-survey-2026", "src-ice-maker-reliability", `${hBf400.id}:customers`, `${oBf370.id}:spec`, `${hBf400.id}:spec`],
  },
  {
    slug: "why-bottom-freezer-fridges-keep-winning",
    title: "Why bottom-freezer fridges keep winning our tests",
    excerpt: "The humble 600–700 mm bottom-freezer combines the best efficiency, the quietest running and the fewest faults. Here is why, and which ones to shortlist.",
    category: "refrigerators",
    topic: "Refrigerator types",
    heroImage: images.kitchens[6],
    author: "priya",
    publishedAt: "2026-01-13",
    updatedAt: "2026-10-19",
    sections: [
      {
        heading: "Efficiency by design",
        paragraphs: [
          "A bottom-freezer puts the cold, dense freezer air at the bottom where it stays when you open the drawer, and the fridge section at eye level. Fewer, better-sealed doors and a compact cabinet mean less heat leaks in. That is why every class A refrigerator in our catalogue is a bottom-freezer or a fridge-only column.",
          `The ${hBf400.name} uses ${kwh(hBf400)}, the ${oBf370.name} ${kwh(oBf370)}, and the ${bf380.name} ${kwh(bf380)}. Compare that with ${kwh(kSbs650)} for the ${kSbs650.name}.`,
        ],
      },
      {
        heading: "The best-rated models in the catalogue",
        paragraphs: [
          `The ${hBf400.name} is the highest-rated refrigerator we track at ${hBf400.rating}/5. The ${bf380.name} follows at ${bf380.rating}/5 with ${bf380.reviewCount.toLocaleString("en-US")} owner reviews, and the ${bwBf440.name} is the value pick at ${usd(bwBf440.price)}.`,
          `For panel-ready integration, the ${hBi270.name} hides behind your cabinet doors, though at ${hBi270.capacity.value} L it is noticeably smaller.`,
        ],
        bullets: [
          `${hBf400.name}: ${dims(hBf400)}`,
          `${bf380.name}: ${dims(bf380)}`,
          `${mPanel.name}: ${dims(mPanel)}`,
          `${bwBf440.name}: ${dims(bwBf440)}`,
        ],
      },
      {
        heading: "The limitations",
        paragraphs: [
          "Bottom-freezers are tall and narrow, which suits many kitchens but means the top shelf can be out of reach. Freezer drawers are fine for everyday food but awkward for very large items. And at 600–700 mm wide, capacity tops out around 440 litres — enough for most families of four, but tight for large households.",
        ],
        callout: { tone: "tip", text: `Check the height. At ${hBf400.dimensions.heightMm} mm, the ${hBf400.name} will not fit under many standard overhead cabinets.` },
      },
    ],
    relatedProductIds: [hBf400.id, bf380.id, oBf370.id, bwBf440.id, mPanel.id, hBi270.id],
    relatedGuideSlugs: ["understanding-energy-labels", "how-quiet-should-a-fridge-be", "refrigerator-reliability-what-the-data-says"],
    sourceIds: [`${hBf400.id}:lab`, `${oBf370.id}:lab`, `${bf380.id}:customers`, `${bwBf440.id}:spec`, "src-appliance-reliability-survey-2026"],
  },
  {
    slug: "side-by-side-on-a-budget",
    title: "Buying a big fridge on a budget",
    excerpt: "You can get 600+ litres for well under $2,000 — if you accept a few compromises. We weigh up running costs, noise and the features worth skipping.",
    category: "refrigerators",
    topic: "Buying advice",
    heroImage: images.kitchens[7],
    author: "priya",
    publishedAt: "2026-03-03",
    updatedAt: "2026-11-15",
    sections: [
      {
        heading: "Where budget models save money",
        paragraphs: [
          "Lower-priced large fridges typically use single-speed compressors, simpler shelving and thinner insulation. None of that stops them keeping food cold, but it shows up in noise, energy use and the feel of the drawers.",
          `The ${kSbs650.name} at ${usd(kSbs650.price)} and the ${bwSbs600.name} at ${usd(bwSbs600.price)} both offer close to 600 litres. They are rated at ${kwh(kSbs650)} and ${kwh(bwSbs600)} respectively, compared with ${kwh(sbs630)} for the pricier ${sbs630.name}.`,
        ],
      },
      {
        heading: "Do the total-cost maths",
        paragraphs: [
          `Over twelve years at $0.17/kWh, the ${kSbs650.name} will cost about ${usd(Math.round(kSbs650.energy.annualKwh * 0.17 * 12))} to run; the ${sbs630.name} about ${usd(Math.round(sbs630.energy.annualKwh * 0.17 * 12))}. The upfront saving is real, but part of it comes back on your electricity bill.`,
        ],
        callout: { tone: "info", text: "Qeivo's Compare view shows a 10-year total cost of ownership using your own tariff." },
      },
      {
        heading: "Features worth skipping",
        paragraphs: [
          "If budget is tight, the first thing to drop is the plumbed ice maker. It adds cost, installation complexity and is the most common source of repairs. Next, skip app control — most budget brands' apps are basic anyway.",
          `Keep an eye on warranty length. Kestrel models include only ${kSbs650.warranty.years} year of parts and labour as standard, so consider whether an extended plan is worth adding.`,
        ],
        bullets: [
          "Skip: plumbed ice, app control, door-in-door",
          "Keep: frost-free, LED lighting, adjustable shelves",
          "Check: warranty length and local service coverage",
        ],
      },
      {
        heading: "When to wait for a sale",
        paragraphs: [
          "Large refrigerators follow predictable discount cycles, with the deepest cuts around late November and mid-February. Set a price watch on Qeivo and we will alert you when your target price appears at a retailer you trust.",
        ],
      },
    ],
    relatedProductIds: [kSbs650.id, bwSbs600.id, sbs630.id, mSbs660.id, kTf450.id],
    relatedGuideSlugs: ["french-door-vs-side-by-side", "understanding-energy-labels", "is-a-plumbed-ice-maker-worth-it"],
    sourceIds: [`${kSbs650.id}:cert`, `${bwSbs600.id}:cert`, `${sbs630.id}:cert`, `${kSbs650.id}:spec`, "src-ice-maker-reliability"],
  },
];
