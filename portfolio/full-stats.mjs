import {createHash} from "node:crypto";
import {readFileSync,writeFileSync} from "node:fs";
const projects=JSON.parse(readFileSync("portfolio/projects.json","utf8"));
const primary={
  "ryoko-tweaker": "C#",
  "Ryoko-visuals-1.21.11": "Java",
  "Ryoko-CS2": "C++",
  "rustbot": "JavaScript",
  "ryoko-website": "TypeScript",
  "kyleus-resources": "Assets only",
  "kyleus-archive": "JavaScript",
  "no.peek-website-bio": "TypeScript",
  "kyleus-developer-bot": "JavaScript",
  "kyleus-dev-panel": "JavaScript",
  "kyleusdev": "JavaScript"
};
function patchStats(svg,projects,primary,live){
 const count=live?.count??projects.length;
 const entries=live?.languages??Object.entries(projects.reduce((a,p)=>{const k=primary[p[0]];if(k)a[k]=(a[k]??0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 const title=live?"Languages across accessible repositories (code bytes)":"Main stack by listed repository (project count)";
 const accent=svg.match(/<text x="28\.0" y="322\.0" fill="([^"]+)"/)?.[1]??"#c6c6c6";
 const total=entries.reduce((s,e)=>s+e[1],0);
 const rows=Math.ceil(entries.length/3);
 const height=356+rows*32+14;
 const start=svg.search(/<text x="28\.0" y="322\.0"/);
 if(start<0)throw Error("Missing stats language section");
 const repoText=/<text x="90\.0" y="238\.0"([^>]*)>[^<]*<\/text>/;
 if(!repoText.test(svg))throw Error("Missing repository count");
 let x=svg.slice(0,start).replace(repoText,`<text x="90.0" y="238.0"$1>${count}</text>`).replace(">Public repositories</text>",">Total repositories</text>").replace(/width="840" height="\d+" viewBox="0 0 840 \d+"/,`width="840" height="${height}" viewBox="0 0 840 ${height}"`).replace(/<rect width="840" height="\d+" rx="32"/,`<rect width="840" height="${height}" rx="32"`);
 x+=`<text x="28" y="322" fill="${accent}" font-size="14" font-weight="600">${esc(title)}</text>`;
 let offset=28;const shades=["#ffffff","#b8b8b8","#8f8f8f","#6e6e6e","#555555","#969696","#d4d4d4","#444444"];
 if(total>0)entries.forEach(([k,v],i)=>{let w=784*v/total;x+=`<rect x="${offset.toFixed(2)}" y="334" width="${w.toFixed(2)}" height="14" fill="${shades[i%shades.length]}"/>`;offset+=w;});
 entries.forEach(([k,v],i)=>{let xx=28+(i%3)*260,yy=375+Math.floor(i/3)*32;x+=`<circle cx="${xx+5}" cy="${yy-5}" r="5" fill="${shades[i%shades.length]}"/><text x="${xx+16}" y="${yy}" fill="${accent}" font-size="14" font-weight="500">${esc(k)} · ${live?(v/total*100).toFixed(1)+"%":v}</text>`;});
 return x+"</svg>\n";
}
function patchReadme(s,projects){
 const names=projects.map(p=>p[0]).join(", ");
 const block=`<picture><source media="(prefers-color-scheme: dark)" srcset="portfolio/clean-repositories-dark.svg"><img src="portfolio/clean-repositories-light.svg" width="100%" alt="All ${projects.length} repositories: ${names}"></picture>`;
 s=s.replace(/^.*srcset="portfolio\/(?:projects|repositories|compact-repositories|icon-repositories|clean-repositories)-dark\.svg".*\n?/gm,"").replace(/(<picture><source media="\(prefers-color-scheme: dark\)" srcset="assets\/stack-dark\.svg"[^]*?<\/picture>)/,"$1\n\n"+block);
 return s.replace(/(?:assets\/stats|portfolio\/activity)-(dark|light)\.svg/g,"portfolio/activity-$1.svg").replace(/\n{3,}/g,"\n\n");
}
async function liveStats(){
 const token=process.env.PROFILE_STATS_TOKEN;
 if(!token)return null;
 const headers={Authorization:"Bearer "+token,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"};
 async function get(path){const r=await fetch("https://api.github.com"+path,{headers});if(!r.ok)throw Error("GitHub stats HTTP "+r.status);return r.json();}
 try{
 const me=await get("/user");if(me.login.toLowerCase()!=="kyleusdev")throw Error("Stats token owner mismatch");
 const repos=[];for(let page=1;;page++){const result=await get("/user/repos?affiliation=owner&visibility=all&per_page=100&page="+page);repos.push(...result.filter(r=>r.owner.login.toLowerCase()==="kyleusdev"));if(result.length<100)break;}
 if(!projects.every(p=>repos.some(r=>r.name.toLowerCase()===p[0].toLowerCase())))throw Error("Stats token lacks access to listed repositories");
 const counts={};for(const r of repos.filter(r=>!r.fork)){const data=await get("/repos/kyleusdev/"+encodeURIComponent(r.name)+"/languages");for(const [k,v] of Object.entries(data))counts[k]=(counts[k]??0)+v;}
 const languages=Object.entries(counts).sort((a,b)=>b[1]-a[1]);return {count:repos.length,languages};
 }catch(e){console.warn("Full language stats unavailable; using listed project stacks:",e.message);return null;}
}
const live=await liveStats();
for(const theme of ["dark","light"]){writeFileSync("portfolio/clean-repositories-"+theme+".svg",readFileSync("portfolio/projects-"+theme+".svg","utf8"));writeFileSync("portfolio/intro-"+theme+".svg",readFileSync("assets/hero-"+theme+".svg","utf8"));writeFileSync("portfolio/activity-"+theme+".svg",patchStats(readFileSync("assets/stats-"+theme+".svg","utf8"),projects,primary,live));}
function patchAbout(s){
 const block='<picture><source media="(prefers-color-scheme: dark)" srcset="portfolio/about-compact-dark.svg"><img src="portfolio/about-compact-light.svg" width="100%" alt="About: Full-stack development, desktop utilities, web and game visuals."></picture>\n\n<a href="https://github.com/Ryoko-Development"><picture><source media="(prefers-color-scheme: dark)" srcset="portfolio/ryoko-brand-dark.svg"><img src="portfolio/ryoko-brand-light.svg" width="100%" alt="Ryoko Development — Founder and developer"></picture></a>';
 s=s.replace(/^.*srcset="portfolio\/(?:ryoko-org|ryoko-brand)-dark\.svg".*\n?/gm,"");
 const re=/^.*srcset="(?:assets\/about|portfolio\/about-compact)-dark\.svg".*$/m;
 if(!re.test(s))throw Error("Missing About section");
 return s.replace(re,block).replace(/\n{3,}/g,"\n\n");
}
function removeCredit(s){return s.replace(/^.*srcset="assets\/credit-dark\.svg".*\n?/gm,"").replace(/\n{3,}/g,"\n\n");}
function refreshProfileAssets(s){
 return s.replace(/((?:assets|portfolio)\/[\w-]+-(?:dark|light)\.svg)(?:\?v=[a-f0-9]+)?/g,(_,name)=>{
  const version=createHash("sha256").update(readFileSync(name)).digest("hex").slice(0,12);
  return name+"?v="+version;
 });
}
// Reapply the black palette after the upstream renderer refreshes its SVGs.
const darkPalette={"#1b1b1b":"#080808","#1f1f1f":"#0a0a0a","#242424":"#101010","#2a2a2a":"#151515","#353535":"#202020","#474747":"#262626","#424242":"#282828","#111111":"#050505","#d4d4d4":"#bdbdbd","#c6c6c6":"#a6a6a6","#919191":"#858585"};
function applyDarkPalette(readme){
 const paths=new Set([...readme.matchAll(/(?:srcset|src)="([^"?]+-dark\.svg)(?:\?[^"]*)?"/g)].map(m=>m[1]));
 for(const path of paths){
  const old=readFileSync(path,"utf8");
  let svg=old.replace(/#[0-9a-fA-F]{6}\b/g,c=>darkPalette[c.toLowerCase()]??c);
  if(path==="assets/wave-dark.svg")svg=svg.replace(/#ffffff\b/g,"#777777");
  if(svg!==old)writeFileSync(path,svg);
 }
 return readme;
}
const profileReadme=removeCredit(patchAbout(patchReadme(readFileSync("README.md","utf8"),projects))).replaceAll("assets/hero-","portfolio/intro-");
// Keep the personal caption under the avatar on every scheduled refresh.
for(const theme of ["dark","light"]){
 const path="portfolio/intro-"+theme+".svg";
 const svg=readFileSync(path,"utf8").replace(/<text id="avatar-caption"[^>]*>[^<]*<\/text>/g,"");
 const caption='<text id="avatar-caption" x="150" y="284" text-anchor="middle" fill="'+(theme==="dark"?"#a6a6a6":"#555555")+'" font-size="14" font-weight="500" letter-spacing="1.1" class="fade">new prime?</text>';
 writeFileSync(path,svg.replace("</svg>",caption+"</svg>"));
}
writeFileSync("README.md",refreshProfileAssets(applyDarkPalette(profileReadme)));
