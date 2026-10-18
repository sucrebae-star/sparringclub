// Deploy separately with a daily cron trigger and the same BOOKING_DB binding.
export default {async scheduled(_event,env,context){context.waitUntil(env.BOOKING_DB.batch([
  env.BOOKING_DB.prepare('DELETE FROM academy_bookings WHERE created_at < ?').bind(Date.now()-30*86400000),
  env.BOOKING_DB.prepare('DELETE FROM booking_rate_limits WHERE expires_at < ?').bind(Date.now())
]));}};
