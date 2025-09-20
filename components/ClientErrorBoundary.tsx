'use client';
import React from 'react';

export default class ClientErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {hasError: boolean; err?: any}
> {
  constructor(props:any){ super(props); this.state = {hasError:false}; }
  static getDerivedStateFromError(error:any){ return {hasError: true, err: error}; }
  componentDidCatch(error:any, info:any){ console.error('UI error:', error, info); }
  render(){
    if (this.state.hasError){
      return (
        <div style={{padding:24}}>
          <h2>Bir şeyler ters gitti</h2>
          <p>Önyüz bileşenlerinden biri hata verdi. Konsolu kontrol edin.</p>
        </div>
      );
    }
    return this.props.children;
  }
}