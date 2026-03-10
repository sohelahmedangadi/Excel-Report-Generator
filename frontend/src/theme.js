// Returns style objects based on dark/light mode
export const t = (dark) => ({
  bg:          dark ? '#0F1117' : '#F8FAFC',
  bgCard:      dark ? '#1A1D27' : '#FFFFFF',
  bgCardHover: dark ? '#1E2130' : '#F1F5F9',
  bgSidebar:   dark ? '#13151F' : '#FFFFFF',
  bgInput:     dark ? '#1A1D27' : '#FFFFFF',
  bgBadge:     dark ? '#1E2433' : '#F1F5F9',
  bgTable:     dark ? '#0F1117' : '#F8FAFC',
  border:      dark ? '#1E2433' : '#E2E8F0',
  borderInput: dark ? '#2D3748' : '#CBD5E1',
  text:        dark ? '#E2E8F0' : '#1E293B',
  textSub:     dark ? '#94A3B8' : '#64748B',
  textMuted:   dark ? '#4A5568' : '#94A3B8',
  textHeading: dark ? '#FFFFFF' : '#0F172A',
  divider:     dark ? '#1A1D27' : '#F1F5F9',
});
