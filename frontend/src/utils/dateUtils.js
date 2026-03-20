import { format, parseISO } from 'date-fns';

export const formatDateKey = (date) => {
  return format(date, 'yyyy-MM-dd');
};

export const parseDateKey = (dateString) => {
  return parseISO(dateString);
};

export const getDisplayDate = (date) => {
  return format(date, 'MMMM d, yyyy');
};
