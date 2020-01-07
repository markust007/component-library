<template>
    <div>
        <v-layout row wrap>
            <v-flex xs12>
                <v-btn depressed outline to="/"><v-icon left small>arrow_back</v-icon>Back</v-btn>
                <h2 class="headline">Unit Features</h2>
            </v-flex>
            <v-flex xs12>
                <unit-features ref="unitFeatures" :resort="true" @save="save"></unit-features>
            </v-flex>
        </v-layout>
    </div>
</template>

<script>
    import UnitFeatures from '@/containers/UnitFeatures/Components/UnitFeatures.vue'

    export default {
        routes: [
            { path: '/unit-features', name: 'unit-features'},
        ],
        components: {'unit-features': UnitFeatures},
        data(){
            return {

            }
        },
        methods: {
            save(payload) {

            }
        }
    }
</script>
