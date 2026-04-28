export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
:root{--bg:#FAF7F3;--s:#FFF;--sh:#F2EFE8;--b:#E5DFD2;--bl:#EFEBE0;--t:#141413;--t2:#65635B;--t3:#9A9790;--g:#B14B2C;--gl:#FAEAE2;--gh:#8C3920;--am:#A97008;--aml:#FEF7E6;--r:#B5301A;--rl:#FEF0EC;--bl2:#1D5BD6;--bll:#ECF2FE;--p:#6D30D9;--pl:#F1ECFE;--sb:#0F0E0C;--sbt:#7E7B72;--sba:#FAF7F3;--fm:'IBM Plex Mono',monospace;--fb:'DM Sans',sans-serif;--rd:10px;--rl2:14px}
*{margin:0;padding:0;box-sizing:border-box}body{font-family:var(--fb);background:var(--bg);color:var(--t);-webkit-font-smoothing:antialiased}

.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--sb)}
.auth-card{background:var(--s);border-radius:20px;padding:40px 32px;max-width:440px;width:100%;animation:su .4s ease}
@media(max-width:480px){.auth-card{padding:32px 20px}}
.auth-logo{text-align:center;margin-bottom:24px}
.auth-title{font-family:var(--fm);font-size:19px;font-weight:700;text-align:center;margin-bottom:6px}
.auth-sub{color:var(--t2);font-size:13.5px;text-align:center;line-height:1.5;margin-bottom:22px}
.auth-fg{margin-bottom:14px}
.auth-fl{display:block;font-size:11px;font-weight:700;color:var(--t2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.auth-fi{width:100%;padding:13px 14px;border:2px solid var(--b);border-radius:10px;font-family:var(--fb);font-size:16px;background:var(--bg);transition:border-color .15s}
.auth-fi:focus{outline:none;border-color:var(--g)}
.auth-btn{width:100%;padding:14px;border:none;border-radius:10px;font-family:var(--fb);font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;min-height:48px}
.auth-btn-p{background:var(--g);color:#fff}.auth-btn-p:hover{background:var(--gh)}.auth-btn-p:disabled{opacity:.5;cursor:not-allowed}
.auth-sw{text-align:center;margin-top:18px;font-size:13px;color:var(--t2)}
.auth-sw button{background:none;border:none;color:var(--g);font-weight:600;cursor:pointer;font-family:var(--fb);font-size:13px}
.auth-err{background:var(--rl);color:var(--r);padding:10px 12px;border-radius:8px;font-size:12.5px;margin-bottom:14px}
.auth-ok{background:var(--gl);color:var(--g);padding:10px 12px;border-radius:8px;font-size:12.5px;margin-bottom:14px}

.onboard{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--sb)}
.ob-card{background:var(--s);border-radius:20px;padding:40px 32px;max-width:480px;width:100%;text-align:center;animation:su .4s ease}
@media(max-width:480px){.ob-card{padding:32px 20px}}
.ob-card h1{font-family:var(--fm);font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:4px;color:var(--t3);margin:24px 0 8px}
.ob-card h2{font-family:var(--fm);font-size:18px;font-weight:700;margin-bottom:8px}
.ob-card p{color:var(--t2);font-size:13.5px;line-height:1.6;margin-bottom:24px}
.tg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px}
@media(max-width:480px){.tg{grid-template-columns:1fr;max-width:240px;margin:0 auto 24px}}
.tc{border:2px solid var(--b);border-radius:14px;padding:20px 10px;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:8px}
.tc:hover,.tc:active{border-color:var(--t3);background:var(--sh)}.tc.sel{border-color:var(--g);background:var(--gl)}
.tc .tci{color:var(--t3);transition:color .2s}.tc.sel .tci{color:var(--g)}
.tc .tcl{font-size:12px;font-weight:700}.tc .tcd{font-size:11px;color:var(--t3);line-height:1.3}
.obb{width:100%;padding:15px;border:none;border-radius:12px;font-family:var(--fb);font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px;min-height:50px}
.obb-p{background:var(--g);color:#fff}.obb-p:hover{background:var(--gh)}.obb-p:disabled{opacity:.4;cursor:not-allowed}
.obb-s{background:none;color:var(--t2);margin-top:8px}.obb-s:hover{color:var(--t)}

.app{display:flex;min-height:100vh}
.sidebar{width:232px;background:var(--sb);padding:20px 14px;display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:100;transition:transform .3s ease}
.sb-brand{padding:0 10px 24px;display:flex;align-items:center}
.sidebar nav{flex:1;display:flex;flex-direction:column;gap:1px}
.ni{display:flex;align-items:center;gap:11px;padding:10px 11px;border-radius:8px;color:var(--sbt);font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;border:none;background:none;width:100%;text-align:left;font-family:var(--fb)}
.ni:hover,.ni:active{color:#ccc;background:rgba(255,255,255,.06)}.ni.act{color:var(--sba);background:rgba(255,255,255,.1)}
.nb{margin-left:auto;background:var(--g);color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px}
.nb-urgent{background:var(--r);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
.sf{padding:10px;border-top:1px solid rgba(255,255,255,.07);margin-top:auto;min-width:0}
.sft{color:var(--sbt);font-size:11px;margin-bottom:8px;word-break:break-all;line-height:1.5}
.sf-logout{display:flex;align-items:center;gap:8px;background:none;border:none;color:var(--sbt);cursor:pointer;padding:6px 4px;font-size:11.5px;font-family:var(--fb);transition:color .15s}
.sf-logout:hover{color:#fff}
.mh-bar{display:none;position:fixed;top:0;left:0;right:0;z-index:90;background:var(--sb);padding:12px 16px;align-items:center;justify-content:space-between}
.mh-btn{background:none;border:none;color:#fff;cursor:pointer;padding:6px;display:flex;align-items:center;justify-content:center}
.sb-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:95}
@media(max-width:768px){.sidebar{transform:translateX(-100%);width:260px}.sidebar.open{transform:translateX(0)}.sb-ov.open{display:block}.mh-bar{display:flex}.main{margin-left:0!important;padding-top:60px!important}}

.loading-screen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:var(--bg)}
.spinner{width:32px;height:32px;border:3px solid var(--b);border-top-color:var(--g);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

.main{margin-left:232px;flex:1;padding:24px;min-height:100vh;min-width:0}
@media(max-width:768px){.main{padding:16px}}
.ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;flex-wrap:wrap;gap:12px}
.pt{font-family:var(--fm);font-size:18px;font-weight:700;letter-spacing:-.3px}
@media(max-width:480px){.pt{font-size:16px}}
.ps{color:var(--t2);font-size:12.5px;margin-top:2px;word-break:break-word}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:8px;font-family:var(--fb);font-size:12.5px;font-weight:600;cursor:pointer;transition:all .15s;border:none;white-space:nowrap;min-height:38px}
.btn-p{background:var(--g);color:#fff}.btn-p:hover{background:var(--gh)}.btn-p:disabled{opacity:.5;cursor:not-allowed}
.btn-s{background:var(--s);color:var(--t);border:1px solid var(--b)}.btn-s:hover,.btn-s:active{background:var(--sh)}
.btn-d{background:var(--rl);color:var(--r)}.btn-d:hover{background:#ffddd6}
.btn-sm{padding:6px 11px;font-size:11.5px;min-height:32px}
.btn-g{background:none;color:var(--t2);padding:6px 10px;min-height:32px}.btn-g:hover{color:var(--t);background:var(--sh)}

.card{background:var(--s);border:1px solid var(--b);border-radius:var(--rl2);padding:18px}
@media(max-width:480px){.card{padding:14px}}
.cg{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:22px}
@media(max-width:480px){.cg{grid-template-columns:1fr 1fr;gap:8px}}
.sc{position:relative;overflow:hidden}
.si{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;font-weight:700;font-size:14px}
.sl{font-size:10.5px;color:var(--t3);font-weight:700;text-transform:uppercase;letter-spacing:.8px}
.sv{font-family:var(--fm);font-size:22px;font-weight:700;margin-top:3px;letter-spacing:-.5px;word-break:break-all}
@media(max-width:480px){.sv{font-size:18px}}

.tw{overflow-x:auto}table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--t3);padding:9px 12px;border-bottom:1px solid var(--b)}
td{padding:10px 12px;font-size:12.5px;border-bottom:1px solid var(--bl);vertical-align:middle}tr:hover td{background:var(--sh)}

/* Mobile card views for lists */
.mcards{display:none}
.mcard{background:var(--s);border:1px solid var(--b);border-radius:10px;padding:14px;margin-bottom:10px;cursor:pointer}
.mcard:active{background:var(--sh)}
.mcard-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:6px}
.mcard-tl{flex:1;min-width:0;display:flex;align-items:center;gap:10px}
.mcard-thumb{width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;background:var(--bg);border:1px solid var(--bl)}
.mcard-name{font-weight:600;font-size:14px;line-height:1.3;word-wrap:break-word;min-width:0}
.mcard-sub{font-size:11.5px;color:var(--t3);margin-top:2px;word-break:break-word}
.mcard-meta{font-size:11px;color:var(--t3);font-family:var(--fm);margin-top:4px}
.mcard-stats{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px solid var(--bl)}
.mcard-stat{display:flex;flex-direction:column;gap:2px}
.mcard-stat .k{font-size:9.5px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;font-weight:700}
.mcard-stat .v{font-size:13px;font-weight:600}
.mcard-stat .v.pos{color:var(--g)}
.mcard-stat .v.neg{color:var(--r)}
.mcard-actions{display:flex;gap:4px;margin-top:10px;padding-top:10px;border-top:1px solid var(--bl);flex-wrap:wrap}
.mcard-actions .btn{flex:1;min-width:max-content;justify-content:center}

.badge{display:inline-block;padding:2px 9px;border-radius:20px;font-size:10.5px;font-weight:600}
.bg-g{background:var(--gl);color:var(--g)}.bg-a{background:var(--aml);color:var(--am)}.bg-r{background:var(--rl);color:var(--r)}.bg-b{background:var(--bll);color:var(--bl2)}.bg-p{background:var(--pl);color:var(--p)}.bg-gr{background:#ECEAE4;color:var(--t2)}

.fg{margin-bottom:14px}
.fl{display:block;font-size:10.5px;font-weight:700;color:var(--t2);margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px}
.fi,.fs,.ft{width:100%;padding:11px 13px;border:1px solid var(--b);border-radius:8px;font-family:var(--fb);font-size:15px;background:var(--s);color:var(--t);transition:border-color .15s}
.fi:focus,.fs:focus,.ft:focus{outline:none;border-color:var(--g)}.ft{resize:vertical;min-height:72px}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:500px){.fr{grid-template-columns:1fr}}

/* Mobile full-screen modals */
.mo{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;animation:fi .15s}
.ml{background:var(--s);border-radius:var(--rl2);width:100%;max-width:540px;max-height:90vh;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,.12);animation:su .2s ease;display:flex;flex-direction:column}
.mh{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 4px;flex-shrink:0}
.mt{font-family:var(--fm);font-size:15px;font-weight:700}
.mc{background:none;border:none;cursor:pointer;color:var(--t3);padding:8px;border-radius:6px;display:flex;align-items:center;justify-content:center}
.mc:hover,.mc:active{color:var(--t);background:var(--sh)}
.mb{padding:16px 20px;flex:1;overflow-y:auto}
.mf{padding:14px 20px;border-top:1px solid var(--bl);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;flex-wrap:wrap}
.mf .btn{flex:1;justify-content:center;min-width:100px}
@media(max-width:600px){
  .mo{padding:0;align-items:stretch}
  .ml{max-width:100%;max-height:100vh;border-radius:0;height:100vh}
  .mh{padding:14px 16px 4px;position:sticky;top:0;background:var(--s);z-index:2;border-bottom:1px solid var(--bl)}
  .mb{padding:16px}
  .mf{padding:12px 16px;position:sticky;bottom:0;background:var(--s);z-index:2}
}
@keyframes fi{from{opacity:0}to{opacity:1}}@keyframes su{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

.sb-w{position:relative;display:flex;align-items:center;flex:1;min-width:0}
.sb-w input{padding:9px 12px 9px 34px;border:1px solid var(--b);border-radius:8px;font-size:13px;width:100%;font-family:var(--fb);background:var(--s)}
.sb-w input:focus{outline:none;border-color:var(--g)}
.sb-w .ic{position:absolute;left:10px;color:var(--t3);display:flex}

.tabs{display:flex;gap:0;border-bottom:1px solid var(--b);margin-bottom:18px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.tab{padding:10px 14px;font-size:12.5px;font-weight:500;color:var(--t3);cursor:pointer;border:none;background:none;font-family:var(--fb);position:relative;transition:color .15s;white-space:nowrap;flex-shrink:0}
.tab:hover,.tab:active{color:var(--t)}
.tab.active{color:var(--g);font-weight:600}
.tab.active::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;background:var(--g);border-radius:2px 2px 0 0}

.empty{text-align:center;padding:52px 20px;color:var(--t3)}.empty p{font-size:13px;max-width:260px;margin:0 auto 14px;line-height:1.5}

.bar-chart{display:flex;align-items:flex-end;gap:5px;height:110px;padding-top:8px}.bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}.bar{width:100%;border-radius:4px 4px 0 0;transition:height .4s ease;min-height:2px}.bar-label{font-size:9.5px;color:var(--t3);font-weight:500}

.ar{display:flex;gap:3px}.ab{background:none;border:none;cursor:pointer;color:var(--t3);padding:6px;border-radius:4px;display:flex;transition:all .15s;min-width:30px;min-height:30px;align-items:center;justify-content:center}
.ab:hover,.ab:active{color:var(--g);background:var(--gl)}
.ab.dng:hover{color:var(--r);background:var(--rl)}

.img-up{width:100%;aspect-ratio:16/10;border:2px dashed var(--b);border-radius:var(--rd);display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;position:relative;transition:border-color .15s;background:var(--bg)}
.img-up:hover{border-color:var(--g)}
.img-up img{width:100%;height:100%;object-fit:cover}
.img-up .pht{display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--t3);font-size:12px}
.img-up .rm{position:absolute;top:8px;right:8px;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;opacity:1;transition:opacity .15s}
.ith{width:36px;height:36px;border-radius:6px;object-fit:cover;background:var(--bg);border:1px solid var(--bl)}

