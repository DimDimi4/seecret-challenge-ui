<template lang="pug">
.sdd(v-click-outside='hideDropdown')
    .sdd__options(@click='focusOnInput')
        .sdd__selected
            .sdd__selected-wrapper(ref='selectedWrapper')
                span(v-for='option in filterSelected', :key='option') {{ option }}
                    i.close(@click='removeOption(option)')
                span.muted(v-if='overflowCount > 0') ({{ overflowCount }} more)
        .sdd__input
            input(
                ref='filterInput',
                type='text',
                :placeholder='placeholder',
                @keydown.arrow-up='activePrevOption',
                @keydown.arrow-down='activeNextOption',
                @keydown.backspace='filterBackspaced',
                @keydown.prevent.enter='filterEntered',
                @focus='showDropdown',
                v-model='filterText'
            )
    .sdd__dropdown(:class='dropdownClass')
        ul(tabindex='-1')
            li.option(
                v-for='option in filteredOptions',
                :key='option',
                :ref='"option" + option',
                :class='{ "option--highlight": option === activeOption }',
                @mouseover='activeOption = option',
                @mouseleave='activeOption = ""',
                @click='selectActive',
                role='option',
                tabIndex='-1'
            ) {{ option }}
            li.option(v-if='showAddNew')
                em Add new
</template>

<script lang="ts">
    export default {
        props: {
            placeholder: {
                type: String,
                default: 'Select an option',
            },
            modelValue: {
                type: Array,
                default: () => [],
            },
            options: {
                type: Array,
                default: () => [],
            },
        },

        data() {
            return {
                overflowLimit: 0,
                showOptions: false,
                selected: [],
                activeOption: '',
                filterText: '',
            };
        },

        computed: {
            filterSelected() {
                return this.overflowLimit > 0
                    ? this.selected.slice(0, this.overflowLimit - 1)
                    : this.selected;
            },
            filteredOptions() {
                return this.options.filter(
                    (option) =>
                        !this.selected.includes(option) &&
                        option
                            .toLowerCase()
                            .includes(this.filterText.toLowerCase()),
                );
            },
            dropdownClass() {
                return {
                    'sdd__dropdown--show':
                        (this.showOptions && this.filteredOptions.length > 0) ||
                        this.showAddNew,
                };
            },
            showAddNew() {
                return (
                    this.filteredOptions.length === 0 && this.filterText.length > 0
                );
            },
            overflowCount() {
                return (
                    this.overflowLimit > 0 &&
                    this.selected.length - this.overflowLimit
                );
            },
        },

        mounted() {
            this.modelValue.forEach((option) => {
                if (this.options.includes(option)) {
                    this.addToSelected(option);
                }
            });
        },

        watch: {
            activeOption() {
                const ref = this.$refs[`option${this.activeOption}`];

                if (ref && ref.length > 0) {
                    ref[0].scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                    });
                }
            },

            selected: {
                handler() {
                    setTimeout(() => {
                        this.checkOverflow();
                    }, 50);
                    this.$emit('input', this.selected);
                },
                deep: true,
            },

            filterText() {
                this.activeOption = '';
            },
        },

        methods: {
            showDropdown() {
                this.showOptions = true;
                this.setFirstActive();
            },
            hideDropdown() {
                this.showOptions = false;
                this.activeOption = '';
                this.filterText = '';
            },
            focusOnInput() {
                this.$refs.filterInput.focus();
            },

            filterBackspaced() {
                if (this.filterText === '' && this.selected.length > 0) {
                    return this.selected.pop();
                }
            },

            filterEntered() {
                if (this.activeOption !== '') {
                    return this.selectActive();
                }

                if (this.showAddNew) {
                    this.addToSelected(this.filterText);
                    this.filterText = '';
                }
            },

            activePrevOption() {
                if (this.filteredOptions.length === 0) {
                    return;
                }

                const index = this.filteredOptions.indexOf(this.activeOption);
                if (index === -1) {
                    this.activeOption =
                        this.filteredOptions[this.filteredOptions.length - 1];
                } else if (index === 0) {
                    this.activeOption =
                        this.filteredOptions[this.filteredOptions.length - 1];
                } else {
                    this.activeOption = this.filteredOptions[index - 1];
                }
            },

            activeNextOption() {
                if (this.filteredOptions.length === 0) {
                    return;
                }

                const index = this.filteredOptions.indexOf(this.activeOption);
                if (index === -1) {
                    this.activeOption = this.filteredOptions[0];
                } else if (index === this.filteredOptions.length - 1) {
                    this.activeOption = this.filteredOptions[0];
                } else {
                    this.activeOption = this.filteredOptions[index + 1];
                }
            },

            setFirstActive() {
                this.activeOption =
                    this.filteredOptions.length > 0 ? this.filteredOptions[0] : '';
            },

            selectActive() {
                if (this.activeOption === '') return;

                this.addToSelected(this.activeOption);
                this.filterText = '';

                this.setFirstActive();
            },

            removeOption(option) {
                const index = this.selected.indexOf(option);
                if (index > -1) {
                    this.selected.splice(index, 1);
                }
            },

            addFromFilterText() {
                this.addToSelected(this.filterText);
                this.filterText = '';
            },

            addToSelected(option) {
                if (this.selected.includes(option)) return;
                this.selected.push(option);
            },

            checkOverflow() {
                if (!this.$refs['selectedWrapper']) {
                    return;
                }

                const el = this.$refs['selectedWrapper'];
                if (el.clientWidth >= el.scrollWidth) {
                    return;
                }

                const spans = el.getElementsByTagName('span');
                let widthLimit = 100;
                let overflowLimit = 0;
                for (const span of spans) {
                    widthLimit += span.clientWidth;
                    if (widthLimit > el.clientWidth) {
                        continue;
                    }

                    overflowLimit++;
                }
                this.overflowLimit = overflowLimit;
            },
        },
    };
