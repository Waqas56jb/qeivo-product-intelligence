import type { AppNotification } from "@/types";

const n = (id: string, kind: AppNotification["kind"], title: string, body: string, date: string, read: boolean, href: string, productId?: string): AppNotification => ({ id, kind, title, body, date, read, href, productId });

const all: AppNotification[] = [
  n("nt-01", "price-drop", "Nordvik Frostline FD540 dropped to $2,549", "Larder & Co cut the price by $150. That's the lowest in 52 weeks, but still above your $2,399 target.", "2026-11-23T07:12:00Z", false, "/app/products/nordvik-frostline-fd540-cd", "p-nordvik-frostline-fd540-cd"),
  n("nt-02", "community", "Your question has an accepted answer", "A Qeivo expert answered “Will the Frostline FD600 fit a 920 mm opening?” and the answer has been accepted.", "2026-11-22T18:40:00Z", false, "/app/community/will-the-frostline-fd600-fit-a-920mm-opening", "p-nordvik-frostline-fd600"),
  n("nt-03", "maintenance", "Condenser coils overdue on your Studio TF310", "This was due on 15 Nov. Dusty coils can increase energy use by up to 25%.", "2026-11-22T09:00:00Z", false, "/app/my-products", "p-brightwater-studio-tf310"),
  n("nt-04", "price-drop", "Halden PureClean W9 is $949 at BrightCart", "That's $50 below the usual price. Your target is $899.", "2026-11-21T15:22:00Z", false, "/app/price-intelligence", "p-halden-pureclean-w9"),
  n("nt-05", "product-update", "New lab data for the Ovea Eco FD520", "Independent energy and noise measurements were added. The Qeivo score is unchanged.", "2026-11-21T10:05:00Z", true, "/app/products/ovea-eco-fd520", "p-ovea-eco-fd520"),
  n("nt-06", "research", "Grace Thompson requested changes", "Leasing office laptops: “Please price the Core 15 as an alternative for back-office staff.”", "2026-11-21T19:31:00Z", false, "/app/workspace/projects/prj-5"),
  n("nt-07", "subscription", "Your November invoice is ready", "Premium (monthly): $12.00, due 28 Nov. It will be charged to your Visa ending 4417.", "2026-11-14T06:00:00Z", true, "/app/billing"),
  n("nt-08", "community", "Nordvik replied to a thread you follow", "Nordvik Customer Care posted an official answer in “Ice maker slow after filter change”.", "2026-11-19T12:14:00Z", true, "/app/community/ice-maker-slow-after-filter-change"),
  n("nt-09", "maintenance", "Drum clean due on your LoadMaster T11", "Run a hot drum-clean cycle with washer cleaner by 25 Nov.", "2026-11-20T08:00:00Z", true, "/app/my-products", "p-kestrel-loadmaster-t11"),
  n("nt-10", "product-update", "Conflicting energy figures flagged", "The Kestrel HomeBase SBS650 measured above its label figure in independent testing. Its score now uses the measured value.", "2026-11-18T11:30:00Z", true, "/app/products/kestrel-homebase-sbs650", "p-kestrel-homebase-sbs650"),
  n("nt-11", "price-drop", "Tervo Air 14 holiday pricing is live", "Voltmart is pre-announcing $1,199 from 27 Nov. Your target is $1,149.", "2026-11-18T09:45:00Z", true, "/app/products/tervo-air-14", "p-tervo-air-14"),
  n("nt-12", "research", "Comparison saved", "“College laptop shortlist” is saved with 3 products.", "2026-11-13T07:40:00Z", true, "/app/compare"),
  n("nt-13", "community", "New answers on “Quietest fridge for open-plan kitchen”", "2 new replies, including one from a Halden product specialist.", "2026-11-12T20:02:00Z", true, "/app/community/quietest-fridge-for-open-plan-kitchen"),
  n("nt-14", "maintenance", "Firmware update for your View QLED 65", "Kestrel released a firmware update that fixes HDMI handshake issues.", "2026-11-11T16:00:00Z", true, "/app/my-products", "p-kestrel-view-qled65"),
  n("nt-15", "product-update", "Spec correction: Nordvik Ellipse BF380 height", "Nordvik confirmed the height is 2010 mm. The installation guide showed 2000 mm, which excludes the feet.", "2026-11-10T13:15:00Z", true, "/app/products/nordvik-ellipse-bf380", "p-nordvik-ellipse-bf380"),
  n("nt-16", "price-drop", "Brightwater Family FD560 back in stock", "Now in stock at Larder & Co, with free delivery and installation.", "2026-11-08T10:20:00Z", true, "/app/products/brightwater-family-fd560", "p-brightwater-family-fd560"),
  n("nt-17", "subscription", "You've used 80% of your Ask Qeivo messages", "400 of 500 messages used this cycle. Your allowance resets on 14 Dec.", "2026-11-07T18:00:00Z", true, "/app/billing"),
  n("nt-18", "research", "Price history report ready", "The 52-week price report for your Kitchen remodel folder is ready to view.", "2026-11-05T07:00:00Z", true, "/app/price-intelligence"),
  n("nt-19", "maintenance", "Warranty expiring soon: Kestrel View QLED 65", "The 1-year warranty ends on 28 Nov 2026. Consider registering any faults before then.", "2026-11-01T09:00:00Z", true, "/app/my-products", "p-kestrel-view-qled65"),
  n("nt-20", "product-update", "Ovea Eco BF370 verified by Ovea", "The manufacturer verified its product data. Evidence coverage is now 95%.", "2026-10-29T14:00:00Z", true, "/app/products/ovea-eco-bf370", "p-ovea-eco-bf370"),
  n("nt-21", "subscription", "Payment method updated", "Visa ending 4417 is now your default payment method.", "2026-04-02T12:00:00Z", true, "/app/billing"),
  n("nt-22", "community", "Your reply was marked helpful", "12 people found your reply in “Best fridge for a family of four under $2,000” helpful.", "2026-10-24T19:10:00Z", true, "/app/community/best-fridge-for-family-of-four-under-2000"),
];

/** Notifications for the demo customer, newest first. */
export const notifications: AppNotification[] = [...all].sort((a, b) => b.date.localeCompare(a.date));

export const unreadCount = notifications.filter((x) => !x.read).length;
