import {useState} from 'react';
import {collection,addDoc,getDocs,updateDoc,deleteDoc,doc,query,orderBy,limit,serverTimestamp} from 'firebase/firestore';
import {db} from './firebase';
import {useLoad,rows,rp,useNotify,Confirm,ListState,Field} from './ui';
const validate=f=>{const e={};
  if(!f.nama.trim()||f.nama.trim().length>40)e.nama='Nama wajib diisi, maksimal 40 karakter.';
  const h=Number(f.harga);if(f.harga===''||!Number.isInteger(h)||h<0)e.harga='Harga harus bilangan bulat, minimal 0.';
  const d=Number(f.hari);if(!Number.isInteger(d)||d<1||d>7)e.hari='Estimasi harus bilangan bulat 1 sampai 7 hari.';
  return e};
export default function Layanan(){
  const notify=useNotify();
  const s=useLoad(async()=>rows(await getDocs(query(collection(db,'layanan'),orderBy('nama'),limit(20)))));
  const [form,setForm]=useState(null),[err,setErr]=useState({}),[del,setDel]=useState(null),[busy,setBusy]=useState(false);
  const set=k=>e=>setForm({...form,[k]:e.target.value});
  const save=async()=>{
    const e=validate(form);setErr(e);if(Object.keys(e).length)return;
    setBusy(true);
    const data={nama:form.nama.trim(),harga_per_kg:Number(form.harga),estimasi_hari:Number(form.hari)};
    try{
      if(form.id)await updateDoc(doc(db,'layanan',form.id),data);
      else await addDoc(collection(db,'layanan'),{...data,dibuat_pada:serverTimestamp()});
      notify('Layanan tersimpan.');setForm(null);s.reload();
    }catch{notify('Layanan gagal disimpan. Periksa isian lalu coba lagi.','err')}
    setBusy(false)};
  const remove=async()=>{
    try{await deleteDoc(doc(db,'layanan',del.id));notify('Layanan terhapus.');s.reload()}
    catch{notify('Layanan gagal dihapus. Coba lagi.','err')}
    setDel(null)};
  const add=()=>{setErr({});setForm({nama:'',harga:'',hari:''})};
  if(form)return <section><div className="title"><h2>{form.id?'Ubah Layanan':'Tambah Layanan'}</h2></div>
    <Field label="Nama layanan" error={err.nama}><input value={form.nama} onChange={set('nama')}/></Field>
    <Field label="Harga per kg (Rp)" error={err.harga}><input type="number" inputMode="numeric" value={form.harga} onChange={set('harga')}/></Field>
    <Field label="Estimasi (hari)" error={err.hari}><input type="number" inputMode="numeric" value={form.hari} onChange={set('hari')}/></Field>
    <div className="row"><button className="btn" onClick={()=>setForm(null)}>Batal</button>
    <button className="btn primary" disabled={busy} onClick={save}>Simpan Layanan</button></div></section>;
  return <section><div className="title"><h2>Layanan</h2><button className="btn primary" onClick={add}>Tambah Layanan</button></div>
    <ListState s={s} emptyText="Belum ada layanan" addLabel="Tambah Layanan" onAdd={add}>
      {s.data.map(l=><div key={l.id} className="card"><b>{l.nama}</b>
        <div>{rp(l.harga_per_kg)}/kg · {l.estimasi_hari} hari</div>
        <div className="row"><button className="btn" onClick={()=>{setErr({});setForm({id:l.id,nama:l.nama,harga:l.harga_per_kg,hari:l.estimasi_hari})}}>Ubah</button>
        <button className="btn danger" onClick={()=>setDel(l)}>Hapus Layanan</button></div></div>)}
    </ListState>
    {del&&<Confirm text={`Hapus layanan "${del.nama}"?`} okLabel="Hapus Layanan" onOk={remove} onCancel={()=>setDel(null)}/>}
  </section>;
}
