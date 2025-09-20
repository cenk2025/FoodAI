'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ImportPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  useEffect(() => {
    if (error) {
      alert('Error importing CSV: ' + error);
    }
  }, [error]);
  
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Import Commissions CSV</h1>
      <form className="space-y-4" action="/api/admin/commissions/import" method="post" encType="multipart/form-data">
        <div>
          <label htmlFor="file" className="block text-sm font-medium mb-2">
            Select CSV File
          </label>
          <input 
            type="file" 
            name="file" 
            id="file"
            accept=".csv,text/csv" 
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            required 
          />
          <p className="mt-2 text-sm text-gray-500">
            The CSV should contain columns: conversion_id, provider_id, offer_id, clickout_id, gross_amount, commission_amount, currency, status, occurred_at
          </p>
        </div>
        <button 
          type="submit"
          className="btn btn-primary"
        >
          Upload and Import
        </button>
      </form>
    </div>
  );
}