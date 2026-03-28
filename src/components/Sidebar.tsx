import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Tag, RefreshCw, Settings } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Products', icon: ShoppingBag, href: '/products' },
  { label: 'Attributes', icon: Tag, href: '/attributes' },
  { label: 'Sync Status', icon: RefreshCw, href: '/sync' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            P
          </div>
          PIM Sync
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700" />
          <div>
            <p className="text-sm font-medium text-white">Kellidan Fernandes</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}
