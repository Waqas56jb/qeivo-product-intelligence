import { images } from "@/data/images";
import { P, dims, kwh, usd, type GuideInput } from "./guide-helpers";

/* Washing machines */
const hW9 = P("halden-pureclean-w9");
const nW8 = P("nordvik-silkwash-w8");
const mW10 = P("maru-aiwash-w10");
const kT11 = P("kestrel-loadmaster-t11");
const bwW9 = P("brightwater-familywash-w9");
const oW8 = P("ovea-greencycle-w8");
const hWd10 = P("halden-combi-wd10");
const bwW6 = P("brightwater-compact-w6");
const mT13 = P("maru-twinload-t13");

/* Televisions */
const oled65 = P("lumora-vivid-oled65");
const oled55 = P("lumora-vivid-oled55");
const oled77 = P("lumora-studio-oled77");
const mini75 = P("vireo-lumen-miniled75");
const mini65 = P("vireo-lumen-miniled65");
const qled65 = P("maru-crystal-qled65");
const qled50 = P("maru-crystal-qled50");
const led55 = P("kestrel-view-led55");
const kq65 = P("kestrel-view-qled65");

/* Laptops */
const air14 = P("tervo-air-14");
const blaze16 = P("arclight-blaze-16");
const studio15 = P("vireo-studio-15");
const flex13 = P("tervo-flex-13");
const meridian14 = P("vireo-meridian-14");
const swift14 = P("arclight-swift-14");
const forge17 = P("arclight-forge-17");
const core15 = P("tervo-core-15");
const aero13 = P("vireo-aero-13");

