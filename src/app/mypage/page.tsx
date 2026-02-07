import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function MyPage() {
  // In a real app, get the user ID from the session
  const user = await prisma.user.findFirst()
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">ログインが必要です</h1>
          <Link href="/" className="text-orange-600 dark:text-orange-400 hover:text-pink-600 dark:hover:text-pink-400 font-semibold transition-colors">トップへ戻る</Link>
        </div>
      </div>
    )
  }

  const reservations = await prisma.reservation.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { service: true }
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">マイページ</h1>
          <Link href="/" className="text-orange-600 dark:text-orange-400 hover:text-pink-600 dark:hover:text-pink-400 font-semibold transition-colors">トップへ戻る</Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg overflow-hidden sm:rounded-2xl border border-orange-100 dark:border-orange-900">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {reservations.length === 0 ? (
              <li className="p-8 text-center text-gray-500 dark:text-gray-400">
                まだ予約がありません。
              </li>
            ) : (
              reservations.map((res) => (
                <li key={res.id}>
                  <Link href={`/admin/reservations/${res.id}`}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-orange-600 dark:text-orange-400 truncate">
                          {res.service.name} ({res.serviceType === 'STAY' ? '宿泊' : '日帰り'})
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            予約完了
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            📅 {new Date(res.date).toLocaleDateString('ja-JP')}
                            {res.serviceType === 'STAY' && res.endTime && ` 〜 ${new Date(res.endTime).toLocaleDateString('ja-JP')}`}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400 sm:mt-0">
                          <p>
                            🐾 {res.petName}
                          </p>
                        </div>
                      </div>
                      {res.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                            備考: {res.notes.substring(0, 50)}...
                          </p>
                        </div>
                      )}
                      <div className="mt-3 text-sm text-orange-600 dark:text-orange-400 font-semibold">
                        詳細を見る →
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
