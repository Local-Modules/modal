
# @locmod/modal

### Installation

```bash
npm install --save @locmod/modal
```

### Structure
Modal system consists of:

- manager
- ModalRenderer (for global modals)
- standaloneModal (use for modals used in specific place)

See examples:
- [Global modal](#example-of-global-modal)
- [Standalone modal](#example-of-standalone-modal)

## Manager

Controls modals system state, provides event listeners and emit events. Controls modals registry.

Only some methods of the manager are public.

### How to open modals

To control modals you have `openModal` and `closeModal` helpers:

```typescript
import { openModal, closeModal } from '@locmod/modal'

openModal('commonModal') // just open a modal

// it returns a unique closer (is the same as closeModal in Modal component)
const closeThisExactModal = openModal('commonModal', { 
  title: 'Test',
  primaryButton: {
    title: 'Close',
    onClick: () => closeThisExactModal(), // not every commonModal, but this one exactly
  }
})

// to close every possible common modal
closeModal('commonModal') // use with careful and only outside the modal itself
```

When you call `openModal`, it generates a unique id and an instance of a modal. Such behaviour helps to
display multiple modals with the same base component (like `CommonModal`) and handle them separately.

If a modal has some required props, `props` argument in openModal is required too.
All props will be passed to the modal component.

## Registry

Registry is a simple record of modal components keyed by modal name. Each modal will be rendered only
when it's opened by manager. If you don't want to load a modal immediately, provide a dynamic component.

```typescript
const modalRegistry = {
  commonModal: CommonModal, // component
  lazyModal: React.lazy(() => import('compositions/modals/LazyModal/LazyModal')),
  loadableModal: loadable(() => import('compositions/modals/LazyModal/LazyModal')),
  nextjsDynamic: dynamic(() => import('compositions/modals/LazyModal/LazyModal')),
}
```

To register global modals (that could be opened from any place of app) in runtime use `registerModals` helper:

```tsx
import { registerModals, ModalsRenderer } from '@locmod/modal'
import InfoModal from './InfoModal/InfoModal'
import ErrorModal from './ErrorModal/ErrorModal'

const modalRegistry = {
  InfoModal,
  ErrorModal,
}

// you can register modals permanently
registerModals(modalRegistry)

const App = () => {
  // or temporary in useEffect
  useEffect(() => {
    return registerModals(modalRegistry)
  })

  return (
    <>
      <Head />
      <Content />
      {/* or via registry prop, which do the same in useEffect */}
      <ModalsRenderer registry={modalRegistry} />
    </>
  )
}
```
You shouldn't add modals wrapped by `standaloneModal` to registry, use standaloneModal for not-global modals that used in specific place


### Typechecking
To use registered modals in typechecking you need to extend global interface `ModalsRegistry`:

```typescript
declare global {
  // dumb but works
  interface ModalsRegistry {
    newModal: { priority?: number }
  }
}
```

To generate properties from the component, use `ExtendModalsRegistry` helper. It automatically extracts all properties from the component and removes `ModalComponentProps` from them:

```typescript
declare global {
  interface ModalsRegistry extends ExtendModalsRegistry<{ newModal: typeof NewModal }> {}
}
```

## Example of global modal

#### Modal Component
```tsx
import { type ModalComponentProps } from '@locmod/modal'
import { SomePlainModalMarkUpYouHave } from 'components/ui'

type AlertModalProps = {
  title?: string
  text?: string
}

const AlertModal: React.FC<ModalComponentProps & AlertModalProps> = (props) => {
  const { closeModal, title, text } = props
  
  const handleClick = () => {
    // "true" will trigger onClose handler if it will be passed to props
    closeModal(true)
  }

  return (
    <SomePlainModalMarkUpYouHave closeModal={closeModal}>
      <h3>{title || 'Ooops'}</h3>
      <p>{text || 'Something went wrong. Pleasy try again later'}</p>
      <button onClick={handleClick}>
        Ok
      </button>
    </SomePlainModalMarkUpYouHave>
  )
}

declare global {
  interface ModalsRegistry extends ExtendModalsRegistry<{ AlertModal: typeof AlertModal }> {}
}

export default AlertModal
```

#### App
```tsx
import { ModalsRenderer } from '@locmod/modal'

import AlertModal from 'components/AlertModal/AlertModal'
import Content from 'components/Content/Content'

const modalRegistry = {
  AlertModal,
}

const App = () => (
  <>
    <Content />
    <ModalsRenderer registry={modalRegistry} />
  </>
)
```

#### Open global modal from Content

```tsx
import { useEffect } from 'react'
import { openModal, closeModal } from '@locmod/modal'


const Content = () => {
  useEffect(() => {
    try {
      // do something, fetch, anything
    }
    catch (error) {
      // if all props are optional you can use just name
      // if modal have required props, there will be an TS error
      openModal('AlertModal')
    }

    return () => {
      // will close ALL modals with this name
      closeModal('AlertModal')
    }
  }, [])

  const handleButtonClick = () => {
    // open modal with props
    openModal('AlertModal', {
      title: 'Wow!',
      text: 'You clicked it',
      onClose: () => {
        console.log('Alert closed')
      },
    })
  }

  return (
    <button type="button" onClick={handleButtonClick}>
      Click me
    </button>
  )
}
```

## Example of standalone modal

#### Modal Component
```tsx
import { type ModalComponentProps } from '@locmod/modal'
import { SomePlainModalMarkUpYouHave } from 'components/ui'


const SpecificModal: React.FC<ModalComponentProps> = (props) => {
  const { closeModal } = props
  
  const handleClick = () => {
    // "true" will trigger onClose handler if it will be passed to props
    closeModal(true)
  }

  return (
    <SomePlainModalMarkUpYouHave closeModal={closeModal}>
      <h3>Success!</h3>
      <p>Your order has been placed</p>
      <button onClick={handleClick}>
        Ok
      </button>
    </SomePlainModalMarkUpYouHave>
  )
}

// you still should do it to use openModal with this name in TS
declare global {
  interface ModalsRegistry extends ExtendModalsRegistry<{ SpecificModal: typeof SpecificModal }> {}
}

// should be wrapped by standaloneModal
export default standaloneModal('SpecificModal', SpecificModal)
```

#### App
```tsx
import Content from 'components/Content/Content'

const App = () => (
  <>
    <Content />
  </>
)
```

#### Use standalone modal in Content

```tsx
import { openModal } from '@locmod/modal'
import SpecificModal from 'components/SpecificModal/SpecificModal'


const Content = () => {
  const handleButtonClick = () => {
    // open modal with props
    openModal('SpecificModal', {
      onClose: () => {
        console.log('SpecificModal closed')
      },
    })
  }

  return (
    <>
      <button type="button" onClick={handleButtonClick}>
        Click me
      </button>
      {/* standalone modal should be rendered in place of usage */}
      <SpecificModal />
    </>
  )
}
```
