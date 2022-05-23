<template lang="pug">
button.btn(:type='type', :disabled='disabled || loading')
    span(v-if='loading') Loading...
    span(v-else) {{ label }}
</template>

<script lang="ts">
    export default {
        props: {
            type: {
                type: String,
                default: 'submit',
            },
            label: {
                type: String,
                default: 'Submit',
            },
            loading: {
                type: Boolean,
                default: false,
            },
            disabled: {
                type: Boolean,
                default: false,
            },
        },
    };
</script>

<style lang="sass">
.btn
    border-radius: 0.25rem
    padding: 1em 2em
    border: 0

    &:not(:disabled)
        cursor: pointer

        &:hover,
        &:active,
        &:focus
            background: var(--vt-c-indigo)
            color: #fff
            transition: color 0.25s, background-color 0.25s
</style>
