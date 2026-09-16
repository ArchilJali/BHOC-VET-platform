import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=[];

function walk(directory){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    if(entry.name.startsWith('.'))continue;
    const absolute=path.join(directory,entry.name);
    if(entry.isDirectory())walk(absolute);
    else if(entry.isFile()&&/\.html?$/i.test(entry.name)&&!/^google[a-z0-9]+\.html$/i.test(entry.name))pages.push(path.relative(root,absolute));
  }
}

walk(root);
assert.ok(pages.length>=3,'expected public BHOC VET-platform pages');

for(const relative of pages){
  const html=fs.readFileSync(path.join(root,relative),'utf8');
  const directives=[...html.matchAll(/<meta\b(?=[^>]*\bname=["']yandex["'])(?=[^>]*\bcontent=["']noindex["'])[^>]*>/gi)];
  assert.equal(directives.length,1,`${relative}: exactly one Yandex-only noindex directive required`);
  if(relative==='404.html'){
    assert.match(html,/<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["']noindex)/i,'404.html: noindex directive required');
    continue;
  }
  assert.match(html,/<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*index)[^>]*>/i,`${relative}: global indexing directive must remain enabled`);
  assert.match(html,/<main\b[^>]*\bid=["'][^"']+["']/i,`${relative}: named main landmark required`);
  assert.match(html,/<a\b[^>]*\bclass=["'][^"']*skip[^"']*["'][^>]*>/i,`${relative}: skip link required`);
  const title=html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/&amp;/g,'&').trim()||'';
  const description=html.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=["']([^"']*)["'][^>]*>/i)?.[1]||'';
  assert.ok(title.length>=20&&title.length<=65,`${relative}: title length ${title.length}`);
  assert.ok(description.length>=90&&description.length<=170,`${relative}: description length ${description.length}`);
}

console.log(`Passed: ${pages.length} public HTML pages block Yandex while preserving global indexing.`);
