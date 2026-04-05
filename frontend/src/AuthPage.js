import { useState } from "react";
function AuthPage({ mode, onNav }) {
  const isLogin = mode==="login";
  const [form,setForm]=useState({firstName:"",lastName:"",email:"",password:"",confirmPassword:"",remember:false,agree:false});
  const [errors,setErrors]=useState({});
  const [showPw,setShowPw]=useState(false);
  const [showCpw,setShowCpw]=useState(false);
  const [loading,setLoading]=useState(false);
 
  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:""}));};
 
  const pwStr=pw=>{if(!pw)return 0;let s=0;if(pw.length>=8)s++;if(/[A-Z]/.test(pw))s++;if(/[0-9]/.test(pw))s++;if(/[^A-Za-z0-9]/.test(pw))s++;return s;};
  const str=pwStr(form.password);
  const strLbls=["","Weak","Fair","Good","Strong"];
  const strCls=["","s-w","s-f","s-g","s-s"];
  const strClr=["","#ef4444","#f59e0b","#3b82f6","#16a34a"];
 
  const validate=()=>{
    const e={};
    if(!isLogin){if(!form.firstName.trim())e.firstName="First name required";if(!form.lastName.trim())e.lastName="Last name required";}
    if(!form.email.trim())e.email="Email required";
    else if(!/\S+@\S+\.\S+/.test(form.email))e.email="Enter a valid email";
    if(!form.password)e.password="Password required";
    else if(!isLogin&&form.password.length<8)e.password="Min. 8 characters";
    if(!isLogin&&form.password!==form.confirmPassword)e.confirmPassword="Passwords don't match";
    if(!isLogin&&!form.agree)e.agree="You must accept the terms";
    setErrors(e);return Object.keys(e).length===0;
  };
 
  const handleSubmit=()=>{
    if(!validate())return;
    setLoading(true);
    setTimeout(()=>{setLoading(false);onNav("dashboard",form.firstName||form.email.split("@")[0]);},1200);
  };
 
  const today=new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
 
  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo" onClick={()=>onNav("landing")}>
          <div className="auth-lm">T</div>TaskFlow
        </div>
        <div className="auth-fw">
          <div className="auth-hd">{isLogin?"Welcome back":"Create your account"}</div>
          <div className="auth-sub">
            {isLogin?"Don't have an account? ":"Already have an account? "}
            <a onClick={()=>onNav(isLogin?"register":"login")}>{isLogin?"Get started free":"Sign in"}</a>
          </div>
          <div className="auth-soc">
            <button className="auth-sb"><span style={{fontWeight:700}}>G</span> Google</button>
            <button className="auth-sb"><span>⊞</span> Microsoft</button>
          </div>
          <div className="auth-div">
            <div className="auth-dl"/><span className="auth-dt">or continue with email</span><div className="auth-dl"/>
          </div>
          <div className="auth-form">
            {!isLogin&&(
              <div className="f-row">
                <div className="f-field">
                  <label className="f-label">First Name</label>
                  <div className="f-wrap">
                    <span className="f-icon">👤</span>
                    <input className={`f-in${errors.firstName?" err":""}`} placeholder="John" value={form.firstName} onChange={e=>set("firstName",e.target.value)}/>
                  </div>
                  {errors.firstName&&<span className="f-err">{errors.firstName}</span>}
                </div>
                <div className="f-field">
                  <label className="f-label">Last Name</label>
                  <div className="f-wrap">
                    <span className="f-icon">👤</span>
                    <input className={`f-in${errors.lastName?" err":""}`} placeholder="Doe" value={form.lastName} onChange={e=>set("lastName",e.target.value)}/>
                  </div>
                  {errors.lastName&&<span className="f-err">{errors.lastName}</span>}
                </div>
              </div>
            )}
            <div className="f-field">
              <label className="f-label">Email Address</label>
              <div className="f-wrap">
                <span className="f-icon">✉</span>
                <input className={`f-in${errors.email?" err":""}`} type="email" placeholder="john@company.com" value={form.email} onChange={e=>set("email",e.target.value)}/>
              </div>
              {errors.email&&<span className="f-err">{errors.email}</span>}
            </div>
            <div className="f-field">
              <label className="f-label">Password</label>
              <div className="f-wrap">
                <span className="f-icon">🔒</span>
                <input className={`f-in${errors.password?" err":""}`} type={showPw?"text":"password"} placeholder={isLogin?"Enter your password":"Min. 8 characters"} value={form.password} onChange={e=>set("password",e.target.value)}/>
                <button className="f-tog" onClick={()=>setShowPw(p=>!p)}>{showPw?"🙈":"👁"}</button>
              </div>
              {errors.password&&<span className="f-err">{errors.password}</span>}
              {!isLogin&&form.password&&(
                <>
                  <div className="str-row">{[1,2,3,4].map(i=><div key={i} className={`str-bar ${i<=str?strCls[str]:""}`}/>)}</div>
                  <div className="str-lbl" style={{color:strClr[str]}}>{strLbls[str]}</div>
                </>
              )}
            </div>
            {!isLogin&&(
              <div className="f-field">
                <label className="f-label">Confirm Password</label>
                <div className="f-wrap">
                  <span className="f-icon">🔒</span>
                  <input className={`f-in${errors.confirmPassword?" err":""}`} type={showCpw?"text":"password"} placeholder="Re-enter password" value={form.confirmPassword} onChange={e=>set("confirmPassword",e.target.value)}/>
                  <button className="f-tog" onClick={()=>setShowCpw(p=>!p)}>{showCpw?"🙈":"👁"}</button>
                </div>
                {errors.confirmPassword&&<span className="f-err">{errors.confirmPassword}</span>}
              </div>
            )}
            {isLogin?(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <label className="f-check">
                  <input type="checkbox" className="f-cb" checked={form.remember} onChange={e=>set("remember",e.target.checked)}/>
                  <span className="f-clabel">Remember me</span>
                </label>
                <span className="f-forgot">Forgot password?</span>
              </div>
            ):(
              <div className="f-field">
                <label className="f-check">
                  <input type="checkbox" className="f-cb" checked={form.agree} onChange={e=>set("agree",e.target.checked)}/>
                  <span className="f-clabel">I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a></span>
                </label>
                {errors.agree&&<span className="f-err">{errors.agree}</span>}
              </div>
            )}
            <button className="btn-sub" onClick={handleSubmit} disabled={loading}>
              {loading?<><div className="spinner"/>{isLogin?"Signing in…":"Creating account…"}</>:isLogin?"Sign in to TaskFlow":"Create free account"}
            </button>
          </div>
        </div>
      </div>
 
      <div className="auth-right">
        <div className="auth-rbg"/>
        <div className="auth-rc">
          <div className="auth-plbl">Live preview</div>
          <div className="auth-pc">
            <div className="apc-hd">
              <div className="apc-dots">
                <div className="apc-dot" style={{background:"#ff5f57"}}/>
                <div className="apc-dot" style={{background:"#febc2e"}}/>
                <div className="apc-dot" style={{background:"#28c840"}}/>
              </div>
              <div className="apc-title">Dashboard — TaskFlow</div>
            </div>
            <div className="apc-body">
              <div className="apc-welcome">
                <div className="apc-greet">Good morning, <span>{isLogin?"you":(form.firstName||"there")} 👋</span></div>
                <div className="apc-date">{today}</div>
              </div>
              <div className="apc-stats">
                {[["24","Tasks"],["18","Done"],["3","Projects"]].map(([v,l])=>(
                  <div className="apc-sm" key={l}><div className="apc-smv">{v}</div><div className="apc-sml">{l}</div></div>
                ))}
              </div>
              <div className="apc-tl">Today's focus</div>
              <div className="apc-tasks">
                {[
                  {title:"Homepage redesign",done:true,badge:"Done",bc:"#f0fdf4",btc:"#16a34a",chkBg:"#16a34a"},
                  {title:"API integration",done:false,badge:"In Progress",bc:"#eff6ff",btc:"#2d6ef5",chkBg:"none",bdr:"#2d6ef5"},
                  {title:"Write release notes",done:false,badge:"To Do",bc:"var(--surface)",btc:"var(--muted)",chkBg:"none",bdr:"var(--border2)"},
                ].map((t,i)=>(
                  <div className="apc-ti" key={i}>
                    <div className="apc-chk" style={{background:t.chkBg,border:t.done?"none":`1.5px solid ${t.bdr}`,borderRadius:4}}>
                      {t.done&&<span style={{color:"white",fontSize:"0.6rem"}}>✓</span>}
                    </div>
                    <span className={`apc-tn${t.done?" done":""}`}>{t.title}</span>
                    <span className="apc-badge" style={{background:t.bc,color:t.btc}}>{t.badge}</span>
                  </div>
                ))}
              </div>
              <div className="apc-prog">
                {[{l:"Website Redesign",p:72,c:"#e8600a"},{l:"Mobile App",p:45,c:"#2d6ef5"}].map(p=>(
                  <div className="apc-pr" key={p.l}>
                    <div className="apc-prl">{p.l}</div>
                    <div className="apc-prt"><div className="apc-prf" style={{width:`${p.p}%`,background:p.c}}/></div>
                    <div className="apc-prp">{p.p}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="auth-testi">
            <div className="at-q">"TaskFlow cut our planning time in half. The whole team is aligned from day one — it just works."</div>
            <div className="at-auth">
              <div className="at-av">JP</div>
              <div>
                <div className="at-n">James Park</div>
                <div className="at-r">Engineering Manager, Figma</div>
                <div className="at-s">★★★★★</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AuthPage;