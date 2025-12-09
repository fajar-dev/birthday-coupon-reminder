import axios, { AxiosInstance } from 'axios'

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com'
const WHATSAPP_API_PHONE_ID = process.env.WHATSAPP_API_PHONE_ID || ''
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0'
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || ''

export class Whatsapp {
    private static readonly apiUrl = WHATSAPP_API_URL
    private static readonly version = WHATSAPP_API_VERSION
    private static readonly phoneId = WHATSAPP_API_PHONE_ID

    private static readonly http: AxiosInstance = axios.create({
        baseURL: `${this.apiUrl}/${this.version}/${this.phoneId}`,
        headers: {
            Authorization: `Bearer ${WHATSAPP_API_KEY}`,
            Accept: "application/json",
        },
    })

    static async sendMessage(phone: number, type: string, body: any): Promise<void> {
        const res = await this.http.post<any>("/messages",{
            messaging_product: "whatsapp",
            to: phone,
            type: type,
            [type]: body
        },{
            headers: {
                "Content-Type": "application/json",
            },
        })
    }

    static async sendReminder(phone: number, name:string): Promise<void> {
        const payload = {
        name: "reminder_coupon_birthday",
        language: { "code": "en" },
        components: [
            {
                type: "header",
                parameters: [
                    {
                        type: "text",
                        text: name
                    }
                ]
            }
        ]
    }
        await this.sendMessage(phone, "template" , payload)
    }
}