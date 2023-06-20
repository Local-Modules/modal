import { useEffect, useState } from 'react'
import { manager, type ModalName } from '../manager'


export default function useModalOpenState(name: ModalName) {
  const [ isOpen, setIsOpen ] = useState(false)

  useEffect(() => {
    const listener = (eventModalName: ModalName) => {
      if (eventModalName !== name) {
        return
      }

      setIsOpen(manager.getOpenModalNames().includes(name))
    }

    manager.subscribe(listener)

    return () => {
      manager.unsubscribe(listener)
    }
  }, [ name ])

  return isOpen
}
