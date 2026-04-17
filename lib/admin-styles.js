export const ADMIN_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
:root{
  --a-bg:#0B0B0A;--a-s:#14140F;--a-sh:#1E1E19;--a-b:#2A2A23;--a-bl:#1E1E19;
  --a-t:#F5F4EF;--a-t2:#A19F96;--a-t3:#6F6D65;
  --a-g:#4ADE80;--a-gl:#1A3A28;
  --a-am:#F59E0B;--a-aml:#3D2E12;
  --a-r:#EF4444;--a-rl:#3D1818;
  --a-b2:#3B82F6;--a-bll:#1A2F4E;
  --a-p:#A78BFA;--a-pl:#2B2246;
  --afm:'IBM Plex Mono',monospace;--afb:'DM Sans',sans-serif;
}
.admin-root *{margin:0;padding:0;box-sizing:border-box}
.admin-root{font-family:var(--afb);background:var(--a-bg);color:var(--a-t);min-height:100vh;-webkit-font-smoothing:antialiased}

.admin-login{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--a-bg)}
.al-card{background:var(--a-s);border:1px solid var(--a-b);border-radius:16px;padding:44px 38px;max-width:400px;width:100%;text-align:center}
.al-title{font-family:var(--afm);font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:var(--a-t2);margin-bottom:6px}
.al-h{font-family:var(--afm);font-size:20px;font-weight:700;margin-bottom:28px}
.al-msg{color:var(--a-t2);font-size:13px;line-height:1.5;padding:14px;background:var(--a-rl);color:#fca5a5;border-radius:10px;margin-bottom:16px}

.admin-shell{display:flex;min-height:100vh}
.admin-side{width:220px;background:#000;border-right:1px solid var(--a-b);padding:22px 12px;display:flex;flex-direction:column;position:fixed;left:0;top:0;height:100vh;z-index:20}
.admin-brand{padding:0 10px 24px;font-family:var(--afm);font-size:11px;text-transform:uppercase;letter-spacing:3px;color:var(--a-t3);display:flex;align-items:center;justify-content:space-between}
.admin-brand .adot{width:6px;height:6px;background:var(--a-g);border-radius:50%;animation:ablink 2s infinite}
@keyframes ablink{0%,100%{opacity:1}50%{opacity:.3}}
.admin-nav{flex:1;display:flex;flex-direction:column;gap:1px}
.ani{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:6px;color:var(--a-t2);font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;border:none;background:none;width:100%;text-align:left;font-family:var(--afb)}
.ani:hover{color:var(--a-t);background:rgba(255,255,255,.04)}
.ani.act{color:var(--a-t);background:var(--a-sh)}
.admin-footer{padding:10px;border-top:1px solid var(--a-b);margin-top:auto}
.aft{color:var(--a-t3);font-size:10.5px;margin-bottom:8px;font-family:var(--afm)}
.af-btn{display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--a-t3);cursor:pointer;padding:4px;font-size:11px;font-family:var(--afb);transition:color .15s}
.af-btn:hover{color:var(--a-t2)}

.admin-main{margin-left:220px;flex:1;padding:32px;min-height:100vh}
.admin-ph{margin-bottom:32px}
.adm-t{font-family:var(--afm);font-size:20px;font-weight:700;letter-spacing:-.3px;margin-bottom:4px}
.adm-s{color:var(--a-t3);font-size:12px;font-family:var(--afm)}

.kpi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;margin-bottom:28px}
.kpi{background:var(--a-s);border:1px solid var(--a-b);border-radius:12px;padding:18px}
.kpi-l{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--a-t3);margin-bottom:10px}
.kpi-v{font-family:var(--afm);font-size:26px;font-weight:700;letter-spacing:-1px;margin-bottom:4px}
.kpi-d{font-size:11px;color:var(--a-t3);display:flex;align-items:center;gap:4px}
.kpi-d.up{color:var(--a-g)}.kpi-d.down{color:var(--a-r)}

.a-card{background:var(--a-s);border:1px solid var(--a-b);border-radius:12px;padding:20px}
.a-card-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.a-card-t{font-family:var(--afm);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--a-t2)}
.a-two{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
@media(max-width:900px){.a-two{grid-template-columns:1fr}}

.a-tw{overflow-x:auto}
.a-table{width:100%;border-collapse:collapse}
.a-table th{text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--a-t3);padding:10px 14px;border-bottom:1px solid var(--a-b);font-family:var(--afm)}
.a-table td{padding:12px 14px;font-size:12.5px;border-bottom:1px solid var(--a-bl);vertical-align:middle}
.a-table tr:hover td{background:rgba(255,255,255,.02)}
.a-table .mono{font-family:var(--afm);font-size:11.5px;color:var(--a-t2)}

