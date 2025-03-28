export const SpendingPeriod = {
  Day: 'DAY',
  Week: 'WEEK',
  Month: 'MONTH',
  Year: 'YEAR',
  All: 'ALL',
} as const

export type SpendingPeriod =
  (typeof SpendingPeriod)[keyof typeof SpendingPeriod]

export const Category = {
  Accommodation: 'ACCOMMODATION',
  Entertainment: 'ENTERTAINMENT',
  Fitness: 'FITNESS',
  Food: 'FOOD',
  Games: 'GAMES',
  Gifts: 'GIFTS',
  Grooming: 'GROOMING',
  Hobbies: 'HOBBIES',
  Insurance: 'INSURANCE',
  Medical: 'MEDICAL',
  Others: 'OTHERS',
  Pet: 'PET',
  Shopping: 'SHOPPING',
  Transfers: 'TRANSFERS',
  Transport: 'TRANSPORT',
  Travel: 'TRAVEL',
  Utilities: 'UTILITIES',
  Work: 'WORK',
} as const

export type Category = (typeof Category)[keyof typeof Category]

export const objectToPgEnum = <T extends Record<string, any>>(
  myEnum: T
): [T[keyof T], ...T[keyof T][]] =>
  Object.values(myEnum).map((value: any) => `${value}`) as any
