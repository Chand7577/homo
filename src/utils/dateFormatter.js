/**
 * Format date to readable format: "12:30 AM, 27 July 2026"
 * @param {string|Date} date - ISO date string or Date object
 * @param {boolean} includeTime - Whether to include time (default: true)
 * @param {string} lang - Language code ('en' or 'hi')
 * @returns {string} Formatted date string
 */
export const formatDateTime = (date, includeTime = true, lang = 'en') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  
  if (includeTime) {
    // Format: "12:30 AM, 27 July 2026"
    const timeStr = d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const dateStr = d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `${timeStr}, ${dateStr}`;
  } else {
    // Format: "27 July 2026"
    return d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
};

/**
 * Format date to short format: "27 Jul"
 * @param {string|Date} date - ISO date string or Date object
 * @param {string} lang - Language code ('en' or 'hi')
 * @returns {string} Formatted date string
 */
export const formatDateShort = (date, lang = 'en') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short'
  });
};

/**
 * Format time only: "12:30 AM"
 * @param {string|Date} date - ISO date string or Date object
 * @param {string} lang - Language code ('en' or 'hi')
 * @returns {string} Formatted time string
 */
export const formatTime = (date, lang = 'en') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  
  return d.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get relative time: "Just now", "5 minutes ago", "Yesterday", etc.
 * @param {string|Date} date - ISO date string or Date object
 * @param {string} lang - Language code ('en' or 'hi')
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date, lang = 'en') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const t = (en, hi) => lang === 'hi' ? hi : en;

  if (diffSecs < 60) return t('Just now', 'अभी-अभी');
  if (diffMins < 60) return t(`${diffMins} min ago`, `${diffMins} मिनट पहले`);
  if (diffHours < 24) return t(`${diffHours}h ago`, `${diffHours} घंटे पहले`);
  if (diffDays === 1) return t('Yesterday', 'कल');
  if (diffDays < 7) return t(`${diffDays}d ago`, `${diffDays} दिन पहले`);
  
  return formatDateShort(date, lang);
};
