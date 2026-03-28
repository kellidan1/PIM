import { Sidebar } from '@/components/Sidebar'
import { Settings, Save, Smartphone, Globe, Shield, RefreshCw } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-slate-950 font-sans">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-12">
        <header className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2 underline decoration-blue-500 underline-offset-8">General Settings</h2>
          <p className="text-slate-400">Configure your WooCommerce connection and PIM defaults.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-white">
          <div className="space-y-8">
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Globe className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">WooCommerce Integration</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: "Store URL", placeholder: "https://your-store.com", value: process.env.WOO_URL },
                  { label: "Consumer Key", placeholder: "ck_xxxxxxxxxxxxxxxxx", value: "ck_••••••••••••••••" },
                  { label: "Consumer Secret", placeholder: "cs_xxxxxxxxxxxxxxxxx", value: "cs_••••••••••••••••" }
                ].map(item => (
                  <div key={item.label} className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</label>
                    <input 
                      type="text" 
                      placeholder={item.placeholder}
                      defaultValue={item.value || ''}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold">Security</h3>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-sm">Two-Factor Authentication</p>
                <div className="w-10 h-5 bg-emerald-600 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                  <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                </div>
              </div>
               <div className="flex items-center justify-between pt-4">
                <p className="text-slate-400 text-sm">Auto-Sync on Save</p>
                <div className="w-10 h-5 bg-slate-700 rounded-full flex items-center justify-start px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="bg-blue-600/10 p-8 rounded-2xl border border-blue-500/20 text-blue-100 flex flex-col items-center text-center space-y-4">
              <RefreshCw className="w-12 h-12 text-blue-400 mb-2 animate-pulse" />
              <h3 className="text-xl font-bold">PIM Master Status</h3>
              <p className="text-sm opacity-80 leading-relaxed">Your PIM is currently connected to the staging environment. Changes will sync to the WordPress REST API synchronously on manual trigger.</p>
              <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2">
                 <Save className="w-4 h-4" />
                 Save Settings
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
