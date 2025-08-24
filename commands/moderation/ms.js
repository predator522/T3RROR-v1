export default function ms(s){
  const m = String(s).match(/^(\d+)([smhd])$/i);
  if(!m) return 600000; // default 10m
  const n = parseInt(m[1]); const u = m[2].toLowerCase();
  return u==="s"?n*1000:u==="m"?n*60000:u==="h"?n*3600000:n*86400000;
}
