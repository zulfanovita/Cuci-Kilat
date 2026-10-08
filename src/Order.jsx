import {useState} from 'react';
import {collection,addDoc,getDocs,updateDoc,deleteDoc,doc,query,orderBy,limit,serverTimestamp} from 'firebase/firestore';
import {db} from './firebase';
import {useLoad,rows,rp,today,useNotify,Confirm,ListState,Field} from './ui';
const STATUS=['semua','diterima','dicuci','selesai','diambil','dibatalkan'];
const NEXT={diterima:'dicuci',dicuci:'selesai',selesai:'diambil'};
const LABEL={dicuci:'Tandai Dicuci',selesai:'Tandai Selesai',diambil:'Tandai Diambil'};
function OrderForm({onDone,onCancel}){
  const notify=useNotify();
  const pel=useLoad(async()=>rows(await getDocs(query(collection(db,'pelanggan'),orderBy('nama'),limit(20)))));
  const lay=useLoad(async()=>rows(await getDocs(query(collection(db,'layanan'),orderBy('nama'),limit(20)))));
  const [f,setF]=useState({p:'',l:'',berat:'',catatan:''}),[err,setErr]=useState({}),[busy,setBusy]=useState(false);
  const set=k=>e=>setF({...f,[k]:e.target.value});
  const L=lay.data.find(x=>x.id===f.l),P=pel.data.find(x=>x.id===f.p),b=Number(f.berat);
  const total=L&&Number.isInteger(b)&&b>0?L.harga_per_kg*b:0;
  const save=async()=>{
    const e={};
    if(!P)e.p='Pilih pelanggan.';if(!L)e.l='Pilih layanan.';
    if(f.berat===''||!Number.isInteger(b)||b<1||b>50)e.berat='Berat harus bilangan bulat 1 sampai 50 kg (bulatkan ke atas).';
    if(f.catatan.length>100)e.catatan='Catatan maksimal 100 karakter.';
    setErr(e);if(Object.keys(e).length)return;
    setBusy(true);
    try{
      await addDoc(collection(db,'order'),{pelanggan_id:P.id,nama_pelanggan:P.nama,layanan_id:L.id,nama_layanan:L.nama,
        harga_per_kg:L.harga_per_kg,berat_kg:b,total:L.harga_per_kg*b,status:'diterima',catatan:f.catatan.trim(),
        tanggal_masuk:today(),dibuat_pada:serverTimestamp()});
      notify('Order tersimpan.');onDone();
    }catch{notify('Order gagal disimpan. Periksa isian lalu coba lagi.','err');setBusy(false)}};
  if(pel.loading||lay.loading)return <div className="card skeleton"/>;
  if(pel.error||lay.error)return <div className="state"><p>Data pelanggan atau layanan gagal dimuat.</p>
    <button className="btn primary" onClick={()=>{pel.reload();lay.reload()}}>Coba Lagi</button></div>;
  return <section><div className="title"><h2>Tambah Order</h2></div>
    <Field label="Pelanggan" error={err.p}><select value={f.p} onChange={set('p')}><option value="">Pilih pelanggan</option>
      {pel.data.map(p=><option key={p.id} value={p.id}>{p.nama} ({p.no_whatsapp})</option>)}</select></Field>
    <Field label="Layanan" error={err.l}><select value={f.l} onChange={set('l')}><option value="">Pilih layanan</option>
      {lay.data.map(l=><option key={l.id} value={l.id}>{l.nama} · {rp(l.harga_per_kg)}/kg</option>)}</select></Field>
    <Field label="Berat (kg)" error={err.berat}><input type="number" inputMode="numeric" value={f.berat} onChange={set('berat')}/></Field>
    <Field label="Catatan (opsional)" error={err.catatan}><input value={f.catatan} onChange={set('catatan')}/></Field>
    <p className="total">Total: <b>{rp(total)}</b></p>
    <div className="row"><button className="btn" onClick={onCancel}>Batal</button>
    <button className="btn primary" disabled={busy} onClick={save}>Simpan Order</button></div></section>;
}
export default function Order(){
  const notify=useNotify();
  const s=useLoad(async()=>rows(await getDocs(query(collection(db,'order'),orderBy('dibuat_pada','desc'),limit(20)))));
  const [adding,setAdding]=useState(false),[tab,setTab]=useState('semua'),[ask,setAsk]=useState(null);
  const run=async(fn,okMsg)=>{
    try{await fn();notify(okMsg);s.reload()}catch{notify('Perubahan ditolak atau gagal. Coba lagi.','err')}
    setAsk(null)};
  const ubah=(o,st)=>run(()=>updateDoc(doc(db,'order',o.id),{status:st}),'Status diubah menjadi '+st+'.');
  if(adding)return <OrderForm onDone={()=>{setAdding(false);s.reload()}} onCancel={()=>setAdding(false)}/>;
  const list=s.data.filter(o=>tab==='semua'||o.status===tab);
  return <section><div className="title"><h2>Order</h2><button className="btn primary" onClick={()=>setAdding(true)}>Tambah Order</button></div>
    <div className="tabs">{STATUS.map(t=><button key={t} className={t===tab?'on':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
    <ListState s={s} show={list.length>0} emptyText={tab==='semua'?'Belum ada order':'Tidak ada order berstatus '+tab}
      addLabel="Tambah Order" onAdd={tab==='semua'?()=>setAdding(true):null}>
      {list.map(o=><div key={o.id} className="card">
        <div className="head"><b>{o.nama_pelanggan}</b><span className={'badge '+o.status}>{o.status}</span></div>
        <div>{o.nama_layanan} · {o.berat_kg} kg × {rp(o.harga_per_kg)}</div>
        <div><b>{rp(o.total)}</b> · masuk {o.tanggal_masuk}</div>{o.catatan&&<small>Catatan: {o.catatan}</small>}
        <div className="row">
          {NEXT[o.status]&&<button className="btn primary" onClick={()=>ubah(o,NEXT[o.status])}>{LABEL[NEXT[o.status]]}</button>}
          {o.status==='diterima'&&<button className="btn" onClick={()=>setAsk({text:'Batalkan order ini?',ok:'Batalkan Order',fn:()=>ubah(o,'dibatalkan')})}>Batalkan Order</button>}
          {['diterima','dibatalkan'].includes(o.status)&&<button className="btn danger" onClick={()=>setAsk({text:'Hapus order ini?',ok:'Hapus Order',fn:()=>run(()=>deleteDoc(doc(db,'order',o.id)),'Order terhapus.')})}>Hapus Order</button>}
        </div></div>)}
    </ListState>
    {ask&&<Confirm text={ask.text} okLabel={ask.ok} onOk={ask.fn} onCancel={()=>setAsk(null)}/>}
  </section>;
}
