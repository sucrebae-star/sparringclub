// In-memory SQLite executes the real migration and production SQL without remote access.
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function database(){
  const db=new DatabaseSync(':memory:');db.exec(readFileSync('migrations/0001_bookings.sql','utf8'));db.exec(readFileSync('migrations/0002_booking_message.sql','utf8'));
  return {raw:db,prepare(sql){let values=[];const stmt=db.prepare(sql);return {bind(...args){values=args;return this;},async first(){return stmt.get(...values)||null;},async all(){return {results:stmt.all(...values)};},async run(){const r=stmt.run(...values);return {meta:{changes:Number(r.changes)}};}};},async batch(statements){db.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}},close(){db.close();}};
}
export const testEnv=db=>({BOOKING_DB:db,BOOKING_RATE_SECRET:'local-test-rate-secret-not-production',BOOKING_ADMIN_SECRET:'local-test-admin-secret-not-production',BOOKING_ENABLED:'true',BOOKING_RETENTION_READY:'true',SOLAPI_API_KEY:'fixture-key',SOLAPI_API_SECRET:'fixture-secret',SMS_FROM:'01000000000',SMS_TO:'01000000000'});
export function nextWeekday(){const d=new Date(Date.now()+86400000+9*3600000);while([0,6].includes(d.getUTCDay()))d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10);}
export const validBooking=()=>({name:'테스트신청자',phone:'010-0000-0000',program:'성인 복싱 GX',date:nextWeekday(),time:'저녁 18:00–22:00',consent:true,website:''});
