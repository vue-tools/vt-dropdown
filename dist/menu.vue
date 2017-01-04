<style>
    .ui-dropdown__menu {
        margin: 5px 0;
        padding: 6px 0;
        min-width: 100px;
        text-align: center;
        background-color: #fff;
        border: 1px solid #d3dce6;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .12);
    }
    
    .ui-zoomInTop-enter-active,
    .ui-zoomInTop-leave-active {
        opacity: 1;
        transform: scaleY(1);
        transition: transform .3s cubic-bezier(.23, 1, .32, 1) .1s, opacity .3s cubic-bezier(.23, 1, .32, 1) .1s;
        transform-origin: center top;
    }
    
    .ui-zoomInBottom-enter-active,
    .ui-zoomInBottom-leave-active {
        opacity: 1;
        transform: scaleY(1);
        transition: transform .3s cubic-bezier(.23, 1, .32, 1) .1s, opacity .3s cubic-bezier(.23, 1, .32, 1) .1s;
        transform-origin: center bottom;
    }
    
    .ui-zoomInTop-enter,
    .ui-zoomInBottom-enter,
    .ui-zoomInTop-leave-active,
    .ui-zoomInBottom-leave-active {
        opacity: 0;
        transform: scaleY(0)
    }
</style>

<template>
    <transition :name="transitionName">
        <ul class="ui-dropdown__menu" v-show="visible">
            <slot></slot>
        </ul>
    </transition>
</template>

<script>
    import Pin from './pin'

    export default {
        name: 'DropdownMenu',
        data() {
            return {
                pin: null,
                visible: false,
                transitionName: 'ui-zoomInTop'
            }
        },
        methods: {
            bridge(item) {
                this.visible = false
                this.$parent.emit(item)
            },
            checkParent() {
                if(this.$parent.$options.name !== 'Dropdown') {
                    console.error('DropdownMenu component must within the Dropdown component')
                    return false
                }

                if(this.$children.length !== this.$el.children.length) {
                    console.error('DropdownMenu component can contain only DropdownItem component')
                    return false
                }

                if(this.$children.filter((item) => item.$options.name === 'DropdownItem').length !== this.$children.length) {
                    console.error('DropdownMenu component can contain only DropdownItem component')
                    return false
                }

                return true
            }
        },
        mounted() {
            if(this.checkParent()) {
                this.pin = Pin.bottom(this.$el, this.$parent.$el.firstChild, {
                    update: (direction) => {
                        this.transitionName = direction === 'top' ? 'ui-zoomInBottom' : 'ui-zoomInTop'
                    }
                })
            }
        },
        beforeDestroy() {
            this.pin.destroy()
        }
    }
</script>