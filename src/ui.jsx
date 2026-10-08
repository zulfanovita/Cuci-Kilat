import {createContext,useContext,useState,useEffect,useCallback} from 'react';
export const Ctx=createContext(()=>{});
export const useNotify=()=>useContext(Ctx);
export const rows=s=>s.docs.map(d=>({id:d.id,...d.data()}));
export const rp=n=>'Rp'+Number(n).toLocaleString('id-ID');
export const today=()=>new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
export function useLoad(fn,deps=[]){
  const [s,set]=useState({data:[],loading:true,error:false});
  const load=useCallback(()=>{
    set(x=>({...x,loading:true,error:false}));
    fn().then(data=>set({data,loading:false,error:false}))
      .catch(()=>set({data:[],loading:false,error:true}));
  },deps);
  useEffect(load,[load]);
  return {...s,reload:load};
}
export function Field({label,error,children}){
  return <label className="field"><span>{label}</span>{children}{error&&<em className="err">{error}</em>}</label>;
}
export function Confirm({text,okLabel,onOk,onCancel}){
  return <div className="overlay"><div className="dialog"><p>{text}</p>
    <div className="row"><button className="btn" onClick={onCancel}>Batal</button>
    <button className="btn danger" onClick={onOk}>{okLabel}</button></div></div></div>;
}
// Tiga state: loading, error, empty
export function ListState({s,emptyText,addLabel,onAdd,show=true,children}){
  if(s.loading)return <div>{[1,2,3].map(i=><div key={i} className="card skeleton"/>)}</div>;
  if(s.error)return <div className="state"><p>Data gagal dimuat. Periksa koneksi internet lalu coba lagi.</p>
    <button className="btn primary" onClick={s.reload}>Coba Lagi</button></div>;
  if(!s.data.length||!show)return <div className="state"><p>{emptyText}</p>
    {onAdd&&<button className="btn primary" onClick={onAdd}>{addLabel}</button>}</div>;
  return children;
}
