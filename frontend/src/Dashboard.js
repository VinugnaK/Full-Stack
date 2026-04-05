import { useState } from "react";
function Dashboard({ userName, onNav }) {
  const [activeNav,setActiveNav]=useState("dashboard");
  const today=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const hour=new Date().getHours();
  const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  const display=userName?(userName.charAt(0).toUpperCase()+userName.slice(1)):"there";
 
  const navItems=[
    {id:"dashboard",icon:"🏠",label:"Dashboard"},
    {id:"board",icon:"📋",label:"Task Board"},
    {id:"list",icon:"☰",label:"Task List"},
    {id:"projects",icon:"🗂️",label:"Projects",badge:"3"},
    {section:"Analytics"},
    {id:"weekly",icon:"📊",label:"Weekly"},
    {id:"monthly",icon:"📈",label:"Monthly"},
    {id:"yearly",icon:"📅",label:"Yearly"},
    {section:"Account"},
    {id:"profile",icon:"👤",label:"Profile & Settings"},
  ];
 
  const tasks=[
    {name:"Design homepage mockup",pri:"high",status:"progress",av:"S",bg:"#e8600a",due:"Today"},
    {name:"Review API documentation",pri:"med",status:"progress",av:"A",bg:"#2d6ef5",due:"Today"},
    {name:"Set up CI/CD pipeline",pri:"low",status:"done",av:"R",bg:"#16a34a",due:"Yesterday"},
    {name:"Write unit tests for auth module",pri:"high",status:"todo",av:"K",bg:"#9333ea",due:"Tomorrow"},
    {name:"Update user onboarding flow",pri:"med",status:"todo",av:"M",bg:"#0891b2",due:"Mar 30"},
    {name:"Fix mobile navigation bug",pri:"high",status:"done",av:"S",bg:"#e8600a",due:"Mar 25"},
  ];
 
  const projects=[
    {name:"Website Redesign",pct:72,color:"#e8600a",tasks:"18/25 tasks",due:"Apr 15"},
    {name:"Mobile App v2",pct:45,color:"#2d6ef5",tasks:"9/20 tasks",due:"May 1"},
    {name:"Backend API",pct:88,color:"#16a34a",tasks:"22/25 tasks",due:"Apr 5"},
  ];
 
  const activity=[
    {av:"S",bg:"#e8600a",text:<><strong>Sarah</strong> completed "Homepage wireframes"</>,time:"2m ago"},
    {av:"A",bg:"#2d6ef5",text:<><strong>Alex</strong> added a comment on "API docs"</>,time:"14m ago"},
    {av:"R",bg:"#16a34a",text:<><strong>Raj</strong> moved "CI/CD setup" to Done</>,time:"1h ago"},
    {av:"K",bg:"#9333ea",text:<><strong>Kim</strong> created "Unit tests" task</>,time:"2h ago"},
    {av:"M",bg:"#0891b2",text:<><strong>Maya</strong> updated project deadline</>,time:"3h ago"},
  ];
 
  const dueTasks=[
    {name:"Design homepage mockup",time:"10:00 AM",color:"#e8600a",badge:"High",bc:"#fee2e2",btc:"#ef4444"},
    {name:"Review API documentation",time:"2:00 PM",color:"#2d6ef5",badge:"Medium",bc:"#fef3c7",btc:"#d97706"},
    {name:"Team standup",time:"9:30 AM",color:"#16a34a",badge:"Meeting",bc:"#f0fdf4",btc:"#16a34a"},
  ];
 
  const stMap={
    done:{cls:"s-done",dot:"#16a34a",lbl:"Done"},
    progress:{cls:"s-prog",dot:"#2d6ef5",lbl:"In Progress"},
    todo:{cls:"s-todo",dot:"#9b9790",lbl:"To Do"},
  };
  const priMap={high:"pri-h",med:"pri-m",low:"pri-l"};
 
  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="ds-logo"><div className="ds-lm">T</div>TaskFlow</div>
        <nav className="ds-nav">
          {navItems.map((item,i)=>{
            if(item.section) return <div key={i} className="ds-sec">{item.section}</div>;
            return (
              <button key={item.id} className={`ds-ni${activeNav===item.id?" active":""}`} onClick={()=>setActiveNav(item.id)}>
                <span className="ds-ico">{item.icon}</span>{item.label}
                {item.badge&&<span className="ds-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>
        <div className="ds-user">
          <div className="ds-uav">{display.charAt(0).toUpperCase()}</div>
          <div><div className="ds-un">{display}</div><div className="ds-up">Free Plan</div></div>
          <button className="ds-logout" onClick={()=>onNav("landing")} title="Sign out">↩</button>
        </div>
      </aside>
 
      <div className="dash-main">
        <div className="dash-tb">
          <div className="dt-bc">TaskFlow / <strong>Dashboard</strong></div>
          <div className="dt-r">
            <div className="dt-search">🔍 <span>Search tasks…</span></div>
            <div className="dt-ib" style={{position:"relative"}}>🔔<div className="dt-nd"/></div>
            <div className="dt-ib">⚙</div>
          </div>
        </div>
 
        <div className="dash-content">
          <div className="dash-wr">
            <div>
              <div className="dash-wt">{greeting}, <span>{display}</span> 👋</div>
              <div className="dash-ws">Here's what's happening with your projects today.</div>
            </div>
            <div className="dash-wd">{today}</div>
          </div>
 
          <div className="dash-stats">
            {[
              {icon:"📋",bg:"#fff3ec",val:"24",label:"Total Tasks",trend:"+3",tc:"tr-up"},
              {icon:"✅",bg:"#f0fdf4",val:"18",label:"Completed",trend:"+6",tc:"tr-up"},
              {icon:"⏳",bg:"#eef3ff",val:"4",label:"In Progress",trend:"0",tc:"tr-n"},
              {icon:"🚨",bg:"#fff1f2",val:"2",label:"Overdue",trend:"-3",tc:"tr-up"},
            ].map(s=>(
              <div className="st-card" key={s.label}>
                <div className="st-top">
                  <div className="st-ico" style={{background:s.bg}}>{s.icon}</div>
                  <div className={`st-trend ${s.tc}`}>{s.trend}</div>
                </div>
                <div className="st-val">{s.val}</div>
                <div className="st-lbl">{s.label}</div>
              </div>
            ))}
          </div>
 
          <div className="dash-mid">
            <div className="dc">
              <div className="dc-hd"><div className="dc-t">Recent Tasks</div><button className="dc-a">View all →</button></div>
              <table className="t-tbl">
                <thead>
                  <tr><th>Task</th><th>Priority</th><th>Status</th><th>Due</th><th>Assignee</th></tr>
                </thead>
                <tbody>
                  {tasks.map((t,i)=>(
                    <tr key={i}>
                      <td>
                        <div className="t-nc">
                          <div className={`t-cb ${t.status==="done"?"tc-d":t.status==="progress"?"tc-p":"tc-t"}`}>
                            {t.status==="done"&&<span style={{color:"white"}}>✓</span>}
                          </div>
                          <span className={`t-n${t.status==="done"?" done":""}`}>{t.name}</span>
                        </div>
                      </td>
                      <td><span className={`t-pri ${priMap[t.pri]}`}>{t.pri}</span></td>
                      <td>
                        <span className={`t-st ${stMap[t.status].cls}`}>
                          <span className="s-dot" style={{background:stMap[t.status].dot}}/>
                          {stMap[t.status].lbl}
                        </span>
                      </td>
                      <td style={{fontSize:"0.78rem",color:"var(--text2)",fontWeight:500}}>{t.due}</td>
                      <td><div className="t-av" style={{background:t.bg}}>{t.av}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
 
            <div className="dash-right">
              <div className="dc">
                <div className="dc-hd"><div className="dc-t">Recent Activity</div><button className="dc-a">See all</button></div>
                <div className="ac-list">
                  {activity.map((a,i)=>(
                    <div className="ac-item" key={i}>
                      <div className="ac-av" style={{background:a.bg}}>{a.av}</div>
                      <div><div className="ac-txt">{a.text}</div><div className="ac-time">{a.time}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
 
          <div className="dash-bot">
            <div className="dc">
              <div className="dc-hd"><div className="dc-t">Project Progress</div><button className="dc-a">View projects →</button></div>
              <div className="pj-list">
                {projects.map(p=>(
                  <div className="pj-item" key={p.name}>
                    <div className="pj-top"><div className="pj-n">{p.name}</div><div className="pj-p">{p.pct}%</div></div>
                    <div className="pj-bar"><div className="pj-fill" style={{width:`${p.pct}%`,background:p.color}}/></div>
                    <div className="pj-meta"><span className="pj-cnt">{p.tasks}</span><span className="pj-due">Due {p.due}</span></div>
                  </div>
                ))}
              </div>
            </div>
 
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div className="dc">
                <div className="dc-hd"><div className="dc-t">Quick Actions</div></div>
                <div className="qa-grid">
                  {[
                    {icon:"➕",bg:"#fff3ec",label:"New Task"},
                    {icon:"📁",bg:"#eef3ff",label:"New Project"},
                    {icon:"👥",bg:"#f3f0ff",label:"Invite Team"},
                    {icon:"📊",bg:"#f0fdf4",label:"View Report"},
                  ].map(q=>(
                    <button className="qa-btn" key={q.label}>
                      <div className="qa-ico" style={{background:q.bg}}>{q.icon}</div>{q.label}
                    </button>
                  ))}
                </div>
              </div>
 
              <div className="dc">
                <div className="dc-hd">
                  <div className="dc-t">Due Today</div>
                  <div style={{fontSize:"0.72rem",background:"var(--al)",color:"var(--accent)",padding:"2px 8px",borderRadius:"100px",fontWeight:700}}>3 items</div>
                </div>
                <div className="due-list">
                  {dueTasks.map((d,i)=>(
                    <div className="due-item" key={i}>
                      <div className="due-dot" style={{background:d.color}}/>
                      <div className="due-n">{d.name}</div>
                      <div className="due-t">{d.time}</div>
                      <span className="due-badge" style={{background:d.bc,color:d.btc}}>{d.badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
