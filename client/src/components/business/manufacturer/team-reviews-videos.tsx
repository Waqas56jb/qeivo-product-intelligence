"use client";

import { useState } from "react";
import { Check, Mail, Plus, Send, ShieldCheck, Trash2, Video as VideoIcon, X } from "lucide-react";
import { toast } from "sonner";
import type { TeamMember } from "@/types";
import { teamForCompany } from "@/data/companies/team";
import { reviews } from "@/data/reviews";
import { videos } from "@/data/videos";
import { getProduct } from "@/data/products";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox, Label, UserAvatar } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { ConfirmationDialog, FilterChip } from "@/components/common/controls";
import { ReviewCard } from "@/components/reviews";
import { VideoCard } from "@/components/video";
import { Panel, ScoreIntegrityNotice } from "../primitives";
import { UploadDropzone, UploadRow, useUploadQueue } from "../upload";
import { nordvikProducts } from "./shared";

/* ------------------------------------------------------------------ Team */
const ROLES: TeamMember["role"][] = ["Owner", "Admin", "Editor", "Analyst", "Viewer"];
const PERMS = ["Edit product data", "Upload documents", "Respond to reviews", "Manage videos", "View insights", "Manage team & billing"];
const MATRIX: Record<TeamMember["role"], boolean[]> = {
  Owner: [true, true, true, true, true, true],
  Admin: [true, true, true, true, true, true],
  Editor: [true, true, true, true, true, false],
  Analyst: [false, false, false, false, true, false],
  Viewer: [false, false, false, false, true, false],
};

