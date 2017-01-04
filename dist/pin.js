'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Pin = function () {
    function Pin(pinObject, baseObject, opts) {
        (0, _classCallCheck3.default)(this, Pin);

        var defaultOpts = {
            update: noop,
            direction: ''
        };

        pinObject = normalize(pinObject);
        baseObject = normalize(baseObject);

        if (pinObject.element === Pin.VIEWPORT || pinObject.element._id === 'VIEWPORT') {
            return;
        }

        this.pinObject = pinObject;
        this.baseObject = baseObject;
        this.opts = (0, _assign2.default)({}, defaultOpts, opts);

        this.render();
        this.addEvents();
        this.opts.direction && this.update();
    }

    (0, _createClass3.default)(Pin, [{
        key: 'render',
        value: function render() {
            var pinElement = void 0,
                parentOffset = void 0,
                baseOffset = void 0,
                isPinFixed = void 0;

            isPinFixed = true;
            pinElement = this.pinObject.element;

            if (getCss(pinElement, 'position') !== 'fixed') {
                pinElement.style.position = 'absolute';
                isPinFixed = false;
            }

            posConverter(this.pinObject);
            posConverter(this.baseObject);
            parentOffset = getParentOffset(pinElement);
            baseOffset = this.baseObject.offset(isPinFixed);

            pinElement.style.top = baseOffset.top + this.baseObject.y - this.pinObject.y - parentOffset.top + 'px';
            pinElement.style.left = baseOffset.left + this.baseObject.x - this.pinObject.x - parentOffset.left + 'px';
        }
    }, {
        key: 'update',
        value: function update() {
            var direction = void 0,
                pinElement = void 0,
                baseElement = void 0,
                gap = void 0,
                width = void 0,
                height = void 0,
                x = void 0,
                y = void 0,
                margin = void 0;

            direction = this.opts.direction;
            pinElement = this.pinObject.element;
            baseElement = this.baseObject.element;

            if (!direction) {
                this.render();
                return;
            }

            gap = getGap(baseElement);
            width = offsetWidth(pinElement);
            height = offsetHeight(pinElement);

            if (direction === 'top' || direction === 'bottom') {
                x = 0;
                margin = numberize(getCss(pinElement, 'margin-top')) + numberize(getCss(pinElement, 'margin-bottom'));

                if (height <= gap.bottom) {
                    y = '100%';
                    direction = 'bottom';
                } else if (height <= gap.top) {
                    y = '-' + height + '-' + margin;
                    direction = 'top';
                } else if (direction === 'bottom') {
                    y = '100%';
                    direction = 'bottom';
                } else if (direction === 'top') {
                    y = '-' + height + '-' + margin;
                    direction = 'top';
                }
            }

            if (direction === 'left' || direction === 'right') {
                y = 0;

                if (width <= gap.left) {
                    x = '-' + width;
                    direction = 'left';
                } else if (width <= gap.right) {
                    x = '100%';
                    direction = 'right';
                } else if (direction === 'left') {
                    x = '-' + width;
                    direction = 'left';
                } else if (direction === 'right') {
                    x = '100%';
                    direction = 'right';
                }
            }

            this.pinObject = normalize(pinElement);
            this.baseObject = normalize({ element: baseElement, x: x, y: y });

            this.render();
            this.opts.update(direction);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.removeEvents();
        }
    }, {
        key: 'addEvents',
        value: function addEvents() {
            this.updateBound = this.update.bind(this);
            this.target = getScrollParent(this.baseObject.element);

            window.addEventListener('resize', this.updateBound);
            this.target.addEventListener('scroll', this.updateBound);
        }
    }, {
        key: 'removeEvents',
        value: function removeEvents() {
            window.removeEventListener('resize', this.updateBound);
            this.target.removeEventListener('scroll', this.updateBound);
        }
    }], [{
        key: 'top',
        value: function top(pinElement, baseElement, opts) {
            return new Pin(pinElement, { element: baseElement, x: 0, y: '-100%' }, (0, _assign2.default)({ direction: 'top' }, opts));
        }
    }, {
        key: 'bottom',
        value: function bottom(pinElement, baseElement, opts) {
            return new Pin(pinElement, { element: baseElement, x: 0, y: '100%' }, (0, _assign2.default)({ direction: 'bottom' }, opts));
        }
    }, {
        key: 'left',
        value: function left(pinElement, baseElement, opts) {
            return new Pin(pinElement, { element: baseElement, x: '-100%', y: 0 }, (0, _assign2.default)({ direction: 'left' }, opts));
        }
    }, {
        key: 'right',
        value: function right(pinElement, baseElement, opts) {
            return new Pin(pinElement, { element: baseElement, x: '100%', y: 0 }, (0, _assign2.default)({ direction: 'right' }, opts));
        }
    }, {
        key: 'center',
        value: function center(pinElement, baseElement) {
            return new Pin({ element: pinElement, x: '50%', y: '50%' }, { element: baseElement, x: '50%', y: '50%' });
        }
    }]);
    return Pin;
}();

