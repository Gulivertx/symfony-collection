'use strict'

const a2lix_lib = {}

a2lix_lib.sfCollection = (() => {
  const init = (config = {}) => {
    if (!('content' in document.createElement('template'))) {
      console.error('HTML template will not working...')
      return
    }

    const {
      collectionsSelector = 'form div[data-prototype]',
      manageRemoveEntry = true,
      lang = {
        add: 'Add',
        remove: 'Remove'
      },
      afterAdd = null,
      afterRemove = null,
      maxElements = null
    } = config

    const collectionsElt = document.querySelectorAll(collectionsSelector)
    if (!collectionsElt.length) {
      return
    }

    collectionsElt.forEach(collectionElt => {
      processCollectionElt(
        collectionElt,
        manageRemoveEntry,
        lang,
        afterAdd,
        afterRemove,
        maxElements
      )
    })
  }

  const processCollectionElt = (
    collectionElt,
    manageRemoveEntry = false,
    lang,
    afterAdd,
    afterRemove,
    maxElements
  ) => {
    collectionElt.setAttribute(
      'data-entry-index',
      collectionElt.children.length
    )

    appendEntryAddLink(collectionElt, lang)

    if (manageRemoveEntry) {
      appendEntryRemoveLink(collectionElt, lang)
    }

    collectionElt.addEventListener('click', evt =>
      configureCollectionElt(
        evt,
        manageRemoveEntry,
        lang,
        afterAdd,
        afterRemove,
        maxElements
      )
    )
  }

  const appendEntryAddLink = (collectionElt, lang) => {
    // Allow custom label
    const entryLabel = collectionElt.getAttribute('data-entry-add-label') || '',
      entryLabelClass =
        collectionElt.getAttribute('data-entry-add-class') ||
        'btn btn-primary btn-sm mt-2'

    const entryAddLink = getButtonElt(
      `${lang.add} ${entryLabel}`,
      'add',
      `${entryLabelClass}`
    )

    collectionElt.appendChild(entryAddLink)
  }

  const appendEntryRemoveLink = (collectionElt, lang) => {
    const entryLabel =
        collectionElt.getAttribute('data-entry-remove-label') || '',
      entryLabelClass =
        collectionElt.getAttribute('data-entry-remove-class') ||
        'btn btn-danger btn-sm'

    const entryRemoveLink = getButtonElt(
      `${lang.remove} ${entryLabel}`,
      'remove',
      `${entryLabelClass}`
    )

    const collectionChildren = [...collectionElt.children]
      .filter(entryElt => !entryElt.hasAttribute('data-entry-action'))
      .forEach(entryElt => {
        entryElt.appendChild(entryRemoveLink.cloneNode(true))
      })
  }

  const configureCollectionElt = (
    evt,
    manageRemoveEntry,
    lang,
    afterAdd,
    afterRemove,
    maxElements
  ) => {
    if (!evt.target.hasAttribute('data-entry-action')) {
      return
    }

    switch (evt.target.getAttribute('data-entry-action')) {
      case 'add':
        addEntry(
          evt.currentTarget,
          evt.target,
          manageRemoveEntry,
          lang,
          afterAdd,
          maxElements
        )
        break
      case 'remove':
        removeEntry(evt.currentTarget, evt.target, afterRemove, maxElements)
        break
    }
  }

  const addEntry = (
    collectionElt,
    entryAddButton,
    manageRemoveEntry,
    lang,
    afterAdd,
    maxElements
  ) => {
    // Get & update entryIndex
    const entryIndex = collectionElt.getAttribute('data-entry-index')
    collectionElt.setAttribute('data-entry-index', +entryIndex + 1)

    const entryPrototype = collectionElt.getAttribute('data-prototype'),
      templateContent = getTemplateContent(entryPrototype, entryIndex)

    // Add remove button, if necessary, before insert to the DOM
    if (manageRemoveEntry) {
      const entryLabel =
          collectionElt.getAttribute('data-entry-remove-label') || '',
        entryLabelClass =
          collectionElt.getAttribute('data-entry-remove-class') ||
          'btn btn-danger btn-sm',
        entryRemoveLink = getButtonElt(
          `${lang.remove} ${entryLabel}`,
          'remove',
          `${entryLabelClass}`
        )
      templateContent.firstChild.appendChild(entryRemoveLink)
    }

    if (afterAdd !== null) afterAdd(collectionElt, templateContent.firstChild)

    // If maxElements is set we want to disable the button when maximum elements are already reach
    entryAddButton.disabled = maxElements && +entryIndex + 1 === maxElements

    entryAddButton.parentElement.insertBefore(templateContent, entryAddButton)
  }

  const removeEntry = (
    collectionElt,
    entryRemoveButton,
    afterRemove,
    maxElements
  ) => {
    const entryIndex = collectionElt.getAttribute('data-entry-index')
    collectionElt.setAttribute('data-entry-index', +entryIndex - 1)

    entryRemoveButton.parentElement.remove()

    if (+entryIndex - 1 < maxElements) {
      const btnElements = collectionElt.getElementsByTagName('button')
      for (let btn of btnElements) {
        if (btn.dataset.entryAction === 'add') btn.disabled = false
      }
    }

    if (afterRemove !== null)
      afterRemove(collectionElt, entryRemoveButton.parentElement)
  }

  /**
   * HELPERS
   */

  const getButtonElt = (label, action, className = 'btn') => {
    const button = document.createElement('button')

    button.type = 'button'
    button.textContent = label
    button.className = className
    button.dataset.entryAction = action

    return button
  }

  const getTemplateContent = (entryPrototype, entryIndex) => {
    const template = document.createElement('template')

    const entryHtml = entryPrototype
      .replace(/__name__label__/g, `!New! ${entryIndex}`)
      .replace(/__name__/g, entryIndex)

    template.innerHTML = entryHtml.trim()

    return template.content
  }

  return {
    init
  }
})()

export default a2lix_lib
