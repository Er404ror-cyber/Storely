import React, { memo } from 'react';

import type { HeroContentData } from './types';
import { MediaRenderer, type MediaData } from '../sections/mediarender';

export interface LayoutProps {
  isDark: boolean;
  isCenter: boolean;
  isEditable: boolean;
  content: HeroContentData;
  children: React.ReactNode;
}

export const LayoutYoutube = memo(({ isDark, isCenter, isEditable, content, children }: LayoutProps) => {
  const bgColorClass = isDark ? 'bg-slate-900' : 'bg-[#c1e8e5]';

  return (
    <div className={`relative w-full ${bgColorClass} flex flex-col sm:flex-row items-stretch overflow-hidden`}>
      <div className={`relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 flex ${isCenter ? 'justify-center text-center' : 'justify-start'} items-center`}>
        <div className="w-full max-w-xl pt-10 pb-0 mt-16 sm:mt-0 sm:py-20">
          {children}
        </div>
      </div>
      <div className="relative sm:absolute sm:right-0 sm:top-0 w-full sm:w-[55%] h-[400px] sm:h-full z-0 -mt-56 sm:mt-0 overflow-hidden">
        <div className={`absolute inset-0 sm:inset-y-0 sm:left-0 z-10 h-48 sm:h-full sm:w-64 ${
            isDark ? 'bg-gradient-to-b sm:bg-gradient-to-r from-slate-900 via-slate-900/70 to-transparent' : 'bg-gradient-to-b sm:bg-gradient-to-r from-[#c1e8e5] via-[#c1e8e5]/70 to-transparent'
          }`}
        />
        <div className="absolute inset-0 w-full h-full">
          <MediaRenderer media={content.media as MediaData} className="w-full h-full object-cover object-top" isEditable={isEditable} />
        </div>
        {!isDark && <div className="absolute bottom-0 left-0 z-20 w-12 h-6 bg-white rounded-t-[60px] sm:w-16 sm:h-8" />}
      </div>
    </div>
  );
});
LayoutYoutube.displayName = 'LayoutYoutube';

export const LayoutBackground = memo(({ isDark, isCenter, isEditable, content, children }: LayoutProps) => (
  <div className="relative w-full min-h-[380px] flex items-center justify-center py-14 lg:py-20 xl:py-28 2xl:py-36 px-6 overflow-hidden">
    <div className="absolute inset-0 z-0">
      <MediaRenderer media={content.media as MediaData} className="w-full h-full object-cover" isEditable={isEditable} />
      <div className={`absolute inset-0 ${isDark ? 'bg-black/65' : 'bg-black/35'}`} />
    </div>
    <div className={`relative z-10 w-full max-w-4xl flex flex-col ${isCenter ? 'items-center text-center' : 'items-start text-left text-white'}`}>
      {children}
    </div>
  </div>
));
LayoutBackground.displayName = 'LayoutBackground';

export const LayoutStorely = memo(({ isDark, isCenter, isEditable, content, children }: LayoutProps) => (
  <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-12 xl:py-20 overflow-hidden">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
      <div className={`w-full lg:w-[43%] shrink-0 z-10 ${isCenter ? 'text-center items-center flex flex-col' : 'text-left items-start flex flex-col'}`}>
        {children}
      </div>
      <div className="w-full lg:w-[55%] relative flex justify-center lg:justify-end z-0 mt-12 lg:mt-0">
        <div className={`relative rounded-[2.5rem] overflow-hidden shadow-xl border ${
            isDark ? 'border-white/10' : 'border-gray-100'
          } w-full max-h-[400px] aspect-video lg:aspect-square flex items-center justify-center bg-black/5`}>
          <div className="absolute inset-0 w-full h-full">
            <MediaRenderer media={content.media as MediaData} className="w-full h-full object-cover" isEditable={isEditable} />
          </div>
        </div>
      </div>
    </div>
  </div>
));
LayoutStorely.displayName = 'LayoutStorely';