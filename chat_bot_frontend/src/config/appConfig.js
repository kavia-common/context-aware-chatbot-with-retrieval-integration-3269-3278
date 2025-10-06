export const RAG_BACKEND = {
  // 'mock' uses MockRAGClient, 'http' reserved for future real backend client
  mode: (process.env.REACT_APP_RAG_MODE || 'mock') === 'http' ? 'http' : 'mock',
  baseURL: process.env.REACT_APP_RAG_BASE_URL || '',
  streaming: true
};

export const THEME = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
  gradient: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(249,250,251,1))',
  shadowSm: '0 1px 2px rgba(0,0,0,0.06)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  radius: '14px'
};
