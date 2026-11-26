import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
const projects=JSON.parse(readFileSync("portfolio/projects.json","utf8"));
const logo=readFileSync("portfolio/ryoko-logo.base64","utf8").trim();
function renderCards(projects,dark,logo){
 const bg=dark?"#1b1b1b":"#f5f5f5",card=dark?"#2a2a2a":"#e8e8e8",fg=dark?"#e2e2e2":"#1b1b1b",muted=dark?"#c6c6c6":"#474747",chip=dark?"#d4d4d4":"#3b3b3b",ink=dark?"#000":"#fff";
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
 const icons={RC:'M5 8h14v11H5z M9 12h.1 M15 12h.1 M9 16h6 M12 8V4 M3 11v5 M21 11v5',KR:'M3 6h7l2 2h9v12H3z M7 16l4-4 3 3 2-2 3 3',KA:'M4 7h16v14H4z M3 3h18v4H3z M9 12h6',NP:'M3 4h18v16H3z M3 8h18 M7 12l3 3-3 3 M13 18h4',DB:'M3 11l18-7-4 16-5-5-3 3v-5z M9 13l8-6',DP:'M3 4h18v16H3z M3 9h18 M9 9v11 M12 13h6 M12 16h4',GH:'M8 9l-4 3 4 3 M16 9l4 3-4 3 M14 5l-4 14'};
 const h=66+Math.ceil(projects.length/2)*72;
 const cards=projects.map(([name,desc,lang,short],i)=>{
 const x=projects.length%2&&i===projects.length-1?221:16+(i%2)*410,y=54+Math.floor(i/2)*72;
 const mark=name.toLowerCase().startsWith("ryoko")?`<rect x="12" y="14" width="36" height="36" rx="11" fill="#101010"/><image x="12" y="14" width="36" height="36" clip-path="url(#logoClip)" href="data:image/jpeg;base64,${logo}"/>`:`<rect x="12" y="14" width="36" height="36" rx="12" fill="${chip}"/><g transform="translate(19 21) scale(.92)" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[short]??icons.GH}"/></g>`;
 return `<g transform="translate(${x} ${y})"><rect width="398" height="64" rx="17" fill="${card}"/><g class="enter" style="animation-delay:${Math.min(i*.04,.3)}s">${mark}<text x="60" y="26" font-size="18" font-weight="650" fill="${fg}">${esc(name)}</text><text x="60" y="46" font-size="14" fill="${muted}">${esc(lang)}</text></g></g>`;
 }).join("");
 return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="${h}" viewBox="0 0 840 ${h}" role="img" aria-label="All ${projects.length} repositories and technologies"><title>All ${projects.length} repositories and technologies</title><defs><clipPath id="logoClip"><rect x="12" y="14" width="36" height="36" rx="11"/></clipPath></defs><style>text{font-family:system-ui,'Segoe UI',sans-serif}.enter{animation:enter .4s ease both}@keyframes enter{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style><rect width="840" height="${h}" rx="26" fill="${bg}"/><text x="24" y="34" font-size="23" font-weight="700" fill="${fg}">Repositories / 03</text><text x="816" y="33" text-anchor="end" font-size="12" letter-spacing="1.5" fill="${muted}">${projects.length} REPOSITORIES</text>${cards}</svg>\n`;
}
function patchReadme(s,projects){
 const names=projects.map(p=>p[0]).join(", ");
 const block=`<picture><source media="(prefers-color-scheme: dark)" srcset="portfolio/projects-dark.svg"><img src="portfolio/projects-light.svg" width="100%" alt="Repositories: ${names}"></picture>`;
 s=s.replace(/^.*srcset="portfolio\/projects-dark\.svg".*\n?/gm,"").replace(/^.*srcset="assets\/project-[^"]+-dark\.svg".*\n?/gm,"");
 s=s.replace(/(<picture><source media="\(prefers-color-scheme: dark\)" srcset="assets\/stack-dark\.svg"[^]*?<\/picture>)/,"$1\n\n"+block);
 return s.replace(/\n{3,}/g,"\n\n");
}
mkdirSync("portfolio",{recursive:true});
for(const [theme,dark] of [["dark",true],["light",false]]) writeFileSync("portfolio/projects-"+theme+".svg",renderCards(projects,dark,logo));
const readme=readFileSync("README.md","utf8");
const updated=patchReadme(readme,projects);
if(!updated.includes('srcset="portfolio/projects-dark.svg"')) throw Error("Project insertion failed");
writeFileSync("README.md",updated);
