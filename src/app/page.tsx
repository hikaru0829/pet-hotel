import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  try {
    const services = await prisma.service.findMany()

    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50">
        {/* Hero Section */}
        <header className="bg-white border-b border-orange-100">
          <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 sm:text-5xl sm:tracking-tight lg:text-6xl leading-tight">
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                ペット保育園・ホテル・トリミング
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
              大切なペットに、最高のケアと安心を。
              <br />
              <span className="text-sm text-gray-500">スタッフ一同、心をこめてお世話いたします</span>
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          {/* Service List */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-orange-100 hover:border-orange-300"
              >
                {/* Service Icon Background */}
                <div className="h-32 bg-gradient-to-br from-orange-100 via-pink-50 to-blue-100 flex items-center justify-center">
                  <div className="text-5xl">
                    {service.type === 'DAYCARE' && '🐾'}
                    {service.type === 'STAY' && '🛏️'}
                    {service.type === 'GROOMING' && '✨'}
                  </div>
                </div>

                <div className="p-6">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 mb-3">
                    {service.type === 'DAYCARE' && '保育園'}
                    {service.type === 'STAY' && '宿泊'}
                    {service.type === 'GROOMING' && 'トリミング'}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="flex items-end justify-between pt-6 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">料金</p>
                      <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                        ¥{service.price.toLocaleString()}
                      </span>
                    </div>
                    <Link
                      href={`/reserve/${service.type.toLowerCase()}/${service.id}`}
                      className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                    >
                      予約する
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes Section */}
          <section className="mt-20 bg-gradient-to-r from-orange-50 via-pink-50 to-blue-50 rounded-3xl p-8 lg:p-12 border border-orange-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">ご利用にあたって</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-2xl mt-1">📋</span>
                <span>狂犬病および混合ワクチンの接種証明書を必ずご持参ください。</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-2xl mt-1">⚠️</span>
                <span>持病やアレルギーがある場合は、事前にお知らせください。</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-2xl mt-1">📞</span>
                <span>キャンセルの場合は、前日までにご連絡をお願いいたします。</span>
              </li>
            </ul>
          </section>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Home Page Error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-blue-50">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full border border-orange-100">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h1>
            <p className="text-gray-600 mb-6">データの取得中に問題が発生いたしました。</p>
            <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-40 text-left mb-6 border border-gray-200">
              {error instanceof Error ? error.message : String(error)}
            </pre>
            <Link 
              href="/"
              className="inline-flex items-center justify-center w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              トップページを再読み込み
            </Link>
          </div>
        </div>
      </div>
    )
  }
}