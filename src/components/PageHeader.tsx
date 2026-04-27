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
  { name: 'Vimeo', icon: 'Vimeo' },
  { name: 'X', icon: 'X Dark' },
  { name: 'Twitch', icon: 'Twitch' },
  { name: 'Reddit', icon: 'Reddit' },
  { name: 'LinkedIn', icon: 'LinkedIn' },
  { name: 'Bilibili', icon: 'Bilibili' },
  { name: 'Snapchat', icon: 'Snapchat' },
  { name: 'VK', icon: 'VK' },
  { name: 'RedNote', icon: 'RedNote' },
];

export function PageHeader() {
  return (
    <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
      <div className='flex items-center gap-1'>
        <img src='/logo.png' alt='Logo' className='h-11 w-11' />
        <h1 className='text-3xl font-black tracking-tight text-zinc-900'>Dovio</h1>
      </div>

      <div className='flex items-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              className='select-none border-2 border-zinc-900 bg-white text-base font-bold text-zinc-900 hover:bg-rose-100'
            >
              Supported Services
              <HugeiconsIcon icon={HelpCircleIcon} size={23} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-80 border-2 border-zinc-900 bg-white/50 p-2 backdrop-blur-lg'>
            <DropdownMenuLabel className='text-xs font-bold text-zinc-800'>Supported Platforms</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className='grid grid-cols-4 gap-2 p-2'>
              {supportedPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className='flex cursor-pointer flex-col items-center gap-1 rounded-xl p-2 transition-colors hover:bg-rose-100'
                >
                  <Icon name={platform.icon} className='h-6 w-6 text-zinc-700' />
                  <span className='text-sm font-black text-zinc-700'>{platform.name}</span>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
