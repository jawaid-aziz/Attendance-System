// Shared display formatters for the dashboards.

export const formatMoney = (value) =>
  `Rs. ${(Number(value) || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;

// Minutes since midnight -> "HH:MM"
export const minutesToHHMM = (minutes) => {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) {
    return "";
  }
  const m = Math.max(0, minutes);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

// "YYYY-MM-DD HH:mm:ss" (company-local wall time) -> minutes since midnight.
export const timeStringToMinutes = (timeString) => {
  if (!timeString) return null;
  const timePart = timeString.split(" ")[1] || timeString;
  const [hh, mm] = timePart.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
};

// "YYYY-MM-DD HH:mm:ss" -> day of month (1-31) from the wall-clock string.
export const dayFromTimeString = (timeString) => {
  if (!timeString) return null;
  const datePart = timeString.split(" ")[0] || "";
  const day = Number(datePart.split("-")[2]);
  return Number.isNaN(day) ? null : day;
};

// Minutes since midnight for a Date in a given IANA timezone.
export const minutesInTimezone = (date, timezone) => {
  if (!timezone) return 0;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  let hour = 0;
  let minute = 0;
  parts.forEach((part) => {
    if (part.type === "hour") hour = Number(part.value);
    if (part.type === "minute") minute = Number(part.value);
  });
  return hour * 60 + minute;
};

// Minutes elapsed formatted as "Xh Ym".
export const formatDuration = (minutes) => {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${mm}m`;
  return `${h}h ${mm}m`;
};
