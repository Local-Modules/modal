
# @locmod/modal

<!-- TOC -->
* [Installation](#installation)
* [Structure](#structure)
  * [Difference of standalone modals](#difference-of-standalone-modals)
  * [Examples](#examples)
* [Manager](#manager)
* [How to](#how-to)
  * [ModalComponentProps](#modalcomponentprops)
  * [How to open and close modals](#how-to-open-and-close-modals)
  * [Registry](#registry)
  * [Typechecking](#typechecking)
<!-- TOC -->

### Installation

```bash
npm install --save @locmod/modal
```

## Structure
Modal system consists of:

- manager (controls the state)
- and public methods and types:

|                                                            |                                                                                                                                                                                                   |
|------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| global `type ModalsRegistry`                               | Provides modal props mapping for all other methods: `{ [modalName: string]: {...} }`                                                                                                              |
| global `type ExtendModalsRegistry`                         | Type helper. Use in modal cmponents to add mapping of modal name & props to ModalsRegistry. See [Typecheking section](#typechecking) for details                                                  |
| `type ModalName`                                           | Registered modal names `keyof ModalsRegistry`                                                                                                                                                     |
| `type ModalComponentProps<YourModalProps>`                 | helper type to use for modals, combine your business-logic props with props provided by `ModalRenderer` / `standaloneModal`. See [ModalComponentProps](#modalcomponentprops) section for details. |
| `type ModalComponent<YourModalProps>`                      | helper type to use for modals, combine your business-logic props with `ModalComponentProps`                                                                                                       |
| `openModal(name: ModalName)`                               | Opens a modal by name                                                                                                                                                                             |
| `closeModal(name: ModalName)`                              | Closes **all** modals by name                                                                                                                                                                     |
| `registerModals(registry: Record<string, ModalComponent>)` | Registers modal to render by `ModalRenderer`. See [Registry](#registry) section for details                                                                                                       |
| `getOpenModalNames()`                                      | Returns an array of open modal names                                                                                                                                                              |
| `<ModalsRenderer />`                                       | Handles render of all modals which added by `registerModals`, should be added to App render                                                                                                       |
| `standaloneModal(string: ModalName, ModalComponent)`       | HOC. It handles render of wrapped modal. Should be added to render manually. Use for specific modals, e.g. a modal requires some non-global Context that isn't accessible from ModalsRenderer     |

### Difference of standalone modals

- ModalsRenderer skips (doesn't render) modals which are wrapped by this HOC
- so you don't need to register it by `registerModals`
- you must put this modal in render manually

Use for specific modals, e.g. a modal requires some non-global Context that isn't accessible from ModalsRenderer

### Examples

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

### How to open and close modals

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

### Registry

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
You shouldn't add modals wrapped by `standaloneModal` to registry, use standaloneModal for non-global modals that used in specific place, e.g. your modal requires some specific Context


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
