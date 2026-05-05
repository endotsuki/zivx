import { Icon } from 'iconza';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { HelpCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const supportedPlatforms = [
  { name: 'Facebook', icon: 'FacebookSquare' },
  { name: 'TikTok', icon: 'TikTok' },
  { name: 'Instagram', icon: 'Instagram' },
  { name: 'Pinterest', icon: 'Pinterest' },
  { name: 'X', icon: 'X Dark' },
  { name: 'LinkedIn', icon: 'LinkedIn' },
  { name: 'Reddit', icon: 'Reddit' },
  { name: 'Twitch', icon: 'Twitch' },
  { name: 'Snapchat', icon: 'Snapchat' },
  { name: 'VK', icon: 'VK' },
  { name: 'RedNote', icon: 'RedNote' },
  { name: 'Bilibili', icon: 'Bilibili' },
  { name: 'Vimeo', icon: 'Vimeo' },
  { name: 'CapCut', icon: 'CapCut' },
  { name: 'Kwai', icon: 'Kwai' },
  { name: 'Behance', icon: 'BehanceFill' },
  { name: 'Dribbble', icon: 'Dribbble' },
  { name: 'Dailymotion', icon: 'Dailymotion' },
  { name: '500px', icon: '500px Dark1' },
];

export function PageHeader() {
  return (
    <div className='mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-6 sm:gap-4'>
      <div className='flex items-center gap-1'>
        <img src='/logo.png' alt='Logo' className='h-9 w-9 sm:h-11 sm:w-11' />
        <h1 className='text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl'>ZTN</h1>
      </div>

      <div className='flex items-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              className='select-none border-2 border-zinc-900 bg-white text-xs font-bold text-zinc-900 hover:bg-zinc-100 sm:text-base'
            >
              <span className='hidden text-zinc-700 sm:inline'>Supported Services</span>
              <span className='sm:hidden'>Services</span>
              <HugeiconsIcon icon={HelpCircleIcon} size={18} className='sm:size-6' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='mr-3 w-56 border-2 border-zinc-900 bg-white/70 p-2 backdrop-blur-lg sm:w-80'>
            <DropdownMenuLabel className='text-xs font-bold text-zinc-800'>Supported Platforms</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className='grid grid-cols-3 gap-1 p-2 sm:grid-cols-4 sm:gap-2'>
              {supportedPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className='flex cursor-pointer flex-col items-center gap-0.5 rounded-lg p-1.5 transition-colors hover:bg-zinc-100 sm:rounded-xl sm:p-2'
                >
                  <Icon name={platform.icon} className='h-4 w-4 text-zinc-700 sm:h-6 sm:w-6' />
                  <span className='text-xs font-semibold text-zinc-700 sm:text-sm'>{platform.name}</span>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
