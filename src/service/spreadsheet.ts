import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const GOOGLE_SHEET_ID    = process.env.GOOGLE_SHEET_ID || "";
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || "";
const GOOGLE_PRIVATE_KEY  = process.env.GOOGLE_PRIVATE_KEY || "";

export class Spreadsheet {
    private static readonly sheetId     = GOOGLE_SHEET_ID;
    private static readonly clientEmail = GOOGLE_CLIENT_EMAIL;
    private static readonly privateKey  = GOOGLE_PRIVATE_KEY;

    private static readonly auth: JWT = new JWT({
        email: Spreadsheet.clientEmail,
        key: Spreadsheet.privateKey.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    private static readonly doc: GoogleSpreadsheet = new GoogleSpreadsheet(
        Spreadsheet.sheetId,
        Spreadsheet.auth
    );

    static async write(rows: Record<string, any>[]): Promise<boolean> {
        try {
            await this.doc.loadInfo();
            const sheet = this.doc.sheetsByIndex[0];
            await sheet.addRows(rows);
            return true;
        } catch (error: any) {
            console.error("Error writing to sheet:", error?.response?.data || error);
            return false;
        }
    }
}
