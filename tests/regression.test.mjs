import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
const read = file => readFileSync(file,'utf8').replaceAll('\r\n','\n');
const club = read('club.html');
const scriptBodies = html => [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match=>match[1]).filter(Boolean);

test('existing Firebase and all business scripts are preserved',()=>{
  const base = execFileSync('git',['show','23418a436c4e46563a03719558abe3ed3c45de1d:index.html'],{encoding:'utf8'}).replaceAll('\r\n','\n');
  const bodies = scriptBodies(club).map(body=>body.replace("    window.dispatchEvent(new CustomEvent('club:pagechange', { detail: { pageId } }));\n",''));
  const normalize = body => body.replace(/\/\/ 모바일 제스처\(핀치 줌, 더블 탭 확대\)[\s\S]*?(?=\/\/ 서비스 워커 등록)/, '').replace('// 브라우저 확대 제스처를 허용합니다.\n\n', '');
  assert.deepEqual(bodies.map(normalize),scriptBodies(base).map(normalize));
  assert.equal(read('CNAME'),'sparringclub.kr');
});
test('classic scripts parse; all prior pages and hooks remain available',()=>{
  scriptBodies(club).filter(body=>!body.includes('import {')).forEach(body=>new vm.Script(body));
  for(const file of ['academy.js','club-ui.js','booking.js','booking-admin.js','sw.js']) new vm.Script(read(file));
  for(const id of ['dashboard','players','gyms','board','record','post-detail','admin-dashboard','loginModal','matchReqModal','matchStatusModal','tier-container','feed-container','new-member-list','community-list','gym-list-container']) assert.ok(club.includes(`id="${id}"`),id);
  assert.equal([...club.matchAll(/id="cb-youtube-link"/g)].length,1);
});
test('root bookmarks and post shares route to the retained club entry',()=>{
  const routing = read('academy.js').split('const menuToggle')[0];
  const browser = {window:{matchMedia:()=>({matches:false})},navigator:{}};
  for(const [hash,search] of [['#players',''],['#board',''],['#record',''],['#modal-loginModal',''],['','?postId=901']]){
    let result;
    vm.runInNewContext(routing,{...browser,location:{hash,search,replace:value=>result=value},URLSearchParams});
    assert.equal(result,`club.html${search}${hash}`);
  }
  let result; vm.runInNewContext(routing,{...browser,location:{hash:'#programs',search:'',replace:value=>result=value},URLSearchParams});assert.equal(result,undefined);
  vm.runInNewContext(routing,{window:{matchMedia:()=>({matches:true})},navigator:{},location:{hash:'',search:'',replace:value=>result=value},URLSearchParams});assert.equal(result,'club.html');
});
test('official contact override is applied to every academy telephone link',()=>{
  const html=read('index.html');
  const phones=[...html.matchAll(/href="(tel:[^"]+)"/g)].map(match=>match[1]);
  assert.ok(phones.length>=4);assert.ok(phones.every(phone=>phone==='tel:0637176433'));
  assert.ok(!html.includes('0507-1393-6433'));
});
test('all academy marks use the supplied artwork instead of the temporary BA emblem',()=>{
  const html=read('index.html');
  assert.equal([...html.matchAll(/class="academy-logo"/g)].length,3);
  assert.ok(!html.includes('class="brand-emblem"'));
  assert.ok(html.includes('href="assets/academy-logo.png"'));
  assert.ok(!html.includes('Unsplash'));
  assert.ok(club.includes('assets/academy-logo.png'));
});
test('PWA precache only lists available public files and retains push events',()=>{
  const callbacks={};let assets;
  vm.runInNewContext(read('sw.js'),{self:{addEventListener:(name,cb)=>callbacks[name]=cb,skipWaiting(){},location:{origin:'https://example.test'},clients:{claim(){}}},caches:{open:async()=>({addAll:files=>{assets=files;return Promise.resolve();}})},URL,Set});
  return new Promise(resolve=>callbacks.install({waitUntil:async task=>{await task;resolve();}})).then(()=>{
    assert.ok(assets.every(file=>file==='/' || existsSync('.'+file)),assets?.join(', '));
    assert.ok(assets.includes('/club.html'));assert.ok(assets.includes('/academy.js'));
    assert.ok(callbacks.push);assert.ok(callbacks.notificationclick);
  });
});
test('PWA navigation fallback uses the correct page and excludes remote or private requests',async()=>{
  const callbacks={}, matched=[];
  vm.runInNewContext(read('sw.js'),{self:{addEventListener:(name,cb)=>callbacks[name]=cb,location:{origin:'https://example.test'}},caches:{match:async key=>{matched.push(key);return key;}},fetch:async()=>{throw Error('offline');},URL,Set});
  let response;
  callbacks.fetch({request:{url:'https://example.test/club.html?postId=9',method:'GET',mode:'navigate'},respondWith:p=>response=p});
  assert.equal(await response,'/club.html');
  callbacks.fetch({request:{url:'https://example.test/club',method:'GET',mode:'navigate'},respondWith:p=>response=p});
  assert.equal(await response,'/club.html');
  callbacks.fetch({request:{url:'https://example.test/',method:'GET',mode:'navigate'},respondWith:p=>response=p});
  assert.equal(await response,'/index.html');
  for(const url of ['https://firestore.googleapis.com/x','https://example.test/api/private','https://example.test/club-ui.js?private=yes']) callbacks.fetch({request:{url,method:'GET',mode:'cors'},respondWith(){throw Error('must not cache');}});
  callbacks.fetch({request:{url:'https://example.test/club.html',method:'POST',mode:'navigate'},respondWith(){throw Error('must not cache POST');}});
  assert.deepEqual(matched,['/club.html','/club.html','/index.html']);
});
