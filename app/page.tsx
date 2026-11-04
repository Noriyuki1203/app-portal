import {getPublishedApps} from "@/data/apps"
import AppCard from "@/components/AppCard"

export default function Home(){
  const apps = getPublishedApps();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">アプリ一覧</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {apps.map((app)=>(
          <li key={app.id}>
            <AppCard app={app} />
          </li>
        ))}
      </ul>
    </main>
  )
}