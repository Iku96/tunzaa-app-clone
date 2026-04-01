export interface Bank {
  id: string;
  name: string;
  swift_code: string;
}

export const TANZANIAN_BANKS: Bank[] = [
  { id: 'crdb', name: 'CRDB Bank', swift_code: 'CRDBTZTZ' },
  { id: 'nmb', name: 'NMB Bank', swift_code: 'NMBT TZTZ' },
  { id: 'nbc', name: 'NBC Bank', swift_code: 'NBCB TZTZ' },
  { id: 'stanbic', name: 'Stanbic Bank', swift_code: 'SBIC TZTZ' },
  { id: 'abs', name: 'ABSA Bank Tanzania', swift_code: 'ABSA TZTZ' },
  { id: 'exim', name: 'Exim Bank', swift_code: 'EXIM TZTZ' },
  { id: 'tpbc', name: 'TPB Bank (Tanzania Postal Bank)', swift_code: 'TPBT TZTZ' },
  { id: 'kcb', name: 'KCB Bank Tanzania', swift_code: 'KCBK TZTZ' },
  { id: 'boa', name: 'Bank of Africa (BOA)', swift_code: 'AFRI TZTZ' },
  { id: 'dtb', name: 'Diamond Trust Bank (DTB)', swift_code: 'DTBT TZTZ' },
  { id: 'ncba', name: 'NCBA Bank', swift_code: 'NCBA TZTZ' },
  { id: 'equity', name: 'Equity Bank', swift_code: 'EQTY TZTZ' },
  { id: 'azania', name: 'Azania Bank', swift_code: 'AZAN TZTZ' },
  { id: 'peoples', name: "People's Bank of Zanzibar (PBZ)", swift_code: 'PBZT TZTZ' },
];
