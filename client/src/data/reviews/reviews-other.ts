import type { ReviewRowSet } from "./review-rows";

/** Hand-written owner reviews — washing machines, televisions and laptops. */
export const otherReviews: ReviewRowSet = {
  /* ------------------------------------------------------- Washing machines */
  "halden-pureclean-w9": [
    [5, "Auto-dosing is a game changer", "Fill the detergent tank roughly once a month and forget about measuring caps. Clothes come out cleaner than with our old machine and the 1,400 rpm spin leaves them nearly dry enough to fold.", "1 year", "+Auto-dosing,+Wash quality,+Spin"],
    [5, "Quiet enough for an open-plan flat", "Rated A at 108 kWh a year and it only draws about 48 litres per cycle. The spin peaks at 72 dB, so we can still hold a conversation in the kitchen while it runs. Feels built like a tank.", "8 months", "+Energy use,+Quiet,+Water use", { photo: true }],
    [4, "Allergy cycle helps my son", "The allergy programme has noticeably reduced our son's eczema flare-ups since we switched. Eco cycles are long — over three hours for a full 40 °C load — so we use quick wash for gym kit.", "1 year", "+Allergy cycle,-Cycle time,+Wash quality"],
  ],
  "nordvik-silkwash-w8": [
    [5, "Gentle with wool and silk", "I knit, so most of my wardrobe is wool, and the hand-wash programme hasn't felted a single jumper. Steam refresh takes creases out of work shirts in twenty minutes, which means less ironing.", "1 year", "+Wash quality,+Steam,+Programs"],
    [4, "Sensible mid-range washer", "8 kg is right for the two of us and it's quiet on spin. There's no auto-dosing at $749, which I occasionally miss, but the drawer is easy to clean and the door seal hasn't gone mouldy.", "8 months", "+Quiet,+Energy use,-Features"],
  ],
  "maru-aiwash-w10": [
    [5, "Remote start actually fits our routine", "I start the wash from the train so it finishes as I walk in, and the app nudges me before clothes sit damp. The 10 kg drum takes our king-size duvet without a fight.", "1 year", "+App,+Capacity,+Wash quality"],
    [4, "Measure the depth with the door open", "It's 615 mm deep before you open the door, so it sits proud of our worktop and the door swing clips the kitchen bin. Wash performance and auto-dosing are excellent, though.", "6 months", "-Depth,+Wash quality,+Auto-dosing"],
    [4, "Smart, but you hear the spin", "Around 74 dB at full spin carries into the living room of our terrace. Steam and auto-dose both work as advertised, and the fabric detection seems to pick sensible temperatures.", "10 months", "-Noise,+Auto-dosing,+Steam"],
    [2, "Leaked from the door seal at seven months", "Found a puddle in front of the machine after a towel wash; the engineer replaced the door gasket, then it happened again six weeks later. Washing performance was excellent, which makes it more annoying.", "9 months", "-Leak,-Reliability,+Wash quality", { reply: "We're sorry for the repeat leak. A revised gasket for early AIWash W10 units is now available; our service team has been asked to contact you to fit it and check the drain hose routing." }],
    [5, "Remembers how we like things washed", "The machine learns our favourite cycles and auto-dosing means detergent usage has roughly halved. Duvets come out fresh and well spun.", "1 year", "+Auto-dosing,+App,+Wash quality"],
    [5, "Steam has saved me hours of ironing", "Steam refresh on work shirts is brilliant, and the 10 kg drum handles a full week's laundry for three in two loads.", "8 months", "+Steam,+Capacity,+Wash quality"],
  ],
  "kestrel-loadmaster-t11": [
    [4, "Top-loader for a back that hates bending", "After a hip replacement I wanted to load from the top again. The 11 kg drum handles a king-size duvet, though at about 92 litres a wash it is thirsty compared with front loaders.", "1 year", "+Capacity,+Ease of use,-Water use"],
    [4, "Simple and tough", "No Wi-Fi, no steam, nothing to break. It's run almost daily for our family of six for two years. The 800 rpm spin means jeans come out wet, so we lean on the dryer.", "2 years", "+Reliability,-Spin,+Value"],
    [3, "Loud and expensive to run", "The spin hits about 77 dB and our energy rating is a C, so the bills add up. It was cheap at $699 and it cleans fine — just not the bargain it first looked.", "1 year", "-Noise,-Energy use,+Value", { reply: "Thanks for your feedback. The Eco 40 programme reduces both water and energy use by around 25% on everyday loads. Kestrel Care is happy to suggest the best cycles for your household." }],
    [5, "Pulled the old one out, this went straight in", "Same footprint as our previous top-loader, so the swap took twenty minutes. The deep-fill option is a big help with muddy farm overalls, and it hasn't missed a beat in a year.", "1 year", "+Installation,+Wash quality,+Reliability"],
    [2, "Walks across the floor on spin", "Unless the load is perfectly balanced it bangs and shuffles a few centimetres every spin, even after levelling. The agitator has also pulled threads on two of my blouses. Cheap, but not kind to clothes.", "8 months", "-Noise,-Wash quality,+Capacity"],
    [5, "Tough as old boots", "Runs twice a day for a family of six with farm work clothes and has never needed a repair. Easy to load and the deep-fill option is great for heavy soil.", "2 years", "+Reliability,+Capacity,+Ease of use"],
  ],
  "brightwater-familywash-w9": [
    [5, "Can't believe the price", "$549 for a 9 kg front loader that washes this well. The 15-minute quick wash rescues forgotten school uniforms at 7 am more often than I'd like to admit.", "1 year", "+Value,+Quick wash,+Wash quality"],
    [4, "Handles a family of five", "Two loads a day, every day, and it's never complained. The spin is fairly loud at around 76 dB, so we don't run it after the kids are in bed.", "2 years", "+Capacity,-Noise,+Reliability"],
    [4, "Allergy cycle is worth having", "Pollen season used to wreck me; the 60 °C allergy programme on bedding genuinely helps. The machine itself is basic — dial and buttons, no app — but well put together.", "8 months", "+Allergy cycle,+Build quality,-Features"],
  ],
  "ovea-greencycle-w8": [
    [5, "The greenest washer I could find", "Rated at 98 kWh a year and roughly 42 litres a wash, and the 1,600 rpm spin means towels dry on the line in half the time. Our water bill dropped too.", "1 year", "+Energy use,+Water use,+Spin"],
    [5, "Whisper quiet, three-year cover", "Around 71 dB on full spin — I've had dishwashers louder than this. Three years of parts and labour as standard tells you Ovea expects it to last.", "8 months", "+Quiet,+Warranty,+Wash quality"],
    [4, "Efficient, but eco cycles are slow", "Running costs are tiny and the clothes come out clean and well spun. The eco 40–60 programme takes nearly three and a half hours, so we plan washes around it.", "6 months", "+Energy use,-Cycle time,+Spin"],
  ],
  "halden-combi-wd10": [
    [4, "Saves a whole appliance in a small flat", "We simply don't have room for a separate dryer, so this is a lifesaver. Drying a full load takes well over four hours and it's rated D, so we only dry what can't go on the airer.", "1 year", "+Space,-Drying time,-Energy use"],
    [5, "Halden quality shows", "The door, drum and drawer all feel incredibly solid. Washing is first-class; drying works best at about half the 10 kg wash load, which the manual does tell you.", "8 months", "+Build quality,+Wash quality,-Drying capacity"],
    [3, "Excellent washer, mediocre dryer", "Washing is superb, but a full wash-and-dry cycle takes over six hours and towels still come out slightly damp unless I halve the load. If you have room for a separate dryer, get one.", "1 year", "+Wash quality,-Drying time,-Drying capacity"],
    [5, "One machine, zero regrets", "In our city flat this replaced two appliances. Wash-and-dry on a half load is ready by morning, and it's impressively quiet for a washer-dryer.", "1 year", "+Space,+Quiet,+Wash quality"],
  ],
  "brightwater-compact-w6": [
    [4, "Fits where nothing else would", "At 470 mm deep it's the only machine that fit the cupboard in our narrow galley flat. 6 kg is fine for one or two people if you don't try to wash a duvet.", "1 year", "+Fit,+Value,-Capacity"],
    [4, "Basic and dependable", "We bought it for a rental studio and it's been through three tenants without a callout. The quick wash is genuinely quick and the controls are idiot-proof.", "2 years", "+Reliability,+Quick wash,+Value"],
  ],
  "maru-twinload-t13": [
    [4, "Huge drum for sports-mad kids", "Two football teams' worth of kit fits in the 13 kg drum. The app tells me when it's done, which matters because the laundry is in the garage. It does use nearly 100 litres a cycle.", "1 year", "+Capacity,+App,-Water use"],
    [4, "Steam is good, spin is weak", "The steam refresh is great for bulky bedding, but 900 rpm leaves towels heavy and wet. Looks smart in black.", "8 months", "+Steam,-Spin,+Capacity"],
  ],

  /* ------------------------------------------------------------ Televisions */
  "lumora-vivid-oled65": [
    [5, "Film nights are a different experience", "Black is actually black, and with around 1,300 nits peak the highlights in Dolby Vision films have real punch even with a lamp on. We sit about 2.5 m away and 65 inches feels just right.", "1 year", "+Picture quality,+Brightness,+HDR", { photo: true }],
    [5, "Superb for console gaming", "120 Hz over HDMI 2.1 with variable refresh makes fast shooters feel noticeably smoother. Game mode kills almost all the input lag without wrecking the colours.", "8 months", "+Gaming,+Picture quality,+Refresh rate", { video: true }],
    [4, "Turn off hands-free voice", "The picture is outstanding, but the always-listening assistant woke up during dinner conversations twice. One toggle in settings fixed it. Stand is a bit wide for narrow furniture.", "6 months", "-Voice control,+Picture quality,-Stand"],
  ],
  "lumora-vivid-oled55": [
    [5, "Perfect bedroom OLED", "Fifty-five inches fits on our dresser and the deep blacks make late-night viewing easy on the eyes. Five years of promised software updates was a big factor.", "1 year", "+Picture quality,+Size,+Updates"],
    [5, "Upgraded from a 2016 LED set", "The difference is night and day. At $1,499 it was a stretch, but every streaming app looks better, and motion in sport is clean.", "8 months", "+Value,+Picture quality,+Motion"],
  ],
  "lumora-studio-oled77": [
    [5, "Bright room, no reflections", "Our living room has a wall of windows and the anti-glare coating is the real deal — reflections are faint smudges rather than mirrors. 1,500 nits peak keeps HDR punchy at midday.", "8 months", "+Anti-glare,+Brightness,+Picture quality", { photo: true }],
    [5, "Worth it, but add a soundbar", "At $3,299 it's the centrepiece of the house. Built-in speakers are clear for news but thin for films, so budget for audio.", "6 months", "+Picture quality,+Design,-Speakers"],
  ],
  "vireo-lumen-miniled75": [
    [5, "Daylight HDR that actually pops", "With around 2,400 nits peak, HDR sport on a sunny Sunday looks incredible. The 144 Hz panel pairs nicely with my gaming PC.", "1 year", "+Brightness,+Gaming,+HDR"],
    [4, "Some blooming on dark scenes", "It's not an OLED: white subtitles on black backgrounds get a faint halo. In normal viewing you forget about it, and the 75-inch size is glorious.", "8 months", "-Blooming,+Brightness,+Size", { reply: "Thanks for the detailed feedback. Setting Local Dimming to 'Medium' noticeably reduces halos around subtitles while keeping HDR highlights bright." }],
    [4, "Great for football", "Motion is smooth and the anti-glare finish helps in our conservatory. The remote feels cheap for a TV at this price.", "6 months", "+Motion,+Anti-glare,-Remote"],
    [2, "Blooming ruined film nights for me", "I watch a lot of dark films and the halos around bright objects on black backgrounds were impossible to unsee, even on the medium dimming setting. Returned it for an OLED. Probably great for sport in a bright room.", "1 month", "-Blooming,-Contrast,+Brightness"],
    [5, "Perfect for a bright family room", "Big windows, kids, lots of sport — this TV handles all of it. HDR football looks spectacular and the anti-glare screen kills reflections.", "1 year", "+Brightness,+Anti-glare,+Size"],
    [5, "144 Hz PC gaming on a big screen", "Plugged in my gaming PC and the 144 Hz mode with VRR is buttery smooth. Input lag is low enough for competitive play.", "8 months", "+Gaming,+Refresh rate,+Picture quality"],
  ],
  "vireo-lumen-miniled65": [
    [5, "Sunroom champion", "Our TV faces three windows and nothing else we tried was watchable in the afternoon. At about 2,100 nits this one is, and colours stay vivid.", "1 year", "+Brightness,+Picture quality,+Anti-glare"],
    [4, "Thicker than an OLED on the wall", "At 55 mm deep it sits further off the wall than our old set, so pick a slim mount. Picture quality for $1,499 is excellent.", "8 months", "-Depth,+Picture quality,+Value"],
  ],
  "maru-crystal-qled65": [
    [4, "Strong value 65-inch", "$1,099 for a 65-inch QLED with a 120 Hz panel is a good deal. Contrast in dark scenes isn't OLED-level, but for family viewing in a lit room it's great.", "1 year", "+Value,+Size,-Contrast"],
    [4, "Smart interface is snappy", "Apps open quickly and voice search actually understands my accent. Brightness is fine but not dazzling at roughly 900 nits.", "8 months", "+Smart features,+Voice control,-Brightness"],
  ],
  "maru-crystal-qled50": [
    [4, "Ideal kitchen-diner TV", "Fifty inches for $549 and the picture is crisp at a sensible viewing distance. It's a 60 Hz panel, so my son's fast games aren't as smooth as on his friend's set.", "1 year", "+Value,+Size,-Gaming"],
    [4, "Easy to set up for my parents", "Set it up for my parents in twenty minutes and they've managed the home screen without calling me. A little dim on bright summer afternoons.", "8 months", "+Smart features,-Brightness,+Ease of use"],
    [3, "Fine for news, not for gaming", "My son's console games stutter compared with his friend's 120 Hz set, and in our bright kitchen the picture looks washed out at midday. Smart features are good. Right TV for the wrong room.", "6 months", "-Gaming,-Brightness,+Smart features"],
    [5, "Great second TV", "Sharp picture, fast apps and a slim profile on our dresser. For $549 it does everything we need in the bedroom.", "1 year", "+Value,+Smart features,+Design"],
  ],
  "kestrel-view-led55": [
    [4, "Fine for the spare room", "$399 for a 55-inch set that guests can use without instructions. Picture is perfectly decent in the evening; just don't expect HDR fireworks.", "1 year", "+Value,+Size,-HDR"],
    [4, "Rental flat staple", "I've fitted these in two furnished lets. Tenants are happy and nothing has failed. Only two years of software updates, so apps may age out.", "18 months", "+Reliability,-Updates,+Value"],
    [3, "Dim and sluggish", "In a dark room it's OK, but at around 350 nits it washes out in daylight. Menus lag when switching apps.", "6 months", "-Brightness,-Smart features,+Value", { reply: "Thank you for the honest feedback. Switching the picture mode to 'Bright Room' and enabling 'Fast Start' in Settings > System improves both daytime viewing and app switching on the View LED 55." }],
    [1, "Backlight failed at fourteen months", "Half the screen went dark just after the one-year warranty ended. The repair quote was more than half the price of a new set. Two other owners I found online had the same issue.", "14 months", "-Reliability,-Warranty,-Support"],
    [5, "Exactly what a budget TV should be", "Set up in ten minutes, every streaming app we use is there, and the picture is clean in our dim lounge. Hard to argue at $399.", "1 year", "+Value,+Ease of use,+Smart features"],
    [5, "Five units in our care home lounges", "Simple remote, clear menus and they've all been reliable for a year. Residents find the large on-screen text easy to read.", "1 year", "+Reliability,+Ease of use,+Value"],
  ],
  "kestrel-view-qled65": [
    [4, "Big screen, small price", "A 65-inch QLED for $649 felt too good to be true. Colours are punchy for cartoons and sport, and the 60 Hz panel is fine for regular TV.", "1 year", "+Value,+Size,+Colour"],
    [4, "Good, with limits", "Brightness tops out around 600 nits and updates are promised for only two years. For the money, though, our family is happy.", "8 months", "-Updates,-Brightness,+Value"],
  ],

  /* ---------------------------------------------------------------- Laptops */
  "tervo-air-14": [
    [5, "My go-to travel laptop", "At 1.21 kg it disappears in my backpack, the OLED screen is gorgeous, and I see about 13 hours of real work on a charge — a full conference day without hunting for sockets.", "1 year", "+Battery life,+Portability,+Display"],
    [5, "Repairable, upgradeable, reassuring", "I upgraded the RAM myself in five minutes using Tervo's guide. Combine that with the three-year warranty and this feels like a five-year machine, not a two-year one.", "8 months", "+Upgradeability,+Warranty,+Build quality"],
    [4, "18 hours is optimistic", "The claimed 18 hours assumes a dim screen; at normal brightness I get 12–13. Still the best battery I've had, and the keyboard is lovely.", "6 months", "-Battery claims,+Display,+Keyboard"],
  ],
  "arclight-blaze-16": [
    [5, "Runs everything I play", "16-core CPU, 8 GB GPU and 32 GB of RAM handle modern games at high settings with the fans at a tolerable roar. The 16-inch screen is a great size for gaming at a desk.", "1 year", "+Performance,+Gaming,+RAM"],
    [4, "Not a laptop for the sofa", "Battery barely clears four and a half hours away from the wall and it weighs 2.45 kg plus a hefty brick. As a portable desktop it's brilliant.", "8 months", "-Battery life,-Weight,+Performance", { reply: "Thanks for the review! Switching to 'Silent' performance mode and the integrated GPU when unplugged typically extends battery life by an hour or more on the Blaze 16." }],
    [2, "Throttles after twenty minutes", "Benchmarks look great for the first run, then clock speeds drop sharply as the chassis heats up and the fans become a jet engine. On a cooling pad it's better, but that shouldn't be necessary at $2,199.", "4 months", "-Throttling,-Fan noise,+Display", { reply: "Thank you for the detailed feedback. BIOS 1.08 rebalances the fan curve and power limits to sustain clocks longer under load; it's available through the Arclight Control Centre." }],
    [5, "Streams and games without breaking a sweat", "I stream at 1080p while gaming and the 32 GB of RAM means nothing stutters. The 16-inch panel is crisp and the keyboard backlight is bright.", "1 year", "+Performance,+RAM,+Keyboard"],
    [5, "Desk setup replaced my tower", "Docked to two monitors via Thunderbolt, it's my only computer now. Plenty of power for CAD by day and games by night.", "10 months", "+Performance,+Ports,+Versatility"],
  ],
  "vireo-studio-15": [
    [5, "Colour-accurate out of the box", "As a photographer, the factory-calibrated OLED saved me buying a separate monitor for travel. 32 GB RAM handles 4K timelines in my editor without stutter.", "1 year", "+Display,+Performance,+RAM"],
    [4, "Gets warm on long exports", "The underside gets toasty during long renders, so I use a stand. On light work I see close to ten hours on battery.", "8 months", "-Heat,+Display,+Battery life"],
    [3, "Gorgeous screen, noisy under load", "The OLED is the best laptop display I've used, but during exports the fans are loud and I can hear coil whine in quiet rooms. The bottom panel gets hot enough that I won't use it on my lap.", "7 months", "+Display,-Fan noise,-Heat"],
    [5, "Built for colour work", "As a designer, the factory-calibrated OLED and 32 GB RAM make this my all-day machine. The fingerprint reader and Thunderbolt dock make it effortless.", "1 year", "+Display,+RAM,+Ports"],
  ],
  "tervo-flex-13": [
    [4, "Note-taking machine", "I fold it into tablet mode for lectures and handwrite notes. Light at 1.14 kg, and about 11 hours of battery covers a full university day.", "1 year", "+Versatility,+Portability,+Battery life"],
    [4, "Good first laptop for a student", "Bought for my daughter's first year. Thunderbolt runs her monitor and the fingerprint reader stops her siblings borrowing it. Speakers are thin.", "8 months", "+Features,+Portability,-Speakers"],
    [5, "The pen and hinge feel premium", "The 360° hinge holds firmly at any angle and the pen is responsive enough for sketching storyboards. Three-year warranty made it an easy choice over cheaper convertibles.", "10 months", "+Build quality,+Versatility,+Warranty"],
  ],
  "vireo-meridian-14": [
    [5, "Our IT team's favourite", "We rolled out forty of these to our consultants. Twelve hours of battery, a comfortable keyboard and upgradeable RAM mean fewer support tickets and longer refresh cycles.", "1 year", "+Battery life,+Keyboard,+Upgradeability"],
    [4, "Reliable, slightly dim screen", "Rock solid for spreadsheets and video calls. The display is fine indoors but struggles on a sunny train.", "1 year", "+Reliability,-Display,+Keyboard"],
  ],
  "arclight-swift-14": [
    [4, "OLED for under a thousand", "$999 got me an OLED ultrabook, which still feels a bit unreal. Battery life is just under 10 hours in practice, so I carry the charger on longer days.", "1 year", "+Value,+Display,-Battery life"],
    [4, "Lovely navy finish", "It turns heads in meetings and weighs 1.29 kg. The one-year warranty is stingy, so I added cover at checkout.", "8 months", "+Design,+Portability,-Warranty"],
    [4, "Great everyday machine", "Handles email, documents and streaming effortlessly. Fans spin up noticeably on video calls with background blur on.", "6 months", "+Performance,-Fan noise,+Value"],
    [2, "Hinge cracked, slow repair", "The left hinge mount cracked at ten months from normal opening and closing. It was covered by the one-year warranty, but the repair took nineteen days with no loan unit. Lovely screen, fragile build.", "11 months", "-Build quality,-Support,+Display"],
    [5, "Best value OLED ultrabook", "For $999 the screen is unreal, it weighs 1.29 kg, and it handles my uni work, photo edits and Netflix without fuss.", "1 year", "+Value,+Display,+Portability"],
    [5, "Perfect for a freelance writer", "Light, fast to wake and the keyboard is comfortable for long sessions. I added a warranty extension and have zero complaints.", "8 months", "+Keyboard,+Portability,+Performance"],
  ],
  "arclight-forge-17": [
    [5, "A desktop that happens to fold", "24 cores and a 12 GB GPU chew through 3D renders that used to take my old tower all night. The 17.3-inch display is big enough to work on without an external monitor.", "1 year", "+Performance,+Display,+Gaming"],
    [4, "Plan to stay plugged in", "At 2.9 kg and with under four hours of battery, it lives on my desk. Plugged in, it's the fastest machine I've owned.", "8 months", "-Weight,-Battery life,+Performance"],
  ],
  "tervo-core-15": [
    [4, "Sensible business laptop", "$849 for a well-built 15.6-inch with a numeric keypad, upgradeable RAM and a fingerprint reader. Bought six for our accounts team.", "1 year", "+Value,+Upgradeability,+Build quality"],
    [4, "Good battery, average screen", "I get close to nine hours of office work. The display is a bit flat for photos but perfectly fine for spreadsheets.", "8 months", "+Battery life,-Display,+Value"],
    [3, "Solid but dull display", "Build and keyboard are great for the price, and I love that the RAM is upgradeable. The screen is washed out and dim next to my colleague's laptop, which matters when I'm reviewing slides all day.", "9 months", "-Display,+Keyboard,+Upgradeability"],
    [5, "Fleet laptop that just works", "We deployed twenty for our sales team. Upgrading RAM in-house saved us a refresh, and nearly nine hours of battery covers a client day.", "1 year", "+Upgradeability,+Battery life,+Reliability"],
  ],
  "vireo-aero-13": [
    [4, "Under a kilo with an OLED", "At 0.99 kg I barely notice it in my bag. Only 8 GB of RAM, so I keep the browser tabs under control.", "1 year", "+Portability,+Display,-RAM"],
    [4, "Watch the storage", "Great for travel writing and email, but 256 GB fills up fast once photos sync. Cloud storage is a must.", "8 months", "+Portability,-Storage,+Display"],
  ],
};
