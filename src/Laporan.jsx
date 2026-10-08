import {useState} from 'react';
import {collection,getDocs,query,where} from 'firebase/firestore';
import {db} from './firebase';
import {useLoad,rows,rp,today,ListState,Field} from './ui';
export default function Laporan(){
  const [tgl,setTgl]=useState(today());
  const s=useLoad(async()=>rows(await getDocs(query(collection(db,'order'),where('tanggal_masuk','==',tgl)))),[tgl]);
  const aktif=s.data.filter(o=>o.status!=='dibatalkan');
  const kg=aktif.reduce((a,o)=>a+o.berat_kg,0);
  const omzet=aktif.filter(o=>o.status==='diambil').reduce((a,o)=>a+o.total,0);
  const per={};aktif.forEach(o=>{per[o.nama_layanan]=(per[o.nama_layanan]||0)+o.berat_kg});
  return <section><div className="title"><h2>Laporan Harian</h2></div>
    <Field label="Tanggal"><input type="date" value={tgl} onChange={e=>e.target.value&&setTgl(e.target.value)}/></Field>
    <ListState s={s} show={aktif.length>0} emptyText="Belum ada order pada tanggal ini">
      <div className="stats"><div className="card"><small>Jumlah order</small><b>{aktif.length}</b></div>
        <div className="card"><small>Total berat</small><b>{kg} kg</b></div>
        <div className="card"><small>Pendapatan</small><b>{rp(omzet)}</b></div></div>
      <table><thead><tr><th>Layanan</th><th>Berat</th></tr></thead>
        <tbody>{Object.entries(per).map(([n,k])=><tr key={n}><td>{n}</td><td>{k} kg</td></tr>)}</tbody></table>
      <small>Pendapatan dihitung dari order berstatus diambil. Order dibatalkan tidak dihitung.</small>
    </ListState></section>;
}
