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
  const BASE_URL = 'http://127.0.0.1:3000/boomerang-edit'
  const BASE_URL = 'https://staging-my.shemedia.com/boomerang-edit'
  const buttons = document.querySelectorAll('.element-selector')
  const iframe = document.getElementById('single')
  const previewPre = document.getElementById('preview')
  const EVENTS = {
    INJECTION_RULES_SINGLE_POSTED: 'INJECTION_RULES_SINGLE_POSTED',
    INJECTION_RULES_ALL_READY: 'INJECTION_RULES_ALL_READY',
    INJECTION_RULES_ALL_POSTED: 'INJECTION_RULES_ALL_POSTED',
    INJECTION_RULES_ALL_FAILED: 'INJECTION_RULES_ALL_FAILED',
    INJECTION_RULES_ALL_SAVED: 'INJECTION_RULES_ALL_SAVED',
    INJECTION_RULES_ALL_PREVIEW: 'INJECTION_RULES_ALL_PREVIEW'
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
    previewPre.innerText = JSON.stringify(payload, null, 2)

    return saveState(payload, LOCAL_STORAGE_KEY)
  }

  const receiveMessage = e => {
    const { data } = e
    // e.data.type being 'SKMBoomerangMessageRequest' is irrelevant for this implementation
    const { method, data: receivedData } = data

    switch (method) {
      case EVENTS.INJECTION_RULES_SINGLE_POSTED:
        return saveState(
          (loadState(LOCAL_STORAGE_KEY) || []).concat(receivedData),
          LOCAL_STORAGE_KEY
        )
      case EVENTS.INJECTION_RULES_ALL_READY:
        return iframe.contentWindow.postMessage({
          type: 'SKMBoomerangMessageRequest',
          method: EVENTS.INJECTION_RULES_ALL_POSTED,
          data: loadState(LOCAL_STORAGE_KEY) || []
        }, '*')
      case EVENTS.INJECTION_RULES_ALL_FAILED:
        return alert(receivedData.message)
      case EVENTS.INJECTION_RULES_ALL_SAVED:
        return onSaveComplete()
      case EVENTS.INJECTION_RULES_ALL_PREVIEW:
        return onPreview(receivedData)
    }
  }

  buttons.forEach(button =>
    button.addEventListener('click', handleSelectorClick)
  )
  document.getElementById('save-all').addEventListener('click', triggerSaveAll)

  window.addEventListener('message', receiveMessage, false)
}())
