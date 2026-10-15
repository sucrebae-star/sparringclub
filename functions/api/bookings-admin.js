const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
async function authorized(request,env){
  const key=env.BOOKING_ADMIN_SECRET;if(!key||key.length<32)return false;
  const input=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';if(input.length>256)return false;
  const hash=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
  const [a,b]=await Promise.all([hash(key),hash(input)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
}
export async function onRequest({request,env}){
  if(!env.BOOKING_DB||!await authorized(request,env))return json({error:'예약 관리 인증이 필요합니다.'},401);
  try{
    if(request.method==='GET'){
      const {results}=await env.BOOKING_DB.prepare('SELECT id,name,phone,program,preferred_date,preferred_time,status,notification_status,created_at FROM academy_bookings WHERE created_at >= ? ORDER BY created_at DESC LIMIT 100').bind(Date.now()-30*86400000).all();
      return json({bookings:results});
    }
    if(request.method!=='POST')return json({error:'지원하지 않는 요청입니다.'},405);
    if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'요청 출처를 확인해 주세요.'},403);
    if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'지원하지 않는 요청입니다.'},415);
    const text=await request.text();if(text.length>512)return json({error:'입력 오류'},413);
    let data;try{data=JSON.parse(text);}catch{return json({error:'입력 오류'},400);}
    if(!data||typeof data.id!=='string'||!/^[A-Z0-9-]{10,40}$/.test(data.id)||!['confirmed','cancelled'].includes(data.status))return json({error:'예약 상태를 확인해 주세요.'},400);
    const result=await env.BOOKING_DB.prepare('UPDATE academy_bookings SET status=? WHERE id=?').bind(data.status,data.id).run();
    return result.meta.changes?json({ok:true}):json({error:'예약을 찾지 못했습니다.'},404);
  }catch{return json({error:'예약을 불러오지 못했습니다. 연결을 확인해 주세요.'},503);}
}
