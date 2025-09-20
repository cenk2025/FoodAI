import { assertAdmin } from '@/app/(guards)/admin/guard';

export default async function Settings() {
  await assertAdmin();
  return <div>Admin Settings</div>;
}