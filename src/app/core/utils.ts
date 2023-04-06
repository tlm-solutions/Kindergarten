export function toLocalIsoStringWithoutZone(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function toLocalZoneIsoString(date: Date): string {
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${dif}${pad(Math.floor(Math.abs(tzo) / 60))}:${pad(Math.abs(tzo) % 60)}`;
}

function pad(num: number): string {
  return (num < 10 ? '0' : '') + num;
}
