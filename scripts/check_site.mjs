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
  assert.match(html,/<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*index)[^>]*>/i,`${relative}: global indexing directive must remain enabled`);
}

console.log(`Passed: ${pages.length} public HTML pages block Yandex while preserving global indexing.`);
