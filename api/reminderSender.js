const https = require("https");

function requestJson({ hostname, path, method = "POST", headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";

    const request = https.request(
      {
        hostname,
        path,
        method,
        headers: {
          ...headers,
          ...(payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              }
            : {}),
        },
      },
      (response) => {
        let rawData = "";

        response.on("data", (chunk) => {
          rawData += chunk;
        });

        response.on("end", () => {
          let data = {};

          try {
            data = rawData ? JSON.parse(rawData) : {};
          } catch (error) {
            data = { raw: rawData };
          }

          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode,
            data,
          });
        });
      }
    );

    request.on("error", reject);
    request.write(payload);
    request.end();
  });
}

function requestForm({ hostname, path, method = "POST", headers = {}, form }) {
  return new Promise((resolve, reject) => {
    const payload = new URLSearchParams(form).toString();

    const request = https.request(
      {
        hostname,
        path,
        method,
        headers: {
          ...headers,
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        let rawData = "";

        response.on("data", (chunk) => {
          rawData += chunk;
        });

        response.on("end", () => {
          let data = {};

          try {
            data = rawData ? JSON.parse(rawData) : {};
          } catch (error) {
            data = { raw: rawData };
          }

          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode,
            data,
          });
        });
      }
    );

    request.on("error", reject);
    request.write(payload);
    request.end();
  });
}

function buildReminderMessage({ childName, reminders }) {
  const lines = reminders.map((reminder) => {
    const dueText = reminder.dueDate ? `due on ${reminder.dueDate}` : "with no due date set";
    return `- ${reminder.name}: ${reminder.state} (${dueText})`;
  });

  return [
    `VaxTrack reminder for ${childName || "your child"}:`,
    ...lines,
    "",
    "Please review the immunisation schedule and contact your healthcare provider if needed.",
  ].join("\n");
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function optionalEnv(name) {
  return process.env[name] || "";
}

function normalizeCountryCode(countryCode) {
  if (!countryCode) {
    return "";
  }

  const digits = countryCode.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

function normalizePhoneNumber(phoneNumber) {
  const rawPhoneNumber = String(phoneNumber || "").trim();

  if (!rawPhoneNumber) {
    throw new Error("Parent phone number is missing");
  }

  const withoutChannelPrefix = rawPhoneNumber.replace(/^whatsapp:/i, "").trim();
  const compact = withoutChannelPrefix.replace(/[\s().-]/g, "");

  if (compact.startsWith("+")) {
    if (/^\+[1-9]\d{7,14}$/.test(compact)) {
      return compact;
    }

    throw new Error("Parent phone number must be a valid E.164 number, for example +15551234567");
  }

  if (compact.startsWith("00")) {
    const international = `+${compact.slice(2)}`;

    if (/^\+[1-9]\d{7,14}$/.test(international)) {
      return international;
    }
  }

  const defaultCountryCode = normalizeCountryCode(optionalEnv("TWILIO_DEFAULT_COUNTRY_CODE"));

  if (defaultCountryCode && /^\d{7,14}$/.test(compact)) {
    const localNumber = compact.startsWith("0") ? compact.slice(1) : compact;
    const international = `${defaultCountryCode}${localNumber}`;

    if (/^\+[1-9]\d{7,14}$/.test(international)) {
      return international;
    }
  }

  throw new Error(
    "Parent phone number must include a country code, for example +15551234567"
  );
}

function textToHtml(text) {
  return `<html><body>${text
    .split("\n")
    .map((line) => `<p>${line || "&nbsp;"}</p>`)
    .join("")}</body></html>`;
}

async function sendEmail({ to, subject, text }) {
  const apiKey = requireEnv("BREVO_API_KEY");
  const fromEmail = requireEnv("BREVO_FROM_EMAIL");
  const fromName = process.env.BREVO_FROM_NAME || "VaxTrack";

  if (!to) {
    throw new Error("Parent email is missing");
  }

  const response = await requestJson({
    hostname: "api.brevo.com",
    path: "/v3/smtp/email",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
    },
    body: {
      from: {
        name: fromName,
        email: fromEmail,
      },
      to: [
        {
          email: to,
        },
      ],
      subject,
      textContent: text,
      htmlContent: textToHtml(text),
    },
  });

  if (!response.ok) {
    throw new Error(response.data.message || "Brevo email request failed");
  }
}

async function sendTwilioMessage({ to, body, channel }) {
  const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
  const authToken = requireEnv("TWILIO_AUTH_TOKEN");
  const messagingServiceSid = optionalEnv("TWILIO_MESSAGING_SERVICE_SID");
  const from =
    channel === "whatsapp"
      ? requireEnv("TWILIO_WHATSAPP_FROM")
      : messagingServiceSid || requireEnv("TWILIO_SMS_FROM");

  const normalizedTo = normalizePhoneNumber(to);
  const isWhatsApp = channel === "whatsapp";
  const formattedTo = isWhatsApp ? `whatsapp:${normalizedTo}` : normalizedTo;
  const formattedFrom =
    isWhatsApp && !from.startsWith("whatsapp:") ? `whatsapp:${from}` : from;
  const twilioForm = {
    To: formattedTo,
    Body: body,
  };

  if (channel === "sms" && messagingServiceSid) {
    twilioForm.MessagingServiceSid = messagingServiceSid;
  } else {
    twilioForm.From = formattedFrom;
  }

  const response = await requestForm({
    hostname: "api.twilio.com",
    path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
    },
    form: twilioForm,
  });

  if (!response.ok) {
    throw new Error(response.data.message || `Twilio ${channel} request failed`);
  }
}

async function sendReminders({ channel, recipient = {}, childName, reminders }) {
  if (!["email", "sms", "whatsapp"].includes(channel)) {
    throw new Error("Unsupported reminder channel");
  }

  if (!Array.isArray(reminders) || reminders.length === 0) {
    throw new Error("No reminders were provided");
  }

  const text = buildReminderMessage({ childName, reminders });
  const subject = `VaxTrack reminder for ${childName || "your child"}`;

  if (channel === "email") {
    await sendEmail({ to: recipient.email, subject, text });
  } else {
    await sendTwilioMessage({
      to: recipient.phone,
      body: text,
      channel,
    });
  }

  return {
    sent: reminders.length,
    channel,
  };
}

module.exports = {
  sendReminders,
};
