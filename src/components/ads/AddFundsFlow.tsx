import { useEffect, useState } from "react";
import { ChevronLeft, X, Landmark, Clock, Info, Grid2X2, ReceiptText, LoaderCircle, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { actions, money, type Account } from "@/lib/ads-store";
import { createFundRequest, fundRequestAutoCompleted, fundRequestExpired, FUND_MIN, FUND_MAX, validFundAmount } from "@/lib/fund-request";

function PaymentMarks({ kind }: { kind: string }) {
  return <span className="payment-marks" aria-hidden="true">{kind === "Card" ? <><span className="payment-visa">VISA</span><span className="payment-master"><i /><i /></span><span className="payment-rupay">RuPay</span></> : kind === "UPI" ? <><span className="payment-upi">UPI<span>▰</span></span><span className="payment-gpay"><b>G</b> Pay</span><span className="payment-phone">पे</span><span className="payment-paytm">paytm</span></> : <span><Landmark /></span>}</span>;
}

export function AddFundsFlow({ account, onClose }: { account: Account; onClose: () => void }) {
  const [amount, setAmount] = useState("5000");
  const [via, setVia] = useState("UPI");
  const [step, setStep] = useState<"amount" | "processing" | "qr" | "success">("amount");
  const [request, setRequest] = useState<{ amount: number; createdAt: number; expiresAt: number } | null>(null);
  const [now, setNow] = useState(0);
  const [appsOpen, setAppsOpen] = useState(false);
  const [waitingHint, setWaitingHint] = useState(false);
  useEffect(() => {
    if (step !== "processing") return;
    const timer = setTimeout(() => {
      const time = Date.now();
      setRequest(createFundRequest(Number(amount), time));
      setNow(time);
      setStep("qr");
    }, 1100);
    return () => clearTimeout(timer);
  }, [step, amount]);
  useEffect(() => {
    if (step !== "qr") return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [step]);
  useEffect(() => {
    if (step !== "qr" || !request || !fundRequestAutoCompleted(request, now)) return;
    actions.addFunds(account.id, request.amount, via);
    setStep("success");
  }, [step, request, now, account.id, via]);
  const expired = request ? fundRequestExpired(request.expiresAt, now) : false;
  const seconds = request ? Math.max(0, Math.ceil((request.expiresAt - now) / 1000)) : 300;
  const countdown = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const back = () => { if (step === "qr") { setStep("amount"); setWaitingHint(false); } else onClose(); };
  return <div className="funds-page reference-fund-flow">
    <header className="fund-flow-header"><Button variant="plain" size="icon" aria-label="Back" onClick={back}><ChevronLeft /></Button><h1>{step === "qr" || step === "success" ? "Complete payment" : "Add funds"}</h1><Button variant="plain" size="icon" aria-label="Close payment" onClick={onClose}><X /></Button></header>
    {(step === "amount" || step === "processing") && <>
      <div className="fund-flow-body">
        <h2>Choose amount</h2><p>Choose an amount to add to your available funds. We'll deduct from your total as your ads run.</p>
        <div className="fund-amount-presets"><Button variant="metaOutline" aria-pressed={amount === String(FUND_MAX)} onClick={() => setAmount(String(FUND_MAX))}>{money(FUND_MAX, account.currency)}</Button><Button variant="metaOutline" aria-pressed={amount !== String(FUND_MAX)} onClick={() => setAmount("5000")}>Other</Button></div>
        <label className="fund-amount-input"><span>Amount</span><span className="fund-input-line"><span>{account.currency === "INR" ? "₹" : "$"}</span><input aria-label="Amount" type="number" min={FUND_MIN} max={FUND_MAX} step="0.01" value={amount} onChange={e => setAmount(e.target.value)} /></span></label>
        <p className="fund-amount-hint">Enter an amount between {money(FUND_MIN, account.currency)} and {money(FUND_MAX, account.currency)}.</p>
        <h2 className="fund-method-heading">Add payment method</h2>
        <div className="fund-methods">{[{ name: "Card", label: "Debit or credit card" }, { name: "UPI", label: "UPI" }, { name: "Net banking", label: "Net Banking" }].map(method => <label key={method.name}><span>{method.label}</span><PaymentMarks kind={method.name} /><input type="radio" name="payment-method" value={method.name} checked={via === method.name} onChange={() => setVia(method.name)} /></label>)}</div>
        <p className="fund-demo-note">Demo payment · No real money is charged</p>
      </div>
      <div className="funds-footer"><Button variant="meta" disabled={!validFundAmount(Number(amount)) || step === "processing"} onClick={() => setStep("processing")}>Next</Button></div>
    </>}
    {step === "processing" && <div className="fund-processing" role="status"><LoaderCircle /><span>Processing...</span></div>}
    {step === "qr" && request && <div className="fund-complete-body">
      <div className="fund-meta-mark"><svg viewBox="0 0 42 24" aria-hidden="true"><path d="M3 19C-1 9 9-7 17 8l9 12c8 9 15-4 11-12C29-10 23 11 16 20 7 30 2 18 3 19Z" fill="none" stroke="currentColor" strokeWidth="3" /></svg><strong>Meta</strong><span>Demo</span></div>
      <h2 className="fund-payment-amount">{money(request.amount, account.currency)}</h2>
      <div className={`fund-qr ${expired ? "fund-qr-expired" : ""}`}>{!expired ? <QRCodeSVG value={`urn:ads-manager:demo-payment:${account.id}:${request.amount}:${request.expiresAt}`} size={228} marginSize={0} /> : <Clock />}<span className="sr-only">Demo QR code, not a real payment request</span></div>
      <Button variant="metaOutline" className="fund-pay-app" disabled={expired} onClick={() => setWaitingHint(true)}>{via === "UPI" ? "Pay with UPI app" : `Pay with ${via === "Card" ? "card" : "Net Banking"}`}</Button>
      <div className="fund-payment-details">
        <div><ReceiptText /><p>{account.name} ({account.id})</p></div>
        <div><Clock /><p>{expired ? "Payment request expired" : <>Payment request expires at {new Date(request.expiresAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}, {new Date(request.expiresAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}<span className="fund-countdown" role="timer">Expires in {countdown}</span></>}</p></div>
        <div><Grid2X2 /><p>PhonePE, GooglePay, Paytm, and BHIM are supported. <Button variant="link" className="fund-inline-link" onClick={() => setAppsOpen(v => !v)}>All supported apps</Button>{appsOpen && <span className="block mt-2">PhonePe · Google Pay · Paytm · BHIM</span>}</p></div>
        <div><Info /><p>UPI processing times may vary. If you already paid, you can close this screen and check back later for your updated balance.</p></div>
      </div>
      {!expired && <div className="fund-waiting" role="status"><LoaderCircle /><span>{waitingHint ? "Approve the payment in your UPI app…" : "Waiting for payment…"}</span></div>}
      <p className="fund-demo-note">Demo QR only · No real money is charged</p>
      {expired && <Button variant="meta" className="w-full" onClick={() => { setWaitingHint(false); setStep("processing"); }}>Generate new QR</Button>}
    </div>}
    {step === "success" && request && <><div className="fund-done">
      <span className="fund-done-check"><Check /></span>
      <h2>{money(request.amount, account.currency)} successfully added</h2>
      <p>Your balance may take a few minutes to update in your account.</p>
    </div><div className="funds-footer"><Button variant="meta" onClick={onClose}>Done</Button></div></>}
  </div>;
}