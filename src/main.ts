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

    if (rows.length === 0) {
        console.log("No birthdays today");
        return process.exit(0);
    }

    await Spreadsheet.write(rows);

    const today = new Date();
    const eightDaysAgo   = new Date(today.getTime() - 8  * 24 * 60 * 60 * 1000);
    const fifteenDaysAgo = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);

    const reminderPromise = handleReminders(eightDaysAgo);
    const stagePromise    = handleStageChange(fifteenDaysAgo);

    await Promise.all([reminderPromise, stagePromise]);

    console.log("All tasks finished. Exiting...");
    process.exit(0);
}

async function handleReminders(date: Date) {
    const reminderRows = await Spreadsheet.read(0, formatDateMDY(date), "Pending");
    if (reminderRows.length === 0) return;

    console.log(`Sending ${reminderRows.length} reminders...`);

    await Promise.all(reminderRows.map(row =>
        Whatsapp.sendReminder(row.whatsapp, row.name)
    ));
}

async function handleStageChange(date: Date) {
    const changeStageRows = await Spreadsheet.read(0, formatDateMDY(date), "Pending");
    if (changeStageRows.length === 0) return;

    console.log(`Updating ${changeStageRows.length} rows to Expired...`);

    await Promise.all(changeStageRows.map(row =>
        Spreadsheet.updateStage(0, "Expired", row.rowNumber)
    ));
}

function formatDateMDY(date: Date): string {
    return new Intl.DateTimeFormat("en-US").format(date);
}

main();
