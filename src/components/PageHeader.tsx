import { Icon } from 'iconza';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Clapping02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const supportedPlatforms = [
  { name: 'Facebook', icon: 'FacebookSquare' },
  { name: 'TikTok', icon: 'TikTok' },
  { name: 'Instagram', icon: 'Instagram' },
  { name: 'Pinterest', icon: 'Pinterest' },
  { name: 'Vimeo', icon: 'Vimeo' },
  { name: 'X', icon: 'X Light' },
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
      <div className='flex items-center gap-2'>
        <img src='/logo.png' alt='Logo' className='h-10 w-10' />
        <h1 className='text-3xl font-semibold text-white'>Dovio</h1>
      </div>

      <div className='flex items-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='select-none'>
              <HugeiconsIcon icon={Clapping02Icon} size={23} />
              Supported Services
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-80'>
            <DropdownMenuLabel>Supported Platforms</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className='grid grid-cols-4 gap-2 p-2'>
              {supportedPlatforms.map((platform) => (
                <div key={platform.name} className='flex cursor-pointer flex-col items-center gap-1 rounded-lg p-2 hover:bg-zinc-700/50'>
                  <Icon name={platform.icon} className='h-6 w-6 text-gray-400' />
                  <span className='text-xs text-gray-300'>{platform.name}</span>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
