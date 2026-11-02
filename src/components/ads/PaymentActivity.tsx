import { useState } from "react";
import { ChevronLeft, ChevronRight, ReceiptText, ClockFading, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, type Account } from "@/lib/ads-store";

const longDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export function PaymentActivity({ account, onClose }: { account: Account; onClose: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const tx = account.transactions.find(t => t.id === openId);
  const amount = (n: number) => money(n, account.currency);

  return <div className="funds-page reference-fund-flow">
    <header className="fund-flow-header activity-header">
      <Button variant="plain" size="icon" aria-label="Back" onClick={() => tx ? setOpenId(null) : onClose()}><ChevronLeft /></Button>
      <h1>{tx ? "Payment details" : "Payment activity"}</h1>
    </header>
    {!tx && (account.transactions.length === 0
      ? <p className="activity-empty">No payment activity yet.</p>
      : <ul className="activity-list">{account.transactions.map(t => <li key={t.id}>
          <Button variant="plain" className="activity-item" onClick={() => setOpenId(t.id)}>
            <span className="activity-main"><span className="activity-date">{longDate(t.date)}</span><span className="activity-status">Completed</span></span>
            <span className="activity-amount-value">{amount(t.amount)}</span>
            <ChevronRight className="activity-chevron" />
          </Button>
        </li>)}</ul>)}
    {tx && <div className="fund-complete-body">
      <h2 className="fund-payment-amount">{amount(tx.amount)}</h2>
      <div className="fund-payment-details">
        <div><CircleCheck /><p>Completed · {tx.label}</p></div>
        <div><ClockFading /><p>{longDate(tx.date)}</p></div>
        <div><ReceiptText /><p>{account.name} ({account.id})</p></div>
      </div>
    </div>}
  </div>;
}
