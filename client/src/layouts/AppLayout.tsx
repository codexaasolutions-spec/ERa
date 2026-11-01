import {useEffect,useState} from 'react';
import {NavLink,useNavigate,Outlet} from 'react-router-dom';
import {LayoutDashboard,UserCircle,WalletCards,ArrowDownToLine,Boxes,Users,Gift,TicketPercent,ReceiptText,LifeBuoy,Settings,Menu,X,LogOut,ShieldCheck,Bell,History,MessageCircle} from 'lucide-react';
import {useAuth} from '../context/AuthContext';

const whatsappChannel=import.meta.env.VITE_WHATSAPP_CHANNEL_URL as string | undefined;

const bottomItems=[
  ['/deposit','Deposit',WalletCards],
  ['/withdrawal','Withdrawal',ArrowDownToLine],
  ['/packages','Packages',Boxes],
  ['/profile','My Account',UserCircle]
] as const;

const userItems=[
  ['/dashboard','Dashboard',LayoutDashboard],
  ['/deposit-history','Deposit History',ReceiptText],
  ['/withdrawal-history','Withdrawal History',ReceiptText],
  ['/team','My Team',Users],
  ['/rewards','Rewards',Gift],
  ['/promo','Promo Code',TicketPercent],
  ['/transactions','Transactions',ReceiptText],
  ['/notifications','Notifications',Bell],
  ['/activity','Activity History',History],
  ['/support','Support',LifeBuoy],
  ['/settings','Settings',Settings]
] as const;