</script>

<style lang="sass">
.sdd
    display: block
    position: relative

    &__options
        display: flex
        padding: 5px
        border: 1px solid #ccc
        border-radius: 10px
        flex-wrap: wrap

    &__selected
        max-width: 80%
        overflow: hidden

    &__selected-wrapper
        white-space: nowrap
        display: flex
        height: 40px
        align-items: center

        span
            display: block
            margin-right: 10px
            padding: 5px 25px 5px 10px
            border-radius: 5px
            background: var(--vt-c-text-dark-2)
            white-space: nowrap

    &__input
        flex-grow: 1

        input
            &,
            &:focus
                display: block
                width: 100%
                line-height: 38px
                padding: 0 5px
                margin: 0
                border: 0
                outline: none
                font-size: 1.2em

    &__dropdown
        position: absolute
        left: 0
        top: calc(100% - 6px)
        width: 100%
        border: 1px solid #ccc
        border-top: 0
        background-color: #ffffff
        z-index: 2
        border-radius: 0 0 10px 10px
        overflow-x: hidden
        overflow-y: auto
        max-height: 110px
        box-shadow: 0px 3px 6px 0px var(--vt-c-text-dark-2)
        display: none

        &--show
            display: block

        ul
            list-style: none
            padding: 10px 0 0
            margin: 0

            .option
                padding: 5px 10px
                cursor: pointer

                a
                    display: block
                    color: inherit
                    background: transparent

                &--highlight
                    background-color: var(--vt-c-indigo)
                    color: #fff

    .close
        position: absolute
        right: 5px
        top: 50%
        transform: translateY(-50%)
        width: 16px
        height: 16px
        opacity: 0.3
        cursor: pointer

        &:hover
            opacity: 1

        &:before, &:after
            position: absolute
            left: 7px
            content: ' '
            height: 15px
            width: 2px
            background-color: #333

        &:before
            transform: rotate(45deg)

        &:after
            transform: rotate(-45deg)
</style>
