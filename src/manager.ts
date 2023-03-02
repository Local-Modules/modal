import type React from 'react'
import EventAggregator from '@locmod/event-aggregator'


declare global {
  // ATTN extend this type to provide correct modal name and props mapping
  // Record type is required for custom modals without registration
  interface ModalsRegistry {
    _?: any
  }

  type ExtendModalsRegistry<T> = {
    [K in keyof T]: ExtractModalProps<T[K]>
  }

  /**
   * To extend registry:
   * declare global { interface ModalsRegistry extends ExtendModalsRegistry<typeof newRegistry> {} }
   */
}

type ExtractModalProps<T> = Omit<T extends React.JSXElementConstructor<infer P> ? P : {}, 'fallback' | 'closeModal' | 'name'>

type RequiredLiteralKeys<T> = keyof { [K in keyof T as string extends K ? never : number extends K ? never :
  {} extends Pick<T, K> ? never : K]: 0 }

// if modal props has any required property, it makes props argument required, otherwise it's optional
type OpenModalArgs<P> = RequiredLiteralKeys<P> extends never ? [] | [P] : [P]
type OpenModal = <K extends ModalName = ModalName>(name: K, ...args: OpenModalArgs<ModalsRegistry[K]>) => () => void

export type ModalComponentProps<P = {}> = P & { name: string, closeModal: (withOnClose?: boolean) => void, onClose?: () => void }

export type ModalComponent<P = {}> = React.ComponentType<ModalComponentProps<P>>

type Listener = () => void

export type ModalName = keyof ModalsRegistry

type OpenModalsState<K extends ModalName = ModalName> = Map<number, { name: K, props?: ModalsRegistry[K], closeModal: (withOnClose?: boolean) => void, isStandalone: boolean }>


export const modalsRegistry: Record<string, ModalComponent> = {}

class ModalManager {
  private events = new EventAggregator()
  private state: OpenModalsState = new Map()
  private standaloneModals: Record<string, number> = {}
  private lastId = 0

  private generateId() {
    return this.lastId++
  }

  public subscribe(listener: Listener) {
    this.events.subscribe('change', listener)
  }

  public unsubscribe(listener: Listener) {
    this.events.unsubscribe('change', listener)
  }

  public emitRender() {
    this.events.dispatch('change')
  }

  public openModal<K extends ModalName = ModalName>(name: K, props?: ModalsRegistry[K]) {
    const id = this.generateId()
    const isStandalone = this.standaloneModals[name] > 0

    const closeModal = (withOnClose?: boolean) => {
      this.state.delete(id)
      this.emitRender()

      if (withOnClose === true && typeof props?.onClose === 'function') {
        props?.onClose()
      }
    }

    this.state.set(id, { name, props, closeModal, isStandalone })
    this.emitRender()

    return closeModal
  }

  // closes every modal with requested name
  public closeModal(name: ModalName) {
    this.state.forEach((value, key) => {
      if (value.name === name) {
        this.state.delete(key)
      }
    })
    this.emitRender()
  }

  public getState() {
    return this.state
  }

  public markAsStandalone(name: string) {
    this.standaloneModals[name] = (this.standaloneModals[name] || 0) + 1
  }

  public unmarkAsStandalone(name: string) {
    this.standaloneModals[name] = (this.standaloneModals[name] || 1) - 1
  }
}

export const manager = new ModalManager()

export const openModal: OpenModal = (name, ...args) => manager.openModal(name, args[0])
export const closeModal = (name: ModalName) => manager.closeModal(name)

export const registerModals = (registry: Record<string, ModalComponent>) => {
  Object.keys(registry).forEach((key) => {
    modalsRegistry[key] = registry[key]
  })

  // unregister function
  return () => {
    Object.keys(registry).forEach((key) => {
      delete modalsRegistry[key]
    })
  }
}
