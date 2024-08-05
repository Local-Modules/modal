import type React from 'react'
import { events } from '@locmod/event-aggregator'


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

type Listener = (name: ModalName) => void

export type ModalName = keyof ModalsRegistry

type OpenModalsState<K extends ModalName = ModalName> = Map<number, { name: K, props?: ModalsRegistry[K], closeModal: (withOnClose?: boolean) => void, isStandalone: boolean }>


export const modalsRegistry: Record<string, ModalComponent<any>> = {}

class ModalManager {
  private events = events
  private state: OpenModalsState = new Map()
  private standaloneModals: Record<string, number> = {}
  private lastId = 0
  private eventName = 'locmod-modal-change'

  private generateId() {
    return this.lastId++
  }

  public subscribe(listener: Listener) {
    this.events.subscribe(this.eventName, listener)
  }

  public unsubscribe(listener: Listener) {
    this.events.unsubscribe(this.eventName, listener)
  }

  public emitRender(name: ModalName) {
    this.events.dispatch(this.eventName, name)
  }

  public openModal<K extends ModalName = ModalName>(name: K, props?: ModalsRegistry[K]) {
    const id = this.generateId()
    const isStandalone = this.standaloneModals[name] > 0

    const closeModal = (withOnClose?: boolean) => {
      this.state.delete(id)
      this.emitRender(name)

      if (withOnClose === true && typeof props?.onClose === 'function') {
        props?.onClose()
      }
    }

    this.state.set(id, { name, props, closeModal, isStandalone })
    this.emitRender(name)

    return closeModal
  }

  // closes every modal with requested name
  public closeModal(name: ModalName) {
    this.state.forEach((value, key) => {
      if (value.name === name) {
        this.state.delete(key)
      }
    })
    this.emitRender(name)
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

  public getOpenModalNames() {
    const openModalNames: ModalName[] = []

    this.getState().forEach((value) => {
      openModalNames.push(value.name)
    })

    return openModalNames
  }
}

export const manager = new ModalManager()

export const openModal: OpenModal = (name, ...args) => manager.openModal(name, args[0])
export const closeModal = (name: ModalName) => manager.closeModal(name)
export const getOpenModalNames = () => manager.getOpenModalNames()

export const registerModals = (registry: Record<string, ModalComponent<any>>) => {
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
