/**
 * Admin Users Tab - User management
 */
import React, { useState } from 'react';
import { 
  Users, Search, Crown, Zap, Trash2, Edit, Mail,
  CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminUsers = ({ 
  telegramUsers = [], 
  webUsers = [],
  onRefresh,
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeUserTab, setActiveUserTab] = useState('telegram');
  const [updating, setUpdating] = useState(null);
  
  const updateSubscription = async (userId, type, newSubscription) => {
    setUpdating(userId);
    try {
      if (type === 'telegram') {
        await axios.put(`${API}/admin/telegram-users/${userId}/subscription`, {
          subscription: newSubscription
        });
      } else {
        await axios.put(`${API}/admin/users/${userId}/subscription`, {
          subscription: newSubscription
        });
      }
      toast.success('Subscription aktualisiert');
      onRefresh?.();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    }
    setUpdating(null);
  };
  
  const deleteUser = async (userId, type) => {
    if (!confirm('Benutzer wirklich löschen?')) return;
    
    try {
      if (type === 'telegram') {
        await axios.delete(`${API}/admin/telegram-users/${userId}`);
      } else {
        await axios.delete(`${API}/admin/users/${userId}`);
      }
      toast.success('Benutzer gelöscht');
      onRefresh?.();
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };
  
  const filteredTelegramUsers = telegramUsers.filter(u => 
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.telegram_id || '').includes(searchTerm)
  );
  
  const filteredWebUsers = webUsers.filter(u =>
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const SubscriptionBadge = ({ level }) => {
    const colors = {
      free: 'bg-white/10 text-[#A1A1AA]',
      pro: 'bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/30',
      elite: 'bg-[#FFD60A]/20 text-[#FFD60A] border border-[#FFD60A]/30'
    };
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${colors[level] || colors.free}`}>
        {level || 'free'}
      </span>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#39FF14]/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-[#39FF14]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Benutzer verwalten</h2>
            <p className="text-sm text-[#A1A1AA]">
              {telegramUsers.length} Telegram / {webUsers.length} Web
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <Input 
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#121212] border-white/10 w-64"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveUserTab('telegram')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeUserTab === 'telegram'
              ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30'
              : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
          }`}
        >
          Telegram ({telegramUsers.length})
        </button>
        <button
          onClick={() => setActiveUserTab('web')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeUserTab === 'web'
              ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/30'
              : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
          }`}
        >
          Web ({webUsers.length})
        </button>
      </div>
      
      {/* Users Table */}
      <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
        {activeUserTab === 'telegram' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Telegram ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Subscription</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Ligen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTelegramUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#A1A1AA]">
                      {searchTerm ? 'Keine Benutzer gefunden' : 'Keine Telegram-Benutzer'}
                    </td>
                  </tr>
                ) : (
                  filteredTelegramUsers.map((user) => (
                    <tr key={user.telegram_id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white">
                        @{user.username || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-[#A1A1AA] font-mono text-sm">
                        {user.telegram_id}
                      </td>
                      <td className="px-4 py-3">
                        <SubscriptionBadge level={user.subscription_level} />
                      </td>
                      <td className="px-4 py-3 text-[#A1A1AA] text-sm">
                        {(user.subscribed_leagues || []).length} Ligen
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <select
                            value={user.subscription_level || 'free'}
                            onChange={(e) => updateSubscription(user.telegram_id, 'telegram', e.target.value)}
                            disabled={updating === user.telegram_id}
                            className="bg-[#0a0a0a] border border-white/10 rounded px-2 py-1 text-xs text-white"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="elite">Elite</option>
                          </select>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            onClick={() => deleteUser(user.telegram_id, 'telegram')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">E-Mail</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Subscription</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#A1A1AA] uppercase">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredWebUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#A1A1AA]">
                      {searchTerm ? 'Keine Benutzer gefunden' : 'Keine Web-Benutzer'}
                    </td>
                  </tr>
                ) : (
                  filteredWebUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white">{user.email}</td>
                      <td className="px-4 py-3 text-[#A1A1AA]">{user.name || '-'}</td>
                      <td className="px-4 py-3">
                        <SubscriptionBadge level={user.subscription} />
                      </td>
                      <td className="px-4 py-3">
                        {user.is_admin ? (
                          <CheckCircle className="w-4 h-4 text-[#39FF14]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#A1A1AA]" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <select
                            value={user.subscription || 'free'}
                            onChange={(e) => updateSubscription(user._id, 'web', e.target.value)}
                            disabled={updating === user._id}
                            className="bg-[#0a0a0a] border border-white/10 rounded px-2 py-1 text-xs text-white"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="elite">Elite</option>
                          </select>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            onClick={() => deleteUser(user._id, 'web')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
