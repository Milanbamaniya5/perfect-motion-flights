'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function money(a,c){try{return new Intl.NumberFormat('en-GB',{style:'currency',currency:c}).format(Number(a))}catch{return `${c} ${a}`}}
function time(s){return s?new Date(s).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'—'}

export default function Payment(){
 const sp=useSearchParams(), router=useRouter();
 const id=sp.get('offerId');
 const [offer,setOffer]=useState(null),[method,setMethod]=useState('card'),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{if(!id)return;fetch('/api/payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({offerId:id})}).then(r=>r.json()).then(j=>{if(j.offer)setOffer(j.offer);else setError(j.error||'Payment setup failed')}).catch(e=>setError(e.message))},[id]);
 async function pay(e){
  e.preventDefault(); setError(''); setBusy(true);
  try{
   const passengers=JSON.parse(sessionStorage.getItem('tripScannerPassengers')||'[]');
   if(!passengers.length) throw new Error('Passenger details are missing.');
   const o=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({offer_id:id,passengers})}).then(x=>x.json());
   if(!o.success) throw new Error(o.error||'Booking failed');
   sessionStorage.setItem('tripScannerOrder',JSON.stringify(o.data));
   sessionStorage.setItem('tripScannerPayment','demo');
   router.push(`/confirmation?orderId=${encodeURIComponent(o.data.id||'')}`);
  }catch(x){setError(x.message);setBusy(false)}
 }
 const segs=offer?.slices?.flatMap(s=>s.segments||[])||[];
 return <main className="checkout-shell"><header className="site-header"><div className="brand">✈ Trip Scanner <b>Hub</b></div><span>Payment</span></header>
 <div className="checkout-grid"><section><div className="stepbar"><span>✓ Passenger</span><b>2 Payment</b><span>3 Confirmation</span></div>
 <form className="payment-card" onSubmit={pay}><div className="demo-badge">DEMO PAYMENT · No real money will be charged</div><h1>Choose payment method</h1><p>Your payment page is ready for Stripe later. For now this is a safe demo checkout.</p>
 <div className="pay-methods"><button type="button" className={method==='apple'?'selected':''} onClick={()=>setMethod('apple')}> Apple Pay <small>Demo</small></button><button type="button" className={method==='card'?'selected':''} onClick={()=>setMethod('card')}>💳 Card <small>Demo</small></button></div>
 {method==='apple'?<div className="wallet-demo"><div className="apple-mark"></div><b>Apple Pay</b><span>Demo wallet payment</span></div>:<div className="card-demo"><label>Card number<input inputMode="numeric" placeholder="4242 4242 4242 4242"/></label><div className="form-grid"><label>Expiry<input placeholder="MM / YY"/></label><label>CVV<input placeholder="123"/></label></div><label>Cardholder name<input placeholder="Name on card"/></label><label>Billing country<select defaultValue="GB"><option value="GB">United Kingdom</option><option value="IN">India</option><option value="US">United States</option><option value="PT">Portugal</option></select></label></div>}
 {error&&<div className="error">⚠ {error}</div>}<button disabled={busy||!offer} className="primary wide">{busy?'Processing…':`Pay ${offer?money(offer.total_amount,offer.total_currency):''} →`}</button><div className="secure-note">🔒 Demo mode · No card details are stored or charged.</div></form></section>
 <aside className="summary"><h3>Booking summary</h3>{segs.map((s,i)=><div className="summary-leg" key={i}><b>{time(s.departing_at)} {s.origin?.iata_code} → {time(s.arriving_at)} {s.destination?.iata_code}</b><small>{s.marketing_carrier?.name||offer?.owner?.name} · {s.marketing_carrier_flight_number||''}</small></div>)}<div className="total"><span>Total</span><strong>{offer&&money(offer.total_amount,offer.total_currency)}</strong></div></aside></div></main>
}