export default function AppLayout(){
  const [open,setOpen]=useState(false);
  const [policiesOpen,setPoliciesOpen]=useState(false);
  const [showWhatsAppJoin,setShowWhatsAppJoin]=useState(false);
  const [isImpersonating,setIsImpersonating]=useState(false);
  const {user,logout}=useAuth();
  const nav=useNavigate();

  useEffect(()=>{
    const impersonating=Boolean(
      sessionStorage.getItem('tm_admin_token') &&
      sessionStorage.getItem('tm_impersonated_user')
    );
    setIsImpersonating(impersonating);

    if(!user || !whatsappChannel || sessionStorage.getItem('tm_whatsapp_join_seen')==='1'){
      setShowWhatsAppJoin(false);
      return;
    }

    const timer=window.setTimeout(()=>{
      if(sessionStorage.getItem('tm_whatsapp_join_seen')!=='1'){
        setShowWhatsAppJoin(true);
      }
    },350);

    return ()=>window.clearTimeout(timer);
  },[user]);

  const returnToAdmin=()=>{
    const adminToken=sessionStorage.getItem('tm_admin_token');

    if(!adminToken){
      sessionStorage.removeItem('tm_impersonated_user');
      setIsImpersonating(false);
      nav('/admin');
      return;
    }

    localStorage.setItem('tm_token',adminToken);
    sessionStorage.removeItem('tm_admin_token');
    sessionStorage.removeItem('tm_impersonated_user');
    setIsImpersonating(false);
    window.location.href='/admin';
  };

  const handleLogout=()=>{
    sessionStorage.removeItem('tm_whatsapp_join_seen');
    setShowWhatsAppJoin(false);
    logout();
    nav('/login');
  };

  return (
    <div className="shell">

      <div
        className={open?'overlay show':'overlay'}
        onClick={()=>setOpen(false)}
      />

      <aside className={open?'sidebar open':'sidebar'} style={{height:"100vh",overflowY:"auto",overflowX:"hidden",overscrollBehavior:"contain"}}>

        <div className="brand">
          <span>TM</span>
          <div>
            <b>LTC ERA</b>
          </div>
          <button
            className="mobile-x"
            onClick={()=>setOpen(false)}
          >
            <X size={20}/>
          </button>
        </div>

        <nav>
          {userItems.map(([to,label,Icon])=>(
            <NavLink
              key={to}
              to={to}
              onClick={()=>setOpen(false)}
              className={({isActive})=>isActive?'active':''}
            >
              <Icon size={18}/>
              {label}
            </NavLink>
          ))}

          <div style={{marginTop:'8px'}}>
            <button
              type="button"
              onClick={()=>setPoliciesOpen(!policiesOpen)}
              aria-expanded={policiesOpen}
              style={{
                width:'100%',
                display:'flex',
                alignItems:'center',
                justifyContent:'space-between',
                gap:'10px',
                padding:'12px 14px',
                border:0,
                background:'transparent',
                color:'inherit',
                font:'inherit',
                textAlign:'left',
                cursor:'pointer'
              }}
            >
              <span style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <ShieldCheck size={18}/>
                Information & Policies
              </span>
              <span>{policiesOpen?'âˆ’':'+'}</span>
            </button>

            {policiesOpen&&(
              <div style={{paddingLeft:'18px'}}>
                <a href="/about-us.html" onClick={()=>setOpen(false)}>About Us</a>
                <a href="/privacy-policy.html" onClick={()=>setOpen(false)}>Privacy Policy</a>
                <a href="/terms-and-conditions.html" onClick={()=>setOpen(false)}>Terms & Conditions</a>
                <a href="/refund-policy.html" onClick={()=>setOpen(false)}>Payment & Refund Policy</a>
              </div>
            )}
          </div>

          {user?.role==='ADMIN'&&(
            <NavLink
              to="/admin"
              onClick={()=>setOpen(false)}
              className={({isActive})=>isActive?'active':''}
            >
              <ShieldCheck size={18}/>
              Admin Panel
            </NavLink>
          )}
        </nav>

        {whatsappChannel&&(
          <a
            className="logout"
            href={whatsappChannel}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18}/>
            WhatsApp Channel
          </a>
        )}


      </aside>

      <main className="main">

        {isImpersonating&&(
          <div
            style={{
              position:'sticky',
              top:0,
              zIndex:9998,
              display:'flex',
              alignItems:'center',
              justifyContent:'space-between',
              gap:'12px',
              padding:'10px 16px',
              background:'#111827',
              color:'#fff',
              boxShadow:'0 2px 10px rgba(0,0,0,0.15)'
            }}
          >
            <div
              style={{
                fontSize:'14px',
                fontWeight:700
              }}
            >
              You are logged in as another user
            </div>

            <button
              type="button"
              onClick={returnToAdmin}
              style={{
                border:0,
                borderRadius:'9px',
                padding:'9px 14px',
                background:'#fff',
                color:'#111827',
                fontWeight:800,
                cursor:'pointer'
              }}
            >
              Â© Return to Admin
            </button>
          </div>
        )}

        <header>
          <button
            className="hamb"
            onClick={()=>setOpen(true)}
          >
            <Menu/>
          </button>

          <div className="header-title">
            <span className="eyebrow">LTC ERA</span>
          </div>

          <button
            className="icon-btn"
            onClick={()=>nav('/notifications')}
          >
            <Bell size={18}/>
            <i/>
          </button>

          <div
            className="profile-chip"
            onClick={()=>nav('/profile')}
          >
            <div className="avatar">
              {user?.fullName?.[0]||'U'}
            </div>
            <div>
              <b>{user?.fullName||'Guest'}</b>
              <small>ID: {user?.userId||'â€”Â'}</small>
            </div>
          </div>
        </header>

        <Outlet/>

      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {bottomItems.map(([to,label,Icon])=>(
          <NavLink key={to} to={to} className={({isActive})=>isActive?'active':''}>
            <Icon size={19}/><span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {showWhatsAppJoin&&whatsappChannel&&(
        <div
          style={{
            position:'fixed',
            inset:0,
            zIndex:99999,
            background:'rgba(0,0,0,0.72)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            padding:'20px'
          }}
        >
          <div
            style={{
              width:'100%',
              maxWidth:'460px',
              background:'#fff',
              borderRadius:'24px',
              padding:'32px 26px',
              textAlign:'center',
              boxShadow:'0 25px 70px rgba(0,0,0,0.35)'
            }}
          >
            <div
              style={{
                width:'72px',
                height:'72px',
                margin:'0 auto 18px',
                borderRadius:'50%',
                background:'#25D366',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                color:'#fff'
              }}
            >
              <MessageCircle size={38}/>
            </div>

            <h2
              style={{
                margin:'0 0 10px',
                fontSize:'25px',
                fontWeight:800,
                color:'#111827'
              }}
            >
              Join Our WhatsApp Channel
            </h2>

            <p
              style={{
                margin:'0 auto 24px',
                maxWidth:'370px',
                color:'#6b7280',
                lineHeight:1.6,
                fontSize:'15px'
              }}
            >
              Stay updated with the latest LTC ERA announcements,
              important updates, offers and platform news.
              Join our official WhatsApp Channel before continuing.
            </p>

            <a
              href={whatsappChannel}
              target="_blank"
              rel="noreferrer"
              onClick={()=>sessionStorage.setItem('tm_whatsapp_join_seen','1')}
              style={{
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                gap:'9px',
                width:'100%',
                boxSizing:'border-box',
                padding:'14px 18px',
                borderRadius:'12px',
                background:'#25D366',
                color:'#fff',
                textDecoration:'none',
                fontWeight:700,
                fontSize:'15px',
                marginBottom:'12px'
              }}
            >
              <MessageCircle size={19}/>
              Join WhatsApp Channel
            </a>

            <button
              type="button"
              onClick={()=>{
  sessionStorage.setItem('tm_whatsapp_join_seen','1');
  setShowWhatsAppJoin(false);
}}
              style={{
                width:'100%',
                padding:'13px 18px',
                borderRadius:'12px',
                border:'1px solid #d1d5db',
                background:'#f9fafb',
                color:'#374151',
                fontWeight:700,
                fontSize:'14px',
                cursor:'pointer'
              }}
            >
              I've Joined â€”Â Continue
            </button>

            <p
              style={{
                margin:'16px 0 0',
                fontSize:'12px',
                color:'#9ca3af'
              }}
            >
              Please join the channel to receive important updates.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}












