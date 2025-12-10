import { Nusawork } from './service/nusawork'
import { Spreadsheet } from './service/spreadsheet';
import { Whatsapp } from './service/whatsapp';

async function main(): Promise<void> {
    const employees = await Nusawork.getTodayBirthdayEmployees();

    const rows = employees.map(emp => ({
        Name: emp.full_name,
        "Employee ID": emp.employee_id,
        "Birthday Date": formatDateMDY(new Date()),
        "Whatsapp": emp.whatsapp,
        Stage: "Pending",
    }));

    const today = new Date();
    const ninetyOneDaysAgo = new Date(today.getTime() - 91 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    const eightyThreeDaysAgo = new Date(today.getTime() - 83 * 24 * 60 * 60 * 1000);
    
    const reminderPromise = handleReminders(eightyThreeDaysAgo, ninetyDaysAgo);
    const stagePromise    = handleStageChange(ninetyOneDaysAgo);

    await Promise.all([reminderPromise, stagePromise]);

    if (rows.length === 0) {
        console.log("No birthdays today");
    }else{
        await Spreadsheet.write(rows);
    }

    console.log("All tasks finished. Exiting...");
    process.exit(0);
}

async function handleReminders(dateA: Date, dateB: Date) {
    const startDate = dateA < dateB ? dateA : dateB;
    const endDate   = dateA < dateB ? dateB : dateA;

    const days: Date[] = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
    }

    let allRows: any[] = [];

    for (const day of days) {
        const rows = await Spreadsheet.read(0, formatDateMDY(day), "Pending");
        if (rows.length > 0) {
            allRows = allRows.concat(rows);
        }
    }

    if (allRows.length === 0) return;

    console.log(`Sending ${allRows.length} reminders...`);

    await Promise.all(
        allRows.map(row => Whatsapp.sendReminder(row.whatsapp, row.name))
    );
}

async function handleStageChange(date: Date) {
    const changeStageRows = await Spreadsheet.read(0, formatDateMDY(date), "Pending");
    if (changeStageRows.length === 0) return;

    await Promise.all(changeStageRows.map(row =>
        Spreadsheet.updateStage(0, "Expired", row.rowNumber)
    ));
}

function formatDateMDY(date: Date): string {
    return new Intl.DateTimeFormat("en-US").format(date);
}

main();
