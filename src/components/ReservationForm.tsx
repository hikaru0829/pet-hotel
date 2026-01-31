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
      <div className="space-y-6 max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">予約内容の確認</h2>
        
        <div className="space-y-4 text-sm text-gray-700">
          <div className="grid grid-cols-3 border-b pb-2">
            <span className="font-medium text-gray-500">ご利用タイプ</span>
            <span className="col-span-2 text-gray-900 font-semibold">
              {formData.serviceType === 'STAY' ? 'お泊まり' : '日帰り'}
            </span>
          </div>
          <div className="grid grid-cols-3 border-b pb-2">
            <span className="font-medium text-gray-500">お名前</span>
            <span className="col-span-2">{formData.ownerName}</span>
          </div>
          <div className="grid grid-cols-3 border-b pb-2">
            <span className="font-medium text-gray-500">電話番号</span>
            <span className="col-span-2">{formData.phone}</span>
          </div>
          <div className="grid grid-cols-3 border-b pb-2">
            <span className="font-medium text-gray-500">メールアドレス</span>
            <span className="col-span-2">{formData.email}</span>
          </div>
          <div className="grid grid-cols-3 border-b pb-2">
            <span className="font-medium text-gray-500">ペット名</span>
            <span className="col-span-2">{formData.petName}</span>
          </div>
          <div className="grid grid-cols-3 border-b pb-2">
            <span className="font-medium text-gray-500">
              {formData.serviceType === 'STAY' ? '宿泊期間' : '予約日'}
            </span>
            <span className="col-span-2">
              {formData.date} {formData.serviceType === 'STAY' && ` 〜 ${formData.endTime}`}
              {formData.serviceType !== 'STAY' && ` ${formData.startTime}`}
            </span>
          </div>
          <div className="grid grid-cols-3 border-b pb-2">
            <span className="font-medium text-gray-500">送迎</span>
            <span className="col-span-2">
              {formData.pickupOption === 'YES' ? `希望する (${formData.pickupTime}頃)` : `希望しない (${formData.pickupTime}頃来店)`}
            </span>
          </div>
          {formData.notes && (
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="font-medium text-gray-500">備考</span>
              <span className="col-span-2">{formData.notes}</span>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleBack}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            修正する
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? '送信中...' : 'この内容で予約する'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleNext} className="space-y-6 max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{service.name} 予約</h2>
        <Link href="/" className="text-sm text-indigo-600 hover:underline">トップに戻る</Link>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">お客様情報</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">お名前 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">電話番号 <span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">メールアドレス <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">ペット情報</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">登録済みペットから選択</label>
          <select
            name="petId"
            value={formData.petId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
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
          <label className="block text-sm font-medium text-gray-700">ペットの名前 <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="petName"
            value={formData.petName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">予約詳細</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">ご利用タイプ <span className="text-red-500">*</span></label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center">
              <input
                type="radio"
                name="serviceType"
                value="DAYCARE"
                checked={formData.serviceType === 'DAYCARE'}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value as 'DAYCARE' | 'STAY' | 'GROOMING' }))}
                className="mr-2"
              />
              日帰り
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="serviceType"
                value="STAY"
                checked={formData.serviceType === 'STAY'}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value as 'DAYCARE' | 'STAY' | 'GROOMING' }))}
                className="mr-2"
              />
              お泊まり
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {formData.serviceType === 'STAY' ? 'チェックイン日' : '予約日'} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>

        {formData.serviceType === 'STAY' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">チェックアウト日 <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
        )}

        {(formData.serviceType === 'DAYCARE' || formData.serviceType === 'GROOMING') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">開始希望時間</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">送迎のご希望 <span className="text-red-500">*</span></label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="pickupOption"
                value="YES"
                checked={formData.pickupOption === 'YES'}
                onChange={handleChange}
                className="mr-2"
              />
              あり
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="pickupOption"
                value="NO"
                checked={formData.pickupOption === 'NO'}
                onChange={handleChange}
                className="mr-2"
              />
              なし
            </label>
          </div>
          <div>
            <label className="block text-sm text-gray-600">
              {formData.pickupOption === 'YES' ? 'お迎え希望時間' : 'ご来店予定時間'}
            </label>
            <input
              type="time"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        {formData.serviceType === 'GROOMING' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">トリミングオプション</label>
            <textarea
              name="groomingOptions"
              value={formData.groomingOptions}
              onChange={handleChange}
              placeholder="シャンプー、カット、爪切りなど"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              rows={2}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">その他備考・連絡事項</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            rows={3}
          />
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="vaccinesUpToDate"
            name="vaccinesUpToDate"
            type="checkbox"
            checked={formData.vaccinesUpToDate}
            onChange={handleChange}
            required
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="vaccinesUpToDate" className="font-medium text-gray-700">
            ワクチン接種済みであることを確認しました <span className="text-red-500">*</span>
          </label>
          <p className="text-gray-500">
            狂犬病および混合ワクチンの接種証明書を当日ご持参ください。
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        確認画面へ進む
      </button>
    </form>
  )
}
