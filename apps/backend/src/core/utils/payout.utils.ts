import { PayoutSchedule } from 'src/modules/users/entities/freelancer.entity';

export function calculateNextPayoutDate(schedule: PayoutSchedule): Date {
  const now = new Date();
  switch (schedule) {
    case PayoutSchedule.WEEKLY:
      now.setDate(now.getDate() + 7);
      break;
    case PayoutSchedule.BIWEEKLY:
      now.setDate(now.getDate() + 14);
      break;
    case PayoutSchedule.MONTHLY:
      now.setMonth(now.getMonth() + 1);
      break;
  }
  return now;
}
