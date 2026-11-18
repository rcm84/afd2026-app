import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
export function Card({children,className=''}:{children:ReactNode;className?:string}){return <section className={`card ${className}`}>{children}</section>;}
export function Heading({title,eyebrow,children}:{title:string;eyebrow?:string;children?:ReactNode}){return <header className="mb-7">{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{children&&<p className="muted">{children}</p>}</header>;}
export function DemoNote({children}:{children?:ReactNode}){return <aside className="demo-note">{children||'Vista visual con datos ficticios. No guarda ni publica información.'}</aside>;}
export function Action({to,children,tone='primary'}:{to:string;children:ReactNode;tone?:'primary'|'secondary'|'gold'|'staff'}){return <Link className={`btn btn-${tone}`} to={to}>{children}</Link>;}
export function Info({items}:{items:[string,string][]}){return <dl className="info-list">{items.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;}
export function Logo(){return <svg className="brand-mark" viewBox="0 0 48 48" role="img" aria-label="Símbolo provisional; sustituir por el logo del ministerio"><rect x="1" y="1" width="46" height="46" rx="12" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M24 11v26M15 20h18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;}