export function ManufacturerTeamView() {
  const [members, setMembers] = useState<TeamMember[]>(teamForCompany("co-nordvik"));
  const [invite, setInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("Editor");
  const [remove, setRemove] = useState<TeamMember | null>(null);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const duplicate = members.some((m) => m.email.toLowerCase() === email.toLowerCase());

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader title="Team" description="Who can manage Nordvik's presence on Qeivo." actions={<Button onClick={() => setInvite(true)}><Plus /> Invite member</Button>} />
      <Panel title={`Members (${members.length})`} flush>
        <ul className="divide-y divide-border">
          {members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <UserAvatar src={m.avatar} name={m.name} className="size-10" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[14px] font-medium">
                  {m.name} {m.status === "invited" && <Badge variant="info">Invitation pending</Badge>}
                </p>
                <p className="truncate text-[12px] text-muted-foreground">
                  {m.title} · {m.email} · {m.status === "invited" ? "Invited" : `active ${formatRelative(m.lastActive)}`}
                </p>
              </div>
              <Select value={m.role} disabled={m.role === "Owner"} onValueChange={(v) => { setMembers(members.map((x) => (x.id === m.id ? { ...x, role: v as TeamMember["role"] } : x))); toast.success(`${m.name} is now ${v}`); }}>
                <SelectTrigger size="sm" className="w-32" aria-label={`Role for ${m.name}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r} disabled={r === "Owner"}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon-sm" disabled={m.role === "Owner"} onClick={() => setRemove(m)} aria-label={`Remove ${m.name}`}>
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Permissions by role" description="Scores, evidence and verdicts are not editable by any role." flush>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">Permission</th>
                {ROLES.map((r) => (
                  <th key={r} className="px-3 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMS.map((p, i) => (
                <tr key={p} className="border-b border-border last:border-0">
                  <td className="px-5 py-2.5">{p}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-3 py-2.5 text-center">
                      {MATRIX[r][i] ? <Check className="mx-auto size-4 text-success" aria-label="Allowed" /> : <X className="mx-auto size-4 text-subtle-foreground" aria-label="Not allowed" />}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="px-5 py-2.5 text-muted-foreground">Edit Qeivo scores or verdicts</td>
                {ROLES.map((r) => (
                  <td key={r} className="px-3 py-2.5 text-center">
                    <X className="mx-auto size-4 text-danger" aria-label="Never allowed" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
      <Dialog open={invite} onOpenChange={setInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>Demo — no email is sent.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!valid || duplicate) return;
              setMembers([...members, { id: `tm-new-${members.length}`, companyId: "co-nordvik", name: email.split("@")[0].replace(/[._]/g, " "), email, avatar: "", role, title: "Invited member", status: "invited", lastActive: "2026-11-23" }]);
              toast.success("Invitation created (demo)", { description: `${email} · ${role}` });
              setEmail("");
              setInvite(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="inv-email">Work email</Label>
              <Input id="inv-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={email.length > 0 && (!valid || duplicate)} placeholder="name@nordvik.example" />
              {email.length > 0 && !valid && <p className="text-[12px] text-danger-foreground">Enter a valid email address.</p>}
              {duplicate && <p className="text-[12px] text-danger-foreground">This person is already on the team.</p>}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as TeamMember["role"])}>
                <SelectTrigger aria-label="Role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.filter((r) => r !== "Owner").map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInvite(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!valid || duplicate}>
                <Mail /> Send invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        open={remove !== null}
        onOpenChange={(o) => !o && setRemove(null)}
        title={`Remove ${remove?.name}?`}
        description="They will lose access to the Nordvik workspace immediately (demo)."
        confirmLabel="Remove member"
        destructive
        onConfirm={() => {
          if (remove) {
            setMembers(members.filter((m) => m.id !== remove.id));
            toast.success(`${remove.name} removed`);
          }
        }}
      />
    </PageContainer>
  );
}

/* --------------------------------------------------------------- Reviews */
export function ManufacturerReviewsView() {
  const ids = new Set(nordvikProducts.map((p) => p.id));
  const all = reviews.filter((r) => ids.has(r.productId));
  const [filter, setFilter] = useState<"all" | "unanswered" | "negative">("unanswered");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<Record<string, string>>({});
  const list = all.filter((r) => (filter === "all" ? true : filter === "unanswered" ? !r.manufacturerReply && !sent[r.id] : r.rating <= 3));

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader title="Review responses" description="Reply publicly to owner reviews. Official replies are clearly labelled and shown separately from the customer's words." />
      <ScoreIntegrityNotice variant="inline">Responding to reviews never changes ratings, sentiment analysis or Qeivo scores. Reviews cannot be edited or removed by manufacturers.</ScoreIntegrityNotice>
      <div className="flex flex-wrap gap-2">
        {(["unanswered", "negative", "all"] as const).map((f) => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)} count={all.filter((r) => (f === "all" ? true : f === "unanswered" ? !r.manufacturerReply && !sent[r.id] : r.rating <= 3)).length}>
            {f === "unanswered" ? "Needs reply" : f === "negative" ? "3★ and below" : "All reviews"}
          </FilterChip>
        ))}
      </div>
      <div className="space-y-4">
        {list.length === 0 && <p className="text-sm text-muted-foreground">Nothing here — every review in this view has a reply.</p>}
        {list.map((r) => {
          const reply = sent[r.id] ?? r.manufacturerReply?.body;
          return (
            <div key={r.id} className="grid gap-4 rounded-[20px] border border-border bg-card p-4 shadow-xs lg:grid-cols-2">
              <div>
                <p className="mb-2 text-[12px] font-medium text-muted-foreground">{getProduct(r.productId)?.name}</p>
                <ReviewCard review={{ ...r, manufacturerReply: undefined }} compact />
              </div>
              <div className="flex flex-col">
                {reply ? (
                  <div className="rounded-[14px] border border-claim-manufacturer/30 bg-claim-manufacturer-soft/50 p-4">
                    <p className="flex items-center gap-2 text-[12px] font-semibold text-claim-manufacturer">
                      <ShieldCheck className="size-4" /> Official reply · Nordvik {sent[r.id] && <Badge variant="info">Awaiting moderation (demo)</Badge>}
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed">{reply}</p>
                    {r.manufacturerReply && !sent[r.id] && <p className="mt-2 text-[12px] text-muted-foreground">{formatDate(r.manufacturerReply.date)}</p>}
                  </div>
                ) : (
                  <>
                    <Label htmlFor={`reply-${r.id}`} className="mb-2">
                      Draft an official reply
                    </Label>
                    <Textarea id={`reply-${r.id}`} value={drafts[r.id] ?? ""} onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })} placeholder={`Hi ${r.authorName.split(" ")[0]}, thank you for…`} className="min-h-28 flex-1" />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[12px] text-muted-foreground tabular">{(drafts[r.id] ?? "").length}/1000</span>
                      <Button
                        size="sm"
                        disabled={(drafts[r.id] ?? "").trim().length < 20}
                        onClick={() => {
                          setSent({ ...sent, [r.id]: drafts[r.id].trim() });
                          toast.success("Reply submitted for moderation (demo)");
                        }}
                      >
                        <Send /> Submit reply
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

/* ---------------------------------------------------------------- Videos */
export function ManufacturerVideosView() {
  const ids = new Set(nordvikProducts.map((p) => p.id));
  const brandVideos = videos.filter((v) => v.productIds.some((id) => ids.has(id)));
  const queue = useUploadQueue({ processing: true });
  const [title, setTitle] = useState("");
  const [product, setProduct] = useState(nordvikProducts[0].id);
  const [chapters, setChapters] = useState([{ time: "00:00", title: "Introduction" }]);
  const [sponsored, setSponsored] = useState(false);
  const [published, setPublished] = useState(false);
  const canSubmit = title.trim().length >= 5 && queue.items.length > 0 && chapters.every((c) => /^\d{2}:\d{2}$/.test(c.time) && c.title.trim());

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader title="Videos" description="Upload demos and installation videos. Manufacturer videos are always labelled as manufacturer content." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Upload a video" description="Demo — the file stays in your browser.">
          <div className="space-y-4">
            <UploadDropzone accept="video/*" multiple={false} title="Drop a video file" hint="MP4 or MOV up to 2 GB" icon={VideoIcon} onFiles={(f) => queue.add(f, () => ({}))} compact />
            {queue.items.map((it) => (
              <UploadRow key={it.id} item={it} onRemove={() => queue.remove(it.id)} processingLabel="Transcoding…" doneLabel="Ready to publish" />
            ))}
            <div className="space-y-2">
              <Label htmlFor="v-title">Title</Label>
              <Input id="v-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Frostline FD700 — full product tour" />
            </div>
            <div className="space-y-2">
              <Label>Linked product</Label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger aria-label="Linked product">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nordvikProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-[13px] font-medium">Chapters</p>
              {chapters.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Input aria-label={`Chapter ${i + 1} time`} value={c.time} onChange={(e) => setChapters(chapters.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))} className={cn("w-24 font-mono", !/^\d{2}:\d{2}$/.test(c.time) && "border-danger")} />
                  <Input aria-label={`Chapter ${i + 1} title`} value={c.title} onChange={(e) => setChapters(chapters.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                  <Button variant="ghost" size="icon" disabled={chapters.length === 1} onClick={() => setChapters(chapters.filter((_, j) => j !== i))} aria-label="Remove chapter">
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setChapters([...chapters, { time: "00:00", title: "" }])}>
                <Plus /> Add chapter
              </Button>
            </div>
            <div className="space-y-2 rounded-[12px] border border-border p-3">
              <p className="text-[13px] font-medium">Disclosure label</p>
              <p className="text-[12px] text-muted-foreground">Shown on the video automatically: “Manufacturer content — Nordvik”.</p>
              <Label className="cursor-pointer font-normal">
                <Checkbox checked={sponsored} onCheckedChange={(c) => setSponsored(c === true)} /> This video was produced with a paid creator partner
              </Label>
            </div>
            <Button
              className="w-full"
              disabled={!canSubmit}
              onClick={() => {
                setPublished(true);
                toast.success("Video submitted for review (demo)", { description: `${title} · ${getProduct(product)?.model}` });
              }}
            >
              Submit for review
            </Button>
            {published && <p className="rounded-[12px] bg-success-soft/60 p-3 text-[13px] text-success">Submitted. In production, Qeivo reviews disclosures and chapters before publishing.</p>}
          </div>
        </Panel>
        <Panel title={`Videos featuring Nordvik products (${brandVideos.length})`}>
          <div className="grid gap-4 sm:grid-cols-2">
            {brandVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </Panel>
      </div>
    </PageContainer>
  );
}
