import { createClient } from '~/utils/supabase/server'
import { cookies } from 'next/headers'

// Exemple d'utilisation dans un Server Component
export default async function ExamplePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Exemple de requête à une table 'todos'
  const { data: todos, error } = await supabase.from('todos').select()

  if (error) {
    console.error('Erreur Supabase:', error)
    return <div>Erreur lors du chargement des données</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Exemple Supabase</h1>
      <ul className="space-y-2">
        {todos?.map((todo, index) => (
          <li key={index} className="p-2 bg-gray-100 rounded">
            {JSON.stringify(todo)}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Exemple d'utilisation dans un Client Component
'use client'

import { createClient } from '~/utils/supabase/client'
import { useEffect, useState } from 'react'

export function ExampleClientComponent() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: todos, error } = await supabase.from('todos').select()
        if (error) throw error
        setData(todos || [])
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Chargement...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Client Component</h2>
      <ul className="space-y-2">
        {data.map((item, index) => (
          <li key={index} className="p-2 bg-blue-100 rounded">
            {JSON.stringify(item)}
          </li>
        ))}
      </ul>
    </div>
  )
}