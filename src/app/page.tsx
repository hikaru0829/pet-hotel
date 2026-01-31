import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  try {
    const services = await prisma.service.findMany()

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              ペット保育園・ホテル・トリミング
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              大切なペットに、最高のケアと安心を。
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Service List */}
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:gap-x-8">
            {services.map((service) => (
              <div key={service.id} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-2">
                    {service.type === 'DAYCARE' ? '保育園' : service.type === 'STAY' ? '宿泊' : 'トリミング'}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-indigo-600">
                      ¥{service.price.toLocaleString()}
                    </span>
                    <Link
                      href={`/reserve/${service.type.toLowerCase()}/${service.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      予約する
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes Section */}
          <section className="mt-16 bg-indigo-50 rounded-2xl p-8 shadow-inner">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">ご利用にあたって</h2>
            <ul className="list-disc list-inside space-y-2 text-indigo-800">
              <li>狂犬病および混合ワクチンの接種証明書を必ずご持参ください。</li>
              <li>持病やアレルギーがある場合は、事前にお知らせください。</li>
              <li>キャンセルの場合は、前日までにご連絡をお願いいたします。</li>
            </ul>
          </section>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Home Page Error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Internal Server Error</h1>
          <p className="text-gray-600 mb-4">データの取得中にエラーが発生しました。</p>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
            {error instanceof Error ? error.message : String(error)}
          </pre>
          <Link 
            href="/"
            className="mt-6 block w-full py-2 bg-indigo-600 text-white rounded text-center hover:bg-indigo-700"
          >
            トップページを再読み込み
          </Link>
        </div>
      </div>
    )
  }
}