function getAge(birthday: Date): number {
  const today = new Date();

  const birthYear: number = birthday.getUTCFullYear();
  const birthMonth: number = birthday.getUTCMonth() + 1;
  const birthDay: number = birthday.getUTCDate();

  const nowYear: number = today.getUTCFullYear();
  const nowMonth: number = today.getUTCMonth() + 1;
  const nowDay: number = today.getUTCDate();
  if (nowYear === birthYear) {
    return 0;
  }
  const ageDiff: number = nowYear - birthYear;
  if (nowMonth === birthMonth) {
    if (nowDay - birthDay >= 1) {
      return ageDiff;
    }
    return ageDiff - 1;
  }
  if (nowMonth > birthMonth) {
    return ageDiff;
  }
  return ageDiff - 1;
}
export { getAge };
