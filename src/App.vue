<template lang="pug">
main
    form(@submit.prevent='onSubmit')
        .form-control
            dropdown-input(
                placeholder='Select an option',
                :options='options',
                v-model='selected'
            )
        .form-control
            button-input(
                label='Submit',
                :loading='loading',
                :disabled='selected.length === 0'
            )
            small(v-if='fetched') &nbsp; search performed

    pre(v-if='error') {{ error }}

    table(v-if='list.length > 0')
        thead
            tr
                th PATHs
                th
                    em(style='float: right', v-if='downloading') Downloading...
                    a(
                        href='#',
                        style='float: right',
                        @click='download',
                        v-else
                    ) Download
        tbody
            tr(v-for='path in list')
                td(colspan='2')
                    code {{ path }}
</template>

<script lang="ts">
    import DropdownInput from './components/DropdownInput.vue';
    import ButtonInput from './components/ButtonInput.vue';

    export default {
        components: {
            DropdownInput,
            ButtonInput,
        },
        data() {
            return {
                error: null,
                fetched: false,
                loading: false,
                downloading: false,
                options: ['compute', 'identity', 'image', 'volume', 'placement'],
                selected: [],
                list: [],
            };
        },

        mounted() {
            const selectedInCookies = this.$cookies.get('selected', '');
            if (selectedInCookies) {
                selectedInCookies.split(',').forEach((option) => {
                    if (this.options.includes(option)) {
                        this.selected.push(option);
                    }
                });
            }
        },

        methods: {
            onSubmit() {
                this.$cookies.set('selected', this.selected.join(','));

                const params = new URLSearchParams({
                    services: this.selected,
                });

                this.loading = true;
                this.error = null;
                this.list = [];

                this.$http
                    .get('/stats/list', { params })
                    .then((response) => {
                        this.list = response.data.requests;
                        this.fetched = true;
                    })
                    .catch((error) => {
                        this.error = error.message;
                    })
                    .then(() => {
                        this.loading = false;
                    });
            },

            download() {
                const params = new URLSearchParams({
                    services: this.selected,
                    download: 'true',
                });

                this.downloading = true;
                this.$http
                    .get('/stats/list', { params })
                    .then((response) => {
                        const blob = new Blob([response.data], {
                            type: 'text/csv',
                        });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'stats.csv');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    })
                    .catch((error) => {
                        this.error = error.message;
                    })
                    .then(() => {
                        this.downloading = false;
                    });
            },
        },
    };
</script>

<style>
    @import './assets/base.css';

    #app {
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem;

        font-weight: normal;
    }

    @media (min-width: 1024px) {
        #app {
            padding: 2rem;
        }
    }
</style>
