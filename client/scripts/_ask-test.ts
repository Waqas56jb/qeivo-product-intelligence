import { answerQuestion } from "@/lib/ask-engine";
const qs = ["Is this refrigerator suitable for a family of five?", "What are its biggest weaknesses?", "How much electricity could it use?", "Does it fit my kitchen?", "Compare it with Halden Precision FD590", "What do owners complain about?", "Does it fit a 900 mm gap?", "Does it need a water connection?", "Is it worth the price?"];
for (const q of qs) {
  const a = answerQuestion(q, { productIds: ["p-nordvik-frostline-fd600"], region: "US", space: { widthMm: 920, heightMm: 1800, depthMm: 720 }, householdSize: 4 });
  console.log("\n### " + q + "  [" + a.intent + "] products=" + a.productIds.join(",") + " gaps=" + a.gaps.join("|"));
  a.blocks.forEach((b) => console.log(` - (${b.claimType}) ${b.text}  {${b.sourceIds.join(",")}}`));
  console.log("   follow:", a.followUps.join(" / "));
}
const b = answerQuestion("Which fridge suits a family of five?", { productIds: [], region: "US" });
console.log("\n### none", b.intent, b.blocks.map(x=>x.text));
const c = answerQuestion("What do owners complain about?", { productIds: ["p-halden-pureclean-w9"], region: "UK" });
console.log("\n### washer", c.intent, c.blocks.map(x=>x.text));
const d = answerQuestion("How much electricity could it use?", { productIds: ["p-tervo-air-14"], region: "UK" });
console.log("\n### laptop", d.intent, d.blocks.map(x=>x.text));
