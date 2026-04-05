const GLOBAL = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#f8f7f4;--white:#ffffff;--surface:#f2f1ee;
    --border:#e8e6e1;--border2:#d4d1ca;
    --text:#1a1915;--text2:#4a4740;--muted:#9b9790;
    --accent:#e8600a;--al:#fff3ec;
    --a2:#2d6ef5;--a2l:#eef3ff;
    --green:#16a34a;--gl:#f0fdf4;
    --ss:0 1px 3px rgba(0,0,0,0.07),0 1px 2px rgba(0,0,0,0.05);
    --sh:0 4px 16px rgba(0,0,0,0.08),0 1px 3px rgba(0,0,0,0.05);
    --sl:0 20px 60px rgba(0,0,0,0.12),0 4px 16px rgba(0,0,0,0.06);
    --r:14px;--rs:8px;--rl:20px;
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased}
  button{font-family:inherit;cursor:pointer}
  input,textarea,select{font-family:inherit}
  ::-webkit-scrollbar{width:6px}
  ::-webkit-scrollbar-track{background:var(--bg)}
  ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:10px}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}
`;
 
const LANDING = `
  .lp{min-height:100vh;background:var(--bg)}
  .lp-nav{position:sticky;top:0;z-index:50;background:rgba(248,247,244,0.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:0 40px;display:flex;align-items:center;justify-content:space-between;height:64px;animation:slideDown 0.4s ease}
  .lp-logo{display:flex;align-items:center;gap:10px;font-family:'Outfit',sans-serif;font-weight:700;font-size:1.25rem;color:var(--text);letter-spacing:-0.02em;cursor:pointer}
  .lp-logo-mark{width:32px;height:32px;border-radius:9px;background:var(--accent);display:flex;align-items:center;justify-content:center;color:white;font-size:0.9rem;font-weight:800}
  .lp-nav-links{display:flex;gap:4px}
  .lp-nav-link{padding:7px 14px;border-radius:var(--rs);font-size:0.875rem;font-weight:500;color:var(--text2);background:none;border:none;transition:all 0.15s}
  .lp-nav-link:hover{background:var(--surface);color:var(--text)}
  .lp-nav-right{display:flex;align-items:center;gap:8px}
  .btn-ol{padding:8px 18px;border-radius:var(--rs);border:1.5px solid var(--border2);background:transparent;color:var(--text);font-size:0.875rem;font-weight:600;transition:all 0.15s}
  .btn-ol:hover{border-color:var(--text);background:var(--white)}
  .btn-acc{padding:8px 18px;border-radius:var(--rs);border:none;background:var(--accent);color:white;font-size:0.875rem;font-weight:600;transition:all 0.15s;box-shadow:0 2px 8px rgba(232,96,10,0.25)}
  .btn-acc:hover{background:#d15508;transform:translateY(-1px);box-shadow:0 4px 16px rgba(232,96,10,0.35)}
  .lp-hero{max-width:1100px;margin:0 auto;padding:80px 40px 60px;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
  .hero-left{animation:slideUp 0.6s 0.1s ease both}
  .hero-eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--al);color:var(--accent);border:1px solid rgba(232,96,10,0.2);padding:5px 12px;border-radius:100px;font-size:0.78rem;font-weight:600;margin-bottom:24px}
  .e-dot{width:5px;height:5px;border-radius:50%;background:var(--accent)}
  .hero-h1{font-family:'Outfit',sans-serif;font-size:clamp(2.4rem,4.5vw,3.8rem);font-weight:800;line-height:1.1;letter-spacing:-0.03em;color:var(--text);margin-bottom:20px}
  .hero-h1 em{font-style:normal;color:var(--accent)}
  .hero-p{font-size:1.05rem;color:var(--text2);line-height:1.75;max-width:460px;margin-bottom:36px}
  .hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:44px}
  .btn-hero{padding:13px 28px;border-radius:var(--r);font-size:0.95rem;font-weight:700}
  .hero-proof{display:flex;align-items:center;gap:12px}
  .av-row{display:flex}
  .av-item{width:32px;height:32px;border-radius:50%;border:2.5px solid var(--bg);margin-left:-8px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:white}
  .av-item:first-child{margin-left:0}
  .proof-txt{font-size:0.82rem;color:var(--text2)}
  .proof-txt strong{color:var(--text);font-weight:700}
  .stars{color:#f59e0b;font-size:0.7rem;letter-spacing:1px}
  .hero-right{animation:slideUp 0.6s 0.25s ease both}
  .ap{background:var(--white);border:1px solid var(--border);border-radius:var(--rl);box-shadow:var(--sl);overflow:hidden}
  .ap-hd{background:var(--surface);border-bottom:1px solid var(--border);padding:12px 16px;display:flex;align-items:center;justify-content:space-between}
  .ap-dots{display:flex;gap:6px}
  .ap-dot{width:10px;height:10px;border-radius:50%}
  .ap-title{font-size:0.75rem;font-weight:600;color:var(--muted)}
  .ap-tabs{display:flex;gap:4px}
  .ap-tab{padding:4px 10px;border-radius:6px;font-size:0.72rem;font-weight:600;color:var(--muted);background:none;border:none}
  .ap-tab.on{background:var(--white);color:var(--text);box-shadow:var(--ss)}
  .ap-body{padding:16px;display:flex;flex-direction:column;gap:12px}
  .ap-srow{display:flex;gap:10px}
  .ap-stat{flex:1;background:var(--surface);border-radius:var(--rs);padding:12px;border:1px solid var(--border)}
  .ap-sl{font-size:0.68rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px}
  .ap-sv{font-family:'Outfit',sans-serif;font-size:1.4rem;font-weight:700;color:var(--text)}
  .ap-ss{font-size:0.68rem;margin-top:2px}
  .c-up{color:var(--green)}.c-dn{color:#ef4444}
  .ap-sec{font-size:0.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;margin-top:4px}
  .ap-task{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--rs)}
  .ap-chk{width:16px;height:16px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:0.6rem}
  .chk-done{background:var(--green);color:white}
  .chk-todo{border:1.5px solid var(--border2)}
  .ap-tn{flex:1;font-size:0.8rem;font-weight:500;color:var(--text)}
  .ap-tdone{text-decoration:line-through;color:var(--muted)}
  .ap-pri{padding:2px 7px;border-radius:4px;font-size:0.63rem;font-weight:700;text-transform:uppercase}
  .pri-h{background:#fee2e2;color:#ef4444}
  .pri-m{background:#fef3c7;color:#d97706}
  .pri-l{background:var(--gl);color:var(--green)}
  .ap-av{width:22px;height:22px;border-radius:50%;font-size:0.6rem;font-weight:700;color:white;display:flex;align-items:center;justify-content:center}
  .ap-prow{display:flex;flex-direction:column;gap:6px}
  .ap-pi{display:flex;align-items:center;gap:8px}
  .ap-pl{font-size:0.75rem;font-weight:500;color:var(--text2);width:90px;flex-shrink:0}
  .ap-pb{flex:1;height:6px;background:var(--border);border-radius:10px;overflow:hidden}
  .ap-pf{height:100%;border-radius:10px}
  .ap-pp{font-size:0.7rem;font-weight:700;color:var(--text2);width:32px;text-align:right}
  .lp-logos{border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:28px 40px;display:flex;align-items:center;justify-content:center;gap:48px}
  .logos-lbl{font-size:0.8rem;color:var(--muted);font-weight:500;white-space:nowrap}
  .logos-row{display:flex;align-items:center;gap:40px}
  .logo-br{font-family:'Outfit',sans-serif;font-size:1rem;font-weight:700;color:var(--border2);letter-spacing:-0.02em}
  .lp-feat{max-width:1100px;margin:0 auto;padding:80px 40px}
  .lp-sh{text-align:center;margin-bottom:56px}
  .lp-tag{display:inline-block;padding:4px 12px;border-radius:100px;background:var(--a2l);color:var(--a2);font-size:0.78rem;font-weight:700;margin-bottom:14px}
  .lp-st{font-family:'Outfit',sans-serif;font-size:clamp(1.8rem,3vw,2.6rem);font-weight:800;letter-spacing:-0.025em;color:var(--text);margin-bottom:14px}
  .lp-ss{color:var(--text2);font-size:1rem;max-width:480px;margin:0 auto;line-height:1.65}
  .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .feat-card{background:var(--white);border:1px solid var(--border);border-radius:var(--rl);padding:28px 26px;transition:all 0.2s;box-shadow:var(--ss)}
  .feat-card:hover{transform:translateY(-3px);box-shadow:var(--sh);border-color:var(--border2)}
  .fi{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin-bottom:16px}
  .fi-o{background:var(--al)}.fi-b{background:var(--a2l)}.fi-g{background:var(--gl)}
  .fi-p{background:#f3f0ff}.fi-y{background:#fffbeb}.fi-r{background:#fff1f2}
  .feat-t{font-family:'Outfit',sans-serif;font-weight:700;font-size:1rem;margin-bottom:8px;color:var(--text)}
  .feat-d{font-size:0.875rem;color:var(--text2);line-height:1.65}
  .lp-testi{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:72px 40px}
  .tg{max-width:1000px;margin:48px auto 0;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .tc{background:var(--white);border:1px solid var(--border);border-radius:var(--rl);padding:24px;box-shadow:var(--ss)}
  .tc-stars{color:#f59e0b;font-size:0.8rem;margin-bottom:12px}
  .tc-q{font-size:0.875rem;color:var(--text2);line-height:1.7;margin-bottom:18px;font-style:italic}
  .tc-auth{display:flex;align-items:center;gap:10px}
  .tc-av{width:36px;height:36px;border-radius:50%;font-size:0.75rem;font-weight:700;color:white;display:flex;align-items:center;justify-content:center}
  .tc-n{font-weight:700;font-size:0.85rem;color:var(--text)}
  .tc-r{font-size:0.75rem;color:var(--muted)}
  .lp-cta{max-width:1100px;margin:0 auto;padding:80px 40px}
  .lp-cta-in{background:var(--text);border-radius:24px;padding:64px;display:flex;align-items:center;justify-content:space-between;gap:48px}
  .lp-cta-l{flex:1}
  .lp-cta-h{font-family:'Outfit',sans-serif;font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;letter-spacing:-0.025em;color:white;margin-bottom:12px}
  .lp-cta-p{color:rgba(255,255,255,0.6);font-size:0.95rem;line-height:1.65}
  .lp-cta-r{display:flex;flex-direction:column;gap:10px;min-width:220px}
  .btn-wh{padding:13px 28px;border-radius:var(--r);background:white;color:var(--text);font-weight:700;font-size:0.95rem;border:none;transition:all 0.15s;text-align:center;box-shadow:var(--ss)}
  .btn-wh:hover{transform:translateY(-1px);box-shadow:var(--sh)}
  .btn-gh{padding:13px 28px;border-radius:var(--r);background:rgba(255,255,255,0.1);color:white;font-weight:600;font-size:0.95rem;border:1.5px solid rgba(255,255,255,0.2);transition:all 0.15s;text-align:center}
  .btn-gh:hover{background:rgba(255,255,255,0.15)}
  .lp-footer{border-top:1px solid var(--border);padding:28px 40px;display:flex;align-items:center;justify-content:space-between;font-size:0.82rem;color:var(--muted)}
`;
 
const AUTH = `
  .auth-page{min-height:100vh;display:flex;background:var(--bg);animation:fadeIn 0.3s ease}
  .auth-left{width:480px;flex-shrink:0;background:var(--white);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:40px 48px;box-shadow:4px 0 24px rgba(0,0,0,0.04)}
  .auth-logo{display:flex;align-items:center;gap:10px;font-family:'Outfit',sans-serif;font-weight:700;font-size:1.25rem;color:var(--text);letter-spacing:-0.02em;margin-bottom:48px;cursor:pointer}
  .auth-lm{width:32px;height:32px;border-radius:9px;background:var(--accent);color:white;font-size:0.9rem;font-weight:800;display:flex;align-items:center;justify-content:center}
  .auth-fw{flex:1;display:flex;flex-direction:column;justify-content:center}
  .auth-hd{font-family:'Outfit',sans-serif;font-size:1.9rem;font-weight:800;letter-spacing:-0.025em;color:var(--text);margin-bottom:6px;animation:slideUp 0.4s ease}
  .auth-sub{font-size:0.9rem;color:var(--text2);margin-bottom:32px;animation:slideUp 0.4s 0.05s ease both}
  .auth-sub a{color:var(--accent);font-weight:600;cursor:pointer}
  .auth-sub a:hover{text-decoration:underline}
  .auth-soc{display:flex;gap:10px;margin-bottom:20px;animation:slideUp 0.4s 0.1s ease both}
  .auth-sb{flex:1;padding:10px;border-radius:var(--rs);border:1.5px solid var(--border);background:var(--white);display:flex;align-items:center;justify-content:center;gap:8px;font-size:0.85rem;font-weight:600;color:var(--text);transition:all 0.15s}
  .auth-sb:hover{background:var(--surface);border-color:var(--border2)}
  .auth-div{display:flex;align-items:center;gap:12px;margin-bottom:20px}
  .auth-dl{flex:1;height:1px;background:var(--border)}
  .auth-dt{font-size:0.78rem;color:var(--muted);font-weight:500;white-space:nowrap}
  .auth-form{display:flex;flex-direction:column;gap:14px;animation:slideUp 0.4s 0.15s ease both}
  .f-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .f-field{display:flex;flex-direction:column;gap:6px}
  .f-label{font-size:0.8rem;font-weight:700;color:var(--text)}
  .f-wrap{position:relative}
  .f-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:0.95rem;pointer-events:none}
  .f-in{width:100%;padding:11px 13px 11px 38px;border:1.5px solid var(--border);border-radius:var(--rs);background:var(--white);color:var(--text);font-size:0.875rem;outline:none;transition:all 0.15s}
  .f-in:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(232,96,10,0.1)}
  .f-in::placeholder{color:var(--muted)}
  .f-in.err{border-color:#ef4444}
  .f-tog{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);font-size:0.9rem;cursor:pointer;padding:0;transition:color 0.15s}
  .f-tog:hover{color:var(--text)}
  .f-err{font-size:0.75rem;color:#ef4444;font-weight:500}
  .f-forgot{text-align:right;font-size:0.8rem;font-weight:600;color:var(--accent);cursor:pointer}
  .f-forgot:hover{text-decoration:underline}
  .f-check{display:flex;align-items:flex-start;gap:9px}
  .f-cb{width:16px;height:16px;border-radius:4px;flex-shrink:0;margin-top:2px;cursor:pointer;accent-color:var(--accent)}
  .f-clabel{font-size:0.8rem;color:var(--text2);line-height:1.5}
  .f-clabel a{color:var(--accent);font-weight:600;cursor:pointer}
  .str-row{display:flex;gap:4px;margin-top:6px}
  .str-bar{flex:1;height:3px;border-radius:10px;background:var(--border);transition:background 0.3s}
  .s-w{background:#ef4444}.s-f{background:#f59e0b}.s-g{background:#3b82f6}.s-s{background:var(--green)}
  .str-lbl{font-size:0.72rem;margin-top:4px;font-weight:600}
  .btn-sub{width:100%;padding:13px;border-radius:var(--rs);background:var(--text);color:white;font-weight:700;font-size:0.95rem;border:none;transition:all 0.15s;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:var(--ss)}
  .btn-sub:hover{background:#2d2c29;transform:translateY(-1px);box-shadow:var(--sh)}
  .btn-sub:disabled{opacity:0.6;cursor:not-allowed;transform:none}
  .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite}
  .auth-right{flex:1;background:var(--surface);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 48px;position:relative;overflow:hidden}
  .auth-rbg{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 50% at 30% 30%,rgba(232,96,10,0.06) 0%,transparent 70%),radial-gradient(ellipse 50% 60% at 70% 70%,rgba(45,110,245,0.06) 0%,transparent 70%)}
  .auth-rc{position:relative;z-index:1;max-width:460px;width:100%}
  .auth-plbl{font-size:0.75rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:24px;display:flex;align-items:center;gap:8px}
  .auth-plbl::before{content:'';display:block;width:20px;height:1.5px;background:var(--muted)}
  .auth-pc{background:var(--white);border:1px solid var(--border);border-radius:var(--rl);box-shadow:var(--sl);overflow:hidden;animation:slideUp 0.5s 0.2s ease both}
  .apc-hd{background:var(--surface);border-bottom:1px solid var(--border);padding:12px 16px;display:flex;align-items:center;gap:8px}
  .apc-dots{display:flex;gap:6px}
  .apc-dot{width:8px;height:8px;border-radius:50%}
  .apc-title{font-size:0.72rem;font-weight:600;color:var(--muted);flex:1;text-align:center}
  .apc-body{padding:20px;display:flex;flex-direction:column;gap:14px}
  .apc-welcome{display:flex;align-items:center;justify-content:space-between}
  .apc-greet{font-family:'Outfit',sans-serif;font-size:1.1rem;font-weight:800;color:var(--text)}
  .apc-greet span{color:var(--accent)}
  .apc-date{font-size:0.72rem;color:var(--muted);font-weight:500}
  .apc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .apc-sm{background:var(--surface);border:1px solid var(--border);border-radius:var(--rs);padding:10px 12px}
  .apc-smv{font-family:'Outfit',sans-serif;font-size:1.3rem;font-weight:800;color:var(--text)}
  .apc-sml{font-size:0.65rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-top:2px}
  .apc-tl{font-size:0.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em}
  .apc-tasks{display:flex;flex-direction:column;gap:6px}
  .apc-ti{display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--rs)}
  .apc-chk{width:14px;height:14px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:0.55rem}
  .apc-tn{flex:1;font-size:0.78rem;font-weight:500;color:var(--text)}
  .apc-tn.done{text-decoration:line-through;color:var(--muted)}
  .apc-badge{padding:2px 7px;border-radius:4px;font-size:0.6rem;font-weight:700;text-transform:uppercase}
  .apc-prog{display:flex;flex-direction:column;gap:6px}
  .apc-pr{display:flex;align-items:center;gap:8px}
  .apc-prl{font-size:0.72rem;font-weight:500;color:var(--text2);flex:1}
  .apc-prt{width:120px;height:5px;background:var(--border);border-radius:10px;overflow:hidden}
  .apc-prf{height:100%;border-radius:10px}
  .apc-prp{font-size:0.7rem;font-weight:700;color:var(--text);width:30px;text-align:right}
  .auth-testi{margin-top:32px;background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:20px 22px;animation:slideUp 0.5s 0.35s ease both}
  .at-q{font-size:0.875rem;color:var(--text2);line-height:1.65;margin-bottom:14px;font-style:italic}
  .at-auth{display:flex;align-items:center;gap:10px}
  .at-av{width:34px;height:34px;border-radius:50%;background:var(--accent);color:white;font-size:0.75rem;font-weight:700;display:flex;align-items:center;justify-content:center}
  .at-n{font-weight:700;font-size:0.82rem;color:var(--text)}
  .at-r{font-size:0.72rem;color:var(--muted)}
  .at-s{color:#f59e0b;font-size:0.7rem;letter-spacing:1px;margin-top:1px}
`;
 
const DASH = `
  .dash-layout{display:flex;min-height:100vh;background:var(--bg);animation:fadeIn 0.3s ease}
  .dash-sidebar{width:240px;flex-shrink:0;background:var(--white);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
  .ds-logo{display:flex;align-items:center;gap:10px;padding:20px 20px 16px;font-family:'Outfit',sans-serif;font-weight:700;font-size:1.15rem;color:var(--text);letter-spacing:-0.02em;border-bottom:1px solid var(--border)}
  .ds-lm{width:30px;height:30px;border-radius:8px;background:var(--accent);color:white;font-size:0.85rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .ds-nav{padding:12px 10px;flex:1;display:flex;flex-direction:column;gap:2px}
  .ds-sec{font-size:0.65rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.07em;padding:8px 10px 4px;margin-top:8px}
  .ds-ni{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:var(--rs);font-size:0.85rem;font-weight:500;color:var(--text2);background:none;border:none;width:100%;text-align:left;transition:all 0.15s;cursor:pointer}
  .ds-ni:hover{background:var(--surface);color:var(--text)}
  .ds-ni.active{background:var(--al);color:var(--accent);font-weight:600}
  .ds-ico{font-size:1rem;width:20px;text-align:center;flex-shrink:0}
  .ds-badge{margin-left:auto;padding:1px 7px;border-radius:100px;background:var(--accent);color:white;font-size:0.65rem;font-weight:700}
  .ds-user{border-top:1px solid var(--border);padding:14px 16px;display:flex;align-items:center;gap:10px}
  .ds-uav{width:34px;height:34px;border-radius:50%;background:var(--accent);color:white;font-size:0.75rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .ds-un{font-size:0.82rem;font-weight:700;color:var(--text)}
  .ds-up{font-size:0.7rem;color:var(--muted)}
  .ds-logout{margin-left:auto;background:none;border:none;color:var(--muted);font-size:0.9rem;cursor:pointer;padding:4px;border-radius:6px;transition:all 0.15s}
  .ds-logout:hover{color:var(--text);background:var(--surface)}
  .dash-main{flex:1;display:flex;flex-direction:column;overflow:hidden}
  .dash-tb{background:var(--white);border-bottom:1px solid var(--border);padding:0 28px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
  .dt-bc{font-size:0.82rem;color:var(--muted);font-weight:500}
  .dt-bc strong{color:var(--text);font-weight:700}
  .dt-r{display:flex;align-items:center;gap:10px}
  .dt-search{display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:var(--rs);padding:7px 13px;font-size:0.82rem;color:var(--muted)}
  .dt-ib{width:36px;height:36px;border-radius:var(--rs);background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--text2);cursor:pointer;font-size:0.9rem;transition:all 0.15s;position:relative}
  .dt-ib:hover{background:var(--border);color:var(--text)}
  .dt-nd{position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:var(--accent);border:1.5px solid var(--white)}
  .dash-content{flex:1;padding:28px;overflow-y:auto}
  .dash-wr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px}
  .dash-wt{font-family:'Outfit',sans-serif;font-size:1.6rem;font-weight:800;letter-spacing:-0.025em;color:var(--text);margin-bottom:4px}
  .dash-wt span{color:var(--accent)}
  .dash-ws{font-size:0.875rem;color:var(--text2)}
  .dash-wd{font-size:0.82rem;color:var(--muted);font-weight:500;text-align:right}
  .dash-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
  .st-card{background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:20px;box-shadow:var(--ss);transition:all 0.2s}
  .st-card:hover{transform:translateY(-2px);box-shadow:var(--sh)}
  .st-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
  .st-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1rem}
  .st-trend{display:flex;align-items:center;gap:3px;font-size:0.72rem;font-weight:700;padding:3px 7px;border-radius:100px}
  .tr-up{background:var(--gl);color:var(--green)}
  .tr-dn{background:#fff1f2;color:#ef4444}
  .tr-n{background:var(--surface);color:var(--muted)}
  .st-val{font-family:'Outfit',sans-serif;font-size:2rem;font-weight:800;color:var(--text);letter-spacing:-0.02em;line-height:1;margin-bottom:4px}
  .st-lbl{font-size:0.78rem;color:var(--muted);font-weight:600}
  .dash-mid{display:grid;grid-template-columns:1fr 340px;gap:16px;margin-bottom:16px}
  .dc{background:var(--white);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--ss);overflow:hidden}
  .dc-hd{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
  .dc-t{font-family:'Outfit',sans-serif;font-weight:700;font-size:0.95rem;color:var(--text)}
  .dc-a{font-size:0.78rem;font-weight:600;color:var(--accent);background:none;border:none;cursor:pointer}
  .dc-a:hover{text-decoration:underline}
  .t-tbl{width:100%;border-collapse:collapse}
  .t-tbl th{text-align:left;font-size:0.68rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;padding:10px 20px;border-bottom:1px solid var(--border);background:var(--surface)}
  .t-tbl td{padding:12px 20px;border-bottom:1px solid var(--border);vertical-align:middle}
  .t-tbl tr:last-child td{border-bottom:none}
  .t-tbl tr:hover td{background:var(--surface)}
  .t-nc{display:flex;align-items:center;gap:10px}
  .t-cb{width:16px;height:16px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:0.55rem}
  .tc-d{background:var(--green);color:white}
  .tc-p{border:1.5px solid var(--a2)}
  .tc-t{border:1.5px solid var(--border2)}
  .t-n{font-size:0.82rem;font-weight:500;color:var(--text)}
  .t-n.done{text-decoration:line-through;color:var(--muted)}
  .t-pri{display:inline-flex;padding:3px 8px;border-radius:5px;font-size:0.65rem;font-weight:700;text-transform:uppercase}
  .t-st{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:100px;font-size:0.72rem;font-weight:600}
  .s-done{background:var(--gl);color:var(--green)}
  .s-prog{background:var(--a2l);color:var(--a2)}
  .s-todo{background:var(--surface);color:var(--muted);border:1px solid var(--border)}
  .s-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
  .t-av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:white}
  .dash-right{display:flex;flex-direction:column;gap:16px}
  .ac-list{padding:4px 0}
  .ac-item{display:flex;gap:12px;padding:12px 20px;border-bottom:1px solid var(--border);transition:background 0.1s}
  .ac-item:last-child{border-bottom:none}
  .ac-item:hover{background:var(--surface)}
  .ac-av{width:28px;height:28px;border-radius:50%;flex-shrink:0;font-size:0.62rem;font-weight:700;color:white;display:flex;align-items:center;justify-content:center;margin-top:1px}
  .ac-txt{flex:1;font-size:0.8rem;color:var(--text2);line-height:1.5}
  .ac-txt strong{color:var(--text);font-weight:600}
  .ac-time{font-size:0.7rem;color:var(--muted);margin-top:2px}
  .pj-list{padding:8px 20px 16px;display:flex;flex-direction:column;gap:14px}
  .pj-item{display:flex;flex-direction:column;gap:6px}
  .pj-top{display:flex;align-items:center;justify-content:space-between}
  .pj-n{font-size:0.82rem;font-weight:600;color:var(--text)}
  .pj-p{font-size:0.78rem;font-weight:700;color:var(--text2)}
  .pj-bar{height:7px;background:var(--border);border-radius:10px;overflow:hidden}
  .pj-fill{height:100%;border-radius:10px}
  .pj-meta{display:flex;align-items:center;gap:8px}
  .pj-cnt{font-size:0.7rem;color:var(--muted)}
  .pj-due{font-size:0.7rem;color:var(--muted);margin-left:auto}
  .dash-bot{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px}
  .qa-btn{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:var(--rs);border:1.5px solid var(--border);background:var(--white);font-size:0.82rem;font-weight:600;color:var(--text);transition:all 0.15s;cursor:pointer;text-align:left}
  .qa-btn:hover{background:var(--surface);border-color:var(--border2);transform:translateY(-1px)}
  .qa-ico{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0}
  .due-list{padding:0 0 8px}
  .due-item{display:flex;align-items:center;gap:12px;padding:10px 20px;border-bottom:1px solid var(--border);transition:background 0.1s}
  .due-item:hover{background:var(--surface)}
  .due-item:last-child{border-bottom:none}
  .due-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
  .due-n{flex:1;font-size:0.82rem;font-weight:500;color:var(--text)}
  .due-t{font-size:0.72rem;color:var(--muted);font-weight:500}
  .due-badge{padding:2px 8px;border-radius:100px;font-size:0.65rem;font-weight:700}
`;
export { GLOBAL, LANDING, AUTH, DASH };