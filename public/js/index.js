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
  const EVENTS = {
    SINGLE_ITEM_POSTED: 'SINGLE_ITEM_POSTED',
    ALL_ITEMS_READY: 'ALL_ITEMS_READY',
    ALL_ITEMS_POSTED: 'ALL_ITEMS_POSTED',
    ALL_ITEMS_FAILED: 'ALL_ITEMS_FAILED',
    ALL_ITEMS_SAVED: 'ALL_ITEMS_SAVED'
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

  const receiveMessage = e => {
    const { data } = e
    const { type, payload } = data

    switch (type) {
      case EVENTS.SINGLE_ITEM_POSTED:
        return saveState(
          (loadState(LOCAL_STORAGE_KEY) || []).concat(payload),
          LOCAL_STORAGE_KEY
        )
      case EVENTS.ALL_ITEMS_READY:
        return iframe.contentWindow.postMessage({
          type: EVENTS.ALL_ITEMS_POSTED,
          payload: loadState(LOCAL_STORAGE_KEY) || []
        }, '*')
      case EVENTS.ALL_ITEMS_FAILED:
        return alert(payload.message)
      case EVENTS.ALL_ITEMS_SAVED:
        return onSaveComplete()
    }
  }

  buttons.forEach(button =>
    button.addEventListener('click', handleSelectorClick)
  )
  document.getElementById('save-all').addEventListener('click', triggerSaveAll)

  window.addEventListener('message', receiveMessage, false)
}())
