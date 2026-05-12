import cron from "node-cron";
import {checkUnreadMessages} from "./tasks/unreadChecker.js";

cron.schedule("0 12 * * *", async () => {
    console.log("🕒 Запускаю перевірку непрочитаних повідомлень...");
    await checkUnreadMessages();
});
