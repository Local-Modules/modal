import React, { useEffect, useRef, useState } from 'react'
import { type ModalComponent, type ModalName, manager } from './manager'


// to render a modal in-place without registration required
const standaloneModal = (modalName: ModalName, Component: ModalComponent) => {
  // ATTN because we can render several instances of standaloneModal,
  //  we should track them and render only in the active one
  let lastId = 1
  let activeIds: number[] = []

  const Wrapper: React.FC = () => {
    const [ , forceUpdate ] = useState(0)
    const instanceIdRef = useRef<number>(lastId++)

    useEffect(() => {
      const listener = () => {
        forceUpdate((value) => (value + 1))
      }
      manager.subscribe(listener)
      manager.markAsStandalone(modalName)

      activeIds.push(instanceIdRef.current)

      return () => {
        activeIds = activeIds.filter((value) => value !== instanceIdRef.current)
        manager.unsubscribe(listener)
        manager.unmarkAsStandalone(modalName)
      }
    }, [])

    // ATTN show only if this instance is the first instance of this modal
    if (activeIds[0] !== instanceIdRef.current) {
      return null
    }

    let nodes = []

    for (const [ id, { name, props, closeModal } ] of manager.getState().entries()) {
      if (modalName === name) {
        nodes.push(
          <Component
            key={id}
            name={name}
            closeModal={closeModal}
            {...props}
          />
        )
      }
    }

    return (
      <>
        {nodes}
      </>
    )
  }

  Wrapper.displayName = `StandaloneModal(${Component.displayName || Component.name || modalName})`

  return Wrapper
}


export default standaloneModal
