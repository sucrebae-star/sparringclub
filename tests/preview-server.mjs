// Local QA only. Firebase reads use fictional fixtures and all writes fail closed.
// This file is excluded from the production build.
import http from 'node:http';
import {handleBooking} from '../functions/api/bookings.js';
import {onRequest as bookingAdmin} from '../functions/api/bookings-admin.js';
import {database,testEnv} from './booking-fixture.mjs';
const bookingDb=database(),bookingEnv=testEnv(bookingDb);

import {readFile, stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
const root = resolve('.');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.avif':'image/avif','.woff2':'font/woff2'};
const fixtures = role => `
window.qaWrites = [];
const qaNow = Date.now();
const qaPlayers = Array.from({length:8},(_,i)=>({id:100+i,userId:'qa'+i,name:'테스트복서'+(i+1),rawName:'테스트복서'+(i+1),region:i%2?'서울':'전북',gymId:i%2?'qa-gym2':'qa-gym1',gym:i%2?'테스트짐 서울':'테스트짐 전주',role:'player',tier:1+i%3,weight:i%2?'웰터급':'미들급',height:'175cm',stance:i%2?'사우스포':'오소독스',pt:800-i*60,totalPt:800-i*60,tPt:0,sW:4,sD:1,sL:2,tW:0,tD:0,tL:0,profilePic:'',isVerified:true,matchingTrust:100,decisionTrust:100,createdAt:qaNow-i*1000}));
const qaGyms = [{id:'qa-gym1',name:'테스트짐 전주',region:'전북',totalPt:1600,registeredAt:qaNow,stories:[],logo:'',phone:'',address:'테스트 전용 주소'},{id:'qa-gym2',name:'테스트짐 서울',region:'서울',totalPt:1000,registeredAt:qaNow,stories:[],logo:''}];
const qaPosts = [{id:901,prefix:'[자유게시]',title:'테스트 데이터 · 함께 훈련할 파트너를 찾습니다',content:'화면 검증용 가상 게시글입니다.',authorId:101,authorName:'테스트복서2',time:qaNow,comments:[],likes:[],type:'normal'},{id:902,prefix:'[복싱질문]',title:'테스트 데이터 · 첫 스파링 준비물',content:'화면 검증용 가상 게시글입니다.',authorId:102,authorName:'테스트복서3',time:qaNow-1000,comments:[],likes:[],type:'normal'}];
const qaDate = new Date(qaNow+86400000).toISOString().slice(0,10)+' 19:00';
const qaMatches = [{id:501,senderId:100,receiverId:101,senderRawName:'테스트복서1',receiverRawName:'테스트복서2',senderName:'테스트복서1',receiverName:'테스트복서2',status:'매칭 성사',type:'랭킹전',date:qaDate,matchGymName:'테스트짐 전주',matchGymId:'qa-gym1',createdAt:qaNow,messages:[],seq:1}];
const qaRole = ${JSON.stringify(role)};
const qaUser = qaRole === 'guest' ? null : {...qaPlayers[0],role:qaRole==='admin'?'admin':qaRole==='manager'?'manager':'player',isAdmin:qaRole==='admin'};
localStorage.setItem('sparring_app_version','20260310_v3');
localStorage.setItem('sparring_approved_users',JSON.stringify(qaPlayers));
localStorage.setItem('sparring_gyms_registry',JSON.stringify(qaGyms));
localStorage.setItem('sparring_community_posts',JSON.stringify(qaPosts));
localStorage.setItem('sparring_matches',JSON.stringify(qaMatches));
if(qaUser) localStorage.setItem('sparring_session',JSON.stringify(qaUser)); else localStorage.removeItem('sparring_session');
window.db={};window.auth={};window.storage={};window.messaging=null;
window.collection=(_,name)=>({name});window.doc=(_,name,id)=>({name,id});window.query=(ref)=>ref;window.orderBy=()=>{};window.limit=()=>{};
window.onSnapshot=(ref,cb)=>{const values=ref.name==='users'?qaPlayers:ref.name==='community_posts'?qaPosts:ref.name==='gyms_registry'?qaGyms:ref.name==='matches'?qaMatches:[];queueMicrotask(()=>{if(ref.id) cb({exists:()=>false,data:()=>({})});else cb({forEach:fn=>values.forEach(value=>fn({data:()=>value}))});});return ()=>{};};
window.onAuthStateChanged=(_,cb)=>{queueMicrotask(()=>cb(null));return ()=>{};};
const qaReject=(...args)=>{qaWrites.push(args);return Promise.reject(new Error('QA mode: remote writes blocked'));};
['addDoc','setDoc','updateDoc','deleteDoc','uploadBytes','uploadBytesResumable','deleteObject','createUserWithEmailAndPassword','signInWithEmailAndPassword','runTransaction'].forEach(name=>window[name]=qaReject);
window.getDoc=async()=>({exists:()=>false});window.getDocs=async()=>({empty:true,forEach:()=>{}});window.setPersistence=async()=>{};window.increment=v=>v;
window.qaFixtures=true;
`;
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    if(url.pathname.startsWith('/api/')){
      if(url.pathname==='/api/booking-config'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({enabled:true,preview:true}));return;}
      const chunks=[];for await(const chunk of req)chunks.push(chunk);
      const request=new Request('http://127.0.0.1:4174'+req.url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})});
      const pending=[];const context={request,env:bookingEnv,waitUntil:p=>pending.push(p)};
      const response=url.pathname==='/api/bookings'&&req.method==='POST'?await handleBooking(context,async()=>'preview'):url.pathname==='/api/bookings-admin'?await bookingAdmin(context):new Response('Not found',{status:404});
      await Promise.all(pending);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return;
    }
    if(url.pathname==='/sw.js'){res.writeHead(404);res.end();return;}
    const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    if(!(await stat(path)).isFile()) throw new Error('not a file');
    let data=await readFile(path);
    if(path.endsWith('/club.html')) data=Buffer.from(data.toString().replace(/<script type="module">[\s\S]*?<\/script>/, '<script>'+fixtures(url.searchParams.get('qaRole')||'guest')+'</script>').replace(/navigator.serviceWorker.register\('sw.js'\)/g,'Promise.resolve({update(){},addEventListener(){}})').replace('THE NEXT ROUND IS YOURS.','UI 검증용 가상 데이터 · 실제 회원 정보 아님'));
    res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(4174,'127.0.0.1',()=>console.log('Isolated fixture preview: http://127.0.0.1:4174/club.html (guest), ?qaRole=member|manager|admin'));