export const washerGuides: GuideInput[] = [
  {
    slug: "front-vs-top-loaders",
    title: "Front loaders vs top loaders: an honest comparison",
    excerpt: "Top loaders are faster and gentler on your back; front loaders use half the water and spin clothes drier. We break down the real-world differences.",
    category: "washing-machines",
    topic: "Washer types",
    heroImage: images.laundry[3],
    author: "daniel",
    publishedAt: "2025-02-25",
    updatedAt: "2026-09-29",
    sections: [
      {
        heading: "Water and energy",
        paragraphs: [
          `Front loaders tumble clothes through a small pool of water, while agitator top loaders fill the drum. The difference is large: in independent testing front loaders used 40–55 litres per full cycle, top loaders 85–110 litres. The ${hW9.name} uses about 48 L per cycle; the ${kT11.name} about 92 L.`,
          `Energy follows water, because most of a washer's electricity goes into heating it. The ${hW9.name} is rated at ${kwh(hW9)} on the standard programme, against ${kwh(kT11)} for the ${kT11.name}.`,
        ],
      },
      {
        heading: "Spin speed and drying time",
        paragraphs: [
          "Front loaders typically spin at 1,200–1,600 rpm, top loaders at 700–900 rpm. Higher spin speeds leave clothes noticeably drier, which cuts tumble-dryer time — often the bigger energy cost in a laundry routine.",
          `The ${oW8.name} spins at 1,600 rpm, the fastest in our catalogue, while the ${mT13.name} top loader spins at 900 rpm.`,
        ],
        callout: { tone: "tip", text: "If you tumble-dry most loads, a high spin speed can save more energy than the washer's own label class." },
      },
      {
        heading: "Ergonomics and cycle time",
        paragraphs: [
          "Top loaders have real advantages. You do not need to bend down to load them, you can add a forgotten sock mid-cycle, and quick cycles are genuinely quick. Many buyers with back or knee problems choose them for exactly that reason.",
          "Front loaders can be raised on a pedestal, and many now have an add-garment door. They also stack with a dryer, which matters in small laundry rooms.",
        ],
        bullets: [
          "Top loader: easier loading, faster cycles, more water",
          "Front loader: less water, drier clothes, stackable",
          "Both: check drum capacity in kg, not litres",
        ],
      },
      {
        heading: "Which should you buy?",
        paragraphs: [
          `For most households we recommend a front loader — the ${bwW9.name} at ${usd(bwW9.price)} is our value pick and the ${hW9.name} our overall favourite. If you need very large loads and prefer to load from the top, the ${mT13.name} handles 13 kg and is gentler on fabrics than older agitator designs.`,
        ],
      },
    ],
    relatedProductIds: [hW9.id, kT11.id, oW8.id, mT13.id, bwW9.id],
    relatedGuideSlugs: ["washing-machine-energy-and-water-use", "choosing-washing-machine-capacity", "are-washer-dryers-worth-it"],
    sourceIds: ["src-laundry-water-study", "src-washer-test-method", `${hW9.id}:lab`, `${kT11.id}:lab`, `${oW8.id}:spec`],
  },
  {
    slug: "are-washer-dryers-worth-it",
    title: "Are washer-dryers worth it?",
    excerpt: "One machine instead of two saves space, but drying capacity is smaller and cycles are long. When a washer-dryer makes sense, and when it doesn't.",
    category: "washing-machines",
    topic: "Washer types",
    heroImage: images.laundry[0],
    author: "daniel",
    publishedAt: "2025-07-15",
    updatedAt: "2026-08-06",
    sections: [
      {
        heading: "The space argument",
        paragraphs: [
          "If you have room for only one appliance — a flat with a single under-counter slot, or a narrow utility cupboard — a washer-dryer is the only way to get machine drying. It fits a standard 600 mm space and needs no extra venting on condenser models.",
          `The ${hWd10.name} measures ${dims(hWd10)}, essentially the same footprint as a regular front loader.`,
        ],
      },
      {
        heading: "Drying capacity is the catch",
        paragraphs: [
          "Washer-dryers dry roughly 55–65% of their wash capacity in one go. A 10 kg washer-dryer typically dries 6 kg, so a full wash load must be split, or dried in two stages. Full wash-and-dry cycles in testing averaged well over five hours.",
          "They also use more energy than a modern heat-pump dryer. If you have space for a stacked pair, that remains the more efficient choice.",
        ],
        callout: { tone: "warning", text: "Overloading the drying stage is the main cause of creased, damp-at-the-centre laundry. Follow the drying load limit, not the wash load." },
      },
      {
        heading: "Who should buy one",
        paragraphs: [
          "Washer-dryers suit couples and small households who wash little and often, people in rented flats without a dryer vent, and anyone who mainly needs drying for bedding and towels in winter. Large families who dry most loads will find the long cycles frustrating.",
        ],
        bullets: [
          "Good fit: 1–3 people, small homes, occasional drying",
          "Poor fit: daily laundry for 4+, heavy reliance on machine drying",
        ],
      },
      {
        heading: "Our pick",
        paragraphs: [
          `The ${hWd10.name} (${usd(hWd10.price)}) is the washer-dryer we recommend. It is rated class ${hWd10.energy.rating} with Wi-Fi diagnostics and a 1,400 rpm spin, and Halden's 10-year motor warranty is reassuring for a machine doing two jobs.`,
        ],
      },
    ],
    relatedProductIds: [hWd10.id, hW9.id, mW10.id],
    relatedGuideSlugs: ["front-vs-top-loaders", "choosing-washing-machine-capacity", "washing-machine-energy-and-water-use"],
    sourceIds: ["src-washer-dryer-drying", `${hWd10.id}:spec`, `${hWd10.id}:cert`, `${hWd10.id}:review`],
  },
  {
    slug: "washing-machine-energy-and-water-use",
    title: "Washing machine energy and water use, explained",
    excerpt: "How the eco programme is tested, why your real bills differ, and the simple habits that cut running costs more than upgrading the machine.",
    category: "washing-machines",
    topic: "Energy & running costs",
    heroImage: images.laundry[2],
    author: "daniel",
    publishedAt: "2025-05-20",
    updatedAt: "2026-07-12",
    sections: [
      {
        heading: "How the label is measured",
        paragraphs: [
          "Washing machine labels are based on the eco 40–60 programme, tested at full, half and quarter loads and weighted. The programme washes at a lower temperature for longer, which is why it can take over three hours.",
          "If you mostly use quick or hot programmes, your real consumption will be higher than the label. Heating water is where most of the energy goes.",
        ],
      },
      {
        heading: "Comparing models",
        paragraphs: [
          `The most efficient machine we track is the ${oW8.name} at ${kwh(oW8)} and around 42 L of water per cycle. The ${hW9.name} follows at ${kwh(hW9)}. Top loaders such as the ${kT11.name} use ${kwh(kT11)} and more than twice the water.`,
        ],
        bullets: [
          `${oW8.name}: class ${oW8.energy.rating}, ${kwh(oW8)}`,
          `${hW9.name}: class ${hW9.energy.rating}, ${kwh(hW9)}`,
          `${bwW9.name}: class ${bwW9.energy.rating}, ${kwh(bwW9)}`,
          `${kT11.name}: class ${kT11.energy.rating}, ${kwh(kT11)}`,
        ],
      },
      {
        heading: "Habits that matter more",
        paragraphs: [
          "Washing at 30 °C instead of 40 °C cuts energy per cycle by roughly a third, and modern detergents are designed for it. Running full loads is the next biggest saving. Auto-dosing helps too: overdosing detergent causes extra rinses on many machines.",
        ],
        callout: { tone: "tip", text: "Use the eco programme for everyday loads even if it looks slow — it is the cheapest to run on every machine we have tested." },
      },
    ],
    relatedProductIds: [oW8.id, hW9.id, bwW9.id, kT11.id],
    relatedGuideSlugs: ["front-vs-top-loaders", "understanding-energy-labels", "choosing-washing-machine-capacity"],
    sourceIds: ["src-washer-test-method", "src-laundry-water-study", `${oW8.id}:cert`, `${hW9.id}:cert`, `${kT11.id}:cert`],
  },
  {
    slug: "choosing-washing-machine-capacity",
    title: "What drum size do you need?",
    excerpt: "From a 6 kg compact to a 13 kg top loader — matching drum size to your household, and why bigger is not always better.",
    category: "washing-machines",
    topic: "Buying advice",
    heroImage: images.laundry[4],
    author: "daniel",
    publishedAt: "2025-09-30",
    updatedAt: "2026-09-12",
    sections: [
      {
        heading: "A rough guide",
        paragraphs: [
          "Capacity is quoted as the dry weight of cotton the drum can wash. Most households fill a machine to about two-thirds in practice, so the quoted figure is a ceiling rather than an everyday load.",
        ],
        bullets: [
          "1–2 people: 6–8 kg",
          "3–4 people: 8–10 kg",
          "5+ people or frequent bedding washes: 10 kg and above",
        ],
      },
      {
        heading: "Bigger drums, bigger running costs?",
        paragraphs: [
          "Larger machines are efficient when full, but if you regularly run half-loads you will use more water and energy per item than with a smaller drum. Many machines have load sensing that reduces water use for smaller loads, but the drum still has to heat and turn.",
          `If space is tight, the ${bwW6.name} is only ${bwW6.dimensions.depthMm} mm deep — ideal for narrow utility cupboards and older flats.`,
        ],
        callout: { tone: "info", text: "A 9 kg drum comfortably takes a king-size duvet; most 7 kg drums do not." },
      },
      {
        heading: "Models by household",
        paragraphs: [
          `For couples, the ${nW8.name} (${nW8.capacity.value} kg) is quiet and efficient. Families of four are well served by the ${bwW9.name} or ${hW9.name}, both ${hW9.capacity.value} kg. Large households who wash daily should look at the ${mW10.name} or the ${mT13.name}.`,
        ],
      },
    ],
    relatedProductIds: [bwW6.id, nW8.id, bwW9.id, hW9.id, mW10.id, mT13.id],
    relatedGuideSlugs: ["front-vs-top-loaders", "washing-machine-energy-and-water-use", "are-washer-dryers-worth-it"],
    sourceIds: ["src-washer-test-method", `${bwW6.id}:spec`, `${nW8.id}:spec`, `${mW10.id}:spec`],
  },
];

