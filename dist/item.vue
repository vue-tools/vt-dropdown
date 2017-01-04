<style>
    .ui-dropdown__item {
        margin: 0;
        padding: 0 10px;
        line-height: 36px;
        font-size: 16px;
        font-family: "Helvetica Neue", Helvetica, "Microsoft YaHei", SimSun, '\5b8b\4f53', sans-serif;
        cursor: pointer;
        list-style: none;
    }
    .ui-dropdown__item:hover {
        color: #475669;
        background-color: #e5e9f2;
    }
    .ui-dropdown__item--disabled {
        color: #c0ccda;
        cursor: default;
        pointer-events: none;
    }
</style>

<template>
    <li class="ui-dropdown__item" :class="{ 'ui-dropdown__item--disabled': disabled }" @click="handler">
        <slot></slot>
    </li>
</template>

<script>
    export default {
        name: 'DropdownItem',
        props: {
            disabled: Boolean
        },
        methods: {
            checkParent() {
                if(this.$parent.$options.name !== 'DropdownMenu') {
                    console.error('DropdownItem component must within the DropdownMenu component')
                    return false
                }

                return true
            },
            handler() {
                if(!this.disabled) {
                    this.$parent.bridge(this)
                }
            }
        },
        mounted() {
            this.checkParent()
        }
    }
</script>