
function LandingPage({ onNav }) {
  return (
    <div className="lp">
      <nav className="lp-nav">
        <div className="lp-logo" onClick={()=>onNav("landing")}>
          <div className="lp-logo-mark">T</div>TaskFlow
        </div>
        <div className="lp-nav-links">
          {["Features","How it Works","Pricing","Blog"].map(l=>(
            <button key={l} className="lp-nav-link">{l}</button>
          ))}
        </div>
        <div className="lp-nav-right">
          <button className="btn-ol" onClick={()=>onNav("login")}>Sign in</button>
          <button className="btn-acc" onClick={()=>onNav("register")}>Get started free</button>
        </div>
      </nav>
 
      <div className="lp-hero">
        <div className="hero-left">
          <div className="hero-eyebrow"><span className="e-dot"/>Smart Task Management System</div>
          <h1 className="hero-h1">Manage tasks.<br/><em>Ship faster.</em><br/>Stay aligned.</h1>
          <p className="hero-p">TaskFlow gives your team one place to plan, prioritize, and track every task — from daily to-dos to complex multi-team projects.</p>
          <div className="hero-actions">
            <button className="btn-acc btn-hero" onClick={()=>onNav("register")}>Start for free →</button>
            <button className="btn-ol btn-hero" onClick={()=>onNav("login")}>Sign in</button>
          </div>
          <div className="hero-proof">
            <div className="av-row">
              {[["#e8600a","S"],["#2d6ef5","A"],["#16a34a","R"],["#9333ea","K"],["#0891b2","M"]].map(([bg,l],i)=>(
                <div key={i} className="av-item" style={{background:bg}}>{l}</div>
              ))}
            </div>
            <div>
              <div className="stars">★★★★★</div>
              <div className="proof-txt"><strong>4,000+</strong> teams trust TaskFlow</div>
            </div>
          </div>
        </div>
 
        <div className="hero-right">
          <div className="ap">
            <div className="ap-hd">
              <div className="ap-dots">
                <div className="ap-dot" style={{background:"#ff5f57"}}/>
                <div className="ap-dot" style={{background:"#febc2e"}}/>
                <div className="ap-dot" style={{background:"#28c840"}}/>
              </div>
              <div className="ap-title">taskflow.app</div>
              <div className="ap-tabs">
                <button className="ap-tab on">Board</button>
                <button className="ap-tab">List</button>
                <button className="ap-tab">Analytics</button>
              </div>
            </div>
            <div className="ap-body">
              <div className="ap-srow">
                {[{l:"Total Tasks",v:"24",s:"↑ 3 this week",up:true},{l:"Completed",v:"18",s:"75% done rate",up:true},{l:"Overdue",v:"2",s:"↓ from 5",up:false}].map(s=>(
                  <div className="ap-stat" key={s.l}>
                    <div className="ap-sl">{s.l}</div>
                    <div className="ap-sv">{s.v}</div>
                    <div className={`ap-ss ${s.up?"c-up":"c-dn"}`}>{s.s}</div>
                  </div>
                ))}
              </div>
              <div className="ap-sec">Today's Tasks</div>
              {[
                {name:"Design homepage mockup",done:false,pri:"high",av:"S",bg:"#e8600a"},
                {name:"Review API documentation",done:false,pri:"med",av:"A",bg:"#2d6ef5"},
                {name:"Set up CI/CD pipeline",done:true,pri:"low",av:"R",bg:"#16a34a"},
              ].map((t,i)=>(
                <div className="ap-task" key={i}>
                  <div className={`ap-chk ${t.done?"chk-done":"chk-todo"}`}>{t.done&&"✓"}</div>
                  <span className={`ap-tn${t.done?" ap-tdone":""}`}>{t.name}</span>
                  <span className={`ap-pri pri-${t.pri[0]}`}>{t.pri}</span>
                  <div className="ap-av" style={{background:t.bg}}>{t.av}</div>
                </div>
              ))}
              <div className="ap-sec">Project Progress</div>
              <div className="ap-prow">
                {[{l:"Website Redesign",p:72,c:"#e8600a"},{l:"Mobile App",p:45,c:"#2d6ef5"},{l:"Backend API",p:88,c:"#16a34a"}].map(p=>(
                  <div className="ap-pi" key={p.l}>
                    <div className="ap-pl">{p.l}</div>
                    <div className="ap-pb"><div className="ap-pf" style={{width:`${p.p}%`,background:p.c}}/></div>
                    <div className="ap-pp">{p.p}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
 
      <div className="lp-logos">
        <span className="logos-lbl">Trusted by teams at</span>
        <div className="logos-row">
          {["Stripe","Notion","Figma","Vercel","Linear","Loom"].map(b=><span key={b} className="logo-br">{b}</span>)}
        </div>
      </div>
 
      <div className="lp-feat">
        <div className="lp-sh">
          <div className="lp-tag">Features</div>
          <h2 className="lp-st">Built for modern teams</h2>
          <p className="lp-ss">Everything you need to manage work, boost productivity, and ship on time.</p>
        </div>
        <div className="feat-grid">
          {[
            {icon:"⚡",ic:"fi-o",t:"Smart Prioritization",d:"AI ranks your tasks by impact, deadline, and effort so you always work on what matters most."},
            {icon:"📋",ic:"fi-b",t:"Kanban & List Views",d:"Visualize your workflow exactly how your team thinks — board, list, or timeline. Always synced."},
            {icon:"📊",ic:"fi-g",t:"Real-time Analytics",d:"Daily, weekly, and monthly insights into your team's velocity, blockers, and delivery trends."},
            {icon:"🤝",ic:"fi-p",t:"Team Collaboration",d:"Assign tasks, add comments, attach files, and get instant notifications for every update."},
            {icon:"🔔",ic:"fi-y",t:"Smart Reminders",d:"Context-aware alerts keep you on track without drowning you in noise. Your focus stays sharp."},
            {icon:"🗂️",ic:"fi-r",t:"Projects & Milestones",d:"Group tasks into projects, set milestones, track dependencies, and manage multi-team work."},
          ].map(f=>(
            <div className="feat-card" key={f.t}>
              <div className={`fi ${f.ic}`}>{f.icon}</div>
              <div className="feat-t">{f.t}</div>
              <div className="feat-d">{f.d}</div>
            </div>
          ))}
        </div>
      </div>
 
      <div className="lp-testi">
        <div style={{maxWidth:1000,margin:"0 auto",textAlign:"center"}}>
          <div className="lp-tag">Testimonials</div>
          <h2 className="lp-st">Loved by productive teams</h2>
        </div>
        <div className="tg">
          {[
            {q:"TaskFlow completely changed how our team handles sprints. We went from missing deadlines constantly to shipping on time every single week.",n:"Sarah Chen",r:"Product Manager, Stripe",av:"SC",bg:"#e8600a"},
            {q:"The analytics view alone is worth it. I can see in seconds which projects are at risk and where my team is blocked. Genuinely impressive tool.",n:"Marcus Reid",r:"Engineering Lead, Vercel",av:"MR",bg:"#2d6ef5"},
            {q:"Simple enough for our designers, powerful enough for our engineers. TaskFlow is the first tool our whole team actually uses consistently.",n:"Priya Nair",r:"CTO, Loom",av:"PN",bg:"#16a34a"},
          ].map(t=>(
            <div className="tc" key={t.n}>
              <div className="tc-stars">★★★★★</div>
              <div className="tc-q">"{t.q}"</div>
              <div className="tc-auth">
                <div className="tc-av" style={{background:t.bg}}>{t.av}</div>
                <div><div className="tc-n">{t.n}</div><div className="tc-r">{t.r}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
 
      <div className="lp-cta">
        <div className="lp-cta-in">
          <div className="lp-cta-l">
            <h2 className="lp-cta-h">Start shipping faster today</h2>
            <p className="lp-cta-p">Join 4,000+ teams who use TaskFlow to manage work and hit their goals. Free forever. No credit card required.</p>
          </div>
          <div className="lp-cta-r">
            <button className="btn-wh" onClick={()=>onNav("register")}>Create free account</button>
            <button className="btn-gh" onClick={()=>onNav("login")}>Sign in to your account</button>
          </div>
        </div>
      </div>
 
      <footer className="lp-footer">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="lp-logo-mark" style={{width:26,height:26,fontSize:"0.8rem",borderRadius:7}}>T</div>
          <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,letterSpacing:"-0.02em",color:"var(--text)"}}>TaskFlow</span>
        </div>
        <span>© 2025 TaskFlow, Inc. All rights reserved.</span>
        <div style={{display:"flex",gap:20}}>
          {["Privacy","Terms","Support"].map(l=><span key={l} style={{cursor:"pointer"}}>{l}</span>)}
        </div>
      </footer>
    </div>
  );
}
export default LandingPage;