(function () {
  const loadState = localStorageKey => {
    try {
      const serializedState = localStorage.getItem(localStorageKey)
      if (serializedState === null) {
        return undefined
      }

      return JSON.parse(serializedState)
    } catch (error) {
      return undefined
    }
  }
  const saveState = (state, localStorageKey) => {
    try {
      const serializedState = JSON.stringify(state)
      localStorage.setItem(localStorageKey, serializedState)
    } catch (error) {
      // do something here
    }
  }

  const LOCAL_STORAGE_KEY = 'boomerangInjectedAds'
  // const BASE_URL = 'http://127.0.0.1:3000/boomerang-edit'
  const BASE_URL = 'https://staging-my.shemedia.com/boomerang-edit'
  const buttons = document.querySelectorAll('.element-selector')
  const iframe = document.getElementById('single')
  const previewPre = document.getElementById('preview')
  const EVENTS = {
    SINGLE_ITEM_POSTED: 'SINGLE_ITEM_POSTED',
    ALL_ITEMS_READY: 'ALL_ITEMS_READY',
    ALL_ITEMS_POSTED: 'ALL_ITEMS_POSTED',
    ALL_ITEMS_FAILED: 'ALL_ITEMS_FAILED',
    ALL_ITEMS_SAVED: 'ALL_ITEMS_SAVED',
    ALL_ITEMS_PREVIEW: 'ALL_ITEMS_PREVIEW'
  }

  const handleSelectorClick = e => {
    const selector = e.target.innerText

    // pass isDebug parameter to inspect form state
    iframe.src = BASE_URL + '/single/?selector=' + encodeURIComponent(selector)
  }
  const triggerSaveAll = e => {
    iframe.src = BASE_URL + '/all/?siteId=123'
  }

  const onSaveComplete = () => {
    // show success toast from iframe, then destroy
    window.setTimeout(() => {
      iframe.src = ''
    }, 2000)

    // optionally destroy localStorage state
    saveState([], LOCAL_STORAGE_KEY)
  }

  const onPreview = payload => {
    const { formValue, formState } = payload

    if (!formState.isValid) {
      // handle this by alerting user that the form isn't valid
      // other than through the iframe UI where errors 
      // are visualized. Or not :p
      return
    }

    // do the preview magic here
    previewPre.innerText = JSON.stringify(formValue, null, 2)

    return saveState(formValue, LOCAL_STORAGE_KEY)
  }

  const receiveMessage = e => {
    const { data } = e
    // e.data.type being 'SKMBoomerangMessageRequest' is irrelevant for this implementation
    const { method, data: receivedData } = data

    switch (method) {
      case EVENTS.SINGLE_ITEM_POSTED:
        return saveState(
          (loadState(LOCAL_STORAGE_KEY) || []).concat(receivedData),
          LOCAL_STORAGE_KEY
        )
      case EVENTS.ALL_ITEMS_READY:
        return iframe.contentWindow.postMessage({
          type: 'SKMBoomerangMessageRequest',
          method: EVENTS.ALL_ITEMS_POSTED,
          data: loadState(LOCAL_STORAGE_KEY) || []
        }, '*')
      case EVENTS.ALL_ITEMS_FAILED:
        return alert(receivedData.message)
      case EVENTS.ALL_ITEMS_SAVED:
        return onSaveComplete()
      case EVENTS.ALL_ITEMS_PREVIEW:
        return onPreview(receivedData)
    }
  }

  buttons.forEach(button =>
    button.addEventListener('click', handleSelectorClick)
  )
  document.getElementById('save-all').addEventListener('click', triggerSaveAll)

  window.addEventListener('message', receiveMessage, false)
}())
