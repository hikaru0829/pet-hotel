'use client'

import Link from 'next/link'

export default function ReservationSuccessPage() {
  const handleClose = () => {
    window.close()
    // ほとんどのブラウザではスクリプトで開いたタブ以外は閉じられないため、
    // 閉じられなかった場合の案内を出すなどの工夫が一般的ですが、
    // ここではシンプルにcloseを呼び出します。
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">予約を承りました！</h1>
        <p className="text-gray-600 mb-8">
          予約リクエストが送信されました。内容に確認事項がある場合のみ、スタッフよりご連絡させていただきます。
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium text-center"
          >
            トップページへ戻る
          </Link>
          <button
            onClick={handleClose}
            className="block w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            画面を閉じる
          </button>
        </div>
      </div>
    </div>
  )
}