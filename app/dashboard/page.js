'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, FolderOpen, Calendar, Target, Bot, Settings,
  FolderCheck, AlertTriangle, Clock, Plus, ChevronLeft, ChevronRight,
  MoreHorizontal, Pencil, Trash2, CheckCheck, Search, Flame,
  Shield, LogOut, Bell, MessageSquare, Sparkles, X
} from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);

const THEMES = {
  dark:   { name: 'Dark',   bg: '#0f0f13', surf: '#1a1a24', acc: '#818cf8' },
  light:  { name: 'Light',  bg: '#f1f5f9', surf: '#ffffff', acc: '#6366f1' },
  ocean:  { name: 'Ocean',  bg: '#050d1a', surf: '#0d1f3c', acc: '#38bdf8' },
  forest: { name: 'Forest', bg: '#050f05', surf: '#0d1f0d', acc: '#4ade80' },
  bold:   { name: 'Bold',   bg: '#12001f', surf: '#1e0035', acc: '#f59e0b' },
  rose:   { name: 'Rose',   bg: '#1a0510', surf: '#2d0a1e', acc: '#fb7185' },
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  // Core state
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [blockedSites, setBlockedSites] = useState([]);
  const [settings, setSettings] = useState({ blocking: false, theme: 'dark', notifDeadlines: true, notifTimer: false });
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Modal state
  const [modal, setModal] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [blockFormDefaults, setBlockFormDefaults] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);

  // Timer state
  const [timerSecs, setTimerSecs] = useState(25 * 60);
  const [timerTotal, setTimerTotal] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Projects filter state — moved to top level to fix hooks error
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Schedule
  const [newSiteUrl, setNewSiteUrl] = useState('');

  // Streak & feedback
  const [streak, setStreak] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [notifPermission, setNotifPermission] = useState('default');

  // AI chat
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hey! I'm your Guardian AI. I can help you prioritize tasks, plan your day, or just think through what to tackle next. What's on your mind?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // ============================================================
  // INIT
  // ============================================================
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const [projectsRes, blocksRes, sitesRes, settingsRes] = await Promise.all([
        supabase.from('projects').select('*').order('deadline'),
        supabase.from('schedule_blocks').select('*'),
        supabase.from('blocked_sites').select('*'),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      ]);

      if (projectsRes.data) setProjects(projectsRes.data);
      if (blocksRes.data) setBlocks(blocksRes.data);
      if (sitesRes.data?.length) setBlockedSites(sitesRes.data);
      if (settingsRes.data) {
        setSettings({
          blocking: settingsRes.data.blocking_enabled,
          theme: settingsRes.data.theme || 'dark',
          notifDeadlines: settingsRes.data.notif_deadlines,
          notifTimer: settingsRes.data.notif_timer,
        });
        document.documentElement.setAttribute('data-theme', settingsRes.data.theme || 'dark');
      }
      setLoading(false);

      // Streak tracking
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem('guardian-last-visit');
      const currentStreak = parseInt(localStorage.getItem('guardian-streak') || '0');
      if (!lastVisit) {
        localStorage.setItem('guardian-last-visit', today);
        localStorage.setItem('guardian-streak', '1');
        setStreak(1);
      } else {
        const diffDays = Math.round((new Date(today) - new Date(lastVisit)) / 86400000);
        if (diffDays === 0) {
          setStreak(currentStreak);
        } else if (diffDays === 1) {
          const ns = currentStreak + 1;
          localStorage.setItem('guardian-last-visit', today);
          localStorage.setItem('guardian-streak', String(ns));
          setStreak(ns);
        } else {
          localStorage.setItem('guardian-last-visit', today);
          localStorage.setItem('guardian-streak', '1');
          setStreak(1);
        }
      }

      // Notification permission
      if ('Notification' in window) {
        setNotifPermission(Notification.permission);
      }
    }
    init();
  }, []);

  // Timer tick
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) { clearInterval(id); setTimerRunning(false); toast('⏰ Session complete! Take a break.', 'success'); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  // ============================================================
  // HELPERS
  // ============================================================
  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const uid = () => Math.random().toString(36).slice(2);

  function getWeekDates() {
    const now = new Date();
    const dow = now.getDay();
    const mon = new Date(now);
    mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7);
    mon.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  }

  const weekKey = (dates) => dates[0].toISOString().slice(0, 10);
  function fmtHour(h) { return `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`; }
  function fmtTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h < 12 ? 'am' : 'pm'}`;
  }
  function daysLeft(deadline) { return Math.ceil((new Date(deadline) - new Date()) / 864e5); }
  function blockColor(type) {
    return { work: 'var(--accent)', break: 'var(--success)', personal: 'var(--warning)', study: 'var(--danger)' }[type] || 'var(--accent)';
  }
  function urgText(dl) {
    if (!dl) return { text: 'No deadline', cls: 'ok' };
    const d = daysLeft(dl);
    if (d < 0) return { text: `${Math.abs(d)}d overdue`, cls: 'urgent' };
    if (d === 0) return { text: 'Due today!', cls: 'urgent' };
    if (d === 1) return { text: 'Due tomorrow', cls: 'soon' };
    if (d <= 3) return { text: `${d}d left`, cls: 'soon' };
    return { text: `${d}d left`, cls: 'ok' };
  }

  const timerMin = String(Math.floor(timerSecs / 60)).padStart(2, '0');
  const timerSecStr = String(timerSecs % 60).padStart(2, '0');

  // ============================================================
  // PROJECT CRUD
  // ============================================================
  async function addProject(data) {
    const { data: inserted, error } = await supabase.from('projects').insert({ ...data, user_id: user.id }).select().single();
    if (error) { toast('Failed to save project', 'error'); return; }
    setProjects(p => [...p, inserted]);
    toast('Project added! 🎉', 'success');
    setModal(null);
  }

  async function updateProject(id, data) {
    const { data: updated, error } = await supabase.from('projects').update(data).eq('id', id).select().single();
    if (error) { toast('Failed to update', 'error'); return; }
    setProjects(p => p.map(x => x.id === id ? updated : x));
    toast('Project updated!', 'success');
    setModal(null);
  }

  async function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    await supabase.from('projects').delete().eq('id', id);
    setProjects(p => p.filter(x => x.id !== id));
    toast('Deleted', 'info');
  }

  async function markComplete(id) {
    await updateProject(id, { progress: 100, status: 'completed' });
  }

  // ============================================================
  // BLOCK CRUD
  // ============================================================
  async function addBlock(data) {
    const dates = getWeekDates();
    const { data: inserted, error } = await supabase.from('schedule_blocks').insert({ ...data, user_id: user.id, week_key: weekKey(dates) }).select().single();
    if (error) { toast('Failed to add block', 'error'); return; }
    setBlocks(b => [...b, inserted]);
    toast('Block added!', 'success');
    setModal(null);
  }

  async function deleteBlock(id) {
    if (!confirm('Remove this block?')) return;
    await supabase.from('schedule_blocks').delete().eq('id', id);
    setBlocks(b => b.filter(x => x.id !== id));
  }

  async function autoSchedule() {
    const active = projects.filter(p => p.status === 'active');
    if (!active.length) { toast('No active projects to schedule', 'info'); return; }
    const dates = getWeekDates();
    const wk = weekKey(dates);
    const autoIds = blocks.filter(b => b.week_key === wk && b.auto_generated).map(b => b.id);
    if (autoIds.length) await supabase.from('schedule_blocks').delete().in('id', autoIds);
    const newBlocks = [];
    const workDays = [0, 1, 2, 3, 4];
    const workHours = [9, 10, 11, 14, 15, 16];
    for (const day of workDays) {
      const taken = blocks.some(b => b.week_key === wk && b.day_index === day && b.start_time === '12:00');
      if (!taken) newBlocks.push({ user_id: user.id, title: 'Lunch Break', type: 'break', day_index: day, start_time: '12:00', end_time: '13:00', week_key: wk, auto_generated: true });
    }
    let pi = 0;
    for (const day of workDays) {
      for (const hour of workHours) {
        const slot = String(hour).padStart(2, '0') + ':00';
        const taken = blocks.some(b => b.week_key === wk && b.day_index === day && b.start_time === slot);
        if (!taken) {
          const p = active[pi % active.length];
          newBlocks.push({ user_id: user.id, title: p.name, type: 'work', day_index: day, start_time: slot, end_time: String(hour + 1).padStart(2, '0') + ':00', project_id: p.id, week_key: wk, auto_generated: true });
          pi++;
        }
      }
    }
    const { data: inserted } = await supabase.from('schedule_blocks').insert(newBlocks).select();
    setBlocks(b => b.filter(x => !autoIds.includes(x.id)).concat(inserted || []));
    toast(`Auto-schedule done! ✨`, 'success');
  }

  // ============================================================
  // SETTINGS
  // ============================================================
  async function toggleBlocking() {
    const newVal = !settings.blocking;
    setSettings(s => ({ ...s, blocking: newVal }));
    await supabase.from('user_settings').update({ blocking_enabled: newVal }).eq('user_id', user.id);
    localStorage.setItem('guardian-blocking', newVal ? '1' : '0');
    toast(newVal ? '🚫 Social media blocked!' : '✅ Blocking off', 'info');
  }

  async function setTheme(theme) {
    setSettings(s => ({ ...s, theme }));
    document.documentElement.setAttribute('data-theme', theme);
    await supabase.from('user_settings').update({ theme }).eq('user_id', user.id);
    toast(`Theme: ${THEMES[theme].name}`, 'success');
  }

  async function toggleSetting(key, dbKey) {
    const newVal = !settings[key];
    setSettings(s => ({ ...s, [key]: newVal }));
    await supabase.from('user_settings').update({ [dbKey]: newVal }).eq('user_id', user.id);
  }

  async function addSite() {
    let url = newSiteUrl.trim().replace(/^https?:\/\//, '').replace(/\/.*/, '');
    if (!url) return toast('Enter a domain', 'error');
    if (blockedSites.some(s => s.url === url)) return toast('Already in list', 'error');
    const { data } = await supabase.from('blocked_sites').insert({ user_id: user.id, url, name: url, icon: '🌐' }).select().single();
    if (data) setBlockedSites(s => [...s, data]);
    setNewSiteUrl('');
    toast('Site added!', 'success');
  }

  async function removeSite(id) {
    await supabase.from('blocked_sites').delete().eq('id', id);
    setBlockedSites(s => s.filter(x => x.id !== id));
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function requestNotifications() {
    if (!('Notification' in window)) return toast('Notifications not supported in this browser', 'error');
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') toast('🔔 Notifications enabled!', 'success');
    else toast('Notifications blocked', 'info');
  }

  async function sendChatMessage(e) {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: 'user', content: chatInput.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.filter(m => m.role !== 'assistant' || newMessages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.content })),
          projects,
          blocks,
        }),
      });
      const data = await res.json();
      if (data.reply) setChatMessages(m => [...m, { role: 'assistant', content: data.reply }]);
      else setChatMessages(m => [...m, { role: 'assistant', content: 'Sorry, something went wrong. Try again.' }]);
    } catch {
      setChatMessages(m => [...m, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }
    setChatLoading(false);
  }

  async function submitFeedback(e) {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    await supabase.from('feedback').insert({ user_id: user.id, message: feedbackText.trim() }).then(() => {});
    setFeedbackSent(true);
    setFeedbackText('');
    toast('Thanks for your feedback! 🙏', 'success');
  }

  // ============================================================
  // FORM HANDLERS
  // ============================================================
  function handleAddProject(e) {
    e.preventDefault();
    const f = e.target;
    addProject({
      name: f.name.value.trim(),
      description: f.desc.value.trim(),
      deadline: f.deadline.value || null,
      priority: f.priority.value,
      hours: parseFloat(f.hours.value) || 1,
      tags: f.tags.value.split(',').map(t => t.trim()).filter(Boolean),
      progress: 0, status: 'active',
    });
  }

  function handleEditProject(e) {
    e.preventDefault();
    const f = e.target;
    const prog = Math.min(100, Math.max(0, parseInt(f.progress.value) || 0));
    updateProject(editingProject.id, {
      name: f.name.value.trim(),
      description: f.desc.value.trim(),
      deadline: f.deadline.value || null,
      priority: f.priority.value,
      hours: parseFloat(f.hours.value) || 1,
      progress: prog,
      tags: f.tags.value.split(',').map(t => t.trim()).filter(Boolean),
      status: prog === 100 ? 'completed' : 'active',
    });
  }

  function handleAddBlock(e) {
    e.preventDefault();
    const f = e.target;
    addBlock({
      title: f.title.value.trim(),
      type: f.type.value,
      day_index: parseInt(f.day.value),
      start_time: f.start.value,
      end_time: f.end.value,
      project_id: f.project.value || null,
      auto_generated: false,
    });
  }

  // ============================================================
  // COMPUTED VALUES
  // ============================================================
  const now = new Date();
  const dow = now.getDay();
  const todayDayIdx = dow === 0 ? 6 : dow - 1;
  const monDate = new Date(now);
  monDate.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  monDate.setHours(0, 0, 0, 0);
  const todayWk = monDate.toISOString().slice(0, 10);
  const todayBlocks = blocks.filter(b => b.week_key === todayWk && b.day_index === todayDayIdx).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const activeProjects = projects.filter(p => p.status === 'active');
  const urgentProjects = activeProjects.filter(p => { const d = daysLeft(p.deadline); return d >= 0 && d <= 2; });
  const dates = getWeekDates();
  const wk = weekKey(dates);

  const filteredProjects = projects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (priorityFilter && p.priority !== priorityFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', color: '#e2e8f0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
          <div style={{ color: '#94a3b8' }}>Loading Guardian…</div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <style>{`
        :root{--bg:#0f0f13;--surface:#1a1a24;--surface2:#222232;--border:#2a2a3a;--text:#e2e8f0;--text-muted:#94a3b8;--accent:#818cf8;--accent-hover:#a5b4fc;--danger:#f87171;--success:#4ade80;--warning:#fbbf24;--shadow:0 4px 24px rgba(0,0,0,.45);--radius:12px;--tr:.2s ease}
        [data-theme="light"]{--bg:#f1f5f9;--surface:#fff;--surface2:#f8fafc;--border:#e2e8f0;--text:#1e293b;--text-muted:#64748b;--accent:#6366f1;--accent-hover:#4f46e5;--shadow:0 4px 24px rgba(0,0,0,.09)}
        [data-theme="ocean"]{--bg:#050d1a;--surface:#0d1f3c;--surface2:#112447;--border:#1e3a5f;--text:#e2f0ff;--text-muted:#7ab3e0;--accent:#38bdf8;--accent-hover:#7dd3fc}
        [data-theme="forest"]{--bg:#050f05;--surface:#0d1f0d;--surface2:#132213;--border:#1f381f;--text:#d1fae5;--text-muted:#6ee7b7;--accent:#4ade80;--accent-hover:#86efac}
        [data-theme="bold"]{--bg:#12001f;--surface:#1e0035;--surface2:#2a0050;--border:#3d0070;--text:#fff;--text-muted:#c084fc;--accent:#f59e0b;--accent-hover:#fbbf24}
        [data-theme="rose"]{--bg:#1a0510;--surface:#2d0a1e;--surface2:#3d1030;--border:#5a1845;--text:#fce7f3;--text-muted:#f9a8d4;--accent:#fb7185;--accent-hover:#fda4af}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:14px}
        .sidebar{width:240px;min-height:100vh;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;z-index:100}
        .logo{display:flex;align-items:center;gap:10px;padding:22px 20px 18px;border-bottom:1px solid var(--border)}
        .logo-icon{width:36px;height:36px;background:var(--accent);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
        .logo-text h1{font-size:18px;font-weight:800;letter-spacing:-.5px}.logo-text span{font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px}
        nav{flex:1;display:flex;flex-direction:column;gap:3px;padding:14px 10px}
        .nav-item{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:8px;cursor:pointer;transition:all var(--tr);color:var(--text-muted);font-size:14px;font-weight:500;border:none;background:none;width:100%;text-align:left}
        .nav-item:hover{background:var(--surface2);color:var(--text)}.nav-item.active{background:var(--accent);color:#fff}
        .sidebar-footer{padding:14px 16px;border-top:1px solid var(--border);margin-top:auto}
        .main{margin-left:240px;padding:32px;min-height:100vh}
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px}
        .page-header h2{font-size:26px;font-weight:800;letter-spacing:-.5px}.page-header p{color:var(--text-muted);margin-top:3px;font-size:13px}
        .btn{padding:9px 18px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:600;transition:all var(--tr);display:inline-flex;align-items:center;gap:7px;font-family:inherit}
        .btn-primary{background:var(--accent);color:#fff}.btn-primary:hover{background:var(--accent-hover);transform:translateY(-1px)}
        .btn-secondary{background:var(--surface2);color:var(--text);border:1px solid var(--border)}.btn-secondary:hover{background:var(--border)}
        .btn-danger{background:transparent;color:var(--danger);border:1px solid var(--danger)}.btn-danger:hover{background:var(--danger);color:#fff}
        .btn-ghost{background:none;border:none;color:var(--text-muted);cursor:pointer;padding:6px 8px;border-radius:6px;font-size:13px;transition:all var(--tr)}.btn-ghost:hover{background:var(--surface2);color:var(--text)}
        .btn-sm{padding:6px 12px;font-size:12px}.btn-xs{padding:4px 8px;font-size:11px;border-radius:6px}
        .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;transition:box-shadow var(--tr)}.card:hover{box-shadow:var(--shadow)}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
        .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px;display:flex;align-items:center;gap:14px}
        .stat-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .stat-info h3{font-size:26px;font-weight:800;line-height:1}.stat-info p{font-size:11px;color:var(--text-muted);margin-top:3px;text-transform:uppercase;letter-spacing:.5px;font-weight:600}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:10px}
        .badge{display:inline-block;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
        .badge-high{background:rgba(248,113,113,.15);color:var(--danger)}.badge-medium{background:rgba(251,191,36,.15);color:var(--warning)}.badge-low{background:rgba(74,222,128,.15);color:var(--success)}.badge-done{background:rgba(74,222,128,.15);color:var(--success)}.badge-tag{background:var(--surface2);border:1px solid var(--border);color:var(--text-muted)}
        .progress-bar{height:5px;background:var(--surface2);border-radius:100px;overflow:hidden;margin-top:10px}
        .progress-fill{height:100%;background:var(--accent);border-radius:100px;transition:width .6s ease}
        .timeline{position:relative;padding-left:22px}.timeline::before{content:'';position:absolute;left:7px;top:0;bottom:0;width:2px;background:var(--border);border-radius:2px}
        .tl-item{position:relative;margin-bottom:12px;padding:13px 15px;background:var(--surface2);border-radius:10px;border-left:3px solid var(--accent)}.tl-item::before{content:'';position:absolute;left:-26px;top:50%;transform:translateY(-50%);width:10px;height:10px;border-radius:50%;background:var(--accent);border:2px solid var(--bg)}
        .tl-time{font-size:10px;color:var(--text-muted);margin-bottom:3px;font-weight:600;text-transform:uppercase}.tl-title{font-weight:600;font-size:13px}.tl-sub{font-size:11px;color:var(--text-muted);margin-top:2px}
        .dl-item{display:flex;align-items:center;gap:14px;padding:12px 14px;background:var(--surface2);border-radius:10px;margin-bottom:8px;cursor:pointer;transition:all var(--tr)}.dl-item:hover{background:var(--border)}
        .dl-title{font-weight:600;font-size:13px}.dl-meta{font-size:11px;color:var(--text-muted);margin-top:1px}.dl-right{margin-left:auto;text-align:right;flex-shrink:0}
        .urgency-urgent{color:var(--danger);font-size:11px;font-weight:700}.urgency-soon{color:var(--warning);font-size:11px;font-weight:700}.urgency-ok{color:var(--success);font-size:11px;font-weight:700}
        .projects-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
        .project-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;transition:all var(--tr)}.project-card:hover{box-shadow:var(--shadow)}
        .pc-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}.pc-name{font-size:16px;font-weight:700;margin-bottom:5px}.pc-desc{font-size:12px;color:var(--text-muted);line-height:1.5}.pc-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:10px}
        .pc-footer{display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)}
        .pc-val{font-weight:700;font-size:14px}.pc-lbl{font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.4px}
        .dots-menu{position:relative}.dots-btn{background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:18px;padding:4px 6px;border-radius:6px;transition:all var(--tr);line-height:1}.dots-btn:hover{background:var(--surface2);color:var(--text)}
        .dropdown{position:absolute;right:0;top:calc(100% + 4px);background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:var(--shadow);width:160px;z-index:200;overflow:hidden}
        .drop-item{padding:9px 14px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:8px;color:var(--text);transition:background var(--tr)}.drop-item:hover{background:var(--surface2)}.drop-item.danger{color:var(--danger)}
        .schedule-header-row{display:grid;grid-template-columns:56px repeat(7,1fr);gap:3px;margin-bottom:4px}
        .sch-day-label{text-align:center;padding:6px 4px}.sch-day-name{font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px}.sch-day-num{font-size:20px;font-weight:800;color:var(--text);line-height:1.2}.sch-day-label.today .sch-day-name,.sch-day-label.today .sch-day-num{color:var(--accent)}
        .sch-body{display:grid;grid-template-columns:56px repeat(7,1fr);gap:3px}
        .time-label{font-size:10px;color:var(--text-muted);text-align:right;padding-right:8px;height:44px;display:flex;align-items:flex-start;padding-top:3px;font-weight:600}
        .time-cell{height:44px;background:var(--surface2);border-radius:5px;border:1px solid var(--border);position:relative;cursor:pointer;transition:background var(--tr)}.time-cell:hover{background:var(--surface)}
        .time-block{position:absolute;inset:2px;border-radius:4px;padding:3px 6px;font-size:10px;font-weight:600;overflow:hidden;cursor:pointer;display:flex;align-items:center}
        .block-work{background:rgba(129,140,248,.25);color:var(--accent);border-left:3px solid var(--accent)}.block-break{background:rgba(74,222,128,.2);color:var(--success);border-left:3px solid var(--success)}.block-personal{background:rgba(251,191,36,.2);color:var(--warning);border-left:3px solid var(--warning)}.block-study{background:rgba(248,113,113,.2);color:var(--danger);border-left:3px solid var(--danger)}
        .filter-bar{display:flex;gap:10px;margin-bottom:20px;align-items:center;flex-wrap:wrap}
        .search-wrap{position:relative;flex:1;min-width:200px}.search-wrap input{width:100%;padding:9px 13px 9px 36px;background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none;transition:border-color var(--tr);font-family:inherit}.search-wrap input:focus{border-color:var(--accent)}
        .focus-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 18px;border-radius:100px;font-size:13px;font-weight:600;margin-bottom:20px}
        .focus-badge.active{background:rgba(74,222,128,.15);color:var(--success)}.focus-badge.inactive{background:var(--surface2);color:var(--text-muted)}
        .focus-dot{width:8px;height:8px;border-radius:50%;background:currentColor}.focus-badge.active .focus-dot{animation:pulse 1.8s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .timer-display{font-size:68px;font-weight:800;letter-spacing:-4px;color:var(--accent);margin-bottom:6px;font-variant-numeric:tabular-nums;line-height:1}
        .toggle{width:42px;height:23px;background:var(--border);border-radius:100px;position:relative;cursor:pointer;transition:background var(--tr);border:none;flex-shrink:0}
        .toggle::after{content:'';position:absolute;width:17px;height:17px;background:#fff;border-radius:50%;top:3px;left:3px;transition:transform var(--tr)}.toggle.on{background:var(--accent)}.toggle.on::after{transform:translateX(19px)}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px}
        .modal{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px;width:100%;max-width:520px;box-shadow:0 24px 64px rgba(0,0,0,.4);max-height:90vh;overflow-y:auto}
        .modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}.modal-head h3{font-size:18px;font-weight:700}
        .modal-foot{display:flex;gap:10px;justify-content:flex-end;margin-top:22px;padding-top:16px;border-top:1px solid var(--border)}
        .form-group{margin-bottom:14px}.form-group label{display:block;font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.6px}
        .form-control{width:100%;padding:9px 13px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;transition:border-color var(--tr);outline:none;font-family:inherit}.form-control:focus{border-color:var(--accent)}
        textarea.form-control{resize:vertical;min-height:72px}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .theme-grid{display:flex;gap:12px;flex-wrap:wrap}
        .theme-swatch{border-radius:10px;overflow:hidden;cursor:pointer;border:2px solid transparent;transition:all .2s;width:72px}.theme-swatch:hover{transform:scale(1.06)}.theme-swatch.active{border-color:var(--accent)}
        .swatch-preview{height:48px;padding:8px;display:flex;flex-direction:column;gap:4px}.swatch-bar{height:5px;border-radius:100px}
        .swatch-name{font-size:10px;font-weight:600;text-align:center;padding:5px 4px;background:var(--surface2);color:var(--text-muted)}
        .blocked-site{display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--surface2);border-radius:8px;margin-bottom:8px}
        .site-name{font-weight:600;font-size:13px}.site-url{font-size:11px;color:var(--text-muted)}
        .remove-btn{margin-left:auto;background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:18px;line-height:1;padding:2px 5px;border-radius:4px;transition:all var(--tr)}.remove-btn:hover{color:var(--danger)}
        .toggle-row{display:flex;align-items:center;gap:12px;margin-bottom:14px}
        .divider{height:1px;background:var(--border);margin:20px 0}
        .empty-state{text-align:center;padding:50px 20px;color:var(--text-muted)}.empty-state .es-icon{font-size:44px;margin-bottom:12px}.empty-state h3{font-size:16px;font-weight:600;color:var(--text);margin-bottom:6px}
        .toast-container{position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:8px;z-index:9999}
        .toast{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px 16px;font-size:13px;box-shadow:var(--shadow);display:flex;align-items:center;gap:10px;max-width:300px;animation:toastIn .3s ease}
        @keyframes toastIn{from{transform:translateX(100%);opacity:0}to{transform:none;opacity:1}}
        .toast.success{border-left:3px solid var(--success)}.toast.error{border-left:3px solid var(--danger)}.toast.info{border-left:3px solid var(--accent)}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--border);border-radius:100px}
        @media(max-width:700px){.sidebar{width:60px}.logo-text,.nav-item span:last-child{display:none}.logo{justify-content:center;padding:16px}.main{margin-left:60px;padding:16px}.stats-grid{grid-template-columns:1fr 1fr}.two-col{grid-template-columns:1fr}}
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"><Shield size={20} color="#fff"/></div>
          <div className="logo-text"><h1>Guardian</h1><span>Time Manager</span></div>
        </div>
        <nav>
          {[
            ['dashboard', <LayoutDashboard size={18}/>, 'Dashboard'],
            ['projects',  <FolderOpen size={18}/>,      'Projects'],
            ['schedule',  <Calendar size={18}/>,         'Schedule'],
            ['focus',     <Target size={18}/>,           'Focus'],
            ['ai',        <Bot size={18}/>,              'AI Assistant'],
            ['settings',  <Settings size={18}/>,         'Settings'],
          ].map(([v, icon, label]) => (
            <button key={v} className={`nav-item ${view===v?'active':''}`} onClick={() => setView(v)}>
              {icon}<span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.8px',fontWeight:600}}>Focus Blocker</div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button className={`toggle ${settings.blocking?'on':''}`} onClick={toggleBlocking}></button>
            <span style={{fontSize:13,fontWeight:600}}>{settings.blocking?'On':'Off'}</span>
          </div>
        </div>
      </aside>

      <main className="main">

        {/* ===== DASHBOARD ===== */}
        {view === 'dashboard' && (
          <div>
            <div className="page-header">
              <div>
                <h2>{now.getHours()<12?'Good morning ☀️':now.getHours()<17?'Good afternoon 🌤️':'Good evening 🌙'}</h2>
                <p>{now.toLocaleDateString('en',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                {streak > 0 && (
                  <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(251,191,36,0.12)',border:'1px solid rgba(251,191,36,0.25)',borderRadius:20,padding:'6px 14px'}}>
                    <Flame size={16} color="#fbbf24"/>
                    <span style={{fontWeight:700,fontSize:14,color:'#fbbf24'}}>{streak} day{streak!==1?'s':''}</span>
                    <span style={{fontSize:11,color:'#92400e'}}>streak</span>
                  </div>
                )}
                <button className="btn btn-primary" onClick={() => setModal('addProject')}>+ New Project</button>
              </div>
            </div>

            <div className="stats-grid">
              {[
                {icon:<FolderOpen size={22}/>,val:activeProjects.length,label:'Active Projects',color:'var(--accent)'},
                {icon:<FolderCheck size={22}/>,val:projects.filter(p=>p.status==='completed').length,label:'Completed',color:'var(--success)'},
                {icon:<AlertTriangle size={22}/>,val:urgentProjects.length,label:'Due Soon',color:'var(--danger)'},
                {icon:<Clock size={22}/>,val:todayBlocks.length,label:"Today's Blocks",color:'var(--warning)'},
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon" style={{background:`${s.color}20`,color:s.color}}>{s.icon}</div>
                  <div className="stat-info"><h3 style={{color:s.color}}>{s.val}</h3><p>{s.label}</p></div>
                </div>
              ))}
            </div>

            <div className="two-col">
              <div>
                <div className="section-label">Today's Schedule</div>
                {todayBlocks.length === 0
                  ? <div className="empty-state" style={{padding:'24px 0'}}><div className="es-icon" style={{fontSize:32}}>📅</div><p>Nothing scheduled today.</p><button className="btn btn-secondary btn-sm" style={{marginTop:10}} onClick={()=>setView('schedule')}>Open Schedule →</button></div>
                  : <div className="timeline">{todayBlocks.map(b=><div key={b.id} className="tl-item" style={{borderLeftColor:blockColor(b.type)}}><div className="tl-time">{fmtTime(b.start_time)} – {fmtTime(b.end_time)}</div><div className="tl-title">{b.title}</div><div className="tl-sub">{b.type}</div></div>)}</div>
                }
              </div>
              <div>
                <div className="section-label">Upcoming Deadlines</div>
                {activeProjects.length === 0
                  ? <div className="empty-state" style={{padding:'24px 0'}}><div className="es-icon" style={{fontSize:32}}>🎉</div><p>No deadlines!</p></div>
                  : [...activeProjects].sort((a,b)=>new Date(a.deadline)-new Date(b.deadline)).slice(0,5).map(p=>{
                      const u=urgText(p.deadline);
                      return <div key={p.id} className="dl-item" onClick={()=>setView('projects')}>
                        <span className={`badge badge-${p.priority}`}>{p.priority.slice(0,1).toUpperCase()}</span>
                        <div><div className="dl-title">{p.name}</div><div className="dl-meta">{p.deadline?new Date(p.deadline).toLocaleDateString('en',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'-'}</div></div>
                        <div className="dl-right"><div className={`urgency-${u.cls}`}>{u.text}</div><div style={{fontSize:11,color:'var(--text-muted)'}}>{p.progress||0}% done</div></div>
                      </div>;
                    })
                }
              </div>
            </div>
          </div>
        )}

        {/* ===== PROJECTS ===== */}
        {view === 'projects' && (
          <div>
            <div className="page-header">
              <div><h2>Projects</h2><p>Track your tasks, deadlines, and progress</p></div>
              <button className="btn btn-primary" onClick={()=>setModal('addProject')}>+ New Project</button>
            </div>
            <div className="filter-bar">
              <div className="search-wrap">
                <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',display:'flex'}}><Search size={14}/></span>
                <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <select className="form-control" style={{width:130}} value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}>
                <option value="">All Priority</option><option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
              </select>
              <select className="form-control" style={{width:130}} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                <option value="">All Status</option><option value="active">Active</option><option value="completed">Completed</option>
              </select>
            </div>
            <div className="projects-grid">
              {filteredProjects.length === 0
                ? <div className="empty-state" style={{gridColumn:'1/-1'}}><div className="es-icon">📁</div><h3>No projects</h3><p>Click "+ New Project" to get started</p></div>
                : filteredProjects.map(p => {
                    const u = urgText(p.deadline);
                    return <div key={p.id} className="project-card">
                      <div className="pc-head">
                        <div>
                          <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
                            <span className={`badge badge-${p.priority}`}>{p.priority}</span>
                            {p.status==='completed'&&<span className="badge badge-done">✓ Done</span>}
                          </div>
                          <div className="pc-name">{p.name}</div>
                          {p.description&&<div className="pc-desc">{p.description}</div>}
                        </div>
                        <div className="dots-menu">
                          <button className="dots-btn" onClick={()=>setOpenDropdown(openDropdown===p.id?null:p.id)}><MoreHorizontal size={18}/></button>
                          {openDropdown===p.id&&<div className="dropdown">
                            <div className="drop-item" onClick={()=>{setEditingProject(p);setModal('editProject');setOpenDropdown(null)}}><Pencil size={14}/> Edit</div>
                            <div className="drop-item" onClick={()=>{markComplete(p.id);setOpenDropdown(null)}}><CheckCheck size={14}/> Complete</div>
                            <div className="drop-item danger" onClick={()=>{deleteProject(p.id);setOpenDropdown(null)}}><Trash2 size={14}/> Delete</div>
                          </div>}
                        </div>
                      </div>
                      {(p.tags||[]).length>0&&<div className="pc-tags">{p.tags.map(t=><span key={t} className="badge badge-tag">{t}</span>)}</div>}
                      <div className="progress-bar"><div className="progress-fill" style={{width:`${p.progress||0}%`}}></div></div>
                      <div className="pc-footer">
                        <div><div className="pc-val">{p.progress||0}%</div><div className="pc-lbl">Done</div></div>
                        <div><div className="pc-val">{p.hours}h</div><div className="pc-lbl">Est.</div></div>
                        <div style={{textAlign:'right'}}>
                          <div className="pc-val" style={{fontSize:12}}>{p.deadline?new Date(p.deadline).toLocaleDateString('en',{month:'short',day:'numeric'}):'-'}</div>
                          <div className={`urgency-${u.cls}`}>{u.text}</div>
                        </div>
                      </div>
                    </div>;
                  })
              }
            </div>
          </div>
        )}

        {/* ===== SCHEDULE ===== */}
        {view === 'schedule' && (
          <div>
            <div className="page-header">
              <div><h2>Schedule</h2><p>Click any cell to add a block</p></div>
              <div style={{display:'flex',gap:10}}>
                <button className="btn btn-secondary" onClick={autoSchedule} style={{display:'flex',alignItems:'center',gap:6}}><Sparkles size={14}/> Auto-Schedule</button>
                <button className="btn btn-primary" onClick={()=>{setBlockFormDefaults({});setModal('addBlock')}} style={{display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Block</button>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
              <button className="btn btn-secondary btn-sm" onClick={()=>setWeekOffset(o=>o-1)} style={{display:'flex',alignItems:'center',gap:4}}><ChevronLeft size={14}/> Prev</button>
              <span style={{fontWeight:700,fontSize:15}}>{dates[0].toLocaleDateString('en',{month:'short',day:'numeric'})} – {dates[6].toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}</span>
              <button className="btn btn-secondary btn-sm" onClick={()=>setWeekOffset(o=>o+1)} style={{display:'flex',alignItems:'center',gap:4}}>Next <ChevronRight size={14}/></button>
              <button className="btn-ghost btn-sm" style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:13}} onClick={()=>setWeekOffset(0)}>Today</button>
            </div>
            <div style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:14}}>
              {[['var(--accent)','Work'],['var(--success)','Break'],['var(--warning)','Personal'],['var(--danger)','Study']].map(([c,l])=>(
                <div key={l} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'var(--text-muted)',fontWeight:500}}>
                  <div style={{width:10,height:10,borderRadius:2,background:c}}></div>{l}
                </div>
              ))}
            </div>
            <div style={{overflowX:'auto'}}>
              <div style={{minWidth:620}}>
                <div className="schedule-header-row">
                  <div></div>
                  {dates.map((d,i)=>{
                    const isToday=d.toDateString()===now.toDateString();
                    return <div key={i} className={`sch-day-label ${isToday?'today':''}`}>
                      <div className="sch-day-name">{DAYS[i]}</div>
                      <div className="sch-day-num">{d.getDate()}</div>
                    </div>;
                  })}
                </div>
                <div className="sch-body">
                  {HOURS.map(hour => (
                    <>{
                      [<div key={`lbl-${hour}`} className="time-label">{fmtHour(hour)}</div>,
                      ...dates.map((d,di)=>{
                        const cell = blocks.filter(b=>b.week_key===wk && b.day_index===di && parseInt(b.start_time)===hour);
                        return <div key={`${hour}-${di}`} className="time-cell" onClick={()=>{setBlockFormDefaults({day:di,hour});setModal('addBlock')}}>
                          {cell.map(b=><div key={b.id} className={`time-block block-${b.type}`} title={b.title} onClick={e=>{e.stopPropagation();deleteBlock(b.id)}}>{b.title}</div>)}
                        </div>;
                      })]
                    }</>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== FOCUS ===== */}
        {view === 'focus' && (
          <div>
            <div className="page-header"><div><h2>Focus Mode</h2><p>Pomodoro timer + social media blocker</p></div></div>
            <div className="two-col">
              <div className="card">
                <div style={{textAlign:'center',padding:'20px 0'}}>
                  <div className={`focus-badge ${timerRunning||settings.blocking?'active':'inactive'}`}>
                    <div className="focus-dot"></div>
                    <span>{timerRunning?'Timer running':settings.blocking?'Blocking active':'Idle'}</span>
                  </div>
                  <div className="timer-display">{timerMin}:{timerSecStr}</div>
                  <div style={{fontSize:13,color:'var(--text-muted)',marginBottom:24}}>{timerRunning?'Stay focused!':timerSecs===0?'Session complete! 🎉':'Ready?'}</div>
                  <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:16}}>
                    <button className="btn btn-primary" onClick={()=>{if(timerSecs===0){setTimerSecs(timerTotal);}setTimerRunning(r=>!r);}}>
                      {timerRunning?'⏸ Pause':'▶ Start'}
                    </button>
                    <button className="btn btn-secondary" onClick={()=>{setTimerRunning(false);setTimerSecs(timerTotal);}}>↺ Reset</button>
                  </div>
                  <div style={{display:'flex',gap:8,justifyContent:'center'}}>
                    {[25,45,90].map(m=><button key={m} className="btn btn-secondary btn-xs" onClick={()=>{setTimerTotal(m*60);setTimerSecs(m*60);setTimerRunning(false);}}>{m} min</button>)}
                  </div>
                </div>
              </div>
              <div className="card">
                <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>🚫 Site Blocker</div>
                <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:18}}>Block social media during focus sessions</div>
                <div className="toggle-row" style={{marginBottom:20}}>
                  <button className={`toggle ${settings.blocking?'on':''}`} onClick={toggleBlocking}></button>
                  <div><div style={{fontWeight:500}}>Block social media</div><div style={{fontSize:11,color:'var(--text-muted)'}}>{settings.blocking?'🚫 Blocking active':'Enable to block sites'}</div></div>
                </div>
                <div className="section-label">Blocked Sites</div>
                {blockedSites.map(s=><div key={s.id} className="blocked-site"><span>{s.icon||'🌐'}</span><div><div className="site-name">{s.name}</div><div className="site-url">{s.url}</div></div><button className="remove-btn" onClick={()=>removeSite(s.id)}>×</button></div>)}
              </div>
            </div>
          </div>
        )}

        {/* ===== AI ASSISTANT ===== */}
        {view === 'ai' && (
          <div>
            <div className="page-header">
              <div><h2>🤖 AI Assistant</h2><p>Ask anything about your schedule, projects, or productivity</p></div>
            </div>
            <div style={{maxWidth:680,margin:'0 auto'}}>
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column',height:'60vh'}}>
                {/* Messages */}
                <div style={{flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:12}}>
                  {chatMessages.map((m, i) => (
                    <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                      <div style={{
                        maxWidth:'80%',padding:'10px 14px',borderRadius:12,fontSize:14,lineHeight:1.6,
                        background: m.role==='user' ? 'var(--accent)' : 'var(--surface2)',
                        color: m.role==='user' ? '#fff' : 'var(--text)',
                        borderBottomRightRadius: m.role==='user' ? 4 : 12,
                        borderBottomLeftRadius: m.role==='assistant' ? 4 : 12,
                      }}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{display:'flex',justifyContent:'flex-start'}}>
                      <div style={{background:'var(--surface2)',padding:'10px 14px',borderRadius:12,borderBottomLeftRadius:4,fontSize:14,color:'var(--text-muted)'}}>
                        Thinking…
                      </div>
                    </div>
                  )}
                </div>
                {/* Input */}
                <form onSubmit={sendChatMessage} style={{padding:'14px 16px',borderTop:'1px solid var(--border)',display:'flex',gap:10}}>
                  <input
                    className="form-control"
                    placeholder="Ask me anything…"
                    value={chatInput}
                    onChange={e=>setChatInput(e.target.value)}
                    style={{flex:1}}
                    disabled={chatLoading}
                  />
                  <button type="submit" className="btn btn-primary" disabled={chatLoading||!chatInput.trim()}>Send</button>
                </form>
              </div>
              <div style={{marginTop:12,display:'flex',gap:8,flexWrap:'wrap'}}>
                {["What should I focus on today?","How do I beat my deadline?","Help me plan my week","I'm feeling overwhelmed"].map(q=>(
                  <button key={q} className="btn btn-secondary btn-sm" onClick={()=>setChatInput(q)}>{q}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== SETTINGS ===== */}
        {view === 'settings' && (
          <div>
            <div className="page-header"><div><h2>Settings</h2><p>Customize Guardian</p></div></div>
            <div style={{marginBottom:32}}>
              <h3 style={{fontSize:15,fontWeight:700,marginBottom:14,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>🎨 Theme</h3>
              <div className="theme-grid">
                {Object.entries(THEMES).map(([key,t])=>(
                  <div key={key} className={`theme-swatch ${settings.theme===key?'active':''}`} onClick={()=>setTheme(key)}>
                    <div className="swatch-preview" style={{background:t.bg}}>
                      <div className="swatch-bar" style={{background:t.surf,width:'80%'}}></div>
                      <div className="swatch-bar" style={{background:t.acc,width:'55%'}}></div>
                      <div className="swatch-bar" style={{background:t.surf,width:'70%'}}></div>
                    </div>
                    <div className="swatch-name">{t.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{marginBottom:32}}>
              <h3 style={{fontSize:15,fontWeight:700,marginBottom:14,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>🚫 Blocked Sites</h3>
              {blockedSites.map(s=><div key={s.id} className="blocked-site"><span>{s.icon||'🌐'}</span><div><div className="site-name">{s.name}</div><div className="site-url">{s.url}</div></div><button className="remove-btn" onClick={()=>removeSite(s.id)}>×</button></div>)}
              <div style={{display:'flex',gap:10,marginTop:10}}>
                <input className="form-control" placeholder="Add domain e.g. reddit.com" style={{maxWidth:280}} value={newSiteUrl} onChange={e=>setNewSiteUrl(e.target.value)}/>
                <button className="btn btn-primary btn-sm" onClick={addSite}>+ Add</button>
              </div>
            </div>
            <div style={{marginBottom:32}}>
              <h3 style={{fontSize:15,fontWeight:700,marginBottom:14,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>🔔 Notifications</h3>
              <div className="toggle-row"><button className={`toggle ${settings.notifDeadlines?'on':''}`} onClick={()=>toggleSetting('notifDeadlines','notif_deadlines')}></button><div><div style={{fontWeight:500}}>Deadline reminders</div><div style={{fontSize:11,color:'var(--text-muted)'}}>Alert when deadline is within 24h</div></div></div>
              <div className="toggle-row"><button className={`toggle ${settings.notifTimer?'on':''}`} onClick={()=>toggleSetting('notifTimer','notif_timer')}></button><div><div style={{fontWeight:500}}>Timer complete</div><div style={{fontSize:11,color:'var(--text-muted)'}}>Notify when session ends</div></div></div>
            </div>
            <div style={{marginBottom:32}}>
              <h3 style={{fontSize:15,fontWeight:700,marginBottom:14,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>👤 Account</h3>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16,padding:'14px',background:'var(--surface2)',borderRadius:10}}>
                {user?.user_metadata?.avatar_url&&<img src={user.user_metadata.avatar_url} alt="" style={{width:40,height:40,borderRadius:'50%'}}/>}
                <div><div style={{fontWeight:600}}>{user?.user_metadata?.full_name||user?.email}</div><div style={{fontSize:12,color:'var(--text-muted)'}}>{user?.email}</div></div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={signOut} style={{display:'flex',alignItems:'center',gap:6}}><LogOut size={14}/> Sign Out</button>
            </div>

            <div style={{marginBottom:32}}>
              <h3 style={{fontSize:15,fontWeight:700,marginBottom:14,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>🔔 Push Notifications</h3>
              <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:14}}>Get notified about upcoming deadlines directly in your browser.</p>
              {notifPermission === 'granted'
                ? <div style={{display:'flex',alignItems:'center',gap:8,color:'var(--success)',fontSize:13,fontWeight:600}}><span>✅</span> Notifications are enabled</div>
                : notifPermission === 'denied'
                ? <div style={{fontSize:13,color:'var(--danger)'}}>🚫 Notifications blocked — enable them in your browser settings.</div>
                : <button className="btn btn-primary btn-sm" onClick={requestNotifications}>Enable Notifications</button>
              }
            </div>

            <div style={{marginBottom:32}}>
              <h3 style={{fontSize:15,fontWeight:700,marginBottom:14,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>💬 Send Feedback</h3>
              <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:14}}>Something broken? Have an idea? Let us know.</p>
              {feedbackSent
                ? <div style={{color:'var(--success)',fontSize:13,fontWeight:600}}>✅ Feedback received — thank you!</div>
                : <form onSubmit={submitFeedback}>
                    <textarea className="form-control" placeholder="Your feedback..." value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} style={{marginBottom:10,minHeight:90}}></textarea>
                    <button type="submit" className="btn btn-primary btn-sm">Send Feedback</button>
                  </form>
              }
            </div>
          </div>
        )}
      </main>

      {/* ===== MODALS ===== */}
      {modal === 'addProject' && (
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}>
          <div className="modal">
            <div className="modal-head"><h3>📁 New Project</h3><button className="btn-ghost" onClick={()=>setModal(null)}>×</button></div>
            <form onSubmit={handleAddProject}>
              <div className="form-group"><label>Project Name *</label><input name="name" className="form-control" placeholder="e.g. History Essay" required/></div>
              <div className="form-group"><label>Description</label><textarea name="desc" className="form-control" placeholder="What needs to be done?"></textarea></div>
              <div className="form-row">
                <div className="form-group"><label>Deadline</label><input name="deadline" type="datetime-local" className="form-control"/></div>
                <div className="form-group"><label>Priority</label><select name="priority" className="form-control"><option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option></select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Estimated Hours</label><input name="hours" type="number" className="form-control" placeholder="e.g. 3" min="0.5" step="0.5"/></div>
                <div className="form-group"><label>Tags (comma-separated)</label><input name="tags" className="form-control" placeholder="school, writing"/></div>
              </div>
              <div className="modal-foot"><button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">Save Project</button></div>
            </form>
          </div>
        </div>
      )}

      {modal === 'editProject' && editingProject && (
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}>
          <div className="modal">
            <div className="modal-head"><h3>✏️ Edit Project</h3><button className="btn-ghost" onClick={()=>setModal(null)}>×</button></div>
            <form onSubmit={handleEditProject}>
              <div className="form-group"><label>Project Name *</label><input name="name" className="form-control" defaultValue={editingProject.name} required/></div>
              <div className="form-group"><label>Description</label><textarea name="desc" className="form-control" defaultValue={editingProject.description}></textarea></div>
              <div className="form-row">
                <div className="form-group"><label>Deadline</label><input name="deadline" type="datetime-local" className="form-control" defaultValue={editingProject.deadline?.slice(0,16)}/></div>
                <div className="form-group"><label>Priority</label><select name="priority" className="form-control" defaultValue={editingProject.priority}><option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option></select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Estimated Hours</label><input name="hours" type="number" className="form-control" defaultValue={editingProject.hours} min="0.5" step="0.5"/></div>
                <div className="form-group"><label>Progress (%)</label><input name="progress" type="number" className="form-control" defaultValue={editingProject.progress||0} min="0" max="100" step="5"/></div>
              </div>
              <div className="form-group"><label>Tags</label><input name="tags" className="form-control" defaultValue={(editingProject.tags||[]).join(', ')}/></div>
              <div className="modal-foot"><button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">Update</button></div>
            </form>
          </div>
        </div>
      )}

      {modal === 'addBlock' && (
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}>
          <div className="modal">
            <div className="modal-head"><h3>📅 Add Block</h3><button className="btn-ghost" onClick={()=>setModal(null)}>×</button></div>
            <form onSubmit={handleAddBlock}>
              <div className="form-group"><label>Title *</label><input name="title" className="form-control" placeholder="e.g. Study Session" required/></div>
              <div className="form-row">
                <div className="form-group"><label>Type</label><select name="type" className="form-control"><option value="work">💼 Work</option><option value="study">📚 Study</option><option value="break">☕ Break</option><option value="personal">🏠 Personal</option></select></div>
                <div className="form-group"><label>Day</label><select name="day" className="form-control" defaultValue={blockFormDefaults.day??0}>{DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Start</label><input name="start" type="time" className="form-control" defaultValue={blockFormDefaults.hour!=null?`${String(blockFormDefaults.hour).padStart(2,'0')}:00`:'09:00'}/></div>
                <div className="form-group"><label>End</label><input name="end" type="time" className="form-control" defaultValue={blockFormDefaults.hour!=null?`${String(blockFormDefaults.hour+1).padStart(2,'0')}:00`:'10:00'}/></div>
              </div>
              <div className="form-group"><label>Project (optional)</label><select name="project" className="form-control"><option value="">— None —</option>{projects.filter(p=>p.status==='active').map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div className="modal-foot"><button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">Add Block</button></div>
            </form>
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map(t=>(
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{{success:'✅',error:'❌',info:'ℹ️'}[t.type]}</span><span>{t.msg}</span>
          </div>
        ))}
      </div>
    </>
  );
}