.a-badge{display:inline-block;padding:2px 9px;border-radius:20px;font-size:10.5px;font-weight:600;font-family:var(--afm)}
.a-bg-g{background:var(--a-gl);color:var(--a-g)}
.a-bg-a{background:var(--a-aml);color:var(--a-am)}
.a-bg-r{background:var(--a-rl);color:#fca5a5}
.a-bg-b{background:var(--a-bll);color:#93c5fd}
.a-bg-p{background:var(--a-pl);color:#c4b5fd}
.a-bg-gr{background:var(--a-sh);color:var(--a-t3)}

.a-chart{height:180px;display:flex;align-items:flex-end;gap:4px;padding-top:12px}
.a-bc{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:0}
.a-bar{width:100%;background:var(--a-g);border-radius:3px 3px 0 0;transition:height .4s ease;min-height:2px;opacity:.85}
.a-bar:hover{opacity:1}
.a-bc-l{font-size:9px;color:var(--a-t3);font-family:var(--afm);white-space:nowrap}

.a-bullet{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--a-bl);font-size:13px}
.a-bullet:last-child{border-bottom:none}
.a-bullet .rank{font-family:var(--afm);font-size:10.5px;color:var(--a-t3);width:18px}
.a-bullet .name{flex:1;font-weight:500}
.a-bullet .num{font-family:var(--afm);font-weight:700;color:var(--a-g);font-size:12px}

.a-feed{max-height:500px;overflow-y:auto}
.a-fe{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--a-bl);font-size:12.5px}
.a-fe:last-child{border-bottom:none}
.a-fe .dot{width:7px;height:7px;border-radius:50%;background:var(--a-g);margin-top:7px;flex-shrink:0}
.a-fe .text{flex:1;line-height:1.5}
.a-fe .text b{color:var(--a-t);font-weight:600}
.a-fe .when{color:var(--a-t3);font-family:var(--afm);font-size:10.5px;white-space:nowrap}

.a-tabs{display:flex;gap:2px;background:var(--a-s);border:1px solid var(--a-b);border-radius:8px;padding:3px;margin-bottom:20px;width:fit-content;overflow-x:auto}
.a-tab{padding:7px 16px;border:none;background:none;color:var(--a-t3);cursor:pointer;font-size:12px;font-weight:500;font-family:var(--afb);border-radius:6px;transition:all .15s;white-space:nowrap}
.a-tab:hover{color:var(--a-t)}
.a-tab.act{background:var(--a-sh);color:var(--a-t)}

.a-search{position:relative;display:flex;align-items:center}
.a-search input{padding:8px 12px 8px 34px;background:var(--a-s);border:1px solid var(--a-b);border-radius:8px;font-size:12px;width:260px;font-family:var(--afb);color:var(--a-t)}
.a-search input::placeholder{color:var(--a-t3)}
.a-search input:focus{outline:none;border-color:var(--a-t3)}
.a-search .ic{position:absolute;left:11px;color:var(--a-t3);display:flex}

.a-empty{text-align:center;padding:60px 20px;color:var(--a-t3);font-size:13px}
.a-filterrow{display:flex;gap:10px;align-items:center;margin-bottom:18px;flex-wrap:wrap}

.a-spinner{width:28px;height:28px;border:2px solid var(--a-b);border-top-color:var(--a-g);border-radius:50%;animation:aspin .8s linear infinite}
@keyframes aspin{to{transform:rotate(360deg)}}
.a-loading{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--a-bg)}

.a-mobheader{display:none;position:fixed;top:0;left:0;right:0;background:#000;border-bottom:1px solid var(--a-b);padding:12px 16px;align-items:center;justify-content:space-between;z-index:30}
.a-mobheader .bn{font-family:var(--afm);font-size:11px;text-transform:uppercase;letter-spacing:2px;color:var(--a-t2)}
.a-mobbtn{background:none;border:none;color:var(--a-t);cursor:pointer;padding:4px}
.a-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:25}
@media(max-width:768px){
  .admin-side{transform:translateX(-100%);transition:transform .3s}.admin-side.open{transform:translateX(0)}
  .a-mobheader{display:flex}.a-ov.open{display:block}
  .admin-main{margin-left:0;padding:70px 16px 24px}
  .kpi-grid{grid-template-columns:1fr 1fr;gap:10px}.kpi-v{font-size:20px}
  .a-search input{width:100%}
}

::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2a2a23;border-radius:3px}
`;
