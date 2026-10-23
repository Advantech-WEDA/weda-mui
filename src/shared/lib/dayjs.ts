import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const formatLocalTime = (time?: string): string => {
  if (!time) return '-';

  const localTime = dayjs.utc(time).local();

  return `${localTime.format(
    'YYYY/MM/DD HH:mm:ss'
  )} (UTC${localTime.format('Z')})`;
};

export default dayjs;
