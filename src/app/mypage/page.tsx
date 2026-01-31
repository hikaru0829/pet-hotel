import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function MyPage() {
  // In a real app, get the user ID from the session
  const user = await prisma.user.findFirst()
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
          <Link href="/" className="text-indigo-600 hover:underline">トップへ戻る</Link>
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">マイページ</h1>
          <Link href="/" className="text-indigo-600 hover:underline">トップへ戻る</Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {reservations.length === 0 ? (
              <li className="p-8 text-center text-gray-500">
                まだ予約がありません。
              </li>
            ) : (
              reservations.map((res) => (
                <li key={res.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {res.service.name} ({res.serviceType === 'STAY' ? '宿泊' : '日帰り'})
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          予約完了
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          予約日: {new Date(res.date).toLocaleDateString('ja-JP')}
                          {res.serviceType === 'STAY' && res.endTime && ` 〜 ${new Date(res.endTime).toLocaleDateString('ja-JP')}`}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          ペット: {res.petName}
                        </p>
                      </div>
                    </div>
                    {res.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 italic">
                          備考: {res.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
