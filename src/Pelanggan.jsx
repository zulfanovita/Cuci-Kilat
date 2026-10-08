import {useState} from 'react';
import {collection,getDocs,getDoc,setDoc,updateDoc,deleteDoc,doc,query,orderBy,limit,serverTimestamp} from 'firebase/firestore';
import {db} from './firebase';
import {useLoad,rows,useNotify,Confirm,ListState,Field} from './ui';
const validate=f=>{const e={};
  if(!f.nama.trim()||f.nama.trim().length>60)e.nama='Nama wajib diisi, maksimal 60 karakter.';
  if(!/^08\d{8,11}$/.test(f.no))e.no='Nomor WhatsApp harus diawali 08, hanya angka, 10 sampai 13 digit.';
  if(!f.alamat.trim()||f.alamat.trim().length>200)e.alamat='Alamat wajib diisi, maksimal 200 karakter.';
  return e};
export default function Pelanggan(){
  const notify=useNotify();
  const s=useLoad(async()=>rows(await getDocs(query(collection(db,'pelanggan'),orderBy('nama'),limit(20)))));
  const [form,setForm]=useState(null),[err,setErr]=useState({}),[del,setDel]=useState(null),[cari,setCari]=useState(''),[busy,setBusy]=useState(false);
  const set=k=>e=>setForm({...form,[k]:e.target.value});
  const save=async()=>{
    const e=validate(form);setErr(e);if(Object.keys(e).length)return;
    setBusy(true);
    const data={nama:form.nama.trim(),alamat:form.alamat.trim()};
    try{
      if(form.edit)await updateDoc(doc(db,'pelanggan',form.no),data);
      else{
        const ref=doc(db,'pelanggan',form.no);
        if((await getDoc(ref)).exists()){setErr({no:'Nomor WhatsApp sudah terdaftar'});setBusy(false);return}
        await setDoc(ref,{...data,no_whatsapp:form.no,dibuat_pada:serverTimestamp()});
      }
      notify('Pelanggan tersimpan.');setForm(null);s.reload();
    }catch{notify('Pelanggan gagal disimpan. Periksa isian lalu coba lagi.','err')}
    setBusy(false)};
  const remove=async()=>{
    try{await deleteDoc(doc(db,'pelanggan',del.id));notify('Pelanggan terhapus.');s.reload()}
    catch{notify('Pelanggan gagal dihapus. Coba lagi.','err')}
    setDel(null)};
  const add=()=>{setErr({});setForm({nama:'',no:'',alamat:''})};
  const q=cari.toLowerCase();
  const list=s.data.filter(p=>p.nama.toLowerCase().includes(q)||p.no_whatsapp.includes(q));
  if(form)return <section><div className="title"><h2>{form.edit?'Ubah Pelanggan':'Tambah Pelanggan'}</h2></div>
    <Field label="Nama" error={err.nama}><input value={form.nama} onChange={set('nama')}/></Field>
    <Field label="Nomor WhatsApp" error={err.no}><input inputMode="numeric" disabled={form.edit} value={form.no} onChange={set('no')}/></Field>
    <Field label="Alamat" error={err.alamat}><textarea rows="3" value={form.alamat} onChange={set('alamat')}/></Field>
    <div className="row"><button className="btn" onClick={()=>setForm(null)}>Batal</button>
    <button className="btn primary" disabled={busy} onClick={save}>Simpan Pelanggan</button></div></section>;
  return <section><div className="title"><h2>Pelanggan</h2><button className="btn primary" onClick={add}>Tambah Pelanggan</button></div>
    <input className="search" placeholder="Cari nama atau nomor WhatsApp" value={cari} onChange={e=>setCari(e.target.value)}/>
    <ListState s={s} show={list.length>0} emptyText={cari?'Tidak ada pelanggan yang cocok':'Belum ada pelanggan'} addLabel="Tambah Pelanggan" onAdd={cari?null:add}>
      {list.map(p=><div key={p.id} className="card"><b>{p.nama}</b><div>{p.no_whatsapp}</div><small>{p.alamat}</small>
        <div className="row"><button className="btn" onClick={()=>{setErr({});setForm({edit:true,nama:p.nama,no:p.no_whatsapp,alamat:p.alamat})}}>Ubah</button>
        <button className="btn danger" onClick={()=>setDel(p)}>Hapus Pelanggan</button></div></div>)}
    </ListState>
    {del&&<Confirm text={`Hapus pelanggan "${del.nama}"?`} okLabel="Hapus Pelanggan" onOk={remove} onCancel={()=>setDel(null)}/>}
  </section>;
}
