import { P, dims, type SectionInput } from "./guide-helpers";

const bwBf440 = P("brightwater-family-bf440");
const kBf420 = P("kestrel-homebase-bf420");
const oW8 = P("ovea-greencycle-w8");
const bwW6 = P("brightwater-compact-w6");
const mW10 = P("maru-aiwash-w10");
const oled77 = P("lumora-studio-oled77");
const mini75 = P("vireo-lumen-miniled75");
const qled50 = P("maru-crystal-qled50");
const oled65 = P("lumora-vivid-oled65");
const forge17 = P("arclight-forge-17");
const blaze16 = P("arclight-blaze-16");
const meridian14 = P("vireo-meridian-14");
const flex13 = P("tervo-flex-13");
const core15 = P("tervo-core-15");
const air14 = P("tervo-air-14");

/**
 * Additional editorial sections, inserted before each guide's closing section.
 * Kept separate so the main guide files stay readable.
 */
export const extraSections: Record<string, SectionInput[]> = {
  "why-bottom-freezer-fridges-keep-winning": [
    {
      heading: "Freezer drawers: what to check in the shop",
      paragraphs: [
        "Pull every drawer fully out. The best designs run on telescopic rails and extend far enough to see the back; cheaper ones stop two-thirds of the way, which is where forgotten bags of peas go to die. Check the drawer fronts feel rigid when loaded — flimsy fronts are the most common cosmetic complaint after a year or two.",
        `Count the drawers too. Three shallow drawers are easier to organise than two deep ones. The ${kBf420.name} uses three, while the ${bwBf440.name} pairs two drawers with a flip-down shelf for pizzas and trays.`,
      ],
      bullets: ["Full-extension rails", "Three or more drawers or a divider", "Fast-freeze for big shops", "Frost-free operation"],
    },
  ],
  "washing-machine-energy-and-water-use": [
    {
      heading: "Spin speed and the hidden dryer cost",
      paragraphs: [
        "If you use a tumble dryer, the washer's spin speed can matter more than its own energy class. Clothes spun at 1,600 rpm leave the drum with noticeably less water than at 1,200 rpm, and every litre left in the fabric has to be evaporated by the dryer.",
        `That is one reason the ${oW8.name} looks so good on total running cost: it combines a class ${oW8.energy.rating} rating with a 1,600 rpm spin. Lower spin speeds remain kinder to delicates, so use a gentler spin for wool and silk.`,
      ],
      callout: { tone: "info", text: "Qeivo's running-cost calculator assumes an eco 40–60 cycle four times a week. Change the frequency in Compare to match your household." },
    },
  ],
  "choosing-washing-machine-capacity": [
    {
      heading: "Check the depth as well as the drum",
      paragraphs: [
        `Drum size and cabinet depth are linked. Most 9–10 kg front loaders are around 590–620 mm deep, which is fine under a standard worktop but can stop a door closing in a narrow cupboard. The ${bwW6.name} is ${dims(bwW6)}, while the ${mW10.name} is ${dims(mW10)}.`,
        "Remember to add 50–80 mm behind the machine for hoses, and check that the door can open fully if the machine sits beside a wall. A door that only opens to 90° makes unloading bulky items like duvets surprisingly awkward.",
      ],
    },
  ],
  "what-size-tv-for-your-room": [
    {
      heading: "Wall-mounting versus a stand",
      paragraphs: [
        "Wall-mounting lets you go bigger without crowding the room, and puts the screen at a better height if you sit well back. Aim for the centre of the screen to be roughly at seated eye level — typically 1,000–1,100 mm from the floor. Many people mount TVs too high, above a fireplace for example, which is uncomfortable over a long film.",
        `Check the weight and mounting pattern before buying a bracket. Large sets such as the ${oled77.name} or ${mini75.name} need a bracket rated well above the TV's weight and fixings suited to your wall type.`,
      ],
      callout: { tone: "warning", text: "Plasterboard alone cannot safely carry a large TV. Fix into studs or use fixings rated for the load." },
    },
  ],
  "tv-features-for-gaming": [
    {
      heading: "HDR gaming and brightness",
      paragraphs: [
        `Many modern games are mastered in HDR, and the same brightness rules apply as for films. A bright Mini-LED such as the ${mini75.name} gives HDR highlights real punch in a sunlit room, while OLEDs such as the ${oled65.name} excel in a dim room with perfect black levels.`,
        `Budget 60 Hz sets such as the ${qled50.name} are fine for casual games and streaming but cannot show 120 fps, and HDR is limited by their lower peak brightness. If gaming is a priority, that is where to spend extra money.`,
      ],
    },
  ],
  "reading-tv-brightness-specs": [
    {
      heading: "Brightness for your room",
      paragraphs: [
        "In a dim room, 600–800 nits of highlight brightness looks excellent, and an OLED's contrast will matter more than an extra thousand nits. In a bright room with windows facing the screen, more brightness and a good anti-glare coating make the biggest difference.",
        "Do not forget sustained brightness. Some TVs hit impressive peaks briefly and then dim during bright scenes such as snow or daytime sport. Our lab data includes a full-screen figure for every TV so you can see how much each set holds back.",
      ],
      bullets: ["Dark room: prioritise contrast", "Mixed room: 800+ nits", "Bright room: 1,500+ nits and anti-glare"],
    },
  ],
  "laptop-battery-life-claims-vs-reality": [
    {
      heading: "Why gaming laptops fall furthest",
      paragraphs: [
        `Gaming laptops carry powerful processors and discrete graphics that draw power even when idle, and high-refresh screens add more. The ${blaze16.name} measured 4.6 hours and the ${forge17.name} 3.9 hours in our light browsing test; while gaming, expect closer to 90 minutes.`,
        "If you need both gaming performance and long battery life, check whether the laptop can switch off the discrete GPU entirely in battery mode. On many machines this adds two to three hours.",
      ],
      callout: { tone: "tip", text: "Treat a gaming laptop as a portable desktop. Plan to be near a socket for anything heavier than email." },
    },
  ],
  "choosing-a-laptop-for-work-and-study": [
    {
      heading: "Business features worth having",
      paragraphs: [
        `If your employer manages your laptop, they may require a fingerprint reader or IR camera for sign-in, a TPM security chip and a minimum warranty term. The ${meridian14.name} ticks those boxes with Thunderbolt 4 for a single-cable desk dock and a 3-year warranty.`,
        `For students, a 2-in-1 such as the ${flex13.name} makes handwritten notes and annotating PDFs easy. A 15.6-inch machine like the ${core15.name} has a more comfortable screen for spreadsheets but is noticeably heavier at ${core15.dimensions.weightKg} kg.`,
      ],
    },
  ],
  "repairable-laptops-why-it-matters": [
    {
      heading: "Batteries are the part you will replace",
      paragraphs: [
        "Laptop batteries typically retain around 80% of their capacity after 500–800 full charge cycles — roughly three to four years for most people. A battery held in with screws and a standard connector is a twenty-minute swap; one glued to the keyboard deck can cost more to replace than the laptop is worth.",
        `The ${air14.name} uses a screwed-in battery and Tervo sells replacements directly. Using the 80% charge limit when you work at a desk will also slow battery wear considerably.`,
      ],
    },
  ],
  "front-vs-top-loaders": [
    {
      heading: "Noise and vibration",
      paragraphs: [
        "Front loaders spin faster and can be loud during the final spin, particularly on wooden floors. Inverter (direct-drive) motors are noticeably quieter and smoother than belt-driven designs. Top loaders spin more slowly, so peak noise is usually lower, but agitators can knock during the wash.",
        "Whichever you choose, levelling the machine properly and removing the transit bolts before first use are the two biggest factors in how much it shakes.",
      ],
      callout: { tone: "warning", text: "Never run a new washing machine with the transit bolts fitted. It can damage the drum suspension within a single cycle." },
    },
  ],
  "are-washer-dryers-worth-it": [
    {
      heading: "Energy compared with separate machines",
      paragraphs: [
        "Most washer-dryers use condenser drying, which heats air with an element and uses water to condense the moisture out. It works, but it uses more electricity per kilogram than a heat-pump tumble dryer, and some models also use water while drying.",
        `If you dry only occasionally, the difference is small. If you would dry most loads, a separate heat-pump dryer stacked on an efficient washer such as the ${oW8.name} will cost less to run over the years.`,
      ],
    },
  ],
};
