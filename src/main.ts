import { Nusawork } from './service/nusawork'
import { Spreadsheet } from './service/spreadsheet';

async function main(): Promise<void> {
    const employees = await Nusawork.getTodayBirthdayEmployees();
    const rows = employees.map(emp => ({
        Name: emp.full_name,
        "Employee ID": emp.employee_id,
        "Birthday Date": formatDateMDY(new Date()),
        Stage: "Pending",
    }));
    if (rows.length === 0) {
        console.log("No birthdays today");
        return;
    }
    await Spreadsheet.write(rows);
}

function formatDateMDY(date: Date): string {
    return new Intl.DateTimeFormat("en-US").format(date);
}

main();