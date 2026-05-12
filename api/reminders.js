const { sendReminders } = require("./reminderSender");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const result = await sendReminders(req.body || {});
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message || "Reminder request failed" });
  }
};
