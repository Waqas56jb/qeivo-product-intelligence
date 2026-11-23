"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { CategorySlug } from "@/types";
import { DEMO_NOW, cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox, Label, UserAvatar } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/menus";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORY_LABEL } from "./project-bits";
import { CURRENT_MEMBER_ID, useWorkspaceStore } from "./workspace-store";

const TODAY = DEMO_NOW.toISOString().slice(0, 10);
const CATEGORIES = Object.keys(CATEGORY_LABEL) as [CategorySlug, ...CategorySlug[]];

const schema = z.object({
  name: z.string().trim().min(4, "Give the project a name of at least 4 characters.").max(80, "Keep the name under 80 characters."),
  description: z.string().trim().max(300, "Keep the brief under 300 characters."),
  category: z.enum(CATEGORIES, { message: "Choose a category." }),
  budget: z.number({ message: "Enter a budget in USD." }).min(100, "Budget must be at least $100.").max(5_000_000, "Budget looks too large for a demo project."),
  quantity: z.number({ message: "Enter how many units you need." }).int("Use a whole number of units.").min(1, "At least 1 unit.").max(5000, "Maximum 5,000 units."),
  dueDate: z.string().min(1, "Pick a due date.").refine((v) => v > TODAY, "Due date must be after today (23 Nov 2026)."),
  memberIds: z.array(z.string()).min(1, "Add at least one teammate."),
});

type FormValues = z.infer<typeof schema>;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-[12px] text-danger-foreground">
      {message}
    </p>
  );
}

export function NewProjectDialog({ trigger, onCreated }: { trigger?: (open: () => void) => React.ReactNode; onCreated?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const members = useWorkspaceStore((s) => s.members);
  const addProject = useWorkspaceStore((s) => s.addProject);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", category: "refrigerators", budget: undefined as unknown as number, quantity: undefined as unknown as number, dueDate: "", memberIds: [CURRENT_MEMBER_ID] },
  });
  const { register, handleSubmit, control, formState, watch, reset } = form;
  const errors = formState.errors;
  const budget = watch("budget");
  const quantity = watch("quantity");
  const perUnit = budget > 0 && quantity > 0 ? budget / quantity : null;

  const submit = handleSubmit((v) => {
    const id = addProject({
      name: v.name,
      description: v.description || "No brief written yet.",
      status: "active",
      owner: CURRENT_MEMBER_ID,
      memberIds: v.memberIds.includes(CURRENT_MEMBER_ID) ? v.memberIds : [CURRENT_MEMBER_ID, ...v.memberIds],
      productIds: [],
      dueDate: v.dueDate,
      budget: v.budget,
      quantity: v.quantity,
      category: v.category,
    });
    toast.success("Project created", { description: `${v.name} · added to this demo session only.` });
    reset();
    setOpen(false);
    onCreated?.(id);
  });

  return (
    <>
      {trigger ? (
        trigger(() => setOpen(true))
      ) : (
        <Button variant="brand" onClick={() => setOpen(true)}>
          <Plus /> New project
        </Button>
      )}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>New research project</DialogTitle>
            <DialogDescription>Set the brief, budget and team. You can add products to the shortlist from any product page.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="np-name">Project name</Label>
              <Input id="np-name" placeholder="e.g. Elm Street turnover — dishwashers" aria-invalid={!!errors.name} aria-describedby="np-name-err" {...register("name")} />
              <FieldError id="np-name-err" message={errors.name?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="np-desc">Brief <span className="font-normal text-subtle-foreground">(optional)</span></Label>
              <Textarea id="np-desc" className="min-h-20" placeholder="Constraints the team should know: opening sizes, noise limits, delivery windows…" aria-invalid={!!errors.description} aria-describedby="np-desc-err" {...register("description")} />
              <FieldError id="np-desc-err" message={errors.description?.message} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="np-cat">Category</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="np-cat" aria-invalid={!!errors.category}>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {CATEGORY_LABEL[c]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError id="np-cat-err" message={errors.category?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-due">Due date</Label>
                <Input id="np-due" type="date" min={TODAY} aria-invalid={!!errors.dueDate} aria-describedby="np-due-err" {...register("dueDate")} />
                <FieldError id="np-due-err" message={errors.dueDate?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-budget">Total budget (USD)</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-subtle-foreground">$</span>
                  <Input id="np-budget" type="number" inputMode="decimal" min={0} step={100} className="pl-7 tabular" placeholder="48,000" aria-invalid={!!errors.budget} aria-describedby="np-budget-err" {...register("budget", { valueAsNumber: true })} />
                </div>
                <FieldError id="np-budget-err" message={errors.budget?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-qty">Quantity (units)</Label>
                <Input id="np-qty" type="number" inputMode="numeric" min={1} step={1} className="tabular" placeholder="40" aria-invalid={!!errors.quantity} aria-describedby="np-qty-err" {...register("quantity", { valueAsNumber: true })} />
                <FieldError id="np-qty-err" message={errors.quantity?.message} />
              </div>
            </div>
            <p className={cn("rounded-[10px] bg-surface-2 px-3 py-2 text-[12px] text-muted-foreground tabular", !perUnit && "opacity-70")}>
              {perUnit ? (
                <>
                  Budget per unit: <span className="font-semibold text-foreground">{formatCurrency(perUnit, "US", { decimals: 0 })}</span> including delivery and installation.
                </>
              ) : (
                "Enter a budget and quantity to see the per-unit allowance."
              )}
            </p>
            <fieldset className="space-y-2">
              <legend className="mb-2 text-[13px] font-medium">Team</legend>
              <Controller
                control={control}
                name="memberIds"
                render={({ field }) => (
                  <div className="grid max-h-52 gap-1 overflow-y-auto rounded-[12px] border border-border p-1 scrollbar-thin sm:grid-cols-2">
                    {members.map((m) => {
                      const checked = field.value.includes(m.id);
                      return (
                        <label key={m.id} className={cn("flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[9px] px-2 py-1.5 transition-colors hover:bg-surface-2", checked && "bg-brand-soft/40")}>
                          <Checkbox checked={checked} onCheckedChange={(v) => field.onChange(v ? [...field.value, m.id] : field.value.filter((x) => x !== m.id))} aria-label={m.name} />
                          <UserAvatar src={m.avatar || undefined} name={m.name} className="size-7" />
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium">{m.name}</span>
                            <span className="block truncate text-[11px] text-muted-foreground">{m.role}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              <FieldError id="np-members-err" message={errors.memberIds?.message} />
            </fieldset>
            <DialogFooter className="pt-1">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="brand">
                <Plus /> Create project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
