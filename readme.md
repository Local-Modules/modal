
# @locmod/modal

### Installation

```bash
npm install --save @locmod/modal
```

## Structure
Modal system consists of:

- manager (controls the state)
- `ModalsRenderer` (should be in App render, to render global modals registered by `registerModals` method)
- `standaloneModal` (use for specific modals, e.g. it will be opened in one place after some user actions)

#### Difference of default/standalone modals

- you don't need to register it by `registerModals`
- you must put this modal in render manually

See live examples on codesandbox.io:
- [Global modal](https://codesandbox.io/s/locmod-modal-2-global-7n8gd6)
- [Standalone modal](https://codesandbox.io/s/locmod-modal-2-0-standalone-k71knv)

## Manager

Controls modals system state, provides event listeners and emit events. Controls modals registry.

Only some methods of the manager are public.

## How to

### ModalComponentProps

When you build your modal, even if you don't need business logic props, you have additional props which are provided by ModalRenderer / standaloneModal - use type `ModalComponentProps`:

```tsx
import { type ModalComponentProps } from '@locmod/modal'

/*
*  type ModalComponentProps = {
*    name: string
*    closeModal: (withOnClose?: boolean) => void
*    onClose?: () => void
*  }
*/

const ExampleModal: React.FC<ModalComponentProps> = (props) => {
  const { closeModal } = props
  
  const handleClick = () => {
    // closeModal has a boolean argument "withOnClose"
    // if it's true, it will trigger the "onClose" prop, if passed
    closeModal(true)
  }
  
  return (
    <div>
      <button onClick={handleClick}>Ok</button>
    </div>
  )
}
```

### How to open modals

To control modals you have `openModal` and `closeModal` helpers:

```typescript
import { openModal, closeModal } from '@locmod/modal'

openModal('ExampleModal') // just open a modal that is registered by registerModals() or rendered by standaloneModal

// it returns a unique closer (is the same as closeModal in Modal component)
const closeThisExactModal = openModal('ExampleModal', { 
  // will be triggered by closeThisExactModal(true) or by closeModal(true) inside ExampleModal
  onClose: () => console.log('onclose triggered'),
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
  nextjsDynamicModal: dynamic(() => import('compositions/modals/LazyModal/LazyModal')),
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
  }, [])

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
You shouldn't add modals wrapped by `standaloneModal` to registry, use standaloneModal for non-global modals that used in specific place


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
