'use client';

import HeaderBar from '@/components/nav/HeaderBar';

export default function TestHeader() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">HeaderBar Test Page</h1>
      <HeaderBar />
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Page Content</h2>
        <p>This is a test page to verify the HeaderBar component is working correctly.</p>
      </div>
    </div>
  );
}