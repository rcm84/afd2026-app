import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
export function Card({children,className=''}:{children:ReactNode;className?:string}){return <section className={`card ${className}`}>{children}</section>;}
export function Heading({title,eyebrow,children}:{title:string;eyebrow?:string;children?:ReactNode}){return <header className="mb-7">{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{children&&<p className="muted">{children}</p>}</header>;}
export function DemoNote({children}:{children?:ReactNode}){return <aside className="demo-note">{children||'Vista visual con datos ficticios. No guarda ni publica información.'}</aside>;}
export function Action({to,children,tone='primary'}:{to:string;children:ReactNode;tone?:'primary'|'secondary'|'gold'|'staff'}){return <Link className={`btn btn-${tone}`} to={to}>{children}</Link>;}
export function Info({items}:{items:[string,string][]}){return <dl className="info-list">{items.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;}
export function Logo(){return <img className="brand-mark" src="/logo-maifd.svg" alt="Logo del ministerio Fuego y Dinámica" />;}