export const tvGuides: GuideInput[] = [
  {
    slug: "oled-vs-mini-led",
    title: "OLED vs Mini-LED: which TV technology should you choose?",
    excerpt: "OLED delivers perfect blacks; Mini-LED goes far brighter. Your room, your content and your viewing habits decide which wins.",
    category: "televisions",
    topic: "Display technology",
    heroImage: images.tvs[0],
    author: "mei",
    publishedAt: "2025-03-27",
    updatedAt: "2026-10-23",
    featured: true,
    sections: [
      {
        heading: "How each technology works",
        paragraphs: [
          "Every pixel on an OLED panel produces its own light and can switch off completely. That gives perfect black levels, pixel-level contrast and wide viewing angles. Mini-LED TVs are LCDs with a backlight made of thousands of tiny LEDs grouped into local-dimming zones; they can get much brighter, but light can bleed around bright objects on dark backgrounds.",
          "Both are excellent today. The question is which compromise suits your room.",
        ],
      },
      {
        heading: "Brightness and bright rooms",
        paragraphs: [
          `In our measurements the ${mini75.name} peaked at 2,400 nits on a 10% window, and the ${mini65.name} at 2,100 nits. The ${oled65.name} reached 1,300 nits — very good for OLED, but noticeably dimmer, especially on full-screen bright content where OLEDs limit brightness to protect the panel.`,
          "If your living room gets direct sunlight, or you watch a lot of daytime sport, Mini-LED's extra headroom is a genuine advantage.",
        ],
        callout: { tone: "info", text: "Peak brightness figures depend on window size. Qeivo reports 10% window measurements, which are comparable across models." },
      },
      {
        heading: "Contrast and dark rooms",
        paragraphs: [
          "For films in a dim room, OLED is still the reference. Stars on a black sky stay pin-sharp with no halo, and shadow detail is excellent. Mini-LED has closed the gap a lot, but the best local dimming still shows faint blooming around subtitles and bright highlights.",
          "Viewing angles also favour OLED. If your seating is spread around the room, colours and contrast hold up far better off-axis.",
        ],
      },
      {
        heading: "Burn-in: how worried should you be?",
        paragraphs: [
          "Long-term testing shows modern OLED panels hold up well to varied viewing. Faint retention appeared only in deliberate stress tests with static logos running many hours a day. If the TV will display a news ticker or game HUD for hours daily, Mini-LED is the lower-risk choice; for mixed viewing, burn-in is no longer a reason to avoid OLED.",
        ],
        bullets: [
          "Vary content; avoid leaving static channels on for days",
          "Leave pixel-refresh routines enabled",
          "Check the warranty for panel retention cover",
        ],
      },
      {
        heading: "Our recommendations",
        paragraphs: [
          `Dark-room film fans: the ${oled65.name} (${usd(oled65.price)}) or, for a larger screen, the ${oled77.name}. Bright rooms and sport: the ${mini65.name} at ${usd(mini65.price)} is exceptional value. On a tighter budget, the ${qled65.name} delivers a good 120 Hz picture for ${usd(qled65.price)}.`,
        ],
      },
    ],
    relatedProductIds: [oled65.id, oled77.id, mini75.id, mini65.id, qled65.id],
    relatedGuideSlugs: ["what-size-tv-for-your-room", "tv-features-for-gaming", "reading-tv-brightness-specs"],
    sourceIds: ["src-display-measurement-method", "src-oled-burn-in-study", `${mini75.id}:lab`, `${oled65.id}:lab`, `${mini65.id}:lab`],
  },
  {
    slug: "what-size-tv-for-your-room",
    title: "What size TV is right for your room?",
    excerpt: "Most people who upgrade wish they had gone bigger. Use seating distance, not room size, to choose — and measure your wall and stand first.",
    category: "televisions",
    topic: "Buying advice",
    heroImage: images.interiors[3],
    author: "mei",
    publishedAt: "2025-06-24",
    updatedAt: "2026-09-08",
    sections: [
      {
        heading: "Seating distance is what matters",
        paragraphs: [
          "With 4K content, you can sit much closer than older advice suggests without seeing pixels. A comfortable viewing angle is 30–40°. For a sofa 2.5 metres from the screen, that works out at 65 to 77 inches; at 2 metres, 55 to 65 inches.",
          "If in doubt, go up a size. In owner surveys, 'too big' is a rare complaint; 'wish I had gone bigger' is common.",
        ],
        bullets: [
          "1.5–2.0 m: 50–55 inch",
          "2.0–2.5 m: 55–65 inch",
          "2.5–3.0 m: 65–77 inch",
        ],
      },
      {
        heading: "Measure the furniture",
        paragraphs: [
          `Check the TV's width against your stand or wall space. The ${oled65.name} is ${oled65.dimensions.widthMm} mm wide; the ${oled77.name} is ${oled77.dimensions.widthMm} mm. Feet placement matters too — some sets use widely spaced feet that need a stand almost as wide as the TV.`,
        ],
        callout: { tone: "tip", text: "Cut a cardboard template to the TV's width and height and tape it to the wall for a day. It is the fastest way to settle a size debate." },
      },
      {
        heading: "Size versus picture quality",
        paragraphs: [
          `On a fixed budget you will often choose between a bigger, simpler TV and a smaller, better one. For films in a dark room, a smaller OLED usually looks better than a larger budget LED. For sport and casual viewing in daylight, size tends to win: the ${kq65.name} at ${usd(kq65.price)} is a lot of screen for the money, while the ${oled55.name} costs ${usd(oled55.price)}.`,
        ],
      },
    ],
    relatedProductIds: [oled55.id, oled65.id, oled77.id, kq65.id, qled50.id],
    relatedGuideSlugs: ["oled-vs-mini-led", "reading-tv-brightness-specs", "tv-features-for-gaming"],
    sourceIds: ["src-viewing-distance-guidance", `${oled65.id}:spec`, `${oled77.id}:spec`, `${kq65.id}:spec`],
  },
  {
    slug: "tv-features-for-gaming",
    title: "The TV features that matter for gaming",
    excerpt: "HDMI 2.1, 120 Hz, VRR and low input lag — what each one does, and which TVs in our catalogue deliver them properly.",
    category: "televisions",
    topic: "Gaming",
    heroImage: images.tvs[3],
    author: "mei",
    publishedAt: "2025-11-04",
    updatedAt: "2026-11-05",
    sections: [
      {
        heading: "Refresh rate and HDMI 2.1",
        paragraphs: [
          "Current consoles and gaming PCs can output 4K at 120 frames per second, but only over HDMI 2.1 and only to a TV with a native 120 Hz (or faster) panel. A 60 Hz TV will cap you at 60 fps however powerful your console.",
          `The ${mini65.name} and ${mini75.name} go up to 144 Hz, which PC players can use. The Lumora OLEDs and the ${qled65.name} run at 120 Hz. The ${led55.name}, ${kq65.name} and ${qled50.name} are 60 Hz panels.`,
        ],
      },
      {
        heading: "Variable refresh rate and input lag",
        paragraphs: [
          "VRR lets the TV match its refresh to the frame rate the console produces, eliminating tearing and judder when frame rates fluctuate. Input lag is the delay between pressing a button and seeing the result; under 10 ms is imperceptible to most players.",
          "All the 120 Hz models we track measured under 10 ms at 120 Hz in game mode. Turn off motion smoothing and other processing for the lowest latency.",
        ],
        callout: { tone: "tip", text: "Use the HDMI port labelled 4K 120 or HDMI 2.1 — on some TVs not every port supports full bandwidth." },
      },
      {
        heading: "Burn-in and gaming HUDs",
        paragraphs: [
          "Games with static health bars or mini-maps are the main burn-in risk on OLED. If you play the same game for many hours a day, enable logo dimming and pixel shift, or consider a Mini-LED.",
        ],
        bullets: [
          "Best for competitive play: high refresh, low lag, VRR",
          "Best for cinematic games: OLED contrast and HDR",
          "Avoid: 60 Hz panels if you own a current-generation console",
        ],
      },
    ],
    relatedProductIds: [mini65.id, mini75.id, oled65.id, qled65.id, led55.id],
    relatedGuideSlugs: ["oled-vs-mini-led", "reading-tv-brightness-specs", "what-size-tv-for-your-room"],
    sourceIds: ["src-gaming-latency-method", "src-oled-burn-in-study", `${mini65.id}:spec`, `${qled65.id}:lab`, `${led55.id}:spec`],
  },
  {
    slug: "reading-tv-brightness-specs",
    title: "How to read TV brightness and HDR specs",
    excerpt: "Peak nits, window sizes and HDR formats explained — and why two TVs with the same headline figure can look completely different.",
    category: "televisions",
    topic: "Display technology",
    heroImage: images.tvs[1],
    author: "mei",
    publishedAt: "2026-02-17",
    updatedAt: "2026-10-30",
    sections: [
      {
        heading: "What a nit is",
        paragraphs: [
          "Brightness is measured in nits (candelas per square metre). HDR content is mastered with highlights well above 1,000 nits, so a TV that can reach those levels shows sun glints, explosions and specular reflections with real impact.",
          "Manufacturers rarely publish brightness, and when they do it is often a best-case figure. Qeivo uses independent measurements wherever possible.",
        ],
      },
      {
        heading: "Window size changes everything",
        paragraphs: [
          "A TV can typically go much brighter on a small highlight than on a full white screen. Our figures are measured on a 10% window, the most representative size for HDR highlights. Full-screen brightness is reported separately in each product's lab data.",
          `For reference: the ${mini75.name} peaks at 2,400 nits, the ${oled65.name} at 1,300, the ${qled65.name} at 900, and the ${led55.name} at 350 — not enough for convincing HDR.`,
        ],
        callout: { tone: "warning", text: "A TV that accepts HDR signals is not necessarily capable of displaying them well. Below about 600 nits, HDR often looks dimmer than SDR." },
      },
      {
        heading: "HDR formats",
        paragraphs: [
          "Dynamic HDR formats such as Dolby Vision adjust tone mapping scene by scene, which helps TVs that cannot reach the content's mastering brightness. Support varies by brand; check the features list for each model.",
        ],
        bullets: [
          "HDR10: universal baseline",
          "Dolby Vision: dynamic metadata, widely used by streaming services",
          "Brightness matters more than format support",
        ],
      },
    ],
    relatedProductIds: [mini75.id, oled65.id, qled65.id, led55.id],
    relatedGuideSlugs: ["oled-vs-mini-led", "tv-features-for-gaming", "what-size-tv-for-your-room"],
    sourceIds: ["src-display-measurement-method", `${mini75.id}:lab`, `${oled65.id}:lab`, `${led55.id}:lab`],
  },
];

