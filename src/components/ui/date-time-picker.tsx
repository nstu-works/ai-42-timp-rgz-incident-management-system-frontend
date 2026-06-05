'use client'

import { format, parseISO, isValid } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const parsed = value ? parseISO(value) : null
  const date = parsed && isValid(parsed) ? parsed : null

  const hours = date ? String(date.getHours()).padStart(2, '0') : '00'
  const minutes = date ? String(date.getMinutes()).padStart(2, '0') : '00'

  function handleDateSelect(selected: Date | undefined) {
    if (!selected) return
    const h = date ? date.getHours() : 0
    const m = date ? date.getMinutes() : 0
    const next = new Date(selected)
    next.setHours(h, m, 0, 0)
    onChange(format(next, "yyyy-MM-dd'T'HH:mm"))
  }

  function handleHoursChange(val: string) {
    const num = parseInt(val, 10)
    if (isNaN(num)) return
    const base = date ?? new Date()
    const next = new Date(base)
    next.setHours(Math.min(23, Math.max(0, num)), next.getMinutes(), 0, 0)
    onChange(format(next, "yyyy-MM-dd'T'HH:mm"))
  }

  function handleMinutesChange(val: string) {
    const num = parseInt(val, 10)
    if (isNaN(num)) return
    const base = date ?? new Date()
    const next = new Date(base)
    next.setMinutes(Math.min(59, Math.max(0, num)))
    onChange(format(next, "yyyy-MM-dd'T'HH:mm"))
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'w-full justify-start text-left font-normal border-[#27272a] bg-[#18181b] text-[#fafafa] hover:bg-[#27272a] hover:text-[#fafafa]',
          !date && 'text-[#71717a]',
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-[#71717a]" />
        {date
          ? format(date, 'd MMMM yyyy, HH:mm', { locale: ru })
          : 'Выберите дату и время'}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-[#27272a] bg-[#18181b] p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={handleDateSelect}
          locale={ru}
        />
        <div className="flex items-center gap-2 border-t border-[#27272a] p-3">
          <span className="text-sm text-[#71717a]">Время:</span>
          <Input
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={(e) => handleHoursChange(e.target.value)}
            className="h-8 w-16 border-[#27272a] bg-[#27272a] text-center text-[#fafafa] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="font-medium text-[#71717a]">:</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => handleMinutesChange(e.target.value)}
            className="h-8 w-16 border-[#27272a] bg-[#27272a] text-center text-[#fafafa] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
