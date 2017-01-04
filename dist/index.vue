<style>
    .ui-dropdown {
        position: relative;
    }
</style>

<template>
    <div class="ui-dropdown">
        <slot></slot>
    </div>
</template>

<script>
    let instances = []

    document.addEventListener('click', () => {
        for(let item of instances) {
            if(item.dropdown.visible) {
                item.$emit('hide')
                item.dropdown.visible = false
            }
        }
    })

    export default {
        name: 'Dropdown',
        props: {
            trigger: {
                type: String,
                default: 'hover'
            }
        },
        data() {
            return {
                timeout: null,
                dropdown: null
            }
        },
        methods: {
            mountedEvents() {
                let element, dropdownElement

                element = this.$slots.default[0].elm
                
                if(this.trigger === 'hover') {
                    element.addEventListener('mouseenter', this.show)
                    element.addEventListener('mouseleave', this.hide)

                    dropdownElement = this.dropdown.$el
                    dropdownElement.addEventListener('mouseenter', this.show)
                    dropdownElement.addEventListener('mouseleave', this.hide)
                }else if(this.trigger === 'click') {
                    element.addEventListener('click', this.click)
                }
            },
            unmountedEvents() {
                let element, dropdownElement

                element = this.$slots.default[0].elm
                
                if(this.trigger === 'hover') {
                    element.removeEventListener('mouseenter', this.show)
                    element.removeEventListener('mouseleave', this.hide)

                    dropdownElement = this.dropdown.$el
                    dropdownElement.removeEventListener('mouseenter', this.show)
                    dropdownElement.removeEventListener('mouseleave', this.hide)
                }else if(this.trigger === 'click') {
                    element.removeEventListener('click', this.click)
                }
            },
            show() {
                clearTimeout(this.timeout)

                this.hides()
                this.timeout = setTimeout(() => {
                    this.$emit('show')
                    this.dropdown.visible = true
                }, 250)
            },
            hide() {
                clearTimeout(this.timeout)
                this.timeout = setTimeout(() => {
                    this.$emit('hide')
                    this.dropdown.visible = false
                }, 150)
            },
            hides() {
                instances.map((item) => {
                    if(item !== this && item.dropdown.visible) {
                        item.dropdown.visible = false
                    }
                })
            },
            emit(item) {
                this.$emit('hide')
                this.$emit('click', item)
            },
            click(e) {
                e.stopPropagation()

                this.hides()
                this.dropdown.visible = !this.dropdown.visible
                this.$emit(this.dropdown.visible ? 'show' : 'hide')
            },
            checkChildren() {
                this.dropdown = this.$children.filter((item) => item.$options.name === 'DropdownMenu')[0]
                
                if(!this.dropdown) {
                    console.error('Dropdown component must be contain DropdownMenu component')
                    return false
                }

                return true
            }
        },
        mounted() {
            if(this.checkChildren()) {
                instances.push(this)
                this.mountedEvents()
            }else {
                this.unmountedEvents = noop
            }
        },
        beforeDestroy() {
            this.unmountedEvents()
            instances.map((item, index) => instances.splice(index, 1))
        }
    }

    function noop() {}
</script>