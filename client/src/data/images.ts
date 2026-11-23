/**
 * Image registry — every remote photograph used in the demo, verified for
 * subject matter. Free-to-use photography served from Unsplash.
 * Product hero renders are local studio-style SVGs in /public/images/products.
 */

const u = (id: string, w = 1200, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=80`;

export const unsplash = u;

export const images = {
  fridgeInSitu: [
    u("1588854337115-1c67d9247e4d"), // french door fridge, bright kitchen
    u("1484154218962-a197022b5858"), // stainless fridge, open-plan kitchen
    u("1536353284924-9220c464e262"), // dark fridge, door open
    u("1588854337236-6889d631faa8"), // dark built-in kitchen
    u("1571175443880-49e1d25b2bc5"), // retro teal fridge
    u("1584568694244-14fbdf83bd30"), // glass door interior
  ],
  kitchens: [
    u("1556911220-bff31c812dba"),
    u("1556912172-45b7abe8b7e1"),
    u("1565538810643-b5bdb714032a"),
    u("1600489000022-c2086d79f9d4"),
    u("1622372738946-62e02505feb3"),
    u("1586208958839-06c17cacdf08"),
    u("1556185781-a47769abb7ee"),
    u("1507089947368-19c1da9775ae"),
    u("1556909172-54557c7e4fb7"),
    u("1556909211-36987daf7b4d"),
    u("1600585152220-90363fe7e115"),
    u("1588854337221-4cf9fa96059c"),
  ],
  cooking: [
    u("1556909114-f6e7ad7d3136"),
    u("1556910103-1c02745aae4d"),
    u("1556911073-52527ac43761"),
    u("1556911261-6bd341186b2f"),
  ],
  laundry: [
    u("1626806787461-102c1bfaaea1"), // white front loader, laundry shelf
    u("1610557892470-55d9e80c0bce"), // drum close-up
    u("1582735689369-4fe89db7114c"), // laundry basket
    u("1545173168-9f1947eebb7f"), // row of front loaders
    u("1604335399105-a0c585fd81a1"), // stainless washers
    u("1517677208171-0bc6725a3e60"), // folded knitwear
    u("1567113463300-102a7eb3cb26"), // sorting laundry
  ],
  tvs: [
    u("1593359677879-a4bb92f829d1"),
    u("1593784991095-a205069470b6"),
    u("1461151304267-38535e780c79"),
    u("1601944177325-f8867652837f"),
    u("1558888401-3cc1de77652d"),
    u("1577979749830-f1d742b96791"),
  ],
  laptops: [
    u("1496181133206-80ce9b88a853"),
    u("1525547719571-a2d4ac8945e2"),
    u("1541807084-5c52b6b3adef"),
    u("1588872657578-7efd1f1555ed"),
    u("1603302576837-37561b2e2302"),
    u("1593642632823-8f785ba67e45"),
    u("1484788984921-03950022c9ef"),
    u("1531297484001-80022131f5a1"),
    u("1498050108023-c5249f4df085"),
    u("1515378791036-0648a3ef77b2"),
    u("1484807352052-23338990c6c6"),
  ],
  interiors: [
    u("1617806118233-18e1de247200"),
    u("1600566753086-00f18fb6b3ea"),
    u("1600607687939-ce8a6c25118c"),
    u("1600210492486-724fe5c67fb0"),
    u("1586023492125-27b2c045efd7"),
    u("1493809842364-78817add7ffb"),
    u("1556228453-efd6c1ff04f6"),
    u("1505691938895-1758d7feb511"),
    u("1522708323590-d24dbb6b0267"),
    u("1513694203232-719a280e022f"),
    u("1524758631624-e2822e304c36"),
    u("1502672260266-1c1ef2d93688"),
    u("1484101403633-562f891dc89a"),
    u("1618221195710-dd6b41faaea6"),
    u("1616486338812-3dadae4b4ace"),
  ],
  homes: [
    u("1600585154340-be6161a56a0c"),
    u("1512917774080-9991f1c4c750"),
    u("1564013799919-ab600027ffc6"),
    u("1570129477492-45c003edd2be"),
  ],
  diy: [
    u("1558618666-fcd25c85cd64"), // soldering repair
    u("1581092160562-40aa08e78837"), // planning with tools
    u("1581578731548-c64695cc6952"), // cleaning
    u("1621905251189-08b45d6a269e"), // electrician
    u("1530124566582-a618bc2615dc"), // tool wall
    u("1581092921461-eab62e97a780"), // precision work
  ],
  business: [
    u("1556761175-5973dc0f32e7"),
    u("1552664730-d307ca884978"),
    u("1600880292203-757bb62b4baf"),
    u("1542744173-8e7e53415bb0"),
    u("1521737604893-d14cc237f11d"),
    u("1497366216548-37526070297c"),
    u("1522202176988-66273c2fd55f"),
    u("1551836022-d5d88e9218df"),
    u("1573164713988-8665fc963095"),
  ],
  analytics: [
    u("1551288049-bebda4e38f71"),
    u("1460925895917-afdab827c52f"),
    u("1504868584819-f8e8b4b6d7e3"),
  ],
  retail: [
    u("1556740738-b6a63e27c4df"),
    u("1607082348824-0a96f2a4b9da"),
    u("1472851294608-062f824d29cc"),
    u("1556742049-0cfed4f6a45d"),
    u("1586528116311-ad8dd3c8310d"),
  ],
} as const;

/** Square-cropped portrait photography for avatars. */
const p = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=256&h=256&q=80&crop=faces`;

export const avatars = [
  p("1494790108377-be9c29b29330"),
  p("1507003211169-0a1dd7228f2d"),
  p("1438761681033-6461ffad8d80"),
  p("1500648767791-00dcc994a43e"),
  p("1544005313-94ddf0286df2"),
  p("1472099645785-5658abf4ff4e"),
  p("1534528741775-53994a69daeb"),
  p("1506794778202-cad84cf45f1d"),
  p("1517841905240-472988babdf9"),
  p("1519085360753-af0119f7cbe7"),
  p("1531123897727-8f129e1688ce"),
  p("1539571696357-5a69c17a67c6"),
  p("1488426862026-3ee34a7d66df"),
  p("1557862921-37829c790f19"),
  p("1580489944761-15a19d654956"),
  p("1599566150163-29194dcaad36"),
  p("1573496359142-b8d87734a5a2"),
  p("1560250097-0b93528c311a"),
  p("1567532939604-b6b5b0db2604"),
  p("1552058544-f2b08422138a"),
  p("1508214751196-bcfd4ca60f91"),
  p("1527980965255-d3b416303d12"),
  p("1546961329-78bef0414d7c"),
  p("1504257432389-52343af06ae3"),
  p("1556157382-97eda2d62296"),
] as const;

export function avatarAt(index: number): string {
  return avatars[((index % avatars.length) + avatars.length) % avatars.length];
}

export function pick<T>(list: readonly T[], index: number): T {
  return list[((index % list.length) + list.length) % list.length];
}

export const FALLBACK_IMAGE = "/images/fallback.svg";
