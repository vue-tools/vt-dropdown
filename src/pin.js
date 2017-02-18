class Pin {
    constructor(pinObject, baseObject, opts) {
        let defaultOpts = {
            update: noop,
            direction: ''
        }

        pinObject = normalize(pinObject)
        baseObject = normalize(baseObject)

        if (pinObject.element === Pin.VIEWPORT || pinObject.element._id === 'VIEWPORT') {
            return
        }

        this.pinObject = pinObject
        this.baseObject = baseObject
        this.opts = Object.assign({}, defaultOpts, opts)

        this.render()
        this.addEvents()
        this.opts.direction && this.update()
    }
    render() {
        let pinElement, parentOffset, baseOffset, isPinFixed

        isPinFixed = true
        pinElement = this.pinObject.element

        if (getCss(pinElement, 'position') !== 'fixed') {
            pinElement.style.position = 'absolute'
            isPinFixed = false
        }

        posConverter(this.pinObject)
        posConverter(this.baseObject)
        parentOffset = getParentOffset(pinElement)
        baseOffset = this.baseObject.offset(isPinFixed)

        pinElement.style.top = `${baseOffset.top + this.baseObject.y - this.pinObject.y - parentOffset.top}px`
        pinElement.style.left = `${baseOffset.left + this.baseObject.x - this.pinObject.x - parentOffset.left}px`
    }
    update() {
        let direction, pinElement, baseElement, gap, width, height, x, y, margin

        direction = this.opts.direction
        pinElement = this.pinObject.element
        baseElement = this.baseObject.element

        if (!direction) {
            this.render()
            return
        }

        gap = getGap(baseElement)
        width = offsetWidth(pinElement)
        height = offsetHeight(pinElement)

        if (direction === 'top' || direction === 'bottom') {
            x = 0
            margin = numberize(getCss(pinElement, 'margin-top')) + numberize(getCss(pinElement, 'margin-bottom'))

            if (height <= gap.bottom) {
                y = '100%'
                direction = 'bottom'
            } else if (height <= gap.top) {
                y = `-${height}-${margin}`
                direction = 'top'
            } else if (direction === 'bottom') {
                y = '100%'
                direction = 'bottom'
            } else if (direction === 'top') {
                y = `-${height}-${margin}`
                direction = 'top'
            }
        }

        if (direction === 'left' || direction === 'right') {
            y = 0

            if (width <= gap.left) {
                x = `-${width}`
                direction = 'left'
            } else if (width <= gap.right) {
                x = '100%'
                direction = 'right'
            } else if (direction === 'left') {
                x = `-${width}`
                direction = 'left'
            } else if (direction === 'right') {
                x = '100%'
                direction = 'right'
            }
        }

        this.pinObject = normalize(pinElement)
        this.baseObject = normalize({ element: baseElement, x, y })

        this.render()
        this.opts.update(direction)
    }
    destroy() {
        this.removeEvents()
    }
    addEvents() {
        this.updateBound = this.update.bind(this)
        this.target = getScrollParent(this.baseObject.element)

        window.addEventListener('resize', this.updateBound)
        this.target.addEventListener('scroll', this.updateBound)
    }
    removeEvents() {
        window.removeEventListener('resize', this.updateBound)
        this.target.removeEventListener('scroll', this.updateBound)
    }
    static top(pinElement, baseElement, opts) {
        return new Pin(pinElement, { element: baseElement, x: 0, y: '-100%' }, Object.assign({ direction: 'top' }, opts))
    }
    static bottom(pinElement, baseElement, opts) {
        return new Pin(pinElement, { element: baseElement, x: 0, y: '100%' }, Object.assign({ direction: 'bottom' }, opts))
    }
    static left(pinElement, baseElement, opts) {
        return new Pin(pinElement, { element: baseElement, x: '-100%', y: 0 }, Object.assign({ direction: 'left' }, opts))
    }
    static right(pinElement, baseElement, opts) {
        return new Pin(pinElement, { element: baseElement, x: '100%', y: 0 }, Object.assign({ direction: 'right' }, opts))
    }
    static center(pinElement, baseElement) {
        return new Pin({ element: pinElement, x: '50%', y: '50%' }, { element: baseElement, x: '50%', y: '50%' })
    }
}

Pin.VIEWPORT = { nodeType: 1, _id: 'VIEWPORT' }

function noop() { }

