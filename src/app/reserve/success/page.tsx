'use client'

import Link from 'next/link'

export default function ReservationSuccessPage() {
  const handleClose = () => {
    // スマホのブラウザでは window.close() が効かない場合があるため、トップページへ移動する
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-orange-100 dark:border-orange-900 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">予約を承りました！</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          予約リクエストが送信されました。内容に確認事項がある場合のみ、スタッフよりご連絡させていただきます。
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full hover:shadow-lg hover:from-orange-600 hover:to-pink-600 font-semibold text-center transition-all"
          >
            トップページへ戻る
          </Link>
          <button
            onClick={handleClose}
            className="block w-full py-3 px-4 border-2 border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900 font-semibold transition-colors"
          >
            画面を閉じる
          </button>
        </div>
      </div>
    </div>
  )
}