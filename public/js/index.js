(function () {
  // const BASE_URL = 'http://127.0.0.1:3000'
  const BASE_URL = 'https://staging-my.shemedia.com'
  const buttons = document.querySelectorAll('.element-selector')
  const iframe = document.getElementById('single')
  const EVENTS = {
    SINGLE_ITEM_POSTED: 'SINGLE_ITEM_POSTED'
  }

  const handleSelectorClick = e => {
    const selector = e.target.innerText

    // pass isDebug parameter to inspect form state
    iframe.src = BASE_URL +
      '/boomerang-edit/single/?selector=' +
      encodeURIComponent(selector)
  }

  const receiveMessage = e => {
    const { data } = e

    switch (data.type) {
      case EVENTS.SINGLE_ITEM_POSTED:
        console.log('handle saving to local storage here', data.payload)
    }
  }

  buttons.forEach(button =>
    button.addEventListener('click', handleSelectorClick)
  )

  window.addEventListener('message', receiveMessage, false)
}())
