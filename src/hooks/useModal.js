import { useState } from 'react'

export function useModal() {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((value) => !value)

  return {
    isOpen,
    open,
    close,
    toggle
  }
}