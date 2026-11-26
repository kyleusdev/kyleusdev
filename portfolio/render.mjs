import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
const projects=JSON.parse(readFileSync("portfolio/projects.json","utf8"));
function renderCards(projects,dark){
 const bg=dark?"#1b1b1b":"#f5f5f5",card=dark?"#2a2a2a":"#e8e8e8",fg=dark?"#e2e2e2":"#1b1b1b",muted=dark?"#c6c6c6":"#474747",chip=dark?"#d4d4d4":"#3b3b3b",ink=dark?"#000":"#fff";
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));
 const h=90+Math.ceil(projects.length/2)*160;
 const cards=projects.map(([name,desc,lang,short],i)=>{const x=projects.length%2&&i===projects.length-1?221:16+(i%2)*410,y=72+Math.floor(i/2)*160;return `<g transform="translate(${x} ${y})"><rect width="398" height="148" rx="26" fill="${card}"/><g class="enter" style="animation-delay:${Math.min(i*.06,.48)}s"><rect x="18" y="18" width="42" height="42" rx="15" fill="${chip}"/><text x="39" y="44" text-anchor="middle" font-size="14" font-weight="700" fill="${ink}">${esc(short)}</text><text x="74" y="44" font-size="${name.length>19?20:22}" font-weight="700" fill="${fg}">${esc(name)}</text><text x="20" y="87" font-size="16" fill="${muted}">${esc(desc)}</text><rect x="18" y="104" width="${Math.min(350,lang.length*9+26)}" height="30" rx="15" fill="${bg}"/><text x="31" y="124" font-size="14" font-weight="600" fill="${fg}">${esc(lang)}</text></g></g>`}).join("");
 return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="${h}" viewBox="0 0 840 ${h}" role="img" aria-label="All ${projects.length} repositories and technologies"><title>All ${projects.length} repositories and technologies</title><style>text{font-family:system-ui,'Segoe UI',sans-serif}.enter{animation:enter .65s ease both}@keyframes enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style><rect width="840" height="${h}" rx="32" fill="${bg}"/><text x="28" y="45" font-size="25" font-weight="700" fill="${fg}">Repositories / 03</text><text x="810" y="44" text-anchor="end" font-size="13" letter-spacing="2" fill="${muted}">${projects.length} REPOSITORIES</text>${cards}</svg>\n`;
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
