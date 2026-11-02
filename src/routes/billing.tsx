import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, CreditCard, Trash2, CircleCheck, X, ArrowLeft, Smartphone, Landmark } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Frame, PageHeader } from "@/components/ads/Shell";
import { actions, money, useCurrentAccount } from "@/lib/ads-store";
import { AddFundsFlow } from "@/components/ads/AddFundsFlow";
import { PaymentActivity } from "@/components/ads/PaymentActivity";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Billing & payments – Ads Manager" },
      { name: "description", content: "Add funds, payment methods, spending limits and see payment activity." },
      { property: "og:title", content: "Billing & payments – Ads Manager" },
      { property: "og:description", content: "Add funds, payment methods, spending limits and see payment activity." },
    ],
  }),
  component: Billing,
});

type Modal = null | "funds" | "method" | "limit" | "tax" | "activity" | "business";

function Billing() {
  const a = useCurrentAccount();
  const [taxDismissed, setTaxDismissed] = useState(false);
  const [m, setM] = useState<Modal>(null);
  const [amount, setAmount] = useState("");
  const [via, setVia] = useState("UPI");
  const [method, setMethod] = useState({ type: "Card", value: "" });
  const [gst, setGst] = useState("");
  const [fundOpen, setFundOpen] = useState(false);
  const close = () => { setM(null); setAmount(""); };
  const section = "border-b py-4";
  const softBtn = "mt-3 w-full rounded-md bg-accent py-2.5 font-medium text-accent-foreground";

  if (m === "activity") return <Frame nav={false}><PaymentActivity account={a} onClose={close} /></Frame>;
  if (fundOpen) return <Frame nav={false}><AddFundsFlow account={a} onClose={() => setFundOpen(false)} /></Frame>;

  return (
    <Frame nav={false}>
      <PageHeader title="Billing & payments" />
      <div className="reference-billing bg-card px-4">
        {!a.taxVerified && !taxDismissed && (
          <div className="reference-tax my-4 rounded-lg border p-3">
            <Button variant="plain" size="icon" className="tax-close" aria-label="Dismiss tax reminder" onClick={()=>setTaxDismissed(true)}><X /></Button>
            <p className="font-semibold">Verify your tax info</p>
            <p className="text-sm text-muted-foreground">Submit your GST number to confirm that you're a registered taxpayer. We need this info to comply with local tax regulations.</p>
            <Button variant="meta" onClick={() => setM("tax")} className="mt-3 w-full">Verify tax info</Button>
          </div>
        )}
        <div className={section}><p className="font-bold">Your account</p><p className="break-words text-muted-foreground">{a.name} ({a.id})</p></div>
        <div className={section}>
          <Button variant="plain" onClick={() => setM("activity")} className="flex w-full items-start text-left">
            <span className="flex-1"><span className="block font-bold">Available funds</span><span className="text-sm text-muted-foreground">We'll deduct funds about once a day when you run ads. If funds run out, your ads will be paused.</span>
            <span className="mt-2 block text-2xl font-bold">{money(a.funds, a.currency)}</span></span><ChevronRight className="mt-8 h-5 w-5" />
          </Button>
          <Button variant="plain" onClick={() => setFundOpen(true)} className={softBtn}>Add funds</Button>
        </div>
        <div className={section}>
          <p className="font-bold">Payment methods</p>
          {a.paymentMethods.length === 0 ? <p className="text-sm text-muted-foreground">You haven't added any payment methods.</p> : (
            <ul className="mt-2 space-y-2">{a.paymentMethods.map((p) => (
              <li key={p} className="flex items-center gap-3 rounded-md border p-2"><CreditCard className="h-5 w-5" /><span className="flex-1 text-sm">{p}</span>
                <Button variant="plain" aria-label="Remove" onClick={() => { actions.updateAccount(a.id, { paymentMethods: a.paymentMethods.filter((x) => x !== p) }); toast("Payment method removed"); }}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button></li>))}</ul>
          )}
          <Button variant="plain" onClick={() => setM("method")} className={softBtn}>Add payment method</Button>
        </div>
        <div className={section}>
          <Button variant="plain" onClick={() => setM("limit")} className="flex w-full items-center text-left"><span className="flex-1"><span className="block font-bold">Account spending limit</span><span className="text-sm text-muted-foreground">{a.spendingLimit ? money(a.spendingLimit, a.currency) : "No limit set"}</span></span><ChevronRight className="h-5 w-5" /></Button>
        </div>
        <div className={section}>
          <Button variant="plain" onClick={() => setM("activity")} className="flex w-full items-center text-left"><span className="flex-1"><span className="block font-bold">Payment activity</span><span className="text-sm text-muted-foreground">Statements, recent and pending charges</span></span><ChevronRight className="h-5 w-5" /></Button>
        </div>
        <div className={section}>
          <Button variant="plain" onClick={() => setM("business")} className="flex w-full items-center text-left"><span className="flex-1"><span className="block font-bold">Business info</span><span className="text-sm text-muted-foreground">Your name, address and tax info.</span></span><ChevronRight className="h-5 w-5" /></Button>
        </div>
        <div className="py-4"><Button variant="plain" onClick={() => toast("A support request has been opened")} className="w-full rounded-md bg-secondary py-2.5 font-medium">Get support</Button></div>
      </div>

      <Dialog open={m !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          {m === "funds" && (<>
            <DialogHeader><DialogTitle>Add funds</DialogTitle></DialogHeader>
            <div className="flex gap-2">{[500, 1000, 2000, 5000].map((v) => <Button variant="plain" key={v} onClick={() => setAmount(String(v))} className={`flex-1 rounded-md border py-2 text-sm ${amount === String(v) ? "border-primary bg-accent" : ""}`}>{a.currency === "INR" ? "₹" : "$"}{v}</Button>)}</div>
            <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="rounded-md border px-3 py-2" />
            <select value={via} onChange={(e) => setVia(e.target.value)} className="rounded-md border px-3 py-2"><option>UPI</option><option>Card</option><option>Net banking</option></select>
            <Button variant="plain" disabled={!(Number(amount) > 0)} onClick={() => { actions.addFunds(a.id, Number(amount), via); toast.success(`${money(Number(amount), a.currency)} added`); close(); }} className="rounded-md bg-primary py-2 font-medium text-primary-foreground disabled:opacity-50">Pay {amount ? money(Number(amount), a.currency) : ""}</Button>
          </>)}
          {m === "method" && (<>
            <DialogHeader><DialogTitle>Add payment method</DialogTitle></DialogHeader>
            <select value={method.type} onChange={(e) => setMethod({ ...method, type: e.target.value })} className="rounded-md border px-3 py-2"><option>Card</option><option>UPI</option></select>
            <input value={method.value} onChange={(e) => setMethod({ ...method, value: e.target.value })} placeholder={method.type === "Card" ? "Card number" : "UPI ID (name@bank)"} className="rounded-md border px-3 py-2" />
            <Button variant="plain" disabled={method.value.trim().length < 4} onClick={() => {
              const label = method.type === "Card" ? `Card •••• ${method.value.replace(/\D/g, "").slice(-4)}` : `UPI · ${method.value.trim()}`;
              actions.updateAccount(a.id, { paymentMethods: [...a.paymentMethods, label] }); toast.success("Payment method added"); setMethod({ type: "Card", value: "" }); close();
            }} className="rounded-md bg-primary py-2 font-medium text-primary-foreground disabled:opacity-50">Save</Button>
          </>)}
          {m === "limit" && (<>
            <DialogHeader><DialogTitle>Account spending limit</DialogTitle></DialogHeader>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={a.spendingLimit ? String(a.spendingLimit) : "Set limit"} className="rounded-md border px-3 py-2" />
            <Button variant="plain" onClick={() => { actions.updateAccount(a.id, { spendingLimit: Number(amount) || null }); toast.success("Spending limit updated"); close(); }} className="rounded-md bg-primary py-2 font-medium text-primary-foreground">Save</Button>
            {a.spendingLimit && <Button variant="plain" onClick={() => { actions.updateAccount(a.id, { spendingLimit: null }); close(); }} className="rounded-md bg-secondary py-2 font-medium">Remove limit</Button>}
          </>)}
          {m === "tax" && (<>
            <DialogHeader><DialogTitle>Verify tax info</DialogTitle></DialogHeader>
            <input value={gst} onChange={(e) => setGst(e.target.value.toUpperCase())} maxLength={15} placeholder="15-digit GSTIN" className="rounded-md border px-3 py-2" />
            <Button variant="plain" disabled={gst.length !== 15} onClick={() => { actions.updateAccount(a.id, { taxVerified: true }); toast.success("Tax info verified"); close(); }} className="rounded-md bg-primary py-2 font-medium text-primary-foreground disabled:opacity-50">Submit</Button>
          </>)}
          {m === "business" && (<>
            <DialogHeader><DialogTitle>Business info</DialogTitle></DialogHeader>
            <input defaultValue={a.name} onBlur={(e) => e.target.value.trim() && actions.updateAccount(a.id, { name: e.target.value.trim() })} className="rounded-md border px-3 py-2" />
            <p className="text-sm text-muted-foreground">Tax status: {a.taxVerified ? "Verified" : "Not verified"} · Currency: {a.currency}</p>
            <Button variant="plain" onClick={() => { toast.success("Business info saved"); close(); }} className="rounded-md bg-primary py-2 font-medium text-primary-foreground">Done</Button>
          </>)}
        </DialogContent>
      </Dialog>
    </Frame>
  );
}
