import { ChevronLeft, X, ReceiptText, ClockFading, Info, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, type Account } from "@/lib/ads-store";

export function PaymentActivity({ account, onClose }: { account: Account; onClose: () => void }) {
  const rupee = (n: number) => money(n, account.currency).replace(/^(\D+)/, "$1 ");
  return <div className="funds-page reference-fund-flow">
    <header className="fund-flow-header"><Button variant="plain" size="icon" aria-label="Back" onClick={onClose}><ChevronLeft /></Button><h1>Payment activity</h1><Button variant="plain" size="icon" aria-label="Close payment activity" onClick={onClose}><X /></Button></header>
    <div className="fund-complete-body">
      <p className="activity-amount-label">Available funds</p>
      <h2 className="fund-payment-amount activity-amount">{rupee(account.funds)}</h2>
      <div className="fund-payment-details">
        <div><ReceiptText /><p>{account.name} ({account.id})</p></div>
        {account.transactions.length === 0
          ? <div><Wallet /><p>No payment activity yet.</p></div>
          : account.transactions.map(t => <div key={t.id}><ClockFading /><p className="activity-row"><span><span className="activity-label">{t.label}</span><span className="block">{t.date}</span></span><span className="activity-value">{rupee(t.amount)}</span></p></div>)}
        <div><Info /><p>UPI processing times may vary. If you already paid, you can close this screen and check back later for your updated balance.</p></div>
      </div>
    </div>
  </div>;
}