.pl{border:1px solid var(--bl);border-radius:8px;overflow:hidden;margin-top:8px}
.pe{display:flex;align-items:center;gap:8px;padding:9px 11px;font-size:12px;border-bottom:1px solid var(--bl);flex-wrap:wrap}
.pe:last-child{border-bottom:none}
.pe .amt{font-weight:700;color:var(--g);margin-left:auto;white-space:nowrap}

.inv-preview{background:var(--s);border:1px solid var(--b);border-radius:var(--rl2);padding:24px;max-width:580px;margin:0 auto}
@media(max-width:480px){.inv-preview{padding:18px}}
.inv-parties{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:22px;font-size:12.5px}
@media(max-width:480px){.inv-parties{grid-template-columns:1fr;gap:12px}}
.inv-label{font-weight:700;font-size:10.5px;text-transform:uppercase;letter-spacing:.5px;color:var(--t3);margin-bottom:4px}
.inv-table{width:100%;margin-bottom:18px;font-size:12px}
.inv-table th{background:var(--bg);font-size:10.5px;padding:7px 8px}
.inv-table td{padding:7px 8px;font-size:12px;border-bottom:1px solid var(--bl)}
.inv-total{text-align:right;min-width:190px}
.inv-tl{display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px}
.inv-tl.grand{font-weight:700;font-size:15px;border-top:2px solid var(--t);padding-top:8px;margin-top:4px}
.bk-box{margin-top:18px;padding:14px;background:var(--gl);border-radius:8px;font-size:12.5px}
.bk-title{font-weight:700;font-size:10.5px;text-transform:uppercase;letter-spacing:.5px;color:var(--g);margin-bottom:6px}
.bk-row{display:flex;justify-content:space-between;padding:2px 0;gap:10px}
.bk-row .lbl{color:var(--t2)}
.bk-row .val{font-weight:600;word-break:break-all;text-align:right}

