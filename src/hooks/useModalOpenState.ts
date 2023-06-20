import { useEffect, useState } from 'react'
import { manager, type ModalName } from '../manager'


export default function useModalOpenState(name: ModalName) {
  const [ isOpen, setIsOpen ] = useState(false)

  useEffect(() => {
    const listener = (eventModalName: ModalName) => {
      if (eventModalName !== name) {
        return
      }
      // we take info if modal is open from the manager state (getOpenModalNames), not from event
      // because:
      //  - we can have several open modals with the same name
      //  - we can close all of them (manager.closeModal) or just one of them (by method closeModal in each modal instance)
      setIsOpen(manager.getOpenModalNames().includes(name))
    }

    manager.subscribe(listener)

    return () => {
      manager.unsubscribe(listener)
    }
  }, [ name ])

  return isOpen
}
