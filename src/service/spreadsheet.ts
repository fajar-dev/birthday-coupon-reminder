import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const GOOGLE_SHEET_ID    = process.env.GOOGLE_SHEET_ID || ""
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || ""
const GOOGLE_PRIVATE_KEY  = process.env.GOOGLE_PRIVATE_KEY || ""

export class Spreadsheet {
    private static readonly sheetId     = GOOGLE_SHEET_ID
    private static readonly clientEmail = GOOGLE_CLIENT_EMAIL
    private static readonly privateKey  = GOOGLE_PRIVATE_KEY

    private static readonly auth: JWT = new JWT({
        email: Spreadsheet.clientEmail,
        key: Spreadsheet.privateKey.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    private static readonly doc: GoogleSpreadsheet = new GoogleSpreadsheet(
        Spreadsheet.sheetId,
        Spreadsheet.auth
    )

    static async write(rows: Record<string, any>[]): Promise<boolean> {
        try {
            await this.doc.loadInfo()
            const sheet = this.doc.sheetsByIndex[0]
            await sheet.addRows(rows)
            return true
        } catch (error: any) {
            console.error("Error writing to sheet:", error?.response?.data || error)
            return false
        }
    }

    static async read<T = any>(
        sheetIndex: number,
        date: string,
        stage: string
    ): Promise<(T & { rowNumber: number })[]> {
        try {
            await this.doc.loadInfo()
            const sheet = this.doc.sheetsByIndex[sheetIndex]
            const rows = await sheet.getRows()

            return rows
                .map(row => ({ row, obj: row.toObject() }))
                .filter(({ obj }) => 
                    obj["Birthday Date"] === date &&
                    obj["Stage"] === stage
                )
                .map(({ row, obj }) => {
                    const mapped = {
                        name: obj["Name"],
                        employeeId: obj["Employee ID"],
                        whatsapp: obj["Whatsapp"],
                        birthdayDate: obj["Birthday Date"],
                        stage: obj["Stage"],
                    }
                    return {
                        ...(mapped as T),
                        rowNumber: row.rowNumber
                    }
                })
        } catch (error: any) {
            console.error("Error reading from sheet:", error?.response?.data || error)
            return []
        }
    }

    static async updateStage<T = any>(
        sheetIndex: number,
        stage: string,
        rowNumber: number
    ): Promise<void> {
        try {
            await this.doc.loadInfo()
            const sheet = this.doc.sheetsByIndex[sheetIndex]
            const rows = await sheet.getRows()

            const targetRow = rows.find(row => row.rowNumber === rowNumber)

            if (!targetRow) {
                console.error(`Row with rowNumber ${rowNumber} not found`)
                return
            }

            targetRow.set("Stage", stage)

            await targetRow.save()
            console.log(`Row ${rowNumber} updated stage=${stage}`)
        } catch (error: any) {
            console.error("Error updating sheet:", error?.response?.data || error)
        }
    }

}


