const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const seedIncidents = [
 {id:"INC-20261028-001",line:"Line A",model:"TDPS800",station:"I2C1",issue:"Calibration Fail",team:"TE",status:"In Progress",reported:"10:24",impact:"Line stopped",details:"Product moved from previous line; calibration status needs verification.",rootCause:"Calibration not completed at I2C1",action:"Verify calibration program and re-run calibration.",history:[["Incident reported","10:24 AM"],["Assigned to TE","10:26 AM"],["Work started","10:31 AM"]]},
 {id:"INC-20261028-002",line:"Line B",model:"TDPS900",station:"HIPOT",issue:"Pin Fail / GB HIGH",team:"PE",status:"Acknowledged",reported:"09:12",impact:"Reduced output",details:"Possible poor contact between test pin and workpiece.",rootCause:"Pin contact condition under investigation",action:"Inspect pin condition and contact pressure.",history:[["Incident reported","09:12 AM"],["Assigned to PE","09:14 AM"],["Acknowledged by PE","09:18 AM"]]},
 {id:"INC-20261028-003",line:"Line C",model:"TDPS800",station:"Flash",issue:"Firmware Mismatch",team:"AE",status:"Resolved",reported:"08:45",impact:"Single unit",details:"Firmware version did not match the expected sample configuration.",rootCause:"Firmware package mismatch",action:"Load the approved firmware and verify the version.",history:[["Incident reported","08:45 AM"],["Assigned to AE","08:47 AM"],["Marked resolved","09:45 AM"]]},
 {id:"INC-20261028-004",line:"Line A",model:"TDPS900",station:"Final Test",issue:"No Communication",team:"ME",status:"Acknowledged",reported:"07:32",impact:"Line stopped",details:"Communication dropped during final test.",rootCause:"Under investigation",action:"Check connector, cable and fixture condition.",history:[["Incident reported","07:32 AM"],["Assigned to ME","07:36 AM"]]},
 {id:"INC-20261028-005",line:"Line B",model:"TDPS800",station:"I2C2",issue:"Voltage Out of Range",team:"TE",status:"Open",reported:"06:18",impact:"Line stopped",details:"Voltage measurement is outside the expected range.",rootCause:"Not yet identified",action:"Pending initial check.",history:[["Incident reported","06:18 AM"]]}
];
let incidents = seedIncidents.map(x=>({...x,history:x.history.map(h=>[...h])}));
let xp = 320, points = 1250, badges = 3, reportsToday = 2, assignmentsToday = 1, rootCausesToday = 1, resolvedToday = 0;
let currentIncidentId = null, currentPage = "home", statusFilter = "all";
const iconRefresh = () => { if(window.lucide) lucide.createIcons(); };
const statusClass = s => ({Open:"open",Acknowledged:"ack","In Progress":"progress",Resolved:"resolved"}[s]||"open");
const dotClass = s => ({Open:"red",Acknowledged:"blue","In Progress":"orange",Resolved:"green"}[s]||"red");
const teamClass = t => `team-${t}`;
function toast(message, icon="check-circle-2"){
  const el=document.createElement("div");el.className="toast";el.innerHTML=`<i data-lucide="${icon}"></i><span>${message}</span>`;$("#toast-region").append(el);iconRefresh();setTimeout(()=>{el.style.opacity="0";el.style.transform="translateY(8px)";setTimeout(()=>el.remove(),220)},3200);
}
function showPage(page){
  currentPage=page;
  $$(".page-view").forEach(v=>v.classList.add("hidden"));
  const target=$(`#${page}-view`); if(target)target.classList.remove("hidden");
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  $("#page-heading").textContent=({home:"Dashboard",incidents:"Incident Board",tasks:"My Tasks",analytics:"Analytics",quests:"Quest & Rewards"}[page]||"Dashboard");
  $("#sidebar").classList.remove("mobile-open");
  if(page==="incidents")renderIncidentCards();
  if(page==="tasks")renderTasks();
  if(page==="quests")renderQuests();
  iconRefresh();window.scrollTo({top:0,behavior:"smooth"});
}
function updateProgress(){
  $("#side-xp").textContent=xp;$("#hero-xp").textContent=xp;$("#quest-xp").textContent=xp;$("#hero-total-xp").textContent=xp;
  $("#side-xp-bar").style.width=Math.min(100,xp/600*100)+"%";$("#hero-xp-bar").style.width=Math.min(100,xp/600*100)+"%";$("#quest-xp-bar").style.width=Math.min(100,xp/600*100)+"%";
  $("#hero-points").textContent=points.toLocaleString();$("#quest-points").textContent=points.toLocaleString();$("#hero-badges").textContent=badges;
}
function addXP(amount,reason){xp+=amount;points+=Math.round(amount/2);updateProgress();toast(`+${amount} XP · ${reason}`,"sparkles");}
function statusTag(s){return `<span class="status-tag ${statusClass(s)}">${s}</span>`}
function renderTable(){
 const q=($("#incident-search")?.value||"").toLowerCase();
 let rows=incidents.filter(i=>`${i.id} ${i.line} ${i.model} ${i.station} ${i.issue} ${i.team} ${i.status}`.toLowerCase().includes(q));
 if(statusFilter!=="all")rows=rows.filter(i=>i.status===statusFilter);
 $("#incident-rows").innerHTML=rows.map(i=>`<tr data-open="${i.id}"><td><span class="inc-id"><i class="status-dot ${dotClass(i.status)}"></i>${i.id}</span><small class="inc-sub">${i.line} / ${i.model}</small></td><td>${i.line} / ${i.model}</td><td><b>${i.station}</b></td><td>${i.issue}</td><td><span class="team-tag ${teamClass(i.team)}">${i.team}</span></td><td>${statusTag(i.status)}</td><td>${i.reported}</td><td class="row-arrow"><i data-lucide="chevron-right"></i></td></tr>`).join("");
 $("#table-count").textContent=`Showing ${rows.length} of ${incidents.length} sample incidents`;
 $("#metric-open").textContent=incidents.filter(i=>i.status!=="Resolved").length;
 $("#task-count").textContent=incidents.filter(i=>i.status!=="Resolved").length;
 $("#board-summary").innerHTML=[
  ["alert-circle","Open incidents",incidents.filter(i=>i.status==="Open").length],
  ["clock-3","Awaiting acknowledgement",incidents.filter(i=>i.status==="Acknowledged").length],
  ["wrench","In progress",incidents.filter(i=>i.status==="In Progress").length],
  ["check-circle-2","Resolved",incidents.filter(i=>i.status==="Resolved").length]
 ].map((s,n)=>`<div class="board-stat"><span><i data-lucide="${s[0]}"></i></span><div><small>${s[1]}</small><strong>${s[2]}</strong></div></div>`).join("");
 iconRefresh();
}
function renderIncidentCards(){
 const status=$("#board-status")?.value||"all",team=$("#board-team")?.value||"all";
 const rows=incidents.filter(i=>(status==="all"||i.status===status)&&(team==="all"||i.team===team));
 $("#incident-card-list").innerHTML=rows.length?rows.map(i=>`<article class="incident-card"><div><h3><i class="status-dot ${dotClass(i.status)}"></i> ${i.id} · ${i.issue}</h3><p>${i.line} / ${i.model} · Reported ${i.reported}</p></div><div class="card-meta"><span>Station <strong>${i.station}</strong></span><span>Team <span class="team-tag ${teamClass(i.team)}">${i.team}</span></span></div><div>${statusTag(i.status)}<p>${i.impact}</p></div><div class="incident-card-actions"><button class="small-action" data-open="${i.id}">Details</button><button class="small-action" data-next="${i.id}">${i.status==="Resolved"?"Reopen":"Update status"}</button></div></article>`).join(""):`<div class="empty-state"><i data-lucide="inbox"></i>No incidents match these filters.</div>`;
 renderTable();iconRefresh();
}
function renderTasks(){
 const rows=incidents.filter(i=>i.status!=="Resolved");
 $("#task-cards").innerHTML=rows.length?rows.map(i=>`<article class="task-card"><div class="task-card-top"><h3>${i.issue}</h3>${statusTag(i.status)}</div><p>${i.id} · ${i.line} / ${i.model}</p><div class="task-meta"><span><b>Station:</b> ${i.station}</span><span><b>Team:</b> ${i.team}</span><span><b>Impact:</b> ${i.impact}</span></div><p>${i.details||"No initial notes provided."}</p><div class="task-actions"><button class="primary-button" data-open="${i.id}"><i data-lucide="file-text"></i> View case</button><button class="secondary-button" data-next="${i.id}"><i data-lucide="arrow-right"></i> Update status</button></div></article>`).join(""):`<div class="empty-state"><i data-lucide="check-circle-2"></i>All caught up — no active tasks.</div>`;
 iconRefresh();
}
const questData=()=>[
 {icon:"clipboard-list",cls:"quest-blue",title:"Report 3 incidents",desc:"Create 3 incident reports today",count:reportsToday,target:3,xp:100},
 {icon:"users",cls:"quest-indigo",title:"Call the right team",desc:"Assign TE / PE / AE / ME 2 times",count:assignmentsToday,target:2,xp:100},
 {icon:"wrench",cls:"quest-teal",title:"Record root cause",desc:"Add root cause and corrective action",count:rootCausesToday,target:2,xp:150},
 {icon:"check-check",cls:"quest-purple",title:"Close the loop",desc:"Resolve 1 incident with a clear note",count:resolvedToday,target:1,xp:200}
];
function renderQuests(){
 const qs=questData();
 $("#all-quests-grid").innerHTML=qs.map(q=>`<article class="all-quest-card"><div class="quest-icon ${q.cls}"><i data-lucide="${q.icon}"></i></div><div class="quest-body"><div class="quest-title">${q.title}</div><p>${q.desc}</p><div class="quest-progress"><span style="width:${Math.min(100,q.count/q.target*100)}%"></span></div><small>${Math.min(q.count,q.target)} / ${q.target} complete</small></div><div class="quest-reward">✦ <b>+${q.xp}</b><small>XP</small></div></article>`).join("");
 $("#quest-list").innerHTML=qs.map(q=>`<article class="quest-item"><div class="quest-icon ${q.cls}"><i data-lucide="${q.icon}"></i></div><div class="quest-body"><div class="quest-title">${q.title}</div><p>${q.desc}</p><div class="quest-progress"><span style="width:${Math.min(100,q.count/q.target*100)}%"></span></div><small>${Math.min(q.count,q.target)} / ${q.target} complete</small></div><div class="quest-reward">✦ <b>+${q.xp}</b><small>XP</small></div></article>`).join("");
 iconRefresh();
}
function openDetail(id){
 const i=incidents.find(x=>x.id===id);if(!i)return;currentIncidentId=id;
 $("#detail-title").textContent=i.id;$("#detail-subtitle").textContent=`${i.line} / ${i.model} · ${i.station} · ${i.issue}`;
 $("#detail-content").innerHTML=`<div class="detail-grid"><div class="detail-cell"><small>Status</small><strong>${statusTag(i.status)}</strong></div><div class="detail-cell"><small>Assigned team</small><strong><span class="team-tag ${teamClass(i.team)}">${i.team}</span></strong></div><div class="detail-cell"><small>Reported at</small><strong>${i.reported}</strong></div><div class="detail-cell"><small>Production impact</small><strong>${i.impact}</strong></div><div class="detail-cell"><small>Line / Model</small><strong>${i.line} / ${i.model}</strong></div><div class="detail-cell"><small>Failing station</small><strong>${i.station}</strong></div></div><div class="detail-notes"><h3>Initial details</h3><p>${escapeHTML(i.details||"No details supplied.")}</p></div><div class="detail-notes"><h3>Root cause & corrective action</h3><p><b>Root cause:</b> ${escapeHTML(i.rootCause||"Not yet identified")}<br><b>Action:</b> ${escapeHTML(i.action||"Pending investigation")}</p></div><div class="timeline"><b>Case timeline</b>${i.history.map(h=>`<div class="timeline-item"><b>${escapeHTML(h[0])}</b><small>${escapeHTML(h[1])}</small></div>`).join("")}</div>`;
 $("#detail-actions").innerHTML=`<button class="secondary-button" data-close="detail-modal">Close</button><button class="secondary-button" data-edit="${i.id}"><i data-lucide="pencil"></i> Add root cause</button><button class="primary-button" data-next="${i.id}"><i data-lucide="arrow-right-circle"></i> Update status</button>`;
 $("#detail-modal").showModal();iconRefresh();
}
function escapeHTML(str){return String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function nextStatus(id){
 const i=incidents.find(x=>x.id===id);if(!i)return;
 const seq=["Open","Acknowledged","In Progress","Resolved"];i.status=seq[(seq.indexOf(i.status)+1)%seq.length];
 const time=new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
 i.history.push([`Status updated to ${i.status}`,time]);
 if(i.status==="Acknowledged"){assignmentsToday++;addXP(10,"Support call acknowledged");}
 if(i.status==="Resolved"){resolvedToday++;addXP(50,"Incident resolved");}
 renderTable();renderIncidentCards();renderTasks();renderQuests();
 if($("#detail-modal").open)openDetail(id);
 toast(`${id} → ${i.status}`,"refresh-cw");
}
function editRootCause(id){
 const i=incidents.find(x=>x.id===id);if(!i)return;
 const cause=prompt("Enter root cause (demo):",i.rootCause||"");
 if(cause===null)return;
 const action=prompt("Enter corrective action (demo):",i.action||"");
 if(action===null)return;
 i.rootCause=cause.trim()||"Not yet identified";i.action=action.trim()||"Pending investigation";
 i.history.push(["Root cause / corrective action updated",new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})]);
 rootCausesToday++;addXP(30,"Root cause documented");renderTable();renderIncidentCards();renderTasks();renderQuests();openDetail(id);
}
function reportIncident(data){
 const id=`INC-20261028-${String(incidents.length+1).padStart(3,"0")}`;
 const now=new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
 const i={id,line:data.get("line"),model:data.get("model"),station:data.get("station"),issue:data.get("issue").trim(),team:data.get("team"),status:"Open",reported:now,impact:data.get("impact"),details:data.get("details").trim()||"No initial details supplied.",rootCause:"Not yet identified",action:"Pending initial investigation",history:[["Incident reported",now]]};
 incidents.unshift(i);reportsToday++;renderTable();renderIncidentCards();renderTasks();renderQuests();addXP(25,"Incident reported");toast(`Created ${id} · ${i.team} support requested`,"siren");showPage("incidents");
}
document.addEventListener("click",e=>{
 const page=e.target.closest("[data-page]");if(page){e.preventDefault();showPage(page.dataset.page);return;}
 const action=e.target.closest("[data-action]");if(action?.dataset.action==="report"){$("#report-modal").showModal();return;}
 const close=e.target.closest("[data-close]");if(close){document.getElementById(close.dataset.close)?.close();return;}
 const open=e.target.closest("[data-open]");if(open){openDetail(open.dataset.open);return;}
 const next=e.target.closest("[data-next]");if(next){nextStatus(next.dataset.next);return;}
 const edit=e.target.closest("[data-edit]");if(edit){editRootCause(edit.dataset.edit);return;}
});
$("#report-form").addEventListener("submit",e=>{e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;reportIncident(new FormData(form));form.reset();$("#report-modal").close();});
$("#incident-search").addEventListener("input",renderTable);
$("#filter-button").addEventListener("click",()=>{const opts=["all","Open","Acknowledged","In Progress","Resolved"];const labels=["All status","Open","Acknowledged","In Progress","Resolved"];statusFilter=opts[(opts.indexOf(statusFilter)+1)%opts.length];$("#filter-button").innerHTML=`<i data-lucide="list-filter"></i> ${labels[opts.indexOf(statusFilter)]} <i data-lucide="chevron-down"></i>`;renderTable();});
$("#board-status").addEventListener("change",renderIncidentCards);$("#board-team").addEventListener("change",renderIncidentCards);
$("#notifications-button").addEventListener("click",()=>$("#notifications-modal").showModal());
$("#mobile-menu").addEventListener("click",()=>$("#sidebar").classList.toggle("mobile-open"));
$("#user-menu").addEventListener("click",()=>toast("Signed in as Somchai Jai Dee · Demo role: Line Leader","user-round"));
$("#activity-more").addEventListener("click",()=>toast("Activity feed is sample data in this prototype.","activity"));
$("#chart-range").addEventListener("click",()=>toast("Chart range selector is a visual demo; data is static.","chart-no-axes-combined"));
$("#report-modal").addEventListener("click",e=>{if(e.target===$("#report-modal"))$("#report-modal").close();});
$("#detail-modal").addEventListener("click",e=>{if(e.target===$("#detail-modal"))$("#detail-modal").close();});
renderTable();renderIncidentCards();renderTasks();renderQuests();updateProgress();iconRefresh();
