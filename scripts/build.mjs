import {cp, mkdir, rm, writeFile} from 'node:fs/promises';
const files = ['index.html','club.html','academy.css','academy.js','booking.js','booking-admin.html','booking-admin.js','style.css','club.css','club-ui.js','sw.js','manifest.json','icon-192.png','icon-512.png','assets'];
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for (const file of files) await cp(file,`dist/${file}`,{recursive:true});
// Keep deployment tooling and tests out of the public artifact. Existing CNAME is untouched.
await writeFile('dist/_headers', '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/sw.js\n  Cache-Control: no-cache\n/*.html\n  Cache-Control: no-cache\n');
console.log(`Cloudflare Pages static artifact ready: dist/ (${files.length} entries)`);

await writeFile('dist/_routes.json', JSON.stringify({version:1,include:['/api/*'],exclude:[]},null,2)+'\n');
