import {useState,useCallback} from 'react';
import {Ctx} from './ui';
import Layanan from './Layanan';import Pelanggan from './Pelanggan';
import Order from './Order';import Laporan from './Laporan';
const TABS={Layanan,Pelanggan,Order,Laporan};
const SUB={Layanan:'Kelola jenis layanan dan harga',Pelanggan:'Data pemilik cucian',Order:'Lacak cucian dari diterima sampai diambil',Laporan:'Ringkasan harian'};
const ICON={
  Layanan:<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>,
  Pelanggan:<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>,
  Order:<><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8a3 3 0 0 1 6 0"/></>,
  Laporan:<path d="M5 20V10M12 20V4M19 20v-7"/>};
export default function App(){
  const [tab,setTab]=useState('Order');
  const [toast,setToast]=useState(null);
  const notify=useCallback((msg,type='ok')=>{setToast({msg,type});setTimeout(()=>setToast(null),3000)},[]);
  const Page=TABS[tab];
  return <Ctx.Provider value={notify}><div className="app">
    <header>
      <small>Halo, Zulfa 👋</small><h1>Cuci Kilat</h1><p>{SUB[tab]}</p>
    </header>
    <main><Page key={tab}/></main>
    <nav>{Object.keys(TABS).map(t=><button key={t} className={t===tab?'on':''} onClick={()=>setTab(t)}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ICON[t]}</svg>{t}</button>)}</nav>
    {toast&&<div className={'toast '+toast.type}>{toast.msg}</div>}
  </div></Ctx.Provider>;
}
