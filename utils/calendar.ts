// Function to format date for ICS file (YYYYMMDDTHHmmssZ)
const formatDate = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
};

export const generateICS = (title: string, description: string, dueDate: Date) => {
    const event = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//YourAppName//NONSGML v1.0//EN',
        'BEGIN:VEVENT',
        `UID:${Date.now()}@yourapp.com`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART;VALUE=DATE:${formatDate(dueDate).substring(0, 8)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([event], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/\s/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
