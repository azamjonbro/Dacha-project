const UZ_MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", 
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
];

const UZ_MONTHS_SHORT = [
  "Yan", "Fev", "Mar", "Apr", "May", "Iyun", 
  "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"
];

/**
 * Global date formatting utility for Uzbek locale
 * @param {string | Date} dateStr - Date to format
 * @param {string} format - 'short' (12 Apr), 'long' (12 Aprel, 2024), or 'full' (12 Aprel, 2024)
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr, format = 'short') => {
  if (!dateStr) return "-";
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  
  const day = d.getDate();
  const monthIdx = d.getMonth();
  const year = d.getFullYear();

  if (format === 'short') {
    return `${day} ${UZ_MONTHS_SHORT[monthIdx]}`;
  }
  
  if (format === 'long' || format === 'full') {
    return `${day} ${UZ_MONTHS[monthIdx]}, ${year}`;
  }

  return d.toLocaleDateString('uz-UZ');
};

export default {
  formatDate
};
