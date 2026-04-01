'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { data } from '@/lib/sidebar'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white shadow-md h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">CRM Dashboard</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {data.navMain.map((section, sectionIndex) => (
            <li key={sectionIndex}>
              <h3 className="font-semibold text-gray-700 mb-2">{section.title}</h3>
              <ul className="pl-4 space-y-1">
                {section.items?.map((item, itemIndex) => {
                  // Generate the route path based on section and item titles
                  const routePath = `/dashboard/${section.title.toLowerCase()}/${item.title.toLowerCase().replace(/\s+/g, '-')}`
                  
                  return (
                    <li key={itemIndex}>
                      <Link 
                        href={routePath} 
                        className={`block px-3 py-2 rounded-md ${
                          pathname === routePath ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}