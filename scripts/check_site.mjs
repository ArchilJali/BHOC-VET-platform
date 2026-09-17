import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=[];
const titles=new Set();
const descriptions=new Set();
const canonicals=new Set();

function walk(directory){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    if(entry.name.startsWith('.')||entry.name.startsWith('_')||entry.name==='node_modules')continue;
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
  assertInternationalIndexing(html,relative);
  assert.match(html,/<main\b[^>]*\bid=["'][^"']+["']/i,`${relative}: named main landmark required`);
  assert.match(html,/<a\b[^>]*\bclass=["'][^"']*skip[^"']*["'][^>]*>/i,`${relative}: skip link required`);
  assert.equal((html.match(/<h1\b/gi)||[]).length,1,`${relative}: exactly one H1 required`);
  const title=html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/&amp;/g,'&').trim()||'';
  const description=html.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=["']([^"']*)["'][^>]*>/i)?.[1]||'';
  const canonical=html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/i)?.[1]?.trim()||'';
  assert.ok(title.length>=20&&title.length<=65,`${relative}: title length ${title.length}`);
  assert.ok(description.length>=90&&description.length<=170,`${relative}: description length ${description.length}`);
  assert.ok(canonical.startsWith('https://archiljali.github.io/BHOC-VET-platform/'),`${relative}: canonical must use the public VET-platform origin`);
  assert.ok(!titles.has(title),`${relative}: title must be unique`); titles.add(title);
  assert.ok(!descriptions.has(description),`${relative}: description must be unique`); descriptions.add(description);
  assert.ok(!canonicals.has(canonical),`${relative}: canonical must be unique`); canonicals.add(canonical);
}

const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
assert.match(sitemap,/^<\?xml version="1\.0" encoding="UTF-8"\?>/,'sitemap.xml: XML declaration required');
const sitemapUrls=new Set([...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map(match=>match[1]));
assert.deepEqual([...sitemapUrls].sort(),[...canonicals].sort(),'sitemap.xml: URLs must exactly match public canonical pages');

console.log(`Passed: ${canonicals.size} indexable pages have unique search metadata, exact sitemap coverage and Yandex-only exclusion.`);

// Parse whole directive tokens: "noindex" must never satisfy an "index" check.
function indexingDirectives(source,agent){
  const head=(source.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]||'').replace(/<!--[\s\S]*?-->/g,'');
  return [...head.matchAll(/<meta\b[^>]*>/gi)].flatMap(([tag])=>{
    const name=tag.match(/\bname\s*=\s*(["'])(.*?)\1/i)?.[2]?.toLowerCase();
    if(name!==agent)return [];
    return (tag.match(/\bcontent\s*=\s*(["'])(.*?)\1/i)?.[2]||'').toLowerCase().split(/[\s,]+/).filter(Boolean);
  });
}
function assertInternationalIndexing(source,label){
  assert.ok(indexingDirectives(source,'robots').includes('index'),`${label}: explicit global index directive required`);
  for(const agent of ['robots','googlebot','bingbot','msnbot']){
    const directives=indexingDirectives(source,agent);
    assert.ok(!directives.some(value=>['noindex','none','nofollow'].includes(value)),`${label}: ${agent} must not block international search`);
  }
}
assert.throws(()=>assertInternationalIndexing('<head><meta name="robots" content="noindex,follow"></head>','negative fixture'));
assert.throws(()=>assertInternationalIndexing('<head><meta name="robots" content="index,follow"><meta name="googlebot" content="noindex"></head>','Googlebot fixture'));
assertInternationalIndexing('<head><meta name="robots" content="index,follow"><meta name="yandex" content="noindex"></head>','Yandex-only fixture');
