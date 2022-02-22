---
title: modal
---


### Imports

```typescript
import { modalVisibility, openModal, closeModal, closeAllModals, getOpenedModals } from 'modal'

import { PlainModal, Modal, ModalHeadline, ModalButtons } from 'components/feedback'
import type { ModalProps, ModalHeadlineProps, ModalButtonsProps, ModalButtonProps } from 'components/feedback'
```

```typescript
// decorator to manage a modal visibility state
modalVisibility(name: string, ComposedComponent): React.Component
```

```typescript
openCommonModal(props: ModalProps): void
openModal<TProps extends {}>(name: string, props?: TProps & Partial<ModalProps>): void
```

```typescript
// will close last opened modal if "name" not passed
closeModal(name?: string): void
closeAllModals(): void
```

```typescript
getOpenedModals(): string[]
```


### Modal Props

```typescript
import type { SvgName } from 'components/dataDisplay'
import type { ButtonBaseProps, ButtonContentProps } from 'components/inputs'


type ModalButtonProps = Omit<ButtonBaseProps & ButtonContentProps, 'size' | 'color'>

type ModalProps = {
  children?: React.ReactNode
  iconName?: SvgName
  title: string | Intl.Message
  text: string | Intl.Message
  content?: React.ReactNode
  primaryButton?: ModalButtonProps
  secondaryButton?: ModalButtonProps
  ordinaryButton?: ModalButtonProps
  overlayClosable?: boolean
  htmlRole?: string
  dataTestId?: string
  onClose?: () => void
}
```


### Usage

```typescript jsx
import React, { useCallback } from 'react'
import { CommonModal, openCommonModal, closeModal } from 'modal'

const App = () => {
  const handleButtonClick = useCallback(() => {
    openCommonModal({
      iconName: 'happyBird',
      title: 'Address validation',
      text: 'Please verify that address you entered is correct',
      content: (
        <span>Additional content</span>
      ),
      primaryButton: { 
        title: 'Use this address', 
      },
      secondaryButton: { 
        title: 'Edit address', 
        onClick: () => closeModal(), 
      },
    })
  }, [])

  return (
    <>
      <button onClick={handleButtonClick}>Open modal</button>
      <CommonModal />
    </>
  )
}
```

#### Custom Modal

If you'd like to create a modal with default inner components (Title, Text, Buttons) you can use `Modal`.

```typescript jsx
import React from 'react'
import { modalVisibility, openModal } from 'modal'

import { Modal } from 'components/feedback'
import type { ModalProps } from 'components/feedback'


export type CustomModalProps = {
  username: string
}

const CustomModal: React.FunctionComponent<CustomModalProps & ModalProps> = ({ userName, primaryButton, closeModal }) => (
  <Modal 
    title="Address validation"
    text="Please verify that address you entered is correct"
    primaryButton={primaryButton}
    closeModal={closeModal}
  >
    <span>Hello {userName}!</span>
  </Modal>
)

export const openCustomModal = (props: CustomModalProps) => openModal('customModal', props)


export default modalVisibility('customModal', CustomModal)
```

```typescript jsx
import React, { useCallback } from 'react'

import CustomModal, { openCustomModal } from 'compositions/modals/CustomModal/CustomModal'


const App = () => {
  const handleButtonClick = useCallback(() => {
    openCustomModal({
      userName: 'John Doe',
      primaryButton: { title: 'Ok' }, // you can override any property
    })
  }, [])

  return (
    <>
      <button onClick={handleButtonClick}>Open modal</button>
      <CustomModal />
    </>
  )
}
```

**All properties passed to `openModal(properties)` will be the props of `<CustomModal />`**

If you need more customization use `PlainModal`. This component provides only modal frame with overlay and close button.

```typescript jsx
import React from 'react'
import { openModal, modalVisibility } from 'modal'

import { PlainModal, ModalHeadline } from 'components/feedback'
import type { ModalProps } from 'components/feedback'


export type CustomModalProps = {
  username: string
}

const CustomModal: React.FunctionComponent<CustomModalProps & ModalProps> = ({ userName, closeModal }) => (
  <PlainModal closeModal={closeModal}>
    <Icon className={s.icon} name="happyBird" />
    <ModalHeadline title="Custom title" />
    <span>...smth else</span>
  </PlainModal>
)

export const openCustomModal = (props: CustomModalProps) => openModal('customModal', props)


export default modalVisibility('customModal', CustomModal)
```

```typescript jsx
import React, { useCallback } from 'react'

import CustomModal, { openCustomModal } from 'compositions/modals/CustomModal/CustomModal'


const App = () => {
  const handleButtonClick = useCallback(() => {
    openCustomModal({
      userName: 'John Doe',
    })
  }, [])

  return (
    <>
      <button onClick={handleButtonClick}>Open modal</button>
      <CustomModal />
    </>
  )
}
```
