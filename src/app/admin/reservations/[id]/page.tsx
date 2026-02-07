import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function AdminReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      service: true,
      pet: true,
    },
  })

  if (!reservation) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-3xl overflow-hidden border border-orange-100 dark:border-orange-900">
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">予約詳細 (管理者用)</h1>
          <button onClick={() => window.history.back()} className="text-orange-100 hover:text-white text-sm font-semibold transition-colors">← 一覧に戻る</button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h2 className="text-lg font-bold border-b-2 border-orange-200 dark:border-orange-800 pb-2 mb-3 text-gray-800 dark:text-gray-100">👤 予約者情報</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-500 dark:text-gray-400">お名前</div>
              <div className="text-gray-900 dark:text-gray-100">{reservation.ownerName} 様</div>
              <div className="text-gray-500 dark:text-gray-400">電話番号</div>
              <div className="text-gray-900 dark:text-gray-100">{reservation.phone}</div>
              <div className="text-gray-500 dark:text-gray-400">メールアドレス</div>
              <div className="text-gray-900 dark:text-gray-100">{reservation.email}</div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold border-b-2 border-orange-200 dark:border-orange-800 pb-2 mb-3 text-gray-800 dark:text-gray-100">🐾 ペット情報</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-500 dark:text-gray-400">ペット名</div>
              <div className="text-gray-900 dark:text-gray-100">{reservation.petName}</div>
              <div className="text-gray-500 dark:text-gray-400">登録済みデータ</div>
              <div className="text-gray-900 dark:text-gray-100">{reservation.pet ? `${reservation.pet.name} (${reservation.pet.type})` : '未登録（新規）'}</div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold border-b-2 border-orange-200 dark:border-orange-800 pb-2 mb-3 text-gray-800 dark:text-gray-100">📅 予約内容</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-500 dark:text-gray-400">サービス</div>
              <div className="text-gray-900 dark:text-gray-100">{reservation.service.name}</div>
              <div className="text-gray-500 dark:text-gray-400">利用タイプ</div>
              <div className="text-gray-900 dark:text-gray-100">{reservation.serviceType === 'STAY' ? '宿泊' : '日帰り'}</div>
              <div className="text-gray-500 dark:text-gray-400">予約日/開始日</div>
              <div className="text-gray-900 dark:text-gray-100">{new Date(reservation.date).toLocaleDateString('ja-JP')} {reservation.startTime && ` ${new Date(reservation.startTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`}</div>
              {reservation.serviceType === 'STAY' && (
                <>
                  <div className="text-gray-500 dark:text-gray-400">終了日</div>
                  <div className="text-gray-900 dark:text-gray-100">{reservation.endTime ? new Date(reservation.endTime).toLocaleDateString('ja-JP') : '-'}</div>
                </>
              )}
              <div className="text-gray-500 dark:text-gray-400">送迎</div>
              <div className="text-gray-900 dark:text-gray-100">{reservation.pickupOption === 'YES' ? `あり (${reservation.pickupTime}頃)` : `なし (${reservation.pickupTime}頃来店)`}</div>
              <div className="text-gray-500 dark:text-gray-400">ステータス</div>
              <div className="font-bold text-green-600 dark:text-green-400">{reservation.status}</div>
            </div>
          </section>

          {reservation.notes && (
            <section>
              <h2 className="text-lg font-bold border-b-2 border-orange-200 dark:border-orange-800 pb-2 mb-3 text-gray-800 dark:text-gray-100">⚠️ 備考</h2>
              <p className="text-sm bg-orange-50 dark:bg-gray-700 p-4 rounded-xl border border-orange-100 dark:border-orange-800 whitespace-pre-wrap text-gray-900 dark:text-gray-100">{reservation.notes}</p>
            </section>
          )}

          {reservation.groomingOptions && (
            <section>
              <h2 className="text-lg font-bold border-b-2 border-orange-200 dark:border-orange-800 pb-2 mb-3 text-gray-800 dark:text-gray-100">✨ トリミングオプション</h2>
              <p className="text-sm bg-orange-50 dark:bg-gray-700 p-4 rounded-xl border border-orange-100 dark:border-orange-800 whitespace-pre-wrap text-gray-900 dark:text-gray-100">{reservation.groomingOptions}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