export const laptopGuides: GuideInput[] = [
  {
    slug: "how-much-ram-do-you-need",
    title: "How much RAM do you really need?",
    excerpt: "8 GB, 16 GB or 32 GB? We measured real workloads to find out where memory runs out — and why soldered RAM changes the decision.",
    category: "laptops",
    topic: "Specifications",
    heroImage: images.laptops[2],
    author: "samuel",
    publishedAt: "2025-04-29",
    updatedAt: "2026-10-07",
    sections: [
      {
        heading: "What we measured",
        paragraphs: [
          "We ran common workloads on identical machines and recorded peak memory use. A browser with 30 tabs, a video call and an office suite peaked at about 11 GB. Editing large RAW photos peaked at 19 GB, and a 4K video timeline went past 26 GB.",
          "When a laptop runs out of RAM it swaps to the SSD. Modern SSDs are fast, so it rarely crashes — but everything gets noticeably sluggish, and battery life falls.",
        ],
        bullets: [
          "8 GB: light browsing and documents only; tight today",
          "16 GB: the right amount for most people",
          "32 GB: photo and video editing, development, heavy multitasking",
        ],
      },
      {
        heading: "Why 8 GB is now a compromise",
        paragraphs: [
          `The ${aero13.name} is a lovely, light machine at ${aero13.dimensions.weightKg} kg, but its 8 GB of memory is the main limitation we flag. In our multitasking test it began swapping heavily once a video call was added to a busy browser session.`,
        ],
        callout: { tone: "warning", text: "Many thin laptops solder their memory to the motherboard. If you cannot upgrade later, buy the amount you will need in three to four years." },
      },
      {
        heading: "Upgradeable vs soldered memory",
        paragraphs: [
          `A few models still let you add memory later. The ${air14.name}, ${meridian14.name} and ${core15.name} all have upgradeable RAM, which makes 16 GB a safe starting point. Most ultra-thin machines, including the ${swift14.name}, do not.`,
        ],
      },
      {
        heading: "Our recommendations",
        paragraphs: [
          `For everyday work and study, 16 GB: the ${air14.name} (${usd(air14.price)}) or the ${core15.name} (${usd(core15.price)}). For creative work, 32 GB: the ${studio15.name} at ${usd(studio15.price)}.`,
        ],
      },
    ],
    relatedProductIds: [aero13.id, air14.id, meridian14.id, core15.id, studio15.id, swift14.id],
    relatedGuideSlugs: ["laptop-battery-life-claims-vs-reality", "choosing-a-laptop-for-work-and-study", "repairable-laptops-why-it-matters"],
    sourceIds: ["src-ram-workload-study", "src-laptop-repairability-index", `${aero13.id}:lab`, `${air14.id}:spec`, `${studio15.id}:spec`],
  },
  {
    slug: "laptop-battery-life-claims-vs-reality",
    title: "Laptop battery life: claims vs reality",
    excerpt: "Manufacturer battery figures are typically 25–40% higher than what you will see in daily use. Here is why, and how we test.",
    category: "laptops",
    topic: "Battery",
    heroImage: images.laptops[5],
    author: "samuel",
    publishedAt: "2025-08-05",
    updatedAt: "2026-09-21",
    sections: [
      {
        heading: "Why claims are optimistic",
        paragraphs: [
          "Manufacturers usually quote battery life from local video playback at low brightness with wireless radios mostly idle. It is a legitimate test, but not how anyone uses a laptop. Our rundown test loops real websites at 150 nits with Wi-Fi active.",
        ],
      },
      {
        heading: "The numbers",
        paragraphs: [
          `The ${air14.name} is claimed at 18 hours and measured 13.2 hours in our test — still the best result in the catalogue. The ${meridian14.name} managed 12.1 hours against a 16-hour claim. Gaming machines fall furthest: the ${forge17.name} is claimed at 6 hours and lasted 3.9.`,
        ],
        bullets: [
          `${air14.name}: claimed 18 h, measured 13.2 h`,
          `${meridian14.name}: claimed 16 h, measured 12.1 h`,
          `${flex13.name}: claimed 15 h, measured 11.4 h`,
          `${blaze16.name}: claimed 8 h, measured 4.6 h`,
        ],
        callout: { tone: "info", text: "Qeivo shows both figures on every laptop page. Manufacturer claims carry a 'Manufacturer' badge; our measurements are marked 'Measured'." },
      },
      {
        heading: "Getting more from your battery",
        paragraphs: [
          "Screen brightness is the single biggest factor. Dropping from full brightness to a comfortable indoor level can add hours. Battery-saver modes, closing background sync apps and using the browser's efficiency mode also help.",
          "For long-term battery health, many laptops offer a charge limit of 80%; use it if the laptop lives on a desk most of the time.",
        ],
      },
    ],
    relatedProductIds: [air14.id, meridian14.id, flex13.id, blaze16.id, forge17.id],
    relatedGuideSlugs: ["how-much-ram-do-you-need", "choosing-a-laptop-for-work-and-study", "repairable-laptops-why-it-matters"],
    sourceIds: ["src-battery-test-method", `${air14.id}:lab`, `${meridian14.id}:lab`, `${forge17.id}:lab`, `${air14.id}:maker`],
  },
  {
    slug: "choosing-a-laptop-for-work-and-study",
    title: "Choosing a laptop for work and study",
    excerpt: "Weight, keyboard, battery and ports matter more than raw speed for most people. A practical checklist with our current picks.",
    category: "laptops",
    topic: "Buying advice",
    heroImage: images.laptops[0],
    author: "samuel",
    publishedAt: "2025-12-09",
    updatedAt: "2026-11-12",
    sections: [
      {
        heading: "Prioritise portability and battery",
        paragraphs: [
          "If you carry a laptop every day, weight and battery life will shape your experience far more than processor benchmarks. Under 1.4 kg and over 10 hours of measured battery life is a good target.",
          `The ${air14.name} (${air14.dimensions.weightKg} kg) and ${meridian14.name} (${meridian14.dimensions.weightKg} kg) both meet it comfortably.`,
        ],
      },
      {
        heading: "Keyboard, screen and ports",
        paragraphs: [
          "A backlit keyboard is essential for lecture halls and evening flights. A 14-inch screen is the sweet spot between portability and comfortable split-screen work. Check for at least two USB-C ports with charging, and consider whether you need HDMI or a card reader.",
        ],
        bullets: [
          "Backlit keyboard",
          "At least 16 GB RAM, ideally upgradeable",
          "Two or more USB-C ports with charging",
          "Fingerprint reader for quick sign-in",
        ],
      },
      {
        heading: "Our picks",
        paragraphs: [
          `Best overall: the ${air14.name}. Best for business fleets: the ${meridian14.name}, with Thunderbolt and upgradeable memory. Best on a budget: the ${core15.name} at ${usd(core15.price)}. If you want a tablet mode for note-taking, the ${flex13.name} is a well-built 2-in-1.`,
        ],
        callout: { tone: "tip", text: "Student and education pricing is often available from retailers — set a price watch to catch back-to-school promotions." },
      },
    ],
    relatedProductIds: [air14.id, meridian14.id, core15.id, flex13.id, swift14.id],
    relatedGuideSlugs: ["how-much-ram-do-you-need", "laptop-battery-life-claims-vs-reality", "repairable-laptops-why-it-matters"],
    sourceIds: ["src-battery-test-method", `${air14.id}:review`, `${meridian14.id}:spec`, `${core15.id}:spec`],
  },
  {
    slug: "repairable-laptops-why-it-matters",
    title: "Repairable laptops: why it matters and who does it best",
    excerpt: "A replaceable battery, standard screws and available parts can add years to a laptop's life. We look at which brands make repair realistic.",
    category: "laptops",
    topic: "Sustainability",
    heroImage: images.diy[5],
    author: "samuel",
    publishedAt: "2026-04-14",
    updatedAt: "2026-10-16",
    sections: [
      {
        heading: "What makes a laptop repairable",
        paragraphs: [
          "Independent repairability indexes look at fastener types, whether batteries are glued, part availability and published documentation. Soldered memory and storage are the most common reasons for low scores.",
          "A repairable laptop is not just for enthusiasts: a battery swap after four years is the difference between a machine you replace and one you keep.",
        ],
      },
      {
        heading: "Brand differences",
        paragraphs: [
          `Tervo designs its laptops around repair, with standard screws, published guides and parts available for at least seven years. The ${air14.name} and ${core15.name} both have upgradeable memory. Arclight's gaming laptops are upgradeable too, while most ultra-thin models — including the ${swift14.name} and ${aero13.name} — are not.`,
        ],
        callout: { tone: "info", text: "Opening a laptop yourself does not void the warranty in many regions, but check the manufacturer's terms first." },
      },
      {
        heading: "Planning for the long term",
        paragraphs: [
          "Buy enough storage and memory up front if they are soldered. Check how long the manufacturer commits to software and firmware updates. And keep the original charger: replacement high-wattage chargers are often surprisingly expensive.",
        ],
        bullets: ["Check part availability before buying", "Prefer upgradeable RAM where available", "Note the warranty length — Tervo offers 3 years as standard"],
      },
    ],
    relatedProductIds: [air14.id, core15.id, flex13.id, swift14.id, blaze16.id],
    relatedGuideSlugs: ["how-much-ram-do-you-need", "choosing-a-laptop-for-work-and-study", "laptop-battery-life-claims-vs-reality"],
    sourceIds: ["src-laptop-repairability-index", `${air14.id}:spec`, `${core15.id}:spec`, `${swift14.id}:review`],
  },
];
