import type { InputHTMLAttributes, ReactElement, SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const controlClass =
  'border border-line-light bg-white px-2.5 py-2 text-[13px] text-ink outline-none focus:border-ink';

export function Input({
  className,
  width,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  readonly width?: number | 'flex';
}): ReactElement {
  return (
    <input
      className={cn(controlClass, width === 'flex' && 'min-w-0 flex-1', className)}
      style={typeof width === 'number' ? { width } : undefined}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>): ReactElement {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>): ReactElement {
  return <textarea className={cn(controlClass, 'min-h-[72px] resize-y', className)} {...props} />;
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
  className,
}: {
  readonly name: string;
  readonly label: string;
  readonly defaultChecked?: boolean;
  readonly className?: string;
}): ReactElement {
  return (
    <label className={cn('text-ink inline-flex items-center gap-2 text-[13px]', className)}>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="accent-cyan" />
      {label}
    </label>
  );
}