/* Storefront styles */
.shop-wrap{min-height:100vh;background:var(--bg)}
.shop-header{background:var(--s);border-bottom:1px solid var(--b);padding:20px}
.shop-header-in{max-width:960px;margin:0 auto}
.shop-bn{font-family:var(--fm);font-size:22px;font-weight:700;margin-bottom:6px;line-height:1.2}
@media(max-width:480px){.shop-bn{font-size:18px}}
.shop-about{color:var(--t2);font-size:14px;line-height:1.5;max-width:600px}
.shop-content{max-width:960px;margin:0 auto;padding:20px 16px 120px}
.shop-tabs{display:flex;gap:4px;margin-bottom:18px;background:var(--sh);padding:4px;border-radius:10px;width:fit-content;max-width:100%;overflow-x:auto}
.shop-tab{padding:9px 18px;border:none;background:none;font-family:var(--fb);font-size:13px;font-weight:600;color:var(--t2);cursor:pointer;border-radius:7px;transition:all .15s;white-space:nowrap}
.shop-tab.active{background:var(--s);color:var(--t);box-shadow:0 1px 3px rgba(0,0,0,.06)}
.shop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
@media(max-width:480px){.shop-grid{grid-template-columns:1fr 1fr;gap:10px}}
.shop-card{background:var(--s);border:1px solid var(--b);border-radius:var(--rl2);overflow:hidden;cursor:pointer;transition:all .15s}
.shop-card:hover,.shop-card:active{border-color:var(--g);transform:translateY(-2px)}
.shop-img{width:100%;aspect-ratio:1;object-fit:cover;background:var(--sh);display:flex;align-items:center;justify-content:center;color:var(--t3)}
.shop-body{padding:12px}
.shop-name{font-weight:600;font-size:13.5px;margin-bottom:4px;line-height:1.3}
.shop-desc{font-size:11.5px;color:var(--t3);line-height:1.4;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.shop-price{font-family:var(--fm);font-size:14px;font-weight:700;color:var(--g)}
.shop-type{display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--t3);margin-bottom:4px}
.cart-bar{position:fixed;bottom:0;left:0;right:0;background:var(--sb);color:#fff;padding:14px 16px;z-index:50;animation:slideUp .3s ease;box-shadow:0 -2px 12px rgba(0,0,0,.15)}
.cart-bar-in{max-width:960px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:12px}
.cart-info{font-size:13px}
.cart-info b{font-family:var(--fm);font-size:16px;display:block;margin-top:2px}
.cart-btn{background:var(--g);color:#fff;padding:13px 20px;border:none;border-radius:8px;font-weight:700;font-size:13.5px;cursor:pointer;font-family:var(--fb);display:flex;align-items:center;gap:6px;min-height:46px}
.cart-btn:hover{background:var(--gh)}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}

.cart-list{max-height:45vh;overflow-y:auto;margin:-6px -20px 12px;padding:0 20px}
.cart-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bl)}
.cart-item:last-child{border-bottom:none}
.cart-item-img{width:48px;height:48px;border-radius:6px;object-fit:cover;background:var(--sh);flex-shrink:0;display:flex;align-items:center;justify-content:center}
.cart-item-info{flex:1;min-width:0}
.cart-item-name{font-size:13px;font-weight:600;margin-bottom:2px;word-wrap:break-word}
.cart-item-price{font-size:11.5px;color:var(--t2)}
.qty-ctrl{display:flex;align-items:center;gap:6px;flex-shrink:0}
.qty-btn{width:32px;height:32px;border:1px solid var(--b);background:var(--s);border-radius:6px;cursor:pointer;font-weight:700;display:flex;align-items:center;justify-content:center;color:var(--t2);font-size:16px}
.qty-btn:hover,.qty-btn:active{color:var(--g);border-color:var(--g)}
.qty-val{min-width:22px;text-align:center;font-weight:600;font-size:14px}

