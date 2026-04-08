import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 border',
  {
    variants: {
      variant: {
        default: 'bg-primary/20 text-primary-foreground border-primary/40 backdrop-blur-sm hover:bg-primary/30 hover:border-primary/60',
        destructive:
          'bg-destructive/20 text-destructive-foreground border-destructive/40 backdrop-blur-sm hover:bg-destructive/30 hover:border-destructive/60',
        outline: 'border-2 border-zinc-900 bg-white text-zinc-900 hover:bg-orange-100',
        secondary:
          'bg-secondary/20 text-secondary-foreground border-secondary/40 backdrop-blur-sm hover:bg-secondary/30 hover:border-secondary/60',
        ghost: 'border-transparent text-zinc-700 hover:bg-zinc-100',
        todo: 'bg-purple-500/20 text-purple-300 border-purple-500/40 backdrop-blur-sm hover:bg-purple-500/30 hover:border-purple-500/60',
        'in-review':
          'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 backdrop-blur-sm hover:bg-yellow-500/30 hover:border-yellow-500/60',
        'design-review':
          'bg-violet-500/20 text-violet-300 border-violet-500/40 backdrop-blur-sm hover:bg-violet-500/30 hover:border-violet-500/60',
        done: 'bg-green-500/20 text-green-300 border-green-500/40 backdrop-blur-sm hover:bg-green-500/30 hover:border-green-500/60',
        blocked: 'bg-rose-500/20 text-rose-300 border-rose-500/40 backdrop-blur-sm hover:bg-rose-500/30 hover:border-rose-500/60',
        'on-hold': 'border-2 border-zinc-900 bg-orange-500 text-white hover:bg-orange-600',
        archived: 'border-2 border-zinc-900 bg-white text-zinc-800 hover:bg-orange-100',
      },
      size: {
        default: 'min-h-9 px-5 py-2',
        sm: 'min-h-8 px-4 py-1.5 text-xs',
        lg: 'min-h-11 px-6 py-2.5 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
