const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const programs=['성인·학생복싱','성인 복싱 GX','피지컬 트레이닝','피지컬 GX','키즈복싱','복귀회원 상담','아직 고민 중이에요'];
const times=['오전 10:00–11:00','오후 15:00–18:00','저녁 18:00–22:00'];
const hex=bytes=>[...new Uint8Array(bytes)].map(v=>v.toString(16).padStart(2,'0')).join('');
async function hmac(secret,value){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(value)));}
export function isConfigured(env){return Boolean(env.BOOKING_DB&&env.BOOKING_RATE_SECRET?.length>=32&&env.BOOKING_ADMIN_SECRET?.length>=32&&env.SOLAPI_API_KEY&&env.SOLAPI_API_SECRET&&/^\d{8,15}$/.test(env.SMS_FROM||'')&&/^01[016789]\d{7,8}$/.test(env.SMS_TO||'')&&env.BOOKING_RETENTION_READY==='true'&&env.BOOKING_ENABLED==='true');}
export async function sendSms(env,booking,fetcher=fetch){
  if(!env.SOLAPI_API_KEY||!env.SOLAPI_API_SECRET||!env.SMS_FROM||!env.SMS_TO)return 'not_configured';
  const date=new Date().toISOString(),salt=crypto.randomUUID().replaceAll('-','');
  const signature=await hmac(env.SOLAPI_API_SECRET,date+salt);
  // Keep the Korean alert short; visitor contact details remain in the private database.
  const codes={'성인·학생복싱':'BOXING','성인 복싱 GX':'BOXING','피지컬 트레이닝':'PHYSICAL','피지컬 GX':'PHYSICAL','키즈복싱':'KIDS','복귀회원 상담':'RETURN','아직 고민 중이에요':'CONSULT'};
  const slots=booking.preferred_time.startsWith('오전')?'10-11':booking.preferred_time.startsWith('오후')?'15-18':'18-22';
  const text=`[복싱사관학교] 새 예약\n${booking.preferred_date.slice(5)} ${slots} ${codes[booking.program]}\n${booking.id}`;
  const response=await fetcher('https://api.solapi.com/messages/v4/send-many/detail',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`HMAC-SHA256 apiKey=${env.SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`},body:JSON.stringify({messages:[{to:env.SMS_TO,from:env.SMS_FROM,type:'SMS',text}] ,allowDuplicates:false,showMessageList:true}),signal:AbortSignal.timeout(8000)});
  if(!response.ok)return 'failed';
  const result=await response.json();
  // Accepted by provider, not a claim of delivery to the handset.
  return result.failedMessageList?.length || !result.messageList?.some(item=>item.statusCode==='2000') ? 'failed' : 'accepted';
}
export async function handleBooking({request,env,waitUntil},sms=sendSms){
  if(!isConfigured(env))return json({error:'온라인 예약 연결 준비 중입니다. 063-717-6433으로 문의해 주세요.'},503);
  const origin=request.headers.get('Origin');
  if(origin!==new URL(request.url).origin)return json({error:'요청 출처를 확인할 수 없습니다.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'지원하지 않는 요청입니다.'},415);
  const text=await request.text();if(text.length>4096)return json({error:'입력 내용이 너무 깁니다.'},413);
  let body;try{body=JSON.parse(text);}catch{return json({error:'입력 내용을 확인해 주세요.'},400);}
  if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'입력 내용을 확인해 주세요.'},400);
  if(body.website)return json({error:'요청을 확인할 수 없습니다.'},400);
  const name=String(body.name||'').trim(),phone=String(body.phone||'').replace(/[\s-]/g,''),program=String(body.program||''),preferred_date=String(body.date||''),preferred_time=String(body.time||'');
  const date=new Date(preferred_date+'T00:00:00Z'),today=new Date(Date.now()+9*3600000).toISOString().slice(0,10),max=new Date(Date.now()+61*86400000+9*3600000).toISOString().slice(0,10);
  if(!/^[\p{L} .'-]{2,40}$/u.test(name)||!/^01[016789]\d{7,8}$/.test(phone)||!programs.includes(program)||!times.includes(preferred_time)||!/^\d{4}-\d{2}-\d{2}$/.test(preferred_date)||Number.isNaN(+date)||date.toISOString().slice(0,10)!==preferred_date||preferred_date<=today||preferred_date>=max||[0,6].includes(new Date(preferred_date+'T00:00:00Z').getUTCDay())||body.consent!==true)return json({error:'이름, 휴대폰, 희망 일정과 개인정보 수집 동의를 확인해 주세요. 다음날부터 60일 이내 평일로 신청할 수 있습니다.'},400);
  const request_key=request.headers.get('Idempotency-Key')||'';
  if(!/^[a-zA-Z0-9-]{16,80}$/.test(request_key))return json({error:'요청 정보를 다시 확인해 주세요.'},400);
  const booking={name,phone,program,preferred_date,preferred_time};
  const payload_hash=await hmac(env.BOOKING_RATE_SECRET,JSON.stringify(booking));
  try{
    const existing=await env.BOOKING_DB.prepare('SELECT id, payload_hash FROM academy_bookings WHERE request_key = ?').bind(request_key).first();
    if(existing)return existing.payload_hash===payload_hash?json({id:existing.id,status:'requested'}):json({error:'변경한 내용으로 다시 신청해 주세요.'},409);
    const now=Date.now(),windowId=Math.floor(now/(15*60000));
    const rateKey=await hmac(env.BOOKING_RATE_SECRET,`${request.headers.get('CF-Connecting-IP')||'unknown'}:${windowId}`);
    const rate=await env.BOOKING_DB.prepare('INSERT INTO booking_rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(rateKey,now+15*60000).first();
    if(rate.count>5)return json({error:'잠시 후 다시 신청하거나 전화로 문의해 주세요.'},429);
    booking.id='BA-'+preferred_date.replaceAll('-','').slice(2)+'-'+crypto.randomUUID().slice(0,6).toUpperCase();
    const saved=await env.BOOKING_DB.prepare('INSERT OR IGNORE INTO academy_bookings(id,request_key,payload_hash,name,phone,program,preferred_date,preferred_time,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(booking.id,request_key,payload_hash,name,phone,program,preferred_date,preferred_time,now).run();
    if(!saved.meta.changes){const duplicate=await env.BOOKING_DB.prepare('SELECT id, payload_hash FROM academy_bookings WHERE request_key = ?').bind(request_key).first();return duplicate?.payload_hash===payload_hash?json({id:duplicate.id,status:'requested'}):json({error:'다시 신청해 주세요.'},409);}
    waitUntil((async()=>{let status;try{status=await sms(env,booking);}catch{status='failed';}await env.BOOKING_DB.prepare('UPDATE academy_bookings SET notification_status=? WHERE id=?').bind(status,booking.id).run();})());
    // Only this application's own request records are subject to the disclosed 30 day retention.
    waitUntil(env.BOOKING_DB.batch([env.BOOKING_DB.prepare('DELETE FROM academy_bookings WHERE created_at < ?').bind(now-30*86400000),env.BOOKING_DB.prepare('DELETE FROM booking_rate_limits WHERE expires_at < ?').bind(now)]));
    return json({id:booking.id,status:'requested'},201);
  }catch{return json({error:'접수를 완료하지 못했습니다. 잠시 후 다시 시도하거나 전화로 문의해 주세요.'},503);}
}

export const onRequestPost=context=>handleBooking(context);
