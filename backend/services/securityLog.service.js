import { pool } from "../server.js";

const maskIp = (ip) => {
  if (!ip) return null;
  // IPv4: ბოლო ოქტეტი 0-ით
  const ipv4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/);
  if (ipv4) return `${ipv4[1]}.${ipv4[2]}.${ipv4[3]}.0`;
  // IPv6: ბოლო 64 ბიტი
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + '::';
  }
  return null;
};

export const logSecurity = async (event_type, severity, {
  actor_user_id = null,
  target_user_id = null,
  ip = null,
  userAgent = null,
  metadata = {}
} = {}) => {
  try {
    await pool.query(
      `INSERT INTO security_events
        (event_type, severity, actor_user_id, target_user_id, ip_masked, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [event_type, severity, actor_user_id, target_user_id, maskIp(ip), userAgent, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error('Security log error:', err);
  }
};