function normalize(posObject = {}) {
    let element, isVIEWPORT

    if (posObject.nodeType) {
        posObject = {
            element: posObject
        }
    }

    element = posObject.element || Pin.VIEWPORT

    if (element.nodeType !== 1) {
        throw new Error('posObject.element is invalid.')
    }

    isVIEWPORT = (element === Pin.VIEWPORT || element._id === 'VIEWPORT')

    return {
        element: element,
        x: posObject.x || 0,
        y: posObject.y || 0,
        offset(isPinFixed) {
            if (isPinFixed) {
                return { top: 0, left: 0 }
            } else if (isVIEWPORT) {
                return { top: getDocumentScroll('Top'), left: getDocumentScroll('Left') }
            } else {
                return getOffset(element)
            }
        },
        size() {
            let el = isVIEWPORT ? window : element

            return {
                width: el.offsetWidth,
                height: el.offsetHeight
            }
        }
    }
}

function posConverter(pinObject) {
    pinObject.x = xyConverter(pinObject.x, pinObject, 'width')
    pinObject.y = xyConverter(pinObject.y, pinObject, 'height')
}

function xyConverter(x, pinObject, type) {
    x = x + ''
    x = x.replace(/px/gi, '')

    if (/\D/.test(x)) {
        x = x.replace(/(?:top|left)/gi, '0%').replace(/center/gi, '50%').replace(/(?:bottom|right)/gi, '100%')
    }

    if (x.indexOf('%') !== -1) {
        x = x.replace(/(\d+(?:\.\d+)?)%/gi, (m, d) => pinObject.size()[type] * (d / 100.0))
    }

    if (/[+\-*\/]/.test(x)) {
        try {
            x = (new Function('return ' + x))()
        } catch (e) {
            throw new Error('Invalid position value: ' + x)
        }
    }

    return numberize(x)
}

function getOffset(element) {
    let doc, rect

    doc = document.documentElement
    rect = element.getBoundingClientRect()

    return {
        top: rect.top + (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0),
        left: rect.left + (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0)
    }
}

function getCss(el, property) {
    return el.ownerDocument.defaultView.getComputedStyle(el, null)[property]
}

function numberize(s) {
    return parseFloat(s, 10) || 0
}

function getParentOffset(element) {
    let offset, parent

    offset = { top: 0, left: 0 }
    parent = offsetParent(element)

    if (parent === document.documentElement) {
        parent = document.body
    }

    if (!(parent === document.body && getCss(parent, 'position') === 'static')) {
        offset = getOffset(parent)
    }

    offset.top += numberize(getCss(parent, 'border-top-width'))
    offset.left += numberize(getCss(parent, 'border-left-width'))

    return offset
}

function offsetParent(element) {
    return result(element, () => element.offsetParent || element)
}

function offsetWidth(element) {
    return result(element, () => element.offsetWidth)
}

function offsetHeight(element) {
    return result(element, () => element.offsetHeight)
}

function getScrollParent(element) {
    let scroll, isOverflow, isOverflowX, isOverflowY

    if (element === document) {
        return document.body
    }

    scroll = ['scroll', 'auto']
    isOverflow = scroll.indexOf(getCss(element, 'overflow')) !== -1
    isOverflowX = scroll.indexOf(getCss(element, 'overflow-x')) !== -1
    isOverflowY = scroll.indexOf(getCss(element, 'overflow-y')) !== -1

    if (isOverflow || isOverflowX || isOverflowY) {
        return element === document.body ? getScrollParent(element.parentNode) : element
    }

    return element.parentNode ? getScrollParent(element.parentNode) : element
}

function getGap(element) {
    let top, bottom, left, right, elementOffset, scrollElement, scrollOffset

    elementOffset = getOffset(element)
    scrollElement = getScrollParent(element)
    scrollOffset = getOffset(scrollElement)

    top = elementOffset.top - scrollOffset.top
    left = elementOffset.left - scrollOffset.left
    right = offsetWidth(scrollElement) - left - offsetWidth(element)
    bottom = offsetHeight(scrollElement) - top - offsetHeight(element)

    return { top, bottom, left, right }
}

function result(element, fn) {
    let display, result

    display = getCss(element, 'display')

    if (display === 'none') {
        element.style.display = 'block'
    }

    result = fn()

    if (display === 'none') {
        element.style.display = 'none'
    }

    return result
}

function getDocumentScroll(name) {
    return (document.documentElement && document.documentElement[`scroll${name}`]) || document.body[`scroll${name}`]
}

export default Pin