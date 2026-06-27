import { memo } from 'react';
import flags from 'react-phone-number-input/flags';
import type { Country } from 'react-phone-number-input';

interface CountryFlagProps {
  country: Country;
}

export const CountryFlag = memo(({ country }: CountryFlagProps) => {
  const FlagComponent = flags[country];

  if (!FlagComponent) {
    return <div className="h-3.5 w-5 shrink-0 rounded-[2px] bg-slate-200" />;
  }

  return (
    <div className="h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] border border-black/5 shadow-sm">
      <FlagComponent title={country} />
    </div>
  );
});

CountryFlag.displayName = 'CountryFlag';