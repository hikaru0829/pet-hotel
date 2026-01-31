import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">予約詳細 (管理者用)</h1>
          <Link href="/mypage" className="text-indigo-100 hover:text-white text-sm">一覧に戻る</Link>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h2 className="text-lg font-semibold border-b pb-2 mb-3">予約者情報</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-500">お名前</div>
              <div>{reservation.ownerName} 様</div>
              <div className="text-gray-500">電話番号</div>
              <div>{reservation.phone}</div>
              <div className="text-gray-500">メールアドレス</div>
              <div>{reservation.email}</div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold border-b pb-2 mb-3">ペット情報</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-500">ペット名</div>
              <div>{reservation.petName}</div>
              <div className="text-gray-500">登録済みデータ</div>
              <div>{reservation.pet ? `${reservation.pet.name} (${reservation.pet.type})` : '未登録（新規）'}</div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold border-b pb-2 mb-3">予約内容</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-500">サービス</div>
              <div>{reservation.service.name}</div>
              <div className="text-gray-500">利用タイプ</div>
              <div>{reservation.serviceType === 'STAY' ? '宿泊' : '日帰り'}</div>
              <div className="text-gray-500">予約日/開始日</div>
              <div>{new Date(reservation.date).toLocaleDateString('ja-JP')} {reservation.startTime && ` ${new Date(reservation.startTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`}</div>
              {reservation.serviceType === 'STAY' && (
                <>
                  <div className="text-gray-500">終了日</div>
                  <div>{reservation.endTime ? new Date(reservation.endTime).toLocaleDateString('ja-JP') : '-'}</div>
                </>
              )}
              <div className="text-gray-500">送迎</div>
              <div>{reservation.pickupOption === 'YES' ? `あり (${reservation.pickupTime}頃)` : `なし (${reservation.pickupTime}頃来店)`}</div>
              <div className="text-gray-500">ステータス</div>
              <div className="font-bold text-green-600">{reservation.status}</div>
            </div>
          </section>

          {reservation.notes && (
            <section>
              <h2 className="text-lg font-semibold border-b pb-2 mb-3">備考</h2>
              <p className="text-sm bg-gray-50 p-4 rounded border whitespace-pre-wrap">{reservation.notes}</p>
            </section>
          )}

          {reservation.groomingOptions && (
            <section>
              <h2 className="text-lg font-semibold border-b pb-2 mb-3">トリミングオプション</h2>
              <p className="text-sm bg-gray-50 p-4 rounded border whitespace-pre-wrap">{reservation.groomingOptions}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