Pin.VIEWPORT = { nodeType: 1, _id: 'VIEWPORT' };

function noop() {}

function normalize() {
    var posObject = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var element = void 0,
        isVIEWPORT = void 0;

    if (posObject.nodeType) {
        posObject = {
            element: posObject
        };
    }

    element = posObject.element || Pin.VIEWPORT;

    if (element.nodeType !== 1) {
        throw new Error('posObject.element is invalid.');
    }

    isVIEWPORT = element === Pin.VIEWPORT || element._id === 'VIEWPORT';

    return {
        element: element,
        x: posObject.x || 0,
        y: posObject.y || 0,
        offset: function offset(isPinFixed) {
            if (isPinFixed) {
                return { top: 0, left: 0 };
            } else if (isVIEWPORT) {
                return { top: getDocumentScroll('Top'), left: getDocumentScroll('Left') };
            } else {
                return getOffset(element);
            }
        },
        size: function size() {
            var el = isVIEWPORT ? window : element;

            return {
                width: el.offsetWidth,
                height: el.offsetHeight
            };
        }
    };
}

function posConverter(pinObject) {
    pinObject.x = xyConverter(pinObject.x, pinObject, 'width');
    pinObject.y = xyConverter(pinObject.y, pinObject, 'height');
}

function xyConverter(x, pinObject, type) {
    x = x + '';
    x = x.replace(/px/gi, '');

    if (/\D/.test(x)) {
        x = x.replace(/(?:top|left)/gi, '0%').replace(/center/gi, '50%').replace(/(?:bottom|right)/gi, '100%');
    }

    if (x.indexOf('%') !== -1) {
        x = x.replace(/(\d+(?:\.\d+)?)%/gi, function (m, d) {
            return pinObject.size()[type] * (d / 100.0);
        });
    }

    if (/[+\-*\/]/.test(x)) {
        try {
            x = new Function('return ' + x)();
        } catch (e) {
            throw new Error('Invalid position value: ' + x);
        }
    }

    return numberize(x);
}

function getOffset(element) {
    var doc = void 0,
        rect = void 0;

    doc = document.documentElement;
    rect = element.getBoundingClientRect();

    return {
        top: rect.top + (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0),
        left: rect.left + (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0)
    };
}

function getCss(el, property) {
    return el.ownerDocument.defaultView.getComputedStyle(el, null)[property];
}

function numberize(s) {
    return parseFloat(s, 10) || 0;
}

function getParentOffset(element) {
    var offset = void 0,
        parent = void 0;

    offset = { top: 0, left: 0 };
    parent = offsetParent(element);

    if (parent === document.documentElement) {
        parent = document.body;
    }

    if (!(parent === document.body && getCss(parent, 'position') === 'static')) {
        offset = getOffset(parent);
    }

    offset.top += numberize(getCss(parent, 'border-top-width'));
    offset.left += numberize(getCss(parent, 'border-left-width'));

    return offset;
}

function offsetParent(element) {
    return result(element, function () {
        return element.offsetParent || element;
    });
}

function offsetWidth(element) {
    return result(element, function () {
        return element.offsetWidth;
    });
}

function offsetHeight(element) {
    return result(element, function () {
        return element.offsetHeight;
    });
}

function getScrollParent(element) {
    var scroll = void 0,
        isOverflow = void 0,
        isOverflowX = void 0,
        isOverflowY = void 0;

    if (element === document) {
        return window;
    }

    scroll = ['scroll', 'auto'];
    isOverflow = scroll.indexOf(getCss(element, 'overflow')) !== -1;
    isOverflowX = scroll.indexOf(getCss(element, 'overflow-x')) !== -1;
    isOverflowY = scroll.indexOf(getCss(element, 'overflow-y')) !== -1;

    if (isOverflow || isOverflowX || isOverflowY) {
        return element === document.body ? getScrollParent(element.parentNode) : element;
    }

    return element.parentNode ? getScrollParent(element.parentNode) : element;
}

function getGap(element) {
    var top = void 0,
        bottom = void 0,
        left = void 0,
        right = void 0,
        elementOffset = void 0,
        scrollElement = void 0,
        scrollOffset = void 0;

    elementOffset = getOffset(element);
    scrollElement = getScrollParent(element);
    scrollOffset = getOffset(scrollElement);

    top = elementOffset.top - scrollOffset.top;
    left = elementOffset.left - scrollOffset.left;
    right = offsetWidth(scrollElement) - left - offsetWidth(element);
    bottom = offsetHeight(scrollElement) - top - offsetHeight(element);

    return { top: top, bottom: bottom, left: left, right: right };
}

function result(element, fn) {
    var display = void 0,
        result = void 0;

    display = getCss(element, 'display');

    if (display === 'none') {
        element.style.display = 'block';
    }

    result = fn();

    if (display === 'none') {
        element.style.display = 'none';
    }

    return result;
}

function getDocumentScroll(name) {
    return document.documentElement && document.documentElement['scroll' + name] || document.body['scroll' + name];
}

exports.default = Pin;