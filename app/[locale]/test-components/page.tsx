'use client';

import HeaderBar from '@/components/nav/HeaderBar';
import RightDrawer from '@/components/nav/right-drawer';
import LangSwitch from '@/components/lang-switch';

export default function TestComponents() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Component Test Page</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">HeaderBar</h2>
        <HeaderBar />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">RightDrawer</h2>
        <RightDrawer />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">LangSwitch</h2>
        <LangSwitch />
      </div>
    </div>
  );
}