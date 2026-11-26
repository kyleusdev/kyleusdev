import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
const projects=JSON.parse(readFileSync("portfolio/projects.json","utf8"));
function renderCards(projects,dark){
 const t=dark?{bg:"#1b1b1b",panel:"#2a2a2a",hero:"#d4d4d4",heroInk:"#171717",fg:"#e2e2e2",muted:"#b9b9b9",line:"#404040"}:{bg:"#f5f5f5",panel:"#e6e6e6",hero:"#343434",heroInk:"#ffffff",fg:"#1b1b1b",muted:"#555555",line:"#cccccc"};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
 const icons={RT:"M3 5h18v12H3z M8 21h8 M12 17v4 M7 12l3-3 3 3 4-4",RV:"M12 2l9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10",CS:"M12 2v5 M12 17v5 M2 12h5 M17 12h5 M5 5l14 14 M19 5L5 19",RW:"M3 4h18v16H3z M3 9h18 M7 6.5h.1 M10 6.5h.1 M8 13l-2 2 2 2 M16 13l2 2-2 2",RC:"M5 8h14v11H5z M9 12h.1 M15 12h.1 M9 16h6 M12 8V4",KR:"M3 6h7l2 2h9v12H3z M7 16l4-4 3 3 2-2 3 3",KA:"M4 7h16v14H4z M3 3h18v4H3z M9 12h6",NP:"M3 4h18v16H3z M3 8h18 M7 12l3 3-3 3 M13 18h4",DB:"M3 11l18-7-4 16-5-5-3 3v-5z M9 13l8-6",DP:"M3 4h18v16H3z M3 9h18 M9 9v11 M12 13h6 M12 16h4",GH:"M8 9l-4 3 4 3 M16 9l4 3-4 3 M14 5l-4 14"};
 const icon=(key,x,y,scale,stroke)=>`<g transform="translate(${x} ${y}) scale(${scale})" stroke="${stroke}" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[key]??icons.GH}"/></g>`;
 const txt=(x,y,s,size,fill,weight=500,extra="")=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" ${extra}>${esc(s)}</text>`;
 const r=(x,y,w,h,fill,rx=19)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
 const major=["RT","RV","CS","RW"].map(id=>projects.find(p=>p[3]===id));if(major.some(x=>!x))throw Error("Missing featured project");
 const other=projects.filter(p=>!["RT","RV","CS","RW"].includes(p[3]));
 let body=txt(26,35,"Repositories / 03",24,t.fg,650)+txt(814,33,`${projects.length} REPOSITORIES`,12,t.muted,600,'text-anchor="end" letter-spacing="1.4"');
 body+=`<g class="enter" data-repository="${esc(major[0][0])}">${r(16,52,354,154,t.hero,25)}${icon("RT",270,66,3.2,t.heroInk)}${txt(34,81,"RYOKO / 01",11,t.heroInk,650,'letter-spacing="1.2"')}${txt(34,126,"Ryoko Tweaker",27,t.heroInk,750)}${txt(34,149,"Windows optimization",15,t.heroInk)}${txt(34,184,major[0][2],13,t.heroInk,600)}</g>`;
 body+=`<g class="enter" style="animation-delay:.05s" data-repository="${esc(major[1][0])}">${r(378,52,446,73,t.panel)}${icon("RV",782,67,1.05,t.fg)}${txt(396,81,"Ryoko Visuals",22,t.fg,700)}${txt(396,106,"Java / Fabric · 1.21.11",14,t.muted)}</g>`;
 for(const [i,p] of major.slice(2).entries()){const x=378+i*227;body+=`<g class="enter" style="animation-delay:${.1+i*.05}s" data-repository="${esc(p[0])}">${r(x,133,219,73,t.panel)}${icon(p[3],x+181,145,.95,t.fg)}${txt(x+16,162,i===0?"CS2 Kit":"Ryoko Web",19,t.fg,700)}${txt(x+16,185,i===0?"C++":"React / TypeScript",13,t.muted)}</g>`;}
 body+=txt(26,236,"OTHER REPOSITORIES",12,t.muted,650,'letter-spacing="1.2"');
 const h=262+Math.ceil(other.length/2)*45;
 other.forEach((p,i)=>{let x=26+(i%2)*408,y=250+Math.floor(i/2)*45;body+=`<g data-repository="${esc(p[0])}">${icon(p[3],x,y+6,.84,t.muted)}${txt(x+31,y+15,p[0],16,t.fg,600)}${txt(x+31,y+33,p[2],12.5,t.muted)}<path d="M${x} ${y+43}h380" stroke="${t.line}" opacity=".65"/></g>`;});
 return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="${h}" viewBox="0 0 840 ${h}" role="img" aria-label="${esc(projects.map(p=>p[0]).join(", "))}"><title>Repositories — Bento layout</title><style>text{font-family:system-ui,'Segoe UI',sans-serif}.enter{animation:enter .5s ease both}@keyframes enter{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style><rect width="840" height="${h}" rx="30" fill="${t.bg}"/>${body}</svg>\n`;
}
function patchReadme(s,projects){
 const names=projects.map(p=>p[0]).join(", ");
 const block=`<picture><source media="(prefers-color-scheme: dark)" srcset="portfolio/projects-dark.svg"><img src="portfolio/projects-light.svg" width="100%" alt="Repositories: ${names}"></picture>`;
 s=s.replace(/^.*srcset="portfolio\/projects-dark\.svg".*\n?/gm,"").replace(/^.*srcset="assets\/project-[^"]+-dark\.svg".*\n?/gm,"");
 s=s.replace(/(<picture><source media="\(prefers-color-scheme: dark\)" srcset="assets\/stack-dark\.svg"[^]*?<\/picture>)/,"$1\n\n"+block);
 return s.replace(/\n{3,}/g,"\n\n");
}
mkdirSync("portfolio",{recursive:true});
for(const [theme,dark] of [["dark",true],["light",false]]) writeFileSync("portfolio/projects-"+theme+".svg",renderCards(projects,dark));
const readme=readFileSync("README.md","utf8");
const updated=patchReadme(readme,projects);
if(!updated.includes('srcset="portfolio/projects-dark.svg"')) throw Error("Project insertion failed");
writeFileSync("README.md",updated);
