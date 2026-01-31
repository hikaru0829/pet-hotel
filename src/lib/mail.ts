import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SES_SMTP_HOST,
  port: parseInt(process.env.SES_SMTP_PORT || '587'),
  secure: process.env.SES_SMTP_PORT === '465',
  auth: {
    user: process.env.SES_SMTP_USER,
    pass: process.env.SES_SMTP_PASS,
  },
})

interface ReservationData {
  id?: string
  ownerName: string
  email: string
  phone: string
  petName: string
  serviceType: string
  date: Date | string
  endTime?: Date | string | null
  pickupOption: string
  pickupTime?: string | null
  notes?: string | null
}

/**
 * 送信者表示名
 */
const SENDER_NAME = 'てすと動物病院'

/**
 * 予約者向けの完了メールを送信
 */
export async function sendReservationEmail(reservation: ReservationData) {
  const mailOptions = {
    from: `${SENDER_NAME} <${process.env.SES_FROM_EMAIL}>`,
    to: reservation.email,
    subject: `【${SENDER_NAME}】ご予約を承りました`,
    text: `
${reservation.ownerName} 様

この度はご予約いただきありがとうございます。
以下の内容で予約を承りました。

■予約内容
サービス: ${reservation.serviceType === 'STAY' ? '宿泊' : reservation.serviceType === 'DAYCARE' ? '日帰り' : 'トリミング'}
ペット名: ${reservation.petName}
予約日: ${new Date(reservation.date).toLocaleDateString('ja-JP')}
${reservation.endTime && reservation.serviceType === 'STAY' ? `終了日: ${new Date(reservation.endTime).toLocaleDateString('ja-JP')}
` : ''}
送迎: ${reservation.pickupOption === 'YES' ? `あり (${reservation.pickupTime}頃)` : `なし (${reservation.pickupTime}頃来店)`}

■備考
${reservation.notes || 'なし'}

ご予約内容を確認いたしました。
特記事項や確認事項がある場合のみ、スタッフよりお電話またはメールにてご連絡させていただきます。
それ以外の場合は、当日そのままご来店ください。

内容に誤りがある場合や、キャンセルをご希望の場合はお早めにご連絡ください。
スタッフ一同、ご来店を心よりお待ちしております。
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Customer reservation email sent successfully')
  } catch (error) {
    console.error('Error sending customer reservation email:', error)
  }
}

/**
 * 管理者向けの通知メールを送信
 */
export async function sendAdminNotificationEmail(reservation: ReservationData) {
  const mailOptions = {
    from: `${SENDER_NAME} <${process.env.SES_FROM_EMAIL}>`,
    to: process.env.SES_FROM_EMAIL,
    subject: `【新規予約通知】${reservation.ownerName}様 / ${reservation.petName}`,
    text: `
管理者様

新しい予約が入りました。内容は以下の通りです。

■予約者情報
お名前: ${reservation.ownerName}
電話番号: ${reservation.phone}
メール: ${reservation.email}

■ペット情報
ペット名: ${reservation.petName}

■予約内容
サービス: ${reservation.serviceType === 'STAY' ? '宿泊' : reservation.serviceType === 'DAYCARE' ? '日帰り' : 'トリミング'}
日付: ${new Date(reservation.date).toLocaleDateString('ja-JP')}
${reservation.endTime && reservation.serviceType === 'STAY' ? `終了日: ${new Date(reservation.endTime).toLocaleDateString('ja-JP')}
` : ''}
送迎: ${reservation.pickupOption === 'YES' ? `あり (${reservation.pickupTime}頃)` : `なし (${reservation.pickupTime}頃来店)`}

■備考
${reservation.notes || 'なし'}

■詳細確認（管理者用URL）
${process.env.APP_URL}/admin/reservations/${reservation.id}

管理画面より詳細を確認してください。
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Admin notification email sent successfully')
  } catch (error) {
    console.error('Error sending admin notification email:', error)
  }
}