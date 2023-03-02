import React, { useEffect, useState } from 'react'

import { manager, ModalComponent, modalsRegistry, registerModals } from './manager'


type ModalsRendererProps = {
  registry?: Record<string, ModalComponent>
}

const ModalsRenderer: React.FC<ModalsRendererProps> = ({ registry }) => {
  const [ _, update ] = useState(0)

  useEffect(() => {
    if (registry) {
      return registerModals(registry)
    }
  }, [ registry ])

  useEffect(() => {
    const listener = () => {
      update((value) => value + 1)
    }

    manager.subscribe(listener)

    return () => {
      manager.unsubscribe(listener)
    }
  }, [])

  const nodes = []

  for (const [ id, { name, props, closeModal, isStandalone } ] of manager.getState().entries()) {
    // skip standalone modals, they render themselves
    if (isStandalone) {
      continue
    }

    if (!modalsRegistry[name]) {
      continue
    }

    const Component = modalsRegistry[name]

    nodes.push(
      <Component
        key={id}
        name={name}
        closeModal={closeModal}
        {...props}
      />
    )
  }

  return (
    <>
      {nodes}
    </>
  )
}


export default ModalsRenderer
