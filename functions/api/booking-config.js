import {isConfigured} from './bookings.js';
export function onRequestGet({env}){return Response.json({enabled:isConfigured(env)},{headers:{'Cache-Control':'no-store'}});}
