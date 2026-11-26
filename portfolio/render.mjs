import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
const projects=JSON.parse(readFileSync("portfolio/projects.json","utf8"));
function renderCards(projects,dark){
 const bg=dark?"#1b1b1b":"#f5f5f5",card=dark?"#2a2a2a":"#e8e8e8",fg=dark?"#e2e2e2":"#1b1b1b",muted=dark?"#c6c6c6":"#474747";
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
 const h=66+Math.ceil(projects.length/2)*72;
 const cards=projects.map(([name,desc,lang],i)=>{
 const x=projects.length%2&&i===projects.length-1?221:16+(i%2)*410,y=54+Math.floor(i/2)*72;
 return `<g transform="translate(${x} ${y})"><rect width="398" height="64" rx="17" fill="${card}"/><g class="enter" style="animation-delay:${Math.min(i*.04,.3)}s"><text x="19" y="26" font-size="18" font-weight="650" fill="${fg}">${esc(name)}</text><text x="19" y="46" font-size="14" fill="${muted}">${esc(lang)}</text></g></g>`;
 }).join("");
 return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="${h}" viewBox="0 0 840 ${h}" role="img" aria-label="All ${projects.length} repositories and technologies"><title>All ${projects.length} repositories and technologies</title><style>text{font-family:system-ui,'Segoe UI',sans-serif}.enter{animation:enter .4s ease both}@keyframes enter{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style><rect width="840" height="${h}" rx="26" fill="${bg}"/><text x="24" y="34" font-size="23" font-weight="700" fill="${fg}">Repositories / 03</text><text x="816" y="33" text-anchor="end" font-size="12" letter-spacing="1.5" fill="${muted}">${projects.length} REPOSITORIES</text>${cards}</svg>\n`;
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