.order-wrap{min-height:100vh;background:var(--bg);padding:20px 12px}
.order-card{max-width:560px;margin:0 auto;background:var(--s);border:1px solid var(--b);border-radius:var(--rl2);overflow:hidden}
.order-head{padding:24px 22px 16px;background:linear-gradient(180deg,var(--gl),var(--s))}
.order-biz{font-family:var(--fm);font-size:18px;font-weight:700;margin-bottom:4px;line-height:1.2}
.order-num{font-family:var(--fm);font-size:11px;color:var(--t3);letter-spacing:1px}
.order-body{padding:20px 22px}
.stepper{display:flex;align-items:center;gap:4px;margin:20px 0 24px}
.step{flex:1;height:4px;background:var(--b);border-radius:2px;transition:background .3s}
.step.done{background:var(--g)}
.step.current{background:var(--am)}
.status-big{text-align:center;padding:16px;background:var(--gl);border-radius:10px;margin-bottom:20px}
.status-big .sl{margin-bottom:4px}
.status-big .sv{font-size:16px;color:var(--g)}
.sect{border-top:1px solid var(--bl);padding-top:16px;margin-top:16px}
.sect-title{font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--t3);margin-bottom:10px}
.sect-line{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;gap:10px}
.sect-line .k{color:var(--t2);flex-shrink:0}
.sect-line .v{font-weight:600;text-align:right;word-break:break-word;min-width:0}
.action-btn-wrap{padding:20px 22px;background:var(--sh);border-top:1px solid var(--bl)}
.big-btn{width:100%;padding:15px;background:var(--g);color:#fff;border:none;border-radius:10px;font-family:var(--fb);font-size:14.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;min-height:52px}
.big-btn:hover{background:var(--gh)}.big-btn:disabled{opacity:.5;cursor:not-allowed}
.bank-box-lg{margin-top:16px;padding:16px;background:var(--gl);border-radius:10px;font-size:13px}
.bank-box-lg .bank-title{font-weight:700;font-size:10.5px;text-transform:uppercase;letter-spacing:.5px;color:var(--g);margin-bottom:8px}
.bank-box-lg .bank-row{display:flex;justify-content:space-between;padding:4px 0;gap:10px;align-items:center}
.bank-box-lg .lbl{color:var(--t2);flex-shrink:0}
.bank-box-lg .val{font-weight:700;font-family:var(--fm);text-align:right;word-break:break-all}

.copy-btn{display:inline-flex;align-items:center;gap:4px;background:none;border:none;color:var(--g);font-size:11px;font-weight:600;cursor:pointer;padding:4px 8px;border-radius:4px;font-family:var(--fb);min-height:28px}
.copy-btn:hover,.copy-btn:active{background:var(--gl)}

.share-link{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg);border:1px solid var(--b);border-radius:8px;font-family:var(--fm);font-size:11.5px;margin-bottom:10px;overflow-x:auto}
.share-link code{flex:1;white-space:nowrap}

::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#cdc9c0;border-radius:3px}

/* Show cards on mobile, tables on desktop */
@media(max-width:768px){
  .tw{display:none}
  .mcards{display:block}
}
`;
