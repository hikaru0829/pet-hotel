'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Pet {
  id: string
  name: string
  type: string
  vaccinesUpToDate: boolean
}

interface Service {
  id: string
  name: string
  type: 'DAYCARE' | 'STAY' | 'GROOMING'
  price: number
}

interface ReservationFormProps {
  service: Service
  pets: Pet[]
  ownerId: string
}

import Link from 'next/link'

export default function ReservationForm({ service, pets, ownerId }: ReservationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'INPUT' | 'CONFIRM'>('INPUT')

  const [formData, setFormData] = useState({
    serviceType: service.type,
    ownerName: '',
    phone: '',
    email: '',
    petName: '',
    petId: '',
    date: '',
    endTime: '', // used for STAY end date
    startTime: '09:00', // used for time slot
    pickupOption: 'NO' as 'YES' | 'NO',
    pickupTime: '09:00',
    vaccinesUpToDate: false,
    groomingOptions: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    
    if (name === 'petId' && value !== '') {
      const selectedPet = pets.find(p => p.id === value)
      if (selectedPet) {
        setFormData(prev => ({ ...prev, petId: value, petName: selectedPet.name }))
        return
      }
    }
    
    setFormData((prev) => ({ ...prev, [name]: val }))
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('CONFIRM')
  }

  const handleBack = () => {
    setStep('INPUT')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const payload = {
        serviceType: formData.serviceType,
        serviceId: service.id,
        ownerId: ownerId,
        petId: formData.petId,
        ownerName: formData.ownerName,
        phone: formData.phone,
        email: formData.email,
        petName: formData.petName,
        date: formData.date,
        startTime: formData.serviceType !== 'STAY' && formData.startTime 
          ? `${formData.date}T${formData.startTime}:00` 
          : undefined,
        endTime: formData.serviceType === 'STAY' 
          ? `${formData.endTime}T00:00:00` 
          : (formData.startTime ? `${formData.date}T${formData.startTime}:00` : undefined),
        pickupOption: formData.pickupOption,
        pickupTime: formData.pickupTime,
        vaccinesUpToDate: formData.vaccinesUpToDate,
        groomingOptions: formData.groomingOptions || undefined,
        notes: formData.notes,
      }

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create reservation')
      }

      router.push('/reserve/success')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setStep('INPUT')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'CONFIRM') {
    return (
      <div className="space-y-6 max-w-lg mx-auto p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-orange-100 dark:border-orange-900">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-pink-400 mb-6">予約内容の確認</h2>
        
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl border border-orange-100 dark:border-orange-900">
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-orange-200 dark:border-orange-800">
            <span className="font-semibold text-gray-600 dark:text-gray-400">ご利用タイプ</span>
            <span className="col-span-2 font-semibold text-gray-900 dark:text-gray-100">
              {formData.serviceType === 'STAY' ? 'お泊まり' : '日帰り'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-orange-200 dark:border-orange-800">
            <span className="font-semibold text-gray-600 dark:text-gray-400">お名前</span>
            <span className="col-span-2 text-gray-900 dark:text-gray-100">{formData.ownerName}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-orange-200 dark:border-orange-800">
            <span className="font-semibold text-gray-600 dark:text-gray-400">電話番号</span>
            <span className="col-span-2 text-gray-900 dark:text-gray-100">{formData.phone}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-orange-200 dark:border-orange-800">
            <span className="font-semibold text-gray-600 dark:text-gray-400">メールアドレス</span>
            <span className="col-span-2 text-gray-900 dark:text-gray-100">{formData.email}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-orange-200 dark:border-orange-800">
            <span className="font-semibold text-gray-600 dark:text-gray-400">ペット名</span>
            <span className="col-span-2 text-gray-900 dark:text-gray-100">{formData.petName}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-orange-200 dark:border-orange-800">
            <span className="font-semibold text-gray-600 dark:text-gray-400">
              {formData.serviceType === 'STAY' ? '宿泊期間' : '予約日'}
            </span>
            <span className="col-span-2 text-gray-900 dark:text-gray-100">
              {formData.date} {formData.serviceType === 'STAY' && ` 〜 ${formData.endTime}`}
              {formData.serviceType !== 'STAY' && ` ${formData.startTime}`}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-orange-200 dark:border-orange-800">
            <span className="font-semibold text-gray-600 dark:text-gray-400">送迎</span>
            <span className="col-span-2 text-gray-900 dark:text-gray-100">
              {formData.pickupOption === 'YES' ? `希望する (${formData.pickupTime}頃)` : `希望しない (${formData.pickupTime}頃来店)`}
            </span>
          </div>
          {formData.notes && (
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-gray-600 dark:text-gray-400">備考</span>
              <span className="col-span-2 text-gray-900 dark:text-gray-100">{formData.notes}</span>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleBack}
            className="flex-1 py-3 px-4 border border-orange-200 dark:border-orange-700 rounded-full text-sm font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900 transition-colors"
          >
            修正する
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 px-4 border border-transparent rounded-full text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50"
          >
            {loading ? '送信中...' : 'この内容で予約する'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleNext} className="space-y-6 max-w-lg mx-auto p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-orange-100 dark:border-orange-900">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-400 dark:to-pink-400 bg-clip-text text-transparent">{service.name} 予約</h2>
        <Link href="/" className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">トップに戻る</Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 rounded-2xl flex gap-3">
          <span className="text-xl">⚠️</span>
          <div>{error}</div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-b-2 border-orange-200 dark:border-orange-800 pb-3">👤 お客様情報</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">お名前 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-2 border-orange-100 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100 shadow-sm focus:border-orange-500 focus:ring-orange-300 focus:ring-2 sm:text-sm p-3 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">電話番号 <span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-2 border-orange-100 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100 shadow-sm focus:border-orange-500 focus:ring-orange-300 focus:ring-2 sm:text-sm p-3 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">メールアドレス <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-2 border-orange-100 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100 shadow-sm focus:border-orange-500 focus:ring-orange-300 focus:ring-2 sm:text-sm p-3 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-b-2 border-orange-200 dark:border-orange-800 pb-3">🐾 ペット情報</h3>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">登録済みペットから選択</label>
          <select
            name="petId"
            value={formData.petId}
            onChange={handleChange}
            className="w-full rounded-xl border-2 border-orange-100 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100 shadow-sm focus:border-orange-500 focus:ring-orange-300 focus:ring-2 sm:text-sm p-3 transition-colors"
          >
            <option value="">選択してください（新規の場合は以下に入力）</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.type})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ペットの名前 <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="petName"
            value={formData.petName}
            onChange={handleChange}
            required
            className="w-full rounded-xl border-2 border-orange-100 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100 shadow-sm focus:border-orange-500 focus:ring-orange-300 focus:ring-2 sm:text-sm p-3 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 border-b-2 border-orange-200 dark:border-orange-800 pb-3">📅 予約詳細</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ご利用タイプ <span className="text-red-500">*</span></label>
          <div className="flex gap-4 mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="serviceType"
                value="DAYCARE"
                checked={formData.serviceType === 'DAYCARE'}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value as 'DAYCARE' | 'STAY' | 'GROOMING' }))}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-gray-700 dark:text-gray-300">日帰り</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="serviceType"
                value="STAY"
                checked={formData.serviceType === 'STAY'}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value as 'DAYCARE' | 'STAY' | 'GROOMING' }))}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-gray-700 dark:text-gray-300">お泊まり</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {formData.serviceType === 'STAY' ? 'チェックイン日' : '予約日'} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full rounded-xl border-2 border-orange-100 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100 shadow-sm focus:border-orange-500 focus:ring-orange-300 focus:ring-2 sm:text-sm p-3 transition-colors"
          />
        </div>

        {formData.serviceType === 'STAY' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">チェックアウト日 <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-2 border-orange-100 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100 shadow-sm focus:border-orange-500 focus:ring-orange-300 focus:ring-2 sm:text-sm p-3 transition-colors"
            />
          </div>
        )}

        {(formData.serviceType === 'DAYCARE' || formData.serviceType === 'GROOMING') && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">開始希望時間</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full rounded-xl border-2 border-orange-100 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100 shadow-sm focus:border-orange-500 focus:ring-orange-300 focus:ring-2 sm:text-sm p-3 transition-colors"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">送迎のご希望 <span className="text-red-500">*</span></label>
          <div className="flex gap-4 mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="pickupOption"
                value="YES"
                checked={formData.pickupOption === 'YES'}
                onChange={handleChange}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-gray-700 dark:text-gray-300">あり</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="pickupOption"
                value="NO"
                checked={formData.pickupOption === 'NO'}
                onChange={handleChange}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-gray-700 dark:text-gray-300">なし</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {formData.pickupOption === 'YES' ? 'お迎え希望時間' : 'ご来店予定時間'}
            </label>
            <input
              type="time"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-2 border-orange-100 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100 shadow-sm focus:border-orange-500 focus:ring-orange-300 focus:ring-2 sm:text-sm p-3 transition-colors"
            />
          </div>
        </div>

        {formData.serviceType === 'GROOMING' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">トリミングオプション</label>
            <textarea
              name="groomingOptions"
              value={formData.groomingOptions}
              onChange={handleChange}
              placeholder="シャンプー、カット、爪切りなど"
              className="w-full rounded-xl border-2 border-orange-100 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 shadow-sm focus:border-orange-500 focus:ring-orange-300 focus:ring-2 sm:text-sm p-3 transition-colors"
              rows={2}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">その他備考・連絡事項</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full rounded-xl border-2 border-orange-100 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 shadow-sm focus:border-orange-500 focus:ring-orange-300 focus:ring-2 sm:text-sm p-3 transition-colors"
            rows={3}
          />
        </div>
      </div>

      <div className="flex items-start gap-4 bg-orange-50 dark:bg-orange-900 p-4 rounded-2xl border border-orange-100 dark:border-orange-700">
        <div className="flex items-center h-5 pt-1">
          <input
            id="vaccinesUpToDate"
            name="vaccinesUpToDate"
            type="checkbox"
            checked={formData.vaccinesUpToDate}
            onChange={handleChange}
            required
            className="w-5 h-5 accent-orange-500 rounded"
          />
        </div>
        <div className="text-sm">
          <label htmlFor="vaccinesUpToDate" className="font-semibold text-gray-700 dark:text-gray-200">
            ワクチン接種済みであることを確認しました <span className="text-red-500">*</span>
          </label>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            狂犬病および混合ワクチンの接種証明書を当日ご持参ください。
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105"
      >
        確認画面へ進む
      </button>
    </form>
  )
}
