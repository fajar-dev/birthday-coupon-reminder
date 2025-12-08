import axios from "axios";

const NUSAWORK_API_URL = process.env.NUSAWORK_API_URL || 'https://api.nusawork.com';
const NUSAWORK_CLIENT_ID = process.env.NUSAWORK_CLIENT_ID || '';
const NUSAWORK_CLIENT_SECRET = process.env.NUSAWORK_CLIENT_SECRET || '';

export class Nusawork {
    static async nusaworkToken(): Promise<string> {
        const res = await axios.post(
            `${NUSAWORK_API_URL}/auth/api/oauth/token`,
            {
                grant_type: 'client_credentials',
                client_id: NUSAWORK_CLIENT_ID,
                client_secret: NUSAWORK_CLIENT_SECRET,
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );
        return res.data.access_token;
    }

    static async getEmployee(): Promise<any> {
        const token = await this.nusaworkToken();
        const res = await axios.post(
            `${NUSAWORK_API_URL}/emp/api/v4.2/client/employee/filter`,
            {
                fields: { active_status: ['active'] },
                is_paginate: false,
                multi_value: false,
                currentPage: 1,
            },
            {
                headers: {
                    Authorization:
                        'Bearer ' + token,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            },
        );
        return res.data.data;
    }

    static async getTodayBirthdayEmployees(): Promise<any[]> {
        const employees = await this.getEmployee();
        const today = new Date();
        const todayMonth = today.getMonth() + 1;
        const todayDate = today.getDate();

        const birthdayEmployees = employees.filter((emp: { date_of_birth?: string }) => {
            if (!emp.date_of_birth) return false;

            const dob = new Date(emp.date_of_birth);
            return dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDate;
        });

        return birthdayEmployees;
    }
}

